import React, { useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BrandLogo from '../../components/BrandLogo';
import { Download, Linkedin, ArrowLeft, Award, QrCode } from 'lucide-react';

const difficultyLabel = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    expert: 'Expert'
};

export default function CertificateView() {
    const location = useLocation();
    const certRef = useRef(null);
    const [downloaded, setDownloaded] = useState(false);

    const {
        category = 'React',
        percentage = 96,
        difficulty = 'intermediate',
        user = { name: 'Alex Johnson' }
    } = location.state || {};

    const certId = 'HB-CERT-2026-8894';
    const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const handleDownload = () => {
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 3000);
    };

    const shareLinkedIn = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col">
            <Navbar />
            <div className="flex-1 pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--foreground-muted)] hover:text-[#059669] transition-colors">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                        <div className="flex-1" />
                        <button onClick={handleDownload} className="btn-primary text-sm">
                            <Download size={15} /> {downloaded ? 'Downloaded!' : 'Download PDF'}
                        </button>
                        <button onClick={shareLinkedIn} className="btn-secondary text-sm">
                            <Linkedin size={15} /> Share
                        </button>
                    </div>

                    {/* Certificate Card */}
                    <div ref={certRef} className="bg-white border-8 border-emerald-500/20 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden text-slate-900">
                        {/* Decorative Top Bar */}
                        <div className="h-2 bg-gradient-to-r from-[#059669] via-[#047857] to-[#10B981]" />

                        {/* Watermark / Background Icon */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                            <Award size={400} className="text-[#059669]" />
                        </div>

                        {/* Content Header */}
                        <div className="text-center pt-6 pb-4">
                            <BrandLogo variant="mark" size="lg" className="mx-auto mb-4" />
                            <div className="w-24 h-1 bg-gradient-to-r from-[#059669] to-[#047857] mx-auto mb-6 rounded-full" />
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-[#059669] border border-emerald-200 uppercase tracking-widest">
                                Certificate of Completion
                            </span>
                        </div>

                        {/* Body */}
                        <div className="text-center my-6 space-y-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This is to certify that</p>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                                {user?.name || 'Verified Learner'}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                                has successfully completed the <strong className="text-slate-900">{category}</strong> assessment track with a score of{' '}
                                <strong className="text-[#059669]">{percentage}%</strong>, demonstrating exceptional proficiency and mastery of core concepts.
                            </p>
                        </div>

                        {/* Footer Info Grid */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-center max-w-lg mx-auto">
                            <div>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Track Level</p>
                                <p className="text-sm sm:text-base font-display font-extrabold text-[#059669]">{difficultyLabel[difficulty] || difficulty}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Issued Date</p>
                                <p className="text-sm sm:text-base font-display font-extrabold text-[#047857]">{issueDate}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Verification ID</p>
                                <p className="text-xs font-mono font-bold text-slate-700">{certId}</p>
                            </div>
                        </div>

                        {/* QR Code and Seal */}
                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 px-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                    <QrCode size={36} className="text-slate-800" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Verify Online</p>
                                    <p className="text-[10px] text-slate-400 font-mono">hangbug.com/verify</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                                <Award size={24} className="text-[#059669]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
