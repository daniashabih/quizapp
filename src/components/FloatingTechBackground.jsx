import { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';

const TECH_LOGOS = [
    {
        id: 'html5',
        name: 'HTML5',
        color: '#E44D26',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M1.5 0h21l-1.91 21.563L11.97 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.926-.802-.189-2.097H6.258l.373 4.156 5.337 1.482 5.343-1.482.728-7.857H8.531z" />
            </svg>
        )
    },
    {
        id: 'css3',
        name: 'CSS3',
        color: '#1572B6',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M1.5 0h21l-1.91 21.563L11.97 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.926-.802-.189-2.097H6.258l.373 4.156 5.337 1.482 5.343-1.482.728-7.857H8.531z" />
            </svg>
        )
    },
    {
        id: 'javascript',
        name: 'JavaScript',
        color: '#F7DF1E',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M3 3h18v18H3V3zm11.23 13.91c0-1.63 1.05-2.28 2.5-2.81 1.25-.46 1.76-.81 1.76-1.52 0-.68-.53-1.12-1.42-1.12-1.15 0-1.68.61-1.98 1.42l-1.66-.99c.64-1.46 1.99-2.12 3.68-2.12 2.1 0 3.39 1.13 3.39 2.82 0 1.67-.99 2.37-2.44 2.89-1.28.47-1.78.86-1.78 1.54 0 .73.61 1.17 1.57 1.17 1.25 0 1.88-.67 2.19-1.53l1.64 1.01c-.67 1.58-2.06 2.22-3.88 2.22-2.29 0-3.57-1.29-3.57-2.98zm-6.23 0c0-1.63 1.05-2.28 2.5-2.81 1.25-.46 1.76-.81 1.76-1.52 0-.68-.53-1.12-1.42-1.12-1.15 0-1.68.61-1.98 1.42l-1.66-.99c.64-1.46 1.99-2.12 3.68-2.12 2.1 0 3.39 1.13 3.39 2.82 0 1.67-.99 2.37-2.44 2.89-1.28.47-1.78.86-1.78 1.54 0 .73.61 1.17 1.57 1.17 1.25 0 1.88-.67 2.19-1.53l1.64 1.01c-.67 1.58-2.06 2.22-3.88 2.22-2.29 0-3.57-1.29-3.57-2.98z" />
            </svg>
        )
    },
    {
        id: 'react',
        name: 'React',
        color: '#61DAFB',
        svg: (
            <svg viewBox="-11.5 -10.23174 23 20.46348" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
                <circle cx="0" cy="0" r="2.05" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1" fill="none">
                    <ellipse rx="11" ry="4.2" />
                    <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                    <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                </g>
            </svg>
        )
    },
    {
        id: 'nodejs',
        name: 'Node.js',
        color: '#339933',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 1.847a1.69 1.69 0 0 0-.845.228L2.69 6.98A1.69 1.69 0 0 0 1.845 8.442v9.822a1.69 1.69 0 0 0 .845 1.464l8.465 4.906a1.69 1.69 0 0 0 1.69 0l8.465-4.906a1.69 1.69 0 0 0 .845-1.464V8.442a1.69 1.69 0 0 0-.845-1.463L12.845 2.075A1.69 1.69 0 0 0 12 1.847zm0 2.451l6.987 4.049-2.735 1.585-4.252-2.463V3.882a1.05 1.05 0 0 0 0 .416zm-1.05.416v3.587L6.698 10.8 3.963 9.215 10.95 4.714zM3.095 10.72l3.603 2.088V16.98L3.095 14.862V10.72zm8.905 10.398l-6.987-4.049 2.735-1.585 4.252 2.463v3.587a1.05 1.05 0 0 0 0-.416zm1.05-.416v-3.587l4.252-2.463 2.735 1.585-6.987 4.465zm7.855-6.007l-3.603-2.088V8.844l3.603 2.118v4.14z" />
            </svg>
        )
    },
    {
        id: 'python',
        name: 'Python',
        color: '#3776AB',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M11.926 0C5.64 0 6.027 2.74 6.027 2.74l.006 2.839h6.012v.852H3.59S0 6.027 0 12.338c0 6.313 3.12 6.07 3.12 6.07h1.86v-2.628s-.1-3.136 3.08-3.136h5.3c.001 0 2.923.045 2.923-2.825V3.12S16.712 0 11.926 0zM8.91 1.765c.535 0 .97.435.97.97 0 .536-.435.97-.97.97a.972.972 0 0 1-.97-.97c0-.535.435-.97.97-.97zm3.164 20.47c6.286 0 5.899-2.74 5.899-2.74l-.006-2.839h-6.012v-.852h8.452s3.59.404 3.59-5.907c0-6.313-3.12-6.07-3.12-6.07h-1.86v2.628s.1 3.136-3.08 3.136h-5.3c-.001 0-2.923-.045-2.923 2.825v6.702s-.428 3.12 4.358 3.12zm3.016-1.765a.972.972 0 0 1-.97-.97c0-.535.435-.97.97-.97.535 0 .97.435.97.97 0 .536-.435.97-.97.97z" />
            </svg>
        )
    },
    {
        id: 'typescript',
        name: 'TypeScript',
        color: '#3178C6',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M1.5 0h21A1.5 1.5 0 0 1 24 1.5v21a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 0 22.5v-21A1.5 1.5 0 0 1 1.5 0zm10.785 14.288h2.091v-1.637h-2.091V8.625h-2.227v4.026H8.032v1.637h2.026v3.136c0 1.255.382 2.127 1.145 2.618.764.491 1.827.6 3.191.327v-1.745c-.682.082-1.186.068-1.514-.041-.327-.109-.505-.382-.532-.818v-3.486zm7.268.041c-.464-.327-1.145-.573-2.045-.736l-.927-.191c-.491-.109-.845-.232-1.064-.368-.218-.136-.327-.341-.327-.614 0-.273.123-.505.368-.695.245-.191.6-.286 1.064-.286.436 0 .818.109 1.145.327.327.218.532.518.614.9h2.155c-.082-.845-.464-1.527-1.145-2.045-.682-.518-1.595-.777-2.741-.777-1.173 0-2.114.286-2.823.859-.709.573-1.064 1.35-1.064 2.332 0 .818.259 1.459.777 1.923.518.464 1.295.805 2.332 1.023l.845.191c.6.136 1.036.286 1.309.45.273.164.409.409.409.736 0 .327-.15.586-.45.777-.3.191-.736.286-1.309.286-.573 0-1.064-.136-1.473-.409-.409-.273-.655-.682-.736-1.227h-2.182c.082.982.505 1.773 1.268 2.373.764.6 1.8.9 3.109.9 1.309 0 2.332-.3 3.068-.9.736-.6 1.105-1.418 1.105-2.455 0-.873-.286-1.555-.859-2.045z" />
            </svg>
        )
    },
    {
        id: 'tailwindcss',
        name: 'Tailwind CSS',
        color: '#06B6D4',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
            </svg>
        )
    },
    {
        id: 'git',
        name: 'Git',
        color: '#F05032',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72 1.05 1.77.72 2.62l2.68 2.68c.604.604.604 1.58 0 2.185l-1.127 1.127c-.604.604-1.58.604-2.185 0l-10.48-10.48c-.603-.604-.603-1.582 0-2.188l2.169-2.168L7.158 1.81.452 8.517c-.603.604-.603 1.582 0 2.188l10.48 10.48c.604.604 1.582.604 2.188 0l10.426-10.255c.604-.604.604-1.582 0-2.188zM15.4 17.5a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm-1.8-8.8a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm-4.9.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z" />
            </svg>
        )
    },
    {
        id: 'docker',
        name: 'Docker',
        color: '#2496ED',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185zm-2.954 0h2.119a.186.186 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186h-2.119a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185zm-2.954 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H8.075a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185zm-2.955 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H5.12a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185zm0-2.955h2.119a.185.185 0 0 0 .185-.185V6.05a.185.185 0 0 0-.185-.186H5.12a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185zm2.955 0h2.119a.185.185 0 0 0 .185-.185V6.05a.185.185 0 0 0-.185-.186H8.075a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185zm2.954 0h2.119a.186.186 0 0 0 .185-.185V6.05a.185.185 0 0 0-.185-.186h-2.119a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185zm2.954 0h2.119a.186.186 0 0 0 .186-.185V6.05a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185zm2.955 0h2.119a.186.186 0 0 0 .185-.185V6.05a.185.185 0 0 0-.185-.186h-2.119a.185.185 0 0 0-.185.186v1.887c0 .102.083.185.185.185zM.003 12.392c0 2.219.78 4.093 2.342 5.621 1.562 1.528 3.491 2.292 5.787 2.292h7.625c2.3 0 4.229-.764 5.787-2.292 1.558-1.528 2.338-3.402 2.338-5.621 0-.324-.017-.638-.052-.942-.034-.304-.1-.6-.197-.888a7.03 7.03 0 0 0-.441-.951 6.368 6.368 0 0 0-.756-1.02 6.138 6.138 0 0 0-1.125-.972c-.443-.3-.93-.538-1.46-.714a9.14 9.14 0 0 0-1.842-.396 11.58 11.58 0 0 0-2.122-.093H.003v5.997z" />
            </svg>
        )
    },
    {
        id: 'graphql',
        name: 'GraphQL',
        color: '#E535AB',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 2L2 7.773v11.547L12 25l10-5.68V7.773L12 2zm8 16.27L12 22.82l-8-4.55V8.82l8-4.55 8 4.55v9.45zM12 7.07l-4.5 2.56v5.12L12 17.31l4.5-2.56V9.63L12 7.07z" />
            </svg>
        )
    },
    {
        id: 'mongodb',
        name: 'MongoDB',
        color: '#47A248',
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 0s-6 7.333-6 12.333c0 5 4 8.667 6 11.667 2-3 6-6.667 6-11.667C18 7.333 12 0 12 0zm0 21.3a10.96 10.96 0 0 1-3.6-6.7c-.5-2.9.2-5.7 1.3-8.2 1-2.2 2.3-4.3 2.3-4.3s1.3 2.1 2.3 4.3c1.1 2.5 1.8 5.3 1.3 8.2a10.96 10.96 0 0 1-3.6 6.7z" />
            </svg>
        )
    }
];

