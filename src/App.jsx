import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/custom-toast.css';
import { CustomToastIcon, CustomCloseButton } from "./components/CustomToast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import SplashScreen from "./components/SplashScreen";

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

function AppContent() {

    return (
        <AuthProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/technologies" element={<Technologies />} />
                <Route path="/technologies/level" element={<Navigate to="/technologies" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/certificate/view" element={<CertificateView />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />

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
                    <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                </Route>
            </Routes>
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
        </AuthProvider>
    );
}

function App() {
    const [splashDone, setSplashDone] = useState(false);

    return (
        <ThemeProvider>
            {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
            {splashDone && <AppContent />}
        </ThemeProvider>
    );
}

export default App;
