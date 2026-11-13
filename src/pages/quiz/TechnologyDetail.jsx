import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Code2,
    Gamepad2,
    Award,
    Play,
    Sparkles,
    Layers,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BrandLogo from '../../components/BrandLogo';
import usePageSeo from '../../hooks/usePageSeo';
import { getTechnologySeoBySlug, TECHNOLOGY_SEO_SLUGS, SEO_PAGES_CONFIG } from '../../config/seoPagesConfig';
import { FALLBACK_GAMES, FALLBACK_TECHNOLOGIES } from '../../services/gameService';
import TechIcon from '../games/components/TechIcon';
import NotFound from '../NotFound';

const TOPIC_DETAILS = {
    html: [
        'Use semantic HTML5 elements (<header>, <nav>, <main>, <article>, <section>, <footer>) to structure accessible documents.',
        'Build validated web forms with input types, labels, fieldsets, and ARIA attributes for screen reader compatibility.',
        'Optimize document head metadata, responsive images, alt attributes, and heading hierarchy for search engines.'
    ],
    css: [
        'Calculate selector specificity accurately across inline styles, IDs, classes, attributes, and pseudo-elements.',
        'Design flexible one-dimensional and two-dimensional page layouts using CSS Flexbox and CSS Grid.',
        'Implement responsive media queries, CSS custom properties (variables), transitions, and stacking contexts.'
    ],
    javascript: [
        'Master variable declarations (let, const), lexical scope, closures, hoisting, and higher-order array methods.',
        'Trace asynchronous execution across callbacks, Promises, async/await, microtask queues, and the event loop.',
        'Debug type coercion, prototype inheritance, object destructuring, and DOM event propagation.'
    ],
    react: [
        'Build reusable functional components using JSX syntax, one-way props data flow, and conditional rendering.',
        'Manage local and shared state with useState, useReducer, useEffect dependency arrays, and useContext.',
        'Optimize rendering performance with useMemo, useCallback, React keys, and concurrent UI patterns.'
    ],
    php: [
        'Write clean server-side PHP scripts using strict types, associative arrays, string functions, and superglobals.',
        'Apply Object-Oriented Programming in PHP with classes, visibility modifiers, interfaces, traits, and namespaces.',
        'Handle HTTP requests, sessions, cookies, and parameterized PDO database queries safely.'
    ],
    laravel: [
        'Define expressive web and API routes, route model binding, controllers, and custom middleware pipelines.',
        'Model relational data with Eloquent ORM relationships, query scopes, migrations, and eager loading.',
        'Structure views and validation using Blade components, Form Request validation, and the Laravel service container.'
    ],
    mysql: [
        'Write precise SQL SELECT queries using WHERE filters, ORDER BY sorting, LIMIT pagination, and aggregate functions.',
        'Combine normalized tables using INNER JOIN, LEFT JOIN, RIGHT JOIN, GROUP BY, and HAVING clauses.',
        'Design relational schemas with primary keys, foreign key constraints, composite indexes, and ACID transactions.'
    ],
    mongodb: [
        'Design flexible BSON document schemas using embedded subdocuments and referenced collection relationships.',
        'Execute CRUD operations with comparison, logical, array, and element query operators in MongoDB.',
        'Build multi-stage aggregation pipelines ($match, $group, $lookup, $project, $sort) and compound indexes.'
    ],
    flutter: [
        'Understand widget lifecycle differences between StatelessWidget, StatefulWidget, State, and BuildContext.',
        'Compose responsive mobile and multi-platform layouts using Row, Column, Stack, Expanded, and ListView.',
        'Manage declarative UI state updates, navigation routes, theming, and asynchronous FutureBuilder widgets.'
    ],
    dart: [
        'Write sound null-safe Dart code using nullable types (?), null-aware operators (??, ?.), and late initialization.',
        'Handle asynchronous workflows with Future, async/await, Stream subscriptions, and isolates.',
        'Use Dart classes, named constructors, factory constructors, mixins, generics, and collection-if/for literals.'
    ],
    python: [
        'Manipulate core Python data structures including lists, tuples, dictionaries, and sets with idiomatic comprehensions.',
        'Define modular functions using *args, **kwargs, lambda expressions, generators (yield), and decorators.',
        'Apply Python OOP principles, exception handling, context managers, and understand GIL concurrency behavior.'
    ],
    'programming-fundamentals': [
        'Evaluate boolean expressions, truth tables, conditional branching, loop invariants, and recursion base cases.',
        'Apply the four pillars of Object-Oriented Programming: encapsulation, abstraction, inheritance, and polymorphism.',
        'Analyze core data structures (arrays, stacks, queues, linked lists, trees, hash maps) and Big-O time/space complexity.'
    ]
};

