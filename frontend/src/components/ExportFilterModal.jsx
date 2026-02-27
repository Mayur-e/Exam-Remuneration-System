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
        exam_type: ""
    });

    const PROGRAM_MAPPING = {
        "BTECH": "B.Tech",
        "MTECH": "M.Tech",
        "MCA": "MCA",
        "PHD": "Ph.D"
    };

    const PROGRAM_LEVELS = {
        "BTECH": ["FY", "SY", "TY", "Final Year"],
        "MTECH": ["FY M.Tech", "SY M.Tech"],
        "MCA": ["FY MCA", "SY MCA"],
        "PHD": ["Coursework", "Research"]
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            // Auto-reset level if program changes to avoid invalid combinations
            if (name === "program") {
                newFilters.level = "";
            }
            return newFilters;
        });
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
                                className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Years</option>
                                <option value="2023-24">2023-24</option>
                                <option value="2024-25">2024-25</option>
                                <option value="2025-26">2025-26</option>
                            </select>
                        </div>

                        {isAdmin && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Department</label>
                                <select
                                    name="department"
                                    value={filters.department}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">All Departments</option>
                                    {Object.entries(PROGRAM_DEPARTMENTS).map(([program, depts]) => (
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
                            <label className="block text-sm font-medium mb-1">Programme</label>
                            <select
                                name="program"
                                value={filters.program}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Programmes</option>
                                {Object.entries(PROGRAM_MAPPING).map(([dbProg, displayProg]) => (
                                    <option key={dbProg} value={dbProg}>{displayProg}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Class Year (Level)</label>
                            <select
                                name="level"
                                value={filters.level}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-purple-500"
                                disabled={!filters.program} // Disable if no program selected
                            >
                                <option value="">All Classes</option>
                                {filters.program && PROGRAM_LEVELS[filters.program]?.map(lvl => (
                                    <option key={lvl} value={lvl}>{lvl} {PROGRAM_MAPPING[filters.program]}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Exam Type</label>
                            <select
                                name="exam_type"
                                value={filters.exam_type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Exam Types</option>
                                <option value="PR">Practical (PR)</option>
                                <option value="OR">Oral (OR)</option>
                                <option value="TW">Term Work (TW)</option>
                            </select>
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
