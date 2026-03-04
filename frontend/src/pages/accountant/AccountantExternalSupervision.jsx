import { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AccountantExternalSupervision() {
    const navigate = useNavigate();
    const [externalExaminers, setExternalExaminers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
        const [statusFilter, setStatusFilter] = useState("");
    const [expandedRows, setExpandedRows] = useState(new Set());

    useEffect(() => {
        fetchExternalExaminers();
    }, []);

    const fetchExternalExaminers = async () => {
        try {
            const res = await api.get("/accountant/external/examiners");
            setExternalExaminers(res.data);
        } catch (err) {
            console.error("Failed to fetch external examiners:", err);
            setExternalExaminers([]);
        } finally {
            setLoading(false);
        }
    };

    
    const filteredExaminers = externalExaminers.filter(examiner => {
        const matchesSearch =
            examiner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examiner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examiner.parent_institute?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examiner.generated_by?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = true;

        const matchesStatus = !statusFilter ||
            (statusFilter === "submitted" && examiner.claim_status === "submitted") ||
            (statusFilter === "approved" && examiner.claim_status === "approved") ||
            (statusFilter === "paid" && examiner.claim_status === "paid") ||
            (statusFilter === "rejected" && examiner.claim_status === "rejected") ||
            (statusFilter === "pending" && !examiner.claim_status);

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    const getDocumentStatus = (examiner) => {
        const hasPan = !!examiner.pan_document_url;
        const hasCheque = !!examiner.cancelled_cheque_url;

        if (hasPan && hasCheque) return { label: 'Complete', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'check_circle' };
        if (!hasPan && !hasCheque) return { label: 'Pending', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', icon: 'pending' };
        return { label: 'Incomplete', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: 'error' };
    };

    const toggleRow = (examinerId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(examinerId)) {
            newExpanded.delete(examinerId);
        } else {
            newExpanded.add(examinerId);
        }
        setExpandedRows(newExpanded);
    };

    const clearFilters = () => {
        setSearchTerm("");
                setStatusFilter("");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background-light">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading external examiners...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)] pb-20">
            {/* Header section w/ Title & Overview text */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">External Supervision</h1>
                    <p className="text-slate-500 font-medium">Monitor external examiners, their documents, and claim submissions.</p>
                </div>
            </div>

            {/* Global Search and Filter Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                    {/* Search Bar */}
                    <div className="md:col-span-5 relative group">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Search Records</label>
                        <div className="absolute left-4 top-[38px] text-slate-400 group-focus-within:text-primary transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Name, email, institute..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Claim Status</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center pointer-events-none">
                                <span className="material-symbols-outlined text-[18px]">rule</span>
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="submitted">Submitted</option>
                                <option value="approved">Approved</option>
                                <option value="paid">Paid</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Clear Button */}
                    <div className="md:col-span-1 flex justify-end">
                        <button
                            onClick={clearFilters}
                            disabled={!searchTerm && !statusFilter}
                            className="w-full md:w-12 h-[46px] flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                            title="Clear Filters"
                        >
                            <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">close</span>
                            <span className="md:hidden ml-2 font-medium text-sm">Clear Filters</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* External Examiners Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {filteredExaminers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                            <span className="material-symbols-outlined text-3xl text-slate-400">person_search</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">No examiners found</h3>
                        <p className="text-slate-500 max-w-sm">
                            {externalExaminers.length === 0
                                ? "No external examiner claims have been submitted yet."
                                : "We couldn't find any examiners matching your current filters."}
                        </p>
                        {(searchTerm  || statusFilter) && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-primary font-bold text-sm hover:underline inline-flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">clear_all</span>
                                Clear All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-4 w-12 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Docs
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Examiner details
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">
                                        Institute & Status
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">
                                        Assigned Exam
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden xl:table-cell">
                                        Creator
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Docs Status
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                                        Claim
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredExaminers.map((examiner) => {
                                    const docStatus = getDocumentStatus(examiner);
                                    const isExpanded = expandedRows.has(examiner.id);

                                    return (
                                        <Fragment key={examiner.id}>
                                            <tr className={`hover:bg-slate-50/50 transition-colors ${isExpanded ? 'bg-primary/5' : ''}`}>
                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={() => toggleRow(examiner.id)}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors mx-auto ${isExpanded ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                                                            }`}
                                                        title="View documents"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">
                                                            {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                                                            <span className="material-symbols-outlined text-[20px]">badge</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-800">
                                                                {examiner.full_name}
                                                            </div>
                                                            <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                                <span className="material-symbols-outlined text-[14px]">mail</span>
                                                                {examiner.email}
                                                            </div>
                                                            {examiner.mobile && (
                                                                <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5 hidden sm:flex">
                                                                    <span className="material-symbols-outlined text-[14px]">call</span>
                                                                    {examiner.mobile}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden lg:table-cell align-top">
                                                    <div className="text-sm font-bold text-slate-700">
                                                        {examiner.parent_institute || 'N/A'}
                                                    </div>
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-[10px] font-bold uppercase tracking-wider rounded-md border text-slate-600 bg-slate-50 border-slate-200">
                                                        <span className="material-symbols-outlined text-[12px]">{examiner.is_local ? 'location_on' : 'flight'}</span>
                                                        {examiner.is_local ? 'Local' : 'Outstation'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell align-top">
                                                    <div className="text-sm font-bold text-slate-700">
                                                        {examiner.subject_name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[150px]">
                                                        {examiner.exam_type} &bull; {examiner.program}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                        #{examiner.exam_id}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden xl:table-cell align-top">
                                                    <div className="text-sm font-bold text-slate-700">{examiner.generated_by}</div>
                                                    <div className="text-xs border border-slate-200 bg-slate-50 rounded px-1.5 py-0.5 text-slate-500 inline-block mt-1 font-medium truncate max-w-[100px]">{examiner.department}</div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${docStatus.bg} ${docStatus.color} border ${docStatus.border} rounded-md mb-2 w-max`}>
                                                        <span className="material-symbols-outlined text-[14px]">{docStatus.icon}</span>
                                                        <span className="text-[11px] font-bold uppercase tracking-widest">{docStatus.label}</span>
                                                    </div>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {examiner.pan_document_url && (
                                                            <span className="w-5 h-5 flex items-center justify-center rounded bg-emerald-100 text-emerald-600 border border-emerald-200" title="PAN Document">
                                                                <span className="material-symbols-outlined text-[12px] font-bold">description</span>
                                                            </span>
                                                        )}
                                                        {examiner.cancelled_cheque_url && (
                                                            <span className="w-5 h-5 flex items-center justify-center rounded bg-emerald-100 text-emerald-600 border border-emerald-200" title="Cancelled Cheque">
                                                                <span className="material-symbols-outlined text-[12px] font-bold">account_balance</span>
                                                            </span>
                                                        )}
                                                        {examiner.travel_proof_url && (
                                                            <span className="w-5 h-5 flex items-center justify-center rounded bg-emerald-100 text-emerald-600 border border-emerald-200" title="Travel Proof">
                                                                <span className="material-symbols-outlined text-[12px] font-bold">directions_car</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right align-middle">
                                                    <div className="flex flex-col items-end gap-2">
                                                        {examiner.claim_status ? (
                                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border ${examiner.claim_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                    examiner.claim_status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                        examiner.claim_status === 'submitted' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                                            examiner.claim_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                                'bg-slate-50 text-slate-700 border-slate-200'
                                                                }`}>
                                                                {examiner.claim_status}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border bg-slate-50 text-slate-500 border-slate-200">
                                                                Pending
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => navigate(`/accountant/bills/${examiner.exam_id}`)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-lg text-xs font-bold shadow-sm transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Document Row */}
                                            {isExpanded && (
                                                <tr className="bg-slate-50/80 border-b border-primary/20 shadow-inner">
                                                    <td colSpan="7" className="px-6 py-6 border-l-4 border-l-primary">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <span className="material-symbols-outlined text-primary text-[20px]">folder_open</span>
                                                            <h4 className="text-sm font-bold text-slate-800">Uploaded Documents</h4>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {/* PAN Document */}
                                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                                                                        <span className="material-symbols-outlined text-[14px]">credit_card</span>
                                                                    </div>
                                                                    <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider">PAN Card</h5>
                                                                </div>
                                                                <div className="p-4 flex-grow flex flex-col space-y-3">
                                                                    {examiner.pan_document_url ? (
                                                                        <>
                                                                            <a
                                                                                href={`http://localhost:5000${examiner.pan_document_url}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="block relative aspect-video bg-slate-100 rounded-lg border border-slate-200 overflow-hidden group/img"
                                                                            >
                                                                                <img
                                                                                    src={`http://localhost:5000${examiner.pan_document_url}`}
                                                                                    className="w-full h-full object-contain"
                                                                                    alt="PAN Card"
                                                                                />
                                                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                                    <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">open_in_new</span>
                                                                                </div>
                                                                            </a>
                                                                            <div className="mt-auto pt-2 border-t border-slate-100">
                                                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">PAN Number</p>
                                                                                <p className="text-sm font-mono font-bold text-slate-800 uppercase">{examiner.pan_number || 'NOT PROVIDED'}</p>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex-grow flex flex-col items-center justify-center py-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                                                            <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">image_not_supported</span>
                                                                            <p className="text-xs font-medium text-slate-500">Not uploaded</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Cancelled Cheque */}
                                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                                        <span className="material-symbols-outlined text-[14px]">account_balance</span>
                                                                    </div>
                                                                    <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Cancelled Cheque</h5>
                                                                </div>
                                                                <div className="p-4 flex-grow flex flex-col space-y-3">
                                                                    {examiner.cancelled_cheque_url ? (
                                                                        <>
                                                                            <a
                                                                                href={`http://localhost:5000${examiner.cancelled_cheque_url}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="block relative aspect-video bg-slate-100 rounded-lg border border-slate-200 overflow-hidden group/img"
                                                                            >
                                                                                <img
                                                                                    src={`http://localhost:5000${examiner.cancelled_cheque_url}`}
                                                                                    className="w-full h-full object-contain"
                                                                                    alt="Cancelled Cheque"
                                                                                />
                                                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                                    <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">open_in_new</span>
                                                                                </div>
                                                                            </a>
                                                                            <div className="mt-auto pt-2 border-t border-slate-100">
                                                                                <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider flex items-center gap-1">
                                                                                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                                                    Document present
                                                                                </p>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex-grow flex flex-col items-center justify-center py-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                                                            <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">image_not_supported</span>
                                                                            <p className="text-xs font-medium text-slate-500">Not uploaded</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Travel Proof */}
                                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center">
                                                                        <span className="material-symbols-outlined text-[14px]">directions_car</span>
                                                                    </div>
                                                                    <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Travel Proof</h5>
                                                                </div>
                                                                <div className="p-4 flex-grow flex flex-col space-y-3">
                                                                    {examiner.travel_proof_url ? (
                                                                        <>
                                                                            <a
                                                                                href={`http://localhost:5000${examiner.travel_proof_url}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="block relative aspect-video bg-slate-100 rounded-lg border border-slate-200 overflow-hidden group/img"
                                                                            >
                                                                                <img
                                                                                    src={`http://localhost:5000${examiner.travel_proof_url}`}
                                                                                    className="w-full h-full object-contain"
                                                                                    alt="Travel Proof"
                                                                                />
                                                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                                    <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">open_in_new</span>
                                                                                </div>
                                                                            </a>
                                                                            <div className="mt-auto pt-2 border-t border-slate-100">
                                                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Allowance Claimed</p>
                                                                                <p className="text-sm font-bold text-slate-800">₹{examiner.travel_allowance || 0} <span className="text-xs font-medium text-slate-500 ml-1">({examiner.is_local ? 'Local' : 'Outstation'})</span></p>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex-grow flex flex-col items-center justify-center py-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                                                            {examiner.is_local ? (
                                                                                <>
                                                                                    <span className="material-symbols-outlined text-3xl text-emerald-300 mb-2">location_on</span>
                                                                                    <p className="text-xs font-medium text-slate-500 text-center px-4">Not required for local<br />(base allowance applies)</p>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">image_not_supported</span>
                                                                                    <p className="text-xs font-medium text-slate-500">Not uploaded</p>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer Count */}
                {filteredExaminers.length > 0 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                            Showing {filteredExaminers.length} of {externalExaminers.length} records
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
