import { useState } from "react";
import { useToast } from "../../hooks/useToast";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import ProfileSettings from "../../components/settings/ProfileSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import RatesManagement from "../../components/settings/RatesManagement";
import StudentCountManagement from "../../components/settings/StudentCountManagement";
import { SettingsIcon, CheckCircleIcon, AlertCircleIcon } from "../../components/icons/logo";
import { MailIcon } from "../../components/icons/logo";

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
            icon: MailIcon,
            placeholder: "Enter your email",
            hint: "Email cannot be changed"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-800">Admin Settings</h1>
                <p className="text-gray-600">Manage your profile and system preferences</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "profile"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("system")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "system"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        System Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab("counts")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "counts"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Student Counts
                    </button>
                </nav>
            </div>



            {/* Tab Content */}
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
                        primaryColor="purple-600"
                    />
                </div>
            )}

            {activeTab === "system" && (
                <RatesManagement />
            )}

            {activeTab === "counts" && (
                <StudentCountManagement />
            )}
        </div>
    );
}

