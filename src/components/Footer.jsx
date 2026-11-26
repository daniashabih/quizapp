import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Building2, Code2, Mail, Sparkles } from 'lucide-react';
import axios from 'axios';
import BrandLogo from './BrandLogo';
import { useAuth } from '../context/AuthContext';
import { getTechnologySeoBySlug } from '../config/seoPagesConfig';
import { hasPublishedCategory } from '../utils/categoryAvailability';

const TECHNOLOGY_LINKS = [
    { slug: 'html', label: 'HTML' },
    { slug: 'css', label: 'CSS' },
    { slug: 'javascript', label: 'JavaScript' },
    { slug: 'react', label: 'React.js' },
    { slug: 'python', label: 'Python' },
    { slug: 'php', label: 'PHP' },
    { slug: 'laravel', label: 'Laravel' },
    { slug: 'mysql', label: 'MySQL' },
    { slug: 'mongodb', label: 'MongoDB' },
    { slug: 'flutter', label: 'Flutter' },
    { slug: 'dart', label: 'Dart' },
    { slug: 'programming-fundamentals', label: 'Fundamentals & OOP' }
];

const TUTORIAL_LINKS = [
    { to: '/blog/html-tutorial-for-beginners', label: 'HTML Tutorial for Beginners' },
    { to: '/blog/css-basics-beginners-guide', label: "CSS Basics Beginner's Guide" },
    { to: '/blog/javascript-fundamentals-beginners-guide', label: 'JavaScript Fundamentals' },
    { to: '/blog/php-programming-beginners-guide', label: 'PHP Programming Guide' },
    { to: '/blog/laravel-basics-mvc-architecture', label: 'Laravel MVC Architecture' },
    { to: '/blog/flutter-dart-mobile-app-development', label: 'Flutter & Dart Mobile Guide' }
];

