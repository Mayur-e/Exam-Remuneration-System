import { useEffect, useState } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/card";

export default function AccountantDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/accountant/dashboard")
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Accountant Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Submitted Claims" value={stats.submitted} />
        <StatCard title="Approved (Pending Pay)" value={stats.approved_pending} />
        <StatCard title="Paid Claims" value={stats.paid} />
        <StatCard title="Total Paid Amount" value={`₹ ${stats.total_paid_amount}`} />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
}
