import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Github } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BrandLogo from '../../components/BrandLogo';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, loginWithGithub } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) { toast.error("Passwords do not match"); return; }
        if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
        setLoading(true);
        const success = await register(name, email, password);
        setLoading(false);
        if (success) navigate('/dashboard');
    };

    return (
        <div className="h-screen max-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col overflow-hidden transition-colors duration-300">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4 pt-16 sm:pt-20 min-h-0 overflow-y-auto lg:overflow-hidden">
                <div className="w-full max-w-md animate-fade-up my-auto">
                    <div className="text-center mb-4 sm:mb-5">
                        <BrandLogo variant="mark" size="lg" className="mx-auto mb-2" />
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--foreground)] mb-1">Create Account</h1>
                        <p className="text-[var(--foreground-secondary)] text-xs sm:text-sm">Start your HangBug journey.</p>
                    </div>
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 sm:p-6 shadow-lg">
                        <button type="button" onClick={loginWithGithub} className="btn-social text-xs sm:text-sm mb-4 w-full flex items-center justify-center gap-2">
                            <Github size={16} /> Sign up with GitHub
                        </button>
                        <div className="relative mb-4">
                            <div className="divider" />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-[10px] sm:text-xs font-semibold text-[var(--foreground-secondary)] bg-[var(--card-bg)]">or with email</span>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="space-y-1">
                                <label className="input-label text-xs">Full Name</label>
                                <div className="relative">
                                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10 py-2 text-xs sm:text-sm" placeholder="John Doe" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="input-label text-xs">Email</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10 py-2 text-xs sm:text-sm" placeholder="name@example.com" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="input-label text-xs">Password</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                        <input type={showPass ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10 pr-8 py-2 text-xs sm:text-sm" placeholder="Min 8 chars" />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">{showPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="input-label text-xs">Confirm</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                        <input type={showConfirm ? 'text' : 'password'} required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-field pl-10 pr-8 py-2 text-xs sm:text-sm" placeholder="Re-enter" />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">{showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 rounded-xl text-xs sm:text-sm mt-1">
                                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><UserPlus size={15} /> Create Free Account</>}
                            </button>
                        </form>
                        <div className="divider my-4" />
                        <p className="text-center text-xs text-[var(--foreground-secondary)]">Already have an account? <Link to="/login" className="font-semibold text-[#289B7D] hover:underline">Sign in</Link></p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
