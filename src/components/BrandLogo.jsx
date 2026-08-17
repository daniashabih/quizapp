import { Bug } from 'lucide-react';
import logo from '../assets/logo.png';

const inlineSizes = {
    sm: {
        mark: 'w-8 h-8 p-1',
        text: 'text-lg',
    },
    md: {
        mark: 'w-10 h-10 p-1.5',
        text: 'text-xl',
    },
    lg: {
        mark: 'w-12 h-12 p-2',
        text: 'text-2xl',
    },
    xl: {
        mark: 'w-16 h-16 p-2',
        text: 'text-3xl',
    },
};

const scriptSizes = {
    sm: 'w-36 h-24',
    md: 'w-56 h-44',
    lg: 'w-80 h-64',
};

export default function BrandLogo({
    variant = 'inline',
    size = 'md',
    className = '',
    textClassName = '',
}) {
    if (variant === 'script') {
        return (
            <img
                src={logo}
                alt="HangBug"
                className={`${scriptSizes[size] || scriptSizes.md} object-contain ${className}`}
            />
        );
    }

    if (variant === 'mark') {
        const markSize = inlineSizes[size]?.mark || inlineSizes.md.mark;

        return (
            <span className={`${markSize} inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-white border border-[var(--accent)] shadow-xs ${className}`}>
                <Bug className="h-full w-full text-white p-0.5" />
            </span>
        );
    }

    const styles = inlineSizes[size] || inlineSizes.md;

    return (
        <span className={`inline-flex items-center gap-3 ${className}`}>
            <span className={`${styles.mark} inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-white border border-[var(--accent)] shadow-xs`}>
                <Bug className="h-full w-full text-white p-0.5" />
            </span>
            <span className={`${styles.text} font-display font-bold tracking-tight text-[var(--foreground)] ${textClassName}`}>
                Hang<span className="text-[#D6A85F] font-extrabold">Bug</span>
            </span>
        </span>
    );
}
