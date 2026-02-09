import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe,
    Plus,
    Trash2,
    ExternalLink,
    Shield,
    ShieldCheck,
    Activity,
    RefreshCw,
    Search,
    X,
    Edit3,
    ArrowRight,
    Lock,
    FileText,
    AlertCircle,
    Info,
    Layout,
    Key,
    Activity as LogIcon,
    Download
} from 'lucide-react';

import CaddyLogo from './CaddyLogo';
import NodeIdentity from './NodeIdentity';
import axios from 'axios';
import clsx from 'clsx';
import { BLUEPRINTS } from '../data/BlueprintData';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('caddy-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const GuideTooltip = ({ text, onLearnMore }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                type="button"
                className="focus:outline-none"
            >
                <Info className="w-3 h-3 text-[var(--accent-primary)] opacity-40 hover:opacity-100 transition-opacity" />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-[#0a0a0a]/95 border border-white/20 rounded-xl shadow-2xl z-[100] backdrop-blur-md"
                    >
                        <p className="text-[10px] text-slate-300 leading-relaxed font-medium text-center">{text}</p>
                        {onLearnMore && (
                            <button
                                onClick={onLearnMore}
                                className="mt-2 w-full py-1.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[var(--accent-primary)]/20 transition-all border border-[var(--accent-primary)]/20"
                            >
                                Learn More in Guide
                            </button>
                        )}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-[#0a0a0a]/95" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DeleteModal = ({ isOpen, onClose, onConfirm, domainName, theme }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={clsx(
                        "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-8 z-[70]",
                        theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] rounded-[var(--rounding)] shadow-2xl" : "bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl"
                    )}
                >
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
                            <Trash2 className="w-8 h-8 text-rose-500" />
                        </div>

                        <div className="space-y-2">
                            <h3 className={clsx("text-xl font-black uppercase tracking-tight", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Delete Site?</h3>
                            <p className={clsx("text-sm", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>
                                Are you sure you want to delete <span className="font-bold text-[var(--accent-primary)]">{domainName}</span>? This action cannot be undone.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <button
                                onClick={onClose}
                                className={clsx(
                                    "px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] text-[var(--muted-text)] hover:text-[var(--base-text)] border border-[var(--glass-border)]" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                            >
                                Delete Site
                            </button>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

const getBadgeStyles = (color, theme) => {
    const colors = {
        cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
        indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
        slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' }
    };

    if (theme === 'manager' || theme === 'flat') {
        // For light/manager themes, we might want slightly different styles or keep consistent
        // Using the same logic for now but ensuring readability
        const c = colors[color] || colors.slate;
        return `${c.bg} ${c.text} ${c.border}`;
    }

    const c = colors[color] || colors.slate;
    return `${c.bg} ${c.text} ${c.border}`;
};

const Domains = ({ theme, globalSettings = {} }) => {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, domainId: null, domainHost: '' });
    const [editingDomain, setEditingDomain] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState({
        host: '',
        upstream: '',
        logo: '',
        ssl: true,
        template: 'proxy',
        custom_config: '',
        canonical_type: 'off',
        upstream_proto: 'http',
        auth_user: '',
        auth_pass: '',
        enable_logging: false,
        dns_provider: 'none',
        dns_data: {},
        dns_provider_custom: '',
        force_ssl: true,
        http2_enabled: true,
        hsts_enabled: false,
        hsts_subdomains: false,
        header_rules: [],
        lb_policy: 'random',
        health_check_enabled: false,
        health_check_path: '/',
        file_browse_enabled: true,
        blocked_ips: '',
        allowed_ips: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const filteredDomains = domains.filter(d =>
        d.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.upstream.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);
    const paginatedDomains = filteredDomains.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const fetchDomains = async () => {
        setLoading(true);
        try {
            const res = await api.get('/domains');
            setDomains(res.data || []);
        } catch (e) {
            console.error('Failed to fetch domains:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDomain) {
                await api.put(`/domains/${editingDomain.id}`, formData);
            } else {
                await api.post('/domains', formData);
            }
            fetchDomains();
            setIsModalOpen(false);
            setEditingDomain(null);
            setFormData({ host: '', upstream: '', custom_config: '', logo: '', ssl: true, template: 'proxy', canonical_type: 'off', upstream_proto: 'http', auth_user: '', auth_pass: '', enable_logging: false, dns_provider: 'none', dns_data: {}, dns_provider_custom: '', force_ssl: true, http2_enabled: true, hsts_enabled: false, hsts_subdomains: false, blocked_ips: '', allowed_ips: '', header_rules: [], lb_policy: 'random', health_check_enabled: false, health_check_path: '/', file_browse_enabled: true });

        } catch (e) {
            console.error('Failed to save domain:', e);
            alert('Failed to save domain: ' + (e.response?.data?.error || e.message));
        }
    };

    const handleDeleteClick = (domain) => {
        setDeleteModal({ isOpen: true, domainId: domain.id, domainHost: domain.host });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.domainId) return;

        try {
            await api.delete(`/domains/${deleteModal.domainId}`);
            fetchDomains();
            setDeleteModal({ isOpen: false, domainId: null, domainHost: '' });
        } catch (e) {
            console.error('Failed to delete domain:', e);
            alert('Failed to delete domain: ' + (e.message || 'Unknown error'));
        }
    };

    const handleEdit = (domain) => {
        setEditingDomain(domain);
        setFormData({
            host: domain.host || '',
            upstream: domain.upstream || '',
            logo: domain.logo || '',
            ssl: !!domain.ssl,
            template: domain.template || 'proxy',
            custom_config: domain.custom_config || '',
            canonical_type: domain.canonical_type || 'off',
            upstream_proto: domain.upstream_proto || 'http',
            auth_user: domain.auth_user || '',
            auth_pass: domain.auth_pass || '',
            enable_logging: !!domain.enable_logging,
            dns_provider: domain.dns_provider || 'none',
            dns_data: domain.dns_data || {},
            dns_provider_custom: domain.dns_provider_custom || '',
            force_ssl: domain.force_ssl !== undefined ? !!domain.force_ssl : true,
            http2_enabled: domain.http2_enabled !== undefined ? !!domain.http2_enabled : true,
            hsts_enabled: !!domain.hsts_enabled,
            hsts_subdomains: !!domain.hsts_subdomains,
            header_rules: domain.header_rules || [],
            lb_policy: domain.lb_policy || 'random',
            health_check_enabled: !!domain.health_check_enabled,
            health_check_path: domain.health_check_path || '/',
            file_browse_enabled: domain.file_browse_enabled !== undefined ? !!domain.file_browse_enabled : true,
            blocked_ips: domain.blocked_ips || '',
            allowed_ips: domain.allowed_ips || ''
        });
        setActiveTab('general');
        setIsModalOpen(true);
    };

    const handleDownloadSSL = async (id, host) => {
        try {
            const response = await api.get(`/domains/${id}/ssl/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${host}_ssl.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error('Failed to download SSL:', e);
            alert('Failed to download SSL. It might not be generated yet or files not found.');
        }
    };
    const handleRenewSSL = async (id, host) => {
        if (!window.confirm(`Are you sure you want to force SSL renewal for ${host}? This will clear existing certificate files and trigger a fresh request.`)) return;
        try {
            await api.post(`/domains/${id}/ssl/renew`);
            alert(`Renewal triggered for ${host}. Please wait a few moments for Caddy to provision the new certificate.`);
        } catch (e) {
            console.error('Failed to trigger SSL renewal:', e);
            alert('Failed to trigger SSL renewal: ' + (e.response?.data?.error || e.message));
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
            {/* Header / Actions */}
            <div className={clsx(
                "p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden",
                theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] rounded-[var(--rounding)] shadow-sm" : "bg-black/60 prism-card"
            )}>
                <div className="flex items-center gap-8 relative z-10">
                    <div className={clsx(
                        "p-5 transition-all duration-500",
                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--accent-primary)] rounded-lg shadow-sm" : "prism-card border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5 text-[var(--accent-primary)]"
                    )}>
                        <Globe className="w-10 h-10" />
                    </div>
                    <div>
                        <h4 className={clsx("text-3xl font-black tracking-tighter uppercase italic", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Sites & Domains</h4>
                        <p className={clsx("text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Edge Mapping Protocols</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditingDomain(null);
                        setFormData({
                            host: '', upstream: '', logo: '', ssl: true, template: 'proxy', canonical_type: 'off',
                            upstream_proto: 'http', auth_user: '', auth_pass: '', enable_logging: false,
                            dns_provider: 'none', dns_data: {}, dns_provider_custom: '',
                            force_ssl: true, http2_enabled: true, hsts_enabled: false, hsts_subdomains: false,
                            header_rules: [], lb_policy: 'random', health_check_enabled: false, health_check_path: '/', file_browse_enabled: true, blocked_ips: '', allowed_ips: ''
                        });
                        setActiveTab('general');
                        setIsModalOpen(true);
                    }}
                    className={clsx(
                        "px-10 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative z-10",
                        theme === 'manager' || theme === 'flat' ? "bg-[var(--accent-primary)] hover:opacity-90 text-white rounded-lg shadow-lg" : "bg-[var(--accent-primary)] hover:opacity-90 text-[var(--base-bg)] shadow-[0_0_20_var(--glow-color)]"
                    )}
                >
                    Initialize New Site
                </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <div className={clsx(
                    "relative flex-1 group",
                    theme === 'manager' || theme === 'flat' ? "" : ""
                )}>
                    <Search className={clsx(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                        theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)] group-focus-within:text-[var(--accent-primary)]" : "text-slate-500 group-focus-within:text-white"
                    )} />
                    <input
                        type="text"
                        placeholder="Search domains..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className={clsx(
                            "w-full pl-12 pr-4 py-4 font-mono text-sm outline-none transition-all",
                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-[var(--rounding)] focus:border-[var(--accent-primary)] shadow-sm" : "bg-black/40 border border-white/10 text-white focus:border-[var(--accent-primary)] rounded-[var(--rounding)]"
                        )}
                    />
                </div>
            </div>

            {/* Domains Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {paginatedDomains.map(domain => (
                    <motion.div
                        key={domain.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={clsx(
                            "group relative overflow-hidden transition-all duration-500 flex flex-col h-full",
                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] rounded-[var(--rounding)] shadow-sm hover:shadow-2xl hover:border-[var(--accent-primary)]/30 p-8" : "prism-card bg-black/20 hover:bg-black/30 p-10"
                        )}
                    >
                        <div className="flex justify-between items-start">
                            <NodeIdentity
                                host={domain.host}
                                logo={domain.logo}
                                globalLogo={globalSettings.app_logo}
                                theme={theme}
                                size="small"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(domain)}
                                    className={clsx(
                                        "p-2.5 transition-all",
                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] text-[var(--muted-text)] hover:text-[var(--accent-primary)] border border-[var(--glass-border)] rounded-lg shadow-sm" : "bg-white/5 text-slate-400 hover:text-cyan-400"
                                    )}
                                    title="Edit Configuration"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <a
                                    href={`${domain.ssl ? 'https' : 'http'}://${domain.host}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={clsx(
                                        "p-2.5 transition-all text-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)]/10 hover:text-white",
                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] rounded-lg shadow-sm" : "bg-white/5"
                                    )}
                                    title="Visit Site"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                    onClick={() => handleDownloadSSL(domain.id, domain.host)}
                                    className={clsx(
                                        "p-2.5 transition-all text-amber-400 hover:bg-amber-500 hover:text-white",
                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] rounded-lg shadow-sm" : "bg-white/5"
                                    )}
                                    title="Download SSL Certificate"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleRenewSSL(domain.id, domain.host)}
                                    className={clsx(
                                        "p-2.5 transition-all text-emerald-400 hover:bg-emerald-500 hover:text-white",
                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] rounded-lg shadow-sm" : "bg-white/5"
                                    )}
                                    title="Force SSL Renewal"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(domain)}
                                    className={clsx(
                                        "p-2.5 transition-all text-rose-400 hover:bg-rose-500 hover:text-white",
                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] rounded-lg shadow-sm" : "bg-white/5"
                                    )}
                                    title="Delete Site"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 mb-8">
                            <a
                                href={`${domain.ssl ? 'https' : 'http'}://${domain.host}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={clsx(
                                    "text-xl font-black tracking-tight truncate block hover:text-[var(--accent-primary)] transition-colors",
                                    theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white"
                                )}
                            >
                                {domain.host}
                            </a>
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-8">
                            <div className={clsx(
                                "flex items-center gap-2 p-2 rounded-md border",
                                theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)]" : "bg-white/5 border-white/5"
                            )}>
                                <div className={clsx("p-1 rounded", domain.ssl ? "bg-cyan-500/10 text-cyan-500" : "bg-slate-500/10 text-slate-500")}>
                                    <Shield className="w-3 h-3" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Security</span>
                                    <span className="text-[9px] font-bold uppercase truncate">{domain.ssl ? 'TLS SECURE' : 'INSECURE'}</span>
                                </div>
                            </div>

                            <div className={clsx(
                                "flex items-center gap-2 p-2 rounded-md border",
                                theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)]" : "bg-white/5 border-white/5"
                            )}>
                                <div className={clsx("p-1 rounded", getBadgeStyles(BLUEPRINTS.find(b => b.id === (domain.template || 'proxy'))?.color || 'slate', theme))}>
                                    {BLUEPRINTS.find(b => b.id === domain.template)?.icon && React.createElement(BLUEPRINTS.find(b => b.id === domain.template).icon, { className: "w-3 h-3" })}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Blueprint</span>
                                    <span className="text-[9px] font-bold uppercase truncate">{BLUEPRINTS.find(b => b.id === (domain.template || 'proxy'))?.name}</span>
                                </div>
                            </div>

                            {domain.upstream?.includes(',') && (
                                <>
                                    <div className={clsx(
                                        "flex items-center gap-2 p-2 rounded-md border",
                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)]" : "bg-white/5 border-white/5"
                                    )}>
                                        <div className="p-1 rounded bg-indigo-500/10 text-indigo-500">
                                            <Activity className="w-3 h-3" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[7px] font-black uppercase tracking-widest opacity-40">LB Policy</span>
                                            <span className="text-[9px] font-bold uppercase truncate">{domain.lb_policy || 'random'}</span>
                                        </div>
                                    </div>
                                    <div className={clsx(
                                        "flex items-center gap-2 p-2 rounded-md border",
                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)]" : "bg-white/5 border-white/5"
                                    )}>
                                        <div className={clsx("p-1 rounded", domain.health_check_enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500")}>
                                            <ShieldCheck className="w-3 h-3" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Monitoring</span>
                                            <span className="text-[9px] font-bold uppercase truncate">{domain.health_check_enabled ? 'ACTIVE' : 'OFF'}</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {domain.auth_user && (
                                <div className={clsx(
                                    "flex items-center gap-2 p-2 rounded-md border",
                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)]" : "bg-white/5 border-white/5"
                                )}>
                                    <div className="p-1 rounded bg-amber-500/10 text-amber-500">
                                        <Lock className="w-3 h-3" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Security</span>
                                        <span className="text-[9px] font-bold uppercase truncate">Basic Auth</span>
                                    </div>
                                </div>
                            )}

                            {domain.enable_logging === 1 && (
                                <div className={clsx(
                                    "flex items-center gap-2 p-2 rounded-md border",
                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)]" : "bg-white/5 border-white/5"
                                )}>
                                    <div className="p-1 rounded bg-emerald-500/10 text-emerald-500">
                                        <FileText className="w-3 h-3" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Observability</span>
                                        <span className="text-[9px] font-bold uppercase truncate">Logs ON</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={clsx(
                            "mt-auto pt-6 border-t",
                            theme === 'manager' || theme === 'flat' ? "border-[var(--glass-border)]" : "border-white/5"
                        )}>
                            <div className="flex items-center justify-between group/proxy">
                                <div className="space-y-1 overflow-hidden">
                                    <p className={clsx("text-[9px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-500")}>Upstream Vector</p>
                                    <div className="flex items-center gap-2">
                                        <p className={clsx("font-mono text-[11px] leading-tight truncate", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-[var(--accent-secondary)]")}>
                                            <span className="opacity-40 uppercase font-black mr-1">{domain.upstream_proto || 'http'}://</span>
                                            {domain.upstream.replace('https://', '').replace('http://', '')}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className={clsx("w-4 h-4 transition-transform group-hover/proxy:translate-x-1", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)] opacity-40" : "text-slate-600")} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={clsx(
                            "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed",
                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] hover:bg-[var(--base-bg)] text-[var(--muted-text)]" : "bg-white/5 hover:bg-white/10 text-white"
                        )}
                    >
                        Previous
                    </button>
                    <span className={clsx(
                        "text-xs font-mono font-bold mx-4",
                        theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white"
                    )}>
                        Page <span className="text-[var(--accent-primary)]">{currentPage}</span> of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={clsx(
                            "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed",
                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] hover:bg-[var(--base-bg)] text-[var(--muted-text)]" : "bg-white/5 hover:bg-white/10 text-white"
                        )}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleConfirmDelete}
                domainName={deleteModal.domainHost}
                theme={theme}
            />

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className={clsx(
                                "relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-all duration-300",
                                theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)]/95 backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl" : "prism-card bg-black/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl border border-white/10"
                            )}
                        >
                            <div className={clsx("flex justify-between items-center p-8 border-b z-10 relative", theme === 'manager' || theme === 'flat' ? "border-[var(--glass-border)]" : "border-white/5")}>
                                <div>
                                    <h3 className={clsx("text-2xl font-black tracking-tighter italic uppercase", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>{editingDomain ? 'Edit Site Config' : 'Initialize Site'}</h3>
                                    <p className={clsx("text-xs font-mono mt-1 opacity-60", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Configure your application deployment settings.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className={clsx("p-2 rounded-full transition-colors", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)] hover:text-[var(--base-text)] hover:bg-[var(--base-bg)]" : "text-slate-400 hover:text-white")}><X className="w-6 h-6" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                                {/* Tab Navigation */}
                                <div className={clsx("flex items-center gap-2 p-1 rounded-xl mb-8 w-fit", theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)]" : "bg-white/5 border border-white/5")}>
                                    <button
                                        onClick={() => setActiveTab('general')}
                                        className={clsx(
                                            "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
                                            activeTab === 'general'
                                                ? (theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] text-[var(--accent-primary)] shadow-sm" : "bg-white/10 text-white shadow-sm")
                                                : (theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)] hover:text-[var(--base-text)]" : "text-slate-500 hover:text-white")
                                        )}
                                    >
                                        General Settings
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={clsx(
                                            "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
                                            activeTab === 'security'
                                                ? (theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] text-rose-500 shadow-sm" : "bg-rose-500/20 text-rose-400 shadow-sm")
                                                : (theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)] hover:text-rose-500" : "text-slate-500 hover:text-rose-400")
                                        )}
                                    >
                                        Security Rules
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {activeTab === 'general' && (
                                        <>
                                            {/* Blueprint Selector */}
                                            <div className="mb-10">
                                                <div className="flex items-center gap-2 mb-4 px-1">
                                                    <label className={clsx("text-[10px] font-black uppercase tracking-[0.2em] block opacity-50", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Choose Site Blueprint</label>
                                                    <GuideTooltip text="Select a pre-configured template optimized for your specific application type." />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    {BLUEPRINTS.map((bp) => (
                                                        <button
                                                            key={bp.id}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, template: bp.id })}
                                                            className={clsx(
                                                                "p-4 text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-28",
                                                                formData.template === bp.id
                                                                    ? (theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)] shadow-md" : "bg-white/10 border-[var(--accent-primary)] border-2 shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.2)]")
                                                                    : (theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] hover:border-slate-300 hover:shadow-sm" : "bg-black/40 border-white/5 hover:border-white/20"),
                                                                (theme === 'manager' || theme === 'flat') ? "rounded-xl border" : "rounded-sm border"
                                                            )}
                                                        >
                                                            <div className="flex items-start justify-between relative z-10 w-full">
                                                                <div className={clsx(
                                                                    "p-2 rounded-lg transition-colors",
                                                                    formData.template === bp.id ? "bg-[var(--accent-primary)] text-white" : "bg-white/5 text-slate-500 group-hover:text-slate-400"
                                                                )}>
                                                                    <bp.icon className="w-5 h-5" />
                                                                </div>
                                                                {formData.template === bp.id && <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />}
                                                            </div>
                                                            <div className="relative z-10 mt-auto">
                                                                <p className={clsx("text-[8px] font-black tracking-widest uppercase mb-1 opacity-60", formData.template === bp.id ? "text-[var(--accent-primary)]" : "text-slate-500")}>{bp.subtitle}</p>
                                                                <p className={clsx("text-sm font-black tracking-tight", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>{bp.name}</p>
                                                            </div>
                                                            {formData.template === bp.id && (
                                                                <motion.div layoutId="bp-active" className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent pointer-events-none" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="mt-4 p-4 rounded-lg flex items-start gap-3 border border-dashed border-slate-300/30">
                                                    <Info className="w-4 h-4 text-[var(--accent-primary)] mt-0.5 shrink-0" />
                                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                                        {BLUEPRINTS.find(b => b.id === formData.template)?.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <label className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Entry Hostname</label>
                                                        <GuideTooltip text="The public domain name (e.g., app.example.com) where your site will be accessible." />
                                                    </div>
                                                    <input
                                                        required
                                                        value={formData.host}
                                                        onChange={e => setFormData({ ...formData, host: e.target.value })}
                                                        placeholder="e.g. cloud.example.com"
                                                        className={clsx(
                                                            "w-full px-6 py-4 font-mono text-sm outline-none transition-all",
                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/10 rounded-xl shadow-sm" : "bg-black/40 border border-white/10 text-white focus:border-[var(--accent-primary)] rounded-md"
                                                        )}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center px-1">
                                                        <div className="flex items-center gap-2">
                                                            <label className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>
                                                                {formData.template === 'static' || formData.template === 'php' ? 'Project Path' : 'Upstream Target'}
                                                            </label>
                                                            <GuideTooltip text={formData.template === 'static' || formData.template === 'php' ? "Absolute filesystem path to your website files." : "Address of the backend service (e.g., localhost:3000)."} />
                                                        </div>
                                                        <span className="text-[9px] font-mono text-slate-600 opacity-60 italic">
                                                            {BLUEPRINTS.find(b => b.id === formData.template)?.caddy_hint}
                                                        </span>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-1 z-10">
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, upstream_proto: formData.upstream_proto === 'https' ? 'http' : 'https' })}
                                                                className={clsx(
                                                                    "h-[calc(100%-8px)] px-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 rounded-lg ml-1",
                                                                    formData.upstream_proto === 'https'
                                                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                                                )}
                                                            >
                                                                {formData.upstream_proto === 'https' ? <Shield className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                                                {formData.upstream_proto}
                                                            </button>
                                                        </div>
                                                        <input
                                                            required
                                                            value={formData.upstream}
                                                            onChange={e => setFormData({ ...formData, upstream: e.target.value })}
                                                            placeholder={formData.template === 'static' ? "/var/www/dist" : "e.g. localhost:8080, localhost:8081"}
                                                            className={clsx(
                                                                "w-full pl-28 pr-6 py-4 font-mono text-sm outline-none transition-all",
                                                                theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] focus:border-[var(--accent-secondary)] focus:ring-2 focus:ring-[var(--accent-secondary)]/10 rounded-xl shadow-sm" : "bg-black/40 border border-white/10 text-white focus:border-[var(--accent-secondary)] rounded-md"
                                                            )}
                                                        />
                                                    </div>
                                                    {formData.upstream.includes(',') && (
                                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Selection Policy</label>
                                                                <select
                                                                    value={formData.lb_policy}
                                                                    onChange={e => setFormData({ ...formData, lb_policy: e.target.value })}
                                                                    className={clsx(
                                                                        "w-full px-4 py-3 text-[10px] outline-none transition-all focus:ring-2 focus:ring-[var(--accent-secondary)]/20",
                                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-lg" : "bg-black/40 border border-white/10 text-white rounded-sm"
                                                                    )}
                                                                >
                                                                    <option value="random">Random (Default)</option>
                                                                    <option value="round_robin">Round Robin</option>
                                                                    <option value="least_conn">Least Connections</option>
                                                                    <option value="first">First Available (Failover)</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Health Checks</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setFormData({ ...formData, health_check_enabled: !formData.health_check_enabled })}
                                                                        className={clsx(
                                                                            "w-8 h-4 rounded-full transition-all duration-300 relative",
                                                                            formData.health_check_enabled ? "bg-[var(--accent-secondary)]" : "bg-slate-400/20"
                                                                        )}
                                                                    >
                                                                        <div className={clsx(
                                                                            "absolute top-1 w-2 h-2 rounded-full bg-white transition-all duration-300",
                                                                            formData.health_check_enabled ? "right-1" : "left-1"
                                                                        )} />
                                                                    </button>
                                                                </div>
                                                                {formData.health_check_enabled && (
                                                                    <input
                                                                        type="text"
                                                                        value={formData.health_check_path}
                                                                        onChange={e => setFormData({ ...formData, health_check_path: e.target.value })}
                                                                        placeholder="Path (e.g. /)"
                                                                        className={clsx(
                                                                            "w-full px-4 py-2 text-[10px] outline-none font-mono",
                                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-lg" : "bg-black/40 border border-white/10 text-white rounded-sm"
                                                                        )}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, health_check_enabled: !formData.health_check_enabled })}
                                                        className={clsx(
                                                            "w-10 h-5 relative transition-all rounded-full",
                                                            formData.health_check_enabled ? "bg-emerald-500" : "bg-slate-700"
                                                        )}
                                                    >
                                                        <div className={clsx("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", formData.health_check_enabled ? "left-6" : "left-1")} />
                                                    </button>
                                                </div>
                                            </div>


                                            {/* Custom Header Rules */}
                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <div className="flex justify-between items-center px-1">
                                                    <div className="flex items-center gap-2">
                                                        <label className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Edge Request Rules (Headers)</label>
                                                        <GuideTooltip
                                                            text="Modify HTTP headers for incoming requests before they reach your application."
                                                            onLearnMore={() => {
                                                                if (onNavigate) {
                                                                    onNavigate('docs');
                                                                    setTimeout(() => {
                                                                        document.getElementById('infra')?.scrollIntoView({ behavior: 'smooth' });
                                                                    }, 100);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, header_rules: [...formData.header_rules, { op: 'set', name: '', value: '' }] })}
                                                        className="text-[10px] font-black text-[var(--accent-primary)] hover:underline flex items-center gap-1 uppercase"
                                                    >
                                                        <Plus className="w-3 h-3" /> Add Rule
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {formData.header_rules.map((rule, idx) => (
                                                        <div key={idx} className="flex gap-2 items-center">
                                                            <select
                                                                value={rule.op}
                                                                onChange={e => {
                                                                    const newRules = [...formData.header_rules];
                                                                    newRules[idx].op = e.target.value;
                                                                    setFormData({ ...formData, header_rules: newRules });
                                                                }}
                                                                className={clsx(
                                                                    "px-2 py-3 text-[10px] outline-none w-20",
                                                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-lg" : "bg-black/40 border border-white/10 text-white rounded-sm"
                                                                )}
                                                            >
                                                                <option value="set">SET</option>
                                                                <option value="add">ADD</option>
                                                                <option value="delete">DEL</option>
                                                            </select>
                                                            <input
                                                                placeholder="Header Name"
                                                                value={rule.name}
                                                                onChange={e => {
                                                                    const newRules = [...formData.header_rules];
                                                                    newRules[idx].name = e.target.value;
                                                                    setFormData({ ...formData, header_rules: newRules });
                                                                }}
                                                                className={clsx(
                                                                    "flex-1 px-4 py-3 text-[10px] font-mono outline-none",
                                                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-lg" : "bg-black/40 border border-white/10 text-white rounded-sm"
                                                                )}
                                                            />
                                                            {rule.op !== 'delete' && (
                                                                <input
                                                                    placeholder="Value"
                                                                    value={rule.value}
                                                                    onChange={e => {
                                                                        const newRules = [...formData.header_rules];
                                                                        newRules[idx].value = e.target.value;
                                                                        setFormData({ ...formData, header_rules: newRules });
                                                                    }}
                                                                    className={clsx(
                                                                        "flex-1 px-4 py-3 text-[10px] font-mono outline-none",
                                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-lg" : "bg-black/40 border border-white/10 text-white rounded-sm"
                                                                    )}
                                                                />
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, header_rules: formData.header_rules.filter((_, i) => i !== idx) })}
                                                                className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 px-1">
                                                    <label className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Identity Logo URL (Optional)</label>
                                                    <GuideTooltip text="URL to a small square image/icon used to represent this service in the dashboard." />
                                                </div>
                                                <input
                                                    value={formData.logo}
                                                    onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                                    placeholder="https://example.com/logo.png"
                                                    className={clsx(
                                                        "w-full px-6 py-4 font-mono text-sm outline-none transition-all",
                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border border-[var(--glass-border)] text-[var(--base-text)] focus:border-[var(--accent-secondary)] rounded-lg shadow-inner" : "bg-black/40 border border-white/10 text-white focus:border-[var(--accent-secondary)] rounded-sm"
                                                    )}
                                                />
                                            </div>

                                        </>
                                    )}


                                    {activeTab === 'security' && (
                                        <div className="space-y-6">
                                            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Shield className="w-5 h-5 text-rose-500" />
                                                    <h4 className={clsx("text-sm font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-white")}>Access Control</h4>
                                                </div>
                                                <p className={clsx("text-xs leading-relaxed", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>
                                                    Restrict access to your site by blocking specific IP addresses or CIDR ranges.
                                                    Blocked users will receive a <code className="bg-black/20 px-1 rounded">403 Forbidden</code> response.
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 px-1">
                                                    <label className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Blocked IP Addresses</label>
                                                    <GuideTooltip text="Enter IP addresses or CIDR ranges separated by commas (e.g., 192.168.1.5, 10.0.0.0/24)" />
                                                </div>
                                                <textarea
                                                    value={formData.blocked_ips}
                                                    onChange={e => setFormData({ ...formData, blocked_ips: e.target.value })}
                                                    placeholder="e.g. 1.2.3.4, 10.0.0.0/24"
                                                    rows={5}
                                                    className={clsx(
                                                        "w-full px-6 py-4 font-mono text-xs outline-none transition-all resize-none",
                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 rounded-xl shadow-inner" : "bg-black/40 border border-white/10 text-white focus:border-rose-500 rounded-lg"
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-3 pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-2 px-1">
                                                    <label className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Allowed IP Addresses (Whitelist)</label>
                                                    <GuideTooltip text="STRICT WHITELIST: If any IP is entered here, ALL other IPs will be BLOCKED. Supports CIDR ranges." />
                                                </div>
                                                <textarea
                                                    value={formData.allowed_ips || ''}
                                                    onChange={e => setFormData({ ...formData, allowed_ips: e.target.value })}
                                                    placeholder="e.g. 192.168.1.100, 10.0.0.0/8"
                                                    rows={5}
                                                    className={clsx(
                                                        "w-full px-6 py-4 font-mono text-xs outline-none transition-all resize-none",
                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl shadow-inner" : "bg-black/40 border border-white/10 text-white focus:border-emerald-500 rounded-lg"
                                                    )}
                                                />
                                                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest px-1">Warning: Setting this will block all traffic not in this list.</p>
                                            </div>


                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className={clsx(
                                                    "flex items-center justify-between p-5 border transition-all",
                                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-lg" : "bg-white/5 border-white/5 rounded-sm"
                                                )}>
                                                    <div className="flex items-center gap-2">
                                                        <span className={clsx("text-[11px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Enforce Edge TLS</span>
                                                        <GuideTooltip text="Automatically manages SSL certificates (Let's Encrypt / ZeroSSL) for secure HTTPS connections." />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, ssl: !formData.ssl })}
                                                        className={clsx(
                                                            "w-12 h-6 transition-all relative rounded-full",
                                                            formData.ssl
                                                                ? "bg-[var(--accent-primary)] shadow-inner"
                                                                : (theme === 'manager' || theme === 'flat' ? "bg-slate-200" : "bg-slate-700")
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "absolute top-1 w-4 h-4 transition-all bg-white rounded-full shadow-sm",
                                                            formData.ssl ? "left-7" : "left-1"
                                                        )} />
                                                    </button>
                                                </div>
                                                <div className={clsx(
                                                    "flex items-center justify-between p-5 border transition-all",
                                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-lg" : "bg-white/5 border-white/5 rounded-sm"
                                                )}>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={clsx("text-[11px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Force SSL</span>
                                                            <GuideTooltip text="Redirects all HTTP traffic to HTTPS, ensuring a secure connection." />
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, force_ssl: !formData.force_ssl })}
                                                        className={clsx(
                                                            "w-12 h-6 transition-all relative",
                                                            theme === 'manager' || theme === 'flat' ? (formData.force_ssl ? "bg-[var(--accent-primary)]" : "bg-[var(--surface-bg)] border border-[var(--glass-border)]") : (formData.force_ssl ? "bg-[var(--accent-primary)]" : "bg-slate-800"),
                                                            theme === 'horizon' ? "rounded-full" : "rounded-none",
                                                            (theme === 'manager' || theme === 'flat') && "rounded-full"
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "absolute top-1 w-4 h-4 transition-all bg-white shadow-sm",
                                                            formData.force_ssl ? "left-7" : "left-1",
                                                            (theme === 'manager' || theme === 'flat' || theme === 'horizon') ? "rounded-full" : "rounded-none"
                                                        )} />
                                                    </button>
                                                </div>

                                                {(formData.template === 'static' || formData.template === 'php') && (
                                                    <div className={clsx(
                                                        "flex items-center justify-between p-5 border transition-all md:col-span-2",
                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-lg" : "bg-white/5 border-white/5 rounded-sm"
                                                    )}>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={clsx("text-[11px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Directory Browsing</span>
                                                                <GuideTooltip text="Enables a visual file manager for users to browse directories (Static/PHP only)." />
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <label className={clsx("text-[10px] font-black uppercase tracking-widest block", theme === 'manager' || theme === 'flat' ? "text-[var(--base-text)]" : "text-slate-300")}>Directory Browsing</label>
                                                                    <p className={clsx("text-[9px] italic mt-0.5", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-500")}>Enables modern file browser UI for folders</p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, file_browse_enabled: !formData.file_browse_enabled })}
                                                                    className={clsx(
                                                                        "w-12 h-6 transition-all relative rounded-full",
                                                                        formData.file_browse_enabled
                                                                            ? "bg-[var(--accent-primary)] shadow-inner"
                                                                            : (theme === 'manager' || theme === 'flat' ? "bg-slate-200" : "bg-slate-700")
                                                                    )}
                                                                >
                                                                    <div className={clsx(
                                                                        "absolute top-1 w-4 h-4 transition-all bg-white rounded-full shadow-sm",
                                                                        formData.file_browse_enabled ? "left-7" : "left-1"
                                                                    )} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {formData.ssl && (
                                                    <div className={clsx(
                                                        "p-5 space-y-6 border transition-all",
                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-lg" : "bg-white/5 border-white/5 rounded-sm"
                                                    )}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={clsx("text-[11px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>DNS-01 Challenge</span>
                                                                    {formData.host?.startsWith('*.') && (
                                                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-tighter">Required for Wildcard</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[9px] text-slate-500 italic">Required for wildcard certificates and behind NAT.</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <label className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-500")}>DNS Provider</label>
                                                            <select
                                                                value={formData.dns_provider || ''}
                                                                onChange={e => setFormData({ ...formData, dns_provider: e.target.value, dns_data: {} })}
                                                                className={clsx(
                                                                    "w-full px-5 py-3.5 font-mono text-xs outline-none transition-all appearance-none cursor-pointer",
                                                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-xl focus:border-[var(--accent-primary)] shadow-sm" : "bg-black/40 border border-white/5 text-white rounded-md focus:border-cyan-500/30"
                                                                )}
                                                            >
                                                                <option value="">None (Standard HTTP Challenge)</option>
                                                                <option value="cloudflare">Cloudflare</option>
                                                                <option value="digitalocean">DigitalOcean</option>
                                                                <option value="route53">AWS Route53</option>
                                                                <option value="duckdns">DuckDNS</option>
                                                                <option value="gandi">Gandi</option>
                                                                <option value="cloudns">ClouDNS</option>
                                                                <option value="googlecloud">Google Cloud DNS</option>
                                                                <option value="azure">Azure</option>
                                                                <option value="porkbun">Porkbun</option>
                                                                <option value="namecheap">Namecheap</option>
                                                                <option value="linode">Linode</option>
                                                                <option value="hetzner">Hetzner</option>
                                                                <option value="vultr">Vultr</option>
                                                                <option value="ovh">OVH</option>
                                                                <option value="generic">Custom/Other Provider</option>
                                                            </select>
                                                        </div>

                                                        {formData.dns_provider === 'cloudflare' && (
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">API Token</label>
                                                                <input
                                                                    type="password"
                                                                    placeholder="Cloudflare API Token"
                                                                    value={formData.dns_data?.api_token || ''}
                                                                    onChange={e => setFormData({ ...formData, dns_data: { ...formData.dns_data, api_token: e.target.value } })}
                                                                    className={clsx(
                                                                        "w-full px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                    )}
                                                                />
                                                            </div>
                                                        )}

                                                        {formData.dns_provider === 'digitalocean' && (
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auth Token</label>
                                                                <input
                                                                    type="password"
                                                                    placeholder="DigitalOcean Personal Access Token"
                                                                    value={formData.dns_data?.auth_token || ''}
                                                                    onChange={e => setFormData({ ...formData, dns_data: { ...formData.dns_data, auth_token: e.target.value } })}
                                                                    className={clsx(
                                                                        "w-full px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                    )}
                                                                />
                                                            </div>
                                                        )}

                                                        {formData.dns_provider === 'route53' && (
                                                            <div className="space-y-4">
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Key ID</label>
                                                                    <input
                                                                        placeholder="AWS Access Key ID"
                                                                        value={formData.dns_data?.access_key_id || ''}
                                                                        onChange={e => setFormData({ ...formData, dns_data: { ...formData.dns_data, access_key_id: e.target.value } })}
                                                                        className={clsx(
                                                                            "w-full px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secret Access Key</label>
                                                                    <input
                                                                        type="password"
                                                                        placeholder="AWS Secret Access Key"
                                                                        value={formData.dns_data?.secret_access_key || ''}
                                                                        onChange={e => setFormData({ ...formData, dns_data: { ...formData.dns_data, secret_access_key: e.target.value } })}
                                                                        className={clsx(
                                                                            "w-full px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Region (Optional)</label>
                                                                    <input
                                                                        placeholder="us-east-1"
                                                                        value={formData.dns_data?.region || ''}
                                                                        onChange={e => setFormData({ ...formData, dns_data: { ...formData.dns_data, region: e.target.value } })}
                                                                        className={clsx(
                                                                            "w-full px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {formData.dns_provider === 'duckdns' && (
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">API Token</label>
                                                                <input
                                                                    type="password"
                                                                    placeholder="DuckDNS Token"
                                                                    value={formData.dns_data?.api_token || ''}
                                                                    onChange={e => setFormData({ ...formData, dns_data: { ...formData.dns_data, api_token: e.target.value } })}
                                                                    className={clsx(
                                                                        "w-full px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                    )}
                                                                />
                                                            </div>
                                                        )}

                                                        {formData.dns_provider === 'cloudns' && (
                                                            <div className="space-y-4">
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auth ID (User ID)</label>
                                                                    <input
                                                                        placeholder="ClouDNS Auth ID"
                                                                        value={formData.dns_data?.auth_id || ''}
                                                                        onChange={e => setFormData({ ...formData, dns_data: { ...formData.dns_data, auth_id: e.target.value } })}
                                                                        className={clsx(
                                                                            "w-full px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auth Password</label>
                                                                    <input
                                                                        type="password"
                                                                        placeholder="ClouDNS Auth Password"
                                                                        value={formData.dns_data?.auth_password || ''}
                                                                        onChange={e => setFormData({ ...formData, dns_data: { ...formData.dns_data, auth_password: e.target.value } })}
                                                                        className={clsx(
                                                                            "w-full px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {formData.dns_provider === 'porkbun' && (
                                                            <div className="space-y-4">
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">API Key</label>
                                                                    <input
                                                                        placeholder="Porkbun API Key"
                                                                        value={formData.dns_data?.api_key || ''}
                                                                        onChange={e => setFormData({ ...formData, dns_data: { ...formData.dns_data, api_key: e.target.value } })}
                                                                        className={clsx(
                                                                            "w-full px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">API Secret Key</label>
                                                                    <input
                                                                        type="password"
                                                                        placeholder="Porkbun API Secret Key"
                                                                        value={formData.dns_data?.api_secret_key || ''}
                                                                        onChange={e => setFormData({ ...formData, dns_data: { ...formData.dns_data, api_secret_key: e.target.value } })}
                                                                        className={clsx(
                                                                            "w-full px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {formData.dns_provider === 'generic' && (
                                                            <div className="space-y-4">
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Module Name</label>
                                                                    <input
                                                                        placeholder="e.g. namecheap"
                                                                        value={formData.dns_provider_custom || ''}
                                                                        onChange={e => setFormData({ ...formData, dns_provider_custom: e.target.value })}
                                                                        className={clsx(
                                                                            "w-full px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Configuration (JSON)</label>
                                                                    <textarea
                                                                        placeholder='{ "api_key": "..." }'
                                                                        rows={4}
                                                                        value={typeof formData.dns_data === 'object' ? JSON.stringify(formData.dns_data, null, 2) : formData.dns_data}
                                                                        onChange={e => {
                                                                            try {
                                                                                const parsed = JSON.parse(e.target.value);
                                                                                setFormData({ ...formData, dns_data: parsed });
                                                                            } catch (err) {
                                                                                setFormData({ ...formData, dns_data: e.target.value });
                                                                            }
                                                                        }}
                                                                        className={clsx(
                                                                            "w-full px-4 py-3 font-mono text-xs outline-none transition-all resize-none",
                                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-md focus:border-cyan-500/50" : "bg-black/40 border border-white/5 text-white rounded-sm focus:border-cyan-500/30"
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className={clsx(
                                                                "flex items-center justify-between p-5 border transition-all",
                                                                theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)]/50 rounded-lg" : "bg-white/5 border-white/5 rounded-sm"
                                                            )}>
                                                                <span className={clsx("text-[10px] font-bold uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-500")}>HTTP/2 Support</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, http2_enabled: !formData.http2_enabled })}
                                                                    className={clsx(
                                                                        "w-10 h-5 transition-all relative",
                                                                        theme === 'manager' || theme === 'flat' ? (formData.http2_enabled ? "bg-[var(--accent-secondary)]" : "bg-[var(--base-bg)] border border-[var(--glass-border)]") : (formData.http2_enabled ? "bg-[var(--accent-secondary)]" : "bg-slate-800"),
                                                                        theme === 'horizon' ? "rounded-full" : "rounded-none",
                                                                        (theme === 'manager' || theme === 'flat') && "rounded-full"
                                                                    )}
                                                                >
                                                                    <div className={clsx(
                                                                        "absolute top-0.5 w-3.5 h-3.5 transition-all bg-white shadow-sm",
                                                                        formData.http2_enabled ? "left-[1.375rem]" : "left-0.5",
                                                                        (theme === 'manager' || theme === 'flat' || theme === 'horizon') ? "rounded-full" : "rounded-none"
                                                                    )} />
                                                                </button>
                                                            </div>
                                                            <div className={clsx(
                                                                "flex items-center justify-between p-5 border transition-all",
                                                                theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)]/50 rounded-lg" : "bg-white/5 border-white/5 rounded-sm"
                                                            )}>
                                                                <span className={clsx("text-[10px] font-bold uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-500")}>HSTS Enabled</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, hsts_enabled: !formData.hsts_enabled })}
                                                                    className={clsx(
                                                                        "w-10 h-5 transition-all relative",
                                                                        theme === 'manager' || theme === 'flat' ? (formData.hsts_enabled ? "bg-indigo-500" : "bg-[var(--base-bg)] border border-[var(--glass-border)]") : (formData.hsts_enabled ? "bg-indigo-500" : "bg-slate-800"),
                                                                        theme === 'horizon' ? "rounded-full" : "rounded-none",
                                                                        (theme === 'manager' || theme === 'flat') && "rounded-full"
                                                                    )}
                                                                >
                                                                    <div className={clsx(
                                                                        "absolute top-0.5 w-3.5 h-3.5 transition-all bg-white shadow-sm",
                                                                        formData.hsts_enabled ? "left-[1.375rem]" : "left-0.5",
                                                                        (theme === 'manager' || theme === 'flat' || theme === 'horizon') ? "rounded-full" : "rounded-none"
                                                                    )} />
                                                                </button>
                                                            </div>
                                                            {formData.hsts_enabled && (
                                                                <div className={clsx(
                                                                    "flex items-center justify-between p-5 border transition-all col-span-1 md:col-span-2",
                                                                    theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)]/50 rounded-lg" : "bg-white/5 border-white/5 rounded-sm"
                                                                )}>
                                                                    <div className="space-y-1">
                                                                        <span className={clsx("text-[10px] font-bold uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-500")}>HSTS sub-domains</span>
                                                                        <p className="text-[8px] text-slate-500 italic">Apply security policy to all underlying sub-sectors.</p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setFormData({ ...formData, hsts_subdomains: !formData.hsts_subdomains })}
                                                                        className={clsx(
                                                                            "w-10 h-5 transition-all relative",
                                                                            theme === 'manager' || theme === 'flat' ? (formData.hsts_subdomains ? "bg-indigo-600" : "bg-[var(--base-bg)] border border-[var(--glass-border)]") : (formData.hsts_subdomains ? "bg-indigo-600" : "bg-slate-800"),
                                                                            theme === 'horizon' ? "rounded-full" : "rounded-none",
                                                                            (theme === 'manager' || theme === 'flat') && "rounded-full"
                                                                        )}
                                                                    >
                                                                        <div className={clsx(
                                                                            "absolute top-0.5 w-3.5 h-3.5 transition-all bg-white shadow-sm",
                                                                            formData.hsts_subdomains ? "left-[1.375rem]" : "left-0.5",
                                                                            (theme === 'manager' || theme === 'flat' || theme === 'horizon') ? "rounded-full" : "rounded-none"
                                                                        )} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <label className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Traffic Normalization (Redirect Wizard)</label>
                                                        <GuideTooltip text="Automatically handle WWW vs Non-WWW redirects for better SEO and consistency." />
                                                    </div>
                                                    <div className="flex gap-2 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                                        {[
                                                            { id: 'off', label: 'No Redirect' },
                                                            { id: 'root', label: 'Force Root' },
                                                            { id: 'www', label: 'Force WWW' }
                                                        ].map((opt) => (
                                                            <button
                                                                key={opt.id}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, canonical_type: opt.id })}
                                                                className={clsx(
                                                                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
                                                                    formData.canonical_type === opt.id
                                                                        ? "bg-[var(--surface-bg)] text-[var(--accent-primary)] shadow-sm ring-1 ring-black/5"
                                                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                                                )}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 italic px-2">
                                                        {formData.canonical_type === 'root' && `Redirects www.${formData.host || 'domain'} → ${formData.host || 'domain'}`}
                                                        {formData.canonical_type === 'www' && `Redirects ${formData.host || 'domain'} → www.${formData.host || 'domain'}`}
                                                        {formData.canonical_type === 'off' && "No automatic traffic redirects will be applied."}
                                                    </p>
                                                </div>

                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <div className="flex items-center justify-between px-1">
                                                    <label className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Advanced Directives</label>
                                                </div>
                                                {/* Caddyfile Editor for Custom Blueprint */}
                                                {formData.template === 'custom' ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 px-1">
                                                            <label className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Caddyfile Directives</label>
                                                            <GuideTooltip text="Enter raw Caddyfile directives. These will be wrapped in your site block automatically." />
                                                        </div>
                                                        <textarea
                                                            value={formData.custom_config}
                                                            onChange={e => setFormData({ ...formData, custom_config: e.target.value })}
                                                            placeholder={`respond "Hello World" 200\n\n# Or advanced logic:\nreverse_proxy localhost:8080 {\n    header_up Host {host}\n}`}
                                                            rows={12}
                                                            className={clsx(
                                                                "w-full px-6 py-4 font-mono text-xs outline-none transition-all resize-y",
                                                                theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] focus:border-[var(--accent-secondary)] focus:ring-2 focus:ring-[var(--accent-secondary)]/10 rounded-xl shadow-inner" : "bg-black/40 border border-white/10 text-emerald-400 focus:border-[var(--accent-secondary)] rounded-md"
                                                            )}
                                                            spellCheck="false"
                                                        />
                                                        <p className="text-[10px] text-slate-500 font-mono bg-black/20 p-3 rounded border border-white/5">
                                                            <span className="text-[var(--accent-primary)]">{formData.host || 'example.com'}</span> {'{'}<br />
                                                            <span className="opacity-50 pl-4"># Your config will be inserted here</span><br />
                                                            {'}'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    // Standard Options
                                                    <>
                                                        <div className={clsx(
                                                            "flex items-center justify-between p-5 border transition-all mb-4",
                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-xl" : "bg-white/5 border-white/5 rounded-lg"
                                                        )}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={clsx("text-[10px] font-black uppercase tracking-widest", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Access Logging</span>
                                                                <GuideTooltip text="Log all HTTP requests to this site for analysis." />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, enable_logging: !formData.enable_logging })}
                                                                className={clsx(
                                                                    "w-12 h-6 transition-all relative rounded-full",
                                                                    formData.enable_logging
                                                                        ? "bg-emerald-500 shadow-inner"
                                                                        : (theme === 'manager' || theme === 'flat' ? "bg-slate-200" : "bg-slate-700")
                                                                )}
                                                            >
                                                                <div className={clsx(
                                                                    "absolute top-1 w-4 h-4 transition-all bg-white rounded-full shadow-sm",
                                                                    formData.enable_logging ? "left-7" : "left-1"
                                                                )} />
                                                            </button>
                                                        </div>

                                                        <div className={clsx(
                                                            "p-5 space-y-4 border transition-all",
                                                            theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] border-[var(--glass-border)] rounded-xl" : "bg-white/5 border-white/5 rounded-lg"
                                                        )}>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Lock className={clsx("w-4 h-4", formData.auth_user ? "text-amber-500" : "text-slate-600")} />
                                                                    <div>
                                                                        <span className={clsx("text-[10px] font-black uppercase tracking-widest block", theme === 'manager' || theme === 'flat' ? "text-[var(--muted-text)]" : "text-slate-400")}>Basic Authentication</span>
                                                                        <p className="text-[9px] text-slate-500 italic mt-0.5">Protect site with username & password</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <input
                                                                    placeholder="Username"
                                                                    value={formData.auth_user}
                                                                    onChange={e => setFormData({ ...formData, auth_user: e.target.value })}
                                                                    className={clsx(
                                                                        "px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-lg focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10" : "bg-black/40 border border-white/5 text-white rounded-md focus:border-amber-500/30"
                                                                    )}
                                                                />
                                                                <input
                                                                    type="password"
                                                                    placeholder="Password"
                                                                    value={formData.auth_pass}
                                                                    onChange={e => setFormData({ ...formData, auth_pass: e.target.value })}
                                                                    className={clsx(
                                                                        "px-4 py-3 font-mono text-xs outline-none transition-all",
                                                                        theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--base-text)] rounded-lg focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10" : "bg-black/40 border border-white/5 text-white rounded-md focus:border-amber-500/30"
                                                                    )}
                                                                />
                                                            </div>
                                                            {formData.auth_user && !formData.auth_pass && (
                                                                <p className="text-[9px] text-amber-500/70 italic flex items-center gap-1.5">
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    Authentication requires BOTH username and password to activate.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-6 mt-8 border-t border-dashed border-slate-300/20">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className={clsx(
                                                "px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl",
                                                theme === 'manager' || theme === 'flat' ? "bg-[var(--base-bg)] text-[var(--muted-text)] hover:text-[var(--base-text)] border border-[var(--glass-border)] hover:border-slate-300" : "bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:bg-white/10"
                                            )}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className={clsx(
                                                "flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                                                theme === 'manager' || theme === 'flat' ? "bg-[var(--accent-primary)] text-white shadow-[var(--accent-primary)]/20" : "bg-[var(--accent-primary)] text-[var(--base-bg)] shadow-[var(--accent-primary)]/20"
                                            )}
                                        >
                                            {editingDomain ? 'Save Configuration' : 'Deploy Site'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Domains;
