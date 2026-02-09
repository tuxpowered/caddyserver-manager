import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cog,
    Save,
    Lock,
    Image,
    Type,
    FileText,
    AlertCircle,
    ShieldAlert,
    Check,
    RefreshCw,
    Activity,
    Github,
    ChevronRight,
    Shield,
    Globe,
    Code,
    CornerUpRight,
    Slash,
    PartyPopper,
    ShieldCheck,
    Folder
} from 'lucide-react';

import axios from 'axios';
import clsx from 'clsx';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('caddy-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const FormInput = ({ label, value, onChange, placeholder, type = "text", icon: Icon, theme }) => (
    <div className="space-y-3">
        <label className={clsx(
            "text-[10px] font-black uppercase tracking-widest px-1",
            theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400"
        )}>{label}</label>
        <div className="relative group">
            {Icon && <Icon className={clsx("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", value ? "text-[var(--accent-primary)]" : "text-slate-500")} />}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={clsx(
                    "w-full pr-4 py-4 font-mono text-sm outline-none transition-all",
                    Icon ? "pl-12" : "px-4",
                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--base-text)] focus:border-[var(--accent-primary)]" : "bg-black/40 border border-white/10 text-white focus:border-[var(--accent-primary)]",
                    theme === 'horizon' ? "rounded-2xl" : theme === 'terminal' ? "rounded-none" : "rounded-sm",
                    (theme === 'manager' || theme === 'flat') && "rounded-lg shadow-inner"
                )}
            />
        </div>
    </div>
);

const tabs = [
    { id: 'default_site', name: 'Default Site', icon: Globe },
    { id: 'branding', name: 'System Logo', icon: Image },
    { id: 'filesystem', name: 'Storage Root', icon: Folder },
    { id: 'github', name: 'GitHub Nexus', icon: Github },
    { id: 'security', name: 'Security Protocol', icon: Lock },
    { id: 'ads', name: 'Monetization', icon: Activity },
    { id: 'pki', name: 'Trust Center', icon: ShieldCheck },
];

