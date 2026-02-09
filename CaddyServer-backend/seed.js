const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const servers = [
    {
        name: 'Edge-Gateway-01',
        description: 'Main production entry point for EMEA traffic.',
        tags: JSON.stringify(['production', 'edge', 'high-availability']),
        apiUrl: 'http://localhost',
        apiPort: 2019,
        apiPath: '/config/',
        requiresAuth: 0,
        isActive: 1,
        pullConfig: 1,
        status: 'online',
        type: 'managed'
    },
    {
        name: 'Staging-Service-Mesh',
        description: 'Internal testing cluster for new microservices.',
        tags: JSON.stringify(['staging', 'internal']),
        apiUrl: 'http://10.240.10.5',
        apiPort: 2019,
        apiPath: '/config/',
        requiresAuth: 0,
        isActive: 1,
        pullConfig: 0,
        status: 'online',
        type: 'managed'
    },
    {
        name: 'Legacy-Node-App',
        description: 'Monolithic application runner.',
        tags: JSON.stringify(['legacy', 'monolith']),
        apiUrl: 'http://192.168.1.50',
        apiPort: 2019,
        apiPath: '/config/',
        requiresAuth: 1,
        isActive: 0,
        pullConfig: 0,
        status: 'offline',
        type: 'managed'
    }
];

const configs = [
    {
        name: 'Global Load Balancer',
        description: 'Standard HTTP/S proxy with health checks.',
        version: '2.4.1',
        tags: JSON.stringify(['standard', 'lb']),
        content: JSON.stringify({
            apps: {
                http: {
                    servers: {
                        srv0: {
                            listen: [":443"],
                            routes: [{
                                handle: [{
                                    handler: "reverse_proxy",
                                    upstreams: [{ dial: "backend1:8080" }, { dial: "backend2:8080" }]
                                }]
                            }]
                        }
                    }
                }
            }
        }),
        status: 'published'
    },
    {
        name: 'Static CDN Config',
        description: 'Optimized delivery for static assets and media.',
        version: '1.0.5',
        tags: JSON.stringify(['cdn', 'static']),
        content: JSON.stringify({
            apps: {
                http: {
                    servers: {
                        static: {
                            listen: [":80"],
                            routes: [{
                                handle: [{
                                    handler: "file_server",
                                    root: "/var/www/cdn",
                                    browse: false
                                }]
                            }]
                        }
                    }
                }
            }
        }),
        status: 'published'
    },
    {
        name: 'Microservice Proxy',
        description: 'Simplified template for internal API routing.',
        version: '1.2.0',
        tags: JSON.stringify(['api', 'internal']),
        content: JSON.stringify({
            sites: [
                { host: 'api.local', proxyTo: 'localhost:5000', listenOn: ':80', type: 'API' },
                { host: 'admin.local', proxyTo: 'localhost:5001', listenOn: ':80', type: 'Admin' }
            ],
            listenAddresses: [':80'],
            admin: { listen: '0.0.0.0:2019' }
        }),
        status: 'published'
    }
];

db.serialize(() => {
    // Clear existing data (optional, but good for "demo mode")
    db.run('DELETE FROM servers');
    db.run('DELETE FROM configs');

    const insertServer = db.prepare(`INSERT INTO servers 
        (name, description, tags, apiUrl, apiPort, apiPath, requiresAuth, isActive, pullConfig, status, type) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    servers.forEach(s => {
        insertServer.run(s.name, s.description, s.tags, s.apiUrl, s.apiPort, s.apiPath, s.requiresAuth, s.isActive, s.pullConfig, s.status, s.type);
    });
    insertServer.finalize();

    const insertConfig = db.prepare(`INSERT INTO configs (name, description, version, tags, content, status) VALUES (?, ?, ?, ?, ?, ?)`);
    configs.forEach(c => {
        insertConfig.run(c.name, c.description, c.version, c.tags, c.content, c.status);
    });
    insertConfig.finalize();

    console.log('✅ Demo data seeded successfully!');
    db.close();
});
