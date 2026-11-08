import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../services/api';
import { 
  Palette, Globe, Share2, Eye, Download, QrCode, 
  Check, Copy, Sparkles, ExternalLink, RefreshCw, Layout, Sliders 
} from 'lucide-react';

export default function PortfolioBuilder() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  
  const [portfolio, setPortfolio] = useState({
    username: '',
    is_published: false,
    views_count: 0,
    design: {
      template: 'modern',
      theme_mode: 'light',
      primary_color: '#4f46e5',
      secondary_color: '#7c3aed',
      font_family: 'Inter',
      visible_sections: {
        hero: true,
        about: true,
        skills: true,
        projects: true,
        experience: true,
        education: true,
        certifications: true,
        achievements: true,
        contact: true
      }
    },
    profile_data: {}
  });

  useEffect(() => {
    fetchDraft();
  }, []);

  const fetchDraft = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portfolio/draft');
      setPortfolio(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      await api.post('/portfolio/save-draft', {
        design: portfolio.design,
        profile_data: portfolio.profile_data
      });
      alert('Draft portfolio customizations saved!');
    } catch (err) {
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      setPublishing(true);
      // Auto-save current design and profile draft before publishing so all changes are live
      await api.post('/portfolio/save-draft', {
        design: portfolio.design,
        profile_data: portfolio.profile_data
      });
      const nextState = !portfolio.is_published;
      const res = await api.post('/portfolio/publish', { is_published: nextState });
      setPortfolio({ ...portfolio, is_published: res.data.is_published });
      alert(res.data.is_published ? 'Portfolio published live with your latest theme and customizations!' : 'Portfolio unpublished.');
    } catch (err) {
      alert('Failed to update publication status.');
    } finally {
      setPublishing(false);
    }
  };

  const copyPublicLink = () => {
    const url = `${window.location.origin}/portfolio/${portfolio.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const p = portfolio.profile_data || {};
  const d = portfolio.design || {};

  return (
    <div className="space-y-8">
      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-1">
            <Globe size={13} />
            <span>Public URL: /portfolio/{portfolio.username}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            Dynamic Portfolio Studio
          </h1>
          <p className="text-xs text-slate-500">
            Customize typography, themes, and template layouts. Live preview updates immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={copyPublicLink}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <QrCode size={14} />
            <span>QR Code</span>
          </button>

          <a
            href={`${API_BASE_URL}/portfolio/${portfolio.username}/pdf`}
            download={`${portfolio.username}_portfolio.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Download size={14} />
            <span>Export PDF</span>
          </a>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`flex items-center space-x-1.5 px-5 py-2 rounded-xl font-bold text-xs shadow-md transition ${
              portfolio.is_published
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {portfolio.is_published ? 'Unpublish' : 'Publish Live'}
          </button>
        </div>
      </div>

      {/* Editor & Live Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Customization Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Template Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layout size={16} className="text-indigo-600" />
              <span>Select Portfolio Template</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'modern', name: 'Modern', desc: 'Sleek gradients & card elevation' },
                { id: 'professional', name: 'Professional', desc: 'Structured corporate & recruiter layout' },
                { id: 'minimal', name: 'Minimal', desc: 'Ultra-clean monochrome focus' },
                { id: 'creative', name: 'Creative', desc: 'Vibrant neon borders & playful badges' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPortfolio({ ...portfolio, design: { ...portfolio.design, template: t.id } })}
                  className={`p-3 rounded-xl border text-left transition ${
                    portfolio.design.template === t.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className={`font-bold text-xs ${portfolio.design.template === t.id ? 'text-indigo-600' : 'text-slate-900'}`}>{t.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Palette & Typography */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Palette size={16} className="text-indigo-600" />
              <span>Appearance & Accents</span>
            </h3>

            {/* Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Color Mode</label>
              <div className="flex gap-2">
                {['light', 'dark'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPortfolio({ ...portfolio, design: { ...portfolio.design, theme_mode: m } })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider capitalize border transition ${
                      portfolio.design.theme_mode === m
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Primary Accent Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={portfolio.design.primary_color || '#4f46e5'}
                  onChange={(e) => setPortfolio({ ...portfolio, design: { ...portfolio.design, primary_color: e.target.value } })}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300"
                />
                <span className="text-xs font-mono text-slate-600">{portfolio.design.primary_color}</span>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Typography</label>
              <select
                value={portfolio.design.font_family || 'Inter'}
                onChange={(e) => setPortfolio({ ...portfolio, design: { ...portfolio.design, font_family: e.target.value } })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Inter">Inter (Clean Modern Sans)</option>
                <option value="Roboto">Roboto (Google Neutral)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Trendy SaaS)</option>
                <option value="Georgia">Georgia (Classic Editorial Serif)</option>
              </select>
            </div>
          </div>

          {/* Section Visibility Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sliders size={16} className="text-indigo-600" />
              <span>Section Visibility</span>
            </h3>

            <div className="space-y-2">
              {Object.entries(portfolio.design.visible_sections || {}).map(([sec, isVis]) => (
                <label key={sec} className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                  <span className="capitalize">{sec}</span>
                  <input
                    type="checkbox"
                    checked={isVis}
                    onChange={(e) => {
                      setPortfolio({
                        ...portfolio,
                        design: {
                          ...portfolio.design,
                          visible_sections: {
                            ...portfolio.design.visible_sections,
                            [sec]: e.target.checked
                          }
                        }
                      });
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Live Responsive Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span className="flex items-center space-x-1.5">
              <Eye size={14} className="text-indigo-600" />
              <span>Real-Time Interactive Preview ({portfolio.design.template.toUpperCase()} TEMPLATE)</span>
            </span>
            <span>
              Status: <b className={portfolio.is_published ? 'text-emerald-600' : 'text-amber-600'}>{portfolio.is_published ? 'Published' : 'Draft Only'}</b>
            </span>
          </div>

          {/* Live Preview Container */}
          <div className={`
            rounded-3xl border shadow-xl overflow-hidden transition-all duration-300
            ${portfolio.design.theme_mode === 'dark' ? 'bg-slate-950 text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200'}
          `} style={{ fontFamily: portfolio.design.font_family }}>
            
            {/* Header Hero */}
            {portfolio.design.visible_sections?.hero && (
              <div className="p-8 md:p-12 border-b border-slate-100/10 relative overflow-hidden" style={{
                background: portfolio.design.template === 'creative' 
                  ? 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.15), transparent 70%)'
                  : undefined
              }}>
                <div className="max-w-2xl space-y-3">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{
                    backgroundColor: `${portfolio.design.primary_color}18`,
                    color: portfolio.design.primary_color
                  }}>
                    Available for Hiring & Opportunities
                  </span>
                  {/* Profile pic + name row */}
                  <div className="flex items-center gap-4">
                    {p.profile_picture && (
                      <img
                        src={p.profile_picture}
                        alt={p.name || 'Candidate'}
                        className="w-16 h-16 rounded-xl object-cover shadow-lg shrink-0"
                        style={{ border: `2px solid ${portfolio.design.primary_color}40` }}
                      />
                    )}
                    <div>
                      <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                        {p.name || 'Student Candidate'}
                      </h1>
                      <p className="text-base md:text-lg font-medium opacity-80" style={{ color: portfolio.design.primary_color }}>
                        {p.professional_title || 'Software Engineer / Student Builder'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm opacity-70 leading-relaxed">
                    {p.location ? `📍 ${p.location} • ` : ''}{p.email || 'student@university.edu'}
                  </p>

                  {/* Social Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {p.social_links?.github && (
                      <a href={p.social_links.github} target="_blank" rel="noreferrer" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300/30 hover:opacity-80">
                        GitHub &rarr;
                      </a>
                    )}
                    {p.social_links?.linkedin && (
                      <a href={p.social_links.linkedin} target="_blank" rel="noreferrer" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300/30 hover:opacity-80">
                        LinkedIn &rarr;
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* About Me */}
            {portfolio.design.visible_sections?.about && p.about_me && (
              <div className="p-8 border-b border-slate-100/10 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">About Candidate</h3>
                <p className="text-sm md:text-base leading-relaxed opacity-90">{p.about_me}</p>
              </div>
            )}

            {/* Skills */}
            {portfolio.design.visible_sections?.skills && p.skills && (
              <div className="p-8 border-b border-slate-100/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">Technical Proficiencies</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(p.skills).flat().map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-semibold border transition"
                      style={{
                        borderColor: `${portfolio.design.primary_color}40`,
                        backgroundColor: `${portfolio.design.primary_color}10`,
                        color: portfolio.design.primary_color
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {portfolio.design.visible_sections?.projects && p.projects?.length > 0 && (
              <div className="p-8 border-b border-slate-100/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">Featured Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {p.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border space-y-2 hover:shadow-md transition"
                      style={{
                        borderColor: portfolio.design.template === 'minimal' ? '#e2e8f0' : `${portfolio.design.primary_color}30`
                      }}
                    >
                      <h4 className="font-bold text-base">{proj.title}</h4>
                      <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(Array.isArray(proj.technologies)
                          ? proj.technologies
                          : typeof proj.technologies === 'string'
                          ? proj.technologies.split(/[\s,]+/).filter(Boolean)
                          : []
                        ).map((tech, ti) => (
                          <span key={ti} className="text-[10px] font-semibold opacity-60 bg-slate-500/10 px-2 py-0.5 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {portfolio.design.visible_sections?.education && p.education?.length > 0 && (
              <div className="p-8 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">Academic Background</h3>
                {p.education.map((ed, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-100/10 pb-2">
                    <div>
                      <p className="font-bold text-sm">{ed.degree}</p>
                      <p className="opacity-75">{ed.institution} {ed.branch ? `• ${ed.branch}` : ''}</p>
                    </div>
                    <span className="opacity-60">{ed.start_year} - {ed.graduation_year}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg">Scan to View Portfolio</h3>
            
            {!portfolio.is_published ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-3">
                <p className="font-semibold">⚠️ Your portfolio is currently in DRAFT mode.</p>
                <p className="text-[11px] text-amber-700">
                  Public visitors cannot access unpublished portfolios. Click below to publish your portfolio live right now.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await handleTogglePublish();
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-md transition"
                >
                  🚀 Click to Publish Live Now
                </button>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                ✅ Portfolio is published live!
              </div>
            )}

            <div className="flex justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={`${API_BASE_URL}/portfolio/${portfolio.username}/qrcode`}
                alt="Portfolio QR Code"
                className="w-48 h-48 rounded-lg shadow-sm"
              />
            </div>
            
            <a
              href={`/portfolio/${portfolio.username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200"
            >
              <span>Open /portfolio/{portfolio.username}</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
