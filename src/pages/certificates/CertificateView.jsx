import { useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Download, Linkedin, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/BrandLogo';

export default function CertificateView() {
    const { user } = useAuth();
    const location = useLocation();
    const { category = 'Web Development', percentage = 92, difficulty = 'advanced' } = location.state || {};
    const certRef = useRef(null);
    const [downloaded, setDownloaded] = useState(false);

    const [certId] = useState(() => `HB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
    const issueDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const difficultyLabel = {
        beginner: 'Foundational',
        intermediate: 'Professional',
        advanced: 'Advanced',
        expert: 'Maestro'
    };

    const handleDownload = () => {
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 3000);
    };

    const shareLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'width=600,height=600');
    };

    return (
        <div className="min-h-screen bg-[var(--page-bg)] flex flex-col">
            <Navbar />
            <div className="flex-1 py-24 lg:py-28 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <Link to="/dashboard" className="btn-ghost text-sm">
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
                                    <p className="text-[10px] text-[var(--foreground-muted)] font-semibold uppercase tracking-wider">Level</p>
                                </div>
                                <div className="w-px h-12 bg-[var(--card-border)]" />
                                <div className="text-center">
                                    <p className="text-3xl font-display font-extrabold text-[#289B7D]">{issueDate}</p>
                                    <p className="text-[10px] text-[var(--foreground-muted)] font-semibold uppercase tracking-wider">Date</p>
                                </div>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1">Certificate ID</p>
                                    <p className="text-sm font-mono font-bold text-[var(--foreground)]">{certId}</p>
                                </div>
                                <div className="text-center">
                                    <BrandLogo variant="mark" size="xl" className="mx-auto mb-2" />
                                    <p className="text-[10px] font-bold text-[var(--foreground-muted)]">Digital Signature</p>
                                </div>
                                <div className="text-right">
                                    <div className="w-16 h-16 rounded-xl bg-white border-2 border-[var(--card-border)] flex items-center justify-center p-2 mx-auto mb-1">
                                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700 rounded" 
                                             style={{ background: 'repeating-linear-gradient(45deg, #000, #000 2px, #fff 2px, #fff 4px)' }}/>
                                    </div>
                                    <p className="text-[10px] font-bold text-[var(--foreground-muted)]">QR Code</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
