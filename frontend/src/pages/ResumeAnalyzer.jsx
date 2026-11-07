import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart3, Sparkles, AlertCircle, CheckCircle2, 
  ArrowUpRight, Download, RefreshCw, Briefcase, FileText 
} from 'lucide-react';

export default function ResumeAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [customText, setCustomText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/resume-analyzer/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/ai/resume-analyzer', {
        resume_text: customText.trim() || null,
        target_job_description: jobDescription.trim() || null
      });
      setResult(res.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete resume analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles size={14} />
          <span>AI Diagnostic Engine</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          AI Resume & ATS Diagnostic
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Evaluate resume formatting, keyword density, bullet clarity, and match against custom target job descriptions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Target JD & Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Briefcase size={18} className="text-indigo-600" />
          <span>Target Job Role or Description (Optional)</span>
        </h3>
        <p className="text-xs text-slate-500">
          Paste a target job posting below to receive role compatibility percentage and identify missing required skills.
        </p>

        <textarea
          rows={3}
          placeholder="Paste Job Description here (e.g. 'Seeking Full Stack Engineer with React, Python, Docker, CI/CD, and Redis experience...')"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
        ></textarea>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Uses your currently uploaded resume automatically.
          </span>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{loading ? 'Analyzing with AI...' : 'Run Resume Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Output Section */}
      {result && (
        <div className="space-y-6">
          {/* Score Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-tr from-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-md space-y-2">
              <span className="text-xs uppercase font-bold text-indigo-300">Overall Quality Rating</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-black">{result.overall_score || 85}</span>
                <span className="text-xl text-indigo-300 font-semibold">/ 100</span>
              </div>
              <p className="text-xs text-indigo-200">
                Comprehensive score evaluating depth of experience, syntax structure, and clarity.
              </p>
            </div>

            <div className="bg-gradient-to-tr from-emerald-900 to-emerald-800 text-white p-6 rounded-2xl shadow-md space-y-2">
              <span className="text-xs uppercase font-bold text-emerald-300">Estimated ATS Score</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-black">{result.ats_score || 82}</span>
                <span className="text-xl text-emerald-300 font-semibold">/ 100</span>
              </div>
              <p className="text-xs text-emerald-200">
                Estimated parsing compatibility based on applicant tracking parser heuristics.
              </p>
            </div>
          </div>

          {/* Legal ATS Disclaimer Notice */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 italic">
            Notice: {result.ats_disclaimer || "ATS scores are AI-generated estimates and not guaranteed results from actual employer systems."}
          </div>

          {/* Detailed Feedback Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 text-emerald-700">
                <CheckCircle2 size={16} />
                <span>Resume Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {result.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 text-amber-700">
                <AlertCircle size={16} />
                <span>Areas Needing Polish</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {result.weaknesses?.map((w, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Keywords & Actionable Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Recommended Keywords for Target Roles</h3>
            <div className="flex flex-wrap gap-2">
              {result.missing_keywords?.map((kw, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                  + {kw}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs mb-2">Step-by-Step Action Plan</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {result.recommendations?.map((r, i) => (
                  <li key={i}>&rarr; {r}</li>
                ))}
              </ul>
            </div>

            {/* Export Report Action */}
            {result.report_id && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <a
                  href={`/api/ai/resume-analyzer/${result.report_id}/pdf`}
                  download
                  className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  <Download size={14} />
                  <span>Download Analysis Report PDF</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Past Analysis Reports</h3>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-800 mr-2">Score: {h.overall_score || 80}/100</span>
                  <span className="text-slate-500">ATS: {h.ats_score || 75}/100 • {new Date(h.created_at).toLocaleDateString()}</span>
                </div>
                <a
                  href={`/api/ai/resume-analyzer/${h._id}/pdf`}
                  download
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Export PDF &rarr;
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
