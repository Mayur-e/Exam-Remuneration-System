import { Outlet } from "react-router-dom";
import AccountantSidebar from "./AccountantSidebar";

export default function AccountantLayout() {
  return (
    <div className="flex min-h-screen">
      <AccountantSidebar />

      <main className="flex-1 p-6 bg-muted/30 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
