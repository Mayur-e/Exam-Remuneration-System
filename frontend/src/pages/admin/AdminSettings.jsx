import { useState } from "react";
import { useToast } from "../../hooks/useToast";
import ProfileSettings from "../../components/settings/ProfileSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import RatesManagement from "../../components/settings/RatesManagement";
import StudentCountManagement from "../../components/settings/StudentCountManagement";

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState("profile");
    const { showToast } = useToast();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    // Profile data
    const profileData = {
        name: user.name || "",
        email: user.email || ""
    };

    const handleSaveProfile = async (data) => {
        try {
            // API call would go here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
            showToast("Profile updated successfully!", "success");
        } catch (err) {
            showToast("Failed to update profile", "error");
            throw err;
        }
    };

    const handleChangePassword = async (passwordData) => {
        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            showToast("All password fields are required", "error");
            throw new Error("All fields required");
        }

        if (passwordData.newPassword.length < 6) {
            showToast("New password must be at least 6 characters", "error");
            throw new Error("Password too short");
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast("New passwords do not match", "error");
            throw new Error("Passwords do not match");
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to change password");
            }

            showToast("Password changed successfully!", "success");
        } catch (err) {
            showToast(err.message || "Failed to change password", "error");
            throw err;
        }
    };

    const profileFields = [
        {
            name: "name",
            label: "Name",
            type: "text",
            placeholder: "Enter your name"
        },
        {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "Enter your email",
            hint: "Email cannot be changed"
        }
    ];

    const tabs = [
        { id: "profile", label: "Profile", icon: "person" },
        { id: "system", label: "System Config", icon: "settings" },
        { id: "counts", label: "Student Counts", icon: "groups" }
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 font-display bg-background-light min-h-[calc(100vh-4rem)] pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Admin Settings</h1>
                    <p className="text-slate-500 font-medium">Manage your profile and system preferences.</p>
                </div>
            </div>

            {/* Flat Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 border ${isActive
                                    ? 'bg-primary text-white border-primary shadow-md'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "profile" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ProfileSettings
                            initialData={profileData}
                            onSave={handleSaveProfile}
                            readOnlyFields={['email']}
                            fields={profileFields}
                        />

                        <SecuritySettings
                            onSave={handleChangePassword}
                            primaryColor="primary"
                        />
                    </div>
                )}

                {activeTab === "system" && (
                    <div>
                        <RatesManagement />
                    </div>
                )}

                {activeTab === "counts" && (
                    <div>
                        <StudentCountManagement />
                    </div>
                )}
            </div>
        </div>
    );
}

