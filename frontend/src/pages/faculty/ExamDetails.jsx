import { useState, useEffect } from "react";
import api from "../../services/api";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

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

export default function ExamDetails({ examId, disabled, onCreated, claimFormType, onUpdated}) {
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

  /** Load exam if editing existing draft */
  useEffect(() => {
    if (!examId) return;

    api.get(`/faculty/exams/${examId}`).then((res) => {
      const data = res.data;

      setForm({
        ...data,
        exam_date: data.exam_date
          ? data.exam_date.split("T")[0] // ✅ convert ISO → yyyy-mm-dd
          : "",
      });
    });
  }, [examId]);


  const update = (k, v) => setForm({ ...form, [k]: v });

  const save = async () => {
    const studentsCount = Number(form.students_count);

    if (
      !form.exam_type ||
      !form.program ||
      !form.semester ||
      !form.academic_year ||
      !form.exam_date ||
      !form.subject_name ||
      !form.subject_code ||
      !form.level ||
      !studentsCount ||
      studentsCount <= 0
    ) {
      alert("Please fill all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        claim_form_type: claimFormType ?? "TEACHING_INTERNAL",
        students_count: studentsCount
      };

      if (!examId) {
        // CREATE
        const res = await api.post("/faculty/exams", payload);
        onCreated?.(res.data.id); // parent must store examId
      } else {
        // UPDATE
        await api.put(`/faculty/exams/${examId}`, payload);
        alert("Details updated");
        onUpdated?.();
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save exam");
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

  return (
    <Card className="space-y-4">
      <h3 className="text-lg font-semibold">Exam Details</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Exam Type */}
        <select
          disabled={disabled}
          value={form.exam_type}
          onChange={(e) => update("exam_type", e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Select Exam Type</option>
          {EXAM_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Program */}
        <select
          disabled={disabled}
          value={form.program}
          onChange={(e) => update("program", e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Program</option>
          {PROGRAMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Level */}
        <select
          disabled={disabled}
          value={form.level}
          onChange={(e) => update("level", e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Level</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <Input
            type="number"
            placeholder="Students Count"
            disabled={disabled}
            value={form.students_count}
            onChange={(e) =>
              update("students_count", e.target.value)
            }
          />


        <Input
          disabled={disabled}
          placeholder="Subject Name"
          value={form.subject_name}
          onChange={(e) => update("subject_name", e.target.value)}
        />

        <Input
          disabled={disabled}
          placeholder="Subject Code"
          value={form.subject_code}
          onChange={(e) => update("subject_code", e.target.value)}
        />

        <select
          disabled={disabled}
          value={form.semester}
          onChange={(e) => update("semester", e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Semester</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>


        <select
          disabled={disabled}
          value={form.academic_year}
          onChange={(e) => update("academic_year", e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Academic Year</option>
          {getAcademicYears().map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>


        <Input
          disabled={disabled}
          type="date"
          value={form.exam_date}
          onChange={(e) => update("exam_date", e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          disabled={disabled}
          checked={form.is_backlog}
          onChange={(e) => update("is_backlog", e.target.checked)}
        />
        Backlog / Re-ETE / Summer Exam
      </label>

      {!disabled && (
        <div className="flex justify-end">
          <Button onClick={save} disabled={loading}>
            {loading ? "Saving..." : examId ? "Update" : "Save & Continue"}
          </Button>
        </div>
      )}

    </Card>
  );
}
