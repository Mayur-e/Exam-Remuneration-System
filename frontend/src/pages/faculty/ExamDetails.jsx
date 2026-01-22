import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

// Icons
import {
  CalendarIcon,
  UsersIcon,
  BookOpenIcon,
  GraduationCapIcon,
  ClockIcon,
  AlertCircleIcon
} from "../../components/icons/logo";

const EXAM_TYPES = [
  "PR",
  "OR",
  "TW",
  "Project_Seminar_MiniProject",
  "BTech_Project_Stage1",
  "BTech_Project_Stage2",
  "MTech_MiniProject",
  "MTech_Seminar",
  "MTech_Project_Stage1",
  "MTech_Dissertation",
  "MCA_MiniProject",
  "MCA_MajorProject",
  "Audit_Course"
];

const SEMESTERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const PROGRAMS = ["BTECH", "MTECH", "MCA", "BVOC"];
const LEVELS = ["FY", "SY", "TY", "FINAL"];

export default function ExamDetails({ examId, disabled, onCreated, claimFormType, onUpdated }) {
  const [form, setForm] = useState({
    exam_type: "",
    program: "",
    level: "",
    students_count: "",
    subject_name: "",
    subject_code: "",
    semester: "",
    academic_year: "",
    exam_date: "",
    is_backlog: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  /** Load exam if editing existing draft */
  useEffect(() => {
    if (!examId) return;

    api.get(`/faculty/exams/${examId}`).then((res) => {
      const data = res.data;
      setForm({
        ...data,
        exam_date: data.exam_date ? data.exam_date.split("T")[0] : "",
      });
    }).catch(err => {
      console.error("Failed to load exam:", err);
    });
  }, [examId]);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const studentsCount = Number(form.students_count);

    if (!form.exam_type) newErrors.exam_type = "Exam type is required";
    if (!form.program) newErrors.program = "Program is required";
    if (!form.level) newErrors.level = "Level is required";
    if (!form.semester) newErrors.semester = "Semester is required";
    if (!form.academic_year) newErrors.academic_year = "Academic year is required";
    if (!form.exam_date) newErrors.exam_date = "Exam date is required";
    if (!form.subject_name) newErrors.subject_name = "Subject name is required";
    if (!form.subject_code) newErrors.subject_code = "Subject code is required";
    if (!form.students_count) newErrors.students_count = "Students count is required";
    else if (studentsCount <= 0) newErrors.students_count = "Students count must be greater than 0";

    return newErrors;
  };

  const save = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        claim_form_type: claimFormType ?? "TEACHING_INTERNAL",
        students_count: Number(form.students_count)
      };

      if (!examId) {
        // CREATE
        const res = await api.post("/faculty/exams", payload);
        onCreated?.(res.data.id);
      } else {
        // UPDATE
        await api.put(`/faculty/exams/${examId}`, payload);
        showToast("Details updated successfully!", "success");
        onUpdated?.();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save exam details", "error");
    } finally {
      setLoading(false);
    }
  };

  const getAcademicYears = (range = 5) => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: range }, (_, i) => {
      const start = currentYear - i;
      return `${start}-${String(start + 1).slice(-2)}`;
    });
  };

  const academicYears = getAcademicYears();

  return (
    <Card className="p-6 bg-white border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <BookOpenIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Exam Details</h3>
          <p className="text-sm text-gray-600">Fill in the examination information</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1: Exam Type & Program */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <GraduationCapIcon className="w-4 h-4" />
              Exam Type *
            </label>
            <div className={`relative ${errors.exam_type ? 'border-red-500 rounded-lg' : ''}`}>
              <select
                disabled={disabled}
                value={form.exam_type}
                onChange={(e) => update("exam_type", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.exam_type ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">Select Exam Type</option>
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {errors.exam_type && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.exam_type}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Program *</label>
            <select
              disabled={disabled}
              value={form.program}
              onChange={(e) => update("program", e.target.value)}
              className={`w-full px-3 py-2 border ${errors.program ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">Select Program</option>
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.program && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.program}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Level & Students Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Level *</label>
            <select
              disabled={disabled}
              value={form.level}
              onChange={(e) => update("level", e.target.value)}
              className={`w-full px-3 py-2 border ${errors.level ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">Select Level</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            {errors.level && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.level}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <UsersIcon className="w-4 h-4" />
              Students Count *
            </label>
            <Input
              type="number"
              placeholder="Enter number of students"
              disabled={disabled}
              value={form.students_count}
              onChange={(e) => update("students_count", e.target.value)}
              className={errors.students_count ? "border-red-500" : ""}
              min="1"
            />
            {errors.students_count && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.students_count}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Subject Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Subject Name *</label>
            <Input
              disabled={disabled}
              placeholder="Enter subject name"
              value={form.subject_name}
              onChange={(e) => update("subject_name", e.target.value)}
              className={errors.subject_name ? "border-red-500" : ""}
            />
            {errors.subject_name && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.subject_name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Subject Code *</label>
            <Input
              disabled={disabled}
              placeholder="Enter subject code"
              value={form.subject_code}
              onChange={(e) => update("subject_code", e.target.value)}
              className={errors.subject_code ? "border-red-500" : ""}
            />
            {errors.subject_code && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.subject_code}
              </p>
            )}
          </div>
        </div>

        {/* Row 4: Semester & Academic Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Semester *</label>
            <select
              disabled={disabled}
              value={form.semester}
              onChange={(e) => update("semester", e.target.value)}
              className={`w-full px-3 py-2 border ${errors.semester ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">Select Semester</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.semester && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.semester}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Academic Year *</label>
            <select
              disabled={disabled}
              value={form.academic_year}
              onChange={(e) => update("academic_year", e.target.value)}
              className={`w-full px-3 py-2 border ${errors.academic_year ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {errors.academic_year && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.academic_year}
              </p>
            )}
          </div>
        </div>

        {/* Row 5: Exam Date & Backlog */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              Exam Date *
            </label>
            <Input
              disabled={disabled}
              type="date"
              value={form.exam_date}
              onChange={(e) => update("exam_date", e.target.value)}
              className={errors.exam_date ? "border-red-500" : ""}
            />
            {errors.exam_date && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.exam_date}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              Exam Type
            </label>
            <div className="flex items-center p-3 border border-gray-300 rounded-lg bg-gray-50">
              <input
                type="checkbox"
                id="is_backlog"
                disabled={disabled}
                checked={form.is_backlog}
                onChange={(e) => update("is_backlog", e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_backlog" className="ml-2 text-sm text-gray-700 cursor-pointer">
                Backlog / Re-ETE / Summer Exam
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Check this if it's a special examination
            </p>
          </div>
        </div>

        {!disabled && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-end">
              <Button
                onClick={save}
                loading={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold"
              >
                {loading ? "Saving..." : examId ? "Update Details" : "Save & Continue"}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              All fields marked with * are required
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}