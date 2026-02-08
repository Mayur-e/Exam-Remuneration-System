import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

// Icons
import {
  UsersIcon,
  SearchIcon,
  BuildingOfficeIcon,
  MailIcon,
  EyeIcon
} from "../../components/icons/logo";

export default function FacultyList() {
  const [faculty, setFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    filterFaculty();
  }, [faculty, searchTerm]);

  const fetchFaculty = async () => {
    try {
      const res = await api.get("/accountant/faculty");
      setFaculty(res.data);
      setFilteredFaculty(res.data);
    } catch (error) {
      console.error("Failed to fetch faculty:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFaculty = () => {
    let result = faculty;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(f =>
        (f.name && f.name.toLowerCase().includes(term)) ||
        (f.email && f.email.toLowerCase().includes(term))
      );
    }

    setFilteredFaculty(result);
  };



  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading faculty list...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2">Faculty Directory</h1>
          <p className="text-muted-foreground">View and manage faculty members</p>
        </div>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
          {faculty.length} {faculty.length === 1 ? 'faculty' : 'faculty members'}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Faculty</p>
              <p className="text-2xl font-bold text-card-foreground">{faculty.length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-blue-500" />
          </div>
        </Card>



        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Claims</p>
              <p className="text-2xl font-bold text-card-foreground">
                {faculty.reduce((sum, f) => sum + parseInt(f.active_claims || 0), 0)}
              </p>
            </div>
            <EyeIcon className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border"
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Faculty Table */}
      {
        filteredFaculty.length === 0 ? (
          <Card className="p-8 bg-card border-border">
            <div className="text-center py-8">
              <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {faculty.length === 0 ? "No Faculty Found" : "No Matching Faculty"}
              </h3>
              <p className="text-muted-foreground">
                {faculty.length === 0
                  ? "No faculty members are registered in the system."
                  : "Try changing your search or filter criteria."}
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden bg-card border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Faculty Member
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Department
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Claims
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFaculty.map((f) => (
                    <tr
                      key={f.id}
                      className="hover:bg-muted transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200 flex items-center justify-center mr-3">
                            <span className="font-semibold text-blue-600">
                              {f.name?.charAt(0) || "F"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{f.name || "Unnamed Faculty"}</p>
                            <p className="text-sm text-muted-foreground">{f.role || "Faculty"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{f.department || "No Department"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MailIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate max-w-xs">
                            {f.email || "No Email"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {parseInt(f.active_claims || 0)} active
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {parseInt(f.total_claims || 0)} total
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/accountant/faculty/${f.id}`)}
                          className="flex items-center gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      }

      {/* Summary */}
      {
        filteredFaculty.length > 0 && (
          <Card className="p-4 bg-muted border-border">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredFaculty.length} of {faculty.length} faculty members
              </p>
              <div className="flex gap-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Total Claims:</span> {faculty.reduce((sum, f) => sum + parseInt(f.total_claims || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        )
      }
    </div>
  );
}