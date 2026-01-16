import { useState, useEffect } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

// Icons
import {
    UsersIcon,
    PlusIcon,
    TrashIcon,
    AlertCircleIcon,
    CheckCircleIcon
} from "../../components/icons/logo";

const STAFF_ROLES = [
    "Expert Assistant",
    "Laboratory/Technical Assistant",
    "Foreman",
    "Peon"
];

export default function StaffClaimsSection({ examId, disabled }) {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);

    const addStaffRow = () => {
        setStaffList([
            ...staffList,
            {
                id: Date.now(),
                staff_name: "",
                staff_role: "",
                preparation_days: "",
                examination_days: "",
                cleaning_days: ""
            }
        ]);
    };

    const removeStaffRow = (id) => {
        setStaffList(staffList.filter((s) => s.id !== id));
    };

    const updateStaffRow = (id, field, value) => {
        setStaffList(
            staffList.map((s) => (s.id === id ? { ...s, [field]: value } : s))
        );
    };

    const saveStaff = async (staffRow) => {
        if (!staffRow.staff_role || !staffRow.staff_name) {
            alert("Please fill in Staff Name and Role");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/faculty/exams/${examId}/staff`, {
                staff_name: staffRow.staff_name,
                staff_role: staffRow.staff_role,
                preparation_days: Number(staffRow.preparation_days) || 0,
                examination_days: Number(staffRow.examination_days) || 0,
                cleaning_days: Number(staffRow.cleaning_days) || 0
            });
            alert("Staff member added successfully!");
            // Remove the saved row from the list
            removeStaffRow(staffRow.id);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add staff member");
        } finally {
            setLoading(false);
        }
    };

    if (!examId) {
        return (
            <Card className="p-6 bg-white border-gray-200">
                <div className="text-center py-8">
                    <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                        Please complete exam details first to add staff information
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <UsersIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                            Staff Details
                        </h3>
                        <p className="text-sm text-gray-600">
                            Add supporting staff for this examination
                        </p>
                    </div>
                </div>
                {!disabled && (
                    <Button
                        onClick={addStaffRow}
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Staff
                    </Button>
                )}
            </div>

            {staffList.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No staff added yet</p>
                    <p className="text-sm text-gray-500">
                        Click "Add Staff" to add supporting staff for this exam
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {staffList.map((staff) => (
                        <div
                            key={staff.id}
                            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                {/* Staff Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Staff Name *
                                    </label>
                                    <Input
                                        type="text"
                                        disabled={disabled}
                                        placeholder="Enter name"
                                        value={staff.staff_name}
                                        onChange={(e) =>
                                            updateStaffRow(staff.id, "staff_name", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Staff Role */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Staff Role *
                                    </label>
                                    <select
                                        disabled={disabled}
                                        value={staff.staff_role}
                                        onChange={(e) =>
                                            updateStaffRow(staff.id, "staff_role", e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                    >
                                        <option value="">Select Role</option>
                                        {STAFF_ROLES.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Preparation Days */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Prep Days
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        disabled={disabled}
                                        placeholder="0"
                                        value={staff.preparation_days}
                                        onChange={(e) =>
                                            updateStaffRow(
                                                staff.id,
                                                "preparation_days",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* Examination Days */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Exam Days
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        disabled={disabled}
                                        placeholder="0"
                                        value={staff.examination_days}
                                        onChange={(e) =>
                                            updateStaffRow(staff.id, "examination_days", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Cleaning Days */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Clean Days
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        disabled={disabled}
                                        placeholder="0"
                                        value={staff.cleaning_days}
                                        onChange={(e) =>
                                            updateStaffRow(staff.id, "cleaning_days", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Actions
                                    </label>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => saveStaff(staff)}
                                            disabled={disabled || loading}
                                            className="flex-1"
                                            size="sm"
                                        >
                                            Save
                                        </Button>
                                        {!disabled && (
                                            <Button
                                                onClick={() => removeStaffRow(staff.id)}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Information Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                    <AlertCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-800 mb-1">Important Notes</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Save each staff entry individually before submission</li>
                            <li>• Batch count will be calculated automatically by the system</li>
                            <li>• Remuneration rates are applied as per institutional norms</li>
                            <li>• Final calculation will be done upon claim submission</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Card>
    );
}
