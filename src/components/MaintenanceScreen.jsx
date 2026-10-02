import React from 'react';
import BrandLogo from './BrandLogo';
import { Wrench, RefreshCw, AlertCircle } from 'lucide-react';

export default function MaintenanceScreen({ message, onRefresh }) {
    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full card p-8 sm:p-10 rounded-3xl border border-[var(--card-border)] shadow-xl space-y-6">
                <div className="mx-auto flex justify-center">
                    <BrandLogo variant="full" size="lg" />
                </div>

                <div className="w-16 h-16 rounded-2xl bg-[#F3E5C5] text-[#193D35] flex items-center justify-center mx-auto shadow-inner">
                    <Wrench size={32} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">
                        Scheduled Maintenance
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                        {message || "HangBug is undergoing scheduled upgrades and maintenance. We'll be back online momentarily!"}
                    </p>
                </div>

                <div className="pt-2">
                    <button
                        onClick={onRefresh}
                        className="btn-primary w-full justify-center text-xs py-3 flex items-center gap-2"
                    >
                        <RefreshCw size={15} /> Check System Status
                    </button>
                </div>

                <p className="text-[11px] text-[var(--foreground-muted)]">
                    Need immediate assistance? Contact <span className="font-semibold text-[var(--foreground)]">support@hangbug.com</span>
                </p>
            </div>
        </div>
    );
}
