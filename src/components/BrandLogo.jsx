import React from 'react';
import logoCompact from '../assets/branding/hangbug-logo-compact.png';
import logoCompactDark from '../assets/branding/hangbug-logo-compact-dark.png';
import logoFull from '../assets/branding/hangbug-logo-transparent.png';
import logoFullDark from '../assets/branding/hangbug-logo-dark.png';
import iconOnly from '../assets/branding/hangbug-icon.png';

const markSizes = {
    sm: 'w-8 h-8 p-1',
    md: 'w-10 h-10 p-1.5',
    lg: 'w-14 h-14 p-2',
    xl: 'w-20 h-20 p-2.5',
};

const fullSizes = {
    sm: 'h-16',
    md: 'h-24',
    lg: 'h-36',
    xl: 'h-48',
};

const compactSizes = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
    xl: 'h-14',
};

export default function BrandLogo({
    variant = 'inline',
    size = 'md',
    dark = false,
    className = '',
    textClassName = '',
    alt = 'HangBug',
}) {
    if (variant === 'full') {
        const fullSrc = dark ? logoFullDark : logoFull;
        const heightClass = fullSizes[size] || fullSizes.md;
        return (
            <img
                src={fullSrc}
                alt={alt}
                className={`${heightClass} w-auto object-contain ${className}`}
            />
        );
    }

    if (variant === 'mark' || variant === 'icon') {
        const markSize = markSizes[size] || markSizes.md;
        return (
            <span className={`${markSize} inline-flex shrink-0 items-center justify-center rounded-xl bg-white border border-[#184D3B]/20 shadow-xs ${className}`}>
                <img
                    src={iconOnly}
                    alt={alt}
                    className="h-full w-full object-contain"
                />
            </span>
        );
    }

    if (variant === 'script') {
        const fullSrc = dark ? logoFullDark : logoFull;
        const heightClass = fullSizes[size] || fullSizes.md;
        return (
            <img
                src={fullSrc}
                alt={alt}
                className={`${heightClass} w-auto object-contain ${className}`}
            />
        );
    }

    // Default: 'inline' or 'compact' horizontal brand lockup
    const compactSrc = dark ? logoCompactDark : logoCompact;
    const heightClass = compactSizes[size] || compactSizes.md;

    return (
        <span className={`inline-flex items-center shrink-0 ${className}`}>
            <img
                src={compactSrc}
                alt={alt}
                className={`${heightClass} w-auto object-contain`}
            />
        </span>
    );
}
