import { useState, useEffect, useRef } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { PROGRAM_DEPARTMENTS } from "../../constants/departments";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [createdCred, setCreatedCred] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [showImportPanel, setShowImportPanel] = useState(false);
    const fileRef = useRef(null);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: "", email: "", emp_code: "",
        mobile: "", pan_card: "", role: "FACULTY", department: ""
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
            const res = await api.post("/admin/users", formData);
            setCreatedCred({ name: formData.name, email: formData.email, password: res.data.generated_password });
            setFormData({ name: "", email: "", emp_code: "", mobile: "", pan_card: "", role: "FACULTY", department: "" });
            fetchUsers();
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to create user", "error");
        }
    };

    const handleBulkImport = async (e) => {
        e.preventDefault();
        const file = fileRef.current?.files[0];
        if (!file) return showToast("Please select a file", "error");
        setImporting(true);
        setImportResult(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await api.post("/admin/users/bulk-import", fd, { headers: { "Content-Type": "multipart/form-data" } });
            setImportResult(res.data);
            if (fileRef.current) fileRef.current.value = "";
            fetchUsers();
            showToast(res.data.message, "success");
        } catch (err) {
            showToast(err.response?.data?.message || "Import failed", "error");
        } finally { setImporting(false); }
    };

    const downloadCredentials = (credentials) => {
        const csv = ["Name,Email,Designation,Password",
            ...credentials.map(c => `"${c.name}","${c.email}","${c.designation || ''}","${c.password}"`)
        ].join("\n");
        const a = Object.assign(document.createElement("a"), {
            href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
            download: "imported_credentials.csv"
        });
        a.click();
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

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/admin/users/${selectedUser.id}/password`, { newPassword });
            showToast("Password reset successfully", "success");
            setShowResetModal(false);
            setNewPassword("");
            setSelectedUser(null);
        } catch (error) {
            console.error("Reset password error:", error);
            showToast(error.response?.data?.message || "Failed to reset password", "error");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6 font-display bg-background-light min-h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage faculty and billing incharge accounts. Passwords are auto-generated.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setShowImportPanel(p => !p); setImportResult(null); }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm">
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        Bulk Import
                    </button>
                    <button onClick={() => { setShowModal(true); setCreatedCred(null); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-sm text-sm">
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Add User
                    </button>
                </div>
            </div>

            {/* Bulk Import Panel */}
            {showImportPanel && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800">Bulk Import Users</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Accepts <strong>.xlsx / .xls / .csv</strong>. Supports the college faculty Excel format or generic CSV with headers: <span className="font-mono bg-slate-100 px-1 rounded text-[11px]">name, email, emp_code, designation, department, mobile, pan_card</span></p>
                        </div>
                        <button onClick={() => setShowImportPanel(false)} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                    <form onSubmit={handleBulkImport} className="flex items-center gap-3 flex-wrap">
                        <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 text-sm font-semibold text-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">folder_open</span>
                            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" />
                            Choose File
                        </label>
                        <button type="submit" disabled={importing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">{importing ? "hourglass_empty" : "cloud_upload"}</span>
                            {importing ? "Importing..." : "Import"}
                        </button>
                    </form>
                    {importResult && (
                        <div className="space-y-3">
                            <div className="flex gap-4">
                                {[{l:"Inserted",v:importResult.inserted,c:"emerald"},{l:"Skipped",v:importResult.skipped,c:"amber"},{l:"Errors",v:importResult.errors?.length||0,c:"red"}].map(s=>(
                                    <div key={s.l} className={`flex items-center gap-2 px-3 py-2 bg-${s.c}-50 border border-${s.c}-200 rounded-xl`}>
                                        <span className={`text-xl font-black text-${s.c}-700`}>{s.v}</span>
                                        <span className={`text-xs font-bold text-${s.c}-500 uppercase`}>{s.l}</span>
                                    </div>
                                ))}
                            </div>
                            {importResult.inserted > 0 && (
                                <button onClick={() => downloadCredentials(importResult.credentials)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors">
                                    <span className="material-symbols-outlined text-[17px]">download</span>
                                    Download Credentials CSV ({importResult.inserted} users)
                                </button>
                            )}
                            {importResult.errors?.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                    {importResult.errors.map((e,i)=><p key={i} className="text-xs text-red-600 font-mono">{e}</p>)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">filter_list</span>
                    <h3 className="text-sm font-bold text-slate-700 mr-2">Filter Roles:</h3>
                    <div className="flex flex-wrap gap-2">
                        {['', 'FACULTY', 'BILLING_INCHARGE', 'ADMIN'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${filterRole === role
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                {role === '' ? 'All Roles' : role.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User Profile</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activities</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="w-8 h-8 border-3 border-slate-200 border-t-primary rounded-full animate-spin mx-auto"></div>
                                        <p className="mt-2 text-sm text-slate-500 font-medium">Loading users...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">group_off</span>
                                        <p className="font-medium text-sm">No users found.</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                                                    <span className="material-symbols-outlined text-[20px]">{user.role === 'ADMIN' ? 'admin_panel_settings' : 'person'}</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800">{user.name}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">mail</span>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border max-w-max ${user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                user.role === 'BILLING_INCHARGE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                <span className="material-symbols-outlined text-[12px]">
                                                    {user.role === 'ADMIN' ? 'shield_person' : user.role === 'BILLING_INCHARGE' ? 'account_balance_wallet' : 'school'}
                                                </span>
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.department ? (
                                                <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded max-w-max">
                                                    <span className="material-symbols-outlined text-[14px]">domain</span>
                                                    {user.department}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 font-medium">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                <span className="material-symbols-outlined text-[14px] text-slate-400">receipt_long</span>
                                                {user.total_claims} Claims
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border flex items-center gap-1 max-w-max ${user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                <span className="material-symbols-outlined text-[12px]">{user.is_active ? 'check_circle' : 'cancel'}</span>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role !== 'ADMIN' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => { setSelectedUser(user); setShowResetModal(true); }}
                                                        className="inline-flex items-center justify-center p-2 rounded-xl transition-colors border text-amber-600 hover:bg-amber-50 border-transparent hover:border-amber-200"
                                                        title="Reset Password"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                                                    </button>
                                                    <button
                                                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                        className={`inline-flex items-center justify-center p-2 rounded-xl transition-colors border ${user.is_active
                                                            ? 'text-red-600 hover:bg-red-50 border-transparent hover:border-red-200'
                                                            : 'text-emerald-600 hover:bg-emerald-50 border-transparent hover:border-emerald-200'
                                                            }`}
                                                        title={user.is_active ? "Deactivate User" : "Activate User"}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">{user.is_active ? 'person_off' : 'person_check'}</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 font-medium italic select-none">Protected</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal container logic */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[24px]">person_add</span>
                                <h3 className="text-lg font-bold text-slate-800">Add New User</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        {/* Generated credentials banner */}
                        {createdCred && (
                            <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <p className="text-xs font-bold text-emerald-700 mb-1">✅ User created — share these credentials:</p>
                                <p className="text-xs text-slate-700"><span className="text-slate-400">Email:</span> <span className="font-mono">{createdCred.email}</span></p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-400">Password:</span>
                                    <span className="font-mono text-xs bg-white border border-emerald-200 px-2 py-0.5 rounded text-emerald-700 font-bold">{createdCred.password}</span>
                                    <button type="button" onClick={() => navigator.clipboard.writeText(createdCred.password)}
                                        className="text-emerald-500 hover:text-emerald-700">
                                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                🔑 Password auto-generated: <strong>lastName + last 4 of Emp Code</strong> (e.g. <span className="font-mono">ovale1944</span>)
                            </p>
                            {[{key:"name",label:"Full Name *",icon:"badge",ph:"e.g. SHRADDHA VIJAY OVALE",type:"text",req:true},
                              {key:"email",label:"Email *",icon:"mail",ph:"user@pccoepune.org",type:"email",req:true},
                              {key:"emp_code",label:"Employee Code",icon:"tag",ph:"e.g. 20TCOMP1944",type:"text",req:false},
                              {key:"mobile",label:"Mobile",icon:"phone",ph:"10-digit number",type:"text",req:false},
                              {key:"pan_card",label:"PAN Card",icon:"credit_card",ph:"ABCDE1234F",type:"text",req:false},
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{f.label}</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">{f.icon}</span>
                                        <input type={f.type} value={formData[f.key]}
                                            onChange={e => setFormData(p => ({...p,[f.key]:e.target.value}))}
                                            placeholder={f.ph} required={f.req}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                    </div>
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Role</label>
                                    <div className="relative">
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="FACULTY">Faculty</option>
                                            <option value="BILLING_INCHARGE">Billing Inch.</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Department</label>
                                    <div className="relative">
                                        <select
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Select</option>
                                            {Object.entries(PROGRAM_DEPARTMENTS).map(([program, depts]) => (
                                                <optgroup key={program} label={program}>
                                                    {depts.map((dept) => (
                                                        <option key={dept} value={dept}>{dept}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                                <button type="button" onClick={() => { setShowModal(false); setCreatedCred(null); }}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                    {createdCred ? "Close" : "Cancel"}
                                </button>
                                {!createdCred && (
                                    <button type="submit"
                                        className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-hover transition-colors shadow-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">add_task</span>
                                        Create User
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500 text-[24px]">lock_reset</span>
                                <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
                            </div>
                            <button onClick={() => { setShowResetModal(false); setNewPassword(""); setSelectedUser(null); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-5">
                            <div className="mb-4">
                                <p className="text-sm font-medium text-slate-600">
                                    Reset password for <span className="font-bold text-slate-800">{selectedUser?.name}</span>
                                </p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">lock</span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowResetModal(false); setNewPassword(""); setSelectedUser(null); }}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">key</span>
                                    Set Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
