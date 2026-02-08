import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { UserIcon, MailIcon } from "../icons/logo";
import { motion, AnimatePresence } from "framer-motion";
import { validateName, validateEmail, validateRequired } from "../../utils/validation";

/**
 * Reusable Profile Settings Component
 */
export default function ProfileSettings({ initialData, onSave, readOnlyFields = ['email'], fields }) {
    const [profileData, setProfileData] = useState(initialData || {});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const validateField = (fieldName, value) => {
        const field = fields.find(f => f.name === fieldName);
        if (!field) return null;

        // Skip validation for read-only fields
        if (readOnlyFields.includes(fieldName)) return null;

        // Apply field-specific validation
        if (field.name === 'name') {
            return validateName(value, field.label);
        } else if (field.name === 'email') {
            return validateEmail(value);
        } else if (field.required) {
            return validateRequired(value, field.label);
        }

        return null;
    };

    const handleSave = async () => {
        // Validate all fields
        const newErrors = {};
        let hasErrors = false;

        fields.forEach(field => {
            if (!readOnlyFields.includes(field.name)) {
                const error = validateField(field.name, profileData[field.name]);
                if (error) {
                    newErrors[field.name] = error;
                    hasErrors = true;
                }
            }
        });

        setErrors(newErrors);

        if (hasErrors) {
            return;
        }

        setSaving(true);
        try {
            await onSave(profileData);
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

    const handleChange = (fieldName, value) => {
        setProfileData({ ...profileData, [fieldName]: value });

        // Clear error when user starts typing
        if (errors[fieldName]) {
            setErrors({ ...errors, [fieldName]: null });
        }
    };

    const handleBlur = (fieldName) => {
        const error = validateField(fieldName, profileData[fieldName]);
        if (error) {
            setErrors({ ...errors, [fieldName]: error });
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
                staggerChildren: 0.05
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
        >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
                    >
                        <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
                </div>
                
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4 max-w-md"
                >
                    {fields.map((field, index) => (
                        <motion.div 
                            key={field.name}
                            variants={itemVariants}
                            transition={{ delay: index * 0.05 }}
                        >
                            <label className="block text-sm font-medium text-foreground mb-2">
                                {field.label}
                                {field.required && !readOnlyFields.includes(field.name) && (
                                    <span className="text-red-500 ml-1">*</span>
                                )}
                            </label>
                            {readOnlyFields.includes(field.name) ? (
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-md"
                                >
                                    {field.icon && <field.icon className="w-4 h-4 text-muted-foreground" />}
                                    <span className="text-foreground">{profileData[field.name] || 'N/A'}</span>
                                </motion.div>
                            ) : field.type === 'select' ? (
                                <>
                                    <motion.div whileHover={{ scale: 1.01 }}>
                                        <select
                                            value={profileData[field.name] || ""}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            onBlur={() => handleBlur(field.name)}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${errors[field.name] ? "border-red-500" : "border-border"}`}
                                        >
                                            <option value="">Select {field.label}</option>
                                            {field.options && field.options.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </motion.div>
                                    <AnimatePresence>
                                        {errors[field.name] && (
                                            <motion.p
                                                variants={errorVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="text-xs text-red-600 mt-1"
                                            >
                                                {errors[field.name]}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                <>
                                    <motion.div whileHover={{ scale: 1.01 }}>
                                        <Input
                                            type={field.type || "text"}
                                            placeholder={field.placeholder}
                                            value={profileData[field.name] || ""}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            onBlur={() => handleBlur(field.name)}
                                            className={`transition-all duration-200 ${errors[field.name] ? "border-red-500" : ""}`}
                                            maxLength={field.maxLength || 100}
                                        />
                                    </motion.div>
                                    <AnimatePresence>
                                        {errors[field.name] && (
                                            <motion.p
                                                variants={errorVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="text-xs text-red-600 mt-1"
                                            >
                                                {errors[field.name]}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                            {field.hint && !errors[field.name] && (
                                <p className="text-xs text-muted-foreground mt-1">{field.hint}</p>
                            )}
                        </motion.div>
                    ))}
                    
                    {/* Success Message */}
                    <AnimatePresence>
                        {saveSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800"
                            >
                                ✓ Profile updated successfully!
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="pt-2"
                    >
                        <Button 
                            onClick={handleSave} 
                            disabled={saving} 
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
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
                                "Save Profile"
                            )}
                        </Button>
                    </motion.div>
                </motion.div>
            </Card>
        </motion.div>
    );
}