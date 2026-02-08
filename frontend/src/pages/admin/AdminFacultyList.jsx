import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

// Icons
import {
    UsersIcon,
    EyeIcon,
    FileTextIcon,
    CheckCircleIcon,
    XCircleIcon
} from "../../components/icons/logo";

export default function AdminFacultyList() {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            const res = await api.get("/admin/faculty");
            setFaculty(res.data);
        } catch (err) {
            console.error("Failed to fetch faculty:", err);
            setFaculty([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredFaculty = faculty.filter(f =>
        f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-card-foreground">Faculty Oversight</h1>
                <p className="text-muted-foreground">Monitor faculty claims and profiles</p>
            </div>

            {/* Search */}
            <Card className="p-6 bg-card border-border">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Search by name, email, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </Card>

            {/* Faculty Table */}
            <Card className="bg-card border-border">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading faculty...</p>
                    </div>
                ) : filteredFaculty.length === 0 ? (
                    <div className="p-12 text-center">
                        <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            {faculty.length === 0 ? "No faculty found" : "No matching faculty"}
                        </h3>
                        <p className="text-muted-foreground">
                            {faculty.length === 0
                                ? "There are no faculty members in the system."
                                : "Try adjusting your search criteria."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Total Claims
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Pending
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Rejected
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredFaculty.map((f) => (
                                    <tr key={f.id} className="hover:bg-purple-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-foreground">{f.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-foreground">{f.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-foreground">{f.department || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <FileTextIcon className="w-3 h-3 mr-1" />
                                                {f.total_claims || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                {f.pending_claims || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {f.rejected_claims > 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <XCircleIcon className="w-3 h-3 mr-1" />
                                                    {f.rejected_claims}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => navigate(`/admin/faculty/${f.id}`)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                            >
                                                <EyeIcon className="w-4 h-4 mr-1" />
                                                View Profile
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                {filteredFaculty.length > 0 && (
                    <div className="px-6 py-4 bg-muted border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-semibold">{filteredFaculty.length}</span> of{" "}
                            <span className="font-semibold">{faculty.length}</span> faculty members
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
