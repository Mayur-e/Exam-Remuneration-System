import { Outlet, NavLink } from "react-router-dom";
import {
  DashboardIcon,
  BillIcon,
  QueryIcon,
  SettingsIcon,
  LogoutIcon,
  UserIcon
} from "../../components/icons/logo";
import { Button } from "../../components/ui/button";

export default function FacultyLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r transition-all hover:w-72">
        <div className="p-4 font-bold text-lg">Faculty Panel</div>

        <nav className="flex flex-col gap-2 px-2">
          <NavLink to="/faculty" className="flex items-center gap-2 p-2 hover:bg-accent rounded">
            <DashboardIcon /> Dashboard
          </NavLink>

          <NavLink to="/faculty/generateclaim" className="flex items-center gap-2 p-2 hover:bg-accent rounded">
            <BillIcon /> Generate Claim
          </NavLink>

          <NavLink to="/faculty/myclaims" className="flex items-center gap-2 p-2 hover:bg-accent rounded">
            <UserIcon /> My Claims
          </NavLink>

          <NavLink to="/faculty/queries" className="flex items-center gap-2 p-2 hover:bg-accent rounded">
            <QueryIcon /> Queries
          </NavLink>

          <NavLink to="/faculty/settings" className="flex items-center gap-2 p-2 hover:bg-accent rounded">
            <SettingsIcon /> Settings
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b bg-card">
          <div>
            <h2 className="text-lg font-semibold">Welcome, {user?.name}</h2>
            <p className="text-sm text-muted-foreground">
              Manage your examination claims
            </p>
          </div>

          <Button variant="ghost" onClick={logout}>
            <LogoutIcon /> Logout
          </Button>
        </header>

        {/* Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
