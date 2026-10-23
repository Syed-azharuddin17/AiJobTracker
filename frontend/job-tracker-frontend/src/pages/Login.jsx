import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Rocket, Info } from 'lucide-react';
import { apiService } from '../services/api';

const DEMO_CREDENTIALS = {
  email: 'recruiter@demo.com',
  password: 'DemoPassword123!',
};

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);

    // 💡 NEW: State to track if the server is taking a long time to wake up
    const [showColdStartWarning, setShowColdStartWarning] = useState(false);

    // 💡 NEW: Smart timer that triggers after 4 seconds of loading
    useEffect(() => {
        let timeout;
        if (loading || isDemoLoading) {
            timeout = setTimeout(() => {
                setShowColdStartWarning(true);
            }, 4000); // 4 seconds
        } else {
            setShowColdStartWarning(false);
        }
        return () => clearTimeout(timeout);
    }, [loading, isDemoLoading]);

    const executeLogin = async (loginEmail, loginPassword, isDemo = false) => {
        setError('');
        if (isDemo) {
            setIsDemoLoading(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await apiService.login(loginEmail, loginPassword);
            login(response.token, loginEmail);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Invalid email or password combination.');
        } finally {
            setLoading(false);
            setIsDemoLoading(false);
            setShowColdStartWarning(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        executeLogin(email, password, false);
    };

    const handleDemoLogin = () => {
        setEmail(DEMO_CREDENTIALS.email);
        setPassword(DEMO_CREDENTIALS.password);
        executeLogin(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password, true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                    <p className="text-slate-500 mt-2 text-sm">Sign in to resume tracking your optimization metrics</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg text-rose-700 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Mail size={18} />
                            </span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Lock size={18} />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || isDemoLoading}
                        className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-500">Or</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={loading || isDemoLoading}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
                >
                    {isDemoLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            <Rocket size={18} />
                            Instant Recruiter Demo
                        </>
                    )}
                </button>

                {/* 💡 NEW: Smart Cold Start Warning */}
                {showColdStartWarning && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-800 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Info size={18} className="mt-0.5 shrink-0 text-amber-600" />
                        <p className="text-xs leading-relaxed font-medium">
                            <strong>Waking up the server.</strong> Since this backend is hosted on a free tier, it goes to sleep after inactivity. It may take up to <strong>50 seconds</strong> for this initial login to process.
                        </p>
                    </div>
                )}

                <p className="text-center text-sm text-slate-500 mt-6">
                    Don't have an account yet?{' '}
                    <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                        Create One
                    </Link>
                </p>
            </div>
        </div>
    );
}