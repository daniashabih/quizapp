import { useEffect } from 'react';
import logoIcon from '../assets/branding/hangbug-icon.png';
import logoCompact from '../assets/branding/hangbug-logo-compact.png';
import logoCompactDark from '../assets/branding/hangbug-logo-compact-dark.png';
import logoFull from '../assets/branding/hangbug-logo-full.png';
import logoDark from '../assets/branding/hangbug-logo-dark.png';

let logosPreloaded = false;
const preloadedLogoImages = [];
function preloadAlternateBrandLogos() {
    if (logosPreloaded || typeof window === 'undefined' || typeof Image === 'undefined') return;
    logosPreloaded = true;
    [logoCompact, logoCompactDark, logoFull, logoDark].forEach((src) => {
        const img = new Image();
        img.decoding = 'sync';
        img.src = src;
        if (typeof img.decode === 'function') {
            img.decode().catch(() => {});
        }
        preloadedLogoImages.push(img);
    });
}

const MARK_SIZE_MAP = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
};

const COMPACT_HEIGHT_MAP = {
    xs: 'h-6',
    sm: 'h-7',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12',
};

const FULL_HEIGHT_MAP = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-20',
    xl: 'h-24',
};

export default function BrandLogo({
    variant = 'compact', // 'mark' | 'compact' | 'full'
    size = 'md',
    dark,
    loading = 'eager',
    fetchPriority,
    className = '',
    imgClassName = '',
}) {
    const priorityProps = fetchPriority ? { fetchPriority } : {};

    useEffect(() => {
        preloadAlternateBrandLogos();
    }, []);

    if (variant === 'mark') {
        const boxSize = MARK_SIZE_MAP[size] || MARK_SIZE_MAP.md;
        return (
            <div
                className={`inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 bg-white dark:bg-[var(--card-bg)] border border-[#184D3B]/20 dark:border-[var(--card-border)] shadow-xs p-1 ${boxSize} ${className}`}
            >
                <img
                    src={logoIcon}
                    alt="HangBug developer platform logo icon"
                    width={512}
                    height={512}
                    loading={loading}
                    decoding="async"
                    {...priorityProps}
                    className={`w-full h-full object-contain select-none ${imgClassName}`}
                    draggable={false}
                />
            </div>
        );
    }

    if (variant === 'full') {
        const heightClass = FULL_HEIGHT_MAP[size] || FULL_HEIGHT_MAP.md;
        if (dark === undefined) {
            return (
                <div className={`inline-flex items-center shrink-0 ${className}`}>
                    <img
                        src={logoFull}
                        alt="HangBug — Learn · Test · Prove"
                        width={1024}
                        height={1024}
                        loading={loading}
                        decoding="sync"
                        {...priorityProps}
                        className={`${heightClass} w-auto object-contain select-none block dark:hidden ${imgClassName}`}
                        draggable={false}
                    />
                    <img
                        src={logoDark}
                        alt="HangBug — Learn · Test · Prove"
                        width={1024}
                        height={1024}
                        loading="eager"
                        decoding="sync"
                        className={`${heightClass} w-auto object-contain select-none hidden dark:block ${imgClassName}`}
                        draggable={false}
                    />
                </div>
            );
        }
        return (
            <div className={`inline-flex items-center shrink-0 ${className}`}>
                <img
                    src={dark ? logoDark : logoFull}
                    alt="HangBug — Learn · Test · Prove"
                    width={1024}
                    height={1024}
                    loading={loading}
                    decoding="async"
                    {...priorityProps}
                    className={`${heightClass} w-auto object-contain select-none ${imgClassName}`}
                    draggable={false}
                />
            </div>
        );
    }

    // Default: 'compact' horizontal lockup for navbars, sidebars, headers, footers
    const heightClass = COMPACT_HEIGHT_MAP[size] || COMPACT_HEIGHT_MAP.md;
    if (dark === undefined) {
        return (
            <div className={`inline-flex items-center shrink-0 ${className}`}>
                <img
                    src={logoCompact}
                    alt="HangBug developer platform logo"
                    width={615}
                    height={212}
                    loading={loading}
                    decoding="sync"
                    {...priorityProps}
                    className={`${heightClass} w-auto object-contain select-none block dark:hidden ${imgClassName}`}
                    draggable={false}
                />
                <img
                    src={logoCompactDark}
                    alt="HangBug developer platform logo"
                    width={615}
                    height={212}
                    loading="eager"
                    decoding="sync"
                    className={`${heightClass} w-auto object-contain select-none hidden dark:block ${imgClassName}`}
                    draggable={false}
                />
            </div>
        );
    }
    return (
        <div className={`inline-flex items-center shrink-0 ${className}`}>
            <img
                src={dark ? logoCompactDark : logoCompact}
                alt="HangBug developer platform logo"
                width={615}
                height={212}
                loading={loading}
                decoding="async"
                {...priorityProps}
                className={`${heightClass} w-auto object-contain select-none ${imgClassName}`}
                draggable={false}
            />
        </div>
    );
}
