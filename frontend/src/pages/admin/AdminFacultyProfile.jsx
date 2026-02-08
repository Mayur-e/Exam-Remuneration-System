import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

// Icons
import {
    ArrowLeftIcon,
    UserIcon,
    BuildingOfficeIcon,
    FileTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CurrencyRupeeIcon
} from "../../components/icons/logo";

export default function AdminFacultyProfile() {
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
            const res = await api.get(`/admin/faculty/${id}`);
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch faculty profile:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading faculty profile...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-12 text-center">
                <p className="text-red-600">Faculty not found</p>
                <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </div>
        );
    }

    const { faculty, bank, claims, rejectionHistory, externalLinks } = data;

    const tabs = [
        { id: "overview", label: "Overview", icon: UserIcon },
        { id: "claims", label: "Claims History", icon: FileTextIcon, count: claims?.length || 0 },
        { id: "rejections", label: "Rejections", icon: XCircleIcon, count: rejectionHistory?.length || 0 },
        { id: "external", label: "External Links", icon: FileTextIcon, count: externalLinks?.length || 0 }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{faculty.name}</h1>
                        <p className="text-sm text-muted-foreground">{faculty.email} • {faculty.department}</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${faculty.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    {faculty.is_active ? 'Active' : 'Inactive'}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-accent text-muted-foreground'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
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
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-purple-600" />
                    Personal Information
                </h3>
                <div className="space-y-3 text-sm">
                    <InfoRow label="Name" value={faculty.name} />
                    <InfoRow label="Email" value={faculty.email} />
                    <InfoRow label="Mobile" value={faculty.mobile || 'N/A'} />
                    <InfoRow label="PAN Card" value={faculty.pan_card || 'N/A'} />
                    <InfoRow label="Department" value={faculty.department || 'N/A'} />
                    <InfoRow label="Role" value={faculty.role} />
                    <InfoRow label="Status" value={faculty.is_active ? 'Active' : 'Inactive'} />
                    <InfoRow label="Joined" value={new Date(faculty.created_at).toLocaleDateString()} />
                </div>
            </Card>

            {/* Bank Details */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                    Bank Details
                </h3>
                {bank ? (
                    <div className="space-y-3 text-sm">
                        <InfoRow label="Account Holder" value={bank.account_holder_name} />
                        <InfoRow label="Bank Name" value={bank.bank_name} />
                        <InfoRow label="Branch" value={bank.branch_name} />
                        <InfoRow label="Account Number" value={bank.account_number} />
                        <InfoRow label="IFSC Code" value={bank.ifsc_code} />
                        <InfoRow label="Account Type" value={bank.account_type} />
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No bank details provided</p>
                )}
            </Card>

            {/* Statistics */}
            <Card className="p-6 bg-purple-50 border-purple-200">
                <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Claims</span>
                        <span className="text-2xl font-bold text-purple-600">{claims?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Rejected Claims</span>
                        <span className="text-2xl font-bold text-red-600">{rejectionHistory?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">External Links</span>
                        <span className="text-2xl font-bold text-green-600">{externalLinks?.length || 0}</span>
                    </div>
                    <div className="pt-4 border-t border-purple-200">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Earnings</span>
                            <span className="text-xl font-bold text-purple-700">
                                ₹{claims?.reduce((sum, claim) => sum + Number(claim.total_amount || 0), 0).toLocaleString('en-IN') || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

// Claims Tab Component
function ClaimsTab({ claims }) {
    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-purple-600" />
                All Claims ({claims?.length || 0})
            </h3>
            {claims && claims.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">ID</th>
                                <th className="px-4 py-3 text-left font-semibold">Subject</th>
                                <th className="px-4 py-3 text-left font-semibold">Type</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                                <th className="px-4 py-3 text-left font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {claims.map((claim) => (
                                <tr key={claim.id} className="hover:bg-muted transition-colors">
                                    <td className="px-4 py-3 font-medium">#{claim.id}</td>
                                    <td className="px-4 py-3">{claim.subject_name || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs px-2 py-1 rounded bg-accent font-medium">
                                            {claim.exam_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${claim.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            claim.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                                claim.status === 'submitted' ? 'bg-orange-100 text-orange-700' :
                                                    claim.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-accent text-foreground'
                                            }`}>
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold">
                                        ₹{Number(claim.total_amount || 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(claim.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12">
                    <FileTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No claims found</p>
                </div>
            )}
        </Card>
    );
}

// Rejections Tab Component
function RejectionsTab({ rejectionHistory }) {
    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 text-red-600" />
                Rejection History ({rejectionHistory?.length || 0})
            </h3>
            {rejectionHistory && rejectionHistory.length > 0 ? (
                <div className="space-y-3">
                    {rejectionHistory.map((rejection, idx) => (
                        <div key={idx} className="bg-red-50 p-4 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-semibold text-foreground">
                                        Claim #{rejection.id}
                                    </span>
                                    <span className="text-muted-foreground ml-2">
                                        {rejection.subject_name}
                                    </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(rejection.action_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="bg-card p-3 rounded border border-red-100 mt-2">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Rejection Reason:</p>
                                <p className="text-sm text-foreground">{rejection.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <CheckCircleIcon className="w-12 h-12 text-green-300 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No rejections - All claims approved!</p>
                </div>
            )}
        </Card>
    );
}

// External Links Tab Component
function ExternalLinksTab({ externalLinks }) {
    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-purple-600" />
                External Links Generated ({externalLinks?.length || 0})
            </h3>
            {externalLinks && externalLinks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {externalLinks.map((link, idx) => (
                        <div key={idx} className="bg-muted p-4 rounded-lg border border-border hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-foreground">
                                        {link.subject_name || 'N/A'}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Created: {new Date(link.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${link.used ? 'bg-green-100 text-green-700' :
                                    new Date(link.expires_at) < new Date() ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {link.used ? 'Used' : new Date(link.expires_at) < new Date() ? 'Expired' : 'Active'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <ClockIcon className="w-4 h-4" />
                                Expires: {new Date(link.expires_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <FileTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No external links generated</p>
                </div>
            )}
        </Card>
    );
}

// Helper Component
function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
        </div>
    );
}
