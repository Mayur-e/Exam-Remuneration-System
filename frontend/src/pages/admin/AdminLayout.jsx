import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    DashboardIcon,
    FileTextIcon,
    UsersIcon,
    SettingsIcon,
    ShieldIcon,
    ClipboardIcon,
    QueryIcon
} from "../../components/icons/logo";

export default function AdminLayout() {
    const navItems = [
        {
            to: "/admin/dashboard",
            label: "Dashboard",
            icon: <DashboardIcon className="w-5 h-5" />
        },
        {
            to: "/admin/claims",
            label: "Claims",
            icon: <FileTextIcon className="w-5 h-5" />
        },
        {
            to: "/admin/faculty",
            label: "Faculty",
            icon: <UsersIcon className="w-5 h-5" />
        },
        {
            to: "/admin/external",
            label: "External",
            icon: <ClipboardIcon className="w-5 h-5" />
        },
        {
            to: "/admin/audit-logs",
            label: "Audit Logs",
            icon: <ClipboardIcon className="w-5 h-5" />
        },
        {
            to: "/admin/users",
            label: "User Management",
            icon: <UsersIcon className="w-5 h-5" />
        },
        {
            to: "/admin/queries",
            label: "Support Queries",
            icon: <QueryIcon className="w-5 h-5" />
        },
        {
            to: "/admin/settings",
            label: "Settings",
            icon: <SettingsIcon className="w-5 h-5" />
        }
    ];

    const branding = {
        title: "Admin Panel",
        subtitle: "System Supervisor",
        icon: <ShieldIcon className="w-5 h-5 text-white" />,
        headerSubtitle: "Supervise and oversee the exam remuneration system",
        footerSuffix: "Admin Panel"
    };

    const theme = {
        gradient: "from-purple-50 via-white to-indigo-50",
        primary: "purple-600",
        secondary: "purple-500",
        hover: "purple-50",
        hoverText: "purple-600"
    };

    return (
        <DashboardLayout
            role="ADMIN"
            navItems={navItems}
            branding={branding}
            theme={theme}
        />
    );
}
