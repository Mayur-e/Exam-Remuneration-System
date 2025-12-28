import { Outlet, NavLink } from "react-router-dom";
import {
  DashboardIcon,
  BillIcon,
  QueryIcon,
  SettingsIcon,
  LogoutIcon,
  UserIcon,
  ChevronRightIcon,
  HomeIcon
} from "../../components/icons/logo";
import { Button } from "../../components/ui/button";

export default function FacultyLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* Logo/Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">Faculty Panel</h1>
              <p className="text-xs text-gray-500">Examination System</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user?.name || "Faculty"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || user?.role || "User"}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <NavLink 
            to="/faculty" 
            end
            className={({ isActive }) => 
              `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
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
            to="/faculty/generateclaim" 
            className={({ isActive }) => 
              `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <BillIcon className="w-5 h-5" />
              <span className="font-medium">Generate Claim</span>
            </div>
            <ChevronRightIcon className="w-4 h-4" />
          </NavLink>

          <NavLink 
            to="/faculty/myclaims" 
            className={({ isActive }) => 
              `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5" />
              <span className="font-medium">My Claims</span>
            </div>
            <ChevronRightIcon className="w-4 h-4" />
          </NavLink>

          <NavLink 
            to="/faculty/queries" 
            className={({ isActive }) => 
              `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <QueryIcon className="w-5 h-5" />
              <span className="font-medium">Queries</span>
            </div>
            <ChevronRightIcon className="w-4 h-4" />
          </NavLink>

          <NavLink 
            to="/faculty/settings" 
            className={({ isActive }) => 
              `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
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
              <h2 className="text-xl font-bold text-gray-800">Welcome back, {user?.name || "Faculty"}!</h2>
              <p className="text-sm text-gray-600">
                Manage your examination claims efficiently
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-800">{user?.role || "Faculty"}</p>
                <p className="text-xs text-gray-500">{user?.department || "Department"}</p>
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