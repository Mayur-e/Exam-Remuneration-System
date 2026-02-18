import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [filterRole, setFilterRole] = useState("");
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "FACULTY",
        department: ""
    });

    useEffect(() => {
        fetchUsers();
    }, [filterRole]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = filterRole ? { role: filterRole } : {};
            const response = await api.get("/admin/users", { params });
            setUsers(response.data);
        } catch (error) {
            console.error("Fetch users error:", error);
            showToast("Failed to fetch users", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.endsWith('@pccoepune.org')) {
            showToast("Email must be from @pccoepune.org domain", "error");
            return;
        }

        try {
            await api.post("/admin/users", formData);
            showToast(`${formData.role} user created successfully`, "success");
            setShowModal(false);
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "FACULTY",
                department: ""
            });
            fetchUsers();
        } catch (error) {
            console.error("Create user error:", error);
            showToast(error.response?.data?.message || "Failed to create user", "error");
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            await api.patch(`/admin/users/${userId}/status`, {
                is_active: !currentStatus
            });
            showToast(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, "success");
            fetchUsers();
        } catch (error) {
            console.error("Toggle status error:", error);
            showToast("Failed to update user status", "error");
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        + Add User
                    </Button>
                </div>

                <div className="flex gap-4 mb-4">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="">All Roles</option>
                        <option value="FACULTY">Faculty</option>
                        <option value="BILLING_INCHARGE">Billing Incharge</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Total Claims</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Created</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-4">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-4 text-gray-500">No users found.</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{user.name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                                    user.role === 'BILLING_INCHARGE' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{user.department}</td>
                                        <td className="px-6 py-4">{user.total_claims}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            {user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                    className={`text-sm font-medium ${user.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                                                        }`}
                                                >
                                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-bold">Add New User</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="user@pccoepune.org"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Minimum 6 characters"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    <option value="FACULTY">Faculty</option>
                                    <option value="BILLING_INCHARGE">Billing Incharge</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Department</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="Computer Engineering">Computer Engineering</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Civil">Civil</option>
                                    <option value="Electronics">Electronics</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Create User</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
