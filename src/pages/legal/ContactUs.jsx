import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Clock, Send, CheckCircle2, ArrowLeft, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ContactUs() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setSubmitted(true);
        toast.success("Thank you! Your message has been received.");
    };

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

                {/* Header */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 mb-8 shadow-sm text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3E5C5] text-[#193D35] text-xs font-bold border border-[#E2D0A6] mb-4">
                        <Mail size={14} /> Support & Inquiries
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--foreground)] tracking-tight mb-2">
                        Get in Touch
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-lg mx-auto">
                        Have a question about HangBug quizzes, verified certificates, partnerships, or feedback? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Contact Info & Quick FAQ */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-4">
                            <h2 className="text-base font-display font-bold text-[var(--foreground)]">Direct Channels</h2>
                            
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-[#F3E5C5] text-[#193D35] shrink-0 border border-[#E2D0A6]">
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[var(--foreground)]">Email Support</p>
                                    <a href="mailto:support@hangbug.com" className="text-xs text-[#193D35] font-bold hover:underline">
                                        support@hangbug.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-[#F3E5C5] text-[#193D35] shrink-0 border border-[#E2D0A6]">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[var(--foreground)]">Response Time</p>
                                    <p className="text-xs text-[var(--foreground-muted)]">Typically within 24 to 48 business hours</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Help Box */}
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-display font-bold text-[var(--foreground)]">
                                <HelpCircle size={16} className="text-[#193D35]" />
                                <h3>Frequently Asked Questions</h3>
                            </div>
                            <div className="space-y-2 text-xs text-[var(--foreground-muted)]">
                                <div>
                                    <p className="font-semibold text-[var(--foreground)]">How do certificates work?</p>
                                    <p>Certificates are automatically awarded when you achieve 80% or higher on an assessment track.</p>
                                </div>
                                <div className="pt-2 border-t border-[var(--card-border)]">
                                    <p className="font-semibold text-[var(--foreground)]">Can I retake quizzes?</p>
                                    <p>Yes, you can retake sessions at any time to improve your accuracy and leaderboard score.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
                            {submitted ? (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-14 h-14 rounded-full bg-[#193D35] text-white flex items-center justify-center mx-auto">
                                        <CheckCircle2 size={28} />
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-[var(--foreground)]">Message Dispatched!</h3>
                                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-sm mx-auto">
                                        Thank you for reaching out. Our support team will review your message and reply to <strong>{form.email}</strong> shortly.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                                        className="btn-secondary text-xs py-2 px-4 rounded-xl mt-4"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <h2 className="text-base font-display font-bold text-[var(--foreground)] mb-1">
                                        Send us a Message
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                                                Your Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Jane Doe"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                className="input-field text-xs py-2.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="jane@example.com"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                className="input-field text-xs py-2.5"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Question regarding certificates, quiz bug, etc."
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                            className="input-field text-xs py-2.5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                                            Message <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows={5}
                                            required
                                            placeholder="Write your message here..."
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            className="input-field text-xs py-2.5 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-primary w-full justify-center text-xs py-3 rounded-xl shadow-md cursor-pointer"
                                    >
                                        <Send size={14} /> Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
