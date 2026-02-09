import React from 'react';
import clsx from 'clsx';

// Branded Logo Component
const CaddyLogo = ({ className = "w-6 h-6", glow = false, src }) => (
    <img
        src={src || "/caddyserver-logo.png"}
        alt="Caddyserver WebUI"
        className={clsx(
            className,
            "object-contain transition-all",
            glow && "drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]"
        )}
    />
);


export default CaddyLogo;
