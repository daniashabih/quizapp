import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Github, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BrandLogo from '../../components/BrandLogo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(email, password);
        setLoading(false);
        if (success) navigate('/dashboard');
    };

    const fillDemoUser = (demoEmail) => {
        setEmail(demoEmail);
        setPassword('password');
    };

    return (
        <div className="h-screen max-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col overflow-hidden transition-colors duration-300">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4 pt-16 sm:pt-20 min-h-0 overflow-y-auto lg:overflow-hidden">
                <div className="w-full max-w-md animate-fade-up my-auto">
                    <div className="text-center mb-4 sm:mb-6">
                        <BrandLogo variant="mark" size="lg" className="mx-auto mb-2" />
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--foreground)] mb-1">Welcome back</h1>
                        <p className="text-[var(--foreground-secondary)] text-xs sm:text-sm">Sign in to continue your journey.</p>
                    </div>

                    {/* Demo Login Quick Fill */}
                    <div className="mb-4 p-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] space-y-1.5">
                        <p className="text-[10px] font-semibold text-[var(--foreground-secondary)] text-center uppercase tracking-wider">Quick Demo Login</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => fillDemoUser('user@example.com')}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[#289B7D] transition-all cursor-pointer shadow-xs"
                            >
                                <UserCheck size={13} className="text-[#289B7D]" /> Candidate
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoUser('admin@example.com')}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[#289B7D] transition-all cursor-pointer shadow-xs"
                            >
                                <ShieldCheck size={13} className="text-[#289B7D]" /> Admin
                            </button>
                        </div>
                    </div>

                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 sm:p-6 shadow-lg">
                        <button className="btn-social text-xs sm:text-sm mb-4"><Github size={16} /> Continue with GitHub</button>
                        <div className="relative mb-4">
                            <div className="divider" />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-[10px] sm:text-xs font-semibold text-[var(--foreground-secondary)] bg-[var(--card-bg)]">or continue with email</span>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="space-y-1">
                                <label className="input-label text-xs">Email</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10 py-2 text-xs sm:text-sm" placeholder="name@example.com" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="input-label text-xs">Password</label>
                                    <Link to="/forgot-password" className="text-xs font-semibold text-[#289B7D] hover:underline">Forgot?</Link>
                                </div>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                    <input type={showPass ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10 pr-10 py-2 text-xs sm:text-sm" placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 rounded-xl text-xs sm:text-sm mt-1">
                                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><LogIn size={15} /> Sign In</>}
                            </button>
                        </form>
                        <div className="divider my-4" />
                        <p className="text-center text-xs text-[var(--foreground-secondary)]">Don't have an account? <Link to="/register" className="font-semibold text-[#289B7D] hover:underline">Create one free</Link></p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
