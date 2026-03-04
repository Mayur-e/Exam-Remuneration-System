import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Toast({ message, type = 'info', duration = 3000, onClose, isStacked = true }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const colors = {
        success: 'bg-emerald-50/90 border-emerald-200 text-emerald-800',
        error: 'bg-red-50/90 border-red-200 text-red-800',
        warning: 'bg-amber-50/90 border-amber-200 text-amber-800',
        info: 'bg-blue-50/90 border-blue-200 text-blue-800'
    }[type] || 'bg-slate-50/90 border-slate-200 text-slate-800';

    const iconColors = {
        success: 'text-emerald-500 bg-emerald-100 shadow-emerald-200',
        error: 'text-red-500 bg-red-100 shadow-red-200',
        warning: 'text-amber-500 bg-amber-100 shadow-amber-200',
        info: 'text-blue-500 bg-blue-100 shadow-blue-200'
    }[type] || 'text-slate-500 bg-slate-100 shadow-slate-200';

    const progressColors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500'
    }[type] || 'bg-slate-500';

    const iconNames = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    }[type] || 'info';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`relative flex items-center gap-4 w-96 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border backdrop-blur-xl overflow-hidden ${colors} cursor-default`}
        >
            {/* Icon Container */}
            <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-inner ${iconColors}`}>
                <span className="material-symbols-outlined text-[22px]">{iconNames}</span>
            </div>

            {/* Content */}
            <div className="flex-1 pr-4">
                <p className="text-[13px] font-bold tracking-tight leading-relaxed">
                    {message}
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Close"
            >
                <span className="material-symbols-outlined text-[16px] opacity-50 hover:opacity-100 transition-opacity">close</span>
            </button>

            {/* Progress Bar Loader */}
            {duration > 0 && (
                <motion.div
                    className={`absolute bottom-0 left-0 h-[3px] opacity-80 ${progressColors}`}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: duration / 1000, ease: "linear" }}
                />
            )}
        </motion.div>
    );
}
