import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, Loader2, Sparkles, Download, Briefcase, ChevronLeft, Wand2, Check } from 'lucide-react';
import { apiService } from '../services/api';

export default function AITuningAssistant() {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [file, setFile] = useState(null);
    const [isAligning, setIsAligning] = useState(false);
    const [results, setResults] = useState(null);
    const [viewMode, setViewMode] = useState('resume');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await apiService.getPaginatedJobs(0, 50);
                setJobs(data.content || []);
            } catch (err) { console.error("Error loading jobs:", err); }
        };
        fetchJobs();
    }, []);

    const handleFileChange = (e) => { if (e.target.files && e.target.files[0]) setFile(e.target.files[0]); };

    const handleAlignWithAI = async () => {
        if (!file || !selectedJobId) return alert("Select job and resume.");
        setIsAligning(true);
        setResults(null);
        try {
            await apiService.uploadAndParseResume(file);
            const tailoredMarkdown = await apiService.tailorResume(selectedJobId);
            const selectedJob = jobs.find(j => j.id === parseInt(selectedJobId));
            const feedbackText = selectedJob?.aiFeedback || "No feedback available.";

            const missingSkillsArray = feedbackText.split('\n').filter(line => line.trim().startsWith('*')).map(line => {
                const match = line.match(/\*\*(.*?)\*\*/);
                return match ? match[1].trim() : null;
            }).filter(s => s && s.length > 2 && s.length < 30 && !s.toLowerCase().includes('tips')).slice(0, 6);

            setResults({
                matchPercentage: Math.max(50, 95 - (missingSkillsArray.length * 5)),
                missingSkills: missingSkillsArray.length > 0 ? missingSkillsArray : ['ATS Optimized'],
                updatedResumeText: tailoredMarkdown,
                feedback: feedbackText
            });
        } catch (err) { alert("Alignment failed."); } finally { setIsAligning(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans antialiased">
            <div className="max-w-[1400px] mx-auto space-y-6">
                <Link to="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><ChevronLeft size={16} /> Back to Dashboard</Link>
                
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3"><Sparkles className="text-indigo-600" size={32} /> AI Resume Tuning Assistant</h1>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* LEFT CONTROLS */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4"><Briefcase size={16} className="inline mr-2 text-indigo-500" /> 1. Select Job</h2>
                            <select className="w-full p-3.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-medium" onChange={(e) => setSelectedJobId(e.target.value)}>
                                <option value="">-- Choose job --</option>
                                {jobs.map(j => <option key={j.id} value={j.id}>{j.companyName} - {j.jobTitle}</option>)}
                            </select>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4"><UploadCloud size={16} className="inline mr-2 text-indigo-500" /> 2. Upload</h2>
                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                                {file ? <><Check size={32} className="text-emerald-500 mb-2" /><span className="text-sm font-bold text-emerald-600">File Ready: {file.name}</span></> : <><FileText className="w-8 h-8 text-slate-400 mb-2" /><span className="text-sm font-bold text-slate-600">Upload PDF/DOCX</span></>}
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <button 
                            onClick={handleAlignWithAI} 
                            disabled={isAligning} 
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-wider text-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAligning ? "Processing..." : "Align with AI"}
                        </button>
                    </div>

                    {/* RIGHT RESULTS */}
                    <div className="xl:col-span-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[500px]">
                        {isAligning ? (
                            <div className="h-full flex flex-col items-center justify-center text-indigo-600">
                                <Loader2 size={48} className="animate-spin mb-4" />
                                <p className="font-bold text-lg">AI is tailoring your resume...</p>
                            </div>
                        ) : results ? (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                                    <button onClick={() => setViewMode('resume')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${viewMode === 'resume' ? 'bg-white shadow' : ''}`}>Resume</button>
                                    <button onClick={() => setViewMode('feedback')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${viewMode === 'feedback' ? 'bg-white shadow' : ''}`}>AI Feedback</button>
                                </div>
                                <textarea readOnly className="w-full h-96 p-6 bg-slate-50 rounded-2xl font-mono text-sm border" value={viewMode === 'resume' ? results.updatedResumeText : results.feedback} />
                                <div className="flex gap-4">
                                    <button className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs">Download PDF</button>
                                    <button onClick={() => {const b = new Blob([results.updatedResumeText]); const a = document.createElement('a'); a.href=URL.createObjectURL(b); a.download='Resume.txt'; a.click();}} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs">Download Word (.docx)</button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">Select job/resume to begin...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}