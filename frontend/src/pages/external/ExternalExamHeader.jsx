export default function ExternalExamHeader({ exam }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div><b>Subject:</b> {exam.subject_name}</div>
      <div><b>Exam Type:</b> {exam.exam_type}</div>
      <div><b>Program:</b> {exam.program}</div>
      <div><b>Level:</b> {exam.level}</div>
      <div><b>Students:</b> {exam.students_count}</div>
      <div><b>Exam Date:</b> {exam.exam_date}</div>
    </div>
  );
}
