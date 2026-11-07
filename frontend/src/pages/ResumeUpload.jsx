import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles, 
  ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file (.pdf).');
        setFile(null);
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10MB limit.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume file to upload.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/resume/upload-and-extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Save extracted data temporarily for the review step
      sessionStorage.setItem('portfolio_ai_extracted', JSON.stringify(res.data.extracted_data));
      navigate('/extraction-review');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to extract resume details. Please ensure the PDF is readable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles size={14} />
          <span>Step 1 of 5: Document Ingestion</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Upload Your Resume
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Our backend engine extracts text using PyMuPDF and parses structured achievements using Google Gemini.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <label className={`
            border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition
            ${file ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/20'}
          `}>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />

            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition shadow-sm ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {file ? <FileText size={32} /> : <Upload size={32} />}
            </div>

            {file ? (
              <div className="text-center">
                <p className="font-bold text-slate-800 text-base">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI Extraction
                </p>
                <span className="inline-block mt-3 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
                  Click to choose a different PDF
                </span>
              </div>
            ) : (
              <div className="text-center">
                <p className="font-bold text-slate-800 text-base">Drag & drop your resume PDF here</p>
                <p className="text-xs text-slate-500 mt-1">Supports standard text-based PDF resumes up to 10MB</p>
                <span className="inline-block mt-4 text-xs font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-200">
                  Browse Files
                </span>
              </div>
            )}
          </label>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Encrypted transmission & secure processing</span>
            </span>
            <span>No details invented</span>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-600/25 transition text-base"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Extracting Resume with AI...</span>
              </>
            ) : (
              <>
                <span>Extract Information & Review</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Workflow Explanatory Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
        <div className="bg-slate-100/80 p-4 rounded-xl border border-slate-200">
          <span className="font-bold text-slate-900 block mb-1">PyMuPDF Text Engine</span>
          Extracts raw structural streams directly without converting to noisy OCR.
        </div>
        <div className="bg-slate-100/80 p-4 rounded-xl border border-slate-200">
          <span className="font-bold text-slate-900 block mb-1">Gemini AI Schema</span>
          Validates projects, technical skills, education, and dates against strict JSON schemas.
        </div>
        <div className="bg-slate-100/80 p-4 rounded-xl border border-slate-200">
          <span className="font-bold text-slate-900 block mb-1">Verification Step</span>
          You retain 100% control to review, edit, or append details before generating.
        </div>
      </div>
    </div>
  );
}
