import React, { useState } from 'react';
import { Code2 } from 'lucide-react';
import { resolveTechLogos } from '../utils/techLogos';

/**
 * Renders the official SVG technology logo (or compact horizontal cluster for multi-technology categories)
 * inside a container matching Hangbug's card icon badge style.
 *
 * Preserves dark-theme visibility via `darkInk` inversion and `lightBacking` contrast pills.
 */
export default function TechLogo({
    name,
    maxLogos = 6,
    className = '',
}) {
    const logos = resolveTechLogos(name).slice(0, maxLogos);
    const [failedIds, setFailedIds] = useState({});

    const visibleLogos = logos.filter((logo) => !failedIds[logo.id]);

    if (visibleLogos.length === 0) {
        return (
            <div
                className={`w-12 h-12 rounded-2xl bg-[#F4EFE6] dark:bg-[#222E29] border border-[var(--card-border)] flex items-center justify-center shadow-sm ${className}`}
                aria-hidden="true"
            >
                <Code2 className="w-6 h-6 text-[var(--foreground)] opacity-80" />
            </div>
        );
    }

    if (visibleLogos.length === 1) {
        const logo = visibleLogos[0];
        return (
            <div
                className={`w-12 h-12 rounded-2xl bg-[#F4EFE6] dark:bg-[#222E29] border border-[var(--card-border)] flex items-center justify-center shadow-sm overflow-hidden ${className}`}
                title={logo.label}
            >
                <span
                    className={
                        logo.lightBacking
                            ? 'w-8 h-8 rounded-full dark:bg-[#F3F6F4] flex items-center justify-center p-0.5'
                            : 'w-7 h-7 flex items-center justify-center'
                    }
                >
                    <img
                        src={logo.src}
                        alt={logo.label}
                        loading="eager"
                        decoding="async"
                        onError={() => setFailedIds((prev) => ({ ...prev, [logo.id]: true }))}
                        className={`w-full h-full object-contain select-none ${
                            logo.darkInk ? 'dark:invert dark:brightness-95' : ''
                        }`}
                    />
                </span>
            </div>
        );
    }

    // Compact horizontal cluster for combined technologies (2–6 logos)
    const iconSizeClass = visibleLogos.length <= 3 ? 'w-6 h-6' : 'w-5 h-5';
    const gapClass = visibleLogos.length <= 3 ? 'gap-1.5 px-2.5' : 'gap-1.5 px-2.5';

    return (
        <div
            className={`inline-flex h-12 max-w-full rounded-2xl bg-[#F4EFE6] dark:bg-[#222E29] border border-[var(--card-border)] items-center ${gapClass} shadow-sm overflow-hidden ${className}`}
            title={visibleLogos.map((l) => l.label).join(', ')}
        >
            {visibleLogos.map((logo) => (
                <span
                    key={logo.id}
                    className={`${iconSizeClass} shrink-0 flex items-center justify-center ${
                        logo.lightBacking ? 'rounded-full dark:bg-[#F3F6F4] p-0.5' : ''
                    }`}
                >
                    <img
                        src={logo.src}
                        alt={logo.label}
                        loading="eager"
                        decoding="async"
                        onError={() => setFailedIds((prev) => ({ ...prev, [logo.id]: true }))}
                        className={`w-full h-full object-contain select-none ${
                            logo.darkInk ? 'dark:invert dark:brightness-95' : ''
                        }`}
                    />
                </span>
            ))}
        </div>
    );
}
