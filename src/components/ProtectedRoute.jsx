import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Route protection wrapper component
 * @param {{ adminOnly?: boolean, children?: React.ReactNode }} props
 */
export default function ProtectedRoute({ adminOnly = false, children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--page-bg)] flex flex-col items-center justify-center p-4">
                <Loader2 size={36} className="animate-spin text-[#193D35] dark:text-emerald-400 mb-3" />
                <p className="text-xs font-semibold text-[var(--foreground-muted)] tracking-wider uppercase">
                    Verifying session...
                </p>
            </div>
        );
    }

    if (!user) {
        // Redirect to login preserving destination route
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const isAdmin = String(user.role || '').toLowerCase() === 'admin';
    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children ? children : <Outlet />;
}
