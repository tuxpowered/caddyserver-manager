import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book,
    Terminal as TerminalIcon,
    Server,
    Shield,
    ShieldAlert,
    Settings,
    Globe,
    Zap,
    Activity,
    Cpu,
    Layers,
    FileCode,
    Lock,
    Download,
    ChevronRight,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Copy,
    Search
} from 'lucide-react';
import clsx from 'clsx';

const DocSection = ({ icon: Icon, title, children, theme, id, activeSection, onClick }) => (
    <div
        id={id}
        onClick={onClick}
        className={clsx(
            "p-8 space-y-5 transition-all cursor-pointer group",
            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] rounded-[var(--rounding)] shadow-sm hover:shadow-md" : "prism-card bg-white/5 border border-white/5 hover:bg-white/10",
            activeSection === id && (theme === 'manager' || theme === 'flat' ? "ring-2 ring-[var(--accent-primary)]" : "border-[var(--accent-primary)]")
        )}
    >
        <div className="flex items-center gap-4">
            <div className={clsx(
                "p-3 rounded-xl transition-colors",
                theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] text-[var(--accent-primary)] shadow-sm group-hover:bg-[var(--accent-primary)] group-hover:text-white" : "bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30"
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <h3 className={clsx("text-lg font-black uppercase tracking-tighter italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>{title}</h3>
        </div>
        <div className={clsx(
            "text-sm leading-relaxed space-y-3 font-medium",
            theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-[var(--base-text)] opacity-80"
        )}>
            {children}
        </div>
    </div>
);

const FeatureBadge = ({ type, text }) => (
    <span className={clsx(
        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1 ml-2 align-middle",
        type === 'new' ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-amber-500/20 text-amber-500 border border-amber-500/30"
    )}>
        {type === 'new' && <Zap className="w-2 h-2" />}
        {text}
    </span>
);

const Documentation = ({ theme }) => {
    const [activeSection, setActiveSection] = useState(null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20 max-w-5xl mx-auto"
        >
            {/* Header / System Status */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
                <div className="flex flex-col gap-2">
                    <h2 className={clsx("text-xs font-black uppercase tracking-[0.4em] italic flex items-center gap-2",
                        theme === 'manager' || theme === 'flat' ? "text-[var(--accent-secondary)]" : "text-cyan-400"
                    )}>
                        <Activity className="w-3 h-3" /> System Intelligence
                    </h2>
                    <h1 className={clsx("text-5xl md:text-6xl font-black tracking-tighter uppercase",
                        theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white"
                    )}>
                        Operations Manual
                    </h1>
                    <div className={clsx("h-1 w-24 mt-2", theme === 'manager' || theme === 'flat' ? "bg-[var(--accent-primary)]" : "bg-gradient-to-r from-cyan-500 to-transparent")} />
                </div>

                <div className={clsx(
                    "flex flex-col items-end gap-1 p-4 rounded-lg",
                    theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)]" : "bg-black/40 border border-white/10"
                )}>
                    <p className={clsx("text-[9px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-500")}>Active System ID</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                        <span className={clsx("text-sm font-mono font-bold tracking-tight", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-emerald-400")}>PRISM STABLE</span>
                    </div>
                    <p className={clsx("text-[9px] font-mono opacity-50", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-500")}>v2.0.26</p>
                </div>
            </div>

            {/* Quick Links / Table of Contents */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { id: 'overview', label: 'Overview', icon: Globe },
                    { id: 'security', label: 'Security Protocols', icon: ShieldAlert },
                    { id: 'infra', label: 'Infrastructure', icon: Server },
                    { id: 'terminal', label: 'Terminal', icon: TerminalIcon },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                        className={clsx(
                            "flex items-center justify-center gap-2 p-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] hover:bg-[var(--base-bg)] text-[var(--muted-text)] hover:text-[var(--accent-primary)] border border-[var(--glass-border)]" : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5"
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DocSection id="overview" title="System Overview" icon={Zap} theme={theme} activeSection={activeSection} onClick={() => setActiveSection('overview')}>
                    <p>Welcome to the <strong className={clsx(theme === 'manager' || theme === 'flat' ? "text-[var(--accent-primary)]" : "text-cyan-400")}>Caddy Manager</strong>. This platform provides a high-performance, visually immersive interface for managing your Caddy Edge Server.</p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className={clsx("p-3 rounded border", theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-slate-200" : "bg-black/20 border-white/5")}>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Dashboard</div>
                            <div className="text-xs">Real-time telemetry and server health monitoring.</div>
                        </div>
                        <div className={clsx("p-3 rounded border", theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-slate-200" : "bg-black/20 border-white/5")}>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Vitals</div>
                            <div className="text-xs">Live logs and resource usage analytics.</div>
                        </div>
                    </div>
                </DocSection>

                <DocSection id="security" title="Security Protocols" icon={Shield} theme={theme} activeSection={activeSection} onClick={() => setActiveSection('security')}>
                    <p>Advanced threat mitigation and access control features.</p>

                    <div className="space-y-4 mt-4">
                        <div className={clsx("p-4 rounded-lg", theme === 'manager' || theme === 'flat' ? "bg-rose-50 border border-rose-200" : "bg-rose-500/10 border border-rose-500/20")}>
                            <h4 className={clsx("text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2", theme === 'manager' || theme === 'flat' ? "text-rose-600" : "text-rose-400")}>
                                <ShieldAlert className="w-4 h-4" /> Under Attack Mode <FeatureBadge type="new" text="NEW" />
                            </h4>
                            <p className="text-xs opacity-80 mb-2">Global "Panic Button" located in <strong>Settings</strong>. Instantly blocks all non-browser traffic (bots, scripts, curl) to mitigate DDoS or scraping attacks.</p>
                            <code className="text-[10px] block p-2 rounded bg-black/20 font-mono">Status: {theme === 'manager' ? "Settings > Security > Active" : "Settings > Toggle Panic"}</code>
                        </div>

                        <div className={clsx("p-4 rounded-lg", theme === 'manager' || theme === 'flat' ? "bg-emerald-50 border border-emerald-200" : "bg-emerald-500/10 border border-emerald-500/20")}>
                            <h4 className={clsx("text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2", theme === 'manager' || theme === 'flat' ? "text-emerald-600" : "text-emerald-400")}>
                                <Lock className="w-4 h-4" /> IP Access Control <FeatureBadge type="new" text="NEW" />
                            </h4>
                            <p className="text-xs opacity-80 mb-2">Configure strict access rules per domain in <strong>Edit Site Security Rules</strong>.</p>
                            <ul className="text-xs space-y-1 list-disc list-inside opacity-80">
                                <li><strong>Whitelist</strong>: Only allow specific IPs (e.g., VPN).</li>
                                <li><strong>Blacklist</strong>: Block specific abusive IPs.</li>
                            </ul>
                        </div>
                    </div>
                </DocSection>

                <DocSection id="infra" title="Infrastructure Control" icon={Server} theme={theme} activeSection={activeSection} onClick={() => setActiveSection('infra')}>
                    <p>Manage your domains and reverse proxies via the <strong>Sites & Domains</strong> tab.</p>

                    <div className="space-y-4 mt-6">
                        <div className={clsx("p-4 rounded-lg", theme === 'manager' || theme === 'flat' ? "bg-cyan-50 border border-cyan-200" : "bg-cyan-500/10 border border-cyan-500/20")}>
                            <h4 className={clsx("text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-2", theme === 'manager' || theme === 'flat' ? "text-cyan-600" : "text-cyan-400")}>
                                <Layers className="w-4 h-4" /> Edge Header Rules <FeatureBadge type="new" text="GUIDE" />
                            </h4>
                            <p className="text-xs opacity-80 mb-3">Modify HTTP headers for incoming requests before they reach your application.</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500">
                                    <span className="px-1.5 py-0.5 rounded bg-black/20 font-mono text-[var(--accent-primary)]">SET</span>
                                    <span>Overwrite or create a header with a specific value.</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500">
                                    <span className="px-1.5 py-0.5 rounded bg-black/20 font-mono text-[var(--accent-primary)]">ADD</span>
                                    <span>Append a new value to an existing header (list).</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500">
                                    <span className="px-1.5 py-0.5 rounded bg-black/20 font-mono text-[var(--accent-primary)]">DEL</span>
                                    <span>Remove a specific header from the request.</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex gap-3 items-start">
                                <div className={clsx("w-6 h-6 rounded flex items-center justify-center shrink-0 text-[10px] font-bold", theme === 'manager' ? "bg-slate-200" : "bg-white/10")}>1</div>
                                <div>
                                    <strong className="text-xs uppercase tracking-wider">The Architect</strong>
                                    <p className="text-xs opacity-70">Use the "The Architect" blueprint for advanced users who need to write raw Caddyfile directives manually.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className={clsx("w-6 h-6 rounded flex items-center justify-center shrink-0 text-[10px] font-bold", theme === 'manager' ? "bg-slate-200" : "bg-white/10")}>2</div>
                                <div>
                                    <strong className="text-xs uppercase tracking-wider">Auto-HTTPS</strong>
                                    <p className="text-xs opacity-70">Caddy automatically provisions SSL certificates for all public domains. Ensure your DNS points to this server.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DocSection>

                <DocSection id="terminal" title="Integrated Terminal" icon={TerminalIcon} theme={theme} activeSection={activeSection} onClick={() => setActiveSection('terminal')}>
                    <p>A full Xterm.js terminal connected directly to your server's shell.</p>
                    <div className={clsx(
                        "p-4 rounded font-mono text-xs border transition-all my-2 relative group",
                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] text-[var(--accent-primary)]" : "bg-black/40 border-white/5 text-emerald-500"
                    )}>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="w-3 h-3 cursor-pointer" />
                        </div>
                        $ caddy reload --config ./Caddyfile<br />
                        $ curl -v https://localhost
                    </div>
                    <p className="text-xs opacity-70">
                        <strong>Tip:</strong> Use <code className="bg-white/10 px-1 rounded">Ctrl+C</code> to kill running processes. The terminal session persists in the background.
                    </p>
                </DocSection>

                <DocSection id="custom" title="System Customization" icon={Settings} theme={theme} activeSection={activeSection} onClick={() => setActiveSection('custom')}>
                    <p>Tailor the engine to your brand in the Settings panel.</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {['Prism', 'Horizon', 'Terminal', 'Flat'].map(t => (
                            <div key={t} className={clsx("text-center py-2 px-1 rounded text-[10px] font-bold uppercase border", theme === 'manager' || theme === 'flat' ? "border-slate-200 bg-white" : "border-white/10 bg-white/5")}>
                                {t} Theme
                            </div>
                        ))}
                    </div>
                </DocSection>

                <DocSection id="updates" title="Updates & Versioning" icon={RefreshCw} theme={theme} activeSection={activeSection} onClick={() => setActiveSection('updates')}>
                    <p className="mb-2">This system is running on the <strong>Prism Stable</strong> branch.</p>
                    <div className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Core Engine: <strong>v2.7.6</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Manager UI: <strong>v2.0.26</strong></span>
                    </div>
                    <div className="mt-4 p-3 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px]">
                        <strong>Note:</strong> Always backup your `database.sqlite` before performing system upgrades.
                    </div>
                </DocSection>
            </div>

            {/* Footer Note */}
            <div className={clsx(
                "p-12 text-center border-t transition-all mt-12",
                theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border-[var(--glass-border)] rounded-[var(--rounding)] shadow-inner" : "prism-card bg-white/5 border-white/10"
            )}>
                <div className="flex justify-center mb-6">
                    <div className={clsx("w-12 h-1 bg-[var(--accent-primary)] rounded-full opacity-50")} />
                </div>
                <p className={clsx(
                    "text-[10px] font-black uppercase tracking-[0.5em] italic",
                    theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400"
                )}>
                    Caddyserver WebUI Documentation — Version 2.0.26
                </p>
                <p className={clsx("text-[9px] mt-2 opacity-50", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-500")}>
                    Generated for Active System ID: PRISM-STABLE-2026
                </p>
            </div>
        </motion.div>
    );
};

export default Documentation;
