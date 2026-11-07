import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, Users, Globe, Eye, FileText, CheckCircle2, XCircle, Search, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await api.post(`/admin/toggle-user-status/${userId}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold mb-2">
          <Shield size={14} className="text-indigo-400" />
          <span>Platform Administrator Console</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Admin Overview & Monitoring
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor system metrics, registered candidates, published student showcases, and account statuses.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Total Registered</span>
          <p className="text-3xl font-black text-slate-900">{stats?.total_users || 0}</p>
          <span className="text-xs text-indigo-600 font-semibold mt-1 block">Student Accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Published Portfolios</span>
          <p className="text-3xl font-black text-emerald-600">{stats?.published_portfolios || 0}</p>
          <span className="text-xs text-slate-400 font-medium mt-1 block">Of {stats?.total_portfolios || 0} created</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">AI ATS Diagnostics</span>
          <p className="text-3xl font-black text-violet-600">{stats?.total_analyses || 0}</p>
          <span className="text-xs text-slate-400 font-medium mt-1 block">Reports processed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Total Public Views</span>
          <p className="text-3xl font-black text-slate-900">{stats?.total_portfolio_views || 0}</p>
          <span className="text-xs text-slate-400 font-medium mt-1 block">Recruiter impressions</span>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 text-base">Registered Students Directory</h3>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Username & Link</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Portfolio Status</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-slate-400 text-[11px]">{u.email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {u.is_published ? (
                      <a
                        href={`/portfolio/${u.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center space-x-1"
                      >
                        <span>/{u.username}</span>
                      </a>
                    ) : (
                      <span>/{u.username} (Draft)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 capitalize font-semibold text-slate-700">{u.role}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${u.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{u.views_count}</td>
                  <td className="py-3.5 px-4 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-3 py-1 rounded-lg font-semibold transition ${
                          u.is_active
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
