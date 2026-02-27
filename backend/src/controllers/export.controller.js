const ExcelJS = require('exceljs');
const path = require('path');
const db = require('../config/db');

exports.exportBillingSheet = async (req, res) => {
    try {
        const templatePath = path.join(__dirname, '../../../billing_template.xlsx');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(templatePath);

        const { department: userDept, role } = req.user;
        const isBillingIncharge = role === 'BILLING_INCHARGE';

        // Extract filters from query
        const {
            academic_year: queryAcademicYear,
            department: queryDepartment,
            program: queryProgram,
            level: queryLevel,
            exam_type: queryExamType
        } = req.query;

        // Determine effective department filter
        // Admins can filter by queryDepartment; Accountants are locked to userDept
        const targetDepartment = isBillingIncharge ? userDept : (queryDepartment || null);

        // Helper to formatting dates
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
        };

        const getMonthYear = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleString('default', { month: 'long', year: 'numeric' });
        };

        // --- Sheet 1: Ext-1 (External Examiners) ---
        const sheet1 = workbook.getWorksheet('Ext-1');
        if (sheet1) {
            let externalClaimsQuery = `
                SELECT 
                    e.id, e.subject_code, e.subject_name, e.students_count, e.exam_date, e.exam_type, e.program, e.level, e.semester, e.academic_year,
                    ex.full_name, ex.parent_institute, ex.mobile, ex.pan_number, ex.bank_name, ex.branch_name, ex.account_number, ex.ifsc_code,
                    rc.examiner_amount, rc.conveyance_amount, rc.total_amount, rc.net_amount,
                    u.department as exam_department
                FROM exams e
                JOIN remuneration_calculations rc ON e.id = rc.exam_id
                LEFT JOIN external_examiners ex ON e.external_examiner_id = ex.id
                JOIN users u ON e.faculty_id = u.id
                WHERE e.claim_form_type = 'TEACHING_EXTERNAL' AND e.status IN ('approved', 'paid', 'submitted')
            `;

            const queryParams = [];
            let paramIdx = 1;

            if (targetDepartment) {
                externalClaimsQuery += ` AND u.department = $${paramIdx++}`;
                queryParams.push(targetDepartment);
            }
            if (queryAcademicYear) {
                externalClaimsQuery += ` AND e.academic_year = $${paramIdx++}`;
                queryParams.push(queryAcademicYear);
            }
            if (queryProgram) {
                externalClaimsQuery += ` AND e.program = $${paramIdx++}`;
                queryParams.push(queryProgram);
            }
            if (queryLevel) {
                externalClaimsQuery += ` AND e.level = $${paramIdx++}`;
                queryParams.push(queryLevel);
            }
            if (queryExamType) {
                externalClaimsQuery += ` AND e.exam_type = $${paramIdx++}`;
                queryParams.push(queryExamType);
            }

            const { rows: extClaims } = await db.query(externalClaimsQuery, queryParams);

            // Populate Headers (using first row if available)
            if (extClaims.length > 0) {
                // Extract unique values from all records for headers
                const uniqueExamTypes = [...new Set(extClaims.map(c => c.exam_type).filter(Boolean))].join('/');
                const uniqueClassYears = [...new Set(extClaims.map(c => c.level).filter(Boolean))].join(', ');

                const first = extClaims[0];
                const dept = first.exam_department || targetDepartment || '';
                const prog = first.program || '';
                const acadYear = first.academic_year || queryAcademicYear || '';
                const semester = first.semester || '';
                const classYear = uniqueClassYears || first.level || '';
                const examMonth = getMonthYear(first.exam_date);
                const currentDate = formatDate(new Date());

                // Update header cells based on template structure (rows 6-9)
                sheet1.getCell('A6').value = `Programme: ${prog}`;
                sheet1.getCell('K6').value = `Date: ${currentDate}`;
                sheet1.getCell('A7').value = `Department: ${dept}`;
                sheet1.getCell('K7').value = `Class Year: ${classYear}`;
                sheet1.getCell('A8').value = `Academic Year: ${acadYear}`;
                sheet1.getCell('K8').value = `Semester: ${semester}`;
                sheet1.getCell('A9').value = `Examination: ${uniqueExamTypes || first.exam_type}`;
                sheet1.getCell('K9').value = `Exam Month: ${examMonth}`;
            }

            // Calculate rows needed - data starts at row 13 (after headers at row 11-12)
            const startRow = 13;
            const templateRows = 11; // Template has 11 empty data rows
            const rowsToAdd = Math.max(0, extClaims.length - templateRows);
            let footerRowIdx = 24; // Adjusted footer row

            // Insert additional rows if needed
            if (rowsToAdd > 0) {
                sheet1.insertRows(footerRowIdx, new Array(rowsToAdd).fill([]), 'i+');
                footerRowIdx += rowsToAdd;
            }

            // Populate data rows
            extClaims.forEach((claim, index) => {
                const row = sheet1.getRow(startRow + index);

                row.getCell(1).value = index + 1; // Sr. No
                row.getCell(2).value = claim.full_name || ''; // Name
                row.getCell(3).value = 'External'; // Internal/External
                row.getCell(4).value = claim.parent_institute || ''; // College/Organization
                row.getCell(5).value = claim.mobile || ''; // Mobile No.
                row.getCell(6).value = claim.subject_code || ''; // Subject Code
                row.getCell(7).value = claim.subject_name || ''; // Subject Name
                row.getCell(8).value = claim.level || ''; // Class
                row.getCell(9).value = formatDate(claim.exam_date); // Date
                row.getCell(10).value = claim.exam_type || ''; // PR/OR/TW
                row.getCell(11).value = Number(claim.students_count) || 0; // No. of Students
                const derivedRate = (Number(claim.students_count) > 0 && Number(claim.examiner_amount) > 0) ? (Number(claim.examiner_amount) / Number(claim.students_count)).toFixed(2) : '';
                row.getCell(12).value = derivedRate ? Number(derivedRate) : ''; // Rate
                row.getCell(13).value = Number(claim.examiner_amount) || 0; // Amount (A)
                row.getCell(14).value = Number(claim.conveyance_amount) || 0; // LCA/TA (B)
                row.getCell(15).value = Number(claim.total_amount) || 0; // Total Amount (A+B+C+D)
                row.getCell(16).value = claim.pan_number || ''; // PAN
                row.getCell(17).value = claim.bank_name || ''; // Bank Name
                row.getCell(18).value = claim.branch_name || ''; // Bank Branch
                row.getCell(19).value = claim.account_number || ''; // Bank Account No.
                row.getCell(20).value = claim.ifsc_code || ''; // IFSC Code

                row.commit();
            });

            // Update footer row formulas
            const footerRow = sheet1.getRow(footerRowIdx);
            footerRow.getCell(1).value = 'EXTERNAL EXAMINER TOTAL AMOUNT :';
            footerRow.getCell(13).value = { formula: `SUM(M${startRow}:M${startRow + extClaims.length - 1})` };
            footerRow.getCell(14).value = { formula: `SUM(N${startRow}:N${startRow + extClaims.length - 1})` };
            footerRow.getCell(15).value = { formula: `SUM(O${startRow}:O${startRow + extClaims.length - 1})` };
            footerRow.commit();

            // Update Total Sheet Reference
            const totalSheet = workbook.getWorksheet('Total');
            if (totalSheet) {
                totalSheet.getCell('C2').value = { formula: `'Ext-1'!M${footerRowIdx}` };
                totalSheet.getCell('C3').value = { formula: `'Ext-1'!N${footerRowIdx}` };
            }
        }

        // --- Sheet 2: Int-2 (Internal Examiners & Support Staff) ---
        const sheet2 = workbook.getWorksheet('Int-2');
        if (sheet2) {
            let internalClaimsQuery = `
                SELECT 
                    e.id, e.subject_code, e.subject_name, e.students_count, e.exam_date, e.exam_type, e.program, e.level, e.semester, e.academic_year,
                    u.name as staff_name, u.prn, fba.pan_number, fba.bank_name, fba.branch_name, fba.account_number, fba.ifsc_code,
                    rc.examiner_amount, rc.total_amount,
                    u.department as exam_department
                FROM exams e
                JOIN remuneration_calculations rc ON e.id = rc.exam_id
                JOIN users u ON e.faculty_id = u.id
                LEFT JOIN faculty_bank_accounts fba ON e.faculty_id = fba.faculty_id AND fba.is_active = true
                WHERE e.claim_form_type = 'TEACHING_INTERNAL' AND e.status IN ('approved', 'paid')
            `;

            const intParams = [];
            let intParamIdx = 1;

            if (targetDepartment) {
                internalClaimsQuery += ` AND u.department = $${intParamIdx++}`;
                intParams.push(targetDepartment);
            }
            if (queryAcademicYear) {
                internalClaimsQuery += ` AND e.academic_year = $${intParamIdx++}`;
                intParams.push(queryAcademicYear);
            }
            if (queryProgram) {
                internalClaimsQuery += ` AND e.program = $${intParamIdx++}`;
                intParams.push(queryProgram);
            }
            if (queryLevel) {
                internalClaimsQuery += ` AND e.level = $${intParamIdx++}`;
                intParams.push(queryLevel);
            }
            if (queryExamType) {
                internalClaimsQuery += ` AND e.exam_type = $${intParamIdx++}`;
                intParams.push(queryExamType);
            }
            internalClaimsQuery += ` ORDER BY e.exam_date, e.subject_code`;

            const { rows: intClaims } = await db.query(internalClaimsQuery, intParams);

            let staffClaimsQuery = `
                 SELECT 
                    e.id, e.subject_code, e.subject_name, e.students_count, e.exam_date, e.exam_type, e.program, e.level, e.semester, e.academic_year,
                    esm.staff_name, esm.staff_role, esm.preparation_days, esm.cleaning_days, esm.examination_days, esm.rate,
                    '' as pan_number, '' as bank_name, '' as branch_name, '' as account_number, '' as ifsc_code,
                    u.department as exam_department, u.prn
                FROM exams e
                JOIN exam_staff_members esm ON e.id = esm.exam_id
                JOIN users u ON e.faculty_id = u.id
                WHERE e.claim_form_type = 'NON_TEACHING' AND e.status IN ('approved', 'paid')
            `;

            const staffParams = [];
            let staffParamIdx = 1;

            if (targetDepartment) {
                staffClaimsQuery += ` AND u.department = $${staffParamIdx++}`;
                staffParams.push(targetDepartment);
            }
            if (queryAcademicYear) {
                staffClaimsQuery += ` AND e.academic_year = $${staffParamIdx++}`;
                staffParams.push(queryAcademicYear);
            }
            if (queryProgram) {
                staffClaimsQuery += ` AND e.program = $${staffParamIdx++}`;
                staffParams.push(queryProgram);
            }
            if (queryLevel) {
                staffClaimsQuery += ` AND e.level = $${staffParamIdx++}`;
                staffParams.push(queryLevel);
            }
            if (queryExamType) {
                staffClaimsQuery += ` AND e.exam_type = $${staffParamIdx++}`;
                staffParams.push(queryExamType);
            }
            staffClaimsQuery += ` ORDER BY e.exam_date, e.subject_code`;

            const { rows: staffClaims } = await db.query(staffClaimsQuery, staffParams);

            // Populate Headers
            const first = intClaims[0] || staffClaims[0];
            if (first) {
                // Extract unique values from all records for headers
                const allClaims = [...intClaims, ...staffClaims];
                const uniqueExamTypes = [...new Set(allClaims.map(c => c.exam_type).filter(Boolean))].join('/');
                const uniqueClassYears = [...new Set(allClaims.map(c => c.level).filter(Boolean))].join(', ');

                const dept = first.exam_department || targetDepartment || '';
                const prog = first.program || '';
                const acadYear = first.academic_year || queryAcademicYear || '';
                const semester = first.semester || '';
                const classYear = uniqueClassYears || first.level || '';
                const examMonth = getMonthYear(first.exam_date);
                const currentDate = formatDate(new Date());

                const PROGRAM_MAPPING = {
                    "BTECH": "B.Tech.",
                    "MTECH": "M.Tech.",
                    "MCA": "MCA",
                    "PHD": "Ph.D"
                };

                sheet2.getCell('A17').value = `Programme: ${PROGRAM_MAPPING[prog] || prog}`;
                sheet2.getCell('L17').value = `Date: ${currentDate}`;
                sheet2.getCell('A18').value = `Department: ${dept}`;
                sheet2.getCell('L18').value = `Class Year: ${classYear}`;
                sheet2.getCell('A19').value = `Academic Year: ${acadYear}`;
                sheet2.getCell('L19').value = `Semester: ${semester}`;
                sheet2.getCell('A20').value = `Examination: ${uniqueExamTypes || first.exam_type}`;
                sheet2.getCell('L20').value = `Exam Month: ${examMonth}`;
            }

            // Calculate rows needed
            const startRow = 23;
            const totalRecords = intClaims.length + staffClaims.length;
            const templateRows = 74; // Template has 74 empty rows (23 to 96)
            const rowsToAdd = Math.max(0, totalRecords - templateRows);
            let footerRowIdx = 97; // Adjusted footer row

            // Insert additional rows if needed
            if (rowsToAdd > 0) {
                sheet2.insertRows(footerRowIdx, new Array(rowsToAdd).fill([]), 'i+');
                footerRowIdx += rowsToAdd;
            }

            let currentRowIdx = startRow;

            // Populate Internal Teaching Claims
            intClaims.forEach((claim) => {
                const row = sheet2.getRow(currentRowIdx);

                row.getCell(1).value = currentRowIdx - startRow + 1; // Sr. No
                row.getCell(2).value = claim.staff_name || ''; // Name
                row.getCell(3).value = 'Internal Examiner'; // Expert/Lab Asst/Course
                row.getCell(4).value = claim.subject_code || ''; // Course Code
                row.getCell(5).value = claim.subject_name || ''; // Course Name
                row.getCell(6).value = claim.level || ''; // Class
                row.getCell(7).value = formatDate(claim.exam_date); // Date
                row.getCell(8).value = claim.exam_type || ''; // PR/OR/TW
                row.getCell(9).value = Number(claim.students_count) || 0; // No of Students
                const intDerivedRate = (Number(claim.students_count) > 0 && Number(claim.examiner_amount) > 0) ? (Number(claim.examiner_amount) / Number(claim.students_count)).toFixed(2) : '';
                row.getCell(10).value = intDerivedRate ? Number(intDerivedRate) : ''; // Rate Rs.
                row.getCell(11).value = Number(claim.examiner_amount) || 0; // Amount (A)
                row.getCell(12).value = ''; // Prep & Cleaning - No of Days
                row.getCell(13).value = ''; // Prep & Cleaning - Rate
                row.getCell(14).value = ''; // Prep & Cleaning - Total (C)
                row.getCell(15).value = ''; // Examination - No of Batch
                row.getCell(16).value = ''; // Examination - Rate per Batch
                row.getCell(17).value = ''; // Examination - Total (D)
                row.getCell(18).value = Number(claim.total_amount) || 0; // Total Amount (A+B+C+D)
                row.getCell(19).value = claim.pan_number || ''; // PAN (Removed PRN fallback)
                row.getCell(20).value = claim.bank_name || ''; // Bank Name
                row.getCell(21).value = claim.branch_name || ''; // Bank Branch
                row.getCell(22).value = claim.account_number || ''; // Bank Account No.
                row.getCell(23).value = claim.ifsc_code || ''; // IFSC Code

                row.commit();
                currentRowIdx++;
            });

            // Populate Non-Teaching Staff Claims
            staffClaims.forEach((claim) => {
                const row = sheet2.getRow(currentRowIdx);
                const prepDays = (Number(claim.preparation_days) || 0) + (Number(claim.cleaning_days) || 0);
                const examDays = Number(claim.examination_days) || 0;
                const rate = Number(claim.rate) || 0;

                const amountC = prepDays * rate;
                const amountD = examDays * rate;
                const total = amountC + amountD;

                row.getCell(1).value = currentRowIdx - startRow + 1; // Sr. No
                row.getCell(2).value = claim.staff_name || ''; // Name
                row.getCell(3).value = claim.staff_role || ''; // Expert/Lab Asst/Course
                row.getCell(4).value = claim.subject_code || ''; // Course Code
                row.getCell(5).value = claim.subject_name || ''; // Course Name
                row.getCell(6).value = claim.level || ''; // Class
                row.getCell(7).value = formatDate(claim.exam_date); // Date
                row.getCell(8).value = claim.exam_type || ''; // PR/OR/TW
                row.getCell(9).value = Number(claim.students_count) || 0; // No of Students

                // Int Examiner fields remain blank for non-teaching staff
                row.getCell(10).value = ''; // Rate Rs.
                row.getCell(11).value = ''; // Amount (A)

                // Prep & Cleaning
                row.getCell(12).value = prepDays > 0 ? prepDays : ''; // No of Days
                row.getCell(13).value = prepDays > 0 ? rate : ''; // Rate
                row.getCell(14).value = prepDays > 0 ? amountC : ''; // Total (C)

                // Examination Batch
                row.getCell(15).value = examDays > 0 ? examDays : ''; // No of Batch
                row.getCell(16).value = examDays > 0 ? rate : ''; // Rate per Batch
                row.getCell(17).value = examDays > 0 ? amountD : ''; // Total (D)

                row.getCell(18).value = total; // Total Amount
                row.getCell(19).value = claim.pan_number || ''; // PAN (Removed PRN fallback)
                row.getCell(20).value = claim.bank_name || ''; // Bank Name
                row.getCell(21).value = claim.branch_name || ''; // Bank Branch
                row.getCell(22).value = claim.account_number || ''; // Bank Account No.
                row.getCell(23).value = claim.ifsc_code || ''; // IFSC Code

                row.commit();
                currentRowIdx++;
            });

            // Update footer row formulas
            const footerRow = sheet2.getRow(footerRowIdx);
            footerRow.getCell(1).value = 'INTERNAL EXAMINER & STAFF TOTAL AMOUNT :';
            footerRow.getCell(11).value = { formula: `SUM(K${startRow}:K${currentRowIdx - 1})` };
            footerRow.getCell(14).value = { formula: `SUM(N${startRow}:N${currentRowIdx - 1})` };
            footerRow.getCell(17).value = { formula: `SUM(Q${startRow}:Q${currentRowIdx - 1})` };
            footerRow.getCell(18).value = { formula: `SUM(R${startRow}:R${currentRowIdx - 1})` };
            footerRow.commit();

            // Update Total Sheet Reference
            const totalSheet = workbook.getWorksheet('Total');
            if (totalSheet) {
                totalSheet.getCell('C4').value = { formula: `'Int-2'!K${footerRowIdx}` };
                totalSheet.getCell('C6').value = { formula: `'Int-2'!N${footerRowIdx}` };
                totalSheet.getCell('C7').value = { formula: `'Int-2'!Q${footerRowIdx}` };
            }
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Billing_Sheet_Export.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ message: 'Failed to export billing sheet', error: error.message });
    }
};
