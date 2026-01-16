import { Outlet, NavLink } from "react-router-dom";
import {
  DashboardIcon,
  FileTextIcon,
  UsersIcon,
  SettingsIcon,
  LogoutIcon,
  UserIcon,
  ChevronRightIcon,
  HomeIcon
} from "../../components/icons/logo";
import { Button } from "../../components/ui/button";

export default function AccountantLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* Logo/Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-md">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">Accountant Panel</h1>
              <p className="text-xs text-gray-500">Financial Control</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-200 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user?.name || "Accountant"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || user?.role || "User"}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <NavLink
            to="/accountant/dashboard"
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <DashboardIcon className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </div>
            <ChevronRightIcon className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/accountant/bills"
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <FileTextIcon className="w-5 h-5" />
              <span className="font-medium">Bills</span>
            </div>
            <ChevronRightIcon className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/accountant/faculty"
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <UsersIcon className="w-5 h-5" />
              <span className="font-medium">Faculty</span>
            </div>
            <ChevronRightIcon className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/accountant/settings"
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </div>
            <ChevronRightIcon className="w-4 h-4" />
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Welcome back, {user?.name || "Accountant"}!</h2>
              <p className="text-sm text-gray-600">
                Manage claims and process payments
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-800">{user?.role || "Accountant"}</p>
                <p className="text-xs text-gray-500">Financial Department</p>
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
              <p>Examination Remuneration System</p>
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
