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
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState("2024-25");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchAcademicYears();
    }, []);

    useEffect(() => {
        if (selectedYear) {
            fetchRates();
        }
    }, [selectedYear]);

    const fetchAcademicYears = async () => {
        try {
            const response = await api.get("/admin/rates/academic-years");
            const years = response.data;
            setAcademicYears(years);
            if (years.length > 0) {
                setSelectedYear(years[0]); // Set to most recent year
            }
        } catch (error) {
            console.error("Fetch academic years error:", error);
            showToast("Failed to fetch academic years", "error");
        }
    };

    const fetchRates = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/rates?academic_year=${selectedYear}`);
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
                academic_year: selectedYear,
                teachingRates,
                staffRates,
                batchSizes
            });
            showToast(`Rates updated successfully for ${selectedYear}!`, "success");
            await fetchRates(); // Refresh data
        } catch (error) {
            console.error("Update rates error:", error);
            showToast(error?.response?.data?.message || "Failed to update rates", "error");
        } finally {
            setSaving(false);
        }
    };

    const [showCloneModal, setShowCloneModal] = useState(false);
    const [sourceYear, setSourceYear] = useState("");
    const [newYear, setNewYear] = useState("");
    const [cloning, setCloning] = useState(false);

    // Generate years from 2024 to currentYear + 6 for dropdown options
    const generateYearOptions = () => {
        const START_YEAR = 2024;
        const currentYear = new Date().getFullYear();
        const endYear = currentYear + 6;
        const years = [];
        for (let year = START_YEAR; year <= endYear; year++) {
            const nextYear = (year + 1).toString().slice(-2);
            years.push(`${year}-${nextYear}`);
        }
        return years;
    };

    const handleOpenCloneModal = () => {
        setSourceYear(selectedYear); // Default to currently selected year
        setNewYear(""); // Reset target year
        setShowCloneModal(true);
    };

    const handleCloneRates = async () => {
        if (!sourceYear) {
            showToast("Please select a source year", "error");
            return;
        }

        if (!newYear) {
            showToast("Please select a target year", "error");
            return;
        }

        if (sourceYear === newYear) {
            showToast("Source and target years must be different", "error");
            return;
        }

        // Check if target year already exists
        if (academicYears.includes(newYear)) {
            showToast(`Rates for ${newYear} already exist. Please select a different year.`, "error");
            return;
        }

        try {
            setCloning(true);
            await api.post("/admin/rates/clone", {
                source_year: sourceYear,
                target_year: newYear
            });
            showToast(`Successfully cloned rates from ${sourceYear} to ${newYear}!`, "success");
            setShowCloneModal(false);
            setNewYear("");
            setSourceYear("");
            await fetchAcademicYears(); // Refresh years list
            setSelectedYear(newYear); // Switch to new year
        } catch (error) {
            console.error("Clone rates error:", error);
            showToast(error?.response?.data?.message || "Failed to clone rates", "error");
        } finally {
            setCloning(false);
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
            {/* Academic Year Selector */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">
                            Academic Year:
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {academicYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <Button
                            onClick={handleOpenCloneModal}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            + Clone to New Year
                        </Button>
                    </div>
                    <div className="text-sm text-gray-500">
                        Configure rates for the selected academic year
                    </div>
                </div>
            </Card>

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
                                            <Input type="number"
                                                value={rate.fy_sy_rate}
                                                onChange={(e) =>
                                                    handleTeachingRateChange(index, "fy_sy_rate", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input type="number"
                                                value={rate.ty_final_rate}
                                                onChange={(e) =>
                                                    handleTeachingRateChange(index, "ty_final_rate", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input type="number"
                                                value={rate.mtech_mca_rate}
                                                onChange={(e) =>
                                                    handleTeachingRateChange(index, "mtech_mca_rate", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input type="number"
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
                                            <Input type="number"
                                                value={rate.preparation_rate}
                                                onChange={(e) =>
                                                    handleStaffRateChange(index, "preparation_rate", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input type="number"
                                                value={rate.per_batch_rate}
                                                onChange={(e) =>
                                                    handleStaffRateChange(index, "per_batch_rate", e.target.value)
                                                }
                                                className="w-32"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input type="number"
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
                                            <Input type="number"
                                                value={batch.practical_size || ''}
                                                onChange={(e) =>
                                                    handleBatchSizeChange(index, "practical_size", e.target.value)
                                                }
                                                className="w-24"
                                                min="1"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input type="number"
                                                value={batch.oral_size || ''}
                                                onChange={(e) =>
                                                    handleBatchSizeChange(index, "oral_size", e.target.value)
                                                }
                                                className="w-24"
                                                min="1"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input type="number"
                                                value={batch.termwork_size || ''}
                                                onChange={(e) =>
                                                    handleBatchSizeChange(index, "termwork_size", e.target.value)
                                                }
                                                className="w-24"
                                                min="1"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input type="number"
                                                value={batch.project_oral_size || ''}
                                                onChange={(e) =>
                                                    handleBatchSizeChange(index, "project_oral_size", e.target.value)
                                                }
                                                className="w-24"
                                                min="1"
                                            />
                                        </td>
                                        <td className="py-2 px-4">
                                            <Input type="number"
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

            {/* Clone Modal */}
            {showCloneModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Clone Rates to New Year</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Copy all rates from one academic year to create a new year's rates.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Source Academic Year (Copy From)
                                </label>
                                <select
                                    value={sourceYear}
                                    onChange={(e) => setSourceYear(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {academicYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Select which year's rates to copy
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Academic Year (Create New)
                                </label>
                                <select
                                    value={newYear}
                                    onChange={(e) => setNewYear(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">Select a year...</option>
                                    {generateYearOptions()
                                        .filter(year => !academicYears.includes(year)) // Only show years that don't exist yet
                                        .map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Select the new year to create (only shows available years)
                                </p>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    onClick={() => {
                                        setShowCloneModal(false);
                                        setNewYear("");
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600"
                                    disabled={cloning}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCloneRates}
                                    disabled={cloning}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {cloning ? "Cloning..." : "Clone Rates"}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}



