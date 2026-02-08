import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

    const tabVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            x: 20,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h1 className="text-3xl font-bold text-card-foreground">Admin Settings</h1>
                <p className="text-muted-foreground">Manage your profile and system preferences</p>
            </motion.div>

            {/* Tabs */}
            <motion.div
                className="border-b border-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <nav className="flex gap-4">
                    <motion.button
                        onClick={() => setActiveTab("profile")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "profile"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-muted-foreground hover:text-card-foreground"
                            }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Profile
                    </motion.button>
                    <motion.button
                        onClick={() => setActiveTab("system")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "system"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-muted-foreground hover:text-card-foreground"
                            }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        System Configuration
                    </motion.button>
                    <motion.button
                        onClick={() => setActiveTab("counts")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "counts"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-muted-foreground hover:text-card-foreground"
                            }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Student Counts
                    </motion.button>
                </nav>
            </motion.div>



            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                    <motion.div
                        key="profile"
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
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
                    </motion.div>
                )}

                {activeTab === "system" && (
                    <motion.div
                        key="system"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <RatesManagement />
                    </motion.div>
                )}

                {activeTab === "counts" && (
                    <motion.div
                        key="counts"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <StudentCountManagement />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

