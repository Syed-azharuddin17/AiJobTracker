import React from 'react';
import { Briefcase, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_BADGES = {
    SAVED: 'bg-blue-50 text-blue-700 border-blue-200',
    APPLIED: 'bg-amber-50 text-amber-700 border-amber-200',
    INTERVIEWING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    OFFER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function JobTable({ jobs, currentPage, totalPages, onPageChange, onStatusChange }) {
    // If your backend database is completely empty, show this placeholder layout
    if (!jobs || jobs.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <Briefcase className="mx-auto text-slate-300 mb-3" size={40} />
                <h3 className="text-slate-700 font-semibold text-lg">No job applications tracked yet</h3>
                <p className="text-slate-400 text-sm mt-1">Click "Track New Target" to begin mapping your pipeline.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <th className="py-4 px-6">Company & Title</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6">Date Added</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-slate-50/70 transition">
                                <td className="py-4 px-6">
                                    <div className="font-semibold text-slate-900">{job.companyName}</div>
                                    <div className="text-slate-500 text-xs mt-0.5">{job.jobTitle}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_BADGES[job.jobStatus] || 'bg-slate-50'}`}>
                                        {job.jobStatus}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-slate-500">
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Calendar size={14} />
                                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent'}
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <select
                                        value={job.jobStatus}
                                        onChange={(e) => onStatusChange(job.id, e.target.value)}
                                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                    >
                                        <option value="SAVED">Saved</option>
                                        <option value="APPLIED">Applied</option>
                                        <option value="INTERVIEWING">Interviewing</option>
                                        <option value="OFFER">Offer</option>
                                        <option value="REJECTED">Rejected</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls footer block */}
            {totalPages > 1 && (
                <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 0}
                            onClick={() => onPageChange(currentPage - 1)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={currentPage === totalPages - 1}
                            onClick={() => onPageChange(currentPage + 1)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}