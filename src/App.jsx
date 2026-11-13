import { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import './styles/custom-toast.css';
import { HangbugToastViewport } from "./components/CustomToast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import MaintenanceScreen from "./components/MaintenanceScreen";
import SplashScreen from "./components/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import {
    trackPageView,
    trackOrganicLandingPage,
    trackUserEngagement,
    ensureSingleGoogleTag
} from "./utils/analytics";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Landing from "./pages/Landing";
import Technologies from "./pages/quiz/Technologies";
import TechnologyDetail from "./pages/quiz/TechnologyDetail";
import GamesHub from "./pages/games/GamesHub";
import GamePlayer from "./pages/games/GamePlayer";
import BlogList from "./pages/blog/BlogList";
import BlogDetail from "./pages/blog/BlogDetail";
import Quiz from "./pages/quiz/Quiz";
import Result from "./pages/quiz/Result";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import AboutUs from "./pages/legal/AboutUs";
import ContactUs from "./pages/legal/ContactUs";
import DeleteAccount from "./pages/legal/DeleteAccount";
import NotFound from "./pages/NotFound";

// Dashboard
import DashboardLayout from "./layouts/DashboardLayout";
import UserDashboard from "./pages/dashboard/UserDashboard";
import Certificates from "./pages/certificates/Certificates";
import CertificateView from "./pages/certificates/CertificateView";
import Leaderboard from "./pages/leaderboard/Leaderboard";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/settings/Settings";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";

// SEO Dashboard
import SeoDashboard from "./pages/seo/SeoDashboard";

const SPLASH_SESSION_KEY = 'hangbug_splash_seen';

function AppRoutes() {
    const { user } = useAuth();
    const { settings, refreshSettings } = useSettings();
    const location = useLocation();
    const hasTrackedLandingRef = useRef(false);

    // Ensure single Google Tag and record initial organic landing page attribution once per mount
    useEffect(() => {
        ensureSingleGoogleTag();
        if (!hasTrackedLandingRef.current) {
            hasTrackedLandingRef.current = true;
            trackOrganicLandingPage(location.pathname + location.search);
        }
    }, [location.pathname, location.search]);

    // Track SPA route changes in Google Analytics 4
    useEffect(() => {
        trackPageView(location.pathname + location.search);
    }, [location.pathname, location.search]);

    // Track user engagement (scroll depth & engaged session time) per route
    useEffect(() => {
        const routePath = location.pathname;
        let maxScrollPct = 0;
        let tracked50 = false;
        let tracked90 = false;

        const handleScroll = () => {
            const docEl = document.documentElement;
            const scrollTop = window.scrollY || docEl.scrollTop || 0;
            const scrollHeight = (docEl.scrollHeight || 0) - (window.innerHeight || 0);
            if (scrollHeight <= 0) return;

            const pct = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
            if (pct > maxScrollPct) maxScrollPct = pct;

            if (pct >= 50 && !tracked50) {
                tracked50 = true;
                trackUserEngagement({
                    engagementType: 'scroll_depth',
                    pagePath: routePath,
                    scrollDepthPercent: 50
                });
            }
            if (pct >= 90 && !tracked90) {
                tracked90 = true;
                trackUserEngagement({
                    engagementType: 'scroll_depth',
                    pagePath: routePath,
                    scrollDepthPercent: 90
                });
            }
        };

        // 30-second engaged session milestone
        const engagedTimer = setTimeout(() => {
            if (document.visibilityState !== 'hidden') {
                trackUserEngagement({
                    engagementType: 'engaged_session',
                    pagePath: routePath,
                    engagementTimeSeconds: 30,
                    scrollDepthPercent: maxScrollPct
                });
            }
        }, 30000);

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            clearTimeout(engagedTimer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [location.pathname]);

    // If maintenance mode is active, show MaintenanceScreen to non-admin users
    // (allow /login so admins can sign in and manage settings)
    const isAdmin = String(user?.role || '').toLowerCase() === 'admin';
    const isLoginRoute = location.pathname === '/login';

    if (settings?.maintenanceMode && !isAdmin && !isLoginRoute) {
        return <MaintenanceScreen message={settings?.maintenanceMessage} onRefresh={refreshSettings} />;
    }

    return (
        <ErrorBoundary resetKey={location.pathname}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/technologies" element={<Technologies />} />
                <Route path="/technologies/level" element={<Navigate to="/technologies" replace />} />
                <Route path="/technologies/:slug" element={<TechnologyDetail />} />
                <Route path="/games" element={<GamesHub />} />
                <Route path="/games/coding-memory-match" element={<Navigate to="/games/memory-match" replace />} />
                <Route path="/games/:slug" element={<GamePlayer />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/resources" element={<Navigate to="/blog" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/certificate/view" element={<CertificateView />} />
                <Route path="/leaderboard" element={<Leaderboard mode="top5" />} />
                <Route path="/leaderboard/full" element={<Leaderboard mode="full" />} />
                <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/delete-account" element={<DeleteAccount />} />
                <Route path="/account-deletion" element={<Navigate to="/delete-account" replace />} />
                <Route path="/data-deletion" element={<Navigate to="/delete-account" replace />} />
                <Route path="/seo" element={<Navigate to="/dashboard/seo" replace />} />
                <Route path="/admin/seo" element={<Navigate to="/dashboard/seo" replace />} />
                <Route path="/certificates" element={<Navigate to="/dashboard/certificates" replace />} />
                <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
                <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
                <Route path="/quizzes" element={<Navigate to="/technologies" replace />} />
                <Route path="/quiz" element={<Navigate to="/technologies" replace />} />

                {/* Protected Quiz Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/quiz/start" element={<Quiz />} />
                    <Route path="/quiz/result" element={<Result />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<AdminDashboard />} />
                </Route>

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<UserDashboard />} />
                    <Route path="technologies" element={<Technologies />} />
                    <Route path="technologies/level" element={<Navigate to="/dashboard/technologies" replace />} />
                    <Route path="quizzes" element={<Technologies />} />
                    <Route path="certificates" element={<Certificates />} />
                    <Route path="games" element={<Navigate to="/games" replace />} />
                    <Route path="leaderboard" element={<Leaderboard mode="top5" />} />
                    <Route path="leaderboard/full" element={<Leaderboard mode="full" />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="seo" element={<ProtectedRoute adminOnly><SeoDashboard /></ProtectedRoute>} />
                    <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                </Route>

                {/* Fallback for unknown routes */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </ErrorBoundary>
    );
}

function AppContent() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <AppRoutes />
                <HangbugToastViewport />
            </SettingsProvider>
        </AuthProvider>
    );
}

function App() {
    const [splashDone, setSplashDone] = useState(() => {
        try {
            return sessionStorage.getItem(SPLASH_SESSION_KEY) === '1';
        } catch {
            return false;
        }
    });

    const handleSplashFinish = useCallback(() => {
        try {
            sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
        } catch {
            // Ignore sessionStorage errors in restricted browsing modes
        }
        setSplashDone(true);
    }, []);

    // Defense-in-depth failsafe: ensure splash overlay is dismissed within 1.2s
    useEffect(() => {
        if (splashDone) return;
        const timer = setTimeout(handleSplashFinish, 1200);
        return () => clearTimeout(timer);
    }, [splashDone, handleSplashFinish]);

    return (
        <ThemeProvider>
            <ErrorBoundary>
                {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
                <AppContent />
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;
