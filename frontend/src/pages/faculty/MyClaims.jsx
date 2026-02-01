import { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

// Icons
import {
  FileTextIcon,
  EyeIcon,
  SearchIcon,
  FilterIcon,
  CheckCircleIcon,
  ClockIcon,
  XIcon
} from "../../components/icons/logo";

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    filterClaims();
  }, [claims, searchTerm, statusFilter]);

  const fetchClaims = async () => {
    try {
      const res = await api.get("/faculty/exams");
      setClaims(res.data || []);
    } catch (err) {
      console.error("Failed to fetch claims", err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const filterClaims = () => {
    let result = [...claims];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        (c.subject_name || "").toLowerCase().includes(term) ||
        (c.exam_type || "").toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(c => c.status === statusFilter);
    }

    setFilteredClaims(result);
  };

  const handleView = (claim) => {
    if (claim.claim_form_type === 'TEACHING_EXTERNAL' && claim.external_link_token) {
      window.open(`/external/claim/${claim.external_link_token}`, '_blank');
    } else if (claim.claim_form_type === 'NON_TEACHING') {
      navigate(`/faculty/claim/non-teaching?examId=${claim.id}`);
    } else {
      navigate(`/faculty/claim/teaching?examId=${claim.id}`);
    }
  };

  const handleCopyExternalLink = async (claim) => {
    try {
      if (claim.external_link_token) {
        const link = `${window.location.origin}/external/claim/${claim.external_link_token}`;
        await navigator.clipboard.writeText(link);
        showToast("External examiner link copied to clipboard! Share this link with the external examiner to resubmit the claim.", "success");
      } else {
        showToast("External link not found (Token missing). Please contact support.", "error");
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
      showToast("Failed to copy link", "error");
    }
  };

  const handleDownloadPDF = (claim) => {
    try {
      showToast("Opening PDF...", "info");

      const endpoint = claim.claim_form_type === 'NON_TEACHING'
        ? `/pdf/non-teaching/${claim.id}/download`
        : `/pdf/claim/${claim.id}/download`;

      // Get token for auth
      const token = localStorage.getItem("token");

      // Construct full URL with auth token and view mode
      // This allows the backend to serve Inline (for new tab) but with correct Filename header
      const baseURL = api.defaults.baseURL || "http://localhost:5000/api";
      const url = `${baseURL}${endpoint}?token=${token}&view=true`;

      // Open in new tab
      window.open(url, '_blank');

    } catch (err) {
      console.error("Failed to open PDF:", err);
      showToast("Failed to open PDF", "error");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      draft: {
        label: "draft",
        color: "bg-yellow-100 text-yellow-800",
        icon: <XIcon className="w-3 h-3" />
      },
      submitted: {
        label: "Submitted",
        color: "bg-yellow-100 text-yellow-800",
        icon: <ClockIcon className="w-3 h-3" />
      },
      approved: {
        label: "Approved",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircleIcon className="w-3 h-3" />
      },
      rejected: {
        label: "Rejected",
        color: "bg-red-100 text-red-800",
        icon: <XIcon className="w-3 h-3" />
      }
    };

    const s = config[status] || config.submitted;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>
        {s.icon}
        {s.label}
      </span>
    );
  };

  const getStatusCount = (status) =>
    claims.filter(c => c.status === status).length;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-10">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading your claims...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Claims</h1>
        <p className="text-gray-600">Submitted examination claims</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Claims</p>
              <h2 className="text-3xl font-bold text-gray-800">{claims.length}</h2>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <FileTextIcon className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Submitted</p>
              <h2 className="text-3xl font-bold text-orange-700">{getStatusCount("submitted")}</h2>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ClockIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Approved</p>
              <h2 className="text-3xl font-bold text-green-700">{getStatusCount("approved")}</h2>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Rejected</p>
              <h2 className="text-3xl font-bold text-red-700">{getStatusCount("rejected")}</h2>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search by subject or exam type"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="ALL">All</option>
              <option value="draft">draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* List */}
      {filteredClaims.length === 0 ? (
        <Card className="p-8 text-center">
          <FileTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No claims found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredClaims.map((c, index) => (
            <Card key={`claim-${c.id}-${index}`} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {c.subject_name || "Unnamed Subject"}
                    </h3>
                    {c.claim_form_type === 'TEACHING_EXTERNAL' && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                        External Examiner
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Exam Type:</span> {c.exam_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Program:</span> {c.program} - {c.level}
                    </p>
                    {c.status === 'rejected' && c.claim_form_type === 'TEACHING_EXTERNAL' && (
                      <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mt-2 border border-red-200">
                        ⚠️ Share the link with external examiner to resubmit
                      </p>
                    )}
                    <p className="text-base font-semibold text-green-700 mt-2">
                      ₹ {Number(c.total_amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(c.status)}
                  <div className="flex gap-2">
                    {c.status === 'rejected' && c.claim_form_type === 'TEACHING_EXTERNAL' && (
                      <Button
                        size="sm"
                        onClick={() => handleCopyExternalLink(c)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        title="Copy link to share with external examiner"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                      </Button>
                    )}
                    {(c.status === 'submitted' || c.status === 'approved') && (
                      <Button
                        size="sm"
                        onClick={() => handleDownloadPDF(c)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        title="Download PDF"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(c)}
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
