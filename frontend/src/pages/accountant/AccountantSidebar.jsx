import { NavLink } from "react-router-dom";

// icons from your logo.jsx
import {
  DashboardIcon,
  FileTextIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  SettingsIcon,
  LogoutIcon,
  UserIcon
} from "../../components/icons/logo";

export default function AccountantSidebar() {
  const linkClass =
    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted";

  const activeClass = "bg-muted text-primary";

  return (
    <aside className="w-64 border-r bg-background h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-bold">Billing Incharge</h2>
        <p className="text-xs text-muted-foreground">Department Bills</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <NavLink
          to="/accountant/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <DashboardIcon className="w-5 h-5" />
          Dashboard
        </NavLink>

        <NavLink
          to="/accountant/bills"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <FileTextIcon className="w-5 h-5" />
          Bills
        </NavLink>

        <NavLink
          to="/accountant/faculty"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <UsersIcon className="w-5 h-5" />
          Faculty
        </NavLink>

        <NavLink
          to="/accountant/external"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <UserIcon className="w-5 h-5" />
          External Examiners
        </NavLink>

        <NavLink
          to="/accountant/settings"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <SettingsIcon className="w-5 h-5" />
          Settings
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg w-full">
          <LogoutIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
