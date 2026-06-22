import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import StatCard from '../components/StatCard';
import JobTable from '../components/JobTable';
import AddJobModal from '../components/AddJobModal';
import JobExtractionForm from '../components/JobExtractionForm';
// Removed the old ResumeTailor import since it has its own page now!
import { Briefcase, Send, Users, Award, X, LogOut, Loader2, Plus, Sparkles, Wand2 } from 'lucide-react';

export default function Dashboard() {
    const { logout, userEmail } = useAuth();
    const [metrics, setMetrics] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refreshDashboardData = async () => {
        try {
            const [statsData, jobsPageData] = await Promise.all([
                apiService.getDashboardStats(),
                apiService.getPaginatedJobs(page, 5)
            ]);
            
            setMetrics(statsData);
            setJobs(jobsPageData.content || []);
            setTotalPages(jobsPageData.totalPages || 0);
        } catch (err) {
            setError('Failed to sync live dashboard data metrics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshDashboardData();
    }, [page]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await apiService.updateJobStatus(id, newStatus);
            refreshDashboardData();
        } catch (err) {
            alert('Failed to transition application lifecycle status.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <p className="text-slate-500 font-medium">Syncing data engine pipeline...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans antialiased">
            <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 text-white p-2 rounded-xl font-bold text-xl">JT</div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI JobTracker</h1>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4">
                        
                        <Link 
                            to="/ats" 
                            className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition font-bold text-xs sm:text-sm"
                        >
                            <Sparkles size={16} />
                            <span className="hidden sm:inline">ATS Analyzer</span>
                        </Link>

                        <span className="text-xs sm:text-sm bg-slate-100 text-slate-700 px-3 py-2 rounded-xl font-medium hidden md:inline-block">
                            {userEmail}
                        </span>
                        
                        <button 
                            onClick={logout}
                            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition font-medium"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Log Out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {error && (
                    <div className="p-4 bg-rose-50 text-rose-700 border-l-4 border-rose-500 rounded-r-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Analytics</h2>
                        <p className="text-slate-500 text-xs mt-0.5">Real-time status metrics across your active job search pipelines</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-100 transition self-start sm:self-auto"
                    >
                        <Plus size={16} />
                        Track New Target
                    </button>
                </div>

                {metrics && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        <StatCard title="Saved" count={metrics.SAVED} icon={Briefcase} colorClass="bg-blue-50 text-blue-600" />
                        <StatCard title="Applied" count={metrics.APPLIED} icon={Send} colorClass="bg-amber-50 text-amber-600" />
                        <StatCard title="Interviewing" count={metrics.INTERVIEWING} icon={Users} colorClass="bg-indigo-50 text-indigo-600" />
                        <StatCard title="Offers" count={metrics.OFFER} icon={Award} colorClass="bg-emerald-50 text-emerald-600" />
                        <StatCard title="Rejected" count={metrics.REJECTED} icon={X} colorClass="bg-rose-50 text-rose-600" />
                    </div>
                )}

                {/* AI EXTRACTION TOOLKIT */}
                <div className="my-8 bg-white p-6 rounded-3xl border-2 border-indigo-200 shadow-xl">
                    <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Sparkles className="text-indigo-500" size={24} />
                        <h2 className="text-xl font-black text-slate-800">AI Job Scraper Engine</h2>
                    </div>
                    
                    <JobExtractionForm onSuccess={refreshDashboardData} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Tracked Jobs Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                            Tracked Application Index
                        </h3>
                        <JobTable 
                            jobs={jobs}
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            onStatusChange={handleStatusChange}
                        />
                    </div>

                    {/* NEW: Dedicated ATS Tuner Launch Card */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                            AI Tuning Assistant
                        </h3>
                        
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 flex flex-col items-center text-center relative overflow-hidden">
                            {/* Decorative background circle */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                            
                            <Wand2 size={48} className="mb-5 text-indigo-200 drop-shadow-md" />
                            <h4 className="text-xl font-black mb-3 tracking-tight">ATS Optimization Workspace</h4>
                            <p className="text-indigo-100 text-xs mb-8 leading-relaxed font-medium">
                                We've moved the AI Tuning Assistant to its own full-screen environment. Upload your resume, select a tracked job, and let the AI instantly rewrite your experience.
                            </p>
                            
                            <Link 
                                to="/ats" 
                                className="bg-white text-indigo-700 hover:bg-indigo-50 font-black py-4 px-6 rounded-xl text-xs uppercase tracking-widest transition w-full shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                Launch AI Tuner <Sparkles size={14} />
                            </Link>
                        </div>
                    </div>

                </div>
            </main>

            <AddJobModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onJobAdded={refreshDashboardData}
                apiTrackJob={apiService.trackNewJob}
            />
        </div>
    );
}