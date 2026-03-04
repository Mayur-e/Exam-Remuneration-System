import DashboardLayout from "../../components/layout/DashboardLayout";

export default function AdminLayout() {
    const navItems = [
        {
            to: "/admin/dashboard",
            label: "Dashboard",
            icon: <span className="material-symbols-outlined text-[20px]">dashboard</span>
        },
        {
            to: "/admin/claims",
            label: "Claims",
            icon: <span className="material-symbols-outlined text-[20px]">receipt_long</span>
        },
        {
            to: "/admin/faculty",
            label: "Faculty",
            icon: <span className="material-symbols-outlined text-[20px]">groups</span>
        },
        {
            to: "/admin/external",
            label: "External",
            icon: <span className="material-symbols-outlined text-[20px]">account_balance</span>
        },
        {
            to: "/admin/audit-logs",
            label: "Audit Logs",
            icon: <span className="material-symbols-outlined text-[20px]">history</span>
        },
        {
            to: "/admin/users",
            label: "User Management",
            icon: <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
        },
        {
            to: "/admin/queries",
            label: "Support Queries",
            icon: <span className="material-symbols-outlined text-[20px]">help_center</span>
        },
        {
            to: "/admin/settings",
            label: "Settings",
            icon: <span className="material-symbols-outlined text-[20px]">settings</span>
        }
    ];

    const branding = {
        title: "Admin Panel",
        subtitle: "System Supervisor",
        icon: <span className="material-symbols-outlined text-[20px] text-white">admin_panel_settings</span>,
        headerSubtitle: "Supervise and oversee the exam remuneration system",
        footerSuffix: "Admin Panel"
    };

    const theme = {
        gradient: "from-slate-50 via-white to-slate-50",
        primary: "primary",
        secondary: "primary",
        hover: "slate-50",
        hoverText: "primary"
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
