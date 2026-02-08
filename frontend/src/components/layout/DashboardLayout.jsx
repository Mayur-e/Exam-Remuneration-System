import { Outlet, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserIcon,
    ChevronRightIcon,
    LogoutIcon
} from "../icons/logo";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";

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

    // Animation variants
    const sidebarVariants = {
        hidden: { x: -300, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20,
                staggerChildren: 0.1
            }
        }
    };

    const navItemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 20
            }
        }
    };

    const headerVariants = {
        hidden: { y: -20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className={`flex min-h-screen bg-gradient-to-br ${activeTheme.gradient} dark:from-background dark:via-background dark:to-accent`}>
            {/* Sidebar */}
            <motion.aside
                className="w-64 bg-card border-r border-border shadow-lg transition-all duration-300 hover:shadow-xl"
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Logo/Sidebar Header */}
                <motion.div
                    className="p-6 border-b border-border"
                    variants={navItemVariants}
                >
                    <div className="flex items-center gap-3">
                        <motion.div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${activeTheme.primary} to-${activeTheme.secondary} flex items-center justify-center shadow-md`}
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                        >
                            {branding.icon}
                        </motion.div>
                        <div>
                            <h1 className="font-bold text-card-foreground text-lg">{branding.title}</h1>
                            <p className="text-xs text-muted-foreground">{branding.subtitle}</p>
                        </div>
                    </div>
                </motion.div>

                {/* User Profile */}
                <motion.div
                    className="p-4 border-b border-border"
                    variants={navItemVariants}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${activeTheme.primary}-100 to-${activeTheme.primary}-50 dark:from-${activeTheme.primary}-900 dark:to-${activeTheme.primary}-800 border-2 border-${activeTheme.primary}-200 dark:border-${activeTheme.primary}-700 flex items-center justify-center`}>
                            <UserIcon className={`w-5 h-5 text-${activeTheme.primary} dark:text-${activeTheme.primary}-300`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-card-foreground truncate">{user?.name || role}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email || user?.role || "User"}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item, index) => (
                        <motion.div
                            key={index}
                            variants={navItemVariants}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <NavLink
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                                        ? `bg-gradient-to-r from-${activeTheme.primary} to-${activeTheme.secondary} text-white shadow-md`
                                        : `text-muted-foreground hover:bg-accent hover:text-accent-foreground`
                                    }`
                                }
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                <ChevronRightIcon className="w-4 h-4" />
                            </NavLink>
                        </motion.div>
                    ))}
                </nav>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <motion.header
                    className="sticky top-0 z-10 bg-card border-b border-border shadow-sm"
                    variants={headerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-xl font-bold text-card-foreground">Welcome back, {user?.name || role}!</h2>
                            <p className="text-sm text-muted-foreground">{branding.headerSubtitle}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-card-foreground">{user?.role || role}</p>
                                <p className="text-xs text-muted-foreground">{user?.department || branding.subtitle}</p>
                            </div>
                            <ThemeToggle />
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={logout}
                                    variant="outline"
                                    className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                                >
                                    <LogoutIcon className="w-4 h-4" />
                                    Logout
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.header>

                {/* Content */}
                <motion.div
                    className="flex-1 overflow-auto p-6"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="bg-card border-t border-border py-3 px-6">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
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
