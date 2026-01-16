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
  CurrencyRupeeIcon,
  EyeIcon
} from "../../components/icons/logo";

export default function Bills() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status") || "submitted";
  const facultyId = searchParams.get("facultyId");

  useEffect(() => {
    fetchClaims();
  }, [status, facultyId]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      let url = `/accountant/claims?status=${status}`;
      if (facultyId) {
        url += `&facultyId=${facultyId}`;
      }
      const res = await api.get(url);
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
    claim.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.exam_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClaimTypeBadge = (type) => {
    const badges = {
      'TEACHING_INTERNAL': { label: 'Teaching Internal', color: 'bg-blue-100 text-blue-700' },
      'TEACHING_EXTERNAL': { label: 'Teaching External', color: 'bg-green-100 text-green-700' },
      'NON_TEACHING': { label: 'Non-Teaching', color: 'bg-purple-100 text-purple-700' }
    };
    return badges[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Bills Management</h1>
        <div className="flex items-center gap-3">
          <p className="text-gray-600">Review and process claim payments</p>
          {facultyId && claims.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                Filtered by: {claims[0]?.faculty_name}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/accountant/bills')}
                className="text-xs"
              >
                Clear Filter
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-white border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex gap-2">
            <Button
              onClick={() => setSearchParams({ status: "submitted" })}
              variant={status === "submitted" ? "default" : "outline"}
              className={status === "submitted" ? "bg-orange-600 hover:bg-orange-700" : ""}
            >
              <ClockIcon className="w-4 h-4 mr-2" />
              Pending
            </Button>
            <Button
              onClick={() => setSearchParams({ status: "approved" })}
              variant={status === "approved" ? "default" : "outline"}
              className={status === "approved" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Approved
            </Button>
            <Button
              onClick={() => setSearchParams({ status: "paid" })}
              variant={status === "paid" ? "default" : "outline"}
              className={status === "paid" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Paid
            </Button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-96">
            <Input
              type="text"
              placeholder="Search by faculty, subject, or exam type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </Card>

      {/* Claims List */}
      <Card className="bg-white border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading claims...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-12 text-center">
            <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {claims.length === 0 ? "No claims found" : "No matching claims"}
            </h3>
            <p className="text-gray-500">
              {claims.length === 0
                ? `There are no ${status} claims at the moment.`
                : "Try adjusting your search criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Exam Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Claim Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClaims.map((claim) => {
                  const badge = getClaimTypeBadge(claim.claim_form_type);
                  return (
                    <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{claim.faculty_name}</div>
                        <div className="text-sm text-gray-500">{claim.faculty_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{claim.subject_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {claim.exam_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-900 font-semibold">
                          <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                          {Number(claim.net_amount || claim.total_amount || 0).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {claim.status === 'submitted' ? (
                          <span className="px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                            Pending
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/accountant/bills/${claim.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
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
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredClaims.length}</span> of{" "}
              <span className="font-semibold">{claims.length}</span> claims
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
