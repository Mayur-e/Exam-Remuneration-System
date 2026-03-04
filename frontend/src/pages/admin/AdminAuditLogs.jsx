import { useEffect, useState } from "react";
import api from "../../services/api";

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
        // We could automatically fetch here or let the user click "Apply Filter"
    };

    const getActionBadge = (actionType) => {
        const badges = {
            'REJECTED': 'bg-red-50 text-red-700 border-red-200',
            'APPROVED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'SENT_BACK': 'bg-amber-50 text-amber-700 border-amber-200',
            'SUBMITTED': 'bg-blue-50 text-blue-700 border-blue-200'
        };
        return badges[actionType] || 'bg-slate-50 text-slate-700 border-slate-200';
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
                    <p className="text-slate-500 text-sm mt-1">System-wide immutable audit trail</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl bg-primary/10 p-2 rounded-xl">receipt_long</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Exam ID
                        </label>
                        <input
                            type="text"
                            placeholder="Enter exam ID"
                            value={filters.exam_id}
                            onChange={(e) => handleFilterChange("exam_id", e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Action Type
                        </label>
                        <div className="relative">
                            <select
                                value={filters.action_type}
                                onChange={(e) => handleFilterChange("action_type", e.target.value)}
                                className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 appearance-none cursor-pointer"
                            >
                                <option value="">All Actions</option>
                                <option value="SUBMITTED">Submitted</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="SENT_BACK">Sent Back</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Date From
                        </label>
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => handleFilterChange("date_from", e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Date To
                        </label>
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => handleFilterChange("date_to", e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={applyFilters} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                        Apply Filters
                    </button>
                    <button onClick={clearFilters} className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-slate-500 mt-4 text-sm font-medium">Loading audit logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">clinical_notes</span>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">No Audit Logs Found</h3>
                        <p className="text-sm text-slate-500">No logs found matching the selected criteria.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {logs.map((log, idx) => (
                            <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getActionBadge(log.action_type)}`}>
                                            {log.action_type}
                                        </span>
                                        <span className="text-sm font-bold text-slate-700">
                                            Exam #{log.exam_id} - <span className="text-slate-500 font-medium">{log.subject_name || 'N/A'}</span>
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap self-start">
                                        {new Date(log.action_at).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px]">person_check</span>
                                            Action By
                                        </div>
                                        <span className="font-medium text-slate-900">
                                            {log.action_by_name} <span className="text-slate-500">({log.action_role})</span>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px]">school</span>
                                            Exam Type
                                        </div>
                                        <span className="font-medium text-slate-900">{log.exam_type}</span>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px]">person</span>
                                            Faculty
                                        </div>
                                        <span className="font-medium text-slate-900">{log.faculty_name}</span>
                                    </div>
                                </div>

                                {log.comment && (
                                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100/50">
                                        <div className="text-[10px] font-bold text-amber-700/70 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px]">chat</span>
                                            Comment
                                        </div>
                                        <p className="text-sm text-amber-900 italic font-medium whitespace-pre-wrap leading-relaxed">
                                            "{log.comment}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {logs.length > 0 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing <span className="font-bold text-slate-700">{logs.length}</span> audit log entries
                            {logs.length >= 500 && " (limited to 500 most recent)"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
