import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Code2, Award, Users, Target, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BrandLogo from '../../components/BrandLogo';

export default function AboutUs() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
                {/* Back Link */}
                <div className="mb-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[#193D35] transition-colors">
                        <ArrowLeft size={14} /> Back to Home
                    </Link>
                </div>

                {/* Hero Header */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-12 mb-10 shadow-sm text-center relative overflow-hidden">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3E5C5] text-[#193D35] text-xs font-bold border border-[#E2D0A6] mb-4">
                        <Sparkles size={14} /> About HangBug
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-[var(--foreground)] tracking-tight mb-4 max-w-2xl mx-auto">
                        Debug Your Knowledge. <br /><span className="text-[#193D35]">Build Your Future.</span>
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--foreground-muted)] max-w-2xl mx-auto leading-relaxed">
                        HangBug is an interactive developer quiz and skill verification platform built to help software engineers test their full-stack proficiency, prepare for technical interviews, and earn verifiable certificates.
                    </p>
                </div>

                {/* Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-[#193D35] text-[#FCFAF4] flex items-center justify-center font-bold">
                            <Code2 size={20} />
                        </div>
                        <h3 className="text-base font-display font-bold text-[var(--foreground)]">Comprehensive Stack Coverage</h3>
                        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                            From frontend modern frameworks like React and Vue to backend systems like Node.js, Python, and SQL, our tests cover syntax, edge cases, and architectural best practices.
                        </p>
                    </div>

                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-[#193D35] text-[#FCFAF4] flex items-center justify-center font-bold">
                            <Award size={20} />
                        </div>
                        <h3 className="text-base font-display font-bold text-[var(--foreground)]">Verifiable Certificates</h3>
                        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                            Earn official credential certificates complete with unique verification codes and QR verification that can be shared directly on LinkedIn and developer resumes.
                        </p>
                    </div>

                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-[#193D35] text-[#FCFAF4] flex items-center justify-center font-bold">
                            <Target size={20} />
                        </div>
                        <h3 className="text-base font-display font-bold text-[var(--foreground)]">Session-Based Progression</h3>
                        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                            Practice level-calibrated sessions, track your historical speed and accuracy, and climb global developer leaderboards with XP rewards.
                        </p>
                    </div>
                </div>

                {/* Mission Statement */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 sm:p-10 mb-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-3">
                        <h2 className="text-2xl font-display font-extrabold text-[var(--foreground)]">Our Mission</h2>
                        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                            We believe self-assessment is the fastest way to master web development. Rather than passive reading, HangBug provides immediate feedback on tough interview questions and real-world coding concepts so engineers can identify blind spots and build unshakeable confidence.
                        </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-center gap-3">
                        <BrandLogo size="lg" />
                        <Link to="/technologies" className="btn-primary text-xs py-2.5 px-5 rounded-xl">
                            Explore Technologies <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
