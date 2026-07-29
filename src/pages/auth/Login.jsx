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
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-28 sm:pt-32 pb-16">
                <div className="w-full max-w-md animate-fade-up">
                    <div className="text-center mb-8">
                        <BrandLogo variant="mark" size="xl" className="mx-auto mb-4" />
                        <h1 className="text-3xl font-display font-bold text-[var(--foreground)] mb-2">Welcome back</h1>
                        <p className="text-[var(--foreground-secondary)] text-sm">Sign in to continue your journey.</p>
                    </div>

                    {/* Demo Login Quick Fill */}
                    <div className="mb-6 p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] space-y-2">
                        <p className="text-xs font-semibold text-[var(--foreground-secondary)] text-center uppercase tracking-wider">Quick Demo Login</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => fillDemoUser('user@example.com')}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[#289B7D] transition-all cursor-pointer shadow-xs"
                            >
                                <UserCheck size={14} className="text-[#289B7D]" /> Candidate
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoUser('admin@example.com')}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[#289B7D] transition-all cursor-pointer shadow-xs"
                            >
                                <ShieldCheck size={14} className="text-[#289B7D]" /> Admin
                            </button>
                        </div>
                    </div>

                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 shadow-lg">
                        <button className="btn-social text-sm mb-6"><Github size={18} /> Continue with GitHub</button>
                        <div className="relative mb-6">
                            <div className="divider" />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-xs font-semibold text-[var(--foreground-secondary)] bg-[var(--card-bg)]">or continue with email</span>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="input-label">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="name@example.com" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="input-label">Password</label>
                                    <Link to="/forgot-password" className="text-xs font-semibold text-[#289B7D] hover:underline">Forgot?</Link>
                                </div>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                    <input type={showPass ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10 pr-10" placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl text-sm mt-2">
                                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><LogIn size={16} /> Sign In</>}
                            </button>
                        </form>
                        <div className="divider my-6" />
                        <p className="text-center text-sm text-[var(--foreground-secondary)]">Don't have an account? <Link to="/register" className="font-semibold text-[#289B7D] hover:underline">Create one free</Link></p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
