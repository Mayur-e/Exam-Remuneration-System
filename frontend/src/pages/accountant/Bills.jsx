import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";

export default function Bills() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status") || "";
  const examType = searchParams.get("exam_type") || "";
  const claimFormType = searchParams.get("claim_form_type") || "";

  useEffect(() => {
    fetchClaims();
  }, [status, examType, claimFormType]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (examType) params.append("exam_type", examType);
      if (claimFormType) params.append("claim_form_type", claimFormType);

      const res = await api.get(`/accountant/claims?${params.toString()}`);
      setClaims(res.data);
    } catch (err) {
      console.error("Failed to fetch claims:", err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.exam_type?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getClaimTypeBadge = (type) => {
    const badges = {
      'TEACHING_INTERNAL': { label: 'Internal', color: 'bg-blue-50 text-blue-700' },
      'TEACHING_EXTERNAL': { label: 'External', color: 'bg-emerald-50 text-emerald-700' },
      'NON_TEACHING': { label: 'Non-Teaching', color: 'bg-purple-50 text-purple-700' }
    };
    return badges[type] || { label: type, color: 'bg-slate-50 text-slate-700' };
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchTerm("");
  };

  const hasActiveFilters = status || examType || claimFormType;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)]">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bills Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review and process department claim payments</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl bg-primary/10 p-2 rounded-xl">receipt_long</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
            <span className="material-symbols-outlined text-amber-500 text-[18px]">pending_actions</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {claims.filter(c => ['submitted', 'SENT_TO_BILLING'].includes(c.status)).length}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Paid</p>
            <span className="material-symbols-outlined text-blue-500 text-[18px]">payments</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {claims.filter(c => ['paid'].includes(c.status?.toLowerCase())).length}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</p>
            <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {claims.filter(c => ['approved'].includes(c.status?.toLowerCase())).length}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md border-l-4 border-l-red-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
            <span className="material-symbols-outlined text-red-500 text-[18px]">cancel</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {claims.filter(c => ['rejected', 'coordinator_rejected'].includes(c.status?.toLowerCase())).length}
          </h3>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">

        {/* Status Pills */}
        <div className="flex gap-1 p-1 bg-slate-50 rounded-lg flex-1 xl:flex-none flex-wrap hide-scrollbar overflow-x-auto">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${!status ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            All Claims
          </button>
          <button
            onClick={() => setSearchParams({ status: "submitted" })}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${status === "submitted" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Pending
          </button>
          <button
            onClick={() => setSearchParams({ status: "approved" })}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${status === "approved" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Approved
          </button>
          <button
            onClick={() => setSearchParams({ status: "paid" })}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${status === "paid" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Paid
          </button>
          <button
            onClick={() => setSearchParams({ status: "rejected" })}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${status === "rejected" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Rejected
          </button>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto overflow-hidden">
          <div className="relative flex-1 xl:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search by faculty, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-700"
            />
          </div>
          {hasActiveFilters || searchTerm ? (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shadow-sm"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Faculty Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Duty Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">folder_off</span>
                    <p className="font-medium">No claims match the given filters</p>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const badge = getClaimTypeBadge(claim.claim_form_type);
                  return (
                    <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {(claim.claimant_name || claim.faculty_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 text-sm line-clamp-1">{claim.claimant_name || claim.faculty_name || 'Unknown'}</p>
                            {claim.claim_form_type === 'TEACHING_EXTERNAL' && claim.faculty_name && (
                              <p className="text-xs text-blue-600 font-medium mt-0.5 line-clamp-1">Ref: {claim.faculty_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-[16px] shrink-0">book</span>
                          <div>
                            <p className="text-sm font-medium text-slate-600 line-clamp-2">{claim.subject_name || 'N/A'}</p>
                            {claim.program && (
                              <p className="text-[10px] text-slate-400 mt-0.5">{claim.program} {claim.level}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold uppercase">{claim.exam_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 whitespace-nowrap">
                          ₹{Number(claim.total_amount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold leading-none capitalize ${claim.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          claim.status === 'approved' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            claim.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${claim.status === 'paid' ? 'bg-emerald-500' :
                            claim.status === 'approved' ? 'bg-blue-500' :
                              claim.status === 'rejected' ? 'bg-red-500' :
                                'bg-amber-500'
                            }`}></span>
                          {claim.status === 'submitted' || claim.status === 'SENT_TO_BILLING' ? 'Pending' : claim.status}
                        </span>
                        {claim.min_applied && (
                          <p className="text-[10px] text-orange-600 font-bold mt-1">Min applied</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/accountant/bills/${claim.id}`)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-primary/5 text-sm font-bold rounded-lg transition-all shadow-sm group-hover:shadow whitespace-nowrap"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info matching UI */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
          <p className="text-xs font-semibold text-slate-500">
            Showing {filteredClaims.length} of {claims.length} claims
          </p>
        </div>
      </div>

    </div>
  );
}
