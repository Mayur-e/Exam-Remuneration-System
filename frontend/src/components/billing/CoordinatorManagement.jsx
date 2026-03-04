import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";

export default function CoordinatorManagement() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [revokeReason, setRevokeReason] = useState("");
    const { showToast } = useToast();

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const response = await api.get("/accountant/coordinators");
            setAssignments(response.data);
        } catch (error) {
            console.error("Fetch assignments error:", error);
            showToast("Failed to fetch coordinator assignments", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeClick = (assignment) => {
        setSelectedAssignment(assignment);
        setShowRevokeModal(true);
    };

    const handleRevoke = async () => {
        if (!selectedAssignment) return;

        try {
            await api.post(`/accountant/coordinators/${selectedAssignment.id}/revoke`, {
                reason: revokeReason
            });
            showToast("Coordinator assignment revoked successfully", "success");
            setShowRevokeModal(false);
            setSelectedAssignment(null);
            setRevokeReason("");
            fetchAssignments();
        } catch (error) {
            console.error("Revoke coordinator error:", error);
            showToast(error.response?.data?.message || "Failed to revoke coordinator", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background-light">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading coordinator assignments...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)] pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Coordinator Management</h1>
                    <p className="text-slate-500 font-medium">View and manage course coordinator assignments in your department</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchAssignments}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                        Refresh List
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course & Term</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coordinator</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Claims</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned On</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {assignments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">badge</span>
                                            <p className="font-bold text-slate-700 mb-1 text-lg">No Assignments Found</p>
                                            <p className="text-sm">No course coordinators are currently active in your department.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                assignments.map((assignment) => (
                                    <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0 border border-purple-100">
                                                    {assignment.course_code?.substring(0, 2) || 'CC'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm line-clamp-1">{assignment.course_name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5 text-xs font-bold text-slate-500">
                                                        <span className="text-purple-600 font-mono tracking-tight bg-purple-50 px-1.5 py-0.5 rounded">{assignment.course_code}</span>
                                                        <span>•</span>
                                                        <span>{assignment.academic_year} (Sem {assignment.semester})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{assignment.faculty_name}</p>
                                                <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <span className="material-symbols-outlined text-[14px]">mail</span>
                                                    {assignment.faculty_email}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {assignment.pending_claims > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-700 font-bold text-[10px] uppercase tracking-wider">
                                                    <span className="material-symbols-outlined text-[14px]">pending_actions</span>
                                                    {assignment.pending_claims} Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                    Clear
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[14px] text-slate-400">calendar_today</span>
                                                {new Date(assignment.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRevokeClick(assignment)}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
                                                title="Revoke Assignment"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Revoke Modal */}
            {showRevokeModal && selectedAssignment && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                <span className="material-symbols-outlined text-red-500">warning</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-900">Revoke Assignment</h3>
                                <p className="text-xs font-medium text-red-700/80">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700">
                                <p className="mb-2">You are about to revoke coordinator rights for:</p>
                                <ul className="space-y-1 text-slate-600 ml-1">
                                    <li className="flex gap-2"><span className="font-bold w-20 text-slate-400">Course:</span> <span className="text-slate-900 font-bold">{selectedAssignment.course_code} - {selectedAssignment.course_name}</span></li>
                                    <li className="flex gap-2"><span className="font-bold w-20 text-slate-400">Faculty:</span> <span className="text-slate-900 font-bold">{selectedAssignment.faculty_name}</span></li>
                                    <li className="flex gap-2"><span className="font-bold w-20 text-slate-400">Term:</span> <span className="text-slate-900 font-bold">{selectedAssignment.academic_year}, Sem {selectedAssignment.semester}</span></li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    Reason for Revocation <span className="text-slate-300 normal-case tracking-normal">(Optional)</span>
                                </label>
                                <textarea
                                    value={revokeReason}
                                    onChange={(e) => setRevokeReason(e.target.value)}
                                    placeholder="Briefly explain why this assignment is being revoked..."
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none h-24 font-medium text-slate-700"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowRevokeModal(false);
                                        setSelectedAssignment(null);
                                        setRevokeReason("");
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRevoke}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm text-sm inline-flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                    Revoke Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
