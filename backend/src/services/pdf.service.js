const puppeteer = require('puppeteer');
const pool = require('../config/db');
const { getClaimFormHTML } = require('../templates/claim-form.html');
const { logoBase64 } = require('../utils/logo');

class PDFService {
    async fetchClaimData(examId) {
        try {
            // Get exam details with rates
            const examResult = await pool.query(
                `SELECT 
          e.*,
          u.name as faculty_name,
          u.email as faculty_email,
          u.department,
          u.prn,
          u.mobile,
          u.pan_card,
          fb.account_holder_name,
          fb.bank_name,
          fb.branch_name,
          fb.account_number,
          fb.ifsc_code,
          fb.account_type,
          rr.fy_sy_rate,
          rr.ty_final_rate,
          rr.mtech_mca_rate
        FROM exams e
        JOIN users u ON e.faculty_id = u.id
        LEFT JOIN faculty_bank_accounts fb ON fb.faculty_id = u.id
        LEFT JOIN remuneration_rates rr ON rr.exam_type = e.exam_type
        WHERE e.id = $1`,
                [examId]
            );

            if (examResult.rows.length === 0) {
                throw new Error('Exam not found');
            }

            const exam = examResult.rows[0];

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

                // Basic details
                year: exam.level || '',
                program: exam.program || '',
                examinerName: exam.faculty_name || exam.account_holder_name || '',
                collegeName: 'Pimpri Chinchwad College of Engineering',
                mobile: exam.mobile || exam.prn || '', // Fallback to PRN if mobile not available
                pan: exam.pan_card || exam.prn || '', // Fallback to PRN if PAN not available
                email: exam.faculty_email || '',

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
}

module.exports = new PDFService();
