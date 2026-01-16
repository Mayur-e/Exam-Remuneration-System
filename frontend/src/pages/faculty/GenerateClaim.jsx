import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

// Icons
import {
  FileTextIcon,
  UserIcon,
  UsersIcon,
  ClockIcon,
  TrashIcon,
  EditIcon
} from "../../components/icons/logo";

export default function GenerateClaim() {
  const navigate = useNavigate();

  const handleEditDraft = (draft) => {
    // Route to appropriate form based on claim_form_type
    if (draft.claim_form_type === 'NON_TEACHING') {
      navigate(`/faculty/claim/non-teaching?examId=${draft.id}`);
    } else if (draft.claim_form_type === 'TEACHING_EXTERNAL') {
      navigate(`/faculty/claim/teaching?examId=${draft.id}&claimType=TEACHING_EXTERNAL`);
    } else {
      // Default to TEACHING_INTERNAL
      navigate(`/faculty/claim/teaching?examId=${draft.id}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Generate Claim</h1>
        <p className="text-gray-600">Create new claims or continue from saved drafts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Claim Type Selection */}
        <div className="space-y-6">
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileTextIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Select Claim Type</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <Button
                  onClick={() => navigate("/faculty/claim/teaching?claimType=TEACHING_INTERNAL")}
                  className="w-full h-auto py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col items-center gap-2">
                    <UserIcon className="w-6 h-6" />
                    <span className="text-lg">Teaching Staff Claim</span>
                    <span className="text-sm opacity-90">(Internal Examiner)</span>
                  </div>
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200">
                <Button
                  variant="outline"
                  onClick={() => navigate("/faculty/claim/teaching?claimType=TEACHING_EXTERNAL")}
                  className="w-full h-auto py-4 border-green-400 hover:border-green-500 hover:bg-green-50 text-green-700 font-semibold"
                >
                  <div className="flex flex-col items-center gap-2">
                    <UsersIcon className="w-6 h-6" />
                    <span className="text-lg">Teaching Staff Claim</span>
                    <span className="text-sm opacity-90">(External Examiner)</span>
                  </div>
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
                <Button
                  onClick={() => navigate("/faculty/claim/non-teaching")}
                  variant="outline"
                  className="w-full h-auto py-4 border-purple-400 hover:border-purple-500 hover:bg-purple-50 text-purple-700 font-semibold"
                >
                  <div className="flex flex-col items-center gap-2">
                    <UsersIcon className="w-6 h-6" />
                    <span className="text-lg">Non-Teaching Staff Claim</span>
                    <span className="text-sm opacity-90">(Support Staff)</span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Average Processing</p>
                <p className="text-xl font-bold text-blue-600">7-10 Days</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">TDS Rate</p>
                <p className="text-xl font-bold text-blue-600">10%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Drafts List */}
        <div>
          <DraftList onEdit={handleEditDraft} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Draft List Component                                                */
/* ------------------------------------------------------------------ */

function DraftList({ onEdit }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api
      .get("/faculty/drafts")
      .then((res) => setDrafts(res.data))
      .catch(() => setDrafts([]))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) return;

    try {
      await api.delete(`/faculty/drafts/${id}`);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Failed to delete draft. Please try again.");
    }
  };

  const filteredDrafts = drafts.filter(draft =>
    draft.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.exam_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="p-6 bg-white border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">Loading drafts...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-gray-200 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileTextIcon className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Saved Drafts</h2>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
          {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
        </span>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search drafts by subject or exam type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileTextIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No saved drafts</h3>
          <p className="text-gray-500">Create a new claim to get started</p>
        </div>
      ) : filteredDrafts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No drafts match your search</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrafts.map((draft) => (
            <div key={draft.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{draft.subject_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {draft.exam_type}
                    </span>
                    {draft.claim_form_type === 'NON_TEACHING' && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        Non-Teaching
                      </span>
                    )}
                    {draft.claim_form_type === 'TEACHING_EXTERNAL' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        External
                      </span>
                    )}
                    {draft.claim_form_type === 'TEACHING_INTERNAL' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Internal
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      <ClockIcon className="w-3 h-3 inline mr-1" />
                      {new Date(draft.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(draft)}
                  className="flex items-center gap-2"
                >
                  <EditIcon className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => remove(draft.id)}
                  className="flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {drafts.length > 0 && filteredDrafts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Drafts are automatically saved. You can edit or delete them anytime.
          </p>
        </div>
      )}
    </Card>
  );
}