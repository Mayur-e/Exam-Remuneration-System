import { useEffect, useState } from "react";
import api from "../../services/api";
import { Card, CardContent } from "../../components/ui/card";

export default function FacultyDashboard() {
  const [stats, setStats] = useState({
    approved_count: 0,
    pending_count: 0,
    total_amount: 0,
  });

  useEffect(() => {
    api.get("/faculty/dashboard-stats")
      .then(res => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Approved Claims</p>
          <h2 className="text-2xl font-bold">{stats.approved_count}</h2>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Pending Claims</p>
          <h2 className="text-2xl font-bold">{stats.pending_count}</h2>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <h2 className="text-2xl font-bold">₹ {stats.total_amount}</h2>
        </CardContent>
      </Card>
    </div>
  );
}
