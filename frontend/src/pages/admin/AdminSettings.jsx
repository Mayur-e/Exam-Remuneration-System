import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import ProfileSettings from "../../components/settings/ProfileSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import { SettingsIcon, CheckCircleIcon, AlertCircleIcon } from "../../components/icons/logo";
import { MailIcon } from "../../components/icons/logo";

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [message, setMessage] = useState(null);
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
            setMessage({ type: "success", text: "Profile updated successfully!" });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: "error", text: "Failed to update profile" });
            throw err;
        }
    };

    const handleChangePassword = async (passwordData) => {
        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setMessage({ type: "error", text: "All password fields are required" });
            throw new Error("All fields required");
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: "error", text: "New password must be at least 6 characters" });
            throw new Error("Password too short");
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
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

            setMessage({ type: "success", text: "Password changed successfully!" });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Failed to change password" });
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
                        onClick={() => setActiveTab("security")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "security"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Security
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
                </nav>
            </div>

            {/* Message Display */}
            {message && (
                <div className={`p-4 rounded-lg border ${message.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                    }`}>
                    <div className="flex items-center gap-2">
                        {message.type === "success" ? (
                            <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                            <AlertCircleIcon className="w-5 h-5" />
                        )}
                        <p className="font-medium">{message.text}</p>
                    </div>
                </div>
            )}

            {/* Tab Content */}
            {activeTab === "profile" && (
                <ProfileSettings
                    initialData={profileData}
                    onSave={handleSaveProfile}
                    readOnlyFields={['email']}
                    fields={profileFields}
                />
            )}

            {activeTab === "security" && (
                <SecuritySettings
                    onSave={handleChangePassword}
                    primaryColor="purple-600"
                />
            )}

            {activeTab === "system" && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-purple-600" />
                        System Configuration
                    </h3>
                    <div className="space-y-6">
                        {/* Rate Masters */}
                        <div className="border-b border-gray-200 pb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Exam Rate Masters</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Configure examination remuneration rates for different exam types and programs.
                            </p>
                            <Button variant="outline" size="sm" disabled>
                                Manage Rates (Coming Soon)
                            </Button>
                        </div>

                        {/* Staff Norms */}
                        <div className="border-b border-gray-200 pb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Staff Norms Tables</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Define staff allocation norms based on exam type and student count.
                            </p>
                            <Button variant="outline" size="sm" disabled>
                                Manage Norms (Coming Soon)
                            </Button>
                        </div>

                        {/* Batch Size Rules */}
                        <div className="border-b border-gray-200 pb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Batch Size Rules</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Configure batch size limits for different examination types.
                            </p>
                            <Button variant="outline" size="sm" disabled>
                                Manage Rules (Coming Soon)
                            </Button>
                        </div>

                        {/* Academic Year */}
                        <div className="border-b border-gray-200 pb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Academic Year Locking</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Lock academic years to prevent claim modifications after finalization.
                            </p>
                            <Button variant="outline" size="sm" disabled>
                                Manage Years (Coming Soon)
                            </Button>
                        </div>

                        {/* Submission Deadlines */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Claim Submission Deadlines</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Set deadline windows for claim submission by faculty.
                            </p>
                            <Button variant="outline" size="sm" disabled>
                                Manage Deadlines (Coming Soon)
                            </Button>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">System Configuration</p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        These settings affect the entire system. Changes should be made carefully and
                                        with proper authorization. Contact the system administrator for assistance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
