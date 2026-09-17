import React from 'react';

// ChatGPT / OpenAI Icon
export function ChatGptIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#10A37F" />
            <path
                d="M18.2 10.4a3.8 3.8 0 0 0-.3-2.6 3.9 3.9 0 0 0-3.3-1.9 3.5 3.5 0 0 0-1.1.2 3.8 3.8 0 0 0-2.8-1.3 3.9 3.9 0 0 0-3.7 2.7 3.8 3.8 0 0 0-2.2 1.6 3.9 3.9 0 0 0 .5 4.6 3.8 3.8 0 0 0 .3 2.6 3.9 3.9 0 0 0 3.3 1.9c.4 0 .8 0 1.1-.2a3.8 3.8 0 0 0 2.8 1.3 3.9 3.9 0 0 0 3.7-2.7 3.8 3.8 0 0 0 2.2-1.6 3.9 3.9 0 0 0-.5-4.6ZM12 16.7a4.7 4.7 0 0 1-1-.1v-2.3l2.3-1.3a.6.6 0 0 0 .3-.5v-3.2l1.9 1.1a2.6 2.6 0 0 1 1.3 2.6 2.6 2.6 0 0 1-2.4 2.4l-2.4 1.3Zm-4.9-2.5a2.6 2.6 0 0 1-.3-2.9 2.6 2.6 0 0 1 2-1.4l1.9.1v2.6a.6.6 0 0 0 .3.5l2.7 1.6-1.9 1.1a2.6 2.6 0 0 1-2.9 0l-1.8-1.6Zm-1-5a2.6 2.6 0 0 1 1.6-2.5 2.6 2.6 0 0 1 2.8.5l1.9 1.1-2.3 1.3a.6.6 0 0 0-.3.5v3.2l-1.9-1.1a2.6 2.6 0 0 1-1.8-3.1v-.1Zm6.9 2.2-2.3-1.3 2.3-1.3 2.3 1.3-2.3 1.3Zm3.9-1.1-1.9-1.1a2.6 2.6 0 0 1 2.9 0l1.8 1.6a2.6 2.6 0 0 1 .3 2.9 2.6 2.6 0 0 1-2 1.4l-1.9-.1v-2.6a.6.6 0 0 0-.3-.5l-2.7-1.6 1.9-1.1a2.6 2.6 0 0 1 1.9 0Zm1 5a2.6 2.6 0 0 1-1.6 2.5 2.6 2.6 0 0 1-2.8-.5l-1.9-1.1 2.3-1.3a.6.6 0 0 0 .3-.5v-3.2l1.9 1.1a2.6 2.6 0 0 1 1.8 3.1Z"
                fill="#FFFFFF"
            />
        </svg>
    );
}

// Google AI Overview Icon (Google G Logo with clean styling)
export function GoogleAiOverviewIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.8" />
            <path
                d="M17.64 12.2c0-.63-.06-1.25-.16-1.84H12v3.49h3.19a2.74 2.74 0 0 1-1.18 1.8v1.5h1.91c1.12-1.03 1.72-2.56 1.72-4.95Z"
                fill="#4285F4"
            />
            <path
                d="M12 18c1.62 0 2.98-.54 3.97-1.46l-1.91-1.5c-.54.36-1.23.58-2.06.58-1.58 0-2.92-1.07-3.4-2.51H6.62v1.55A5.99 5.99 0 0 0 12 18Z"
                fill="#34A853"
            />
            <path
                d="M8.6 13.11a3.6 3.6 0 0 1 0-2.22V9.34H6.62a6.01 6.01 0 0 0 0 5.32l1.98-1.55Z"
                fill="#FBBC05"
            />
            <path
                d="M12 8.38c.88 0 1.67.3 2.3.9l1.72-1.72C14.98 6.54 13.62 6 12 6a5.99 5.99 0 0 0-5.38 3.34l1.98 1.55c.48-1.44 1.82-2.51 3.4-2.51Z"
                fill="#EA4335"
            />
        </svg>
    );
}

// Google AI Mode Icon (Google Search with Sparkle / AI Mode)
export function GoogleAiModeIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="0.8" />
            <path
                d="M12 5.5L13.4 9.6L17.5 11L13.4 12.4L12 16.5L10.6 12.4L6.5 11L10.6 9.6L12 5.5Z"
                fill="url(#aiModeGrad)"
            />
            <circle cx="16.5" cy="7.5" r="1.5" fill="#4285F4" />
            <circle cx="7.5" cy="15.5" r="1.2" fill="#34A853" />
            <defs>
                <linearGradient id="aiModeGrad" x1="6.5" y1="5.5" x2="17.5" y2="16.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4285F4" />
                    <stop offset="0.5" stopColor="#A855F7" />
                    <stop offset="1" stopColor="#EA4335" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// Google Gemini Multicolor Icon
export function GoogleGeminiIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#FAF5FF" stroke="#F3E8FF" strokeWidth="0.8" />
            <path
                d="M12 4C12 8.418 8.418 12 4 12C8.418 12 12 15.582 12 20C12 15.582 15.582 12 20 12C15.582 12 12 8.418 12 4Z"
                fill="url(#geminiGrad)"
            />
            <defs>
                <linearGradient id="geminiGrad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1E88E5" />
                    <stop offset="0.3" stopColor="#7E57C2" />
                    <stop offset="0.7" stopColor="#AB47BC" />
                    <stop offset="1" stopColor="#EC407A" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// US Flag SVG (Crisp display across all operating systems)
export function FlagUsIcon({ className = "w-4 h-3" }) {
    return (
        <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
            <g fillRule="evenodd">
                <path fill="#bd3d44" d="M0 0h640v480H0" />
                <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 277h640M0 350.8h640M0 424.6h640" />
                <path fill="#192f5d" d="M0 0h256v258.5H0z" />
                <circle cx="128" cy="129" r="60" fill="#fff" opacity="0.15" />
                <path fill="#fff" d="m30 20 5 15h16l-13 9 5 15-13-10-13 10 5-15-13-9h16zm60 0 5 15h16l-13 9 5 15-13-10-13 10 5-15-13-9h16zm60 0 5 15h16l-13 9 5 15-13-10-13 10 5-15-13-9h16zm60 0 5 15h16l-13 9 5 15-13-10-13 10 5-15-13-9h16z" transform="scale(0.8) translate(10, 10)" opacity="0.9" />
            </g>
        </svg>
    );
}

// Pakistan Flag SVG (Crisp display across all operating systems)
export function FlagPkIcon({ className = "w-4 h-3" }) {
    return (
        <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
            <g fillRule="evenodd">
                <path fill="#01411C" d="M0 0h640v480H0z" />
                <path fill="#fff" d="M0 0h160v480H0z" />
                <circle cx="400" cy="240" r="110" fill="#fff" />
                <circle cx="430" cy="220" r="100" fill="#01411C" />
                <polygon
                    fill="#fff"
                    points="420,165 427,185 448,185 431,198 438,218 420,205 402,218 409,198 392,185 413,185"
                />
            </g>
        </svg>
    );
}
