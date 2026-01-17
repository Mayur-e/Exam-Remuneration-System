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
                <p className="text-gray-600">Loading faculty profile...</p>
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Faculty Profile</h1>
                    <p className="text-sm text-gray-500">Complete overview and claim history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Personal Info */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-purple-600" />
                            Personal Information
                        </h3>
                        <div className="space-y-3 text-sm">
                            <InfoRow label="Name" value={faculty.name} />
                            <InfoRow label="Email" value={faculty.email} />
                            <InfoRow label="Department" value={faculty.department || 'N/A'} />
                            <InfoRow label="Role" value={faculty.role} />
                            <InfoRow label="Status" value={faculty.is_active ? 'Active' : 'Inactive'} />
                            <InfoRow label="Joined" value={new Date(faculty.created_at).toLocaleDateString()} />
                        </div>
                    </Card>

                    {/* Bank Details (Read-Only) */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                            Bank Details (Read-Only)
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
                            <p className="text-sm text-gray-500">No bank details provided</p>
                        )}
                    </Card>

                    {/* Statistics */}
                    <Card className="p-6 bg-purple-50 border-purple-200">
                        <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Claims</span>
                                <span className="text-lg font-bold text-purple-600">{claims?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Rejected Claims</span>
                                <span className="text-lg font-bold text-red-600">{rejectionHistory?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">External Links</span>
                                <span className="text-lg font-bold text-green-600">{externalLinks?.length || 0}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Claims History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Claims History */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileTextIcon className="w-5 h-5 text-purple-600" />
                            Claims History
                        </h3>
                        {claims && claims.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">ID</th>
                                            <th className="px-4 py-2 text-left">Subject</th>
                                            <th className="px-4 py-2 text-left">Type</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-right">Amount</th>
                                            <th className="px-4 py-2 text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {claims.map((claim) => (
                                            <tr key={claim.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2">#{claim.id}</td>
                                                <td className="px-4 py-2">{claim.subject_name || 'N/A'}</td>
                                                <td className="px-4 py-2">
                                                    <span className="text-xs px-2 py-1 rounded bg-gray-100">
                                                        {claim.exam_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${claim.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                            claim.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                                                claim.status === 'submitted' ? 'bg-orange-100 text-orange-700' :
                                                                    claim.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {claim.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-right font-medium">
                                                    ₹{Number(claim.total_amount || 0).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-2 text-gray-500">
                                                    {new Date(claim.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No claims found</p>
                        )}
                    </Card>

                    {/* Rejection History */}
                    {rejectionHistory && rejectionHistory.length > 0 && (
                        <Card className="p-6 bg-red-50 border-red-200">
                            <h3 className="text-lg font-semibold mb-4 text-red-900 flex items-center gap-2">
                                <XCircleIcon className="w-5 h-5" />
                                Rejection History
                            </h3>
                            <div className="space-y-3">
                                {rejectionHistory.map((rejection, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medium text-gray-900">
                                                Claim #{rejection.id} - {rejection.subject_name}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(rejection.action_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{rejection.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* External Links Generated */}
                    {externalLinks && externalLinks.length > 0 && (
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FileTextIcon className="w-5 h-5 text-purple-600" />
                                External Links Generated
                            </h3>
                            <div className="space-y-3">
                                {externalLinks.map((link, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-medium text-gray-900">
                                                    {link.subject_name || 'N/A'}
                                                </span>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Created: {new Date(link.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${link.used ? 'bg-green-100 text-green-700' :
                                                    new Date(link.expires_at) < new Date() ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {link.used ? 'Used' : new Date(link.expires_at) < new Date() ? 'Expired' : 'Active'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Expires: {new Date(link.expires_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between py-1 border-b border-gray-100 last:border-0">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    );
}
