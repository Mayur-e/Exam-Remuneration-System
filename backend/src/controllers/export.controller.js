const ExcelJS = require('exceljs');
const path = require('path');
const db = require('../config/db');

exports.exportBillingSheet = async (req, res) => {
    try {
        const templatePath = path.join(__dirname, '../../../billing_template.xlsx');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(templatePath);

        // --- Sheet 1: Ext-1 (External Examiners) ---
        // Data starts at Row 13
        // Footer (with Totals) starts at Row 24 (or row 13 + initial blank count)
        const sheet1 = workbook.getWorksheet('Ext-1');
        if (sheet1) {
            const externalClaimsQuery = `
                SELECT 
                    e.subject_code, e.subject_name, e.students_count, e.exam_date, e.exam_type, e.program, e.level,
                    ex.full_name, ex.parent_institute, ex.mobile, ex.pan_number, ex.bank_name, ex.branch_name, ex.account_number, ex.ifsc_code,
                    rc.examiner_amount, rc.conveyance_amount,
                    (COALESCE(rc.examiner_amount, 0) + COALESCE(rc.conveyance_amount, 0)) as total_amount
                FROM exams e
                JOIN remuneration_calculations rc ON e.id = rc.exam_id
                LEFT JOIN external_examiners ex ON e.external_examiner_id = ex.id
                WHERE e.claim_form_type = 'TEACHING_EXTERNAL' AND e.status IN ('approved', 'paid')
                ORDER BY e.exam_date
            `;
            const { rows: extClaims } = await db.query(externalClaimsQuery);

            let rowIdx = 13;
            // We need to shift the footer down for every row we add beyond the initial space.
            // Actually, best practice is to insert new rows before the footer.
            // The template has ~11 blank rows (13 to 23). If we have more than 11 claims, we need to insert rows.
            // If we have fewer, we might leave blank rows.
            // "Dynamic" request implies we should just insert rows and push the footer down.

            // To be safe and truly dynamic:
            // 1. Identify the 'footer' row index. Based on dump: Row 24 is "EXTERNAL EXAMINER TOTAL AMOUNT".
            let footerRowIdx = 24;

            // Calculate how many rows to add.
            // If we have N claims, we want to write them starting at 13.
            // We can just insert (N) rows at 13, pushing 13->13+N. 
            // BUT wait, row 13 might already have formatting or be part of the "body".
            // The template has pre-filled empty rows 13-23.
            // We should overwrite 13-23 with data. If N > 11, insert (N-11) rows at 24.

            const existingBodyRows = 11; // 13 to 23 inclusive
            const neededRows = extClaims.length;
            const rowsToAdd = Math.max(0, neededRows - existingBodyRows);

            if (rowsToAdd > 0) {
                sheet1.insertRows(24, new Array(rowsToAdd).fill([])); // Insert at footer start
                footerRowIdx += rowsToAdd; // Footer pushed down
            }

            extClaims.forEach((claim, index) => {
                const currentRow = 13 + index;
                const row = sheet1.getRow(currentRow);
                row.getCell(2).value = index + 1;
                row.getCell(3).value = claim.full_name;
                row.getCell(4).value = "External";
                row.getCell(5).value = claim.parent_institute;
                row.getCell(6).value = claim.mobile;
                row.getCell(7).value = claim.subject_code;
                row.getCell(8).value = claim.subject_name;
                row.getCell(9).value = claim.level;
                row.getCell(10).value = claim.exam_date ? new Date(claim.exam_date).toLocaleDateString() : '';
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

            // Re-calculate Total Formulas in Sheet 'Total' if footer moved
            // Original Ext-1 Footer was at 24. New is at footerRowIdx.
            // Sheet 'Total' references Ext-1!M24 etc.
            // We need to update 'Total' sheet formulas to point to new footerRowIdx.
            const totalSheet = workbook.getWorksheet('Total');
            if (totalSheet && rowsToAdd > 0) {
                // Update Row 2 (External Total) -> Ext-1!M{newRow}
                // Update Row 3 (External LCA) -> Ext-1!N{newRow}

                // Note: The template dump for Total sheet had:
                // Row 2: ... formula: "'Ext-1'!M24"
                // Check if it's strictly row 2/3.

                const extTotalCell = totalSheet.getCell('D2'); // Assuming col D based on dump [null, 1, "Descr", Formula] -> Col 4 is D? No, array is 1-based in exceljs?
                // Dump: [null, 1, "External...", {formula}] -> Index 0 is null, 1 is 'A', 2 is 'B', 3 is 'C'.
                // So formula is in Column D (4).

                // Wait, ExcelJS values array is [empty, col1, col2, ...]
                // So index 3 is Column C.
                // Let's verify dump of Total sheet:
                // Row 2: [null,1,"External Examiner Total Amount:",{"formula":"'Ext-1'!M24"}]
                // col 1 (A) = 1
                // col 2 (B) = "External..."
                // col 3 (C) = formula

                totalSheet.getCell('C2').value = { formula: `'Ext-1'!M${footerRowIdx}` };
                totalSheet.getCell('C3').value = { formula: `'Ext-1'!N${footerRowIdx}` };
            }
        }

        // --- Sheet 2: Int-2 (Internal Examiners & Support Staff) ---
        // Data starts at Row 23
        // Footer starts at Row 97
        const sheet2 = workbook.getWorksheet('Int-2');
        if (sheet2) {
            // 1. Fetch all data first to know count
            const internalClaimsQuery = `
                SELECT 
                    e.subject_code, e.subject_name, e.students_count, e.exam_date, e.exam_type, e.program, e.level,
                    u.name as staff_name, fba.pan_number, fba.bank_name, fba.branch_name, fba.account_number, fba.ifsc_code,
                    rc.examiner_amount
                FROM exams e
                JOIN remuneration_calculations rc ON e.id = rc.exam_id
                JOIN users u ON e.faculty_id = u.id
                LEFT JOIN faculty_bank_accounts fba ON e.faculty_id = fba.faculty_id AND fba.is_active = true
                WHERE e.claim_form_type = 'TEACHING_INTERNAL' AND e.status IN ('approved', 'paid')
                ORDER BY e.exam_date
            `;
            const { rows: intClaims } = await db.query(internalClaimsQuery);

            const staffClaimsQuery = `
                 SELECT 
                    e.subject_code, e.subject_name, e.students_count, e.exam_date, e.exam_type, e.program, e.level,
                    esm.staff_name, esm.staff_role, esm.preparation_days, esm.cleaning_days, esm.batches, esm.examination_days, esm.rate,
                    '' as pan_number, '' as bank_name, '' as branch_name, '' as account_number, '' as ifsc_code
                FROM exams e
                JOIN exam_staff_members esm ON e.id = esm.exam_id
                WHERE e.claim_form_type = 'NON_TEACHING' AND e.status IN ('approved', 'paid')
                ORDER BY e.exam_date
            `;
            const { rows: staffClaims } = await db.query(staffClaimsQuery);

            const allIntRows = [...intClaims, ...staffClaims]; // Combine logic for writing? Or separate?
            // Let's keep separate loops but continuous index.

            const existingIntBodyRows = 74; // 23 to 96 inclusive
            const neededIntRows = intClaims.length + staffClaims.length;
            const intRowsToAdd = Math.max(0, neededIntRows - existingIntBodyRows);

            let intFooterRowIdx = 97;

            if (intRowsToAdd > 0) {
                sheet2.insertRows(97, new Array(intRowsToAdd).fill([]));
                intFooterRowIdx += intRowsToAdd;
            }

            let currentRowIdx = 23;

            // Write Internal Claims
            intClaims.forEach((claim, index) => {
                const row = sheet2.getRow(currentRowIdx);
                row.getCell(1).value = currentRowIdx - 22;
                row.getCell(2).value = claim.staff_name;
                row.getCell(3).value = "Internal Examiner";
                row.getCell(4).value = claim.subject_code;
                row.getCell(5).value = claim.subject_name;
                row.getCell(6).value = claim.level;
                row.getCell(7).value = claim.exam_date ? new Date(claim.exam_date).toLocaleDateString() : '';
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

            // Write Support Claims
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
                row.getCell(7).value = claim.exam_date ? new Date(claim.exam_date).toLocaleDateString() : '';

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

            // Update Total Sheet Formulas for Int-2
            const totalSheet = workbook.getWorksheet('Total');
            if (totalSheet && intRowsToAdd > 0) {
                // Dump for Total sheet:
                // Row 4: "Internal Examiner Total Amount:",{"formula":"'Int-2'!K97"}
                // Row 6: "Prep...": {"formula":"'Int-2'!N97"}
                // Row 7: "Examination...": {"formula":"'Int-2'!Q97"}

                totalSheet.getCell('C4').value = { formula: `'Int-2'!K${intFooterRowIdx}` };
                totalSheet.getCell('C6').value = { formula: `'Int-2'!N${intFooterRowIdx}` };
                totalSheet.getCell('C7').value = { formula: `'Int-2'!Q${intFooterRowIdx}` };
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
