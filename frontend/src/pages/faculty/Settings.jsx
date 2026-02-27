import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import ProfileSettings from "../../components/settings/ProfileSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import BankSettings from "../../components/settings/BankSettings";
import CourseCoordinationSettings from "../../components/settings/CourseCoordinationSettings";
import { MailIcon } from "../../components/icons/logo";
import { PROGRAM_DEPARTMENTS } from "../../constants/departments";
import { motion, AnimatePresence } from "framer-motion";

export default function Settings() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [profileData, setProfileData] = useState(null);
  const [bankData, setBankData] = useState(null);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  useEffect(() => {
    fetchProfileAndBank();
  }, []);

  const fetchProfileAndBank = async () => {
    try {
      const res = await api.get("/faculty/profile");
      setProfileData({
        name: res.data.name || "",
        email: res.data.email || user.email || "",
        department: res.data.department || "",
        prn: res.data.prn || "",
        mobile: res.data.mobile || "",
        pan_card: res.data.pan_card || "",
        google_id: res.data.google_id || null,
        has_set_password: res.data.has_set_password || false,
      });

      if (res.data.bank) {
        setBankData(res.data.bank);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // Custom toast animation
      setToastMessage("Failed to load profile data");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (data) => {
    try {
      await api.put("/faculty/profile", data);

      // Update localStorage
      const updatedUser = { ...user, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Custom toast animation
      setToastMessage("Profile updated successfully!");
      setToastType("success");
      setTimeout(() => setToastMessage(""), 3000);

      // Refresh profile data
      fetchProfileAndBank();
    } catch (error) {
      // Custom toast animation
      setToastMessage(error.response?.data?.message || "Failed to update profile");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
      throw error;
    }
  };

  const handleChangePassword = async (passwordData) => {
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToastMessage("New passwords do not match");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
      throw new Error("Passwords do not match");
    }

    if (passwordData.newPassword.length < 6) {
      setToastMessage("Password must be at least 6 characters");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
      throw new Error("Password too short");
    }

    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      // Custom toast animation
      setToastMessage("Password changed successfully!");
      setToastType("success");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (error) {
      setToastMessage(error.response?.data?.message || "Failed to change password");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
      throw error;
    }
  };

  const handleSetPassword = async (passwordData) => {
    try {
      await api.post("/auth/set-password", {
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      // Custom toast animation
      setToastMessage("Password set successfully! You can now login with email and password.");
      setToastType("success");
      setTimeout(() => setToastMessage(""), 3000);

      // Refresh profile to update has_set_password flag
      await fetchProfileAndBank();
    } catch (error) {
      setToastMessage(error.response?.data?.message || "Failed to set password");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
      throw error;
    }
  };

  const handleSaveBankDetails = async (data) => {
    try {
      await api.put("/faculty/profile", { bank: data });
      // Custom toast animation
      setToastMessage("Bank details updated successfully!");
      setToastType("success");
      setTimeout(() => setToastMessage(""), 3000);

      // Refresh bank data
      fetchProfileAndBank();
    } catch (error) {
      setToastMessage(error.response?.data?.message || "Failed to update bank details");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
      throw error;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  const profileFields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Full Name"
    },
    {
      name: "email",
      label: "Email (Read-only)",
      type: "email",
      icon: MailIcon,
      hint: "Email cannot be changed"
    },
    {
      name: "prn",
      label: "PRN",
      type: "text",
      placeholder: "Enter your PRN"
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      options: PROGRAM_DEPARTMENTS,
    },
    {
      name: "mobile",
      label: "Mobile Number",
      type: "tel",
      placeholder: "Enter your mobile number (e.g., 9876543210)"
    },
    {
      name: "pan_card",
      label: "PAN Card Number",
      type: "text",
      placeholder: "Enter your PAN card number (e.g., ABCDE1234F)"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Custom Toast Animation */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${toastType === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
              }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Profile Settings */}
        <motion.div variants={itemVariants}>
          <ProfileSettings
            initialData={profileData}
            onSave={handleSaveProfile}
            readOnlyFields={['email']}
            fields={profileFields}
          />
        </motion.div>

        {/* Security Settings */}
        <motion.div variants={itemVariants}>
          <SecuritySettings
            onSave={handleChangePassword}
            onSetPassword={handleSetPassword}
            isGoogleUser={profileData?.google_id && !profileData?.has_set_password}
            primaryColor="blue-600"
          />
        </motion.div>
      </motion.div>

      {/* Course Coordination - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CourseCoordinationSettings />
      </motion.div>

      {/* Bank Details - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <BankSettings
          initialData={bankData}
          onSave={handleSaveBankDetails}
        />
      </motion.div>
    </div>
  );
}