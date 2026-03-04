import DashboardLayout from "../../components/layout/DashboardLayout";

export default function AccountantLayout() {
  const navItems = [
    {
      to: "/accountant/dashboard",
      label: "Dashboard",
      icon: <span className="material-symbols-outlined text-[20px]">dashboard</span>
    },
    {
      to: "/accountant/bills",
      label: "Bills",
      icon: <span className="material-symbols-outlined text-[20px]">receipt_long</span>
    },
    {
      to: "/accountant/faculty",
      label: "Faculty",
      icon: <span className="material-symbols-outlined text-[20px]">groups</span>
    },
    {
      to: "/accountant/external",
      label: "External",
      icon: <span className="material-symbols-outlined text-[20px]">public</span>
    },
    {
      to: "/accountant/coordinators",
      label: "Coordinators",
      icon: <span className="material-symbols-outlined text-[20px]">badge</span>
    },
    {
      to: "/accountant/queries",
      label: "Queries",
      icon: <span className="material-symbols-outlined text-[20px]">help_center</span>
    },
    {
      to: "/accountant/settings",
      label: "Settings",
      icon: <span className="material-symbols-outlined text-[20px]">settings</span>
    }
  ];

  const branding = {
    title: "Billing Panel",
    subtitle: "Department Bills",
    icon: <span className="material-symbols-outlined text-white text-[24px]">account_balance_wallet</span>,
    headerSubtitle: "Manage claims and process payments",
    footerSuffix: ""
  };

  const theme = {
    gradient: "from-blue-50 via-white to-blue-50",
    primary: "blue-600",
    secondary: "blue-500",
    hover: "blue-50",
    hoverText: "blue-600"
  };

  return (
    <DashboardLayout
      role="BILLING_INCHARGE"
      navItems={navItems}
      branding={branding}
      theme={theme}
    />
  );
}
