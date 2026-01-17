import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { BanknotesIcon } from "../icons/logo";
import { validateRequired, validateIFSC, validateAccountNumber, validateName } from "../../utils/validation";

/**
 * Reusable Bank Settings Component
 * 
 * @param {Object} props
 * @param {Object} props.initialData - Initial bank details
 * @param {Function} props.onSave - Callback when save is clicked
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

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5 text-green-600" />
                Bank Account Details
            </h2>
            <p className="text-sm text-gray-600 mb-6">
                These details will be used for payment disbursements. Please ensure all information is accurate.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="Full name as per bank account"
                        value={bankDetails.account_holder_name}
                        onChange={(e) => handleChange("account_holder_name", e.target.value)}
                        onBlur={() => handleBlur("account_holder_name")}
                        className={errors.account_holder_name ? "border-red-500" : ""}
                        maxLength={100}
                    />
                    {errors.account_holder_name && (
                        <p className="text-xs text-red-600 mt-1">{errors.account_holder_name}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="e.g., State Bank of India"
                        value={bankDetails.bank_name}
                        onChange={(e) => handleChange("bank_name", e.target.value)}
                        onBlur={() => handleBlur("bank_name")}
                        className={errors.bank_name ? "border-red-500" : ""}
                        maxLength={100}
                    />
                    {errors.bank_name && (
                        <p className="text-xs text-red-600 mt-1">{errors.bank_name}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="e.g., Mumbai Main Branch"
                        value={bankDetails.branch_name}
                        onChange={(e) => handleChange("branch_name", e.target.value)}
                        onBlur={() => handleBlur("branch_name")}
                        className={errors.branch_name ? "border-red-500" : ""}
                        maxLength={100}
                    />
                    {errors.branch_name && (
                        <p className="text-xs text-red-600 mt-1">{errors.branch_name}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="Enter account number"
                        value={bankDetails.account_number}
                        onChange={(e) => handleChange("account_number", e.target.value.replace(/\D/g, ''))}
                        onBlur={() => handleBlur("account_number")}
                        className={errors.account_number ? "border-red-500" : ""}
                        maxLength={18}
                    />
                    {errors.account_number && (
                        <p className="text-xs text-red-600 mt-1">{errors.account_number}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="e.g., SBIN0001234"
                        value={bankDetails.ifsc_code}
                        onChange={(e) => handleChange("ifsc_code", e.target.value.toUpperCase())}
                        onBlur={() => handleBlur("ifsc_code")}
                        className={errors.ifsc_code ? "border-red-500" : ""}
                        maxLength={11}
                    />
                    {errors.ifsc_code && (
                        <p className="text-xs text-red-600 mt-1">{errors.ifsc_code}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={bankDetails.account_type}
                        onChange={(e) => handleChange("account_type", e.target.value)}
                    >
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                    </select>
                </div>
            </div>
            <div className="mt-6">
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? "Saving..." : "Save Bank Details"}
                </Button>
            </div>
        </Card>
    );
}
