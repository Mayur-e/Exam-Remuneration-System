import { useState, useEffect } from "react";
import api from "../../services/api";
import ProfileSettings from "../../components/settings/ProfileSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import BankSettings from "../../components/settings/BankSettings";
import { MailIcon } from "../../components/icons/logo";

export default function Settings() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [profileData, setProfileData] = useState(null);
  const [bankData, setBankData] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
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

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
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

      setMessage({ type: "success", text: "Password changed successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to change password" });
      throw error;
    }
  };

  const handleSaveBankDetails = async (data) => {
    try {
      await api.put("/faculty/profile", { bank: data });
      setMessage({ type: "success", text: "Bank details updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update bank details" });
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
      name: "department",
      label: "Department",
      type: "text",
      placeholder: "Department"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.text}
        </div>
      )}

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
