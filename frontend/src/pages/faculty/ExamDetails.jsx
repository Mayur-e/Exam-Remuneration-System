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

const PROGRAMS = ["BTECH", "MTECH", "MCA", "BVOC"];
const LEVELS = ["FY", "SY", "TY", "FINAL"];

export default function ExamDetails({ examId, disabled, onCreated }) {
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
    setLoading(true);
    try {
            if (
            !form.exam_type ||
            !form.program ||
            form.students_count === "" ||
            Number(form.students_count) <= 0
        ) {
            alert("Please fill all required fields correctly");
            return;
        }

        const payload = {
            ...form,
            students_count: Number(form.students_count),
        };

        const res = await api.post("/faculty/exams", payload);
        onCreated(res.data.id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save exam");
    } finally {
      setLoading(false);
    }
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
                setForm({
                ...form,
                students_count: e.target.value === ""
                    ? ""
                    : Number(e.target.value),
                })
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

        <Input
          disabled={disabled}
          placeholder="Semester"
          value={form.semester}
          onChange={(e) => update("semester", e.target.value)}
        />

        <Input
          disabled={disabled}
          placeholder="Academic Year (e.g. 2024-25)"
          value={form.academic_year}
          onChange={(e) => update("academic_year", e.target.value)}
        />

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

      {!examId && !disabled && (
        <div className="flex justify-end">
          <Button onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      )}
    </Card>
  );
}
