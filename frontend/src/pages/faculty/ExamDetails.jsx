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
  SearchIcon,
  XIcon
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
    course_id: "",
    semester: "",
    academic_year: "",
    exam_date: "",
    is_backlog: false,
    second_examiner: ""
  });

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  // Load Exam Data
  useEffect(() => {
    if (!examId) return;

    api.get(`/faculty/exams/${examId}`).then((res) => {
      const data = res.data;
      setForm({
        ...data,
        exam_date: data.exam_date ? data.exam_date.split("T")[0] : "",
        second_examiner: data.second_examiner || "",
        students_count: data.students_count || "",
        subject_code: data.subject_code || "",
        subject_name: data.subject_name || "",
        course_id: data.course_id || "",
      });
      // Set initial search term for display
      if (data.subject_code && data.subject_name) {
        setSearchTerm(`${data.subject_code} - ${data.subject_name}`);
      }
    }).catch(err => {
      console.error("Failed to load exam:", err);
    });
  }, [examId]);

  // Fetch Courses
  useEffect(() => {
    api.get('/coordinator/courses')
      .then(res => {
        setCourses(res.data);
      })
      .catch(err => console.error("Failed to fetch courses:", err));
  }, []);

  // Close dropdown when clicking outside
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setShowResults(true);

    if (!term.trim()) {
      setFilteredCourses([]);
      return;
    }

    const lowerTerm = term.toLowerCase().trim();
    const filtered = courses.filter(course =>
      course.code?.toLowerCase().includes(lowerTerm) ||
      course.name?.toLowerCase().includes(lowerTerm)
    );
    setFilteredCourses(filtered);

    // Clear selection if typing
    update("course_id", "");
    update("subject_code", "");
    update("subject_name", "");
  };

  const selectCourse = (course) => {
    update("course_id", course.id);
    update("subject_code", course.code);
    update("subject_name", course.name);
    setSearchTerm(`${course.code} - ${course.name}`);
    setShowResults(false);
    setFilteredCourses([]);
  };

  const clearSelection = () => {
    update("course_id", "");
    update("subject_code", "");
    update("subject_name", "");
    setSearchTerm("");
    setFilteredCourses([]);
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

    // Validate Course
    if (!form.course_id && !form.subject_code) newErrors.course_id = "Please select a course from the list";
    // Also check if user typed but didn't select
    if (searchTerm && !form.course_id) newErrors.course_id = "Please select a valid course from the list";

    if (!form.students_count) newErrors.students_count = "Students count is required";
    else if (studentsCount <= 0) newErrors.students_count = "Students count must be greater than 0";

    return newErrors;
  };

  const save = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Please fix the errors before saving", "error");
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
            <label className="text-sm font-medium text-foreground">Program *</label>
            <select
              disabled={disabled}
              value={form.program}
              onChange={(e) => update("program", e.target.value)}
              className={`w-full px-3 py-2 border ${errors.program ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg bg-background dark:bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed`}
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
            <label className="text-sm font-medium text-foreground">Level *</label>
            <select
              disabled={disabled}
              value={form.level}
              onChange={(e) => update("level", e.target.value)}
              className={`w-full px-3 py-2 border ${errors.level ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg bg-background dark:bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed`}
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

        {/* Row 3: Course Selection (Searchable) */}
        <div className="grid grid-cols-1 gap-6" ref={wrapperRef}>
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              Course / Subject *
            </label>
            <div className="relative">
              <Input
                disabled={disabled}
                placeholder="Search course by code or name..."
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => {
                  if (!searchTerm && courses.length > 0) {
                    setFilteredCourses(courses);
                    setShowResults(true);
                  }
                }}
                className={`pr-10 ${errors.course_id ? "border-red-500" : ""}`}
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center gap-2">
                {searchTerm && !disabled && (
                  <button onClick={clearSelection} type="button" className="hover:text-foreground">
                    <span className="sr-only">Clear</span>
                    ✕
                  </button>
                )}
                {!searchTerm && <SearchIcon className="w-4 h-4" />}
              </div>
            </div>

            {/* Dropdown Results */}
            {showResults && !disabled && (
              <div className="absolute z-50 left-0 top-full mt-1 bg-card dark:bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-full">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => selectCourse(course)}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-0 border-gray-100 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-400">
                          {course.name}
                        </span>
                        <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded ml-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-800 dark:group-hover:text-blue-300">
                          {course.code}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircleIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">No courses found</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {errors.course_id && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircleIcon className="w-3 h-3" />
                {errors.course_id}
              </p>
            )}
          </div>
        </div>

        {/* Row 3.5: Second Examiner (Optional) - Only for Teaching claims */}
        {claimFormType !== "NON_TEACHING" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Second Examiner Name (if any)
            </label>
            <Input
              disabled={disabled}
              placeholder="Enter name of second examiner (optional)"
              value={form.second_examiner}
              onChange={(e) => update("second_examiner", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank if there is no second examiner
            </p>
          </div>
        )}

        {/* Row 4: Semester & Academic Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Semester *</label>
            <select
              disabled={disabled}
              value={form.semester}
              onChange={(e) => update("semester", e.target.value)}
              className={`w-full px-3 py-2 border ${errors.semester ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg bg-background dark:bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed`}
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
            <label className="text-sm font-medium text-foreground">Academic Year *</label>
            <select
              disabled={disabled}
              value={form.academic_year}
              onChange={(e) => update("academic_year", e.target.value)}
              className={`w-full px-3 py-2 border ${errors.academic_year ? 'border-red-500 dark:border-red-400' : 'border-border'} rounded-lg bg-background dark:bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed`}
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
              <label htmlFor="is_backlog" className="ml-2 text-sm text-foreground cursor-pointer">
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