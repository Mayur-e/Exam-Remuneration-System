import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LockIcon, AlertCircleIcon } from "../icons/logo";
import { motion, AnimatePresence } from "framer-motion";
import { validatePassword, validateRequired } from "../../utils/validation";

/**
 * Reusable Security Settings Component (Password Change/Set)
 */
export default function SecuritySettings({ onSave, onSetPassword, isGoogleUser = false, primaryColor = "blue-600" }) {
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const validateField = (fieldName, value) => {
        switch (fieldName) {
            case 'currentPassword':
                // Skip validation for Google users (they don't have a current password)
                if (isGoogleUser) return null;
                return validateRequired(value, "Current password");
            case 'newPassword':
                return validatePassword(value, 6);
            case 'confirmPassword':
                if (!value) return "Please confirm your password";
                if (value !== passwordData.newPassword) return "Passwords do not match";
                return null;
            default:
                return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const newErrors = {};
        let hasErrors = false;

        Object.keys(passwordData).forEach(field => {
            // Skip currentPassword validation for Google users
            if (isGoogleUser && field === 'currentPassword') return;

            const error = validateField(field, passwordData[field]);
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
            if (isGoogleUser) {
                // For Google users, call setPassword
                await onSetPassword({
                    newPassword: passwordData.newPassword,
                    confirmPassword: passwordData.confirmPassword
                });
            } else {
                // For regular users, call changePassword
                await onSave(passwordData);
            }

            // Reset form on success
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
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
        setPasswordData({ ...passwordData, [field]: value });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }

        // Also clear confirm password error if new password changes
        if (field === 'newPassword' && errors.confirmPassword) {
            setErrors({ ...errors, confirmPassword: null });
        }
    };

    const handleBlur = (field) => {
        const error = validateField(field, passwordData[field]);
        if (error) {
            setErrors({ ...errors, [field]: error });
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
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

    const alertVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
        >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
                    >
                        <LockIcon className={`w-5 h-5 text-blue-600 dark:text-blue-400`} />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>
                </div>

                {isGoogleUser && (
                    <motion.div
                        variants={alertVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
                    >
                        <div className="flex items-start gap-3">
                            <motion.div
                                animate={{ rotate: [0, 10, 0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <AlertCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Google Account</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                    You signed up with Google. Set a password below to enable email/password login as an alternative to Google Sign-In.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.form 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    onSubmit={handleSubmit} 
                    className="space-y-4 max-w-md"
                >
                    {!isGoogleUser && (
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Current Password <span className="text-red-500">*</span>
                            </label>
                            <motion.div whileHover={{ scale: 1.01 }}>
                                <Input
                                    type="password"
                                    placeholder="Enter current password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                                    onBlur={() => handleBlur('currentPassword')}
                                    className={`transition-all duration-200 ${errors.currentPassword ? "border-red-500" : ""}`}
                                    required
                                />
                            </motion.div>
                            <AnimatePresence>
                                {errors.currentPassword && (
                                    <motion.p
                                        variants={errorVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="text-xs text-red-600 mt-1"
                                    >
                                        {errors.currentPassword}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                    
                    <motion.div variants={itemVariants} transition={{ delay: 0.05 }}>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {isGoogleUser ? "New Password" : "New Password"} <span className="text-red-500">*</span>
                        </label>
                        <motion.div whileHover={{ scale: 1.01 }}>
                            <Input
                                type="password"
                                placeholder="Enter new password (min 6 characters)"
                                value={passwordData.newPassword}
                                onChange={(e) => handleChange('newPassword', e.target.value)}
                                onBlur={() => handleBlur('newPassword')}
                                className={`transition-all duration-200 ${errors.newPassword ? "border-red-500" : ""}`}
                                required
                                minLength={6}
                            />
                        </motion.div>
                        <AnimatePresence>
                            {errors.newPassword && (
                                <motion.p
                                    variants={errorVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="text-xs text-red-600 mt-1"
                                >
                                    {errors.newPassword}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} transition={{ delay: 0.1 }}>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <motion.div whileHover={{ scale: 1.01 }}>
                            <Input
                                type="password"
                                placeholder="Confirm new password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                onBlur={() => handleBlur('confirmPassword')}
                                className={`transition-all duration-200 ${errors.confirmPassword ? "border-red-500" : ""}`}
                                required
                            />
                        </motion.div>
                        <AnimatePresence>
                            {errors.confirmPassword && (
                                <motion.p
                                    variants={errorVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="text-xs text-red-600 mt-1"
                                >
                                    {errors.confirmPassword}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Success Message */}
                    <AnimatePresence>
                        {saveSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800"
                            >
                                ✓ Password {isGoogleUser ? "set" : "changed"} successfully!
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        variants={itemVariants}
                        transition={{ delay: 0.15 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="pt-2"
                    >
                        <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                    ></motion.span>
                                    {isGoogleUser ? "Setting Password..." : "Changing Password..."}
                                </span>
                            ) : (
                                isGoogleUser ? "Set Password" : "Change Password"
                            )}
                        </Button>
                    </motion.div>
                </motion.form>

                <motion.div
                    variants={alertVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6"
                >
                    <div className="flex items-start gap-3">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <AlertCircleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        </motion.div>
                        <div>
                            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">Password Security</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                Make sure your password is at least 6 characters long and contains a mix of letters and numbers for better security.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </Card>
        </motion.div>
    );
}