import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Button } from "../../components/ui/button";
import ExternalExaminerForm from "./ExternalExaminerForm";

export default function ExternalTeachingForm() {
  const { token } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [facultyName, setFacultyName] = useState("External Examiner");

  useEffect(() => {
    api
      .get(`/external/claim/${token}`)
      .then(res => setExam(res.data))
      .catch(() => alert("Invalid or expired link"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!exam) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl">error</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-800">Invalid or Expired Link</h2>
      <p className="text-slate-500 mt-2">This claim link is no longer valid or has already been submitted.</p>
    </div>
  );

  if (submitted) return <SuccessScreen />;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).replace(/ /g, ' ');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-display flex flex-col items-center pb-16">
      {/* Top Navbar */}
      <div className="w-full bg-white border-b border-slate-200 py-3 px-6 lg:px-12 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1e3a8a] text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-inner">
            P
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-slate-900 leading-snug">Faculty Portal</h1>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">Pimpri Chinchwad College of Engineering</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-slate-400 text-[20px] cursor-pointer hover:text-slate-600">dark_mode</span>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f1f5f9] flex items-center justify-center text-blue-700 font-bold border border-slate-200">
              {facultyName.charAt(0) !== 'E' ? facultyName.charAt(0) : 'E'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">{facultyName !== 'External Examiner' ? `Prof. ${facultyName}` : facultyName}</p>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">External Examiner</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl px-4 mt-8 space-y-10">
        {/* Exam Information Header */}
        <div className="bg-white rounded-2xl border border-slate-200 px-8 py-6 flex flex-wrap gap-x-12 gap-y-6 shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1.5">Subject</p>
            <p className="text-[15px] font-semibold text-slate-800">{exam.subject_name}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1.5">Exam Type</p>
            <p className="text-[15px] font-semibold text-slate-800">{exam.exam_type}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1.5">Program</p>
            <p className="text-[15px] font-semibold text-slate-800">{exam.program}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1.5">Level</p>
            <p className="text-[15px] font-semibold text-slate-800">{exam.level}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1.5">Students</p>
            <p className="text-[15px] font-semibold text-slate-800">{exam.students_count} Candidates</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1.5">Exam Date</p>
            <p className="text-[15px] font-semibold text-slate-800">{formatDate(exam.exam_date)}</p>
          </div>
        </div>

        {/* Wizard Form Component */}
        <ExternalExaminerForm
          token={token}
          onSubmitted={() => setSubmitted(true)}
          onNameChange={(name) => {
            if (name && name.trim().length > 0) {
              setFacultyName(name);
            }
          }}
        />
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-xs font-medium text-slate-500">© 2026 Pimpri Chinchwad College of Engineering. All rights reserved.</p>
        <p className="text-[11px] text-slate-400 mt-2 font-medium">Designed for Academic Excellence & Transparency</p>
        
      </div>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Claim Submitted Successfully</h3>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Thank you. Your examination remuneration claim and documents have been securely submitted to the accounts department for verification.
        </p>
        <p className="text-sm font-semibold text-slate-400">You may now close this window.</p>
      </div>
    </div>
  );
}
