import { useEffect, useState } from "react";
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
            'REJECTED': 'bg-red-100 text-red-700 border-red-200',
            'APPROVED': 'bg-green-100 text-green-700 border-green-200',
            'SENT_BACK': 'bg-orange-100 text-orange-700 border-orange-200',
            'SUBMITTED': 'bg-blue-100 text-blue-700 border-blue-200'
        };
        return badges[actionType] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
                <p className="text-gray-600">System-wide immutable audit trail</p>
            </div>

            {/* Filters */}
            <Card className="p-6 bg-white border-gray-200">
                <h3 className="font-semibold mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Action Type
                        </label>
                        <select
                            value={filters.action_type}
                            onChange={(e) => handleFilterChange("action_type", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                        >
                            <option value="">All Actions</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="SENT_BACK">Sent Back</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date From
                        </label>
                        <Input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => handleFilterChange("date_from", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <Button onClick={applyFilters} className="bg-purple-600 hover:bg-purple-700">
                        <FilterIcon className="w-4 h-4 mr-2" />
                        Apply Filters
                    </Button>
                    <Button onClick={clearFilters} variant="outline">
                        Clear
                    </Button>
                </div>
            </Card>

            {/* Logs */}
            <Card className="bg-white border-gray-200">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading audit logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <ClipboardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No audit logs found</h3>
                        <p className="text-gray-500">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {logs.map((log, idx) => (
                            <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getActionBadge(log.action_type)}`}>
                                            {log.action_type}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Exam #{log.exam_id} - {log.subject_name || 'N/A'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(log.action_at).toLocaleString()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Action By:</span>
                                        <span className="ml-2 font-medium text-gray-900">
                                            {log.action_by_name} ({log.action_role})
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Exam Type:</span>
                                        <span className="ml-2 font-medium text-gray-900">{log.exam_type}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Faculty:</span>
                                        <span className="ml-2 font-medium text-gray-900">{log.faculty_name}</span>
                                    </div>
                                </div>
                                {log.comment && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Comment:</span> {log.comment}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                {logs.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{logs.length}</span> audit log entries
                            {logs.length >= 500 && " (limited to 500 most recent)"}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
