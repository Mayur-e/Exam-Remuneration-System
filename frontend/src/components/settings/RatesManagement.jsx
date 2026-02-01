import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";

export default function RatesManagement() {
    const [activeTab, setActiveTab] = useState("teaching");
    const [teachingRates, setTeachingRates] = useState([]);
    const [staffRates, setStaffRates] = useState([]);
    const [batchSizes, setBatchSizes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            setLoading(true);
            const response = await api.get("/admin/rates");
            setTeachingRates(response.data.teachingRates || []);
            setStaffRates(response.data.staffRates || []);
            setBatchSizes(response.data.batchSizes || []);
        } catch (error) {
            console.error("Fetch rates error:", error);
            showToast("Failed to fetch rates", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTeachingRateChange = (index, field, value) => {
        const updated = [...teachingRates];
        updated[index][field] = value;
        setTeachingRates(updated);
    };

    const handleStaffRateChange = (index, field, value) => {
        const updated = [...staffRates];
        updated[index][field] = value;
        setStaffRates(updated);
    };

    const handleBatchSizeChange = (index, field, value) => {
        const updated = [...batchSizes];
        updated[index][field] = value;
        setBatchSizes(updated);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put("/admin/rates", {
                teachingRates,
                staffRates,
                batchSizes
            });
            showToast("Rates updated successfully!", "success");
            await fetchRates(); // Refresh data
        } catch (error) {
            console.error("Update rates error:", error);
            showToast(error?.response?.data?.message || "Failed to update rates", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card className="p-6">
                <div className="text-center text-gray-500">Loading rates...</div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("teaching")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "teaching"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Teaching Rates
                    </button>
                    <button
                        onClick={() => setActiveTab("staff")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "staff"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Non-Teaching Rates
                    </button>
                    <button
                        onClick={() => setActiveTab("batch")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "batch"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Batch Sizes
                    </button>
                </nav>
            </div>

            {/* Teaching Rates Tab */}
            {activeTab === "teaching" && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Teaching Examination Rates</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 px-4">Exam Type</th>
                                    <th className="text-left py-2 px-4">FY/SY Rate (₹)</th>
                                    <th className="text-left py-2 px-4">TY/Final Rate (₹)</th>
                                    <th className="text-left py-2 px-4">MTech/MCA Rate (₹)</th>
                                    <th className="text-left py-2 px-4">Min Per Day (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachingRates.map((rate, index) => (
                                    <tr key={rate.exam_type} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-4 font-medium">{rate.exam_type}</td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={rate.fy_sy_rate}
                                                onChange={(e) =>
                                                    handleTeachingRateChange(index, "fy_sy_rate", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={rate.ty_final_rate}
                                                onChange={(e) =>
                                                    handleTeachingRateChange(index, "ty_final_rate", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={rate.mtech_mca_rate}
                                                onChange={(e) =>
                                                    handleTeachingRateChange(index, "mtech_mca_rate", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={rate.min_per_day}
                                                onChange={(e) =>
                                                    handleTeachingRateChange(index, "min_per_day", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Staff Rates Tab */}
            {activeTab === "staff" && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Non-Teaching Staff Rates</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 px-4">Staff Role</th>
                                    <th className="text-left py-2 px-4">Preparation Rate (₹)</th>
                                    <th className="text-left py-2 px-4">Per Batch Rate (₹)</th>
                                    <th className="text-left py-2 px-4">Cleaning Rate (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffRates.map((rate, index) => (
                                    <tr key={rate.staff_role} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-4 font-medium">{rate.staff_role}</td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={rate.preparation_rate}
                                                onChange={(e) =>
                                                    handleStaffRateChange(index, "preparation_rate", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={rate.per_batch_rate}
                                                onChange={(e) =>
                                                    handleStaffRateChange(index, "per_batch_rate", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={rate.cleaning_rate}
                                                onChange={(e) =>
                                                    handleStaffRateChange(index, "cleaning_rate", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Batch Sizes Tab */}
            {activeTab === "batch" && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Batch Sizes by Program</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Configure the number of students per batch for different exam types
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 px-4">Program</th>
                                    <th className="text-left py-2 px-4">Practical (PR)</th>
                                    <th className="text-left py-2 px-4">Oral (OR)</th>
                                    <th className="text-left py-2 px-4">Termwork (TW)</th>
                                    <th className="text-left py-2 px-4">Project/Oral</th>
                                    <th className="text-left py-2 px-4">Dissertation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batchSizes.map((batch, index) => (
                                    <tr key={batch.program} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-4 font-medium">{batch.program}</td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={batch.practical_size || ''}
                                                onChange={(e) =>
                                                    handleBatchSizeChange(index, "practical_size", e.target.value)
                                                }
                                                className="w-24"
                                                min="1"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={batch.oral_size || ''}
                                                onChange={(e) =>
                                                    handleBatchSizeChange(index, "oral_size", e.target.value)
                                                }
                                                className="w-24"
                                                min="1"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={batch.termwork_size || ''}
                                                onChange={(e) =>
                                                    handleBatchSizeChange(index, "termwork_size", e.target.value)
                                                }
                                                className="w-24"
                                                min="1"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={batch.project_oral_size || ''}
                                                onChange={(e) =>
                                                    handleBatchSizeChange(index, "project_oral_size", e.target.value)
                                                }
                                                className="w-24"
                                                min="1"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input
                                                type="number"
                                                value={batch.dissertation_size || ''}
                                                onChange={(e) =>
                                                    handleBatchSizeChange(index, "dissertation_size", e.target.value)
                                                }
                                                className="w-24"
                                                min="1"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
