import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function AddJobModal({ isOpen, onClose, onJobAdded, apiTrackJob }) {
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobStatus, setJobStatus] = useState('SAVED');
    const [description, setDescription] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await apiTrackJob({ 
                companyName, 
                jobTitle, 
                jobStatus, 
                description,
                jobDescription: description 
            });
            
            setCompanyName('');
            setJobTitle('');
            setJobStatus('SAVED');
            setDescription('');
            onJobAdded();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to submit target job data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-slate-900 text-lg">Track New Application</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition">
                        <X size={18} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto grow">
                    {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium border-l-4 border-rose-500 rounded">{error}</div>}
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Company Name</label>
                        <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="e.g. Google" />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Job Title</label>
                        <input type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="e.g. Frontend Developer" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pipeline Stage</label>
                        <select value={jobStatus} onChange={(e) => setJobStatus(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700">
                            <option value="SAVED">Saved</option>
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEWING">Interviewing</option>
                            <option value="OFFER">Offer</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Job Description (JD)</label>
                        <textarea 
                            rows={4}
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none" 
                            placeholder="Paste the requirements, qualifications, and role description here for AI matching..."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6 shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 rounded-xl">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save Target'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}