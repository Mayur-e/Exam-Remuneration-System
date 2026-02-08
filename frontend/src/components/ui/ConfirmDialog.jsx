import { motion, AnimatePresence } from 'framer-motion';
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
    const colorClasses = {
        blue: "bg-blue-600 hover:bg-blue-700",
        green: "bg-green-600 hover:bg-green-700",
        red: "bg-red-600 hover:bg-red-700",
        orange: "bg-orange-600 hover:bg-orange-700"
    };

    const iconBgClasses = {
        blue: "bg-blue-100 dark:bg-blue-900/30",
        green: "bg-green-100 dark:bg-green-900/30",
        red: "bg-red-100 dark:bg-red-900/30",
        orange: "bg-orange-100 dark:bg-orange-900/30"
    };

    const iconColorClasses = {
        blue: "text-blue-600 dark:text-blue-400",
        green: "text-green-600 dark:text-green-400",
        red: "text-red-600 dark:text-red-400",
        orange: "text-orange-600 dark:text-orange-400"
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        className="bg-card text-card-foreground rounded-lg shadow-2xl max-w-md w-full mx-4 border border-border relative z-10"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                        }}
                    >
                        <div className="p-6">
                            {/* Icon and Title */}
                            <div className="flex items-start gap-4 mb-4">
                                {icon && (
                                    <motion.div
                                        className={`flex-shrink-0 w-12 h-12 rounded-full ${iconBgClasses[confirmColor]} flex items-center justify-center`}
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 15,
                                            delay: 0.1
                                        }}
                                    >
                                        <div className={iconColorClasses[confirmColor]}>
                                            {icon}
                                        </div>
                                    </motion.div>
                                )}
                                <motion.div
                                    className="flex-1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {message}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Actions */}
                            <motion.div
                                className="flex gap-3 justify-end mt-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        {cancelText}
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={onConfirm}
                                        disabled={loading}
                                        loading={loading}
                                        className={`${colorClasses[confirmColor]} text-white`}
                                    >
                                        {confirmText}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
