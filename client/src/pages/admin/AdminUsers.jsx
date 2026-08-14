import React, { useEffect, useState } from "react";
import { Search, Filter, Shield, Ban, CheckCircle, MoreVertical } from "lucide-react";
import { adminApi } from "../../api/adminApi";

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ search, role, limit: 20 });
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminApi.updateUserStatus(id, status);
      setUsers(users.map(u => (u._id === id ? { ...u, status } : u)));
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage, verify, and suspend platform users.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 rounded-md border border-slate-300 px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            className="w-full bg-transparent outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="hidden">Search</button>
        </form>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="rounded-md border border-slate-300 py-2 pl-3 pr-8 outline-none focus:border-emerald-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="Farmer">Farmer</option>
            <option value="Admin">Admin</option>
            <option value="Buyer">Buyer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                          {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p>{user.email}</p>
                      <p className="text-xs text-slate-500">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                        {user.role === 'Admin' && <Shield size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {user.status === 'suspended' ? <Ban size={12} /> : <CheckCircle size={12} />}
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.status === 'suspended' ? (
                        <button 
                          onClick={() => handleStatusChange(user._id, 'active')}
                          className="rounded border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          Unsuspend
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStatusChange(user._id, 'suspended')}
                          className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
