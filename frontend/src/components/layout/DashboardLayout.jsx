import { Outlet, NavLink } from "react-router-dom";
import {
    UserIcon,
    ChevronRightIcon,
    LogoutIcon
} from "../icons/logo";
import { Button } from "../ui/button";

/**
 * Shared Dashboard Layout Component
 * Used by Admin, Faculty, and Accountant panels
 * 
 * @param {Object} props
 * @param {string} props.role - User role (ADMIN, FACULTY, ACCOUNTANT)
 * @param {Array} props.navItems - Navigation items array
 * @param {Object} props.branding - Branding configuration (title, subtitle, icon)
 * @param {Object} props.theme - Theme colors (primary, secondary, gradient)
 */
export default function DashboardLayout({ role, navItems, branding, theme }) {
    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    // Default theme if not provided
    const defaultTheme = {
        gradient: "from-blue-50 via-white to-purple-50",
        primary: "blue-600",
        secondary: "blue-500",
        hover: "blue-50",
        hoverText: "blue-600"
    };

    const activeTheme = theme || defaultTheme;

    return (
        <div className={`flex min-h-screen bg-gradient-to-br ${activeTheme.gradient}`}>
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl">
                {/* Logo/Sidebar Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${activeTheme.primary} to-${activeTheme.secondary} flex items-center justify-center shadow-md`}>
                            {branding.icon}
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800 text-lg">{branding.title}</h1>
                            <p className="text-xs text-gray-500">{branding.subtitle}</p>
                        </div>
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${activeTheme.primary}-100 to-${activeTheme.primary}-50 border-2 border-${activeTheme.primary}-200 flex items-center justify-center`}>
                            <UserIcon className={`w-5 h-5 text-${activeTheme.primary}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{user?.name || role}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email || user?.role || "User"}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                                    ? `bg-gradient-to-r from-${activeTheme.primary} to-${activeTheme.secondary} text-white shadow-md`
                                    : `text-gray-700 hover:bg-${activeTheme.hover} hover:text-${activeTheme.hoverText}`
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRightIcon className="w-4 h-4" />
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Welcome back, {user?.name || role}!</h2>
                            <p className="text-sm text-gray-600">{branding.headerSubtitle}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-gray-800">{user?.role || role}</p>
                                <p className="text-xs text-gray-500">{user?.department || branding.subtitle}</p>
                            </div>
                            <Button
                                onClick={logout}
                                variant="outline"
                                className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
                            >
                                <LogoutIcon className="w-4 h-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-3 px-6">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div>
                            <p>Examination Remuneration System{branding.footerSuffix ? ` - ${branding.footerSuffix}` : ""}</p>
                        </div>
                        <div>
                            <p>© {new Date().getFullYear()} Staff Billing System</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
