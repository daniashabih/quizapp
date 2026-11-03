import React from 'react';
import {
    Code2,
    FileCode,
    Layout,
    Server,
    Database,
    Smartphone,
    Cpu,
    Globe,
    Layers,
    Binary,
    Box,
    Network,
    Terminal,
    Sparkles,
    Flame,
    Zap,
    Palette,
    Compass,
    Bot,
    Atom,
    Boxes
} from 'lucide-react';

export const TechIcon = ({ slug, className = 'w-5 h-5', style }) => {
    const clean = String(slug || '').toLowerCase();

    switch (clean) {
        case 'html':
            return <Code2 className={className} style={{ color: '#E34F26', ...style }} />;
        case 'css':
            return <Palette className={className} style={{ color: '#1572B6', ...style }} />;
        case 'javascript':
            return <FileCode className={className} style={{ color: '#F7DF1E', ...style }} />;
        case 'bootstrap':
            return <Layout className={className} style={{ color: '#7952B3', ...style }} />;
        case 'jquery':
            return <Code2 className={className} style={{ color: '#0769AD', ...style }} />;
        case 'react':
            return <Atom className={className} style={{ color: '#61DAFB', ...style }} />;
        case 'php':
            return <Server className={className} style={{ color: '#777BB4', ...style }} />;
        case 'laravel':
            return <Flame className={className} style={{ color: '#FF2D20', ...style }} />;
        case 'nodejs':
            return <Server className={className} style={{ color: '#339933', ...style }} />;
        case 'express':
            return <Zap className={className} style={{ color: '#68A063', ...style }} />;
        case 'python':
            return <Terminal className={className} style={{ color: '#3776AB', ...style }} />;
        case 'mysql':
            return <Database className={className} style={{ color: '#4479A1', ...style }} />;
        case 'mongodb':
            return <Database className={className} style={{ color: '#47A248', ...style }} />;
        case 'sql':
            return <Database className={className} style={{ color: '#00758F', ...style }} />;
        case 'flutter':
            return <Smartphone className={className} style={{ color: '#02569B', ...style }} />;
        case 'dart':
            return <Sparkles className={className} style={{ color: '#0175C2', ...style }} />;
        case 'android-development':
            return <Bot className={className} style={{ color: '#3DDC84', ...style }} />;
        case 'programming-logic':
            return <Binary className={className} style={{ color: '#8B5CF6', ...style }} />;
        case 'oop':
            return <Boxes className={className} style={{ color: '#EC4899', ...style }} />;
        case 'dsa':
            return <Network className={className} style={{ color: '#F97316', ...style }} />;
        case 'html-css':
            return <Palette className={className} style={{ color: '#E44D26', ...style }} />;
        case 'full-stack':
            return <Layers className={className} style={{ color: '#10B981', ...style }} />;
        case 'web-fundamentals':
            return <Compass className={className} style={{ color: '#06B6D4', ...style }} />;
        case 'csharp':
        case 'c#':
            return (
                <svg
                    viewBox="0 0 128 128"
                    className={className}
                    style={style}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="C# logo"
                >
                    <path
                        d="M116.27 33.77L67.73 5.74a7.48 7.48 0 00-7.46 0L11.73 33.77A7.48 7.48 0 008 40.24v56.06a7.48 7.48 0 003.73 6.47l48.54 28.03a7.48 7.48 0 007.46 0l48.54-28.03a7.48 7.48 0 003.73-6.47V40.24a7.48 7.48 0 00-3.73-6.47z"
                        fill="#9B4993"
                    />
                    <path
                        d="M62 26c-20.99 0-38 17.01-38 38s17.01 38 38 38c14.28 0 26.7-7.89 33.15-19.53l-13.68-6.28C77.89 83.1 70.47 87.5 62 87.5c-12.98 0-23.5-10.52-23.5-23.5S49.02 40.5 62 40.5c8.47 0 15.89 4.4 19.47 11.31l13.68-6.28C88.7 33.89 76.28 26 62 26z"
                        fill="#FFFFFF"
                    />
                    <path
                        d="M87.5 49h4.5v10.5h10.5v4.5H92v8h10.5v4.5H92V87h-4.5V76h-8v11H75V76h-6v-4.5h6v-8h-6V59h6V49h4.5v10h8V49zm-8 14.5h-8v8h8v-8zm12.5 0h-8v8h8v-8z"
                        fill="#FFFFFF"
                    />
                </svg>
            );
        default:
            return <Code2 className={className} style={style} />;
    }
};

export default TechIcon;
