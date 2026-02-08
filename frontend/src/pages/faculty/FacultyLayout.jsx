import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  DashboardIcon,
  BillIcon,
  QueryIcon,
  FlagIcon,
  SettingsIcon,
  UserIcon,
  HomeIcon
} from "../../components/icons/logo";

export default function FacultyLayout() {
  const navItems = [
    {
      to: "/faculty",
      end: true,
      label: "Dashboard",
      icon: <DashboardIcon className="w-5 h-5" />
    },
    {
      to: "/faculty/generateclaim",
      label: "Generate Claim",
      icon: <BillIcon className="w-5 h-5" />
    },
    {
      to: "/faculty/myclaims",
      label: "My Claims",
      icon: <UserIcon className="w-5 h-5" />
    },
    {
      to: "/faculty/queries",
      label: "Queries",
      icon: <FlagIcon className="w-5 h-5" />
    },
    {
      to: "/faculty/settings",
      label: "Settings",
      icon: <SettingsIcon className="w-5 h-5" />
    }
  ];

  const branding = {
    title: "Faculty Panel",
    subtitle: "Examination System",
    icon: <HomeIcon className="w-5 h-5 text-white" />,
    headerSubtitle: "Manage your examination claims efficiently",
    footerSuffix: ""
  };

  const theme = {
    gradient: "from-blue-50 via-white to-purple-50",
    primary: "blue-600",
    secondary: "blue-500",
    hover: "blue-50",
    hoverText: "blue-600"
  };

  return (
    <DashboardLayout
      role="FACULTY"
      navItems={navItems}
      branding={branding}
      theme={theme}
    />
  );
}