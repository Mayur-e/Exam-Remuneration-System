const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Auth validation rules
 */
const loginValidation = [
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail()
        .trim(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .trim(),
    validate
];

const registerValidation = [
    body('name')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .trim()
        .escape(),
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail()
        .trim(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .trim(),
    body('department')
        .optional()
        .isLength({ max: 100 }).withMessage('Department name too long')
        .trim()
        .escape(),
    body('phone')
        .optional()
        .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
    validate
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required')
        .trim(),
    body('newPassword')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
        .trim(),
    validate
];

/**
 * Exam/Claim validation rules
 */
const createExamValidation = [
    body('exam_type')
        .notEmpty().withMessage('Exam type is required')
        .isIn(['PR', 'OR', 'TW', 'Project_Seminar_MiniProject', 'BTech_Project_Stage1', 'BTech_Project_Stage2',
            'MTech_MiniProject', 'MTech_Seminar', 'MTech_Project_Stage1', 'MTech_Dissertation',
            'MCA_MiniProject', 'MCA_MajorProject', 'Audit_Course'])
        .withMessage('Invalid exam type'),
    body('program')
        .notEmpty().withMessage('Program is required')
        .isIn(['BTECH', 'MTECH', 'MCA', 'BVOC']).withMessage('Invalid program'),
    body('level')
        .notEmpty().withMessage('Level is required')
        .isIn(['FY', 'SY', 'TY', 'FINAL']).withMessage('Invalid level'),
    body('students_count')
        .isInt({ min: 1, max: 1000 }).withMessage('Students count must be between 1 and 1000'),
    body('subject_name')
        .isLength({ min: 2, max: 200 }).withMessage('Subject name must be between 2 and 200 characters')
        .trim()
        .escape(),
    body('subject_code')
        .optional()
        .isLength({ max: 50 }).withMessage('Subject code too long')
        .trim()
        .escape(),
    body('semester')
        .notEmpty().withMessage('Semester is required')
        .isIn(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']).withMessage('Invalid semester'),
    body('academic_year')
        .matches(/^\d{4}-\d{2}$/).withMessage('Academic year must be in format YYYY-YY'),
    body('exam_date')
        .isISO8601().withMessage('Valid exam date is required'),
    body('is_backlog')
        .optional()
        .isBoolean().withMessage('is_backlog must be boolean'),
    validate
];

const submitClaimValidation = [
    body('chairman_allowance')
        .optional()
        .isFloat({ min: 0, max: 100000 }).withMessage('Chairman allowance must be between 0 and 100000'),
    body('conveyance_amount')
        .optional()
        .isFloat({ min: 0, max: 100000 }).withMessage('Conveyance amount must be between 0 and 100000'),
    validate
];

/**
 * ID parameter validation
 */
const idParamValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid ID parameter'),
    validate
];

/**
 * Admin action validation
 */
const rejectClaimValidation = [
    body('reason')
        .isLength({ min: 5, max: 500 }).withMessage('Rejection reason must be between 5 and 500 characters')
        .trim()
        .escape(),
    body('policy_reference')
        .optional()
        .isLength({ max: 100 }).withMessage('Policy reference too long')
        .trim()
        .escape(),
    validate
];

const sendBackClaimValidation = [
    body('instructions')
        .isLength({ min: 5, max: 500 }).withMessage('Instructions must be between 5 and 500 characters')
        .trim()
        .escape(),
    validate
];

/**
 * Bank account validation
 */
const bankAccountValidation = [
    body('bank_name')
        .isLength({ min: 2, max: 100 }).withMessage('Bank name must be between 2 and 100 characters')
        .trim()
        .escape(),
    body('branch_name')
        .isLength({ min: 2, max: 100 }).withMessage('Branch name must be between 2 and 100 characters')
        .trim()
        .escape(),
    body('account_number')
        .matches(/^[0-9]{9,18}$/).withMessage('Account number must be 9-18 digits'),
    body('ifsc_code')
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC code format'),
    body('pan_number')
        .optional()
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Invalid PAN format'),
    validate
];

module.exports = {
    validate,
    loginValidation,
    registerValidation,
    changePasswordValidation,
    createExamValidation,
    submitClaimValidation,
    idParamValidation,
    rejectClaimValidation,
    sendBackClaimValidation,
    bankAccountValidation
};