function FooterLinks({ links }) {
    return (
        <ul className="space-y-2.5">
            {links.map(({ to, label }) => (
                <li key={to}>
                    <Link
                        to={to}
                        className="inline-flex min-h-11 items-center text-sm text-[#52615A] transition-colors duration-150 hover:text-[#193D35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] focus-visible:ring-offset-2 dark:text-[#B5C2BC] dark:hover:text-emerald-300 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-[#121916]"
                    >
                        {label}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function FooterColumn({ icon: Icon, title, children }) {
    return (
        <section aria-label={title} className="min-w-0">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#202B26] dark:text-[#F3F6F4]">
                <Icon size={16} aria-hidden="true" className="text-[#193D35] dark:text-emerald-300" />
                {title}
            </h2>
            {children}
        </section>
    );
}

export default function Footer() {
    const year = new Date().getFullYear();
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        let isMounted = true;
        axios.get('/categories')
            .then(res => {
                if (!isMounted) return;
                const list = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.categories)
                        ? res.data.categories
                        : [];
                setCategories(list);
            })
            .catch(error => {
                console.error('[Footer Category Fetch Error]:', error);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    const availableTechnologyLinks = TECHNOLOGY_LINKS
        .map(link => {
            const seoConfig = getTechnologySeoBySlug(link.slug);
            return seoConfig && hasPublishedCategory(categories, seoConfig.categoryMatcher || [seoConfig.name])
                ? { to: seoConfig.path, label: link.label }
                : null;
        })
        .filter(Boolean);

    return (
        <footer className="mt-auto w-full shrink-0 border-t border-[#E5E9E6] bg-white text-[#202B26] dark:border-[#2A3832] dark:bg-[#121916]">
            <div className="mx-auto max-w-7xl px-5 pb-7 pt-12 sm:px-8 sm:pt-14 lg:px-10">
                <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-12">
                    <section aria-label="About Hangbug" className="min-w-0">
                        <Link to="/" className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] focus-visible:ring-offset-4 dark:focus-visible:ring-emerald-300" aria-label="Hangbug Home">
                            <BrandLogo size="md" loading="lazy" />
                        </Link>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-[#52615A] dark:text-[#B5C2BC]">
                            Build your programming skills with Hangbug. Practice interactive quizzes, explore coding challenges, learn through tutorials, and earn certificates as you progress.
                        </p>
                        <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-[#52615A] dark:text-[#B5C2BC]">
                            <Sparkles size={14} aria-hidden="true" className="text-[#193D35] dark:text-emerald-300" />
                            Learn. Practice. Challenge Yourself.
                        </p>
                        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                            <li>
                                <Link to="/certificate/view" rel="nofollow" className="text-[#52615A] transition-colors hover:text-[#193D35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] dark:text-[#B5C2BC] dark:hover:text-emerald-300 dark:focus-visible:ring-emerald-300">
                                    Verify Certificate
                                </Link>
                            </li>
                            <li>
                                {user ? (
                                    <Link to="/dashboard" className="text-[#52615A] transition-colors hover:text-[#193D35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] dark:text-[#B5C2BC] dark:hover:text-emerald-300 dark:focus-visible:ring-emerald-300">
                                        Developer Dashboard
                                    </Link>
                                ) : (
                                    <Link to="/login" className="text-[#52615A] transition-colors hover:text-[#193D35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] dark:text-[#B5C2BC] dark:hover:text-emerald-300 dark:focus-visible:ring-emerald-300">
                                        Account Sign In
                                    </Link>
                                )}
                            </li>
                        </ul>
                    </section>

                    <FooterColumn icon={Code2} title="Explore Technologies">
                        <ul className="space-y-2.5">
                            <li>
                                <Link to="/technologies" className="inline-flex min-h-11 items-center text-sm font-medium text-[#193D35] transition-colors hover:text-[#42665B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] dark:text-emerald-300 dark:hover:text-emerald-200 dark:focus-visible:ring-emerald-300">
                                    All Technologies
                                </Link>
                            </li>
                            {availableTechnologyLinks.map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="inline-flex min-h-11 items-center text-sm text-[#52615A] transition-colors hover:text-[#193D35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] dark:text-[#B5C2BC] dark:hover:text-emerald-300 dark:focus-visible:ring-emerald-300">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </FooterColumn>

                    <FooterColumn icon={BookOpen} title="Learn & Practice">
                        <ul className="space-y-2.5">
                            <li>
                                <Link to="/blog" className="inline-flex min-h-11 items-center text-sm font-medium text-[#193D35] transition-colors hover:text-[#42665B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] dark:text-emerald-300 dark:hover:text-emerald-200 dark:focus-visible:ring-emerald-300">
                                    All Tutorials
                                </Link>
                            </li>
                            {TUTORIAL_LINKS.map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="inline-flex min-h-11 items-center text-sm text-[#52615A] transition-colors hover:text-[#193D35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] dark:text-[#B5C2BC] dark:hover:text-emerald-300 dark:focus-visible:ring-emerald-300">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li className="pt-1">
                                <Link to="/games" className="inline-flex min-h-11 items-center text-sm text-[#52615A] transition-colors hover:text-[#193D35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] dark:text-[#B5C2BC] dark:hover:text-emerald-300 dark:focus-visible:ring-emerald-300">
                                    Coding Games
                                </Link>
                            </li>
                            <li>
                                <Link to="/games/code-puzzle" className="inline-flex min-h-11 items-center text-sm text-[#52615A] transition-colors hover:text-[#193D35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] dark:text-[#B5C2BC] dark:hover:text-emerald-300 dark:focus-visible:ring-emerald-300">
                                    Developer Challenges
                                </Link>
                            </li>
                            <li>
                                <Link to="/leaderboard" className="inline-flex min-h-11 items-center text-sm text-[#52615A] transition-colors hover:text-[#193D35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] dark:text-[#B5C2BC] dark:hover:text-emerald-300 dark:focus-visible:ring-emerald-300">
                                    Global Leaderboard
                                </Link>
                            </li>
                        </ul>
                    </FooterColumn>

                    <FooterColumn icon={Building2} title="Company & Support">
                        <FooterLinks
                            links={[
                                { to: '/about', label: 'About Hangbug' },
                                { to: '/contact', label: 'Contact Support' },
                                { to: '/privacy-policy', label: 'Privacy Policy' },
                                { to: '/terms', label: 'Terms of Service' },
                                { to: '/delete-account', label: 'Delete Account' }
                            ]}
                        />
                    </FooterColumn>
                </div>

                <div className="mt-10 border-t border-[#E5E9E6] pt-5 dark:border-[#2A3832]">
                    <div className="grid grid-cols-1 items-center gap-4 text-sm text-[#52615A] sm:grid-cols-3 dark:text-[#B5C2BC]">
                        <p className="text-center sm:text-left">© {year} Hangbug. All rights reserved.</p>
                        <p className="text-center">Built for developers and lifelong learners.</p>
                        <a
                            href="mailto:support@hangbug.com"
                            aria-label="Email Hangbug Support"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm transition-colors hover:text-[#193D35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#193D35] sm:justify-end dark:hover:text-emerald-300 dark:focus-visible:ring-emerald-300"
                        >
                            <Mail size={16} aria-hidden="true" />
                            <span>support@hangbug.com</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