export default function FloatingTechBackground({
    count = 14,
    opacity = 0.2,
    speed = 1,
    interactive = false,
    className = 'absolute inset-0 pointer-events-none overflow-hidden'
}) {
    // Generate deterministic positioning and variation parameters for continuous floating
    const floatItems = useMemo(() => {
        const positions = [
            { x: 8, y: 12, size: 48, rotSpeed: 25, floatDist: 22, duration: 9 },
            { x: 82, y: 15, size: 56, rotSpeed: -30, floatDist: 28, duration: 11 },
            { x: 22, y: 42, size: 42, rotSpeed: 18, floatDist: 18, duration: 8 },
            { x: 74, y: 48, size: 52, rotSpeed: -22, floatDist: 25, duration: 10 },
            { x: 12, y: 78, size: 50, rotSpeed: 20, floatDist: 20, duration: 9.5 },
            { x: 88, y: 80, size: 44, rotSpeed: -28, floatDist: 24, duration: 12 },
            { x: 48, y: 8, size: 60, rotSpeed: 15, floatDist: 30, duration: 13 },
            { x: 38, y: 85, size: 46, rotSpeed: -16, floatDist: 18, duration: 8.5 },
            { x: 62, y: 28, size: 38, rotSpeed: 32, floatDist: 22, duration: 10.5 },
            { x: 28, y: 65, size: 54, rotSpeed: -20, floatDist: 26, duration: 11.5 },
            { x: 92, y: 45, size: 40, rotSpeed: 24, floatDist: 16, duration: 7.5 },
            { x: 5, y: 48, size: 52, rotSpeed: -26, floatDist: 24, duration: 10 },
            { x: 55, y: 62, size: 44, rotSpeed: 22, floatDist: 20, duration: 9 },
            { x: 70, y: 82, size: 48, rotSpeed: -18, floatDist: 22, duration: 11 }
        ];

        return Array.from({ length: Math.min(count, positions.length) }).map((_, index) => {
            const logo = TECH_LOGOS[index % TECH_LOGOS.length];
            const pos = positions[index];
            const actualDuration = (pos.duration / Math.max(0.2, speed));

            return {
                id: `${logo.id}-${index}`,
                logo,
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                size: pos.size,
                rotSpeed: pos.rotSpeed,
                floatDist: pos.floatDist,
                duration: actualDuration
            };
        });
    }, [count, speed]);

    return (
        <div className={className} aria-hidden="true">
            {floatItems.map((item) => (
                <motion.div
                    key={item.id}
                    className="absolute flex items-center justify-center select-none"
                    style={{
                        left: item.left,
                        top: item.top,
                        width: `${item.size}px`,
                        height: `${item.size}px`,
                        opacity: opacity,
                        color: item.logo.color
                    }}
                    initial={{ y: 0, rotate: 0, scale: 0.9 }}
                    animate={{
                        y: [-item.floatDist, item.floatDist, -item.floatDist],
                        x: [-item.floatDist / 2, item.floatDist / 2, -item.floatDist / 2],
                        rotate: [0, item.rotSpeed, -item.rotSpeed / 2, 0],
                        scale: [0.95, 1.05, 0.95]
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    whileHover={interactive ? {
                        opacity: 0.9,
                        scale: 1.25,
                        rotate: 15,
                        transition: { duration: 0.2 }
                    } : undefined}
                >
                    <div className="w-full h-full p-2 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs border border-gray-200/30 dark:border-slate-700/30 shadow-xs flex items-center justify-center transition-all">
                        {item.logo.svg}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
