import { useState, useEffect } from "react";
import api from "../../services/api";
import ProfileSettings from "../../components/settings/ProfileSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import { MailIcon } from "../../components/icons/logo";

export default function Settings() {
    const [profileData, setProfileData] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        // Fetch profile
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
                role: "Accountant"
            });
        }
    }, []);

    const handleSaveProfile = async (data) => {
        setMessage({ type: "", text: "" });

        try {
            // Update profile on backend
            await api.put("/accountant/profile", { name: data.name });

            // Update localStorage
            const user = JSON.parse(localStorage.getItem("user"));
            const updatedUser = { ...user, name: data.name };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setMessage({ type: "success", text: "Profile updated successfully" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to update profile"
            });
            throw err;
        }
    };

    const handleChangePassword = async (passwordData) => {
        setMessage({ type: "", text: "" });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            throw new Error("Passwords do not match");
        }

        try {
            await api.put("/auth/change-password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: "success", text: "Password updated successfully" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to update password"
            });
            throw err;
        }
    };

    const profileFields = [
        {
            name: "name",
            label: "Full Name",
            type: "text",
            placeholder: "Enter your full name"
        },
        {
            name: "email",
            label: "Email Address (Read-only)",
            type: "email",
            icon: MailIcon,
            hint: "Email cannot be changed"
        },
        {
            name: "role",
            label: "Role (Read-only)",
            type: "text"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-600">Manage your profile and security</p>
            </div>

            {/* Message Display */}
            {message.text && (
                <div className={`p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <ProfileSettings
                    initialData={profileData}
                    onSave={handleSaveProfile}
                    readOnlyFields={['email', 'role']}
                    fields={profileFields}
                />

                {/* Security Settings */}
                <SecuritySettings
                    onSave={handleChangePassword}
                    primaryColor="green-600"
                />
            </div>
        </div>
    );
}
