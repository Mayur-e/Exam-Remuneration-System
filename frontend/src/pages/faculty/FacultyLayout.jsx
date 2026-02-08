import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  DashboardIcon,
  BillIcon,
  FlagIcon,
  SettingsIcon,
  UserIcon,
  HomeIcon,
  XIcon,
  MenuIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from "../../components/icons/logo";
import { ThemeToggle } from "../../components/ui/theme-toggle";

export default function FacultyLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserData(user);
  }, []);

  const navItems = [
    {
      to: "/faculty",
      end: true,
      label: "Dashboard",
      icon: <DashboardIcon className="w-5 h-5" />,
      badge: null
    },
    {
      to: "/faculty/generateclaim",
      label: "Generate Claim",
      icon: <BillIcon className="w-5 h-5" />,
      badge: null
    },
    {
      to: "/faculty/myclaims",
      label: "My Claims",
      icon: <UserIcon className="w-5 h-5" />,
      badge: null
    },
    {
      to: "/faculty/queries",
      label: "Queries",
      icon: <FlagIcon className="w-5 h-5" />,
      badge: null
    },
    {
      to: "/faculty/settings",
      label: "Settings",
      icon: <SettingsIcon className="w-5 h-5" />,
      badge: null
    }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.name) return "F";
    return userData.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-accent">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ 
          x: sidebarOpen || !sidebarCollapsed ? 0 : -300,
          width: sidebarCollapsed ? 80 : 260
        }}
        transition={{ type: "spring", damping: 20 }}
        className={`fixed top-0 left-0 z-50 h-screen bg-card border-r border-border shadow-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <motion.div
              animate={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : "auto" }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg">
                  <HomeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    Faculty Panel
                  </h1>
                  <p className="text-xs text-muted-foreground">Examination System</p>
                </div>
              </div>
            </motion.div>
            
            {/* Collapse button - visible on desktop */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="w-4 h-4" />
              ) : (
                <ChevronLeftIcon className="w-4 h-4" />
              )}
            </button>
            
            {/* Close button - visible on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>


        {/* User info in sidebar (visible when not collapsed) */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-auto p-4 border-t border-border"
            >
              {userData && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                    {getUserInitials()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-sm truncate">{userData.name || "Faculty User"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userData.department || "Department"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{userData.email || ""}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
              
        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500"
                      : "hover:bg-accent text-foreground"
                  }`
                }
              >
                <div className={`flex-shrink-0 ${item.badge ? "relative" : ""}`}>
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
                <motion.span
                  animate={{ 
                    opacity: sidebarCollapsed ? 0 : 1,
                    width: sidebarCollapsed ? 0 : "auto"
                  }}
                  className="overflow-hidden whitespace-nowrap font-medium"
                >
                  {item.label}
                </motion.span>
                {item.badge && !sidebarCollapsed && (
                  <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>


        {/* Sidebar footer */}
        <div className="p-4 border-t border-border">
          <motion.div
            animate={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : "auto" }}
            className="overflow-hidden whitespace-nowrap"
          >
            <p className="text-xs text-muted-foreground">
              Manage your examination claims efficiently
            </p>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Welcome back, {userData?.name?.split(" ")[0] || "Faculty"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage your examination claims and queries
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
                <FlagIcon className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              
              {/* Theme toggle */}
              <ThemeToggle />
              
              {/* User profile dropdown */}
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{userData?.name || "Faculty User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {userData?.department || "Department"} • Faculty
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {getUserInitials()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-border p-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Examination Billing System • Faculty Panel
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {userData && (
                <>
                  <span className="hidden md:inline">Logged in as: {userData.name}</span>
                  <span>•</span>
                  <span>Department: {userData.department || "N/A"}</span>
                  <span>•</span>
                </>
              )}
              <span>Role: Faculty</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}