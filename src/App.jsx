import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/custom-toast.css';
import { CustomToastIcon, CustomCloseButton } from "./components/CustomToast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import MaintenanceScreen from "./components/MaintenanceScreen";
import SplashScreen from "./components/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";

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
import Quiz from "./pages/quiz/Quiz";
import Result from "./pages/quiz/Result";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import AboutUs from "./pages/legal/AboutUs";
import ContactUs from "./pages/legal/ContactUs";
import DeleteAccount from "./pages/legal/DeleteAccount";

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
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/certificate/view" element={<CertificateView />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/delete-account" element={<DeleteAccount />} />
                <Route path="/account-deletion" element={<DeleteAccount />} />
                <Route path="/data-deletion" element={<DeleteAccount />} />
                <Route path="/seo" element={<Navigate to="/dashboard/seo" replace />} />
                <Route path="/admin/seo" element={<Navigate to="/dashboard/seo" replace />} />
                <Route path="/certificates" element={<Navigate to="/dashboard/certificates" replace />} />
                <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
                <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
                <Route path="/quizzes" element={<Navigate to="/technologies" replace />} />

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
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="seo" element={<ProtectedRoute adminOnly><SeoDashboard /></ProtectedRoute>} />
                    <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                </Route>

                {/* Fallback for unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ErrorBoundary>
    );
}

function AppContent() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <AppRoutes />
                <ToastContainer
                    position="top-right"
                    autoClose={3500}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    transition={Slide}
                    icon={CustomToastIcon}
                    closeButton={CustomCloseButton}
                />
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
