import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function FacultyProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/accountant/faculty/${id}`);
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch faculty profile:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background-light">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading faculty profile...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background-light px-4">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100">
                    <span className="material-symbols-outlined text-3xl">error</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Faculty Not Found</h2>
                <p className="text-slate-500 mb-6 text-center max-w-md">We couldn't find the requested faculty profile. It may have been removed or the ID is incorrect.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    Go Back
                </button>
            </div>
        );
    }

    const { faculty, bank, claims, rejectionHistory, externalLinks } = data;

    const tabs = [
        { id: "overview", label: "Overview", icon: "person" },
        { id: "claims", label: "Claims History", icon: "receipt_long", count: claims?.length || 0 },
        { id: "rejections", label: "Rejections", icon: "cancel", count: rejectionHistory?.length || 0 },
        { id: "external", label: "External Links", icon: "link", count: externalLinks?.length || 0 }
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 font-display bg-background-light min-h-[calc(100vh-4rem)] pb-20">
            {/* Header & Back Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{faculty.name}</h1>
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border ${faculty.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {faculty.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">mail</span> {faculty.email}</span>
                            <span className="hidden sm:inline text-slate-300">&bull;</span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">domain</span> {faculty.department}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Flat Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 border ${isActive
                                    ? 'bg-primary text-white border-primary shadow-md'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px] ml-1.5 ${isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "overview" && (
                    <OverviewTab faculty={faculty} bank={bank} claims={claims} rejectionHistory={rejectionHistory} externalLinks={externalLinks} />
                )}
                {activeTab === "claims" && (
                    <ClaimsTab claims={claims} />
                )}
                {activeTab === "rejections" && (
                    <RejectionsTab rejectionHistory={rejectionHistory} />
                )}
                {activeTab === "external" && (
                    <ExternalLinksTab externalLinks={externalLinks} />
                )}
            </div>
        </div>
    );
}

// Overview Tab Component
function OverviewTab({ faculty, bank, claims, rejectionHistory, externalLinks }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Personal Info</h3>
                </div>
                <div className="p-5 flex-grow font-medium">
                    <InfoRow icon="badge" label="Name" value={faculty.name} />
                    <InfoRow icon="mail" label="Email" value={faculty.email} />
                    <InfoRow icon="call" label="Mobile" value={faculty.mobile || 'N/A'} />
                    <InfoRow icon="description" label="PAN Card" value={faculty.pan_card || 'N/A'} isMono />
                    <InfoRow icon="domain" label="Department" value={faculty.department || 'N/A'} />
                    <InfoRow icon="work" label="Role" value={faculty.role} />

                </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">account_balance</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Bank Details</h3>
                </div>
                <div className="p-5 flex-grow font-medium flex flex-col">
                    {bank ? (
                        <>
                            <InfoRow icon="person" label="Account Holder" value={bank.account_holder_name} />
                            <InfoRow icon="account_balance" label="Bank Name" value={bank.bank_name} />
                            <InfoRow icon="store" label="Branch" value={bank.branch_name} />
                            <InfoRow icon="pin" label="Account Number" value={bank.account_number} isMono />
                            <InfoRow icon="qr_code" label="IFSC Code" value={bank.ifsc_code} isMono />
                            <InfoRow icon="account_balance_wallet" label="Account Type" value={bank.account_type} />
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center py-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">money_off</span>
                            <p className="text-sm font-bold text-slate-600 mb-1">No Bank Details</p>
                            <p className="text-xs text-slate-400">Faculty hasn't added bank information yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics */}
            <div className="bg-primary/5 rounded-2xl border border-primary/20 shadow-sm flex flex-col overflow-hidden">
                <div className="px-5 py-4 bg-white/50 border-b border-primary/10 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">insights</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Activity Stats</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Claims</span>
                            <span className="text-2xl font-black text-slate-800 tracking-tight">{claims?.length || 0}</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gen Links</span>
                            <span className="text-2xl font-black text-slate-800 tracking-tight">{externalLinks?.length || 0}</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-red-500">cancel</span>
                            Rejected
                        </span>
                        <span className="text-2xl font-black text-red-600 tracking-tight">{rejectionHistory?.length || 0}</span>
                    </div>

                    <div className="mt-4 pt-5 border-t border-primary/10 flex flex-col">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Estimated Earnings</span>
                        <span className="text-3xl font-black text-primary tracking-tight flex items-baseline gap-1">
                            <span className="text-lg">₹</span>
                            {claims?.reduce((sum, claim) => sum + Number(claim.total_amount || 0), 0).toLocaleString('en-IN') || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Claims Tab Component
function ClaimsTab({ claims }) {
    if (!claims || claims.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                    <span className="material-symbols-outlined text-3xl text-slate-400">receipt_long</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No claims found</h3>
                <p className="text-slate-500 max-w-sm">This faculty member hasn't submitted any claims yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
                <div>
                    <h3 className="font-bold text-slate-800">All Claims</h3>
                    <p className="text-xs text-slate-500 font-medium">{claims.length} claims submitted</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">ID</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {claims.map((claim) => (
                            <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">#{claim.id}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-slate-700">{claim.subject_name || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                                        {claim.exam_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border inline-flex items-center gap-1 max-w-max ${claim.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        claim.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            claim.status === 'submitted' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                claim.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-slate-50 text-slate-700 border-slate-200'
                                        }`}>
                                        <span className="material-symbols-outlined text-[12px]">
                                            {claim.status === 'paid' ? 'check_circle' : claim.status === 'rejected' ? 'cancel' : claim.status === 'approved' ? 'verified' : 'pending'}
                                        </span>
                                        {claim.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-black text-slate-800">₹{Number(claim.total_amount || 0).toLocaleString('en-IN')}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px] text-slate-400">calendar_today</span>
                                        {new Date(claim.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Rejections Tab Component
function RejectionsTab({ rejectionHistory }) {
    if (!rejectionHistory || rejectionHistory.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100">
                    <span className="material-symbols-outlined text-3xl text-emerald-500">task_alt</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No rejections</h3>
                <p className="text-slate-500 max-w-sm">All submitted claims have been processed without rejections.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500 text-2xl">cancel</span>
                <div>
                    <h3 className="font-bold text-slate-800">Rejection History</h3>
                    <p className="text-xs text-slate-500 font-medium">{rejectionHistory.length} rejected records found</p>
                </div>
            </div>
            <div className="p-6">
                <div className="grid gap-4">
                    {rejectionHistory.map((rejection, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden flex flex-col md:flex-row shadow-red-500/5">
                            <div className="bg-red-50 md:w-48 p-4 border-b md:border-b-0 md:border-r border-red-100 flex flex-col justify-center">
                                <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1 block">Claim ID</span>
                                <span className="text-lg font-mono font-black text-red-700">#{rejection.id}</span>
                                <div className="mt-3 text-xs font-bold text-slate-600 flex items-center gap-1.5 bg-white/50 px-2 py-1.5 rounded border border-red-100/50 w-max">
                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                    {new Date(rejection.action_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                            <div className="p-4 flex-grow flex flex-col">
                                <div className="mb-3">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">Subject Name</span>
                                    <span className="text-sm font-bold text-slate-800">{rejection.subject_name}</span>
                                </div>

                                <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 mt-auto">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">format_quote</span>
                                        Reason provided
                                    </span>
                                    <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap">{rejection.comment}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// External Links Tab Component
function ExternalLinksTab({ externalLinks }) {
    if (!externalLinks || externalLinks.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                    <span className="material-symbols-outlined text-3xl text-slate-400">link_off</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No external links</h3>
                <p className="text-slate-500 max-w-sm">No external supervision links have been generated for this faculty member yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">link</span>
                <div>
                    <h3 className="font-bold text-slate-800">Generated Links</h3>
                    <p className="text-xs text-slate-500 font-medium">{externalLinks.length} links recorded</p>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {externalLinks.map((link, idx) => {
                        const isExpired = new Date(link.expires_at) < new Date();
                        const isUsed = link.used;
                        let statusConfig = { bg: 'bg-blue-50', color: 'text-blue-700', border: 'border-blue-200', text: 'Active', icon: 'check_circle' };

                        if (isUsed) {
                            statusConfig = { bg: 'bg-emerald-50', color: 'text-emerald-700', border: 'border-emerald-200', text: 'Used', icon: 'task_alt' };
                        } else if (isExpired) {
                            statusConfig = { bg: 'bg-red-50', color: 'text-red-700', border: 'border-red-200', text: 'Expired', icon: 'timer_off' };
                        }

                        return (
                            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col group hover:shadow-md hover:border-slate-300 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 pr-4">
                                        <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">
                                            {link.subject_name || 'Generic Link'}
                                        </h4>
                                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">calendar_add_on</span>
                                            Created: {new Date(link.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border flex items-center gap-1 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                        <span className="material-symbols-outlined text-[12px]">{statusConfig.icon}</span>
                                        {statusConfig.text}
                                    </span>
                                </div>
                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                                        <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Expires On</p>
                                        <p className="text-xs font-bold text-slate-700">{new Date(link.expires_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Helper Component for InfoRow
function InfoRow({ icon, label, value, isMono = false }) {
    return (
        <div className="flex items-center gap-3 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 -mx-2 rounded-lg">
            <span className="material-symbols-outlined text-[18px] text-slate-400">{icon}</span>
            <div className="flex-grow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
                <span className={`text-sm ${isMono ? 'font-mono text-slate-600' : 'text-slate-800'} font-bold`}>{value}</span>
            </div>
        </div>
    );
}
