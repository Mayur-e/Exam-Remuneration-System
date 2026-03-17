import React, { useState } from "react";
import { XCircleIcon as X } from "./icons/logo";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { PROGRAM_DEPARTMENTS } from "../constants/departments";

export default function ExportFilterModal({ isOpen, onClose, onExport, isAdmin }) {
    const [filters, setFilters] = useState({
        academic_year: "",
        department: "",
        program: "",
        level: "",
        exam_type: []
    });
    const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);

    const PROGRAM_MAPPING = {
        "BTECH": "B.Tech.",
        "MTECH": "M.Tech.",
        "MCA": "MCA",
        "PHD": "Ph.D."
    };

    const PROGRAM_LEVELS = {
        "BTECH": [
            { value: "FY", label: "First Year (FY)" },
            { value: "SY", label: "Second Year (SY)" },
            { value: "TY", label: "Third Year (TY)" },
            { value: "FINAL", label: "Final Year" }
        ],
        "MTECH": [
            { value: "FY", label: "First Year (FY)" },
            { value: "SY", label: "Second Year (SY)" }
        ],
        "MCA": [
            { value: "FY", label: "First Year (FY)" },
            { value: "SY", label: "Second Year (SY)" }
        ],
        "PHD": [
            { value: "FY", label: "First Year (FY)" },
            { value: "SY", label: "Second Year (SY)" },
            { value: "TY", label: "Third Year (TY)" },
            { value: "FINAL", label: "Final Year" }
        ]
    };

    const EXAM_TYPES = [
        { value: "PR", label: "Practical (PR)", programs: ["BTECH", "MTECH", "MCA", "PHD"] },
        { value: "OR", label: "Oral (OR)", programs: ["BTECH", "MTECH", "MCA", "PHD"] },
        { value: "TW", label: "Term Work (TW)", programs: ["BTECH", "MTECH", "MCA", "PHD"] },
        { value: "Project_Seminar_MiniProject", label: "Project / Seminar / MiniProject", programs: ["BTECH", "MTECH", "MCA", "PHD"] },
        { value: "BTech_Project_Stage1", label: "B.Tech Project Stage 1", programs: ["BTECH"] },
        { value: "BTech_Project_Stage2", label: "B.Tech Project Stage 2", programs: ["BTECH"] },
        { value: "MTech_MiniProject", label: "M.Tech MiniProject", programs: ["MTECH"] },
        { value: "MTech_Seminar", label: "M.Tech Seminar", programs: ["MTECH"] },
        { value: "MTech_Project_Stage1", label: "M.Tech Project Stage 1", programs: ["MTECH"] },
        { value: "MTech_Dissertation", label: "M.Tech Dissertation", programs: ["MTECH"] },
        { value: "MCA_MiniProject", label: "MCA MiniProject", programs: ["MCA"] },
        { value: "MCA_MajorProject", label: "MCA MajorProject", programs: ["MCA"] },
        { value: "Audit_Course", label: "Audit Course", programs: ["BTECH", "MTECH", "MCA", "PHD"] }
    ];

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            // Auto-reset dependent fields if program changes
            if (name === "program") {
                newFilters.level = "";
                newFilters.department = "";

                // Clear exam_type if no longer applicable to the new program
                const validExamTypes = value
                    ? EXAM_TYPES.filter(t => t.programs.includes(value)).map(t => t.value)
                    : EXAM_TYPES.map(t => t.value);

                newFilters.exam_type = newFilters.exam_type.filter(et => validExamTypes.includes(et));
            }
            return newFilters;
        });
    };

    const toggleExamType = (typeValue) => {
        setFilters(prev => {
            const current = [...prev.exam_type];
            if (current.includes(typeValue)) {
                return { ...prev, exam_type: current.filter(t => t !== typeValue) };
            } else {
                return { ...prev, exam_type: [...current, typeValue] };
            }
        });
    };

    const getAvailableExamTypes = () => {
        if (!filters.program) return EXAM_TYPES;
        return EXAM_TYPES.filter(type => type.programs.includes(filters.program));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onExport(filters);
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card text-card-foreground p-6 rounded-xl shadow-xl w-full max-w-md relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-xl font-bold mb-6">Export Billing Excel</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Academic Year</label>
                            <select
                                name="academic_year"
                                value={filters.academic_year}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-background focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-slate-700"
                            >
                                <option value="">All Years</option>
                                <option value="2023-24">2023-24</option>
                                <option value="2024-25">2024-25</option>
                                <option value="2025-26">2025-26</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Programme</label>
                            <select
                                name="program"
                                value={filters.program}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-background focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-slate-700"
                            >
                                <option value="">All Programmes</option>
                                {Object.entries(PROGRAM_MAPPING).map(([dbProg, displayProg]) => (
                                    <option key={dbProg} value={dbProg}>{displayProg}</option>
                                ))}
                            </select>
                        </div>

                        {isAdmin && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Department</label>
                                <select
                                    name="department"
                                    value={filters.department}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-background focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                                    disabled={!filters.program}
                                >
                                    <option value="">All Departments</option>
                                    {filters.program && PROGRAM_DEPARTMENTS[PROGRAM_MAPPING[filters.program]]?.map((deptName) => (
                                        <option key={deptName} value={deptName}>
                                            {deptName}
                                        </option>
                                    ))}
                                    {!filters.program && Object.entries(PROGRAM_DEPARTMENTS).map(([program, depts]) => (
                                        <optgroup key={program} label={program}>
                                            {depts.map((deptName) => (
                                                <option key={deptName} value={deptName}>
                                                    {deptName}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Class Year (Level)</label>
                            <select
                                name="level"
                                value={filters.level}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-background focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                                disabled={!filters.program} // Disable if no program selected
                            >
                                <option value="">All Classes</option>
                                {filters.program && PROGRAM_LEVELS[filters.program]?.map(lvl => (
                                    <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Exam Types Multi-select Dropdown */}
                        <div className="relative">
                            <label className="block text-sm font-medium mb-1.5 text-slate-700">Exam Types</label>
                            
                            {/* Click outside overlay */}
                            {isExamDropdownOpen && (
                                <div 
                                    className="fixed inset-0 z-40 cursor-default" 
                                    onClick={() => setIsExamDropdownOpen(false)}
                                />
                            )}
                            
                            <button
                                type="button"
                                onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
                                className={`w-full px-4 py-3 border rounded-xl bg-background flex justify-between items-center text-sm transition-all duration-200 relative z-50 ${
                                    isExamDropdownOpen 
                                    ? 'ring-2 ring-emerald-500/20 border-emerald-500 shadow-sm' 
                                    : 'border-slate-200 hover:border-slate-300 shadow-none'
                                }`}
                            >
                                <span className={`font-semibold truncate max-w-[280px] ${filters.exam_type.length === 0 ? 'text-slate-500' : 'text-slate-700'}`}>
                                    {filters.exam_type.length === 0 
                                        ? "All Exams Selected" 
                                        : filters.exam_type.length === getAvailableExamTypes().length
                                            ? "All Exams Selected"
                                            : `${filters.exam_type.length} Types Selected`}
                                </span>
                                <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isExamDropdownOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            </button>
                            
                            <AnimatePresence>
                                {isExamDropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-2xl p-2 space-y-0.5"
                                    >
                                        <label className="flex items-center gap-3 p-2.5 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.exam_type.length === 0 || filters.exam_type.length === getAvailableExamTypes().length}
                                                    onChange={() => {
                                                        setFilters(prev => ({ ...prev, exam_type: [] }));
                                                        // Keep open to let user see the change, or close? 
                                                        // Usually keep open for multi-select.
                                                    }}
                                                    className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 transition-all cursor-pointer"
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">All Exams</span>
                                        </label>
                                        <div className="border-t border-slate-100 my-1 mx-2"></div>
                                        {getAvailableExamTypes().map((type) => (
                                            <label key={type.value} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.exam_type.includes(type.value)}
                                                    onChange={() => toggleExamType(type.value)}
                                                    className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 cursor-pointer"
                                                />
                                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors truncate">{type.label}</span>
                                            </label>
                                        ))}
                                        {getAvailableExamTypes().length === 0 && (
                                            <p className="text-sm text-slate-400 italic p-4 text-center">No types for selected program</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white">
                                Download Excel
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
