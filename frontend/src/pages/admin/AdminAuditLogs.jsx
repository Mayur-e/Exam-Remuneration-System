import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

// Icons
import {
    ClipboardIcon,
    FilterIcon
} from "../../components/icons/logo";

export default function AdminAuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        exam_id: "",
        action_type: "",
        date_from: "",
        date_to: ""
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.exam_id) params.append("exam_id", filters.exam_id);
            if (filters.action_type) params.append("action_type", filters.action_type);
            if (filters.date_from) params.append("date_from", filters.date_from);
            if (filters.date_to) params.append("date_to", filters.date_to);

            const res = await api.get(`/admin/audit-logs?${params.toString()}`);
            setLogs(res.data);
        } catch (err) {
            console.error("Failed to fetch audit logs:", err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        fetchLogs();
    };

    const clearFilters = () => {
        setFilters({
            exam_id: "",
            action_type: "",
            date_from: "",
            date_to: ""
        });
    };

    const getActionBadge = (actionType) => {
        const badges = {
            'REJECTED': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
            'APPROVED': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'SENT_BACK': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
            'SUBMITTED': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
        };
        return badges[actionType] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
                <p className="text-gray-600">System-wide immutable audit trail</p>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="p-6 bg-card border-border">
                    <h3 className="font-semibold mb-4 text-card-foreground">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Exam ID
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter exam ID"
                                value={filters.exam_id}
                                onChange={(e) => handleFilterChange("exam_id", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Action Type
                            </label>
                            <motion.select
                                value={filters.action_type}
                                onChange={(e) => handleFilterChange("action_type", e.target.value)}
                                className="w-full border border-input bg-background rounded-lg p-2 text-sm text-foreground"
                                whileHover={{ scale: 1.01 }}
                            >
                                <option value="">All Actions</option>
                                <option value="SUBMITTED">Submitted</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="SENT_BACK">Sent Back</option>
                            </motion.select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Date From
                            </label>
                            <Input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange("date_from", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Date To
                            </label>
                            <Input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={applyFilters} className="bg-purple-600 hover:bg-purple-700">
                                <FilterIcon className="w-4 h-4 mr-2" />
                                Apply Filters
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={clearFilters} variant="outline">
                                Clear
                            </Button>
                        </motion.div>
                    </div>
                </Card>
            </motion.div>

            {/* Logs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="bg-card border-border">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                className="p-12 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <p className="text-muted-foreground">Loading audit logs...</p>
                            </motion.div>
                        ) : logs.length === 0 ? (
                            <motion.div
                                className="p-12 text-center"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <ClipboardIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-card-foreground mb-2">No audit logs found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="divide-y divide-border"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {logs.map((log, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="p-6 hover:bg-accent transition-colors"
                                        variants={itemVariants}
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <motion.span
                                                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getActionBadge(log.action_type)}`}
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    {log.action_type}
                                                </motion.span>
                                                <span className="text-sm text-muted-foreground">
                                                    Exam #{log.exam_id} - {log.subject_name || 'N/A'}
                                                </span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(log.action_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Action By:</span>
                                                <span className="ml-2 font-medium text-card-foreground">
                                                    {log.action_by_name} ({log.action_role})
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Exam Type:</span>
                                                <span className="ml-2 font-medium text-card-foreground">{log.exam_type}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Faculty:</span>
                                                <span className="ml-2 font-medium text-card-foreground">{log.faculty_name}</span>
                                            </div>
                                        </div>
                                        {log.comment && (
                                            <motion.div
                                                className="mt-3 p-3 bg-accent rounded-lg"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                <p className="text-sm text-card-foreground">
                                                    <span className="font-medium">Comment:</span> {log.comment}
                                                </p>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer */}
                    {logs.length > 0 && (
                        <motion.div
                            className="px-6 py-4 bg-accent border-t border-border"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-semibold">{logs.length}</span> audit log entries
                                {logs.length >= 500 && " (limited to 500 most recent)"}
                            </p>
                        </motion.div>
                    )}
                </Card>
            </motion.div>
        </motion.div>
    );
}
