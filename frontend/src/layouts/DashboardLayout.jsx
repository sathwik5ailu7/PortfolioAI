import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, Sparkles, Palette, Eye, 
  BarChart3, Compass, MessageSquareCode, User, Shield, 
  LogOut, Menu, X, ChevronRight, ExternalLink
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume Upload', path: '/upload-resume', icon: FileText },
    { label: 'Extraction Review', path: '/extraction-review', icon: Sparkles },
    { label: 'Portfolio Builder', path: '/portfolio-builder', icon: Palette },
    { label: 'Resume & ATS Analyzer', path: '/resume-analyzer', icon: BarChart3 },
    { label: 'Skill Gap Analyzer', path: '/skill-gap', icon: Compass },
    { label: 'Interview Preparation', path: '/interview-prep', icon: MessageSquareCode },
    { label: 'Profile Settings', path: '/profile-settings', icon: User },
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Console', path: '/admin', icon: Shield });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-indigo-900 text-white flex items-center justify-between p-4 shadow-md sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-inner">
            P
          </div>
          <span className="font-extrabold text-lg tracking-tight">PortfolioAI</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-indigo-200 hover:text-white">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-black text-white text-lg shadow-md">
                P
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight">PortfolioAI</span>
                <span className="block text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">SaaS Studio</span>
              </div>
            </Link>
          </div>

          {/* User Preview */}
          <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold">
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Student'}</p>
              <p className="text-xs text-slate-400 truncate">@{user?.username || 'user'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="opacity-70" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {user?.username && (
            <Link
              to={`/portfolio/${user.username}`}
              target="_blank"
              className="flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 hover:text-indigo-200 text-xs font-semibold hover:bg-indigo-900/60 transition"
            >
              <span>View Public Link</span>
              <ExternalLink size={13} />
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3.5 py-2.5 w-full rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
