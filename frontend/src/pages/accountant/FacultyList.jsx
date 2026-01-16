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
  EyeIcon,
  FilterIcon
} from "../../components/icons/logo";

export default function FacultyList() {
  const [faculty, setFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    filterFaculty();
  }, [faculty, searchTerm, departmentFilter]);

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
        (f.email && f.email.toLowerCase().includes(term)) ||
        (f.department && f.department.toLowerCase().includes(term))
      );
    }

    // Apply department filter
    if (departmentFilter !== "ALL") {
      result = result.filter(f => f.department === departmentFilter);
    }

    setFilteredFaculty(result);
  };

  const getDepartments = () => {
    const departments = Array.from(new Set(faculty.map(f => f.department).filter(Boolean)));
    return departments.sort();
  };

  const getDepartmentCount = (dept) => {
    return faculty.filter(f => f.department === dept).length;
  };

  if (loading) {
    return (
      <Card className="p-6 bg-white border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading faculty list...</p>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Faculty Directory</h1>
          <p className="text-gray-600">View and manage faculty members</p>
        </div>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
          {faculty.length} {faculty.length === 1 ? 'faculty' : 'faculty members'}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Faculty</p>
              <p className="text-2xl font-bold text-gray-800">{faculty.length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Departments</p>
              <p className="text-2xl font-bold text-gray-800">{getDepartments().length}</p>
            </div>
            <BuildingOfficeIcon className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Claims</p>
              <p className="text-2xl font-bold text-gray-800">
                {faculty.reduce((sum, f) => sum + parseInt(f.active_claims || 0), 0)}
              </p>
            </div>
            <EyeIcon className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <FilterIcon className="w-5 h-5 text-gray-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Departments</option>
                {getDepartments().map((dept) => (
                  <option key={dept} value={dept}>
                    {dept} ({getDepartmentCount(dept)})
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setDepartmentFilter("ALL");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Faculty Table */}
      {filteredFaculty.length === 0 ? (
        <Card className="p-8 bg-white border-gray-200">
          <div className="text-center py-8">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {faculty.length === 0 ? "No Faculty Found" : "No Matching Faculty"}
            </h3>
            <p className="text-gray-500">
              {faculty.length === 0
                ? "No faculty members are registered in the system."
                : "Try changing your search or filter criteria."}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden bg-white border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Faculty Member
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Claims
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFaculty.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200 flex items-center justify-center mr-3">
                          <span className="font-semibold text-blue-600">
                            {f.name?.charAt(0) || "F"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{f.name || "Unnamed Faculty"}</p>
                          <p className="text-sm text-gray-500">{f.role || "Faculty"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{f.department || "No Department"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MailIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate max-w-xs">
                          {f.email || "No Email"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {parseInt(f.active_claims || 0)} active
                        </span>
                        <span className="text-sm text-gray-500">
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
      )}

      {/* Summary */}
      {filteredFaculty.length > 0 && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredFaculty.length} of {faculty.length} faculty members
            </p>
            <div className="flex gap-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Departments:</span> {getDepartments().length}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Total Claims:</span> {faculty.reduce((sum, f) => sum + parseInt(f.total_claims || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}