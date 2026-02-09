import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CircuitBoard,
    User,
    Lock,
    ShieldAlert,
    ChevronRight,
    Activity,
    Github,
    RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import api from '../api';

const Login = ({ onLogin, globalSettings = {}, theme = 'prism' }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, user } = response.data;

            localStorage.setItem('caddy-token', token);
            localStorage.setItem('caddy-user', JSON.stringify(user));

            onLogin(user, token);
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.error || 'Authentication Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const isAdmin = username.toLowerCase() === 'admin';

    return (
        <div className={clsx(
            "min-h-screen flex items-center justify-center p-6 transition-all duration-700 relative overflow-hidden",
            theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)]" : "bg-[#050507]"
        )}>
            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={clsx("absolute top-0 right-0 w-full h-full bg-gradient-to-br opacity-5", theme === 'manager' || theme === 'flat' ? "from-rose-500/20 to-transparent" : "from-[var(--accent-primary)]/20 to-transparent")} />
                <div className={clsx("absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr opacity-5", theme === 'manager' || theme === 'flat' ? "from-blue-500/20 to-transparent" : "from-[var(--accent-secondary)]/20 to-transparent")} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={clsx(
                    "w-full max-w-lg p-12 space-y-10 relative z-10 transition-all duration-500",
                    theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] rounded-[var(--rounding)] shadow-2xl" : "prism-card bg-black/40"
                )}
            >
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className={clsx(
                        "transition-all duration-500",
                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] rounded-2xl shadow-sm overflow-hidden" : "prism-card border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5",
                        globalSettings.app_logo ? "p-0" : "p-6 rotate-12"
                    )}>
                        {globalSettings.app_logo ? (
                            <img src={globalSettings.app_logo} alt="Logo" className="w-24 h-24 object-contain" />
                        ) : (
                            <CircuitBoard className="w-12 h-12 text-[var(--accent-primary)]" />
                        )}
                    </div>
                    <div className="space-y-2">
                        <h1 className={clsx("text-4xl font-black italic uppercase tracking-tighter", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>
                            {globalSettings.app_title || "Caddyserver WebUI"}
                        </h1>
                        <p className={clsx("text-[10px] font-black uppercase tracking-[0.4em] italic", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>
                            Central Nervous System Access
                        </p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-3">
                        <label className={clsx("text-[10px] font-black uppercase tracking-widest px-1", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Security Identity</label>
                        <div className="relative group">
                            <User className={clsx("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", isAdmin ? "text-[var(--accent-primary)]" : "text-slate-500")} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="ACCESS ID"
                                className={clsx(
                                    "w-full pl-12 pr-4 py-4 font-mono text-sm outline-none transition-all",
                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--base-text)] focus:border-[var(--accent-primary)]" : "bg-black/60 border border-white/10 text-white focus:border-[var(--accent-primary)]",
                                    theme === 'horizon' ? "rounded-2xl" : theme === 'terminal' ? "rounded-none" : "rounded-sm",
                                    (theme === 'manager' || theme === 'flat') && "rounded-lg"
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className={clsx("text-[10px] font-black uppercase tracking-widest px-1", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Access Key</label>
                        <div className="relative group">
                            <Lock className={clsx("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", password.length > 0 ? "text-[var(--accent-secondary)]" : "text-slate-500")} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={clsx(
                                    "w-full pl-12 pr-4 py-4 font-mono text-sm outline-none transition-all",
                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--base-text)] focus:border-[var(--accent-secondary)]" : "bg-black/60 border border-white/10 text-white focus:border-[var(--accent-secondary)]",
                                    theme === 'horizon' ? "rounded-2xl" : theme === 'terminal' ? "rounded-none" : "rounded-sm",
                                    (theme === 'manager' || theme === 'flat') && "rounded-lg"
                                )}
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-4 bg-rose-500/10 border border-rose-500/20 rounded flex items-center gap-3"
                            >
                                <ShieldAlert className="w-5 h-5 text-rose-500" />
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={clsx(
                            "w-full py-5 text-[11px] font-black uppercase tracking-widest transition-all relative overflow-hidden group/btn",
                            theme === 'manager' || theme === 'flat' ? "bg-[var(--accent-primary)] hover:opacity-90 text-white rounded-lg shadow-lg" : "bg-[var(--accent-primary)] hover:opacity-90 text-[var(--base-bg)]",
                            theme === 'horizon' ? "rounded-2xl" : "rounded-none",
                            theme === 'prism' && "prism-glow"
                        )}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {isLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Engage Authentication
                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                </form>

                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-help">
                        <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
                        <span className={clsx("text-[9px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-white")}>System Online</span>
                    </div>
                    {globalSettings?.show_github && globalSettings?.github_url && (
                        <a
                            href={globalSettings.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={clsx(
                                "p-3 transition-all",
                                theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--muted-text)] hover:text-[var(--base-text)] rounded-lg shadow-sm" : "prism-card border-white/10 bg-white/5 text-white/40 hover:text-white"
                            )}
                        >
                            <Github className="w-4 h-4" />
                        </a>
                    )}
                </div>
            </motion.div>

            {/* Footer Branding */}
            <div className="fixed bottom-10 flex flex-col items-center gap-3 opacity-20 hover:opacity-100 transition-opacity">
                <p className={clsx("text-[10px] font-black uppercase tracking-[0.5em] italic", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-white")}>Proprietary Caddy Interface</p>
                <div className="flex gap-4">
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent" />
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-[var(--accent-secondary)] to-transparent" />
                </div>
            </div>
        </div>
    );
};

export default Login;
