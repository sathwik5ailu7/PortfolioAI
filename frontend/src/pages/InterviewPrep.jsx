import React, { useState } from 'react';
import api from '../services/api';
import { MessageSquareCode, Sparkles, ChevronDown, ChevronUp, BookOpen, RefreshCw } from 'lucide-react';

export default function InterviewPrep() {
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/ai/interview-prep', {
        target_role: targetRole,
        experience_level: experienceLevel,
        difficulty: difficulty
      });
      setQuestions(res.data.questions || []);
      setExpandedIndex(0);
    } catch (err) {
      alert('Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles size={14} />
          <span>AI Interview Simulator</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          AI Interview Preparation
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tailored Technical, Behavioral, Coding, and Scenario-based interview simulations with guided answers.
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Target Job Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Backend Developer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="Fresher">College Fresher / Intern</option>
                <option value="Junior">Junior Developer (1-2 yrs)</option>
                <option value="Associate">Associate Software Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="Standard">Standard / Fundamental</option>
                <option value="Intermediate">Intermediate (Real-world)</option>
                <option value="Challenging">Challenging / FAANG-style</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <MessageSquareCode size={14} />}
              <span>{loading ? 'Synthesizing Interview...' : 'Generate Practice Session'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Questions List */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Generated Interview Questions & Recruiter Answers ({questions.length})
          </h3>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50 transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {q.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {q.question}
                    </h4>
                  </div>
                  <div className="p-1 rounded-lg bg-slate-100 text-slate-500">
                    {expandedIndex === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {expandedIndex === idx && (
                  <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800 mb-1">Recommended Response Strategy:</p>
                      <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                        {q.suggested_answer}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 mb-1">Interviewer Evaluation Criteria:</p>
                      <p className="text-slate-500 italic">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
