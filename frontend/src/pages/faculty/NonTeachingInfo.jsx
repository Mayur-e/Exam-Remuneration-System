import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { CalendarIcon, UsersIcon, PlusIcon, TrashIcon } from "../../components/icons/logo";

const DateInputSection = ({ label, value, onChange, disabled }) => {
    const [dateInput, setDateInput] = useState("");

    // Parse comma-separated string into array
    const dates = value ? value.split(",").map(d => d.trim()).filter(Boolean) : [];

    const addDate = () => {
        if (!dateInput) return;

        // Check if date is already added
        if (!dates.includes(dateInput)) {
            const newDates = [...dates, dateInput].sort();
            onChange(newDates.join(","));
        }
        setDateInput("");
    };

    const removeDate = (dateToRemove) => {
        const newDates = dates.filter(d => d !== dateToRemove);
        onChange(newDates.join(","));
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
                {label}
            </label>

            {!disabled && (
                <div className="flex gap-2">
                    <Input
                        type="date"
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        onClick={addDate}
                        disabled={!dateInput}
                        size="sm"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                    >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add
                    </Button>
                </div>
            )}

            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                {dates.length === 0 ? (
                    <span className="text-sm text-gray-400 italic">No dates added</span>
                ) : (
                    dates.map((date, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm"
                        >
                            <span className="text-sm font-medium text-gray-700">{date}</span>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeDate(date)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <TrashIcon className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default function NonTeachingInfo({ examId, disabled, onUpdated, refreshKey }) {
    const [form, setForm] = useState({
        prep_dates: "",
        exam_dates: "",
        cleaning_dates: "",
        students_per_batch: "",
        total_students: 0,
        total_batches: 0
    });
    const [fullExamData, setFullExamData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    // Load existing data
    useEffect(() => {
        if (!examId) return;

        api.get(`/faculty/exams/${examId}`).then((res) => {
            const data = res.data;
            setFullExamData(data);

            // Fetch batch size from database based on exam type and program
            api.get(`/faculty/exams/${examId}/batch-size`).then((batchRes) => {
                const batchSize = batchRes.data.batch_size || 1;
                const totalStudents = data.students_count || 0;
                const batches = batchSize ? Math.ceil(totalStudents / batchSize) : 0;

                setForm({
                    prep_dates: data.prep_dates || "",
                    exam_dates: data.exam_dates || "",
                    cleaning_dates: data.cleaning_dates || "",
                    students_per_batch: batchSize,
                    total_students: totalStudents,
                    total_batches: batches
                });
            }).catch(err => {
                console.error("Failed to load batch size:", err);
                // Fallback to default
                setForm({
                    prep_dates: data.prep_dates || "",
                    exam_dates: data.exam_dates || "",
                    cleaning_dates: data.cleaning_dates || "",
                    students_per_batch: 1,
                    total_students: data.students_count || 0,
                    total_batches: data.students_count || 0
                });
            });
        }).catch(err => {
            console.error("Failed to load non-teaching info:", err);
        });
    }, [examId, refreshKey]);

    const update = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const save = async () => {
        if (!fullExamData) return;
        setLoading(true);
        try {
            await api.put(`/faculty/exams/${examId}`, {
                ...fullExamData,
                prep_dates: form.prep_dates,
                exam_dates: form.exam_dates,
                cleaning_dates: form.cleaning_dates,
                students_count: form.total_students
            });
            showToast("Non-teaching details updated successfully!", "success");
            onUpdated?.();
        } catch (err) {
            showToast(err?.response?.data?.message || "Failed to update details", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!examId) {
        return (
            <Card className="p-6 bg-white border-gray-200">
                <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                        Please complete exam details first
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Dates & Student Information</h3>
                    <p className="text-sm text-gray-600">Enter examination dates and batch details</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Dates Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DateInputSection
                        label="Preparation Date(s)"
                        value={form.prep_dates}
                        onChange={(val) => update("prep_dates", val)}
                        disabled={disabled}
                    />

                    <DateInputSection
                        label="Examination Date(s)"
                        value={form.exam_dates}
                        onChange={(val) => update("exam_dates", val)}
                        disabled={disabled}
                    />

                    <DateInputSection
                        label="Cleaning Date(s)"
                        value={form.cleaning_dates}
                        onChange={(val) => update("cleaning_dates", val)}
                        disabled={disabled}
                    />
                </div>

                {/* Student Info Section */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <UsersIcon className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-800">Batch Information</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Total Students
                            </label>
                            <Input
                                disabled
                                value={form.total_students}
                                className="bg-gray-50"
                            />
                            <p className="text-xs text-gray-500">
                                From exam details
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Students Per Batch
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                <span className="text-sm font-semibold text-gray-800">
                                    {form.students_per_batch}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">
                                From batch size configuration
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Total Batches
                            </label>
                            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <span className="text-lg font-bold text-blue-700">
                                    {form.total_batches}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">
                                Auto-calculated
                            </p>
                        </div>
                    </div>
                </div>

                {!disabled && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-end">
                            <Button
                                onClick={save}
                                disabled={loading}
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold"
                            >
                                {loading ? "Saving..." : "Save Details"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
