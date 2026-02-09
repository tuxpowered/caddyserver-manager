import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as TerminalIcon, Activity } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

const WebTerminal = ({ theme }) => {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const wsRef = useRef(null);
    const fitAddonRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Prevent double initialization in React strict mode
        if (xtermRef.current) return;

        // Ensure container is available
        if (!terminalRef.current) return;

        // Create terminal instance
        const xterm = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
            theme: {
                background: 'var(--base-bg)',
                foreground: 'var(--base-text)',
                cursor: 'var(--accent-secondary)',
                cursorAccent: '#0f111a',
                selectionBackground: 'rgba(14, 165, 233, 0.2)',
                black: '#0f111a',
                red: '#f43f5e',
                green: '#10b981',
                yellow: '#f59e0b',
                blue: '#0ea5e9',
                magenta: '#8b5cf6',
                cyan: '#06b6d4',
                white: '#f8fafc',
                brightBlack: '#64748b',
                brightRed: '#fb7185',
                brightGreen: '#34d399',
                brightYellow: '#fbbf24',
                brightBlue: '#38bdf8',
                brightMagenta: '#a78bfa',
                brightCyan: '#22d3ee',
                brightWhite: '#ffffff',
            },
            rows: 24,
            cols: 80,
        });

        xtermRef.current = xterm;

        // Add addons
        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();
        xterm.loadAddon(fitAddon);
        xterm.loadAddon(webLinksAddon);
        fitAddonRef.current = fitAddon;

        // Mount terminal
        xterm.open(terminalRef.current);

        // Delay fit to ensure DOM is ready
        setTimeout(() => {
            try {
                fitAddon.fit();
            } catch (e) {
                console.log('Fit addon delayed, will retry on connect');
            }
        }, 100);

        // Connect to WebSocket - Dynamic Host Construction
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/terminal`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            setError(null);
            xterm.writeln('\x1b[1;36m╔═════════════════════════════════════════════════╗\x1b[0m');
            xterm.writeln('\x1b[1;36m║\x1b[0m  \x1b[1;33m⚡ CADDY-MANAGER - TERMINAL LYARINET.COM \x1b[0m       \x1b[1;36m║\x1b[0m');
            xterm.writeln('\x1b[1;36m╚═════════════════════════════════════════════════╝\x1b[0m');
            xterm.writeln('');

            // Send initial resize after connection
            setTimeout(() => {
                try {
                    fitAddon.fit();
                    const { cols, rows } = xterm;
                    ws.send(`RESIZE:${cols}:${rows}`);
                } catch (e) {
                    console.log('Resize error:', e);
                }
            }, 50);
        };

        ws.onmessage = (event) => {
            xterm.write(event.data);
        };

        ws.onerror = () => {
            setError('Connection error. Make sure the backend is running.');
            xterm.writeln('\x1b[31m✗ Connection error. Make sure the backend is running.\x1b[0m');
        };

        ws.onclose = () => {
            setConnected(false);
            xterm.writeln('\x1b[33m\r\n⚠ Terminal session ended.\x1b[0m');
        };

        // Handle terminal input
        xterm.onData((data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });

        // Handle resize
        const handleResize = () => {
            try {
                fitAddon.fit();
                if (ws.readyState === WebSocket.OPEN) {
                    const { cols, rows } = xterm;
                    ws.send(`RESIZE:${cols}:${rows}`);
                }
            } catch (e) {
                console.log('Resize error:', e);
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            if (xtermRef.current) {
                xtermRef.current.dispose();
                xtermRef.current = null;
            }
        };
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className={`text-xs font-bold uppercase tracking-widest ${connected ? 'text-green-400' : 'text-red-400'}`}>
                        {connected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                </div>
            </div>

            {/* Terminal Guide */}
            <div className="px-10 py-6 prism-card border-emerald-500/10 bg-emerald-500/5 relative overflow-hidden group">
                <div className="flex gap-8 items-start relative z-10">
                    <div className="p-3 prism-card border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shrink-0">
                        <TerminalIcon className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] italic">Terminal Connection: The Direct Engine Bridge</p>
                        <p className="text-[12px] text-slate-400 leading-relaxed font-medium tracking-wide">
                            Think of the Terminal as a <span className="text-white">Direct Bridge</span> to the ship's engine room. It lets you bypass the control panels and talk directly to the hardware for manual overrides, repairs, and deep system management.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div
                className="prism-card overflow-hidden flex flex-col"
                style={{
                    height: 'calc(100vh - 280px)',
                    minHeight: '400px',
                }}
            >
                <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center gap-3 shrink-0">
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    </div>
                    <span className="text-xs font-mono text-slate-400 ml-4 italic">bash — caddy-manager</span>
                </div>
                <div
                    ref={terminalRef}
                    className="flex-1 w-full h-full min-h-0 relative transition-all duration-500"
                    style={{ backgroundColor: 'var(--base-bg)' }}
                />
            </div>
        </div>
    );
};

export default WebTerminal;
