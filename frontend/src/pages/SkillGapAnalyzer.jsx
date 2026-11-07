import React, { useState } from 'react';
import api from '../services/api';
import { Compass, Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock, RefreshCw } from 'lucide-react';

export default function SkillGapAnalyzer() {
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level / Fresher');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const roles = [
    'Full Stack Engineer',
    'Frontend Developer',
    'Backend Engineer (Python / Node.js)',
    'AI / Machine Learning Engineer',
    'DevOps & Cloud Engineer',
    'Data Engineer',
  ];

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/ai/skill-gap', {
        target_role: targetRole,
        experience_level: experienceLevel
      });
      setResult(res.data);
    } catch (err) {
      alert('Failed to generate skill gap roadmap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold mb-2">
          <Sparkles size={14} />
          <span>Curriculum & Career Roadmap</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          AI Skill Gap Analyzer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select your target engineering role to discover missing tools and generate a 3-tier study curriculum.
        </p>
      </div>

      {/* Target Role Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Target Job Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="Entry Level / Fresher">Entry Level / Graduate (0-1 yrs)</option>
                <option value="Junior Engineer">Junior Engineer (1-2 yrs)</option>
                <option value="Mid-level Software Engineer">Mid-level (2-4 yrs)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Compass size={14} />}
              <span>{loading ? 'Evaluating Curriculum...' : 'Analyze Skill Gaps'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{result.target_role}</h3>
                <p className="text-xs text-slate-500">{result.experience_level}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500">Readiness Score</span>
                <p className="text-2xl font-black text-indigo-600">{result.match_percentage || 75}%</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Priority Missing Skills</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {result.skill_priorities?.map((sp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-800">{sp.skill}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span className={`font-semibold ${sp.priority === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>{sp.priority} Priority</span>
                      <span>{sp.time_estimate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Tier Learning Roadmap */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Personalized Step-by-Step Learning Roadmap</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['beginner', 'intermediate', 'advanced'].map((tier) => (
                <div key={tier} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <BookOpen size={16} />
                    <h4 className="font-bold text-xs uppercase tracking-wider capitalize text-slate-800">
                      {tier} Phase
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {result.roadmap?.[tier]?.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <p className="font-bold text-slate-900">{item.topic}</p>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>
                        <p className="text-[10px] text-indigo-600 font-semibold pt-1">Resources: {item.resources}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
