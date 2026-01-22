import { Button } from './button';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmColor = "blue",
    icon = null,
    loading = false
}) {
    if (!isOpen) return null;

    const colorClasses = {
        blue: "bg-blue-600 hover:bg-blue-700",
        green: "bg-green-600 hover:bg-green-700",
        red: "bg-red-600 hover:bg-red-700",
        orange: "bg-orange-600 hover:bg-orange-700"
    };

    const iconBgClasses = {
        blue: "bg-blue-100",
        green: "bg-green-100",
        red: "bg-red-100",
        orange: "bg-orange-100"
    };

    const iconColorClasses = {
        blue: "text-blue-600",
        green: "text-green-600",
        red: "text-red-600",
        orange: "text-orange-600"
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-start gap-4 mb-4">
                        {icon && (
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${iconBgClasses[confirmColor]} flex items-center justify-center`}>
                                <div className={iconColorClasses[confirmColor]}>
                                    {icon}
                                </div>
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end mt-6">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`${colorClasses[confirmColor]} text-white`}
                        >
                            {loading ? "Processing..." : confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
