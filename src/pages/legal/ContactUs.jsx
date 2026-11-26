import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Clock, Send, CheckCircle2, ArrowLeft, HelpCircle } from 'lucide-react';
import { notify } from '../../services/notificationService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import usePageSeo from '../../hooks/usePageSeo';

export default function ContactUs() {
    usePageSeo({
        title: 'Contact Support & Inquiries — Hangbug Coding Quiz Platform',
        description: 'Get in touch with the Hangbug team for questions regarding technology quizzes, score-based certificates, coding games, or technical support.',
        canonicalPath: '/contact',
        schemaType: 'WebPage',
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Contact Support', path: '/contact' }
        ]
    });
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        website: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const values = {
            name: form.name.trim(),
            email: form.email.trim(),
            subject: form.subject.trim(),
            message: form.message.trim(),
            website: form.website
        };
        if (!values.name || values.name.length > 100
            || !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i.test(values.email)
            || values.email.length > 254
            || values.subject.length > 150
            || /[\r\n]/.test(values.subject)
            || values.message.length < 10
            || values.message.length > 5000) {
            setErrorMessage('Check that your name, email, subject, and message meet the field limits.');
            return;
        }
        setSending(true);
        setErrorMessage('');
        try {
            await axios.post('/api/contact', values);
            setSubmitted(true);
            notify.success({
                title: "Message submitted",
                description: "Your message was accepted for delivery to our support team."
            });
        } catch (error) {
            const message = error.response?.data?.message
                || "We couldn't send your message. Please try again or email support@hangbug.com.";
            setErrorMessage(message);
            notify.error({ title: "Message not sent", description: message });
        } finally {
            setSending(false);
        }
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
                        <Mail size={14} /> Support &amp; Inquiries
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--foreground)] tracking-tight mb-2">
                        Get in Touch with the Hangbug Support Team
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-lg mx-auto">
                        Have a question about Hangbug technology quizzes, coding games, score-based certificates, or platform feedback? We would love to hear from you.
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
                                <h2 className="text-base font-display font-bold text-[var(--foreground)]">Frequently Asked Questions</h2>
                            </div>
                            <div className="space-y-2 text-xs text-[var(--foreground-muted)]">
                                <div>
                                    <h3 className="font-semibold text-[var(--foreground)]">How do certificates work?</h3>
                                    <p>When certificates are enabled, a passing quiz result at or above the configured certificate threshold can earn a certificate. The default threshold is 80%.</p>
                                </div>
                                <div className="pt-2 border-t border-[var(--card-border)]">
                                    <h3 className="font-semibold text-[var(--foreground)]">Can I retake quizzes?</h3>
                                    <p>Yes, you can retake sessions at any time to improve your accuracy and leaderboard score.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
                            {submitted ? (
                                <div role="status" aria-live="polite" className="py-12 text-center space-y-4">
                                    <div className="w-14 h-14 rounded-full bg-[#193D35] text-white flex items-center justify-center mx-auto">
                                        <CheckCircle2 size={28} />
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-[var(--foreground)]">Message Sent</h3>
                                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-sm mx-auto">
                                        Thank you for reaching out. Your message was accepted for delivery to Hangbug support, who can reply to <strong>{form.email}</strong>.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { setSubmitted(false); setErrorMessage(''); setForm({ name: '', email: '', subject: '', message: '', website: '' }); }}
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
                                    <div className="sr-only" aria-hidden="true">
                                        <label htmlFor="contact-website">Leave this field empty</label>
                                        <input
                                            id="contact-website"
                                            type="text"
                                            name="website"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={form.website}
                                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                                                Your Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={100}
                                                autoComplete="name"
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
                                                maxLength={254}
                                                autoComplete="email"
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
                                            maxLength={150}
                                            placeholder="Question regarding certificates, quiz session, etc."
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
                                            minLength={10}
                                            maxLength={5000}
                                            placeholder="Write your message here..."
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            className="input-field text-xs py-2.5 resize-none"
                                        />
                                    </div>

                                    {errorMessage && (
                                        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                                            {errorMessage}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="btn-primary w-full justify-center text-xs py-3 rounded-xl shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <Send size={14} /> {sending ? 'Sending...' : 'Send Message'}
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
