import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Sparkles, CheckCircle2, Plus, Trash2, ArrowRight, 
  Save, AlertTriangle, User, GraduationCap, Briefcase, 
  Code2, Award, FolderGit2, Link2, RefreshCw
} from 'lucide-react';

export default function ExtractionReview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    professional_title: '',
    about_me: '',
    social_links: { linkedin: '', github: '', website: '' },
    skills: { programming_languages: [], frameworks: [], databases: [], tools: [], soft_skills: [] },
    education: [],
    projects: [],
    certifications: [],
    experience: [],
    achievements: []
  });

  const [newSkillInput, setNewSkillInput] = useState({ category: 'programming_languages', val: '' });

  useEffect(() => {
    loadExtractedOrDraft();
  }, []);

  const loadExtractedOrDraft = async () => {
    try {
      setLoading(true);
      // Check session storage first (fresh from upload)
      const sessionData = sessionStorage.getItem('portfolio_ai_extracted');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        populateFromExtracted(parsed);
        setMissingFields(parsed.missing_fields || []);
      } else {
        // Fetch current draft from backend
        const res = await api.get('/portfolio/draft');
        if (res.data.profile_data) {
          setProfile({
            ...profile,
            ...res.data.profile_data
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const populateFromExtracted = (ext) => {
    setProfile({
      name: ext.personal_info?.name || '',
      email: ext.personal_info?.email || '',
      phone: ext.personal_info?.phone || '',
      location: ext.personal_info?.location || '',
      professional_title: ext.personal_info?.professional_title || 'Software Engineering Student',
      about_me: ext.professional_summary || '',
      social_links: {
        linkedin: ext.social_links?.linkedin || '',
        github: ext.social_links?.github || '',
        website: ext.social_links?.website || ''
      },
      skills: {
        programming_languages: ext.technical_skills?.programming_languages || [],
        frameworks: ext.technical_skills?.frameworks || [],
        databases: ext.technical_skills?.databases || [],
        tools: ext.technical_skills?.tools || [],
        soft_skills: ext.technical_skills?.soft_skills || []
      },
      education: ext.education || [],
      projects: ext.projects || [],
      certifications: ext.certifications || [],
      experience: ext.experience || [],
      achievements: ext.achievements || []
    });
  };

  const handleSaveAndProceed = async () => {
    try {
      setSaving(true);
      // Fetch default or existing design
      const currentDraft = await api.get('/portfolio/draft');
      const design = currentDraft.data.design || {
        template: 'modern',
        theme_mode: 'light',
        primary_color: '#4f46e5',
        secondary_color: '#7c3aed',
        font_family: 'Inter',
        visible_sections: {
          hero: true, about: true, skills: true, projects: true,
          experience: true, education: true, certifications: true,
          achievements: true, contact: true
        }
      };

      await api.post('/portfolio/save-draft', {
        design,
        profile_data: profile
      });

      // Clear session after saving
      sessionStorage.removeItem('portfolio_ai_extracted');
      navigate('/portfolio-builder');
    } catch (err) {
      alert('Failed to save profile details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Helper mutations
  const addSkill = () => {
    if (!newSkillInput.val.trim()) return;
    const cat = newSkillInput.category;
    setProfile({
      ...profile,
      skills: {
        ...profile.skills,
        [cat]: [...(profile.skills[cat] || []), newSkillInput.val.trim()]
      }
    });
    setNewSkillInput({ ...newSkillInput, val: '' });
  };

  const removeSkill = (category, index) => {
    setProfile({
      ...profile,
      skills: {
        ...profile.skills,
        [category]: profile.skills[category].filter((_, i) => i !== index)
      }
    });
  };

  const addProject = () => {
    setProfile({
      ...profile,
      projects: [
        ...profile.projects,
        { title: 'New Project', description: 'Brief description of features & impact', technologies: ['React'], github_url: '', live_demo_url: '' }
      ]
    });
  };

  const removeProject = (index) => {
    setProfile({
      ...profile,
      projects: profile.projects.filter((_, i) => i !== index)
    });
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      education: [
        ...profile.education,
        { institution: 'University Name', degree: 'Bachelor of Technology', branch: 'Computer Science', start_year: '2021', graduation_year: '2025', cgpa_or_percentage: '8.5 CGPA' }
      ]
    });
  };

  const removeEducation = (index) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold mb-2">
            <Sparkles size={14} />
            <span>Step 2 of 5: Review & Confirm</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Review Extracted Information
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Validate extracted entities or add missing fields before generating your portfolio.
          </p>
        </div>

        <button
          onClick={handleSaveAndProceed}
          disabled={saving}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 text-sm"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Confirm & Generate Portfolio</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Missing Information Notice */}
      {missingFields.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-3">
          <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-bold">Missing Details Detected in Resume:</span>
            <span className="ml-1">We could not locate: {missingFields.join(', ')}. Please add them below for optimal presentation.</span>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <User size={18} className="text-indigo-600" />
          <span>Personal Information</span>
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
              placeholder="Full Stack Engineer / AI Specialist"
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+1 (555) 019-2834"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="San Francisco, CA or Bengaluru, India"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Professional Summary / About Me</label>
          <textarea
            rows={3}
            value={profile.about_me}
            onChange={(e) => setProfile({ ...profile, about_me: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none leading-relaxed"
          ></textarea>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Link2 size={18} className="text-indigo-600" />
          <span>Social & Profiles</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">LinkedIn URL</label>
            <input
              type="text"
              value={profile.social_links?.linkedin || ''}
              onChange={(e) => setProfile({ ...profile, social_links: { ...profile.social_links, linkedin: e.target.value } })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">GitHub URL</label>
            <input
              type="text"
              value={profile.social_links?.github || ''}
              onChange={(e) => setProfile({ ...profile, social_links: { ...profile.social_links, github: e.target.value } })}
              placeholder="https://github.com/username"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Personal Portfolio / Website</label>
            <input
              type="text"
              value={profile.social_links?.website || ''}
              onChange={(e) => setProfile({ ...profile, social_links: { ...profile.social_links, website: e.target.value } })}
              placeholder="https://mysite.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Skills Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Code2 size={18} className="text-indigo-600" />
          <span>Technical Skills</span>
        </h3>

        <div className="flex gap-2">
          <select
            value={newSkillInput.category}
            onChange={(e) => setNewSkillInput({ ...newSkillInput, category: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-indigo-500 focus:outline-none"
          >
            <option value="programming_languages">Programming Language</option>
            <option value="frameworks">Framework / Library</option>
            <option value="databases">Database</option>
            <option value="tools">Tool / Cloud</option>
            <option value="soft_skills">Soft Skill</option>
          </select>
          <input
            type="text"
            placeholder="e.g. Python, Docker, PyTorch"
            value={newSkillInput.val}
            onChange={(e) => setNewSkillInput({ ...newSkillInput, val: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            Add Skill
          </button>
        </div>

        {/* Display Skills by categories */}
        <div className="space-y-3 pt-2">
          {Object.entries(profile.skills || {}).map(([cat, list]) => (
            <div key={cat} className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-32 shrink-0">
                {cat.replace('_', ' ')}:
              </span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {list?.length > 0 ? (
                  list.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(cat, idx)}
                        className="text-indigo-400 hover:text-rose-600 ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None listed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <FolderGit2 size={18} className="text-indigo-600" />
            <span>Projects</span>
          </h3>
          <button
            type="button"
            onClick={addProject}
            className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
          >
            <Plus size={14} />
            <span>Add Project</span>
          </button>
        </div>

        <div className="space-y-4">
          {profile.projects?.map((p, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
              <button
                type="button"
                onClick={() => removeProject(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => {
                      const updated = [...profile.projects];
                      updated[idx].title = e.target.value;
                      setProfile({ ...profile, projects: updated });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Technologies (comma separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}
                    onChange={(e) => {
                      const updated = [...profile.projects];
                      updated[idx].technologies = e.target.value.split(',').map(s => s.trim());
                      setProfile({ ...profile, projects: updated });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={p.description}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[idx].description = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="GitHub Repository URL"
                  value={p.github_url || ''}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[idx].github_url = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Live Demo URL"
                  value={p.live_demo_url || ''}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[idx].live_demo_url = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <GraduationCap size={18} className="text-indigo-600" />
            <span>Education</span>
          </h3>
          <button
            type="button"
            onClick={addEducation}
            className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
          >
            <Plus size={14} />
            <span>Add Education</span>
          </button>
        </div>

        <div className="space-y-4">
          {profile.education?.map((ed, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeEducation(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Institution</label>
                  <input
                    type="text"
                    value={ed.institution}
                    onChange={(e) => {
                      const updated = [...profile.education];
                      updated[idx].institution = e.target.value;
                      setProfile({ ...profile, education: updated });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Degree & Branch</label>
                  <input
                    type="text"
                    value={`${ed.degree} ${ed.branch ? '- ' + ed.branch : ''}`}
                    onChange={(e) => {
                      const updated = [...profile.education];
                      updated[idx].degree = e.target.value;
                      setProfile({ ...profile, education: updated });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Start Year"
                  value={ed.start_year || ''}
                  onChange={(e) => {
                    const updated = [...profile.education];
                    updated[idx].start_year = e.target.value;
                    setProfile({ ...profile, education: updated });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Graduation Year"
                  value={ed.graduation_year || ''}
                  onChange={(e) => {
                    const updated = [...profile.education];
                    updated[idx].graduation_year = e.target.value;
                    setProfile({ ...profile, education: updated });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="CGPA / Score"
                  value={ed.cgpa_or_percentage || ''}
                  onChange={(e) => {
                    const updated = [...profile.education];
                    updated[idx].cgpa_or_percentage = e.target.value;
                    setProfile({ ...profile, education: updated });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate('/upload-resume')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          &larr; Back to Upload
        </button>

        <button
          onClick={handleSaveAndProceed}
          disabled={saving}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition text-sm"
        >
          <span>Generate My Portfolio</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
