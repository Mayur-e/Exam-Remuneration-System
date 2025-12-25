import { useEffect, useState } from "react";
import api from "../../services/api";

export default function MyClaims() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    api.get("/faculty/exams").then(res => setClaims(res.data));
  }, []);

  return (
    <div>
      <h3 className="font-semibold mb-4">My Claims</h3>

      <ul className="space-y-2">
        {claims.map(c => (
          <li key={c.id} className="border p-3 rounded">
            {c.subject_name || "Subject"} — {c.status} — ₹{c.total_amount || 0}
          </li>
        ))}
      </ul>
    </div>
  );
}
