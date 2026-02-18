import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api"; // Ensure this import path is correct

export default function StudentCountManagement() {
    const [counts, setCounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [academicYears, setAcademicYears] = useState([]);

    // Filters
    const [selectedYear, setSelectedYear] = useState("2024-25");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [subjectSearch, setSubjectSearch] = useState("");

    // Form State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        subject_code: "",
        academic_year: "2024-25",
        semester: "I",
        registered_count: ""
    });
    const [saving, setSaving] = useState(false);

    // Subject Search State
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        fetchAcademicYears();
    }, []);

    useEffect(() => {
        if (selectedYear) {
            setFormData(prev => ({ ...prev, academic_year: selectedYear }));
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchCounts();
    }, [selectedYear, selectedSemester, subjectSearch]);

    const fetchAcademicYears = async () => {
        try {
            const response = await api.get("/admin/rates/academic-years");
            const years = response.data || ["2024-25"];
            setAcademicYears(years);
            if (years.length > 0) setSelectedYear(years[0]);
        } catch (error) {
            console.error("Fetch years error:", error);
            setAcademicYears(["2024-25"]);
        }
    };

    const fetchCounts = async () => {
        setLoading(true);
        try {
            const params = {
                academic_year: selectedYear,
                semester: selectedSemester || undefined,
                subject_code: subjectSearch || undefined
            };
            const response = await api.get("/admin/subjects/counts", { params });
            setCounts(response.data);
        } catch (error) {
            console.error("Fetch counts error:", error);
            showToast("Failed to fetch student counts", "error");
        } finally {
            setLoading(false);
        }
    };

    // Subject Search Handler
    const handleSubjectSearch = async (query) => {
        setFormData(prev => ({ ...prev, subject_code: query }));

        if (!query || query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const res = await api.get(`/faculty/subjects?query=${encodeURIComponent(query)}`);
            setSearchResults(res.data);
            setShowResults(true);
        } catch (err) {
            console.error("Search failed:", err);
        }
    };

    const selectSubject = (subject) => {
        setFormData(prev => ({
            ...prev,
            subject_code: subject.code,
            // We can also store subject name if we want to display it
        }));
        setShowResults(false);
        setSearchResults([]);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.subject_code || !formData.registered_count) {
            showToast("Please fill all required fields", "error");
            return;
        }

        setSaving(true);
        try {
            await api.post("/admin/subjects/counts", {
                ...formData,
                registered_count: parseInt(formData.registered_count)
            });
            showToast("Student count updated successfully", "success");
            setShowModal(false);
            setFormData({
                subject_code: "",
                academic_year: selectedYear,
                semester: "I",
                registered_count: ""
            });
            fetchCounts();
        } catch (error) {
            console.error("Save count error:", error);
            showToast(error.response?.data?.message || "Failed to save count", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                    <div className="flex gap-4 flex-wrap flex-1">
                        <div className="w-48">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Academic Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="">Select Year</option>
                                {academicYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-48">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Semester</label>
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="">All Semesters</option>
                                {["I", "II", "III", "IV", "V", "VI", "VII", "VIII"].map(sem => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Search Subject</label>
                            <Input
                                placeholder="Search by code or name..."
                                value={subjectSearch}
                                onChange={(e) => setSubjectSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                        + Add Registered Count
                    </Button>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Academic Year</th>
                                <th className="px-6 py-3">Year</th>
                                <th className="px-6 py-3">Semester</th>
                                <th className="px-6 py-3">Subject Code</th>
                                <th className="px-6 py-3">Subject Name</th>
                                <th className="px-6 py-3">Registered Count</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                            ) : counts.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-4 text-gray-500">No subjects found.</td></tr>
                            ) : (
                                counts.map((item, idx) => (
                                    <tr key={idx} className={`border-b hover:bg-gray-50 ${!item.is_set ? 'bg-gray-50/50' : 'bg-white'}`}>
                                        <td className="px-6 py-4 text-gray-500">{item.academic_year || '-'}</td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">{item.year || '-'}</td>
                                        <td className="px-6 py-4 text-gray-500">{item.semester || '-'}</td>
                                        <td className="px-6 py-4 font-mono text-purple-600 font-medium">{item.subject_code}</td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={item.subject_name}>{item.subject_name || '-'}</td>
                                        <td className="px-6 py-4">
                                            {item.is_set ? (
                                                <span className="font-bold text-gray-900">{item.registered_count}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">Not Set</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.is_set ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    setFormData({
                                                        subject_code: item.subject_code,
                                                        academic_year: item.academic_year || selectedYear,
                                                        semester: item.semester || "I",
                                                        registered_count: item.registered_count || ""
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="text-blue-600 hover:underline font-medium"
                                            >
                                                {item.is_set ? "Edit" : "Set Limit"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-bold">Set Registered Student Count</h3>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium mb-1">Subject Code</label>
                                <Input
                                    value={formData.subject_code}
                                    onChange={e => handleSubjectSearch(e.target.value.toUpperCase())}
                                    placeholder="Search e.g. CS101"
                                    required
                                    autoComplete="off"
                                />
                                {showResults && searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {searchResults.map((subject) => (
                                            <div
                                                key={subject.code}
                                                className="px-4 py-2 hover:bg-purple-50 cursor-pointer border-b last:border-0"
                                                onClick={() => selectSubject(subject)}
                                            >
                                                <div className="font-medium text-purple-700">{subject.code}</div>
                                                <div className="text-xs text-gray-600 truncate">{subject.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Start typing to search existing subjects</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Academic Year</label>
                                    <select
                                        value={formData.academic_year}
                                        onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        {academicYears.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Semester</label>
                                    <select
                                        value={formData.semester}
                                        onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">Select</option>
                                        {["I", "II", "III", "IV", "V", "VI", "VII", "VIII"].map(sem => (
                                            <option key={sem} value={sem}>{sem}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Registered Student Count</label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.registered_count}
                                    onChange={e => setFormData({ ...formData, registered_count: e.target.value })}
                                    placeholder="e.g. 60"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Total allowed students for this subject/sem</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" onClick={() => setShowModal(false)} className="bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Save Count"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
