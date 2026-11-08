import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { API_BASE_URL } from '../services/api';
import { 
  Download, QrCode, Share2, ExternalLink, Globe, Mail, MapPin, Check, FileText, ArrowLeft, RefreshCw 
} from 'lucide-react';

export default function PublicPortfolio() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    fetchPublicData();
  }, [username]);

  const fetchPublicData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/public/portfolio/${username}`);
      setData(res.data);
    } catch (err) {
      console.error('Portfolio fetch error:', err);
      if (err.response?.status === 403) {
        setError('This portfolio is currently private or unpublished by the candidate.');
      } else if (err.response?.status === 404) {
        setError(`Portfolio "${username}" was not found.`);
      } else {
        setError(err.response?.data?.detail || err.message || 'Unable to connect to the Portfolio API.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <RefreshCw className="animate-spin text-indigo-600 mx-auto" size={32} />
          <p className="text-sm font-semibold text-slate-600">Loading candidate showcase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <FileText size={32} />
          </div>
          <h2 className="text-2xl font-bold">Showcase Unavailable</h2>
          <p className="text-sm text-slate-400">{error}</p>
          <Link to="/" className="inline-block mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            &larr; Back to PortfolioAI Home
          </Link>
        </div>
      </div>
    );
  }

  const p = data?.profile || {};
  const d = data?.design || {};
  const isDark = d.theme_mode === 'dark';
  const primaryColor = d.primary_color || '#4f46e5';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
      style={{ fontFamily: d.font_family || 'Inter' }}
    >
      {/* Sticky Recruiter Action Bar */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 py-3.5 flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            {p.name?.[0]?.toUpperCase() || 'P'}
          </div>
          <span className="font-bold text-sm tracking-tight hidden sm:inline">
            {p.name || 'Candidate Portfolio'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyUrl}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}`}
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={() => setShowQr(true)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}`}
          >
            <QrCode size={14} />
            <span className="hidden sm:inline">QR Code</span>
          </button>

          <a
            href={`${API_BASE_URL}/portfolio/${username}/pdf`}
            download={`${username}_portfolio.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </a>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        {d.visible_sections?.hero && (
          <section
            className={`space-y-6 pt-4 rounded-3xl p-6 md:p-8 transition-all ${
              d.template === 'creative'
                ? 'border-2 shadow-2xl relative overflow-hidden'
                : d.template === 'professional'
                ? 'border-b-2 pb-8'
                : d.template === 'minimal'
                ? 'border border-slate-200/50'
                : ''
            }`}
            style={{
              borderColor: d.template === 'creative' ? `${primaryColor}60` : undefined,
              background: d.template === 'creative'
                ? `radial-gradient(circle at top right, ${primaryColor}20, transparent 70%)`
                : undefined
            }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold" style={{
              backgroundColor: `${primaryColor}15`,
              color: primaryColor
            }}>
              <span>Verified Student Portfolio • PortfolioAI</span>
            </div>

            {/* Name + Profile Picture row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Profile Picture */}
              {p.profile_picture && (
                <div className="shrink-0">
                  <img
                    src={p.profile_picture}
                    alt={p.name || 'Candidate'}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover shadow-xl"
                    style={{ border: `3px solid ${primaryColor}40` }}
                  />
                </div>
              )}
              <div className="space-y-3">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                  {p.name || 'Student Candidate'}
                </h1>
                <p className="text-xl md:text-2xl font-semibold opacity-90" style={{ color: primaryColor }}>
                  {p.professional_title || 'Software Engineer / Student Builder'}
                </p>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm opacity-70">
              {p.location && (
                <span className="flex items-center space-x-1">
                  <MapPin size={15} />
                  <span>{p.location}</span>
                </span>
              )}
              {p.email && (
                <a href={`mailto:${p.email}`} className="flex items-center space-x-1 hover:underline">
                  <Mail size={15} />
                  <span>{p.email}</span>
                </a>
              )}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3 pt-2">
              {p.social_links?.github && (
                <a
                  href={p.social_links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-300/30 hover:opacity-80 text-xs font-bold transition"
                >
                  <span>GitHub</span>
                  <ExternalLink size={12} className="opacity-50" />
                </a>
              )}

              {p.social_links?.linkedin && (
                <a
                  href={p.social_links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-300/30 hover:opacity-80 text-xs font-bold transition"
                >
                  <span>LinkedIn</span>
                  <ExternalLink size={12} className="opacity-50" />
                </a>
              )}

              {p.social_links?.website && (
                <a
                  href={p.social_links.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-300/30 hover:opacity-80 text-xs font-bold transition"
                >
                  <Globe size={15} />
                  <span>Personal Site</span>
                  <ExternalLink size={12} className="opacity-50" />
                </a>
              )}
            </div>
          </section>
        )}

        {/* About Me Section */}
        {d.visible_sections?.about && p.about_me && (
          <section className={`p-8 rounded-3xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-3 shadow-sm`}>
            <h2 className="text-xs uppercase font-extrabold tracking-widest opacity-50">About Me</h2>
            <p className="text-base md:text-lg leading-relaxed opacity-90">{p.about_me}</p>
          </section>
        )}

        {/* Technical Skills */}
        {d.visible_sections?.skills && p.skills && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest opacity-50">Core Competencies & Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(p.skills).map(([cat, list]) => list?.length > 0 && (
                <div key={cat} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'} space-y-2`}>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">
                    {cat.replace(/_/g, ' ')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(list) ? list : []).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {d.visible_sections?.projects && p.projects?.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase font-extrabold tracking-widest opacity-50">Selected Projects & Builds</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {p.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition ${
                    isDark ? 'bg-slate-900/60' : 'bg-white'
                  } ${
                    d.template === 'creative'
                      ? 'shadow-lg hover:scale-[1.02]'
                      : d.template === 'minimal'
                      ? 'border-slate-200 shadow-none'
                      : d.template === 'professional'
                      ? 'border-l-4'
                      : ''
                  }`}
                  style={{
                    borderColor: d.template === 'creative'
                      ? `${primaryColor}40`
                      : d.template === 'professional'
                      ? primaryColor
                      : isDark ? '#1e293b' : '#e2e8f0'
                  }}
                >
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">{proj.title}</h3>
                    <p className="text-sm opacity-80 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(Array.isArray(proj.technologies)
                        ? proj.technologies
                        : typeof proj.technologies === 'string'
                        ? proj.technologies.split(/[\s,]+/).filter(Boolean)
                        : []
                      ).map((tech, ti) => (
                        <span key={ti} className="text-[11px] font-semibold opacity-60 bg-slate-500/10 px-2.5 py-0.5 rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-3 border-t border-slate-500/10 text-xs font-bold">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:underline" style={{ color: primaryColor }}>
                        <span>Repository</span>
                      </a>
                    )}
                    {proj.live_demo_url && (
                      <a href={proj.live_demo_url} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:underline" style={{ color: primaryColor }}>
                        <ExternalLink size={14} />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {d.visible_sections?.experience && p.experience?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest opacity-50">Work Experience & Internships</h2>
            <div className="space-y-4">
              {p.experience.map((exp, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'} space-y-2`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <h4 className="font-bold text-base">{exp.position}</h4>
                    <span className="text-xs opacity-60">{exp.duration}</span>
                  </div>
                  <p className="text-xs font-semibold opacity-75" style={{ color: primaryColor }}>{exp.company}</p>
                  {exp.responsibilities && <p className="text-xs md:text-sm opacity-80 leading-relaxed pt-1">{exp.responsibilities}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {d.visible_sections?.education && p.education?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest opacity-50">Academic Credentials</h2>
            <div className="space-y-4">
              {p.education.map((ed, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                  <div>
                    <h4 className="font-bold text-base">{ed.degree}</h4>
                    <p className="text-xs opacity-80">{ed.institution} {ed.branch ? `• ${ed.branch}` : ''}</p>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-xs font-semibold block">{ed.start_year} - {ed.graduation_year}</span>
                    {ed.cgpa_or_percentage && <span className="text-xs opacity-60">{ed.cgpa_or_percentage}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-500/10 py-12 text-center text-xs opacity-50 space-y-2">
        <p>Dynamic Student Portfolio verified and rendered with PortfolioAI</p>
        <Link to="/" className="text-indigo-500 hover:underline">
          Create your own AI-powered dynamic portfolio &rarr;
        </Link>
      </footer>

      {/* QR Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 text-slate-900 shadow-2xl">
            <h3 className="font-bold text-lg">Scan to Open Portfolio</h3>
            <img
              src={`${API_BASE_URL}/portfolio/${username}/qrcode`}
              alt="Candidate QR"
              className="w-48 h-48 mx-auto rounded-lg shadow-sm"
            />
            <p className="text-xs font-mono text-indigo-600 truncate">{window.location.href}</p>
            <button
              onClick={() => setShowQr(false)}
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
