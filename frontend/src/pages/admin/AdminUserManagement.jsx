import { useState, useEffect, useRef } from "react";
import api from "../../services/api";

const DEPARTMENTS = [
    "Computer Engineering", "Information Technology", "Electronics & Telecommunication",
    "Mechanical Engineering", "Civil Engineering", "First Year Engineering"
];

function PasswordBadge({ password }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md font-mono text-xs text-emerald-700">
            {password}
            <button onClick={copy} className="text-emerald-500 hover:text-emerald-700">
                <span className="material-symbols-outlined text-[14px]">{copied ? "check" : "content_copy"}</span>
            </button>
        </span>
    );
}

export default function AdminUserManagement() {
    const [tab, setTab] = useState("create"); // create | bulk | list
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [roleFilter, setRoleFilter] = useState("");
    const [search, setSearch] = useState("");

    // Single create form
    const [form, setForm] = useState({ name: "", email: "", role: "FACULTY", department: "", emp_code: "", mobile: "", pan_card: "" });
    const [creating, setCreating] = useState(false);
    const [createdCred, setCreatedCred] = useState(null); // { name, email, generated_password }

    // Bulk import
    const fileRef = useRef(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    // Reset password modal
    const [resetModal, setResetModal] = useState(null); // { id, name }
    const [newPwd, setNewPwd] = useState("");
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        if (tab === "list") fetchUsers();
    }, [tab, roleFilter]);

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await api.get(`/admin/users${roleFilter ? `?role=${roleFilter}` : ""}`);
            setUsers(res.data);
        } catch { setUsers([]); }
        finally { setUsersLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.department) return;
        setCreating(true);
        setCreatedCred(null);
        try {
            const res = await api.post("/admin/users", form);
            setCreatedCred({ name: form.name, email: form.email, generated_password: res.data.generated_password });
            setForm({ name: "", email: "", role: "FACULTY", department: "", emp_code: "", mobile: "", pan_card: "" });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create user");
        } finally { setCreating(false); }
    };

    const handleBulkImport = async (e) => {
        e.preventDefault();
        const file = fileRef.current?.files[0];
        if (!file) return alert("Please select a file");
        setImporting(true);
        setImportResult(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await api.post("/admin/users/bulk-import", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setImportResult(res.data);
            if (fileRef.current) fileRef.current.value = "";
        } catch (err) {
            alert(err.response?.data?.message || "Import failed");
        } finally { setImporting(false); }
    };

    const downloadCredentials = (credentials) => {
        const csv = ["Name,Email,Designation,Password",
            ...credentials.map(c => `"${c.name}","${c.email}","${c.designation || ''}","${c.password}"`)
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "imported_users_credentials.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await api.patch(`/admin/users/${userId}/status`, { is_active: !currentStatus });
            fetchUsers();
        } catch (err) { alert(err.response?.data?.message || "Failed"); }
    };

    const handleResetPassword = async () => {
        if (!newPwd || newPwd.length < 6) return alert("Password must be at least 6 characters");
        setResetting(true);
        try {
            await api.patch(`/admin/users/${resetModal.id}/password`, { newPassword: newPwd });
            alert(`Password reset for ${resetModal.name}`);
            setResetModal(null); setNewPwd("");
        } catch (err) { alert(err.response?.data?.message || "Failed"); }
        finally { setResetting(false); }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.department?.toLowerCase().includes(search.toLowerCase())
    );

    const tabs = [
        { id: "create", label: "Create User", icon: "person_add" },
        { id: "bulk", label: "Bulk Import", icon: "upload_file" },
        { id: "list", label: "Manage Users", icon: "manage_accounts" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                <p className="text-sm text-slate-500 mt-0.5">Create faculty/billing accounts and bulk-import via Excel or CSV.</p>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 overflow-x-auto">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all border ${tab === t.id
                            ? "bg-primary text-white border-primary shadow"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                        <span className="material-symbols-outlined text-[17px]">{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* === CREATE SINGLE USER === */}
            {tab === "create" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl">
                    <h3 className="text-base font-bold text-slate-800 mb-1">New User Account</h3>
                    <p className="text-xs text-slate-500 mb-5">
                        Password is auto-generated: <span className="font-mono bg-slate-100 px-1 rounded">lastName + last4 of Emp Code</span>.
                        If no emp code, uses <span className="font-mono bg-slate-100 px-1 rounded">lastName@1234</span>.
                    </p>

                    <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { key: "name", label: "Full Name *", placeholder: "e.g. SHRADDHA VIJAY OVALE" },
                            { key: "email", label: "Email *", placeholder: "name@pccoepune.org", type: "email" },
                            { key: "emp_code", label: "Employee Code", placeholder: "e.g. 20TCOMP1944" },
                            { key: "mobile", label: "Mobile", placeholder: "10-digit number" },
                            { key: "pan_card", label: "PAN Card", placeholder: "ABCDE1234F" },
                        ].map(f => (
                            <div key={f.key} className={f.key === "name" ? "sm:col-span-2" : ""}>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                                <input type={f.type || "text"} placeholder={f.placeholder} value={form[f.key]}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    required={f.label.includes("*")}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                            </div>
                        ))}

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Role *</label>
                            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} required
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white">
                                <option value="FACULTY">Faculty</option>
                                <option value="BILLING_INCHARGE">Billing Incharge</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department *</label>
                            <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} required
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white">
                                <option value="">Select department...</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="sm:col-span-2 flex justify-end">
                            <button type="submit" disabled={creating}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm">
                                <span className="material-symbols-outlined text-[17px]">{creating ? "hourglass_empty" : "person_add"}</span>
                                {creating ? "Creating..." : "Create User"}
                            </button>
                        </div>
                    </form>

                    {/* Generated credentials */}
                    {createdCred && (
                        <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                                <p className="font-bold text-emerald-800 text-sm">User created — share these credentials</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-slate-500 text-xs">Name:</span> <span className="font-semibold">{createdCred.name}</span></div>
                                <div><span className="text-slate-500 text-xs">Email:</span> <span className="font-mono text-xs">{createdCred.email}</span></div>
                                <div className="col-span-2"><span className="text-slate-500 text-xs">Password:</span> <PasswordBadge password={createdCred.generated_password} /></div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* === BULK IMPORT === */}
            {tab === "bulk" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-5">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 mb-1">Bulk Import Users</h3>
                        <p className="text-xs text-slate-500">
                            Upload an <strong>.xlsx</strong>, <strong>.xls</strong>, or <strong>.csv</strong> file.
                            Supports two formats:
                        </p>
                        <ul className="mt-2 text-xs text-slate-600 list-disc list-inside space-y-0.5">
                            <li><strong>College Excel format</strong> (Comp_ALL_Faculty_details.xlsx) — uses column positions automatically</li>
                            <li><strong>Generic format</strong> — needs headers: <span className="font-mono bg-slate-100 px-1 rounded">name, email, emp_code, designation, department, mobile, pan_card</span></li>
                        </ul>
                        <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            ⚠️ Only faculty designations (Assistant/Associate/Full Professor, HOD, Dean Academics) will get login accounts. Others are skipped.
                        </p>
                    </div>

                    <form onSubmit={handleBulkImport} className="space-y-4">
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">upload_file</span>
                            <p className="text-sm text-slate-500 mb-3">Choose your Excel or CSV file</p>
                            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" id="bulkFile"
                                onChange={() => setImportResult(null)} />
                            <label htmlFor="bulkFile"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm cursor-pointer transition-colors">
                                <span className="material-symbols-outlined text-[17px]">folder_open</span>
                                Browse File
                            </label>
                        </div>

                        <button type="submit" disabled={importing}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm">
                            <span className="material-symbols-outlined text-[17px]">{importing ? "hourglass_empty" : "cloud_upload"}</span>
                            {importing ? "Importing..." : "Import Users"}
                        </button>
                    </form>

                    {/* Import results */}
                    {importResult && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Inserted", value: importResult.inserted, color: "emerald" },
                                    { label: "Skipped", value: importResult.skipped, color: "amber" },
                                    { label: "Errors", value: importResult.errors?.length || 0, color: "red" },
                                ].map(s => (
                                    <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-200 rounded-xl p-3 text-center`}>
                                        <p className={`text-2xl font-black text-${s.color}-700`}>{s.value}</p>
                                        <p className={`text-xs font-bold text-${s.color}-500 uppercase tracking-wider`}>{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {importResult.inserted > 0 && (
                                <button onClick={() => downloadCredentials(importResult.credentials)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all">
                                    <span className="material-symbols-outlined text-[17px]">download</span>
                                    Download Credentials CSV ({importResult.inserted} users)
                                </button>
                            )}

                            {importResult.errors?.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                    <p className="text-xs font-bold text-red-700 mb-1">Errors:</p>
                                    {importResult.errors.map((e, i) => (
                                        <p key={i} className="text-xs text-red-600 font-mono">{e}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* === MANAGE USERS LIST === */}
            {tab === "list" && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" placeholder="Search by name, email, department…" value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); }}
                            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                            <option value="">All Roles</option>
                            <option value="FACULTY">Faculty</option>
                            <option value="BILLING_INCHARGE">Billing Incharge</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {usersLoading ? (
                                        <tr><td colSpan="5" className="py-12 text-center text-slate-400 text-sm">Loading...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan="5" className="py-12 text-center text-slate-400 text-sm">No users found</td></tr>
                                    ) : filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3">
                                                <p className="font-semibold text-slate-800">{u.name}</p>
                                                <p className="text-xs text-slate-400 font-mono">{u.email}</p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${
                                                    u.role === "ADMIN" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                    u.role === "BILLING_INCHARGE" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                    "bg-slate-50 text-slate-600 border-slate-200"
                                                }`}>{u.role.replace("_", " ")}</span>
                                            </td>
                                            <td className="px-5 py-3 text-slate-600 text-xs">{u.department || "—"}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-red-400"}`}></span>
                                                    {u.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {u.role !== "ADMIN" && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => handleToggleStatus(u.id, u.is_active)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                                u.is_active
                                                                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                                                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                            }`}>
                                                            {u.is_active ? "Deactivate" : "Activate"}
                                                        </button>
                                                        <button onClick={() => { setResetModal({ id: u.id, name: u.name }); setNewPwd(""); }}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 transition-all">
                                                            Reset Pwd
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredUsers.length > 0 && (
                            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium text-center">
                                Showing {filteredUsers.length} of {users.length} users
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Reset Password</h3>
                            <button onClick={() => setResetModal(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <p className="text-sm text-slate-500">Setting new password for <strong>{resetModal.name}</strong></p>
                        <input type="text" placeholder="New password (min 6 chars)" value={newPwd}
                            onChange={e => setNewPwd(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        <div className="flex gap-3">
                            <button onClick={() => setResetModal(null)}
                                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleResetPassword} disabled={resetting || newPwd.length < 6}
                                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
                                {resetting ? "Resetting..." : "Reset"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
