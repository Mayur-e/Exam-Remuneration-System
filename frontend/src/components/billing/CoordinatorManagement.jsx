import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
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

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">Coordinator Management</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            View and manage course coordinator assignments in your department
                        </p>
                    </div>
                    <Button
                        onClick={fetchAssignments}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        Refresh
                    </Button>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Course Code</th>
                                <th className="px-6 py-3">Course Name</th>
                                <th className="px-6 py-3">Coordinator</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Academic Year</th>
                                <th className="px-6 py-3">Semester</th>
                                <th className="px-6 py-3">Pending Claims</th>
                                <th className="px-6 py-3">Assigned On</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="text-center py-4">Loading...</td></tr>
                            ) : assignments.length === 0 ? (
                                <tr><td colSpan="9" className="text-center py-4 text-gray-500">No active coordinator assignments found.</td></tr>
                            ) : (
                                assignments.map((assignment) => (
                                    <tr key={assignment.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-purple-600 font-medium">{assignment.course_code}</td>
                                        <td className="px-6 py-4">{assignment.course_name}</td>
                                        <td className="px-6 py-4 font-medium">{assignment.faculty_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{assignment.faculty_email}</td>
                                        <td className="px-6 py-4">{assignment.academic_year}</td>
                                        <td className="px-6 py-4">{assignment.semester}</td>
                                        <td className="px-6 py-4">
                                            {assignment.pending_claims > 0 ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    {assignment.pending_claims} pending
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{new Date(assignment.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleRevokeClick(assignment)}
                                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                                            >
                                                Revoke
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Revoke Confirmation Modal */}
            {showRevokeModal && selectedAssignment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-bold text-red-600">Revoke Coordinator Assignment</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Warning:</strong> You are about to revoke the coordinator assignment for:
                                </p>
                                <ul className="mt-2 text-sm text-yellow-800 space-y-1">
                                    <li><strong>Course:</strong> {selectedAssignment.course_code} - {selectedAssignment.course_name}</li>
                                    <li><strong>Coordinator:</strong> {selectedAssignment.faculty_name}</li>
                                    <li><strong>Term:</strong> {selectedAssignment.academic_year}, Sem {selectedAssignment.semester}</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Reason for Revocation (Optional)</label>
                                <textarea
                                    value={revokeReason}
                                    onChange={(e) => setRevokeReason(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows="3"
                                    placeholder="Enter reason for revoking this assignment..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setShowRevokeModal(false);
                                        setSelectedAssignment(null);
                                        setRevokeReason("");
                                    }}
                                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRevoke}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Revoke Assignment
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
