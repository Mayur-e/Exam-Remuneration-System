import { useState } from "react";
import api from "../../services/api";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function Settings() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [profile, setProfile] = useState({
    name: user?.name || "",
    department: user?.department || "",
  });

  const save = async () => {
    await api.put("/faculty/profile", profile);

    // Update localStorage to keep header in sync
    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, ...profile })
    );

    alert("Profile updated successfully");
  };

  return (
    <div className="max-w-md space-y-4">
      <h3 className="font-semibold">Profile Settings</h3>

      <Input
        placeholder="Full Name"
        value={profile.name}
        onChange={e => setProfile({ ...profile, name: e.target.value })}
      />

      <Input
        placeholder="Department"
        value={profile.department}
        onChange={e => setProfile({ ...profile, department: e.target.value })}
      />

      <Button onClick={save}>Save Changes</Button>
    </div>
  );
}
