import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { UserIcon, MailIcon } from "../icons/logo";
import { validateName, validateEmail, validateRequired } from "../../utils/validation";

/**
 * Reusable Profile Settings Component
 * 
 * @param {Object} props
 * @param {Object} props.initialData - Initial profile data { name, email, department, etc. }
 * @param {Function} props.onSave - Callback when save is clicked
 * @param {Array} props.readOnlyFields - Array of field names that should be read-only
 * @param {Array} props.fields - Array of field configurations
 */
export default function ProfileSettings({ initialData, onSave, readOnlyFields = ['email'], fields }) {
    const [profileData, setProfileData] = useState(initialData || {});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

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

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                Profile Information
            </h2>
            <div className="space-y-4 max-w-md">
                {fields.map((field) => (
                    <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                            {field.required && !readOnlyFields.includes(field.name) && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </label>
                        {readOnlyFields.includes(field.name) ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                                {field.icon && <field.icon className="w-4 h-4 text-gray-400" />}
                                <span className="text-gray-600">{profileData[field.name] || 'N/A'}</span>
                            </div>
                        ) : field.type === 'select' ? (
                            <>
                                <select
                                    value={profileData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    onBlur={() => handleBlur(field.name)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field.name] ? "border-red-500" : "border-gray-300"}`}
                                >
                                    <option value="">Select {field.label}</option>
                                    {field.options && field.options.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                {errors[field.name] && (
                                    <p className="text-xs text-red-600 mt-1">{errors[field.name]}</p>
                                )}
                            </>
                        ) : (
                            <>
                                <Input
                                    type={field.type || "text"}
                                    placeholder={field.placeholder}
                                    value={profileData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    onBlur={() => handleBlur(field.name)}
                                    className={errors[field.name] ? "border-red-500" : ""}
                                    maxLength={field.maxLength || 100}
                                />
                                {errors[field.name] && (
                                    <p className="text-xs text-red-600 mt-1">{errors[field.name]}</p>
                                )}
                            </>
                        )}
                        {field.hint && !errors[field.name] && (
                            <p className="text-xs text-gray-500 mt-1">{field.hint}</p>
                        )}
                    </div>
                ))}
                <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save Profile"}
                </Button>
            </div>
        </Card>
    );
}
