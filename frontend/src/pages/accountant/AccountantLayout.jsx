import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  DashboardIcon,
  FileTextIcon,
  UsersIcon,
  QueryIcon,
  SettingsIcon,
  HomeIcon
} from "../../components/icons/logo";

export default function AccountantLayout() {
  const navItems = [
    {
      to: "/accountant/dashboard",
      label: "Dashboard",
      icon: <DashboardIcon className="w-5 h-5" />
    },
    {
      to: "/accountant/bills",
      label: "Bills",
      icon: <FileTextIcon className="w-5 h-5" />
    },
    {
      to: "/accountant/faculty",
      label: "Faculty",
      icon: <UsersIcon className="w-5 h-5" />
    },
    {
      to: "/accountant/coordinators",
      label: "Coordinators",
      icon: <UsersIcon className="w-5 h-5" />
    },
    {
      to: "/accountant/queries",
      label: "Queries",
      icon: <QueryIcon className="w-5 h-5" />
    },
    {
      to: "/accountant/settings",
      label: "Settings",
      icon: <SettingsIcon className="w-5 h-5" />
    }
  ];

  const branding = {
    title: "Billing Incharge Panel",
    subtitle: "Department Bills",
    icon: <HomeIcon className="w-5 h-5 text-white" />,
    headerSubtitle: "Manage claims and process payments",
    footerSuffix: ""
  };

  const theme = {
    gradient: "from-green-50 via-white to-blue-50",
    primary: "green-600",
    secondary: "green-500",
    hover: "green-50",
    hoverText: "green-600"
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
