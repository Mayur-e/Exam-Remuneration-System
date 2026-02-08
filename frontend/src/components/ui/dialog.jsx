import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { XIcon } from "../icons/logo";

export function Dialog({ open, onOpenChange, children }) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onOpenChange(false)}
                    />
                    {/* Content Container */}
                    <div className="relative z-50">
                        {children}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function DialogContent({ className, children }) {
    return (
        <motion.div
            className={cn(
                "bg-card text-card-foreground rounded-lg shadow-lg w-full max-w-lg mx-4 p-6 border border-border",
                className
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 25
            }}
        >
            {children}
        </motion.div>
    );
}

export function DialogHeader({ className, children }) {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>
            {children}
        </div>
    );
}

export function DialogTitle({ className, children }) {
    return (
        <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
            {children}
        </h3>
    );
}

export function DialogFooter({ className, children }) {
    return (
        <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)}>
            {children}
        </div>
    );
}
