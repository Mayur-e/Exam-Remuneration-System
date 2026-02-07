import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

// Icons
import {
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  FileTextIcon
} from "../../components/icons/logo";

export default function AccountantDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/accountant/dashboard")
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.error("Dashboard error:", err);
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export/billing-sheet', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Billing_Sheet_Export.xlsx');
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export billing sheet");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-red-600">Failed to load dashboard statistics</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-card-foreground">Billing Incharge Dashboard</h1>
        <p className="text-muted-foreground">Department financial overview and payment management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Claims */}
        <StatCard
          title="Pending Payment"
          value={stats.pending_count || 0}
          subtitle={`₹${Number(stats.pending_amount || 0).toLocaleString('en-IN')}`}
          icon={<ClockIcon className="w-6 h-6 text-orange-600" />}
          bgColor="bg-orange-50"
          borderColor="border-orange-200"
          textColor="text-orange-600"
        />

        {/* Paid Claims */}
        <StatCard
          title="Paid Claims"
          value={stats.paid_count || 0}
          subtitle={`₹${Number(stats.paid_amount || 0).toLocaleString('en-IN')}`}
          icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
          bgColor="bg-green-50"
          borderColor="border-green-200"
          textColor="text-green-600"
        />

        {/* Total Amount */}
        <StatCard
          title="Total Amount"
          value={`₹${Number(stats.total_amount || 0).toLocaleString('en-IN')}`}
          subtitle="All claims"
          icon={<CurrencyRupeeIcon className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          textColor="text-blue-600"
        />

        {/* Pending Amount */}
        <StatCard
          title="Pending Amount"
          value={`₹${Number(stats.pending_amount || 0).toLocaleString('en-IN')}`}
          subtitle="Awaiting payment"
          icon={<FileTextIcon className="w-6 h-6 text-purple-600" />}
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
          textColor="text-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate("/accountant/bills?status=submitted")}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ClockIcon className="w-5 h-5 mr-2" />
            View Pending Bills ({stats.pending_count || 0})
          </Button>

          <Button
            onClick={() => navigate("/accountant/bills?status=paid")}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 font-semibold"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            View Paid Bills ({stats.paid_count || 0})
          </Button>

          <Button
            onClick={() => navigate("/accountant/faculty")}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
          >
            <FileTextIcon className="w-5 h-5 mr-2" />
            Faculty Directory
          </Button>

          <Button
            onClick={handleExport}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 font-semibold"
          >
            <FileTextIcon className="w-5 h-5 mr-2" />
            Export Billing Excel
          </Button>
        </div>
      </Card>

      {/* Summary Info */}
      {stats.pending_count > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <ClockIcon className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-800">
              {stats.pending_count} claim{stats.pending_count !== 1 ? 's' : ''} awaiting payment
            </p>
            <p className="text-sm text-orange-600 mt-1">
              Total pending amount: ₹{Number(stats.pending_amount || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, bgColor, borderColor, textColor }) {
  return (
    <Card className={`p-6 ${bgColor} border ${borderColor} hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${textColor}`}>{value}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
