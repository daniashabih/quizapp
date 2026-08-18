// Tailwind v4 uses @theme in CSS — this file is for IDE tooling / v3 compat
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Poppins', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            colors: {
                background: '#FCFAF4',
                primary: {
                    DEFAULT: '#193D35',
                    hover: '#122C26',
                    light: '#25544A',
                },
                secondary: {
                    DEFAULT: '#42665B',
                    hover: '#36544B',
                },
                accent: {
                    DEFAULT: '#D19A45',
                    hover: '#BC8838',
                    light: '#F3E5C5',
                },
                'light-accent': '#F3E5C5',
                'brand-text': '#252C28',
                muted: '#7A807B',
                success: '#67966D',
                error: '#C96155',
            },
        },
    },
    plugins: [],
};
