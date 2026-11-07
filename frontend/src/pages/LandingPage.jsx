import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, FileText, ArrowRight, ShieldCheck, Share2, 
  CheckCircle2, BrainCircuit, Download, Layers, Users, Star
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/30">
            P
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">PortfolioAI</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#templates" className="hover:text-white transition">Templates</a>
          <a href="#ai-analyzer" className="hover:text-white transition">ATS Analyzer</a>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition px-4 py-2">
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles size={14} className="text-indigo-400" />
            <span>Next-Gen Student Portfolio SaaS</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
            Turn Your PDF Resume Into A <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Dynamic Recruiter-Ready Portfolio
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 mb-10 leading-relaxed font-light">
            Upload your resume, let Google Gemini extract your verified accomplishments, customize stunning responsive themes, and share your personalized live link with top hiring teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-8 py-4 rounded-xl text-base shadow-xl shadow-indigo-600/25 transition transform hover:-translate-y-0.5"
            >
              <span>Build My Portfolio Now</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-semibold text-base transition"
            >
              Sign In to Dashboard
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-slate-400">
            <span className="flex items-center space-x-1.5"><ShieldCheck size={16} className="text-emerald-400" /> <span>No Credit Card Required</span></span>
            <span className="flex items-center space-x-1.5"><BrainCircuit size={16} className="text-indigo-400" /> <span>Powered by Google Gemini</span></span>
            <span className="flex items-center space-x-1.5"><Download size={16} className="text-violet-400" /> <span>PDF & ATS Export Included</span></span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-950/50 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-3">Seamless Workflow</h2>
            <p className="text-3xl md:text-4xl font-extrabold text-white">From Static Document to Live URL in 5 Steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Drop your standard PDF resume. PyMuPDF securely extracts text in milliseconds.' },
              { step: '02', title: 'AI Extraction', desc: 'Gemini structures projects, skills, education, and experience without hallucinations.' },
              { step: '03', title: 'Review & Edit', desc: 'Inspect fields, fill missing details, and fine-tune your credentials on intuitive forms.' },
              { step: '04', title: 'Select Template', desc: 'Choose from Modern, Professional, Minimal, or Creative responsive themes.' },
              { step: '05', title: 'Publish & Share', desc: 'Get your unique URL /portfolio/username and downloadable QR code card.' },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative group hover:border-indigo-500/50 transition">
                <span className="text-3xl font-black text-indigo-500/20 group-hover:text-indigo-500/40 transition block mb-4">
                  {s.step}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-3">Built for Student Success</h2>
          <p className="text-3xl md:text-4xl font-extrabold text-white">Full-Stack Career Acceleration Suite</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Resume & ATS Diagnostic</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Get an estimated ATS compatibility score, identified strengths and weaknesses, grammar improvements, and job-description matching.
            </p>
            <span className="text-xs font-semibold text-indigo-400">Export Printable PDF Reports &rarr;</span>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6">
              <Layers size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">4 Dynamic Portfolio Templates</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Modern, Professional, Minimal, and Creative designs with light/dark palettes, font controls, section visibility toggles, and live previews.
            </p>
            <span className="text-xs font-semibold text-violet-400">Draft / Publish Architecture &rarr;</span>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
              <Share2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Shareable Links & QR Cards</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Clean recruiter-friendly links (/portfolio/name), instant QR code generator for business cards, and printable PDF portfolio export.
            </p>
            <span className="text-xs font-semibold text-emerald-400">View Tracking Analytics &rarr;</span>
          </div>
        </div>
      </section>

      {/* Call to action footer */}
      <section className="py-20 border-t border-slate-800 text-center px-6">
        <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Launch Your Career Portfolio?</h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm">
          Join students using PortfolioAI to showcase their projects, prepare for interviews, and land tech interviews faster.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg transition"
        >
          <span>Create My Free Account</span>
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} PortfolioAI SaaS Platform. Built with Python, FastAPI, MongoDB Atlas, and React.</p>
      </footer>
    </div>
  );
}
