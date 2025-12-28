import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

// Icons
import {
  FileTextIcon,
  EyeIcon,
  SearchIcon,
  FilterIcon,
  CheckCircleIcon,
  ClockIcon,
  XIcon
} from "../../components/icons/logo";

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    filterClaims();
  }, [claims, searchTerm, statusFilter]);

  const fetchClaims = async () => {
    try {
      const res = await api.get("/faculty/exams");
      setClaims(res.data || []);
    } catch (err) {
      console.error("Failed to fetch claims", err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const filterClaims = () => {
    let result = [...claims];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        (c.subject_name || "").toLowerCase().includes(term) ||
        (c.exam_type || "").toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(c => c.status === statusFilter);
    }

    setFilteredClaims(result);
  };

  const handleView = (id) => {
    navigate(`/faculty/claim/teaching?examId=${id}`);
  };

  const getStatusBadge = (status) => {
    const config = {
      draft: {
        label: "draft",
        color: "bg-yellow-100 text-yellow-800",
        icon: <XIcon className="w-3 h-3" />
      },
      submitted: {
        label: "Submitted",
        color: "bg-yellow-100 text-yellow-800",
        icon: <ClockIcon className="w-3 h-3" />
      },
      approved: {
        label: "Approved",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircleIcon className="w-3 h-3" />
      },
      rejected: {
        label: "Rejected",
        color: "bg-red-100 text-red-800",
        icon: <XIcon className="w-3 h-3" />
      }
    };

    const s = config[status] || config.submitted;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>
        {s.icon}
        {s.label}
      </span>
    );
  };

  const getStatusCount = (status) =>
    claims.filter(c => c.status === status).length;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-10">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading your claims...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Claims</h1>
        <p className="text-gray-600">Submitted examination claims</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Claims</p>
          <p className="text-2xl font-bold">{claims.length}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-500">Submitted</p>
          <p className="text-2xl font-bold text-yellow-600">
            {getStatusCount("submitted")}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {getStatusCount("approved")}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search by subject or exam type"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="ALL">All</option>
              <option value="draft">draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* List */}
      {filteredClaims.length === 0 ? (
        <Card className="p-8 text-center">
          <FileTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No claims found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredClaims.map(c => (
            <Card key={c.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">
                    {c.subject_name || "Unnamed Subject"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {c.exam_type}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    ₹ {c.total_amount || "0.00"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(c.status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(c.id)}
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
