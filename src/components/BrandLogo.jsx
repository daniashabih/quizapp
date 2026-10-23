import logoIcon from '../assets/branding/hangbug-icon.png';
import logoCompact from '../assets/branding/hangbug-logo-compact.png';
import logoCompactDark from '../assets/branding/hangbug-logo-compact-dark.png';
import logoFull from '../assets/branding/hangbug-logo-full.png';
import logoDark from '../assets/branding/hangbug-logo-dark.png';
import { useTheme } from '../context/ThemeContext';

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
    className = '',
    imgClassName = '',
}) {
    const { isDark } = useTheme();
    const effectiveDark = dark !== undefined ? dark : isDark;

    if (variant === 'mark') {
        const boxSize = MARK_SIZE_MAP[size] || MARK_SIZE_MAP.md;
        return (
            <div
                className={`inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 bg-white dark:bg-[var(--card-bg)] border border-[#184D3B]/20 dark:border-[var(--card-border)] shadow-xs p-1 ${boxSize} ${className}`}
            >
                <img
                    src={logoIcon}
                    alt="HangBug"
                    className={`w-full h-full object-contain select-none ${imgClassName}`}
                    draggable={false}
                />
            </div>
        );
    }

    if (variant === 'full') {
        const heightClass = FULL_HEIGHT_MAP[size] || FULL_HEIGHT_MAP.md;
        return (
            <div className={`inline-flex items-center shrink-0 ${className}`}>
                <img
                    src={effectiveDark ? logoDark : logoFull}
                    alt="HangBug — Learn · Test · Prove"
                    className={`${heightClass} w-auto object-contain select-none ${imgClassName}`}
                    draggable={false}
                />
            </div>
        );
    }

    // Default: 'compact' horizontal lockup for navbars, sidebars, headers, footers
    const heightClass = COMPACT_HEIGHT_MAP[size] || COMPACT_HEIGHT_MAP.md;
    return (
        <div className={`inline-flex items-center shrink-0 ${className}`}>
            <img
                src={effectiveDark ? logoCompactDark : logoCompact}
                alt="HangBug"
                className={`${heightClass} w-auto object-contain select-none ${imgClassName}`}
                draggable={false}
            />
        </div>
    );
}
