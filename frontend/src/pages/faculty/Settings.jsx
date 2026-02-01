import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import ProfileSettings from "../../components/settings/ProfileSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import BankSettings from "../../components/settings/BankSettings";
import { MailIcon } from "../../components/icons/logo";
import { DEPARTMENTS } from "../../constants/departments";

export default function Settings() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [profileData, setProfileData] = useState(null);
  const [bankData, setBankData] = useState(null);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

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

      showToast("Profile updated successfully!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update profile", "error");
      throw error;
    }
  };

  const handleChangePassword = async (passwordData) => {
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      throw new Error("Passwords do not match");
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      throw new Error("Password too short");
    }

    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      showToast("Password changed successfully!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to change password", "error");
      throw error;
    }
  };

  const handleSetPassword = async (passwordData) => {
    try {
      await api.post("/auth/set-password", {
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      showToast("Password set successfully! You can now login with email and password.", "success");

      // Refresh profile to update has_set_password flag
      await fetchProfileAndBank();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to set password", "error");
      throw error;
    }
  };

  const handleSaveBankDetails = async (data) => {
    try {
      await api.put("/faculty/profile", { bank: data });
      showToast("Bank details updated successfully!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update bank details", "error");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
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
      options: DEPARTMENTS,
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
      <h1 className="text-3xl font-bold text-gray-800">Settings</h1>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <ProfileSettings
          initialData={profileData}
          onSave={handleSaveProfile}
          readOnlyFields={['email']}
          fields={profileFields}
        />

        {/* Security Settings */}
        <SecuritySettings
          onSave={handleChangePassword}
          onSetPassword={handleSetPassword}
          isGoogleUser={profileData?.google_id && !profileData?.has_set_password}
          primaryColor="blue-600"
        />
      </div>

      {/* Bank Details - Full Width */}
      <BankSettings
        initialData={bankData}
        onSave={handleSaveBankDetails}
      />
    </div>
  );
}
