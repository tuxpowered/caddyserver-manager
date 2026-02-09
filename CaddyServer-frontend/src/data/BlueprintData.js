import { Shuffle, Zap, Database, FileCode, Shield } from 'lucide-react';

export const BLUEPRINTS = [
    {
        id: 'proxy',
        name: 'The Bridge',
        subtitle: 'REVERSE PROXY',
        description: 'Standard forwarding for Node.js, Python, or Go apps. Optimized for high-performance traffic relay.',
        icon: Shuffle,
        color: 'cyan',
        caddy_hint: 'reverse_proxy localhost:3000'
    },
    {
        id: 'spa',
        name: 'The Phantom',
        subtitle: 'SINGLE PAGE APP',
        description: 'Perfect for React, Vite, or Vue. Handles client-side routing by falling back to index.html.',
        icon: Zap,
        color: 'purple',
        caddy_hint: 'try_files {path} /index.html'
    },
    {
        id: 'php',
        name: 'The Artisan',
        subtitle: 'PHP / FASTCGI',
        description: 'Standard WordPress/Laravel setup. Routes PHP requests to FastCGI (Unix or TCP).',
        icon: Database,
        color: 'indigo',
        caddy_hint: 'php_fastcgi localhost:9000'
    },
    {
        id: 'static',
        name: 'The Vault',
        subtitle: 'STATIC STORAGE',
        description: 'Blazing fast raw file delivery. Includes compression (Zstd/Gzip) and directory browsing options.',
        icon: FileCode,
        color: 'emerald',
        caddy_hint: 'file_server browse'
    },
    {
        id: 'custom',
        name: 'The Architect',
        subtitle: 'CUSTOM CONFIG',
        description: 'Full control. Write your own Caddyfile directives for advanced routing, modules, and behavior.',
        icon: Shield,
        color: 'slate',
        caddy_hint: 'Directives will be wrapped in your site block'
    }
];
