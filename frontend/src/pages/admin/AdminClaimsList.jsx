import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

// Icons
import {
    FileTextIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    CurrencyRupeeIcon,
    EyeIcon,
    FilterIcon
} from "../../components/icons/logo";

export default function AdminClaimsList() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const status = searchParams.get("status") || "";
    const department = searchParams.get("department") || "";
    const examType = searchParams.get("exam_type") || "";
    const claimFormType = searchParams.get("claim_form_type") || "";

    useEffect(() => {
        fetchClaims();
    }, [status, department, examType, claimFormType]);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (status) params.append("status", status);
            if (department) params.append("department", department);
            if (examType) params.append("exam_type", examType);
            if (claimFormType) params.append("claim_form_type", claimFormType);

            const res = await api.get(`/admin/claims?${params.toString()}`);
            setClaims(res.data);
        } catch (err) {
            console.error("Failed to fetch claims:", err);
            setClaims([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredClaims = claims.filter(claim =>
        claim.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.exam_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getClaimTypeBadge = (type) => {
        const badges = {
            'TEACHING_INTERNAL': { label: 'Teaching Internal', color: 'bg-blue-100 text-blue-700' },
            'TEACHING_EXTERNAL': { label: 'Teaching External', color: 'bg-green-100 text-green-700' },
            'NON_TEACHING': { label: 'Non-Teaching', color: 'bg-purple-100 text-purple-700' }
        };
        return badges[type] || { label: type, color: 'bg-accent text-foreground' };
    };

    const getStatusBadge = (status) => {
        const badges = {
            'submitted': { label: 'Submitted', color: 'bg-orange-100 text-orange-700 border-orange-200' },
            'approved': { label: 'Approved', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            'paid': { label: 'Paid', color: 'bg-green-100 text-green-700 border-green-200' },
            'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' }
        };
        return badges[status] || { label: status, color: 'bg-accent text-foreground border-border' };
    };

    const clearFilters = () => {
        setSearchParams({});
        setSearchTerm("");
    };

    const hasActiveFilters = status || department || examType || claimFormType;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-card-foreground">Claims Management</h1>
                <p className="text-muted-foreground">Supervise and oversee all examination claims</p>
            </div>

            {/* Filters */}
            <Card className="p-6 bg-card border-border">
                <div className="space-y-4">
                    {/* Status Filter Tabs */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => setSearchParams({})}
                            variant={!status ? "default" : "outline"}
                            size="sm"
                            className={!status ? "bg-purple-600 hover:bg-purple-700" : ""}
                        >
                            All Claims
                        </Button>
                        <Button
                            onClick={() => setSearchParams({ status: "submitted" })}
                            variant={status === "submitted" ? "default" : "outline"}
                            size="sm"
                            className={status === "submitted" ? "bg-orange-600 hover:bg-orange-700" : ""}
                        >
                            <ClockIcon className="w-4 h-4 mr-1" />
                            Submitted
                        </Button>
                        <Button
                            onClick={() => setSearchParams({ status: "approved" })}
                            variant={status === "approved" ? "default" : "outline"}
                            size="sm"
                            className={status === "approved" ? "bg-blue-600 hover:bg-blue-700" : ""}
                        >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Approved
                        </Button>
                        <Button
                            onClick={() => setSearchParams({ status: "paid" })}
                            variant={status === "paid" ? "default" : "outline"}
                            size="sm"
                            className={status === "paid" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Paid
                        </Button>
                        <Button
                            onClick={() => setSearchParams({ status: "rejected" })}
                            variant={status === "rejected" ? "default" : "outline"}
                            size="sm"
                            className={status === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Rejected
                        </Button>
                    </div>

                    {/* Search and Advanced Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                placeholder="Search by faculty, subject, exam type, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Clear Filters */}
                        {(hasActiveFilters || searchTerm) && (
                            <Button
                                onClick={clearFilters}
                                variant="outline"
                                size="sm"
                                className="whitespace-nowrap"
                            >
                                <FilterIcon className="w-4 h-4 mr-2" />
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Claims Table */}
            <Card className="bg-card border-border">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading claims...</p>
                    </div>
                ) : filteredClaims.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileTextIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            {claims.length === 0 ? "No claims found" : "No matching claims"}
                        </h3>
                        <p className="text-muted-foreground">
                            {claims.length === 0
                                ? "There are no claims matching your filters."
                                : "Try adjusting your search criteria."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Claimant
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Exam Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Claim Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredClaims.map((claim) => {
                                    const claimTypeBadge = getClaimTypeBadge(claim.claim_form_type);
                                    const statusBadge = getStatusBadge(claim.status);
                                    return (
                                        <tr key={claim.id} className="hover:bg-purple-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-foreground">
                                                    {claim.claimant_name || claim.faculty_name || 'Unknown'}
                                                </div>
                                                {claim.claim_form_type === 'TEACHING_EXTERNAL' && claim.faculty_name && (
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        Ref: {claim.faculty_name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-foreground">{claim.department || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-foreground">{claim.subject_name || 'N/A'}</div>
                                                {claim.program && (
                                                    <div className="text-xs text-muted-foreground">{claim.program} {claim.level}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-medium bg-accent text-foreground rounded">
                                                    {claim.exam_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${claimTypeBadge.color}`}>
                                                    {claimTypeBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-foreground font-semibold">
                                                    <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                                                    {Number(claim.total_amount || 0).toLocaleString('en-IN')}
                                                </div>
                                                {claim.min_applied && (
                                                    <div className="text-xs text-orange-600 mt-1">Min applied</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge.color}`}>
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => navigate(`/admin/claims/${claim.id}`)}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                                >
                                                    <EyeIcon className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                {filteredClaims.length > 0 && (
                    <div className="px-6 py-4 bg-muted border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-semibold">{filteredClaims.length}</span> of{" "}
                            <span className="font-semibold">{claims.length}</span> claims
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
