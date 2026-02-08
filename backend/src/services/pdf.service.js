const puppeteer = require('puppeteer');
const pool = require('../config/db');
const { getClaimFormHTML } = require('../templates/claim-form.html');
const { logoBase64 } = require('../utils/logo');

class PDFService {
    async fetchClaimData(examId) {
        try {
            // Get exam details with rates and external examiner if applicable
            const examResult = await pool.query(
                `SELECT 
          e.*,
          u.name as faculty_name,
          u.email as faculty_email,
          u.department,
          u.prn,
          u.mobile as faculty_mobile,
          u.pan_card as faculty_pan,
          fb.account_holder_name,
          fb.bank_name,
          fb.branch_name,
          fb.account_number,
          fb.ifsc_code,
          fb.account_type,
          rr.fy_sy_rate,
          rr.ty_final_rate,
          rr.mtech_mca_rate,
          ee.full_name as external_name,
          ee.email as external_email,
          ee.mobile as external_mobile,
          ee.parent_institute as external_institute,
          ee.pan_number as external_pan
        FROM exams e
        JOIN users u ON e.faculty_id = u.id
        LEFT JOIN faculty_bank_accounts fb ON fb.faculty_id = u.id
        LEFT JOIN remuneration_rates rr ON rr.exam_type = e.exam_type
        LEFT JOIN external_examiners ee ON ee.id = e.external_examiner_id
        WHERE e.id = $1`,
                [examId]
            );

            if (examResult.rows.length === 0) {
                throw new Error('Exam not found');
            }

            const exam = examResult.rows[0];

            // Determine if this is an external claim
            const isExternal = exam.claim_form_type === 'TEACHING_EXTERNAL';

            // Get remuneration calculations
            const calcResult = await pool.query(
                `SELECT * FROM remuneration_calculations WHERE exam_id = $1`,
                [examId]
            );

            const calculation = calcResult.rows[0] || {};

            // Determine the rate based on program and level
            let ratePerStudent = 0;
            if (exam.program === 'BTECH' || exam.program === 'BVOC') {
                if (exam.level === 'FY' || exam.level === 'SY') {
                    ratePerStudent = parseFloat(exam.fy_sy_rate) || 0;
                } else {
                    ratePerStudent = parseFloat(exam.ty_final_rate) || 0;
                }
            } else {
                ratePerStudent = parseFloat(exam.mtech_mca_rate) || 0;
            }

            // Calculate amounts based on exam type
            const studentsCount = parseInt(exam.students_count) || 0;
            let practicalStudents = '', practicalRate = '', practicalAmount = '';
            let oralStudents = '', oralRate = '', oralAmount = '';
            let termWorkStudents = '', termWorkRate = '', termWorkAmount = '';
            let projectStudents = '', projectRate = '', projectAmount = '';

            if (exam.exam_type === 'PR') {
                practicalStudents = studentsCount;
                practicalRate = ratePerStudent.toFixed(2);
                practicalAmount = (studentsCount * ratePerStudent).toFixed(2);
            } else if (exam.exam_type === 'OR') {
                oralStudents = studentsCount;
                oralRate = ratePerStudent.toFixed(2);
                oralAmount = (studentsCount * ratePerStudent).toFixed(2);
            } else if (exam.exam_type === 'TW') {
                termWorkStudents = studentsCount;
                termWorkRate = ratePerStudent.toFixed(2);
                termWorkAmount = (studentsCount * ratePerStudent).toFixed(2);
            } else if (exam.exam_type === 'PROJECT' || exam.exam_type === 'SEMINAR') {
                projectStudents = studentsCount;
                projectRate = ratePerStudent.toFixed(2);
                projectAmount = (studentsCount * ratePerStudent).toFixed(2);
            }

            // Format data for new template
            return {
                // Header fields
                logo: logoBase64, // PCCOE logo as base64

                // Basic details - use external examiner details if external claim
                year: exam.level || '',
                program: exam.program || '',
                examinerName: isExternal ? (exam.external_name || '') : (exam.faculty_name || exam.account_holder_name || ''),
                collegeName: isExternal ? (exam.external_institute || 'External Institute') : 'Pimpri Chinchwad College of Engineering',
                mobile: isExternal ? (exam.external_mobile || '') : (exam.faculty_mobile || exam.prn || ''),
                pan: isExternal ? (exam.external_pan || '') : (exam.faculty_pan || exam.prn || ''),
                email: isExternal ? (exam.external_email || '') : (exam.faculty_email || ''),

                // Exam details
                examName: exam.exam_type || '',
                department: exam.department || '',
                secondExaminer: exam.second_examiner || '', // Will be empty if column doesn't exist yet
                subject: exam.subject_name || '',
                subjectCode: exam.subject_code || '',
                examDate: exam.exam_date ? new Date(exam.exam_date).toLocaleDateString('en-IN') : '',
                academicYear: exam.academic_year || '',
                semester: exam.semester || '',

                // Table data - Examination types
                practicalStudents,
                practicalRate,
                practicalAmount,

                oralStudents,
                oralRate,
                oralAmount,

                termWorkStudents,
                termWorkRate,
                termWorkAmount,

                projectStudents,
                projectRate,
                projectAmount,

                // Chairman allowance
                chairmanStudents: '',
                chairmanRate: '',
                chairmanAmount: calculation.chairman_allowance ? parseFloat(calculation.chairman_allowance).toFixed(2) : '',

                // Conveyance
                conveyanceDays: '', // Add this field if needed
                conveyanceDates: '', // Add this field if needed
                conveyanceStudents: '',
                conveyanceRate: '',
                conveyanceAmount: calculation.conveyance_amount ? parseFloat(calculation.conveyance_amount).toFixed(2) : '',

                // Total
                totalAmount: calculation.total_amount ? parseFloat(calculation.total_amount).toFixed(2) : '0.00',

                // Office section (bottom)
                remToExamLine1: '',
                remToExamLine2: '',
                passedAmount: calculation.net_amount ? parseFloat(calculation.net_amount).toFixed(2) : '',
                passedAmountInWords: this.convertToWords(calculation.net_amount || 0),
                passedAmountRemark: '',
                passedDate: ''
            };
        } catch (error) {
            console.error('Error fetching claim data:', error);
            throw error;
        }
    }

