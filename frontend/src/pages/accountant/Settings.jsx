import { useToast } from "../../hooks/useToast";
import ProfileSettings from "../../components/settings/ProfileSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";

export default function Settings() {
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
            label: "Full Name",
            type: "text",
            placeholder: "Enter your full name"
        },
        {
            name: "email",
            label: "Email Address (Read-only)",
            type: "email",
            placeholder: "Enter your email",
            hint: "Email cannot be changed"
        },
        {
            name: "role",
            label: "Role (Read-only)",
            type: "text",
            value: user.role,
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 font-display bg-background-light min-h-[calc(100vh-4rem)] pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Settings</h1>
                    <p className="text-slate-500 font-medium">Manage your profile and security preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <ProfileSettings
                    initialData={{ ...profileData, role: user.role }}
                    onSave={handleSaveProfile}
                    readOnlyFields={['email', 'role']}
                    fields={profileFields}
                />

                <SecuritySettings
                    onSave={handleChangePassword}
                    primaryColor="primary"
                />
            </div>
        </div>
    );
}
