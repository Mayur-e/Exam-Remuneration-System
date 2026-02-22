import { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

// Icons
import {
    UserIcon,
    CheckCircleIcon,
    XCircleIcon,
    AlertCircleIcon,
    EyeIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    DocumentTextIcon
} from "../../components/icons/logo";

export default function AccountantExternalSupervision() {
    const navigate = useNavigate();
    const [externalExaminers, setExternalExaminers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
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

    // Get unique departments for filter
    const departments = [...new Set(externalExaminers.map(e => e.department).filter(Boolean))];

    const filteredExaminers = externalExaminers.filter(examiner => {
        const matchesSearch =
            examiner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examiner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examiner.parent_institute?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examiner.generated_by?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = !departmentFilter || examiner.department === departmentFilter;

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

        if (hasPan && hasCheque) return { label: 'Complete', color: 'text-green-600', icon: CheckCircleIcon };
        if (!hasPan && !hasCheque) return { label: 'Pending', color: 'text-muted-foreground', icon: AlertCircleIcon };
        return { label: 'Incomplete', color: 'text-red-600', icon: XCircleIcon };
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
        setDepartmentFilter("");
        setStatusFilter("");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-card-foreground">External Examiner Supervision</h1>
                <p className="text-muted-foreground">Monitor external examiners, their documents, and claim submissions</p>
            </div>

            {/* Filters */}
            <Card className="p-6 bg-card border-border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-1">Search</label>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search by name, email, institute, or faculty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Department Filter */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Department</label>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Claim Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="submitted">Submitted</option>
                            <option value="approved">Approved</option>
                            <option value="paid">Paid</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Clear Filters */}
                {(searchTerm || departmentFilter || statusFilter) && (
                    <div className="mt-4">
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                )}
            </Card>

            {/* External Examiners Table */}
            <Card className="bg-card border-border">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading external examiners...</p>
                    </div>
                ) : filteredExaminers.length === 0 ? (
                    <div className="p-12 text-center">
                        <UserIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            {externalExaminers.length === 0 ? "No external examiners found" : "No matching examiners"}
                        </h3>
                        <p className="text-muted-foreground">
                            {externalExaminers.length === 0
                                ? "No external examiner claims have been submitted yet."
                                : "Try adjusting your search criteria."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted border-b border-border">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-8">
                                        {/* Expand column */}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        External Examiner
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Institute
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Exam Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Generated By
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Documents
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Claim Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExaminers.map((examiner) => {
                                    const docStatus = getDocumentStatus(examiner);
                                    const DocIcon = docStatus.icon;
                                    const isExpanded = expandedRows.has(examiner.id);

                                    return (
                                        <Fragment key={examiner.id}>
                                            <tr className="hover:bg-purple-50 transition-colors border-b border-border">
                                                <td className="px-4 py-4">
                                                    <button
                                                        onClick={() => toggleRow(examiner.id)}
                                                        className="text-muted-foreground hover:text-purple-600 transition-colors p-1 rounded hover:bg-purple-100"
                                                        title="View documents"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUpIcon className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDownIcon className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                            <UserIcon className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-foreground">
                                                                {examiner.full_name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">{examiner.email}</div>
                                                            {examiner.mobile && (
                                                                <div className="text-xs text-muted-foreground">{examiner.mobile}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-foreground">
                                                        {examiner.parent_institute || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {examiner.is_local ? 'Local (< 25km)' : 'Outstation'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {examiner.subject_name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {examiner.exam_type} • {examiner.program}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Exam #{examiner.exam_id}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-foreground">{examiner.generated_by}</div>
                                                    <div className="text-xs text-muted-foreground">{examiner.department}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`flex items-center gap-2 ${docStatus.color} mb-1`}>
                                                        <DocIcon className="w-4 h-4" />
                                                        <span className="text-sm font-medium">{docStatus.label}</span>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        {examiner.pan_document_url && (
                                                            <div className="text-xs text-green-600">✓ PAN</div>
                                                        )}
                                                        {examiner.cancelled_cheque_url && (
                                                            <div className="text-xs text-green-600">✓ Cheque</div>
                                                        )}
                                                        {examiner.travel_proof_url && (
                                                            <div className="text-xs text-green-600">✓ Travel</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {examiner.claim_status ? (
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${examiner.claim_status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            examiner.claim_status === 'approved' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                                examiner.claim_status === 'submitted' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                                    examiner.claim_status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                        'bg-accent text-foreground border-border'
                                                            }`}>
                                                            {examiner.claim_status}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => navigate(`/accountant/bills/${examiner.exam_id}`)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                        View Claim
                                                    </Button>
                                                </td>
                                            </tr>

                                            {/* Expanded Document Row */}
                                            {isExpanded && (
                                                <tr className="bg-purple-50 border-b border-border">
                                                    <td colSpan="8" className="px-6 py-6">
                                                        <div className="space-y-4">
                                                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                                                                Uploaded Documents
                                                            </h4>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                {/* PAN Document */}
                                                                <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                                                                        <h5 className="font-medium text-foreground">PAN Card</h5>
                                                                    </div>
                                                                    {examiner.pan_document_url ? (
                                                                        <div className="space-y-2">
                                                                            <div className="relative group">
                                                                                <img
                                                                                    src={`http://localhost:5000${examiner.pan_document_url}`}
                                                                                    alt="PAN Document"
                                                                                    className="w-full h-48 object-contain bg-muted rounded border cursor-pointer hover:shadow-lg transition-shadow"
                                                                                    onClick={() => window.open(`http://localhost:5000${examiner.pan_document_url}`, '_blank')}
                                                                                />
                                                                            </div>
                                                                            <a
                                                                                href={`http://localhost:5000${examiner.pan_document_url}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                                                                            >
                                                                                Open in New Tab →
                                                                            </a>
                                                                            <p className="text-xs text-muted-foreground text-center">PAN: {examiner.pan_number || 'N/A'}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center py-8 bg-muted rounded">
                                                                            <XCircleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                                                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Cancelled Cheque */}
                                                                <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                                                                        <h5 className="font-medium text-foreground">Cancelled Cheque</h5>
                                                                    </div>
                                                                    {examiner.cancelled_cheque_url ? (
                                                                        <div className="space-y-2">
                                                                            <div className="relative group">
                                                                                <img
                                                                                    src={`http://localhost:5000${examiner.cancelled_cheque_url}`}
                                                                                    alt="Cancelled Cheque"
                                                                                    className="w-full h-48 object-contain bg-muted rounded border cursor-pointer hover:shadow-lg transition-shadow"
                                                                                    onClick={() => window.open(`http://localhost:5000${examiner.cancelled_cheque_url}`, '_blank')}
                                                                                />
                                                                            </div>
                                                                            <a
                                                                                href={`http://localhost:5000${examiner.cancelled_cheque_url}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                                                                            >
                                                                                Open in New Tab →
                                                                            </a>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center py-8 bg-muted rounded">
                                                                            <XCircleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                                                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Travel Proof */}
                                                                <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                                                                        <h5 className="font-medium text-foreground">Travel Proof</h5>
                                                                    </div>
                                                                    {examiner.travel_proof_url ? (
                                                                        <div className="space-y-2">
                                                                            <div className="relative group">
                                                                                <img
                                                                                    src={`http://localhost:5000${examiner.travel_proof_url}`}
                                                                                    alt="Travel Proof"
                                                                                    className="w-full h-48 object-contain bg-muted rounded border cursor-pointer hover:shadow-lg transition-shadow"
                                                                                    onClick={() => window.open(`http://localhost:5000${examiner.travel_proof_url}`, '_blank')}
                                                                                />
                                                                            </div>
                                                                            <a
                                                                                href={`http://localhost:5000${examiner.travel_proof_url}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                                                                            >
                                                                                Open in New Tab →
                                                                            </a>
                                                                            <p className="text-xs text-muted-foreground text-center">
                                                                                {examiner.is_local ? `Local: ₹${examiner.travel_allowance || 0}` : `Outstation: ₹${examiner.travel_allowance || 0}`}
                                                                            </p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center py-8 bg-muted rounded">
                                                                            <AlertCircleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {examiner.is_local ? 'Not required for local' : 'Not uploaded'}
                                                                            </p>
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

                {/* Footer */}
                {filteredExaminers.length > 0 && (
                    <div className="px-6 py-4 bg-muted border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-semibold">{filteredExaminers.length}</span> of{" "}
                            <span className="font-semibold">{externalExaminers.length}</span> external examiners
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
