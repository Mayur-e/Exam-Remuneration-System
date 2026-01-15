import { useEffect, useState } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Bills() {
  const [claims, setClaims] = useState([]);
  const [status, setStatus] = useState("submitted");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, [status]);

  const fetchClaims = async () => {
    const res = await api.get(`/accountant/claims?status=${status}`);
    setClaims(res.data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Bills</h2>

      <select
        className="border px-3 py-2 rounded"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="submitted">Submitted</option>
        <option value="approved">Approved</option>
        <option value="paid">Paid</option>
      </select>

      <Card className="p-4">
        <table className="w-full border">
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Exam</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {claims.map(c => (
              <tr key={c.id}>
                <td>{c.faculty_name}</td>
                <td>{c.exam_type}</td>
                <td>₹ {c.total_amount}</td>
                <td>{c.status}</td>
                <td className="space-x-2">
                  <Button size="sm" onClick={() => navigate(`/accountant/bills/${c.id}`)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
