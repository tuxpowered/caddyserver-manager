import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Globe } from 'lucide-react';

const NodeIdentity = ({ host, logo, globalLogo, theme, size = "large" }) => {
    const [imgError, setImgError] = useState(false);

    const initials = (() => {
        const cleanHost = host?.replace('www.', '') || '??';
        const mainPart = cleanHost.split('.')[0] || '';
        return `0X${mainPart.substring(0, 2).toUpperCase()}`;
    })();

    const isLarge = size === "large";
    const containerClass = isLarge ? "w-24 h-24" : "w-12 h-12 p-2";
    const imgClass = isLarge ? "w-12 h-12" : "w-full h-full";

    // Priority: Custom Logo -> Global Logo -> Branded Default -> App Default
    const initialSrc = useMemo(() => {
        if (logo) return logo;
        if (globalLogo) return globalLogo;
        return '/caddyserver-logo.png';
    }, [logo, globalLogo]);

    return (
        <div className={clsx(
            "flex items-center justify-center transition-all italic font-mono relative overflow-hidden",
            containerClass,
            theme === 'manager' || theme === 'flat' ? "bg-[var(--surface-bg)] border border-[var(--glass-border)] text-[var(--muted-text)] rounded-lg shadow-sm" : "prism-card border-white/10 bg-white/5 text-slate-700"
        )}>
            <div className={clsx(
                "absolute inset-0 flex items-center justify-center text-[var(--muted-text)] font-black tracking-tighter italic select-none pointer-events-none uppercase z-0 opacity-10",
                isLarge ? "text-xl" : "text-[8px]"
            )}>
                {initials}
            </div>
            {(initialSrc && !imgError) ? (
                <img
                    src={initialSrc}
                    alt=""
                    className={clsx(
                        imgClass,
                        "relative z-10 transition-all object-contain"
                    )}
                    style={{ filter: (theme === 'prism' && isLarge) ? 'drop-shadow(0 0 8px rgba(0, 242, 255, 0.4))' : 'none' }}
                    onError={() => setImgError(true)}
                />
            ) : (
                <Globe className={clsx(isLarge ? "w-10 h-10" : "w-5 h-5", "text-[var(--muted-text)] relative z-10 opacity-40")} />
            )}
        </div>
    );
};

export default NodeIdentity;
