import { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

// Icons
import {
  UserIcon,
  MailIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ArrowLeftIcon,
  PhoneIcon
} from "../../components/icons/logo";

export default function FacultyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetchFacultyData();
  }, [id]);

  const fetchFacultyData = async () => {
    try {
      const res = await api.get(`/accountant/faculty/${id}`);
      console.log('Faculty Profile Data:', res.data);
      console.log('Claims count:', res.data.claims?.length);
      console.log('Sample claim:', res.data.claims?.[0]);
      console.log('Total amount sum:', res.data.claims?.reduce((sum, c) => sum + (parseFloat(c.total_amount) || 0), 0));
      console.log('Net amount sum:', res.data.claims?.reduce((sum, c) => sum + (parseFloat(c.net_amount) || 0), 0));
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch faculty data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="p-6 bg-white border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading faculty profile...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6 bg-white border-gray-200">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-700 mb-2">Faculty Not Found</h3>
          <p className="text-gray-600 mb-4">The requested faculty member could not be found.</p>
          <Button onClick={() => navigate("/accountant/faculty")}>
            Back to Faculty List
          </Button>
        </div>
      </Card>
    );
  }

  const { faculty, bank, claims = [] } = data;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/accountant/faculty")}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Faculty Profile</h1>
            <p className="text-gray-600">View faculty details and claims</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Bank */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-200 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{faculty.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {faculty.role || "Faculty"}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      ID: {faculty.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Personal Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <MailIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-800">{faculty.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-800">{faculty.phone || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-sm font-medium text-gray-800">{faculty.department || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Account Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Joined On</p>
                      <p className="text-sm font-medium text-gray-800">{formatDate(faculty.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium text-gray-800">{formatDate(faculty.updated_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CurrencyRupeeIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Total Claims</p>
                      <p className="text-sm font-medium text-gray-800">{claims.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Bank Details Card */}
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Bank Details</h3>
                <p className="text-sm text-gray-600">Payment information for disbursements</p>
              </div>
            </div>

            {bank ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-800">Bank Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-green-600">Bank Name</p>
                      <p className="font-medium text-gray-800">{bank.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600">Branch Name</p>
                      <p className="font-medium text-gray-800">{bank.branch_name}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Account Details</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-blue-600">Account Number</p>
                      <p className="font-medium text-gray-800">{bank.account_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">IFSC Code</p>
                      <p className="font-medium text-gray-800">{bank.ifsc_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Account Type</p>
                      <p className="font-medium text-gray-800">{bank.account_type || "Savings"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BanknotesIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-gray-700 font-medium mb-2">No Bank Details</h4>
                <p className="text-gray-500 text-sm">Bank details have not been provided by the faculty.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Statistics Card */}
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Claim Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Claims</span>
                <span className="font-bold text-gray-800">
                  {claims.filter(c => c.status !== 'draft').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Submitted</span>
                <span className="font-bold text-orange-600">
                  {claims.filter(c => c.status === 'submitted').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Approved</span>
                <span className="font-bold text-blue-600">
                  {claims.filter(c => c.status === 'approved').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid</span>
                <span className="font-bold text-green-600">
                  {claims.filter(c => c.status === 'paid').length}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-gray-600">Total Payable</span>
                <span className="font-bold text-gray-800">
                  ₹{claims
                    .filter(c => c.status !== 'draft')
                    .reduce((sum, c) => sum + (parseFloat(c.net_amount) || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/accountant/bills?facultyId=${id}`)}
              >
                View All Claims
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {claims.slice(0, 3).map((claim, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {claim.subject_name || "Untitled Claim"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(claim.created_at)} • ₹{claim.total_amount || "0.00"}
                    </p>
                  </div>
                </div>
              ))}
              {claims.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">No recent activity</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}