import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import StaffSearch from "../../components/ui/StaffSearch";

// Icons
import {
    UsersIcon,
    PlusIcon,
    TrashIcon,
    AlertCircleIcon,
    EditIcon
} from "../../components/icons/logo";

const STAFF_ROLES = [
    "Expert Assistant",
    "Laboratory/Technical Assistant",
    "Foreman",
    "Peon"
];

export default function StaffClaimsSection({ examId, disabled, refreshKey }) {
    const [savedStaff, setSavedStaff] = useState([]);
    const [editingStaff, setEditingStaff] = useState(null);
    const [newStaff, setNewStaff] = useState(null);
    const [loading, setLoading] = useState(false);
    const [batchInfo, setBatchInfo] = useState({ batches: 0, prepDays: 0, examDays: 0, cleanDays: 0 });
    const [staffRates, setStaffRates] = useState({});
    const { showToast } = useToast();

    // Fetch saved staff and batch info
    useEffect(() => {
        if (!examId) return;
        fetchStaff();
        fetchBatchInfo();
        fetchStaffRates();
    }, [examId, refreshKey]);

    const fetchStaff = async () => {
        try {
            const res = await api.get(`/faculty/exams/${examId}/staff`);
            setSavedStaff(res.data || []);
        } catch (err) {
            console.error("Failed to fetch staff:", err);
        }
    };

    const fetchBatchInfo = async () => {
        try {
            const res = await api.get(`/faculty/exams/${examId}`);
            const totalStudents = res.data.students_count || 0;

            // Fetch batch size from database based on exam type and program
            const batchRes = await api.get(`/faculty/exams/${examId}/batch-size`);
            const batchSize = batchRes.data.batch_size || 1;
            const batches = batchSize ? Math.ceil(totalStudents / batchSize) : 0;

            // Count dates from comma-separated strings
            const countDates = (dateStr) => {
                if (!dateStr) return 0;
                return dateStr.split(',').map(d => d.trim()).filter(Boolean).length;
            };

            const prepDays = countDates(res.data.prep_dates);
            const examDays = countDates(res.data.exam_dates);
            const cleanDays = countDates(res.data.cleaning_dates);

            setBatchInfo({
                batches,
                prepDays,
                examDays,
                cleanDays
            });
        } catch (err) {
            console.error("Failed to fetch batch info:", err);
        }
    };

    const fetchStaffRates = async () => {
        try {
            const res = await api.get(`/faculty/staff-rates`);
            // Convert array to object for easy lookup
            const ratesMap = {};
            res.data.forEach(rate => {
                ratesMap[rate.staff_role] = {
                    preparation_rate: Number(rate.preparation_rate) || 0,
                    per_batch_rate: Number(rate.per_batch_rate) || 0,
                    cleaning_rate: Number(rate.cleaning_rate) || 0
                };
            });
            setStaffRates(ratesMap);
        } catch (err) {
            console.error("Failed to fetch staff rates:", err);
        }
    };

    const calculateAmounts = (staff) => {
        const staffRole = staff.staff_role;
        const rates = staffRates[staffRole] || { preparation_rate: 0, per_batch_rate: 0, cleaning_rate: 0 };

        // Use auto-calculated day counts from batchInfo (based on dates entered in NonTeachingInfo)
        const prepDays = batchInfo.prepDays || 0;
        const cleanDays = batchInfo.cleanDays || 0;
        const examDays = batchInfo.examDays || 0;

        // Expert Assistants don't get prep & clean remuneration
        const isExpertAssistant = staffRole === "Expert Assistant";

        // Prep & Clean Amount = (prep_rate × prep_days) + (clean_rate × clean_days)
        const prepCleanAmount = isExpertAssistant ? null : (
            (rates.preparation_rate * prepDays) + (rates.cleaning_rate * cleanDays)
        );

        // Batch Amount Calculation
        // Expert Assistant: Rate × Total Batches
        // Others: Rate × Total Batches × Examination Days
        let batchAmount = 0;
        if (isExpertAssistant) {
            batchAmount = rates.per_batch_rate * batchInfo.batches;
        } else {
            // For others, it's per day per batch
            batchAmount = rates.per_batch_rate * batchInfo.batches * examDays;
        }

        // Total = prep&clean + batch (or just batch for Expert Assistant)
        const totalAmount = (prepCleanAmount !== null ? prepCleanAmount : 0) + batchAmount;

        return { prepCleanAmount, batchAmount, totalAmount };
    };

    const addNewStaffRow = () => {
        setNewStaff({
            id: Date.now(),
            staff_name: "",
            staff_role: "",
            rate: "",
            preparation_days: 0,
            examination_days: 0,
            cleaning_days: 0
        });
    };

    const updateNewStaff = (field, value) => {
        setNewStaff(prev => {
            const updated = { ...prev, [field]: value };
            // Auto-set rate when role is selected based on database rates
            if (field === "staff_role" && staffRates[value]) {
                // Use per_batch_rate as the default rate for display
                updated.rate = staffRates[value].per_batch_rate;
            }
            return updated;
        });
    };

    const updateEditingStaff = (field, value) => {
        setEditingStaff(prev => ({ ...prev, [field]: value }));
    };

    const saveNewStaff = async () => {
        if (!newStaff.staff_name || !newStaff.staff_role) {
            showToast("Please fill in Staff Name and Role", "error");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/faculty/exams/${examId}/staff`, {
                staff_name: newStaff.staff_name,
                staff_role: newStaff.staff_role,
                rate: Number(newStaff.rate) || (staffRates[newStaff.staff_role]?.per_batch_rate) || 0,
                // Send actual day counts from batchInfo (auto-calculated from dates)
                preparation_days: batchInfo.prepDays || 0,
                examination_days: batchInfo.examDays || 0,
                cleaning_days: batchInfo.cleanDays || 0
            });
            showToast("Staff member added successfully!", "success");
            setNewStaff(null);
            fetchStaff();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to add staff member", "error");
        } finally {
            setLoading(false);
        }
    };

    const saveEditedStaff = async () => {
        setLoading(true);
        try {
            await api.put(`/faculty/exams/${examId}/staff/${editingStaff.id}`, {
                staff_name: editingStaff.staff_name,
                staff_role: editingStaff.staff_role,
                rate: Number(editingStaff.rate) || 0,
                // Use actual day counts from batchInfo (auto-calculated from dates)
                preparation_days: batchInfo.prepDays || 0,
                examination_days: batchInfo.examDays || 0,
                cleaning_days: batchInfo.cleanDays || 0
            });
            showToast("Staff member updated successfully!", "success");
            setEditingStaff(null);
            fetchStaff();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to update staff member", "error");
        } finally {
            setLoading(false);
        }
    };

    const deleteStaff = async (staffId) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;

        setLoading(true);
        try {
            await api.delete(`/faculty/exams/${examId}/staff/${staffId}`);
            showToast("Staff member removed successfully!", "success");
            fetchStaff();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to remove staff member", "error");
        } finally {
            setLoading(false);
        }
    };

    const calculateGrandTotal = () => {
        return savedStaff.reduce((sum, staff) => {
            const { totalAmount } = calculateAmounts(staff);
            return sum + totalAmount;
        }, 0);
    };

    if (!examId) {
        return (
            <div className="p-6 text-center py-8">
                <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                    Please complete exam details first to add staff information
                </p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <UsersIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-card-foreground">
                            Staff Table
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Manage supporting staff and their remuneration
                        </p>
                    </div>
                </div>
                {!disabled && !newStaff && (
                    <Button
                        onClick={addNewStaffRow}
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Staff
                    </Button>
                )}
            </div>

            {/* Important Notice */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <AlertCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Important Information</h4>
                        <p className="text-xs text-blue-800">
                            <strong>Expert Assistants</strong> are not entitled to claim preparation and cleaning day remuneration.
                            They will only receive per-batch remuneration for examination days.
                        </p>
                    </div>
                </div>
            </div>

            {/* Staff Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-accent border-b-2 border-border">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Designation</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Rate (₹)</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Prep & Clean Rs</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Batch Rs</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Total Amount</th>
                            {!disabled && <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Saved Staff Rows */}
                        {savedStaff.map((staff) => {
                            const isEditing = editingStaff?.id === staff.id;
                            const currentStaff = isEditing ? editingStaff : staff;
                            const { prepCleanAmount, batchAmount, totalAmount } = calculateAmounts(currentStaff);

                            return (
                                <tr key={staff.id} className="border-b border-border hover:bg-muted">
                                    <td className="px-4 py-3">
                                        {isEditing ? (
                                            <StaffSearch
                                                value={editingStaff.staff_name}
                                                onChange={(val) => updateEditingStaff("staff_name", val)}
                                                type="all"
                                                placeholder="Search staff name..."
                                            />
                                        ) : (
                                            <span className="text-sm text-card-foreground">{staff.staff_name}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {isEditing ? (
                                            <select
                                                value={editingStaff.staff_role}
                                                onChange={(e) => updateEditingStaff("staff_role", e.target.value)}
                                                className="w-full px-3 py-2 border border-border rounded-lg"
                                            >
                                                <option value="">Select</option>
                                                {STAFF_ROLES.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-sm text-card-foreground">{staff.staff_role}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={editingStaff.rate}
                                                onChange={(e) => updateEditingStaff("rate", e.target.value)}
                                                className="w-24"
                                            />
                                        ) : (
                                            <span className="text-sm text-card-foreground">₹{staff.rate || 0}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            {currentStaff.staff_role === "Expert Assistant" ? (
                                                <>
                                                    <span className="text-xs text-muted-foreground italic">
                                                        Not applicable
                                                    </span>
                                                    <div className="text-sm font-semibold text-muted-foreground">
                                                        N/A
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xs text-muted-foreground">
                                                        {batchInfo.prepDays || 0} + {batchInfo.cleanDays || 0} days
                                                    </span>
                                                    <div className="text-sm font-semibold text-green-700">
                                                        ₹{prepCleanAmount.toFixed(2)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            {currentStaff.staff_role === "Expert Assistant" ? (
                                                <span className="text-xs text-muted-foreground">
                                                    {batchInfo.batches} batches
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    {batchInfo.examDays || 0} days × {batchInfo.batches} batches
                                                </span>
                                            )}
                                            <div className="text-sm font-semibold text-blue-700">
                                                ₹{batchAmount.toFixed(2)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm font-bold text-purple-700">
                                            ₹{totalAmount.toFixed(2)}
                                        </span>
                                    </td>
                                    {!disabled && (
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            onClick={saveEditedStaff}
                                                            disabled={loading}
                                                            size="sm"
                                                            className="text-xs"
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            onClick={() => setEditingStaff(null)}
                                                            variant="secondary"
                                                            size="sm"
                                                            className="text-xs"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            onClick={() => setEditingStaff({ ...staff })}
                                                            variant="secondary"
                                                            size="sm"
                                                            className="text-xs"
                                                        >
                                                            <EditIcon className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => deleteStaff(staff.id)}
                                                            variant="destructive"
                                                            size="sm"
                                                            className="text-xs"
                                                        >
                                                            <TrashIcon className="w-3 h-3" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}

                        {/* New Staff Row */}
                        {newStaff && (
                            <tr className="border-b-2 border-purple-300 bg-purple-50">
                                <td className="px-4 py-3">
                                    <StaffSearch
                                        placeholder="Search staff name..."
                                        value={newStaff.staff_name}
                                        onChange={(val) => updateNewStaff("staff_name", val)}
                                        type="all"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={newStaff.staff_role}
                                        onChange={(e) => updateNewStaff("staff_role", e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-lg"
                                    >
                                        <option value="">Select Role</option>
                                        {STAFF_ROLES.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <Input
                                        type="number"
                                        placeholder="Rate"
                                        value={newStaff.rate}
                                        onChange={(e) => updateNewStaff("rate", e.target.value)}
                                        className="w-24"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    {newStaff.staff_role === "Expert Assistant" ? (
                                        <div className="text-xs text-muted-foreground italic">N/A</div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground">
                                            {batchInfo.prepDays || 0} + {batchInfo.cleanDays || 0} days
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {newStaff.staff_role === "Expert Assistant" ? (
                                        <div className="text-xs text-muted-foreground">
                                            {batchInfo.batches} batches
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground">
                                            {batchInfo.examDays || 0} days × {batchInfo.batches} batches
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm font-bold text-purple-700">
                                        ₹{calculateAmounts(newStaff).totalAmount.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={saveNewStaff}
                                            disabled={loading}
                                            size="sm"
                                            className="text-xs"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            onClick={() => setNewStaff(null)}
                                            variant="secondary"
                                            size="sm"
                                            className="text-xs"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Empty State */}
                        {savedStaff.length === 0 && !newStaff && (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center">
                                    <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground mb-2">No staff added yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        Click "Add Staff" to add supporting staff
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>

                    {/* Grand Total Row */}
                    {savedStaff.length > 0 && (
                        <tfoot>
                            <tr className="bg-gradient-to-r from-purple-100 to-blue-100 border-t-2 border-purple-300">
                                <td colSpan="5" className="px-4 py-4 text-right font-bold text-card-foreground">
                                    Grand Total:
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-lg font-bold text-purple-800">
                                        ₹{calculateGrandTotal().toFixed(2)}
                                    </span>
                                </td>
                                {!disabled && <td></td>}
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Information Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                    <AlertCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-800 mb-1">Important Notes</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Prep & Clean Rs = (Prep Rate × Prep Days) + (Clean Rate × Clean Days)</li>
                            <li>• Batch Rs (Expert): Rate × Total Batches</li>
                            <li>• Batch Rs (Others): Rate × Total Batches × Exam Days</li>
                            <li>• Total Amount = Prep & Clean Rs + Batch Rs</li>
                            <li>• Rates are auto-filled from database configuration</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
