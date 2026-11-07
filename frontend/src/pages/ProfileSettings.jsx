import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Sparkles, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryStyle, setSummaryStyle] = useState('professional');
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    professional_title: '',
    about_me: '',
    social_links: { linkedin: '', github: '', website: '' }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portfolio/draft');
      if (res.data.profile_data) {
        setProfile({
          ...profile,
          ...res.data.profile_data
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAISummary = async () => {
    try {
      setGeneratingSummary(true);
      const res = await api.post('/ai/generate-summary', {
        style: summaryStyle,
        student_data: profile
      });
      setProfile({ ...profile, about_me: res.data.summary });
    } catch (err) {
      alert('Failed to generate AI summary.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const currentDraft = await api.get('/portfolio/draft');
      await api.post('/portfolio/save-draft', {
        design: currentDraft.data.design,
        profile_data: {
          ...currentDraft.data.profile_data,
          ...profile
        }
      });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your verified student details, social handles, and AI-generated About Me summaries.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <User size={18} className="text-indigo-600" />
            <span>Candidate Credentials</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Professional Title</label>
              <input
                type="text"
                value={profile.professional_title}
                onChange={(e) => setProfile({ ...profile, professional_title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles size={18} className="text-indigo-600" />
                <span>AI Professional Summary Generator</span>
              </h3>
              <p className="text-xs text-slate-500">Draft your bio across 4 tailored tones</p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={summaryStyle}
                onChange={(e) => setSummaryStyle(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none"
              >
                <option value="professional">Professional</option>
                <option value="technical">Technical Focus</option>
                <option value="fresher">Fresher Friendly</option>
                <option value="creative">Creative Builder</option>
              </select>

              <button
                type="button"
                onClick={handleGenerateAISummary}
                disabled={generatingSummary}
                className="flex items-center space-x-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-xs transition"
              >
                {generatingSummary ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          <textarea
            rows={4}
            value={profile.about_me}
            onChange={(e) => setProfile({ ...profile, about_me: e.target.value })}
            placeholder="Write a concise overview of your technical background and career goals..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none leading-relaxed"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl shadow-md transition text-xs"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
