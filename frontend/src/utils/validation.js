/**
 * Frontend Input Validation Utilities
 * Provides validation functions for all form inputs
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return null;
};

/**
 * Validate password
 */
export const validatePassword = (password, minLength = 6) => {
    if (!password) return "Password is required";
    if (password.length < minLength) return `Password must be at least ${minLength} characters`;
    return null;
};

/**
 * Validate name
 */
export const validateName = (name, fieldName = "Name") => {
    if (!name || name.trim() === "") return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    if (name.trim().length > 100) return `${fieldName} must not exceed 100 characters`;
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) return `${fieldName} contains invalid characters`;
    return null;
};

/**
 * Validate phone number (10 digits)
 */
export const validatePhone = (phone) => {
    if (!phone) return null; // Optional field
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) return "Phone must be 10 digits";
    return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = "This field") => {
    if (!value || (typeof value === 'string' && value.trim() === "")) {
        return `${fieldName} is required`;
    }
    return null;
};

/**
 * Validate number range
 */
export const validateNumberRange = (value, min, max, fieldName = "Value") => {
    const num = parseFloat(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
    if (max !== undefined && num > max) return `${fieldName} must not exceed ${max}`;
    return null;
};

/**
 * Validate integer
 */
export const validateInteger = (value, fieldName = "Value") => {
    const num = parseInt(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (!Number.isInteger(num)) return `${fieldName} must be a whole number`;
    return null;
};

/**
 * Validate date
 */
export const validateDate = (date, fieldName = "Date") => {
    if (!date) return `${fieldName} is required`;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return `${fieldName} is invalid`;
    return null;
};

/**
 * Validate academic year format (YYYY-YY)
 */
export const validateAcademicYear = (year) => {
    if (!year) return "Academic year is required";
    const yearRegex = /^\d{4}-\d{2}$/;
    if (!yearRegex.test(year)) return "Academic year must be in format YYYY-YY (e.g., 2023-24)";
    return null;
};

/**
 * Validate IFSC code
 */
export const validateIFSC = (ifsc) => {
    if (!ifsc) return "IFSC code is required";
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc)) return "Invalid IFSC code format";
    return null;
};

/**
 * Validate account number
 */
export const validateAccountNumber = (accountNumber) => {
    if (!accountNumber) return "Account number is required";
    const accountRegex = /^[0-9]{9,18}$/;
    if (!accountRegex.test(accountNumber)) return "Account number must be 9-18 digits";
    return null;
};

/**
 * Validate PAN number
 */
export const validatePAN = (pan) => {
    if (!pan) return null; // Optional
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) return "Invalid PAN format (e.g., ABCDE1234F)";
    return null;
};

/**
 * Validate subject code
 */
export const validateSubjectCode = (code) => {
    if (!code) return null; // Optional
    if (code.length > 50) return "Subject code too long";
    if (!/^[A-Z0-9\s-]+$/i.test(code)) return "Subject code contains invalid characters";
    return null;
};

/**
 * Validate text length
 */
export const validateTextLength = (text, min, max, fieldName = "Text") => {
    if (!text) return `${fieldName} is required`;
    if (text.length < min) return `${fieldName} must be at least ${min} characters`;
    if (text.length > max) return `${fieldName} must not exceed ${max} characters`;
    return null;
};

/**
 * Sanitize input (prevent XSS)
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validate form with multiple fields
 */
export const validateForm = (fields) => {
    const errors = {};
    let isValid = true;

    Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        if (field.validator) {
            const error = field.validator(field.value);
            if (error) {
                errors[fieldName] = error;
                isValid = false;
            }
        }
    });

    return { isValid, errors };
};

/**
 * Create a debounced validator
 */
export const createDebouncedValidator = (validator, delay = 300) => {
    let timeout;
    return (value, callback) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const error = validator(value);
            callback(error);
        }, delay);
    };
};
