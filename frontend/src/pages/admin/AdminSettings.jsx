import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

// Icons
import {
    SettingsIcon,
    CheckCircleIcon,
    AlertCircleIcon
} from "../../components/icons/logo";

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: "",
        email: ""
    });

    // Password change settings
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            // API call would go here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to update profile" });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setMessage({ type: "error", text: "All password fields are required" });
            setSaving(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: "error", text: "New password must be at least 6 characters" });
            setSaving(false);
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            setSaving(false);
            return;
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
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Failed to change password" });
        } finally {
            setSaving(false);
        }
    };

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
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-purple-600" />
                        Profile Settings
                    </h3>
                    <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <Input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                placeholder="Enter your name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <Input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                placeholder="Enter your email"
                                disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </Card>
            )}

            {activeTab === "security" && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-purple-600" />
                        Security Settings
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <Input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <Input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                placeholder="Enter new password (min 6 characters)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <Input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {saving ? "Changing Password..." : "Change Password"}
                        </Button>
                    </form>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900">Password Security</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Make sure your password is at least 6 characters long and contains a mix of letters and numbers for better security.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
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
