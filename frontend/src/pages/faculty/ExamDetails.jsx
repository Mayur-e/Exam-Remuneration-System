import { useState, useEffect, useRef } from "react";
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
  AlertCircleIcon,
  SearchIcon
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
    is_backlog: false,
    second_examiner: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  // Search State
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState(null); // 'code' or 'name'
  const searchTimeoutRef = useRef(null);
  const wrapperRef = useRef(null);

  /** Load exam if editing existing draft */
  useEffect(() => {
    if (!examId) return;

    api.get(`/faculty/exams/${examId}`).then((res) => {
      const data = res.data;
      setForm({
        ...data,
        exam_date: data.exam_date ? data.exam_date.split("T")[0] : "",
        second_examiner: data.second_examiner || "", // Ensure not null
        students_count: data.students_count || "",
        subject_code: data.subject_code || "",
        subject_name: data.subject_name || "",
      });
      // Mark subject as validated since it came from database
      if (data.subject_code) {
        setSubjectValidated(true);
      }
    }).catch(err => {
      console.error("Failed to load exam:", err);
    });
  }, [examId]);

  // Close results on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const [subjectValidated, setSubjectValidated] = useState(false);

  const handleSearch = (query, field) => {
    update(field, query);
    setActiveSearchField(field);

    // Mark subject as not validated when manually typing
    if (field === 'subject_code' || field === 'subject_name') {
      setSubjectValidated(false);
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/faculty/subjects?query=${encodeURIComponent(query)}`);
        setSearchResults(res.data);
        setShowResults(true);
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 300);
  };

  const selectSubject = (subject) => {
    update("subject_code", subject.code);
    update("subject_name", subject.name);
    setShowResults(false);
    setSearchResults([]);
    setSubjectValidated(true); // Mark as validated when selected from dropdown
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
    else if (!subjectValidated) newErrors.subject_name = "Please select a subject from the dropdown";
    if (!form.subject_code) newErrors.subject_code = "Subject code is required";
    else if (!subjectValidated) newErrors.subject_code = "Please select a subject from the dropdown";
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
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <BookOpenIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-card-foreground">Exam Details</h3>
          <p className="text-sm text-muted-foreground">Fill in the examination information</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1: Exam Type & Program */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              <GraduationCapIcon className="w-4 h-4" />
              Exam Type *
            </label>
            <div className={`relative ${errors.exam_type ? 'border-red-500 rounded-lg' : ''}`}>
              <select
                disabled={disabled}
                value={form.exam_type}
                onChange={(e) => update("exam_type", e.target.value)}
                className={`w-full px-3 py-2 border ${errors.exam_type ? 'border-red-500' : 'border-border'} rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed`}
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
        </div>

        {/* Row 3: Subject Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative" ref={wrapperRef}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Course Code *
              {activeSearchField === 'subject_code' && loading && !showResults && <span className="text-xs text-gray-400">Searching...</span>}
            </label>
            <div className="relative">
              <Input
                disabled={disabled}
                placeholder="Enter subject code"
                value={form.subject_code}
                onChange={(e) => handleSearch(e.target.value, "subject_code")}
                onFocus={() => {
                  setActiveSearchField("subject_code");
                  if (form.subject_code?.length >= 2) handleSearch(form.subject_code, "subject_code");
                }}
                className={errors.subject_code ? "border-red-500 pr-10" : "pr-10"}
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon className="w-4 h-4" />
              </div>
            </div>
            {errors.subject_code && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.subject_code}
              </p>
            )}
            {!subjectValidated && form.subject_code && !errors.subject_code && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                Please select a subject from the dropdown to ensure it exists in the system
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Course Name *
            </label>
            <div className="relative">
              <Input
                disabled={disabled}
                placeholder="Enter subject name"
                value={form.subject_name}
                onChange={(e) => handleSearch(e.target.value, "subject_name")}
                onFocus={() => {
                  setActiveSearchField("subject_name");
                  if (form.subject_name?.length >= 2) handleSearch(form.subject_name, "subject_name");
                }}
                className={errors.subject_name ? "border-red-500 pr-10" : "pr-10"}
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon className="w-4 h-4" />
              </div>
            </div>
            {errors.subject_name && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.subject_name}
              </p>
            )}
            {!subjectValidated && form.subject_name && !errors.subject_name && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                Please select a subject from the dropdown to ensure it exists in the system
              </p>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && !disabled && (
            <div className="absolute z-50 left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-full">
              {searchResults.length > 0 ? (
                searchResults.map((subject, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSubject(subject)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-0 border-gray-100 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-800 group-hover:text-blue-700">
                        {subject.name}
                      </span>
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded ml-2 group-hover:bg-blue-100 group-hover:text-blue-800">
                        {subject.code}
                      </span>
                    </div>
                    {subject.department && (
                      <div className="text-xs text-gray-500 mt-1">
                        {subject.department} • {subject.type}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircleIcon className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">No subjects found matching your search</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Try a different course code or name</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
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
            {!errors.students_count && form.students_count && form.subject_code && form.semester && form.academic_year && (
              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded border border-blue-200">
                ℹ️ <strong>Note:</strong> Ensure this count doesn't exceed the registered student limit for <strong>{form.subject_code}</strong> in Semester <strong>{form.semester}</strong>, {form.academic_year}. The system will validate this when you save.
              </p>
            )}
          </div>
        </div>

        {/* Row 3.5: Second Examiner (Optional) - Only for Teaching claims */}
        {claimFormType !== "NON_TEACHING" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Second Examiner Name (if any)
            </label>
            <Input
              disabled={disabled}
              placeholder="Enter name of second examiner (optional)"
              value={form.second_examiner}
              onChange={(e) => update("second_examiner", e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Leave blank if there is no second examiner
            </p>
          </div>
        )}

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