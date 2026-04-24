import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { CalendarIcon, UsersIcon, PlusIcon, TrashIcon } from "../../components/icons/logo";

const DateInputSection = ({ label, value, onChange, disabled, maxAllowed }) => {
    const [dateInput, setDateInput] = useState("");

    // Parse comma-separated string into array
    const dates = value ? value.split(",").map(d => d.trim()).filter(Boolean) : [];

    // Blocked = this exam type allows 0 days of this type
    const isBlocked = maxAllowed === 0;

    const addDate = () => {
        if (!dateInput || isBlocked) return;

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
            <label className="text-sm font-medium text-foreground">
                {label}
            </label>

            {/* Notice when this date type is not allowed for this exam */}
            {isBlocked && (
                <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-amber-500 mt-0.5">⚠️</span>
                    <p className="text-xs text-amber-700 leading-snug">
                        This exam type does not include <strong>{label.replace("(s)", "").trim()}</strong> remuneration.
                        No payment will be added for this.
                    </p>
                </div>
            )}

            {!disabled && !isBlocked && (
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

            {!isBlocked && (
                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-muted rounded-lg border border-dashed border-border">
                    {dates.length === 0 ? (
                        <span className="text-sm text-muted-foreground italic">No dates added</span>
                    ) : (
                        dates.map((date, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 px-3 py-1 bg-card border border-border rounded-full shadow-sm"
                            >
                                <span className="text-sm font-medium text-foreground">{date}</span>
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={() => removeDate(date)}
                                        className="text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
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
    const [norms, setNorms] = useState({ max_prep_days: null, max_cleaning_days: null });
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

                // Store norms for date section gating
                setNorms({
                    max_prep_days: batchRes.data.max_prep_days,
                    max_cleaning_days: batchRes.data.max_cleaning_days,
                });

                // Pre-fill exam_dates with the main exam_date if no dates saved yet
                const mainExamDate = data.exam_date ? data.exam_date.split("T")[0] : "";
                const defaultExamDates = data.exam_dates || (mainExamDate ? mainExamDate : "");

                setForm({
                    prep_dates: data.prep_dates || "",
                    exam_dates: defaultExamDates,
                    cleaning_dates: data.cleaning_dates || "",
                    students_per_batch: batchSize,
                    total_students: totalStudents,
                    total_batches: batches
                });
            }).catch(err => {
                console.error("Failed to load batch size:", err);
                const mainExamDate = data.exam_date ? data.exam_date.split("T")[0] : "";
                const defaultExamDates = data.exam_dates || (mainExamDate ? mainExamDate : "");
                // Fallback to default
                setForm({
                    prep_dates: data.prep_dates || "",
                    exam_dates: defaultExamDates,
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

    // Validation helper functions
    const validateDateOrder = () => {
        const prepDates = form.prep_dates ? form.prep_dates.split(",").map(d => d.trim()).filter(Boolean) : [];
        const examDates = form.exam_dates ? form.exam_dates.split(",").map(d => d.trim()).filter(Boolean) : [];
        const cleanDates = form.cleaning_dates ? form.cleaning_dates.split(",").map(d => d.trim()).filter(Boolean) : [];

        const errors = [];
        const warnings = [];

        if (examDates.length === 0) {
            errors.push("At least one examination date is required");
            return { valid: false, errors, warnings };
        }

        const minExamDate = examDates.length > 0 ? new Date(Math.min(...examDates.map(d => new Date(d)))) : null;
        const maxExamDate = examDates.length > 0 ? new Date(Math.max(...examDates.map(d => new Date(d)))) : null;

        // Rule 1: Prep dates must be before exam dates
        prepDates.forEach(prepDate => {
            if (new Date(prepDate) >= minExamDate) {
                errors.push(`Preparation date ${prepDate} must be before exam date`);
            }
        });

        // Rule 2: Cleaning dates must be on or after exam dates
        cleanDates.forEach(cleanDate => {
            if (new Date(cleanDate) < maxExamDate) {
                errors.push(`Cleaning date ${cleanDate} must be on or after exam date`);
            }
        });

        return { valid: errors.length === 0, errors, warnings };
    };

    const save = async () => {
        if (!fullExamData) return;

        // Validate dates
        const validation = validateDateOrder();

        if (!validation.valid) {
            showToast(validation.errors[0], "error");
            return;
        }

        if (validation.warnings.length > 0) {
            showToast(validation.warnings[0], "warning");
            // Continue with save despite warnings
        }

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
            <div className="p-6 bg-transparent border-0 text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                    Please complete exam details first
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-transparent">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-card-foreground">Dates & Student Information</h3>
                    <p className="text-sm text-muted-foreground">Enter examination dates and batch details</p>
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
                        maxAllowed={norms.max_prep_days}
                    />

                    <DateInputSection
                        label="Examination Date(s)"
                        value={form.exam_dates}
                        onChange={(val) => update("exam_dates", val)}
                        disabled={disabled}
                        maxAllowed={null} /* Exam dates are always allowed */
                    />

                    <DateInputSection
                        label="Cleaning Date(s)"
                        value={form.cleaning_dates}
                        onChange={(val) => update("cleaning_dates", val)}
                        disabled={disabled}
                        maxAllowed={norms.max_cleaning_days}
                    />
                </div>

                {/* Student Info Section */}
                <div className="border-t border-border pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <UsersIcon className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-card-foreground">Batch Information</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Total Students
                            </label>
                            <Input
                                disabled
                                value={form.total_students}
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                From exam details
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Students Per Batch
                            </label>
                            <div className="px-3 py-2 bg-muted border border-border rounded-lg">
                                <span className="text-sm font-semibold text-card-foreground">
                                    {form.students_per_batch}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                From batch size configuration
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Total Batches
                            </label>
                            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <span className="text-lg font-bold text-blue-700">
                                    {form.total_batches}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Auto-calculated
                            </p>
                        </div>
                    </div>
                </div>

                {!disabled && (
                    <div className="pt-4 border-t border-border">
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
        </div>
    );
}
