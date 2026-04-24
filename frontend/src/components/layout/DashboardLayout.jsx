import { Outlet, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    UserIcon,
    ChevronRightIcon,
    LogoutIcon
} from "../icons/logo";
import api from "../../services/api";

/**
 * Shared Dashboard Layout Component
 * Used by Admin, Faculty, and Accountant panels
 * 
 * @param {Object} props
 * @param {string} props.role - User role (ADMIN, FACULTY, ACCOUNTANT)
 * @param {Array} props.navItems - Navigation items array
 * @param {Object} props.branding - Branding configuration (title, subtitle, icon)
 */
export default function DashboardLayout({ role, navItems, branding }) {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

    useEffect(() => {
        api.get("/auth/me")
            .then(res => {
                setUser(res.data);
                // Also keep localStorage in sync so other components see latest data
                const stored = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...stored, ...res.data }));
            })
            .catch(() => {
                // Silently fall back to cached localStorage value
            });
    }, []);

    const logout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-display text-slate-900">
            {/* Top Header - Fixed */}
            <header className="h-[80px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 fixed top-0 w-full z-50 shadow-sm">
                <div className="flex items-center gap-4 h-full">
                    {/* PCCOE Logo */}
                    <img
                        src="/pccoe-logo.png"
                        alt="PCCOE Logo"
                        className="h-12 w-auto object-contain cursor-pointer"
                    />
                    <div className="hidden sm:block border-l-2 border-slate-200 h-10 ml-2 pl-4 flex flex-col justify-center">
                        <h1 className="font-bold text-lg leading-tight text-primary uppercase tracking-wide">{branding.title}</h1>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{branding.subtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-xl font-extrabold text-slate-800 tracking-tight flex items-baseline justify-end gap-1.5"><span className="text-slate-500 font-medium text-[15px] tracking-normal">Welcome,</span>{user?.name || role}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{user?.role || role}</p>
                    </div>

                    <div className="relative group">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-200 cursor-pointer transition-colors shadow-sm relative z-20 group-hover:border-primary">
                            <UserIcon className="w-6 h-6 text-primary" />
                        </div>

                        {/* Profile Details Tooltip */}
                        <div className="absolute right-0 top-full mt-3 w-max min-w-[240px] max-w-[280px] bg-slate-800 text-white rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-50 border border-slate-700 p-1.5 flex flex-col pb-0">
                            {/* Pointer Triangle */}
                            <div className="border-[8px] border-transparent border-b-slate-800 absolute bottom-full right-[16px] pointer-events-none"></div>

                            <div className="px-3 py-3 border-b border-slate-700/60 pb-3 flex items-start gap-2.5">
                                <span className="material-symbols-outlined shrink-0 text-[18px] text-blue-400 mt-0.5">mail</span>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">College Email</span>
                                    <span className="text-xs font-semibold truncate leading-tight hover:text-blue-300 transition-colors cursor-text" title={user?.email}>{user?.email || "No email assigned"}</span>
                                </div>
                            </div>

                            <div className="px-3 py-3 border-b border-slate-700/60 pb-3 flex items-start gap-2.5">
                                <span className="material-symbols-outlined shrink-0 text-[18px] text-emerald-400 mt-0.5">corporate_fare</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Department</span>
                                    <span className="text-xs font-medium leading-tight">{user?.department ? `${user.department} Dept` : "No Dept Assigned"}</span>
                                </div>
                            </div>

                            <div className="px-3 py-3 flex items-start gap-2.5">
                                <span className="material-symbols-outlined shrink-0 text-[18px] text-purple-400 mt-0.5">badge</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Employee ID (PRN)</span>
                                    <span className="text-xs font-bold leading-tight font-mono tracking-tight text-slate-200">{user?.prn || "Not Assigned"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 pt-[80px]">
                {/* Sidebar - Fixed */}
                <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col fixed left-0 bottom-0 top-[80px] overflow-y-auto">
                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map((item, index) => (
                            <NavLink
                                key={index}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center justify-between gap-3 p-3.5 rounded-xl font-medium transition-all duration-200 group ${isActive
                                        ? `bg-primary text-white shadow-lg shadow-blue-500/20`
                                        : `text-slate-600 hover:bg-slate-50 hover:text-slate-900`
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            <span className="text-sm">{item.label}</span>
                                        </div>
                                        <ChevronRightIcon className={`w-4 h-4 transition-transform ${isActive ? 'text-blue-200' : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1'}`} />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Bottom Actions (Logout) */}
                    <div className="p-4 border-t border-slate-100">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-red-100 bg-red-50/50 text-red-600 hover:bg-red-100 hover:border-red-200 transition-colors font-bold text-sm shadow-sm"
                        >
                            <LogoutIcon className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 ml-64 min-h-[calc(100vh-80px)] flex flex-col">
                    <div className="flex-1 p-0">
                        <Outlet />
                    </div>

                    {/* Footer */}
                    <footer className="bg-white border-t border-slate-200 py-4 px-8 mt-auto">
                        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-slate-500 gap-2">
                            <p>Examination Remuneration System{branding.footerSuffix ? ` • ${branding.footerSuffix}` : ""}</p>
                            <p>© {new Date().getFullYear()} PCCOE Pune. All rights reserved.</p>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
