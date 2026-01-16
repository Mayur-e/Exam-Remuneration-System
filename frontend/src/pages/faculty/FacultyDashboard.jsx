import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

// Icons
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  PlusIcon,
  FileTextIcon,
  XCircleIcon
} from "../../components/icons/logo";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    approved_count: 0,
    pending_count: 0,
    rejected_count: 0,
    total_amount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/faculty/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your claims overview</p>
        </div>
        <Button
          onClick={() => navigate("/faculty/claim/teaching")}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Claim
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Approved Claims */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Approved Claims</p>
              <h2 className="text-3xl font-bold text-green-700">{stats.approved_count}</h2>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Pending Claims */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Pending Claims</p>
              <h2 className="text-3xl font-bold text-orange-700">{stats.pending_count}</h2>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ClockIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </Card>

        {/* Rejected Claims */}
        <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-red-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Rejected Claims</p>
              <h2 className="text-3xl font-bold text-red-700">{stats.rejected_count || 0}</h2>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Total Amount */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Payable</p>
              <h2 className="text-3xl font-bold text-blue-700">
                ₹{Number(stats.total_amount || 0).toLocaleString('en-IN')}
              </h2>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CurrencyRupeeIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/faculty/claim/teaching")}
            className="justify-start h-auto py-4 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileTextIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Create Teaching Claim</p>
                <p className="text-sm text-gray-500">Submit new teaching examination claim</p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/faculty/myclaims")}
            className="justify-start h-auto py-4 hover:bg-green-50 hover:border-green-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileTextIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">View My Claims</p>
                <p className="text-sm text-gray-500">Check status of submitted claims</p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/faculty/settings")}
            className="justify-start h-auto py-4 hover:bg-purple-50 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileTextIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Update Profile</p>
                <p className="text-sm text-gray-500">Manage bank details and settings</p>
              </div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}
