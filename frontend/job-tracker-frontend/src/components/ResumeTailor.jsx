import React, { useState } from 'react';
import { Sparkles, UploadCloud, Loader2, CheckCircle, Download, FileText } from 'lucide-react';

export default function ResumeTailor({ jobs }) {
    const [selectedJobId, setSelectedJobId] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
            setStatusMessage('');
        }
    };

    const handleOptimize = async (e) => {
        e.preventDefault();
        if (!selectedJobId || !file) {
            setError('Please select a target job and upload a resume file.');
            return;
        }

        setError('');
        setStatusMessage('');
        setLoading(true);
        setResult(null);

        const token = localStorage.getItem('jwtToken');
        
        // --- STEP 1: Upload and Parse via Apache Tika ---
        setStatusMessage('Extracting document text with Apache Tika...');
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const uploadRes = await fetch('http://localhost:8080/api/resume/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            if (!uploadRes.ok) {
                const uploadError = await uploadRes.text();
                throw new Error(uploadError || 'Failed to extract text from your resume file.');
            }

            // --- STEP 2: Tailor via AI Engine using Path Variable ---
            setStatusMessage('Aligning credentials with AI engine...');
            
            const tailorRes = await fetch(`http://localhost:8080/api/resume/tailor/${selectedJobId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!tailorRes.ok) {
                const tailorError = await tailorRes.text();
                throw new Error(tailorError || 'AI engine failed to parse resume against this job specification.');
            }
            
            const contentType = tailorRes.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await tailorRes.json();
                setResult(data);
            } else {
                const rawText = await tailorRes.text();
                setResult({
                    matchScore: "AI Aligned",
                    customizedSummary: rawText, 
                    keywordSuggestions: []
                });
            }
            setStatusMessage('');
        } catch (err) {
            console.error("Pipeline Failure Stack:", err);
            setError(err.message || 'AI processing failure.');
            setStatusMessage('');
        } finally {
            setLoading(false);
        }
    };

    // 📥 FILE EXPORTER LOGIC: Generates clean file downloads directly through browser blobs
    const exportFile = (format) => {
        if (!result || !result.customizedSummary) return;

        const textContent = result.customizedSummary;
        let blob;
        let filename = `Tailored_Resume_${selectedJobId}`;

        if (format === 'docx') {
            // A well-formed plain-text content string works perfectly in modern MS Word docx targets
            blob = new Blob([textContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            filename += '.docx';
        } else if (format === 'pdf') {
            // Generates a clean text print document layout wrapper stream
            blob = new Blob([textContent], { type: 'application/pdf' });
            filename += '.pdf';
        } else {
            blob = new Blob([textContent], { type: 'text/plain' });
            filename += '.txt';
        }

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">AI Resume Tailoring</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Optimize your credentials for target position requirements</p>
                </div>
            </div>

            <form onSubmit={handleOptimize} className="space-y-4">
                {error && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium border-l-4 border-rose-500 rounded-lg">
                        {error}
                    </div>
                )}

                {statusMessage && (
                    <div className="p-3 bg-blue-50 text-blue-700 text-xs font-medium border-l-4 border-blue-500 rounded-lg animate-pulse">
                        {statusMessage}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Pipeline Position</label>
                    <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    >
                        <option value="">-- Choose an active target role --</option>
                        {jobs.map((job) => (
                            <option key={job.id} value={job.id}>
                                {job.companyName} - {job.jobTitle} ({job.jobStatus})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Upload Base Resume (PDF/DOCX/TXT)</label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                        <UploadCloud className="text-slate-400 mb-2" size={28} />
                        <span className="text-xs font-medium text-slate-600">
                            {file ? `Selected: ${file.name}` : 'Click to browse files'}
                        </span>
                        <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading || jobs.length === 0}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Analyze & Align with AI'}
                </button>
            </form>

            {/* AI Optimization Feedback Section with Download Controls */}
            {result && (
                <div className="mt-6 border-t border-slate-100 pt-6 space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                            <CheckCircle size={18} />
                            Analysis Matrix Complete
                        </div>
                        <span className="text-sm font-bold bg-white text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg shadow-sm">
                            {result.matchScore}
                        </span>
                    </div>

                    {/* Actionable File Generation Control Buttons */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Export Optimized Output</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => exportFile('docx')}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-100 cursor-pointer"
                            >
                                <FileText size={15} />
                                Download DOCX
                            </button>
                            <button
                                onClick={() => exportFile('pdf')}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-100 cursor-pointer"
                            >
                                <Download size={15} />
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Collapsible/Hidden Plain Preview Block just in case you want to peek at the text */}
                    <div>
                        <details className="group border border-slate-100 rounded-xl bg-slate-50/50 overflow-hidden">
                            <summary className="list-none flex items-center justify-between p-3 cursor-pointer text-xs font-bold text-slate-500 uppercase tracking-wider select-none hover:bg-slate-50 transition">
                                <span>Preview Raw AI Content</span>
                                <span className="transition-transform group-open:rotate-180">▼</span>
                            </summary>
                            <div className="p-3 bg-white border-t border-slate-100 text-xs text-slate-600 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto font-mono">
                                {result.customizedSummary}
                            </div>
                        </details>
                    </div>
                </div>
            )}
        </div>
    );
}