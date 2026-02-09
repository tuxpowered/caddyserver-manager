const WebSocket = require('ws');
const pty = require('node-pty');
const os = require('os');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

function createTerminalServer(server) {
    const wss = new WebSocket.Server({ server, path: '/terminal' });

    wss.on('connection', (ws) => {
        console.log('[TERMINAL] New terminal session connected');

        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols: 80,
            rows: 24,
            cwd: process.env.HOME || '/home',
            env: process.env
        });

        ptyProcess.onData((data) => {
            try {
                ws.send(data);
            } catch (e) {
                // Client disconnected
            }
        });

        ws.on('message', (message) => {
            const msg = message.toString();

            // Handle resize messages
            if (msg.startsWith('RESIZE:')) {
                const [_, cols, rows] = msg.split(':');
                ptyProcess.resize(parseInt(cols), parseInt(rows));
                return;
            }

            ptyProcess.write(msg);
        });

        ws.on('close', () => {
            console.log('[TERMINAL] Terminal session closed');
            ptyProcess.kill();
        });

        ws.on('error', (err) => {
            console.error('[TERMINAL] WebSocket error:', err.message);
            ptyProcess.kill();
        });
    });

    console.log('[TERMINAL] WebSocket terminal server ready on /terminal');
    return wss;
}

module.exports = { createTerminalServer };
