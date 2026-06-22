import React, { useState } from 'react';
import { Link2, Loader2, Sparkles, Building2, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';

export default function JobExtractionForm({ onSuccess }) {
    const [jobUrl, setJobUrl] = useState('');
    const [loading, setLoading] = useState(false);
    
    // 💡 NEW: Separate loading state specifically for the database submission
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        companyName: '',
        jobTitle: '', 
        jobDescription: ''
    });

    const handleAutoFill = async (e) => {
        e.preventDefault();
        if (!jobUrl.trim()) return;

        setLoading(true);
        setSuccessMessage('');
        
        try {
            const data = await apiService.scrapeJobUrl(jobUrl);
            setFormData({
                companyName: data.companyName || '',
                jobTitle:  data.jobTitle || '',
                jobDescription: data.jobDescription || ''
            });
            setSuccessMessage('AI successfully extracted job data details!');
        } catch (err) {
            console.error("Extraction failed:", err);
            alert("Could not process the link automatically. Feel free to type the details manually.");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        // 💡 1. Start the saving spinner
        setIsSubmitting(true); 
        
        try {
            await apiService.trackNewJob(formData);
            
            setFormData({ companyName: '', jobTitle: '', jobDescription: '' });
            setJobUrl('');
            setSuccessMessage('Job saved to your dashboard successfully!'); // Visual feedback instead of an alert
            
            if (onSuccess) {
                onSuccess();
            }
            
            // Clear the success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
            
        } catch (err) {
            console.error("Submission failed:", err);
            alert('Failed to save the job profile entry to the database.');
        } finally {
            // 💡 2. Stop the saving spinner
            setIsSubmitting(false); 
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-0 font-sans">
            <div className="mb-4">
                <p className="text-sm text-slate-500">Paste a job posting link below to auto-populate form metrics instantly via AI.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3 shadow-inner mb-6">
                <label className="text-[11px] font-bold text-slate-500 tracking-wide uppercase flex items-center gap-1.5">
                    <Sparkles size={13} className="text-indigo-500 animate-pulse" /> Autofill with AI Link Scanner
                </label>
                <div className="flex gap-2">
                    <div className="relative grow">
                        <Link2 className="absolute left-3.5 top-3 text-slate-400" size={16} />
                        <input 
                            type="url" 
                            placeholder="Paste LinkedIn, Indeed, or corporate link here..." 
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition"
                            value={jobUrl}
                            onChange={(e) => setJobUrl(e.target.value)}
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={handleAutoFill}
                        disabled={loading || isSubmitting}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 active:scale-95 shadow-md shrink-0"
                    >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : 'Scan URL'}
                    </button>
                </div>

                {successMessage && !isSubmitting && (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-semibold font-mono bg-emerald-50 border border-emerald-100 p-2 rounded-lg animate-in fade-in-50 duration-300">
                        <CheckCircle2 size={12} /> {successMessage}
                    </div>
                )}
            </div>

            <hr className="border-slate-100 mb-6" />

            <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                        <Building2 size={12} /> Company Name
                    </label>
                    <input 
                        type="text" 
                        required
                        placeholder="e.g. Toronto-Dominion Bank" 
                        className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none shadow-sm font-medium text-slate-700 disabled:opacity-50"
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                        <Briefcase size={12} /> Target Position
                    </label>
                    <input 
                        type="text" 
                        required
                        placeholder="e.g. Junior Backend Java Developer" 
                        className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none shadow-sm font-medium text-slate-700 disabled:opacity-50"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                        <FileText size={12} /> Core Job Description Requirements
                    </label>
                    <textarea 
                        required
                        placeholder="Paste requirements, stack criteria details, or allow the AI engine to write parsed summary nodes..." 
                        rows={6}
                        className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none shadow-sm font-normal text-slate-600 resize-none scrollbar-thin bg-white disabled:opacity-50"
                        value={formData.jobDescription}
                        onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
                        disabled={isSubmitting}
                    />
                </div>

                {/* 💡 3. Updated Action Button with loading state UI */}
                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition disabled:opacity-70 active:scale-[0.99] shadow-lg shadow-indigo-100 tracking-wide uppercase flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={16} /> 
                            Saving to Database...
                        </>
                    ) : (
                        'Save & Track Position Entry'
                    )}
                </button>
            </form>
        </div>
    );
}