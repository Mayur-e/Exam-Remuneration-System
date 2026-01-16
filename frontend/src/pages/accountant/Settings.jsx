import { useState, useEffect } from "react";
import api from "../../services/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { UserIcon, LockIcon, MailIcon } from "../../components/icons/logo";

export default function Settings() {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        department: ""
    });
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        // Fetch profile
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setProfile({
                name: user.name,
                email: user.email,
                department: user.department || "Accountant"
            });
        }
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (passwords.new !== passwords.confirm) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        try {
            await api.put("/auth/change-password", {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            setMessage({ type: "success", text: "Password updated successfully" });
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to update password"
            });
        }
    };

    const saveProfile = async () => {
        setMessage({ type: "", text: "" });

        try {
            // Update profile on backend (you'll need to create this endpoint)
            await api.put("/accountant/profile", { name: profile.name });

            // Update localStorage
            const user = JSON.parse(localStorage.getItem("user"));
            const updatedUser = { ...user, name: profile.name };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setMessage({ type: "success", text: "Profile updated successfully" });
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to update profile"
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-600">Manage your profile and security</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Profile Card */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                        Profile Information
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <div className="relative mt-1">
                                <Input
                                    value={profile.name}
                                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    className="pl-10"
                                    placeholder="Enter your full name"
                                />
                                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Email Address (Read-only)</label>
                            <div className="relative mt-1">
                                <Input
                                    value={profile.email}
                                    disabled
                                    className="bg-gray-50 pl-10"
                                />
                                <MailIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Role (Read-only)</label>
                            <div className="relative mt-1">
                                <Input
                                    value="Accountant"
                                    disabled
                                    className="bg-gray-50 uppercase font-semibold text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button onClick={saveProfile}>
                                Save Profile
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Security Card */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <LockIcon className="w-5 h-5 text-blue-600" />
                        Security
                    </h2>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Current Password</label>
                            <Input
                                type="password"
                                value={passwords.current}
                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                required
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <Input
                                    type="password"
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    required
                                    placeholder="Enter new password"
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                <Input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    required
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="pt-2">
                            <Button type="submit">
                                Update Password
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
