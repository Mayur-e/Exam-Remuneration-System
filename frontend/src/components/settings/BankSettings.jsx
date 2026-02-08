import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { BanknotesIcon } from "../icons/logo";
import { motion, AnimatePresence } from "framer-motion";
import { validateRequired, validateIFSC, validateAccountNumber, validateName } from "../../utils/validation";

/**
 * Reusable Bank Settings Component
 */
export default function BankSettings({ initialData, onSave }) {
    const [bankDetails, setBankDetails] = useState(initialData || {
        account_holder_name: "",
        bank_name: "",
        branch_name: "",
        account_number: "",
        ifsc_code: "",
        account_type: "Savings"
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const validateField = (fieldName, value) => {
        switch (fieldName) {
            case 'account_holder_name':
                return validateName(value, "Account holder name");
            case 'bank_name':
                return validateRequired(value, "Bank name");
            case 'branch_name':
                return validateRequired(value, "Branch name");
            case 'account_number':
                return validateAccountNumber(value);
            case 'ifsc_code':
                return validateIFSC(value);
            default:
                return null;
        }
    };

    const handleSave = async () => {
        // Validate all fields
        const newErrors = {};
        let hasErrors = false;

        const fieldsToValidate = ['account_holder_name', 'bank_name', 'branch_name', 'account_number', 'ifsc_code'];

        fieldsToValidate.forEach(field => {
            const error = validateField(field, bankDetails[field]);
            if (error) {
                newErrors[field] = error;
                hasErrors = true;
            }
        });

        setErrors(newErrors);

        if (hasErrors) {
            return;
        }

        setSaving(true);
        try {
            await onSave(bankDetails);
            setErrors({});
            // Show success animation
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            // Error handling is done by parent
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setBankDetails({ ...bankDetails, [field]: value });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const handleBlur = (field) => {
        const error = validateField(field, bankDetails[field]);
        if (error) {
            setErrors({ ...errors, [field]: error });
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    const errorVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: {
            opacity: 1,
            height: "auto",
            transition: {
                duration: 0.3
            }
        },
        exit: {
            opacity: 0,
            height: 0,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                    >
                        <BanknotesIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-foreground">Bank Account Details</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                    These details will be used for payment disbursements. Please ensure all information is accurate.
                </p>
                
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {[
                        { field: "account_holder_name", label: "Account Holder Name", placeholder: "Full name as per bank account", maxLength: 100 },
                        { field: "bank_name", label: "Bank Name", placeholder: "e.g., State Bank of India", maxLength: 100 },
                        { field: "branch_name", label: "Branch Name", placeholder: "e.g., Mumbai Main Branch", maxLength: 100 },
                        { field: "account_number", label: "Account Number", placeholder: "Enter account number", maxLength: 18 },
                        { field: "ifsc_code", label: "IFSC Code", placeholder: "e.g., SBIN0001234", maxLength: 11 }
                    ].map((item, index) => (
                        <motion.div 
                            key={item.field}
                            variants={itemVariants}
                            transition={{ delay: index * 0.05 }}
                        >
                            <label className="block text-sm font-medium text-foreground mb-2">
                                {item.label} <span className="text-red-500">*</span>
                            </label>
                            <motion.div whileHover={{ scale: 1.01 }}>
                                <Input
                                    placeholder={item.placeholder}
                                    value={bankDetails[item.field]}
                                    onChange={(e) => {
                                        if (item.field === "account_number") {
                                            handleChange(item.field, e.target.value.replace(/\D/g, ''));
                                        } else if (item.field === "ifsc_code") {
                                            handleChange(item.field, e.target.value.toUpperCase());
                                        } else {
                                            handleChange(item.field, e.target.value);
                                        }
                                    }}
                                    onBlur={() => handleBlur(item.field)}
                                    className={`transition-all duration-200 ${errors[item.field] ? "border-red-500" : ""}`}
                                    maxLength={item.maxLength}
                                />
                            </motion.div>
                            <AnimatePresence>
                                {errors[item.field] && (
                                    <motion.p
                                        variants={errorVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="text-xs text-red-600 mt-1"
                                    >
                                        {errors[item.field]}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                    
                    {/* Account Type Field */}
                    <motion.div variants={itemVariants} transition={{ delay: 0.25 }}>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Account Type <span className="text-red-500">*</span>
                        </label>
                        <motion.div whileHover={{ scale: 1.01 }}>
                            <select
                                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
                                value={bankDetails.account_type}
                                onChange={(e) => handleChange("account_type", e.target.value)}
                            >
                                <option value="Savings">Savings</option>
                                <option value="Current">Current</option>
                            </select>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Success Message */}
                <AnimatePresence>
                    {saveSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800"
                        >
                            ✓ Bank details updated successfully!
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-6">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button 
                            onClick={handleSave} 
                            disabled={saving} 
                            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                        >
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                    ></motion.span>
                                    Saving...
                                </span>
                            ) : (
                                "Save Bank Details"
                            )}
                        </Button>
                    </motion.div>
                </div>
            </Card>
        </motion.div>
    );
}