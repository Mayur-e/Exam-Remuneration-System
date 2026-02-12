import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  DashboardIcon,
  BillIcon,
  FlagIcon,
  SettingsIcon,
  UserIcon,
  GraduationCapIcon,
  BookOpenIcon
} from "../../components/icons/logo";
import api from "../../services/api";

export default function FacultyLayout() {
  const [isCoordinator, setIsCoordinator] = useState(false);

  useEffect(() => {
    const checkCoordinatorStatus = async () => {
      try {
        const res = await api.get('/coordinator/assignments');
        if (res.data && res.data.length > 0) {
          setIsCoordinator(true);
        } else {
          setIsCoordinator(false);
        }
      } catch (error) {
        console.error("Failed to check coordinator status:", error);
        // Default to false on error to be safe
        setIsCoordinator(false);
      }
    };

    checkCoordinatorStatus();
  }, []);

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

  // Only add Coordinator Dashboard if user is a coordinator
  if (isCoordinator) {
    navItems.push({
      to: "/faculty/coordinator/dashboard",
      label: "Coordinator",
      icon: <BookOpenIcon className="w-5 h-5" />
    });
  }

  const branding = {
    title: "Faculty Portal",
    subtitle: "Examination Claims",
    icon: <GraduationCapIcon className="w-5 h-5 text-white" />,
    headerSubtitle: "Manage your examination claims and remuneration",
    footerSuffix: "Faculty Portal"
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