    /**
     * Generate PDF from HTML
     */
    async generateClaimForm(claimData) {
        let browser;
        try {
            // Launch headless browser
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();

            // Get HTML content
            const htmlContent = getClaimFormHTML(claimData);

            // Set content
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0'
            });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm'
                }
            });

            await browser.close();
            return pdfBuffer;
        } catch (error) {
            if (browser) {
                await browser.close();
            }
            console.error('Error generating PDF:', error);
            throw error;
        }
    }

    /**
     * Simple number to words converter (Indian numbering system)
     */
    convertToWords(amount) {
        if (!amount || amount === 0) return 'Zero Rupees Only';

        const num = Math.floor(amount);
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        const convertTwoDigit = (n) => {
            if (n < 10) return ones[n];
            if (n >= 10 && n < 20) return teens[n - 10];
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        };

        const convertThreeDigit = (n) => {
            if (n === 0) return '';
            if (n < 100) return convertTwoDigit(n);
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertTwoDigit(n % 100) : '');
        };

        if (num < 1000) {
            return convertThreeDigit(num) + ' Rupees Only';
        }

        const crore = Math.floor(num / 10000000);
        const lakh = Math.floor((num % 10000000) / 100000);
        const thousand = Math.floor((num % 100000) / 1000);
        const remainder = num % 1000;

        let result = '';
        if (crore > 0) result += convertTwoDigit(crore) + ' Crore ';
        if (lakh > 0) result += convertTwoDigit(lakh) + ' Lakh ';
        if (thousand > 0) result += convertTwoDigit(thousand) + ' Thousand ';
        if (remainder > 0) result += convertThreeDigit(remainder);

        return result.trim() + ' Rupees Only';
    }

    /**
     * Fetch non-teaching claim data
     */
    async fetchNonTeachingData(examId) {
        try {
            // Get exam details
            const examResult = await pool.query(
                `SELECT 
          e.*,
          u.name as faculty_name,
          u.email as faculty_email,
          u.department,
          u.prn,
          u.mobile,
          u.pan_card
        FROM exams e
        JOIN users u ON e.faculty_id = u.id
        WHERE e.id = $1`,
                [examId]
            );

            if (examResult.rows.length === 0) {
                throw new Error('Exam not found');
            }

            const exam = examResult.rows[0];

            // Get batch size
            const batchSizeResult = await pool.query(
                `SELECT 
                    CASE 
                        WHEN $1 = 'PR' THEN practical_size
                        WHEN $1 = 'OR' THEN oral_size
                        WHEN $1 = 'TW' THEN termwork_size
                        ELSE project_oral_size
                    END as batch_size
                 FROM batch_sizes 
                 WHERE program = $2`,
                [exam.exam_type, exam.program]
            );
            const batchSize = batchSizeResult.rows[0]?.batch_size || 1;
            const totalBatches = Math.ceil((exam.students_count || 0) / batchSize);

            // Get staff members
            const staffResult = await pool.query(
                `SELECT * FROM exam_staff_members WHERE exam_id = $1 ORDER BY id`,
                [examId]
            );



            // Get staff rates
            const ratesResult = await pool.query(
                `SELECT * FROM staff_role_rates`
            );
            const ratesMap = {};
            ratesResult.rows.forEach(rate => {
                ratesMap[rate.staff_role] = {
                    preparation_rate: parseFloat(rate.preparation_rate) || 0,
                    per_batch_rate: parseFloat(rate.per_batch_rate) || 0,
                    cleaning_rate: parseFloat(rate.cleaning_rate) || 0
                };
            });

            // Count dates
            const countDates = (dateStr) => {
                if (!dateStr) return 0;
                return dateStr.split(',').map(d => d.trim()).filter(Boolean).length;
            };

            const prepDays = countDates(exam.prep_dates);
            const examDays = countDates(exam.exam_dates);
            const cleanDays = countDates(exam.cleaning_dates);

            // Calculate staff amounts and organize by role
            let grandTotal = 0;
            const expertStaff = [];
            const labStaff = [];
            const peonStaff = [];

            staffResult.rows.forEach(staff => {
                const rates = ratesMap[staff.staff_role] || { preparation_rate: 0, per_batch_rate: 0, cleaning_rate: 0 };
                const isExpertAssistant = staff.staff_role === "Expert Assistant";

                // Prep & Clean Amount
                const prepCleanAmount = isExpertAssistant ? 0 : (
                    (rates.preparation_rate * prepDays) + (rates.cleaning_rate * cleanDays)
                );

                // Batch Amount
                let batchAmount = 0;
                if (isExpertAssistant) {
                    batchAmount = rates.per_batch_rate * totalBatches;
                } else {
                    batchAmount = rates.per_batch_rate * totalBatches * examDays;
                }

                const totalAmount = prepCleanAmount + batchAmount;
                grandTotal += totalAmount;


                const staffData = {
                    name: staff.staff_name,
                    prep: prepCleanAmount > 0 ? prepCleanAmount.toFixed(2) : 'NA',
                    batch: batchAmount.toFixed(2),
                    total: totalAmount.toFixed(2)
                };

                // Categorize by role (flexible matching)
                const roleLower = staff.staff_role.toLowerCase();
                if (roleLower.includes('expert')) {
                    expertStaff.push(staffData);
                } else if (roleLower.includes('lab') || roleLower.includes('technical')) {
                    labStaff.push(staffData);
                } else if (roleLower.includes('peon')) {
                    peonStaff.push(staffData);
                }
            });

            // Prepare data object for template
            const templateData = {
                logo: logoBase64,
                year: exam.level || '',
                program: exam.program || '',
                examName: exam.exam_type || '',
                subject: exam.subject_name || '',
                subjectCode: exam.subject_code || '',
                department: exam.department || '',
                academicYear: exam.academic_year || '',
                semester: exam.semester || '',
                prepDates: exam.prep_dates || '',
                examDates: exam.exam_dates || '',
                cleaningDates: exam.cleaning_dates || '',
                totalStudents: exam.students_count || 0,
                studentsPerBatch: batchSize,
                totalBatches: totalBatches,
                totalDays: prepDays + cleanDays,
                grandTotal: grandTotal.toFixed(2),
                passedAmount: grandTotal.toFixed(2),
                passedAmountInWords: this.convertToWords(grandTotal),
                passedDate: ''
            };

            // Map Expert Assistants (up to 4)
            for (let i = 0; i < 4; i++) {
                if (expertStaff[i]) {
                    templateData[`expertStaff${i + 1}Name`] = expertStaff[i].name;
                    templateData[`expertStaff${i + 1}Prep`] = expertStaff[i].prep;
                    templateData[`expertStaff${i + 1}Batch`] = expertStaff[i].batch;
                    templateData[`expertStaff${i + 1}Total`] = expertStaff[i].total;
                }
            }

            // Map Lab Assistants (up to 2)
            for (let i = 0; i < 2; i++) {
                if (labStaff[i]) {
                    templateData[`labStaff${i + 1}Name`] = labStaff[i].name;
                    templateData[`labStaff${i + 1}Prep`] = labStaff[i].prep;
                    templateData[`labStaff${i + 1}Batch`] = labStaff[i].batch;
                    templateData[`labStaff${i + 1}Total`] = labStaff[i].total;
                }
            }

            // Map Peons (up to 2)
            for (let i = 0; i < 2; i++) {
                if (peonStaff[i]) {
                    templateData[`peonStaff${i + 1}Name`] = peonStaff[i].name;
                    templateData[`peonStaff${i + 1}Prep`] = peonStaff[i].prep;
                    templateData[`peonStaff${i + 1}Batch`] = peonStaff[i].batch;
                    templateData[`peonStaff${i + 1}Total`] = peonStaff[i].total;
                }
            }

            return templateData;
        } catch (error) {
            console.error('Error fetching non-teaching data:', error);
            throw error;
        }
    }

    /**
     * Generate non-teaching PDF
     */
    async generateNonTeachingForm(claimData) {
        let browser;
        try {
            const { getNonTeachingFormHTML } = require('../templates/non-teaching-form.html');

            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            const htmlContent = getNonTeachingFormHTML(claimData);

            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0'
            });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm'
                }
            });

            await browser.close();
            return pdfBuffer;
        } catch (error) {
            if (browser) {
                await browser.close();
            }
            console.error('Error generating non-teaching PDF:', error);
            throw error;
        }
    }
}

module.exports = new PDFService();
