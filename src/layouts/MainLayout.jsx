import { useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { ACTIVITY_HEARTBEAT_INTERVAL_MS, getVisitorId } from "../utils/activityPresence";

export default function MainLayout() {
    useEffect(() => {
        const visitorId = getVisitorId();

        const sendHeartbeat = async () => {
            try {
                await axios.post('/activity/heartbeat', { visitorId });
            } catch {
                // Presence updates are best-effort and should stay invisible to users.
            }
        };

        sendHeartbeat();
        const intervalId = window.setInterval(sendHeartbeat, ACTIVITY_HEARTBEAT_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[var(--page-bg)] flex flex-col font-sans transition-colors duration-300 relative overflow-x-clip">
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-22 sm:pt-28 pb-12 sm:pb-16 relative z-10 min-w-0">
                <Outlet />
            </main>

            <footer className="relative z-10 border-t border-[var(--card-border)] bg-[var(--muted-bg)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] font-medium">
                        © 2026 HangBug Platform. All rights reserved.
                    </p>
                    <p className="text-sm text-[var(--foreground-muted)] italic hidden sm:block">
                        "Talk is cheap. Show me the code." — Linus Torvalds
                    </p>
                </div>
            </footer>
        </div>
    );
}