export default function TechnologyDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const seoConfig = getTechnologySeoBySlug(slug);

    const [matchingCategories, setMatchingCategories] = useState([]);
    const [sessionsByCategory, setSessionsByCategory] = useState({});
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);

    usePageSeo({
        title: seoConfig ? seoConfig.title : 'Technology Quizzes & Coding Practice | Hangbug',
        description: seoConfig
            ? seoConfig.description
            : 'Practice programming quizzes and interactive coding games on Hangbug.',
        primaryKeyword: seoConfig?.primaryKeyword,
        secondaryKeywords: seoConfig?.secondaryKeywords,
        canonicalPath: seoConfig ? seoConfig.path : `/technologies/${slug || ''}`,
        noindex: !seoConfig,
        ogImageAlt: seoConfig ? seoConfig.imageAlt : 'Hangbug Technology Quiz & Practice Track'
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    useEffect(() => {
        if (!seoConfig) {
            setLoadingQuizzes(false);
            return;
        }

        let isMounted = true;
        const loadQuizData = async () => {
            setLoadingQuizzes(true);
            try {
                const res = await axios.get('/categories');
                const list = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.categories)
                    ? res.data.categories
                    : [];

                const matchNames = (seoConfig.categoryMatcher || [seoConfig.name]).map(n => n.toLowerCase());
                const matched = list.filter(cat => {
                    if (!cat || cat.isEnabled === false || Number(cat.questionCount || 0) <= 0) return false;
                    const cName = (cat.name || '').toLowerCase();
                    return matchNames.some(m => cName === m || cName.includes(m));
                });

                if (!isMounted) return;
                setMatchingCategories(matched);

                const sessionMap = {};
                await Promise.all(
                    matched.map(async (cat) => {
                        try {
                            const sRes = await axios.get(`/questions/sessions?category=${encodeURIComponent(cat.name)}`);
                            if (Array.isArray(sRes.data) && sRes.data.length > 0) {
                                sessionMap[cat.name] = sRes.data;
                            } else {
                                sessionMap[cat.name] = [{ session: 1, count: cat.questionCount || 0 }];
                            }
                        } catch {
                            sessionMap[cat.name] = [{ session: 1, count: cat.questionCount || 0 }];
                        }
                    })
                );

                if (isMounted) {
                    setSessionsByCategory(sessionMap);
                }
            } catch {
                if (isMounted) {
                    setMatchingCategories([]);
                }
            } finally {
                if (isMounted) {
                    setLoadingQuizzes(false);
                }
            }
        };

        loadQuizData();
        return () => {
            isMounted = false;
        };
    }, [seoConfig]);

    if (!seoConfig) {
        return <NotFound />;
    }

    // Canonical redirect for legacy / alias technology slugs (e.g. /technologies/reactjs -> /technologies/react)
    if (slug !== seoConfig.slug) {
        return <Navigate to={seoConfig.path} replace />;
    }

    const techGameEntries =
        seoConfig.slug === 'programming-fundamentals'
            ? FALLBACK_TECHNOLOGIES.filter(t => t.categorySlug === 'programming-fundamentals')
            : FALLBACK_TECHNOLOGIES.filter(t => t.slug === seoConfig.slug);

    const supportedGameSlugs = Array.from(
        new Set(techGameEntries.flatMap(t => t.supportedGames || []))
    );

    const supportedGames = FALLBACK_GAMES.filter(g => supportedGameSlugs.includes(g.slug));
    const defaultGameTechParam =
        seoConfig.slug === 'programming-fundamentals' ? 'programming-logic' : seoConfig.slug;

    const topicBullets = TOPIC_DETAILS[seoConfig.slug] || [];

    const handleStartSession = (categoryName, sessionNumber) => {
        navigate('/quiz/start', {
            state: {
                category: categoryName,
                language: categoryName,
                session: sessionNumber
            }
        });
    };

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-10">
                {/* Breadcrumb / Back Navigation */}
                <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs font-semibold text-[var(--foreground-muted)]">
                    <Link to="/" className="hover:text-[#193D35] transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/technologies" className="hover:text-[#193D35] transition-colors">Technologies</Link>
                    <span>/</span>
                    <span className="text-[var(--foreground)]">{seoConfig.name}</span>
                </nav>

                {/* Hero Section with Single Clear H1, Intro Content, and Descriptive Image Alt */}
                <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-8 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3E5C5] text-[#193D35] text-xs font-bold border border-[#E2D0A6]">
                                <Sparkles size={13} />
                                <span>{seoConfig.categoryLabel}</span>
                            </div>

                            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
                                {seoConfig.h1}
                            </h1>

                            <p className="text-sm sm:text-base text-[var(--foreground-muted)] leading-relaxed max-w-2xl">
                                {seoConfig.introContent}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Link
                                    to={`/games?tech=${defaultGameTechParam}`}
                                    className="btn-primary text-xs sm:text-sm py-2.5 px-5 rounded-2xl shadow-xs inline-flex items-center gap-2"
                                >
                                    <Gamepad2 size={15} /> Practice {seoConfig.name} Games
                                </Link>
                                <Link
                                    to="/technologies"
                                    className="btn-secondary text-xs sm:text-sm py-2.5 px-5 rounded-2xl inline-flex items-center gap-2"
                                >
                                    <Layers size={15} /> All Technology Quizzes
                                </Link>
                                <Link
                                    to="/certificate/view"
                                    className="text-xs font-semibold text-[#193D35] dark:text-emerald-400 hover:underline px-2 py-1"
                                >
                                    How Completion Certificates Work →
                                </Link>
                            </div>
                        </div>

                        {/* Visual Feature Card with Descriptive Image Alt Text */}
                        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-center space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-[#193D35]/10 dark:bg-emerald-500/15 border border-[#193D35]/20 flex items-center justify-center shadow-xs">
                                <TechIcon slug={defaultGameTechParam} className="w-8 h-8" />
                            </div>
                            <img
                                src="/favicon.png"
                                alt={seoConfig.imageAlt}
                                className="w-8 h-8 object-contain opacity-90"
                                width="32"
                                height="32"
                                loading="lazy"
                                decoding="async"
                            />
                            <p className="text-xs font-bold text-[var(--foreground)]">
                                {seoConfig.name} Skill Practice
                            </p>
                            <p className="text-[11px] text-[var(--foreground-muted)]">
                                {supportedGames.length} Interactive Coding & Typing Games · Instant Answer Feedback
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 1: H2 + H3 Subtopics Covered */}
                <section className="space-y-5">
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">
                        {seoConfig.h2s[0]}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {seoConfig.h3s.map((h3Title, idx) => (
                            <div
                                key={h3Title}
                                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 space-y-2.5 shadow-2xs"
                            >
                                <div className="w-9 h-9 rounded-xl bg-[#193D35] text-white flex items-center justify-center font-bold text-xs">
                                    0{idx + 1}
                                </div>
                                <h3 className="text-sm sm:text-base font-display font-bold text-[var(--foreground)]">
                                    {h3Title}
                                </h3>
                                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                    {topicBullets[idx] ||
                                        `Practice real-world ${seoConfig.name} syntax, edge cases, and problem-solving patterns with immediate verification.`}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 2: H2 Available Quiz Sessions (Truthful to Live Database) */}
                <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">
                                {seoConfig.h2s[1]}
                            </h2>
                            <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-1">
                                Take session-based assessments with immediate answer locking, explanations, and progress saving.
                            </p>
                        </div>
                        <Link
                            to="/technologies"
                            className="text-xs font-bold text-[#193D35] dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                            View Full Quiz Directory <ArrowRight size={13} />
                        </Link>
                    </div>

                    {loadingQuizzes ? (
                        <div className="py-8 flex items-center justify-center gap-2 text-xs text-[var(--foreground-muted)]">
                            <Loader2 size={18} className="animate-spin text-[#193D35]" />
                            <span>Checking active {seoConfig.name} quiz sessions...</span>
                        </div>
                    ) : matchingCategories.length > 0 ? (
                        <div className="space-y-4">
                            {matchingCategories.map((cat) => {
                                const sessions = sessionsByCategory[cat.name] || [{ session: 1, count: cat.questionCount || 0 }];
                                return (
                                    <div
                                        key={cat.id || cat.name}
                                        className="p-5 rounded-2xl bg-[var(--muted-bg)]/60 border border-[var(--card-border)] space-y-3"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <h3 className="text-base font-display font-bold text-[var(--foreground)]">
                                                    {cat.name} Assessment Track
                                                </h3>
                                                <p className="text-xs text-[var(--foreground-muted)]">
                                                    {cat.questionCount} live questions across {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleStartSession(cat.name, 'all')}
                                                className="btn-primary text-xs py-2 px-4 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                                            >
                                                <Play size={13} /> Start Complete Track
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                                            {sessions.map((s) => (
                                                <button
                                                    key={`${cat.name}-s-${s.session}`}
                                                    type="button"
                                                    onClick={() => handleStartSession(cat.name, s.session)}
                                                    className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#193D35] text-left transition-all cursor-pointer flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="text-xs font-bold text-[var(--foreground)]">Session {s.session}</p>
                                                        <p className="text-[10px] text-[var(--foreground-muted)]">{s.count} Questions</p>
                                                    </div>
                                                    <Play size={12} className="text-[#193D35]" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-5 rounded-2xl bg-[var(--muted-bg)]/60 border border-[var(--card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="text-sm font-display font-bold text-[var(--foreground)]">
                                    Interactive {seoConfig.name} Practice via Coding Games & Question Bank
                                </h3>
                                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed max-w-2xl">
                                    Hands-on {seoConfig.name} practice is live right now in the HangBug Coding Games Arcade below. You can also browse all active multi-session quiz tracks on the Technologies page.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    to={`/games?tech=${defaultGameTechParam}`}
                                    className="btn-primary text-xs py-2.5 px-4 rounded-xl"
                                >
                                    Play {seoConfig.name} Games
                                </Link>
                                <Link
                                    to="/technologies"
                                    className="btn-secondary text-xs py-2.5 px-4 rounded-xl"
                                >
                                    All Quizzes
                                </Link>
                            </div>
                        </div>
                    )}
                </section>

                {/* Section 3: H2 Interactive Coding & Typing Games for this Technology */}
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">
                                {seoConfig.h2s[2]}
                            </h2>
                            <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-0.5">
                                Practice {seoConfig.name} syntax, debugging, and code arrangement directly in your browser.
                            </p>
                        </div>
                        <Link
                            to={`/games?tech=${defaultGameTechParam}`}
                            className="text-xs font-bold text-[#193D35] dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                            Open {seoConfig.name} in Games Hub <ArrowRight size={13} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {supportedGames.slice(0, 6).map((game) => (
                            <Link
                                key={game.slug}
                                to={`/games/${game.slug}?tech=${defaultGameTechParam}`}
                                className="bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#193D35] rounded-2xl p-5 flex flex-col justify-between gap-3 transition-all hover:shadow-md group"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6]">
                                            {game.category}
                                        </span>
                                        <span className="text-[10px] font-semibold text-[var(--foreground-muted)]">
                                            {game.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-display font-bold text-[var(--foreground)] group-hover:text-[#193D35] transition-colors">
                                        {seoConfig.name} {game.title}
                                    </h3>
                                    <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                        {game.description}
                                    </p>
                                </div>
                                <div className="pt-2 border-t border-[var(--card-border)] flex items-center justify-between text-xs font-bold text-[#193D35] dark:text-emerald-400">
                                    <span>Play Challenge</span>
                                    <ArrowRight size={13} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Section 4: H2 Internal Links & Related Technology Tracks */}
                <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 space-y-4">
                    <h2 className="text-lg sm:text-xl font-display font-extrabold text-[var(--foreground)]">
                        {seoConfig.h2s[3]}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                        Explore related coding quizzes, interactive games, and completion certificate resources across HangBug:
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                        {seoConfig.internalLinks.map((link) => (
                            <Link
                                key={link.to + link.label}
                                to={link.to}
                                className="px-3.5 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] hover:border-[#193D35] text-xs font-semibold text-[var(--foreground)] hover:text-[#193D35] transition-all inline-flex items-center gap-1.5"
                            >
                                <span>{link.label}</span>
                                <ArrowRight size={12} />
                            </Link>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-[var(--card-border)]">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-2.5">
                            All Featured Technology Quiz Tracks
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {TECHNOLOGY_SEO_SLUGS.map((tSlug) => {
                                const item = SEO_PAGES_CONFIG[tSlug];
                                const isCurrent = tSlug === seoConfig.slug;
                                return (
                                    <Link
                                        key={tSlug}
                                        to={item.path}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                            isCurrent
                                                ? 'bg-[#193D35] text-white border-[#193D35]'
                                                : 'bg-[var(--card-bg)] text-[var(--foreground-muted)] border-[var(--card-border)] hover:text-[var(--foreground)]'
                                        }`}
                                    >
                                        {item.name} Quizzes
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
