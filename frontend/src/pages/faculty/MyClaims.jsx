import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";



export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/faculty/exams").then(res => setClaims(res.data));
  }, []);

  const handleView = (id) => {
    navigate(`/faculty/claim/teaching?examId=${id}`);
  };

  return (
    <div>
      <h3 className="font-semibold mb-4">My Claims</h3>

      <ul className="space-y-2">
        {claims.map(c => (
          <li key={c.id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <div className="font-medium">
                {c.subject_name || "Subject"}
              </div>
              <div className="text-sm text-muted-foreground">
                Status: {c.status} • ₹{c.total_amount || 0}
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => handleView(c.id)}>
              View
            </Button>

          </li>
        ))}
      </ul>
    </div>
  );
}
