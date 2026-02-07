const ExcelJS = require('exceljs');
const path = require('path');
const db = require('../config/db');

exports.exportBillingSheet = async (req, res) => {
    try {
        const templatePath = path.join(__dirname, '../../../billing_template.xlsx');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(templatePath);

        const { department } = req.user;
        const isBillingIncharge = req.user.role === 'BILLING_INCHARGE';

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
                    e.subject_code, e.subject_name, e.students_count, e.exam_date, e.exam_type, e.program, e.level, e.semester, e.academic_year,
                    ex.full_name, ex.parent_institute, ex.mobile, ex.pan_number, ex.bank_name, ex.branch_name, ex.account_number, ex.ifsc_code,
                    rc.examiner_amount, rc.conveyance_amount,
                    (COALESCE(rc.examiner_amount, 0) + COALESCE(rc.conveyance_amount, 0)) as total_amount,
                    u.department as exam_department
                FROM exams e
                JOIN remuneration_calculations rc ON e.id = rc.exam_id
                LEFT JOIN external_examiners ex ON e.external_examiner_id = ex.id
                JOIN users u ON e.faculty_id = u.id
                WHERE e.claim_form_type = 'TEACHING_EXTERNAL' AND e.status IN ('approved', 'paid')
            `;

            const queryParams = [];
            if (isBillingIncharge && department) {
                externalClaimsQuery += ` AND u.department = $1`;
                queryParams.push(department);
            }
            externalClaimsQuery += ` ORDER BY e.exam_date`;

            const { rows: extClaims } = await db.query(externalClaimsQuery, queryParams);

            // Populate Headers (using first row if available)
            if (extClaims.length > 0) {
                const first = extClaims[0];
                const dept = first.exam_department || department || '';
                const prog = first.program || '';
                const acadYear = first.academic_year || '';
                const semester = first.semester || '';
                const classYear = first.level || ''; // FE/SE/TE/BE
                const examMonth = getMonthYear(first.exam_date);

                // A6: Programme
                sheet1.getCell('A6').value = `Programme : ${prog}`;
                // A7: Department
                sheet1.getCell('A7').value = `Department : ${dept}`;
                // K7: Class Year
                sheet1.getCell('K7').value = `Class Year: ${classYear}`;
                // A8: Academic Year
                sheet1.getCell('A8').value = `Academic Year : ${acadYear}`;
                // K8: Semester
                sheet1.getCell('K8').value = `Semester : ${semester}`;
                // K9: Exam Month
                sheet1.getCell('K9').value = `Exam Month : ${examMonth}`;
            }

            // Body Population (Dynamic Row Insertion)
            const rowsToAdd = Math.max(0, extClaims.length - 11);
            let footerRowIdx = 24;

            if (rowsToAdd > 0) {
                sheet1.insertRows(24, new Array(rowsToAdd).fill([]));
                footerRowIdx += rowsToAdd;
            }

            extClaims.forEach((claim, index) => {
                const row = sheet1.getRow(13 + index);
                row.getCell(2).value = index + 1;
                row.getCell(3).value = claim.full_name;
                row.getCell(4).value = "External";
                row.getCell(5).value = claim.parent_institute;
                row.getCell(6).value = claim.mobile;
                row.getCell(7).value = claim.subject_code;
                row.getCell(8).value = claim.subject_name;
                row.getCell(9).value = claim.level;
                row.getCell(10).value = formatDate(claim.exam_date);
                row.getCell(11).value = claim.exam_type;
                row.getCell(12).value = claim.students_count;
                row.getCell(14).value = Number(claim.examiner_amount);
                row.getCell(15).value = Number(claim.conveyance_amount);
                row.getCell(16).value = Number(claim.total_amount);
                row.getCell(17).value = claim.pan_number;
                row.getCell(18).value = claim.bank_name;
                row.getCell(19).value = claim.branch_name;
                row.getCell(20).value = claim.account_number;
                row.getCell(21).value = claim.ifsc_code;
                row.commit();
            });

            // Update Total Sheet Reference
            if (rowsToAdd > 0) {
                const totalSheet = workbook.getWorksheet('Total');
                if (totalSheet) {
                    totalSheet.getCell('C2').value = { formula: `'Ext-1'!M${footerRowIdx}` };
                    totalSheet.getCell('C3').value = { formula: `'Ext-1'!N${footerRowIdx}` };
                }
            }
        }

        // --- Sheet 2: Int-2 (Internal Examiners & Support Staff) ---
        const sheet2 = workbook.getWorksheet('Int-2');
        if (sheet2) {
            let internalClaimsQuery = `
                SELECT 
                    e.subject_code, e.subject_name, e.students_count, e.exam_date, e.exam_type, e.program, e.level, e.semester, e.academic_year,
                    u.name as staff_name, fba.pan_number, fba.bank_name, fba.branch_name, fba.account_number, fba.ifsc_code,
                    rc.examiner_amount,
                    u.department as exam_department
                FROM exams e
                JOIN remuneration_calculations rc ON e.id = rc.exam_id
                JOIN users u ON e.faculty_id = u.id
                LEFT JOIN faculty_bank_accounts fba ON e.faculty_id = fba.faculty_id AND fba.is_active = true
                WHERE e.claim_form_type = 'TEACHING_INTERNAL' AND e.status IN ('approved', 'paid')
            `;

            const intParams = [];
            if (isBillingIncharge && department) {
                internalClaimsQuery += ` AND u.department = $1`;
                intParams.push(department);
            }
            internalClaimsQuery += ` ORDER BY e.exam_date`;

            const { rows: intClaims } = await db.query(internalClaimsQuery, intParams);

            let staffClaimsQuery = `
                 SELECT 
                    e.subject_code, e.subject_name, e.students_count, e.exam_date, e.exam_type, e.program, e.level, e.semester, e.academic_year,
                    esm.staff_name, esm.staff_role, esm.preparation_days, esm.cleaning_days, esm.batches, esm.examination_days, esm.rate,
                    '' as pan_number, '' as bank_name, '' as branch_name, '' as account_number, '' as ifsc_code,
                    u.department as exam_department
                FROM exams e
                JOIN exam_staff_members esm ON e.id = esm.exam_id
                JOIN users u ON e.faculty_id = u.id
                WHERE e.claim_form_type = 'NON_TEACHING' AND e.status IN ('approved', 'paid')
            `;

            const staffParams = [];
            if (isBillingIncharge && department) {
                staffClaimsQuery += ` AND u.department = $1`;
                staffParams.push(department);
            }
            staffClaimsQuery += ` ORDER BY e.exam_date`;

            const { rows: staffClaims } = await db.query(staffClaimsQuery, staffParams);

            // Populate Headers (using first row of internal claims preferably)
            const first = intClaims[0] || staffClaims[0];
            if (first) {
                const dept = first.exam_department || department || '';
                const prog = first.program || '';
                const acadYear = first.academic_year || '';
                const semester = first.semester || '';
                const classYear = first.level || '';
                const examMonth = getMonthYear(first.exam_date);

                // Assuming same header layout as Ext-1 or verify Int-2?
                // Usually they match. Let's assume A6/A7... mapping holds for Int-2 too.
                // User provided ONE template, structure usually consistent.
                sheet2.getCell('A6').value = `Programme : ${prog}`;
                sheet2.getCell('A7').value = `Department : ${dept}`;
                sheet2.getCell('K7').value = `Class Year: ${classYear}`;
                sheet2.getCell('A8').value = `Academic Year : ${acadYear}`;
                sheet2.getCell('K8').value = `Semester : ${semester}`;
                sheet2.getCell('K9').value = `Exam Month : ${examMonth}`;
            }

            const existingIntBodyRows = 74;
            const neededIntRows = intClaims.length + staffClaims.length;
            const intRowsToAdd = Math.max(0, neededIntRows - existingIntBodyRows);
            let intFooterRowIdx = 97;

            if (intRowsToAdd > 0) {
                sheet2.insertRows(97, new Array(intRowsToAdd).fill([]));
                intFooterRowIdx += intRowsToAdd;
            }

            let currentRowIdx = 23;

            intClaims.forEach((claim, index) => {
                const row = sheet2.getRow(currentRowIdx);
                row.getCell(1).value = currentRowIdx - 22;
                row.getCell(2).value = claim.staff_name;
                row.getCell(3).value = "Internal Examiner";
                row.getCell(4).value = claim.subject_code;
                row.getCell(5).value = claim.subject_name;
                row.getCell(6).value = claim.level;
                row.getCell(7).value = formatDate(claim.exam_date);
                row.getCell(8).value = claim.exam_type;
                row.getCell(9).value = claim.students_count;
                row.getCell(11).value = Number(claim.examiner_amount);
                row.getCell(18).value = Number(claim.examiner_amount);

                row.getCell(19).value = claim.pan_number;
                row.getCell(20).value = claim.bank_name;
                row.getCell(21).value = claim.branch_name;
                row.getCell(22).value = claim.account_number;
                row.getCell(23).value = claim.ifsc_code;
                row.commit();
                currentRowIdx++;
            });

            staffClaims.forEach((claim) => {
                const row = sheet2.getRow(currentRowIdx);
                const prepDays = (claim.preparation_days || 0) + (claim.cleaning_days || 0);
                const conductUnits = claim.batches || claim.examination_days || 0;
                const rate = Number(claim.rate) || 0;

                const amountC = prepDays * rate;
                const amountD = conductUnits * rate;
                const total = amountC + amountD;

                row.getCell(1).value = currentRowIdx - 22;
                row.getCell(2).value = claim.staff_name;
                row.getCell(3).value = claim.staff_role;
                row.getCell(4).value = claim.subject_code;
                row.getCell(5).value = claim.subject_name;
                row.getCell(6).value = claim.level;
                row.getCell(7).value = formatDate(claim.exam_date);

                if (prepDays > 0) {
                    row.getCell(12).value = prepDays;
                    row.getCell(13).value = rate;
                    row.getCell(14).value = amountC;
                }

                if (conductUnits > 0) {
                    row.getCell(15).value = conductUnits;
                    row.getCell(16).value = rate;
                    row.getCell(17).value = amountD;
                }

                row.getCell(18).value = total;
                row.getCell(19).value = claim.pan_number;

                row.commit();
                currentRowIdx++;
            });

            if (intRowsToAdd > 0) {
                const totalSheet = workbook.getWorksheet('Total');
                if (totalSheet) {
                    totalSheet.getCell('C4').value = { formula: `'Int-2'!K${intFooterRowIdx}` };
                    totalSheet.getCell('C6').value = { formula: `'Int-2'!N${intFooterRowIdx}` };
                    totalSheet.getCell('C7').value = { formula: `'Int-2'!Q${intFooterRowIdx}` };
                }
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
