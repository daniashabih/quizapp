import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

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
                <Loader2 size={36} className="animate-spin text-[#193D35] mb-3" />
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

    if (adminOnly && user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-[var(--page-bg)] flex flex-col items-center justify-center p-4 text-center">
                <ShieldAlert size={48} className="text-[#C96155] mb-4 animate-bounce" />
                <h1 className="text-xl font-display font-bold text-[var(--foreground)] mb-2">
                    Access Denied
                </h1>
                <p className="text-xs text-[var(--foreground-muted)] max-w-sm mb-6">
                    You do not have administrator permissions to access this area.
                </p>
                <Navigate to="/dashboard" replace />
            </div>
        );
    }

    return children ? children : <Outlet />;
}
