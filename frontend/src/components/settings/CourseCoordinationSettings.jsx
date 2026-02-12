import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { SearchIcon, AlertCircleIcon } from "../../components/icons/logo";

const SEMESTERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export default function CourseCoordinationSettings() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showResults, setShowResults] = useState(false);
    const wrapperRef = useRef(null);

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignLoading, setAssignLoading] = useState(false);

    const [formData, setFormData] = useState({
        academic_year: '2024-25',
        semester: 'I',
        course_id: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesRes, assignmentsRes] = await Promise.all([
                api.get('/coordinator/courses'),
                api.get('/coordinator/assignments')
            ]);
            setCourses(coursesRes.data);
            setAssignments(assignmentsRes.data);
        } catch (error) {
            console.error("Failed to fetch coordination data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setShowResults(true);

        if (!term.trim()) {
            setFilteredCourses([]);
            return;
        }

        const lowerTerm = term.toLowerCase().trim();
        const filtered = courses.filter(course =>
            course.code?.toLowerCase().includes(lowerTerm) ||
            course.name?.toLowerCase().includes(lowerTerm)
        );
        setFilteredCourses(filtered);

        // Clear selection if typing
        setFormData(prev => ({ ...prev, course_id: '' }));
    };

    const selectCourse = (course) => {
        setFormData(prev => ({ ...prev, course_id: course.id }));
        setSearchTerm(`${course.code} - ${course.name}`);
        setShowResults(false);
        setFilteredCourses([]);
    };

    const clearSelection = () => {
        setFormData(prev => ({ ...prev, course_id: '' }));
        setSearchTerm("");
        setFilteredCourses([]);
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!formData.course_id) {
            setMessage({ type: 'error', text: 'Please select a valid course from the list' });
            return;
        }

        try {
            setAssignLoading(true);
            setMessage({ type: '', text: '' });

            await api.post('/coordinator/assign', formData);

            setMessage({ type: 'success', text: 'Successfully assigned as Coordinator' });
            setSearchTerm(""); // Clear search
            setFormData(prev => ({ ...prev, course_id: '' })); // Clear selection
            fetchData(); // Refresh list
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to assign coordinator'
            });
        } finally {
            setAssignLoading(false);
        }
    };

    if (loading) return <div>Loading coordination settings...</div>;

    return (
        <div className="bg-card rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Course Coordination</h2>
            <p className="text-muted-foreground text-sm mb-6">
                Assign yourself as a Course Coordinator for a specific subject and term.
                You can only be a coordinator for one subject per term.
            </p>

            {message.text && (
                <div className={`p-3 rounded mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleAssign} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Academic Year</label>
                        <select
                            className="w-full p-2 border rounded bg-background"
                            value={formData.academic_year}
                            onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                        >
                            <option value="2024-25">2024-25</option>
                            <option value="2025-26">2025-26</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Semester</label>
                        <select
                            className="w-full p-2 border rounded bg-background"
                            value={formData.semester}
                            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        >
                            {SEMESTERS.map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>

                    {/* Searchable Course Input */}
                    <div ref={wrapperRef} className="relative">
                        <label className="block text-sm font-medium mb-1">Course / Subject</label>
                        <div className="relative">
                            <input
                                className={`w-full p-2 border rounded bg-background pr-8 ${!formData.course_id && searchTerm ? 'border-yellow-500 fa-shake' : ''}`}
                                placeholder="Search code or name..."
                                value={searchTerm}
                                onChange={handleSearch}
                                onFocus={() => {
                                    if (!searchTerm && courses.length > 0) {
                                        setFilteredCourses(courses);
                                        setShowResults(true);
                                    }
                                }}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {searchTerm ? (
                                    <button type="button" onClick={clearSelection}>✕</button>
                                ) : (
                                    <SearchIcon className="w-4 h-4" />
                                )}
                            </div>
                        </div>

                        {/* Dropdown Results */}
                        {showResults && (
                            <div className="absolute z-10 left-0 top-full mt-1 w-full bg-card dark:bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredCourses.length > 0 ? (
                                    filteredCourses.map((course) => (
                                        <button
                                            key={course.id}
                                            onClick={() => selectCourse(course)}
                                            type="button"
                                            className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b last:border-0 border-gray-100 text-sm"
                                        >
                                            <div className="font-medium">{course.name}</div>
                                            <div className="text-xs text-muted-foreground">{course.code}</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-center text-muted-foreground text-sm">
                                        No courses found
                                    </div>
                                )}
                            </div>
                        )}
                        {!formData.course_id && searchTerm && (
                            <p className="text-xs text-yellow-600 mt-1">Please select from likely matches</p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={assignLoading}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                >
                    {assignLoading ? 'Assigning...' : 'Assign as Coordinator'}
                </button>
            </form>

            {assignments.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium mb-3">Your Active Assignments</h3>
                    <div className="border rounded overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="p-3">Course</th>
                                    <th className="p-3">Year</th>
                                    <th className="p-3">Semester</th>
                                    <th className="p-3">Assigned Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((assign) => (
                                    <tr key={assign.id} className="border-t">
                                        <td className="p-3 font-medium">{assign.code} - {assign.name}</td>
                                        <td className="p-3">{assign.academic_year}</td>
                                        <td className="p-3">Sem {assign.semester}</td>
                                        <td className="p-3">{new Date(assign.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
