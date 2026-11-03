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
        default:
            return <Code2 className={className} style={style} />;
    }
};

export default TechIcon;
