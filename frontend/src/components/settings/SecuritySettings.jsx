import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LockIcon, AlertCircleIcon } from "../icons/logo";
import { validatePassword, validateRequired } from "../../utils/validation";

/**
 * Reusable Security Settings Component (Password Change/Set)
 * 
 * @param {Object} props
 * @param {Function} props.onSave - Callback when password change is submitted
 * @param {Function} props.onSetPassword - Callback when password is set (for Google users)
 * @param {boolean} props.isGoogleUser - Whether the user signed up with Google
 * @param {string} props.primaryColor - Primary color for the icon (default: blue-600)
 */
export default function SecuritySettings({ onSave, onSetPassword, isGoogleUser = false, primaryColor = "blue-600" }) {
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

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

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <LockIcon className={`w-5 h-5 text-${primaryColor}`} />
                Security Settings
            </h2>

            {isGoogleUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Google Account</p>
                            <p className="text-sm text-blue-700 mt-1">
                                You signed up with Google. Set a password below to enable email/password login as an alternative to Google Sign-In.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                {!isGoogleUser && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="password"
                            placeholder="Enter current password"
                            value={passwordData.currentPassword}
                            onChange={(e) => handleChange('currentPassword', e.target.value)}
                            onBlur={() => handleBlur('currentPassword')}
                            className={errors.currentPassword ? "border-red-500" : ""}
                            required
                        />
                        {errors.currentPassword && (
                            <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>
                        )}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isGoogleUser ? "New Password" : "New Password"} <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="password"
                        placeholder="Enter new password (min 6 characters)"
                        value={passwordData.newPassword}
                        onChange={(e) => handleChange('newPassword', e.target.value)}
                        onBlur={() => handleBlur('newPassword')}
                        className={errors.newPassword ? "border-red-500" : ""}
                        required
                        minLength={6}
                    />
                    {errors.newPassword && (
                        <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                        required
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                    )}
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                    {saving ? (isGoogleUser ? "Setting Password..." : "Changing Password...") : (isGoogleUser ? "Set Password" : "Change Password")}
                </Button>
            </form>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                    <AlertCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-yellow-900">Password Security</p>
                        <p className="text-sm text-yellow-700 mt-1">
                            Make sure your password is at least 6 characters long and contains a mix of letters and numbers for better security.
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
