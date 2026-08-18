import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, ExternalLink, Linkedin, Search, FileText, Lock, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import dashboardService from '../../services/dashboardService';

export default function Certificates() {
    const [searchQuery, setSearchQuery] = useState('');
    const [earnedCerts, setEarnedCerts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [certsRes, catsRes] = await Promise.allSettled([
                dashboardService.getMyCertificates(),
                axios.get('/categories')
            ]);

            if (certsRes.status === 'fulfilled' && certsRes.value?.certificates) {
                setEarnedCerts(certsRes.value.certificates);
            } else {
                setEarnedCerts([]);
            }

            if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value?.data)) {
                setAllCategories(catsRes.value.data);
            } else {
                setAllCategories([]);
            }
        } catch (err) {
            console.error('[Certificates Fetch Error]:', err);
            setError('Unable to load certificates.');
            toast.error('Failed to load your certificates.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Combine earned certificates and available tracks
    const earnedTechs = new Set(earnedCerts.map(c => (c.tech || c.category || '').toLowerCase()));
    
    const availableTracks = allCategories
        .filter(cat => !earnedTechs.has(cat.name.toLowerCase()))
        .map(cat => ({
            id: `TRACK-${cat.id.slice(-4).toUpperCase()}`,
            tech: cat.name,
            category: cat.name,
            score: 0,
            date: 'Locked',
            issued: false
        }));

    const fullList = [...earnedCerts, ...availableTracks];

    const filtered = fullList.filter(c =>
        (c.tech || c.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const earnedCount = earnedCerts.length;
    const bestScore = earnedCerts.length > 0
        ? Math.max(...earnedCerts.map(c => c.score || c.percentage || 0))
        : 0;

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6 animate-pulse p-2">
                <div className="h-20 bg-[var(--muted-bg)] rounded-2xl" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="h-28 bg-[var(--muted-bg)] rounded-2xl" />
                    ))}
                </div>
                <div className="h-12 bg-[var(--muted-bg)] rounded-2xl max-w-sm" />
                <div className="space-y-4">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="h-24 bg-[var(--muted-bg)] rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error && earnedCerts.length === 0 && allCategories.length === 0) {
        return (
            <div className="max-w-xl mx-auto text-center py-16 card p-8 rounded-3xl space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">Unable to load certificates</h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                    We could not retrieve your certificate records from MongoDB.
                </p>
                <button onClick={fetchData} className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-6 mx-auto">
                    <RefreshCw size={14} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--foreground)]">My Certificates</h1>
                    <p className="text-sm text-[var(--foreground-muted)] mt-1">
                        {earnedCount} {earnedCount === 1 ? 'certificate' : 'certificates'} earned · Best score: {bestScore}%
                    </p>
                </div>
                <Link to="/technologies" className="btn-primary text-xs py-2.5 px-4 self-start sm:self-auto">
                    Earn New Certificate
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="card p-5 rounded-2xl text-center">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-300 flex items-center justify-center mx-auto mb-2">
                        <Award size={18} className="text-black" />
                    </div>
                    <p className="text-2xl font-display font-bold text-[var(--foreground)]">{earnedCount}</p>
                    <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Earned</p>
                </div>
                <div className="card p-5 rounded-2xl text-center">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-300 flex items-center justify-center mx-auto mb-2">
                        <Lock size={18} className="text-black" />
                    </div>
                    <p className="text-2xl font-display font-bold text-[var(--foreground)]">{availableTracks.length}</p>
                    <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Available Tracks</p>
                </div>
                <div className="card p-5 rounded-2xl text-center">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-300 flex items-center justify-center mx-auto mb-2">
                        <FileText size={18} className="text-black" />
                    </div>
                    <p className="text-2xl font-display font-bold text-[var(--foreground)]">{fullList.length}</p>
                    <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Total Tracks</p>
                </div>
            </div>

            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                <input
                    type="text"
                    placeholder="Search certificates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10 py-3"
                />
            </div>

            <div className="grid gap-4">
                {filtered.map((cert) => (
                    <div key={cert.id} className={`card p-5 lg:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all group ${cert.issued ? '' : 'opacity-60'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
                                cert.issued
                                    ? 'bg-black text-white border border-black'
                                    : 'bg-[var(--muted-bg)] border border-[var(--card-border)] text-black'
                            }`}>
                                {cert.issued ? '🏆' : '🔒'}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-[var(--foreground)]">{cert.tech || cert.category}</h3>
                                    {cert.issued && (
                                        <CheckCircle2 size={14} className="text-black" />
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-[var(--foreground-muted)]">{cert.issued ? 'Certified' : 'Available Track'}</span>
                                    {cert.issued && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-[var(--card-border)]" />
                                            <span className="text-xs font-bold text-[#193D35]">{cert.score}%</span>
                                            <span className="w-1 h-1 rounded-full bg-[var(--card-border)]" />
                                            <span className="text-xs text-[var(--foreground-muted)]">{cert.date}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {cert.issued ? (
                                <>
                                    <Link
                                        to="/certificate/view"
                                        state={{ category: cert.tech || cert.category, percentage: cert.score }}
                                        className="btn-primary text-xs px-4 py-2.5"
                                    >
                                        <ExternalLink size={13} /> View
                                    </Link>
                                    <Link
                                        to="/certificate/view"
                                        state={{ category: cert.tech || cert.category, percentage: cert.score }}
                                        className="p-2.5 rounded-xl text-[var(--foreground-muted)] hover:text-black hover:bg-[var(--muted-bg)] transition-all"
                                        title="Download Certificate"
                                    >
                                        <Download size={15} />
                                    </Link>
                                    <a
                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/certificate/view')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 rounded-xl text-[var(--foreground-muted)] hover:text-black hover:bg-[var(--muted-bg)] transition-all"
                                        title="Share on LinkedIn"
                                    >
                                        <Linkedin size={15} />
                                    </a>
                                </>
                            ) : (
                                <Link
                                    to="/technologies"
                                    className="text-xs font-semibold text-[#193D35] hover:underline"
                                >
                                    Score 80%+ to unlock →
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 card p-8 rounded-3xl">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-center mx-auto mb-3">
                        <Award size={28} className="text-[var(--foreground-muted)] opacity-40" />
                    </div>
                    <p className="text-sm font-bold text-[var(--foreground)] mb-1">No certificates found</p>
                    <p className="text-xs text-[var(--foreground-muted)] mb-4">
                        {searchQuery ? `No results matching "${searchQuery}".` : 'Complete a quiz with 80%+ score to earn your first verified certificate.'}
                    </p>
                    <Link to="/technologies" className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 mx-auto">
                        Take a Quiz
                    </Link>
                </div>
            )}
        </div>
    );
}