const Settings = ({ theme, initialTab }) => {
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState({
        app_title: 'Caddy Manager',
        app_logo: '',
        footer_text: '© 2026 Caddy Manager. All rights reserved.',
        footer_links: [],
        show_github: false,
        github_url: '',
        default_site_action: 'congratulations',
        default_site_html: '',
        default_site_redirect_url: '',
        default_web_root: '',
        under_attack: false,
        ads_enabled: false,
        ad_mob_banner_id: '',
        ad_mob_interstitial_id: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [githubSecret, setGithubSecret] = useState('');
    const [activeTab, setActiveTab] = useState(initialTab || 'default_site');
    const [monetizationSecret, setMonetizationSecret] = useState('');
    const [isAdsUnlocked, setIsAdsUnlocked] = useState(false);
    const [monetizationAuthError, setMonetizationAuthError] = useState('');
    const [authenticatingAds, setAuthenticatingAds] = useState(false);
    const [isGithubUnlocked, setIsGithubUnlocked] = useState(false);
    const [githubAuthError, setGithubAuthError] = useState('');
    const [authenticatingGithub, setAuthenticatingGithub] = useState(false);

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('caddy-user');
        if (storedUser) setUser(JSON.parse(storedUser));

        if (initialTab) {
            setActiveTab(initialTab);
        }
        fetchSettings();
    }, [initialTab]);

    const filteredTabs = tabs.filter(tab => {
        if (!user || !user.permissions) return true;
        if (user.permissions.includes('all')) return true;
        return !['ads', 'github'].includes(tab.id);
    });

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(prev => ({ ...prev, ...res.data }));
        } catch (e) {
            console.error('Failed to fetch settings:', e);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        setMessage('');
        try {
            await api.post('/system/sync', {
                ...settings,
                github_secret: githubSecret,
                monetization_secret: monetizationSecret
            });

            await api.post('/caddy/reload');
            setMessage('✓ Settings saved and engine re-aligned!');
            setTimeout(() => setMessage(''), 3000);
        } catch (e) {
            setMessage('✗ Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleMonetizationAuth = async () => {
        setAuthenticatingAds(true);
        setMonetizationAuthError('');
        try {
            await api.post('/monetization/verify', { secret: monetizationSecret });
            setIsAdsUnlocked(true);
        } catch (e) {
            setMonetizationAuthError(e.response?.data?.error || 'Authentication failed');
        } finally {
            setAuthenticatingAds(false);
        }
    };

    const handleGithubAuth = async () => {
        setAuthenticatingGithub(true);
        setGithubAuthError('');
        try {
            await api.post('/github/verify', { secret: githubSecret });
            setIsGithubUnlocked(true);
        } catch (e) {
            setGithubAuthError(e.response?.data?.error || 'Authentication failed');
        } finally {
            setAuthenticatingGithub(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setChangingPassword(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordSuccess('Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch (e) {
            setPasswordError(e.response?.data?.error || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleUnderAttackToggle = async (active) => {
        try {
            const res = await api.post('/settings/under-attack', { active });
            setSettings(prev => ({ ...prev, under_attack: res.data.active }));
            setMessage(active ? '🛡️ Under Attack Mode ACTIVE' : '✓ Normal Operations Restored');
            setTimeout(() => setMessage(''), 3000);
        } catch (e) {
            console.error('Failed to toggle under attack mode:', e);
            setMessage('✗ Failed to toggle security mode');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            {/* Page Header */}
            <div className={clsx(
                "p-4 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden",
                theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] rounded-[var(--rounding)] shadow-sm" : "bg-black/60 prism-card"
            )}>
                <div className="flex items-center gap-8 relative z-10">
                    <div className={clsx(
                        "p-5 transition-all duration-500",
                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--accent-primary)] rounded-lg shadow-sm" : "prism-card border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5 text-[var(--accent-primary)]"
                    )}>
                        <Cog className="w-10 h-10" />
                    </div>
                    <div>
                        <h4 className={clsx("text-3xl font-black tracking-tighter uppercase italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>System Settings</h4>
                        <p className={clsx("text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>System Control Plane</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 min-h-[600px]">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-80 shrink-0 space-y-4">
                    {filteredTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "w-full flex items-center gap-4 px-8 py-5 text-[11px] font-black uppercase tracking-widest transition-all text-left",
                                activeTab === tab.id
                                    ? (theme === 'manager' || theme === 'flat' ? "bg-[var(--accent-primary)] text-white rounded-xl shadow-lg" : "bg-white/10 text-[var(--accent-primary)] border-l-2 border-[var(--accent-primary)]")
                                    : (theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)] hover:bg-[var(--surface-bg)] rounded-xl" : "text-slate-400 hover:bg-white/5")
                            )}
                        >
                            <tab.icon className="w-5 h-5 shrink-0" />
                            {tab.name}
                            {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </button>
                    ))}
                </div>

                {/* Main Settings Content */}
                <div className={clsx(
                    "flex-1 p-4 md:p-10 transition-all min-h-full flex flex-col justify-between",
                    theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] rounded-[var(--rounding)] shadow-sm" : "prism-card bg-black/40"
                )}>
                    <div className="space-y-10">
                        <AnimatePresence mode="wait">
                            {activeTab === 'branding' && (
                                <motion.div key="branding" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <h3 className={clsx("text-xl font-black uppercase tracking-tighter italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>System Logo & Identity</h3>
                                    <div className="flex flex-col lg:flex-row gap-10">
                                        <div className="flex-1 space-y-8">
                                            <FormInput label="System Title" value={settings.app_title} onChange={e => setSettings({ ...settings, app_title: e.target.value })} placeholder="Caddyserver WebUI" icon={Type} theme={theme} />
                                            <FormInput label="System Logo URL" value={settings.app_logo} onChange={e => setSettings({ ...settings, app_logo: e.target.value })} placeholder="/logo.png" icon={Image} theme={theme} />
                                        </div>
                                        {settings.app_logo && (
                                            <div className="shrink-0 space-y-3">
                                                <label className={clsx("text-[10px] font-black uppercase tracking-widest px-1", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Logo Identity Preview</label>
                                                <div className={clsx(
                                                    "w-40 h-40 flex items-center justify-center p-6 border transition-all",
                                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-2xl" : "bg-white/5 border-white/5 rounded-sm"
                                                )}>
                                                    <img src={settings.app_logo} className="max-w-full max-h-full object-contain" alt="Logo Preview" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <label className={clsx("text-[10px] font-black uppercase tracking-widest px-1", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Footer Attribution</label>
                                        <textarea
                                            value={settings.footer_text}
                                            onChange={e => setSettings({ ...settings, footer_text: e.target.value })}
                                            className={clsx(
                                                "w-full px-6 py-4 font-mono text-sm outline-none transition-all resize-none shadow-inner",
                                                theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--base-text)] focus:border-[var(--accent-primary)] rounded-lg" : "bg-black/40 border border-white/10 text-white focus:border-[var(--accent-secondary)] rounded-sm"
                                            )}
                                            rows={4}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'default_site' && (
                                <motion.div key="default_site" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="space-y-2">
                                        <h3 className={clsx("text-xl font-black uppercase tracking-tighter italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Default Site Protocols</h3>
                                        <p className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>What to show when the engine is hit with an unknown host</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { id: 'congratulations', name: 'Congratulations Page', icon: PartyPopper },
                                            { id: '404', name: '404 Page Not Found', icon: AlertCircle },
                                            { id: 'abort', name: 'No Response (Abort)', icon: Slash },
                                            { id: 'redirect', name: 'Permanent Redirect', icon: CornerUpRight },
                                            { id: 'html', name: 'Custom HTML Content', icon: Code },
                                        ].map(action => (
                                            <button
                                                key={action.id}
                                                onClick={() => setSettings({ ...settings, default_site_action: action.id })}
                                                className={clsx(
                                                    "flex items-center gap-6 px-8 py-6 transition-all border text-left group",
                                                    settings.default_site_action === action.id
                                                        ? (theme === 'manager' || theme === 'flat' ? "bg-[var(--accent-primary)]/5 border-[var(--accent-primary)] shadow-sm" : "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]")
                                                        : (theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] hover:border-[var(--accent-primary)]/30" : "bg-black/20 border-white/5 hover:border-white/20"),
                                                    theme === 'manager' || theme === 'flat' ? "rounded-xl" : "rounded-sm"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                    settings.default_site_action === action.id ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] shadow-[0_0_10px_var(--glow-color)]" : "border-slate-600"
                                                )}>
                                                    {settings.default_site_action === action.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                                <div className="flex items-center gap-4 flex-1">
                                                    <action.icon className={clsx("w-5 h-5", settings.default_site_action === action.id ? "text-[var(--accent-primary)]" : "text-slate-500")} />
                                                    <span className={clsx("text-xs font-black uppercase tracking-widest", settings.default_site_action === action.id ? (theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white") : "text-slate-500")}>
                                                        {action.name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {settings.default_site_action === 'redirect' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4">
                                            <FormInput label="Redirect URL" value={settings.default_site_redirect_url} onChange={e => setSettings({ ...settings, default_site_redirect_url: e.target.value })} placeholder="https://example.com" icon={CornerUpRight} theme={theme} />
                                        </motion.div>
                                    )}

                                    {settings.default_site_action === 'html' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4">
                                            <div className="space-y-1">
                                                <label className={clsx("text-[10px] font-black uppercase tracking-widest px-1", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Payload HTML</label>
                                                <textarea
                                                    value={settings.default_site_html}
                                                    onChange={e => setSettings({ ...settings, default_site_html: e.target.value })}
                                                    className={clsx(
                                                        "w-full px-8 py-6 font-mono text-sm outline-none transition-all resize-none shadow-inner min-h-[250px]",
                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--base-text)] focus:border-[var(--accent-primary)] rounded-xl" : "bg-black/40 border border-white/10 text-white focus:border-[var(--accent-secondary)] rounded-sm"
                                                    )}
                                                    placeholder="<!-- Enter custom markup here -->"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'filesystem' && (
                                <motion.div key="filesystem" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="space-y-4">
                                        <h3 className={clsx("text-xl font-black uppercase tracking-tighter italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Filesystem Hierarchy</h3>
                                        <p className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Configure the default storage location for File Browser and PHP sites</p>
                                    </div>
                                    <div className="space-y-8">
                                        <div className={clsx(
                                            "p-8 border transition-all space-y-6",
                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-xl" : "bg-white/5 border-white/5 rounded-sm"
                                        )}>
                                            <FormInput
                                                label="Default Web Root"
                                                value={settings.default_web_root}
                                                onChange={e => setSettings({ ...settings, default_web_root: e.target.value })}
                                                placeholder="e.g. /var/www or relative to project root"
                                                icon={Folder}
                                                theme={theme}
                                            />
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                                This path will be used as the base for all sites when an absolute path is not specified.
                                                Example: If you set it to <code>/var/www</code> and create a site <code>example.com</code>,
                                                it will be mapped to <code>/var/www/example.com</code>.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'github' && (
                                <motion.div key="github" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-4">
                                            <h3 className={clsx("text-xl font-black uppercase tracking-tighter italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>GitHub Nexus Implementation</h3>
                                            <p className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Configure repository sync and visibility for the global footer</p>
                                        </div>
                                        {isGithubUnlocked && (
                                            <button
                                                onClick={() => setIsGithubUnlocked(false)}
                                                className="p-3 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                                title="Lock Section"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {!isGithubUnlocked ? (
                                        <div className={clsx(
                                            "p-10 border flex flex-col items-center justify-center gap-8 text-center",
                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-2xl" : "bg-black/40 border-white/5 rounded-sm"
                                        )}>
                                            <div className="w-16 h-16 bg-[var(--accent-primary)]/10 rounded-full flex items-center justify-center border border-[var(--accent-primary)]/20 shadow-[0_0_20px_var(--glow-color)]">
                                                <Github className="w-8 h-8 text-[var(--accent-primary)]" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className={clsx("text-lg font-black uppercase italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Secured Repository Gate</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enter the security token to bridge the repository connection</p>
                                            </div>
                                            <div className="w-full max-w-xs space-y-4">
                                                <FormInput
                                                    label="Security Token"
                                                    type="password"
                                                    value={githubSecret}
                                                    onChange={e => {
                                                        setGithubSecret(e.target.value);
                                                        setGithubAuthError('');
                                                    }}
                                                    placeholder="Enter Token"
                                                    icon={Lock}
                                                    theme={theme}
                                                />
                                                <AnimatePresence>
                                                    {githubAuthError && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3">
                                                            <AlertCircle className="w-4 h-4 text-rose-500" />
                                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{githubAuthError}</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                <button
                                                    onClick={handleGithubAuth}
                                                    disabled={authenticatingGithub}
                                                    className={clsx(
                                                        "w-full py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--accent-primary)] text-white rounded-lg shadow-lg" : "bg-[var(--accent-primary)] text-white",
                                                        authenticatingGithub && "opacity-50"
                                                    )}
                                                >
                                                    {authenticatingGithub ? 'Verifying...' : 'Authenticate Access'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className={clsx(
                                                "flex items-center justify-between p-8 border transition-all",
                                                theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-xl" : "bg-white/5 border-white/5 rounded-sm"
                                            )}>
                                                <div className="space-y-1">
                                                    <span className={clsx("text-[11px] font-black uppercase tracking-widest block", (theme === 'manager' || theme === 'flat') ? "text-[var(--base-text)]" : "text-white")}>Sync Repository Visibility</span>
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Show GitHub link in system footer</span>
                                                </div>
                                                <button
                                                    onClick={() => setSettings({ ...settings, show_github: !settings.show_github })}
                                                    className={clsx(
                                                        "w-12 h-6 transition-all relative rounded-full",
                                                        settings.show_github ? "bg-[var(--accent-primary)] shadow-[0_0_15px_var(--glow-color)]" : (theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)]" : "bg-slate-800")
                                                    )}
                                                >
                                                    <div className={clsx(
                                                        "absolute top-1 w-4 h-4 transition-all bg-white rounded-full shadow-sm",
                                                        settings.show_github ? "left-7" : "left-1"
                                                    )} />
                                                </button>
                                            </div>

                                            <FormInput label="GitHub URL" value={settings.github_url || ''} onChange={e => setSettings({ ...settings, github_url: e.target.value })} placeholder="https://github.com/your-org" icon={Github} theme={theme} />

                                            <div className="space-y-4">
                                                <FormInput
                                                    label="Security Token (Required to Save)"
                                                    type="password"
                                                    value={githubSecret}
                                                    onChange={e => setGithubSecret(e.target.value)}
                                                    placeholder="Update Security Token"
                                                    icon={ShieldCheck}
                                                    theme={theme}
                                                />
                                                {githubSecret && (
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {[
                                                            { label: '8+ Chars', met: githubSecret.length >= 8 },
                                                            { label: 'Mixed Case', met: /[a-z]/.test(githubSecret) && /[A-Z]/.test(githubSecret) },
                                                            { label: 'Number', met: /[0-9]/.test(githubSecret) },
                                                            { label: 'Special', met: /[^a-zA-Z0-9]/.test(githubSecret) }
                                                        ].map(rule => (
                                                            <span key={rule.label} className={clsx(
                                                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border transition-all",
                                                                rule.met ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-500/5 text-slate-500 border-slate-500/10"
                                                            )}>
                                                                {rule.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="space-y-6">
                                        <h3 className={clsx("text-xl font-black uppercase tracking-tighter italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Security Protocol Re-alignment</h3>

                                        {/* Under Attack Mode Toggle */}
                                        <div className={clsx(
                                            "flex items-center justify-between p-8 border transition-all mb-10",
                                            theme === 'manager' || theme === 'flat' ? "bg-rose-500/5 border-rose-500/20 rounded-xl" : "bg-rose-500/10 border-rose-500/20 rounded-sm"
                                        )}>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <ShieldAlert className={clsx("w-5 h-5", settings.under_attack ? "text-rose-500 animate-pulse" : "text-slate-400")} />
                                                    <span className={clsx("text-[11px] font-black uppercase tracking-widest block", (theme === 'manager' || theme === 'flat') ? "text-[var(--base-text)]" : "text-white")}>Under Attack Mode</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global emergency lockdown: Blocks all non-browser traffic</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleUnderAttackToggle(!settings.under_attack)}
                                                className={clsx(
                                                    "w-12 h-6 transition-all relative rounded-full",
                                                    settings.under_attack ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]" : (theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)]" : "bg-slate-800")
                                                )}
                                            >
                                                <div className={clsx(
                                                    "absolute top-1 w-4 h-4 transition-all bg-white rounded-full shadow-sm",
                                                    settings.under_attack ? "left-7" : "left-1"
                                                )} />
                                            </button>
                                        </div>

                                        <form onSubmit={handlePasswordChange} className="space-y-8">
                                            <div className="grid grid-cols-1 gap-8">
                                                <FormInput
                                                    label="Current Password"
                                                    type="password"
                                                    value={passwordForm.currentPassword}
                                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                    placeholder="••••••••"
                                                    icon={Lock}
                                                    theme={theme}
                                                />
                                                <FormInput
                                                    label="New Access Protocol"
                                                    type="password"
                                                    value={passwordForm.newPassword}
                                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                    placeholder="••••••••"
                                                    icon={Shield}
                                                    theme={theme}
                                                />
                                                <FormInput
                                                    label="Confirm New Protocol"
                                                    type="password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                    placeholder="••••••••"
                                                    icon={Shield}
                                                    theme={theme}
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {passwordError && (
                                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-4">
                                                        <AlertCircle className="w-5 h-5 text-rose-500" />
                                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">{passwordError}</p>
                                                    </motion.div>
                                                )}
                                                {passwordSuccess && (
                                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-4">
                                                        <Check className="w-5 h-5 text-emerald-500" />
                                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{passwordSuccess}</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <button
                                                type="submit"
                                                disabled={changingPassword}
                                                className={clsx(
                                                    "w-full py-6 text-[11px] font-black uppercase tracking-widest transition-all",
                                                    theme === 'manager' || theme === 'flat' ? "bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg" : "bg-rose-500 hover:bg-rose-400 text-white"
                                                )}
                                            >
                                                <span className="flex items-center justify-center gap-4">
                                                    {changingPassword ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                                                    Synchronize New Protocol
                                                </span>
                                            </button>
                                        </form>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'ads' && (
                                <motion.div key="ads" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-4">
                                            <h3 className={clsx("text-xl font-black uppercase tracking-tighter italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Mobile Monetization Engine</h3>
                                            <p className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Configure Google AdMob integration for the Android application</p>
                                        </div>
                                        {isAdsUnlocked && (
                                            <button
                                                onClick={() => setIsAdsUnlocked(false)}
                                                className="p-3 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                                title="Lock Section"
                                            >
                                                <Lock className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {!isAdsUnlocked ? (
                                        <div className={clsx(
                                            "p-10 border flex flex-col items-center justify-center gap-8 text-center",
                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-2xl" : "bg-black/40 border-white/5 rounded-sm"
                                        )}>
                                            <div className="w-16 h-16 bg-[var(--accent-primary)]/10 rounded-full flex items-center justify-center border border-[var(--accent-primary)]/20 shadow-[0_0_20px_var(--glow-color)]">
                                                <Shield className="w-8 h-8 text-[var(--accent-primary)]" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className={clsx("text-lg font-black uppercase italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Encrypted Section</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enter the monetization secret to access these settings</p>
                                            </div>
                                            <div className="w-full max-w-xs space-y-4">
                                                <FormInput
                                                    label="Monetization Secret"
                                                    type="password"
                                                    value={monetizationSecret}
                                                    onChange={e => {
                                                        setMonetizationSecret(e.target.value);
                                                        setMonetizationAuthError('');
                                                    }}
                                                    placeholder="Enter Secret"
                                                    icon={Lock}
                                                    theme={theme}
                                                />
                                                <AnimatePresence>
                                                    {monetizationAuthError && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3">
                                                            <AlertCircle className="w-4 h-4 text-rose-500" />
                                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{monetizationAuthError}</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                <button
                                                    onClick={handleMonetizationAuth}
                                                    disabled={authenticatingAds}
                                                    className={clsx(
                                                        "w-full py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--accent-primary)] text-white rounded-lg shadow-lg" : "bg-[var(--accent-primary)] text-white",
                                                        authenticatingAds && "opacity-50"
                                                    )}
                                                >
                                                    {authenticatingAds ? 'Verifying...' : 'Authenticate Access'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className={clsx(
                                                "flex items-center justify-between p-8 border transition-all",
                                                theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-xl" : "bg-white/5 border-white/5 rounded-sm"
                                            )}>
                                                <div className="space-y-1">
                                                    <span className={clsx("text-[11px] font-black uppercase tracking-widest block", (theme === 'manager' || theme === 'flat') ? "text-[var(--base-text)]" : "text-white")}>Activate Ad Engine</span>
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Enable or disable ads in the mobile app globally</span>
                                                </div>
                                                <button
                                                    onClick={() => setSettings({ ...settings, ads_enabled: !settings.ads_enabled })}
                                                    className={clsx(
                                                        "w-12 h-6 transition-all relative rounded-full",
                                                        settings.ads_enabled ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : (theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)]" : "bg-slate-800")
                                                    )}
                                                >
                                                    <div className={clsx(
                                                        "absolute top-1 w-4 h-4 transition-all bg-white rounded-full shadow-sm",
                                                        settings.ads_enabled ? "left-7" : "left-1"
                                                    )} />
                                                </button>
                                            </div>

                                            <FormInput
                                                label="AdMob Banner ID"
                                                value={settings.ad_mob_banner_id}
                                                onChange={e => setSettings({ ...settings, ad_mob_banner_id: e.target.value })}
                                                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
                                                icon={Activity}
                                                theme={theme}
                                            />
                                            <FormInput
                                                label="AdMob Interstitial ID"
                                                value={settings.ad_mob_interstitial_id}
                                                onChange={e => setSettings({ ...settings, ad_mob_interstitial_id: e.target.value })}
                                                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
                                                icon={ShieldAlert}
                                                theme={theme}
                                            />

                                            <div className="space-y-4">
                                                <FormInput
                                                    label="Security Token (Required to Save)"
                                                    type="password"
                                                    value={monetizationSecret}
                                                    onChange={e => setMonetizationSecret(e.target.value)}
                                                    placeholder="Update Monetization Secret"
                                                    icon={ShieldCheck}
                                                    theme={theme}
                                                />
                                                {monetizationSecret && (
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {[
                                                            { label: '8+ Chars', met: monetizationSecret.length >= 8 },
                                                            { label: 'Mixed Case', met: /[a-z]/.test(monetizationSecret) && /[A-Z]/.test(monetizationSecret) },
                                                            { label: 'Number', met: /[0-9]/.test(monetizationSecret) },
                                                            { label: 'Special', met: /[^a-zA-Z0-9]/.test(monetizationSecret) }
                                                        ].map(rule => (
                                                            <span key={rule.label} className={clsx(
                                                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border transition-all",
                                                                rule.met ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-500/5 text-slate-500 border-slate-500/10"
                                                            )}>
                                                                {rule.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Integration Notice</span>
                                                </div>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                                    The mobile app will automatically fetch these IDs during initialization. Ensure your AdMob account is properly verified and your app-ads.txt is configured on your primary domain.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'pki' && (
                                <motion.div key="pki" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="space-y-4">
                                        <h3 className={clsx("text-xl font-black uppercase tracking-tighter italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Engine Identity & Trust Center</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                            If you encounter "Connection not private" errors for your domains, it usually means the engine is using its internal CA.
                                            This happens when public certificates cannot be issued (e.g., in private networks).
                                            Trust the engine's identity below to resolve these warnings.
                                        </p>
                                    </div>

                                    <div className={clsx(
                                        "p-10 border flex flex-col items-center text-center gap-6",
                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-2xl" : "bg-white/5 border-white/5 rounded-sm"
                                    )}>
                                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                            <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className={clsx("text-lg font-black uppercase italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Local Root Authority</h4>
                                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em]">Caddy Internal PKI v2</p>
                                        </div>
                                        <a
                                            href={`${window.location.protocol}//${window.location.host}/api/pki/root`}
                                            download
                                            className={clsx(
                                                "px-10 py-5 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                                                theme === 'manager' || theme === 'flat' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-emerald-500/20" : "bg-emerald-500 hover:bg-emerald-400 text-white"
                                            )}
                                        >
                                            Download Root Certificate
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Commit Action Group */}
                    <div className={clsx(
                        "mt-10 pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-6",
                        theme === 'manager' || theme === 'flat' ? "border-[var(--glass-border)]" : "border-white/5"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className={clsx(
                                "p-3 rounded-full transition-all duration-500",
                                message.includes('✓') ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : (message.includes('✗') ? "bg-rose-500 text-white" : (theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] text-[var(--muted-text)] shadow-inner" : "bg-white/5 text-slate-500"))
                            )}>
                                {message.includes('✓') ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            </div>
                            <span className={clsx(
                                "text-[10px] font-black uppercase tracking-widest italic",
                                message.includes('✓') ? "text-emerald-500" : (message.includes('✗') ? "text-rose-500" : (theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-500"))
                            )}>
                                {message || 'Operational readiness confirmed'}
                            </span>
                        </div>
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className={clsx(
                                "px-14 py-6 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden group/commit",
                                theme === 'manager' || theme === 'flat' ? "bg-[var(--accent-primary)] hover:opacity-95 text-white rounded-xl shadow-[0_10px_20px_-5px_var(--glow-color)]" : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                            )}
                        >
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/commit:translate-x-[100%] transition-transform duration-1000" />
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Commit Changes
                        </button>
                    </div>
                </div>
            </div>
        </motion.div >
    );
};

export default Settings;
