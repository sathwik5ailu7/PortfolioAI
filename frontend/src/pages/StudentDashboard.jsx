import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Sparkles, FileText, CheckCircle2, TrendingUp, Layers, 
  ExternalLink, ArrowUpRight, BarChart3, Award, Code2, 
  Eye, RefreshCw, AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="animate-spin text-indigo-600" size={32} />
          <p className="text-sm text-slate-500 font-medium">Loading your student dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-8 text-white shadow-xl shadow-indigo-950/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold">
              <Sparkles size={13} />
              <span>AI Portfolio Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {stats?.user_name || 'Student'}!
            </h1>
            <p className="text-indigo-200 text-sm max-w-xl">
              Your profile is {stats?.profile_completion_percentage}% ready. Update credentials, monitor ATS scores, and share your live public link.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {stats?.portfolio_published ? (
              <a
                href={stats.public_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg transition"
              >
                <span>Live Portfolio</span>
                <ExternalLink size={16} />
              </a>
            ) : (
              <Link
                to="/portfolio-builder"
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-lg transition"
              >
                <span>Publish Portfolio</span>
                <ArrowUpRight size={16} />
              </Link>
            )}
            <Link
              to="/upload-resume"
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-sm border border-white/20 transition"
            >
              <FileText size={16} />
              <span>Update Resume</span>
            </Link>
          </div>
        </div>

        {/* Profile Progress Bar */}
        <div className="mt-8 pt-6 border-t border-indigo-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-indigo-200">Profile Completion</span>
              <span className="text-white">{stats?.profile_completion_percentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-indigo-950/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${stats?.profile_completion_percentage || 0}%` }}
              ></div>
            </div>
          </div>
          <span className="text-xs text-indigo-300">
            {stats?.profile_completion_percentage === 100 
              ? '🎉 Profile completely optimized!'
              : 'Add skills and projects to reach 100% recruiter visibility.'}
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Skills</span>
            <Code2 size={18} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.total_skills || 0}</p>
          <span className="text-xs text-slate-400 mt-2 font-medium">Categorized tech stacks</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
            <Layers size={18} className="text-violet-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.total_projects || 0}</p>
          <span className="text-xs text-slate-400 mt-2 font-medium">Showcased repositories</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimated ATS</span>
            <BarChart3 size={18} className="text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {stats?.latest_ats_score ? `${stats.latest_ats_score}/100` : 'Pending'}
          </p>
          <span className="text-xs text-slate-400 mt-2 font-medium">
            {stats?.latest_ats_score ? 'AI diagnostic score' : 'Run Resume Analyzer'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Portfolio Views</span>
            <Eye size={18} className="text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.views_count || 0}</p>
          <span className="text-xs text-slate-400 mt-2 font-medium">
            {stats?.portfolio_published ? 'Live public traffic' : 'Unpublished draft'}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Workflow Steps */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <span>Portfolio Launch Workflow</span>
            <span className="text-xs font-normal text-slate-500">(Step-by-step pipeline)</span>
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 transition">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${stats?.resume_uploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Resume Upload & Parsing</h4>
                  <p className="text-xs text-slate-500">
                    {stats?.resume_uploaded ? 'Resume extracted and processed.' : 'Upload your PDF resume to extract details.'}
                  </p>
                </div>
              </div>
              <Link
                to="/upload-resume"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
              >
                {stats?.resume_uploaded ? 'Re-upload' : 'Upload'}
              </Link>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 transition">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Review & Edit Extracted Details</h4>
                  <p className="text-xs text-slate-500">Verify extracted skills, projects, and education before building.</p>
                </div>
              </div>
              <Link
                to="/extraction-review"
                className="text-xs font-semibold text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition"
              >
                Review Details
              </Link>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 transition">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${stats?.portfolio_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Customize & Publish Portfolio</h4>
                  <p className="text-xs text-slate-500">
                    {stats?.portfolio_published ? 'Currently published at /portfolio/' + stats.username : 'Choose template, customize colors, and go live.'}
                  </p>
                </div>
              </div>
              <Link
                to="/portfolio-builder"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
              >
                {stats?.portfolio_published ? 'Manage Live' : 'Open Builder'}
              </Link>
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 mb-3">
              <Sparkles size={18} />
              <h3 className="font-bold text-slate-900 text-base">AI Career Insights</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Real-time actionable feedback based on your profile completeness and current market standards.
            </p>

            <div className="space-y-3">
              {stats?.recent_recommendations?.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 flex items-start space-x-2">
                  <CheckCircle2 size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/resume-analyzer"
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
            >
              <span>Run Deep Resume Diagnostic</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
