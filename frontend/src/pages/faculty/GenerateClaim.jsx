import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function GenerateClaim() {
  const navigate = useNavigate();

  const handleEditDraft = (examId) => {
    navigate(`/faculty/claim/teaching?examId=${examId}`);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Generate Claim</h2>

      {/* Claim type selection */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Select Claim Type</h3>

        <Button
          className="w-full"
          onClick={() => navigate("/faculty/claim/teaching")}
        >
          Teaching Staff Claim (PR / OR / TW / Project)
        </Button>

        <Button disabled variant="outline" className="w-full">
          Non-Teaching Staff Claim (Coming Soon)
        </Button>
      </Card>

      {/* Draft list */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Saved Drafts</h3>
        <DraftList onEdit={handleEditDraft} />
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Draft List Component                                                */
/* ------------------------------------------------------------------ */

function DraftList({ onEdit }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/faculty/drafts")
      .then((res) => setDrafts(res.data))
      .catch(() => setDrafts([]))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this draft?")) return;

    try {
      await api.delete(`/faculty/drafts/${id}`);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Failed to delete draft");
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading drafts...</p>;
  }

  if (drafts.length === 0) {
    return <p className="text-sm text-muted-foreground">No saved drafts</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="border px-3 py-2 text-left">Subject</th>
            <th className="border px-3 py-2 text-left">Exam Type</th>
            <th className="border px-3 py-2 text-left">Created</th>
            <th className="border px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {drafts.map((d) => (
            <tr key={d.id}>
              <td className="border px-3 py-2">{d.subject_name}</td>
              <td className="border px-3 py-2">{d.exam_type}</td>
              <td className="border px-3 py-2">
                {new Date(d.created_at).toLocaleDateString()}
              </td>
              <td className="border px-3 py-2 space-x-2">
                <Button size="sm" onClick={() => onEdit(d.id)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => remove(d.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
