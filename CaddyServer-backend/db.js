const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening database', err.message);
  else console.log('Connected to SQLite database.');
});

db.serialize(() => {
  // servers table with all fields from types.ts
  db.run(`CREATE TABLE IF NOT EXISTS servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    apiUrl TEXT NOT NULL,
    apiPort INTEGER NOT NULL,
    apiPath TEXT,
    requiresAuth INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    pullConfig INTEGER DEFAULT 1,
    status TEXT DEFAULT 'online',
    type TEXT DEFAULT 'managed',
    lastContact DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user TEXT,
    action TEXT,
    details TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    version TEXT,
    tags TEXT,
    content TEXT,
    status TEXT DEFAULT 'draft',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host TEXT NOT NULL,
    upstream TEXT NOT NULL,
    ssl INTEGER DEFAULT 1,
    type TEXT DEFAULT 'proxy',
    status TEXT DEFAULT 'active',
    logo TEXT,
    force_ssl INTEGER DEFAULT 1,
    http2_enabled INTEGER DEFAULT 1,
    hsts_enabled INTEGER DEFAULT 0,
    hsts_subdomains INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migration: Add columns if they don't exist
  db.all("PRAGMA table_info(domains)", (err, columns) => {
    if (err) return console.error('[DB] Failed to get table info for domains:', err.message);

    const alterTable = (column, type, defaultValue = null) => {
      const hasColumn = columns.some(c => c.name === column);
      if (!hasColumn) {
        let query = `ALTER TABLE domains ADD COLUMN ${column} ${type}`;
        if (defaultValue !== null) query += ` DEFAULT ${defaultValue}`;
        db.run(query, (err) => {
          if (err) console.error(`[DB] Migration failed: ${query} -`, err.message);
          else console.log(`[DB] Successfully added column ${column} to domains table.`);
        });
      }
    };

    alterTable('logo', 'TEXT');
    alterTable('dns_provider', 'TEXT');
    alterTable('dns_data', 'TEXT');
    alterTable('dns_provider_custom', 'TEXT');
    alterTable('force_ssl', 'INTEGER', 1);
    alterTable('http2_enabled', 'INTEGER', 1);
    alterTable('hsts_enabled', 'INTEGER', 0);
    alterTable('hsts_subdomains', 'INTEGER', 0);
    alterTable('custom_config', 'TEXT');
    alterTable('allowed_ips', 'TEXT', "''");
    alterTable('template', 'TEXT', "'proxy'");
    alterTable('canonical_type', 'TEXT', "'off'");
    alterTable('header_rules', 'TEXT', "'[]'");
    alterTable('lb_policy', 'TEXT', "'random'");
    alterTable('health_check_enabled', 'INTEGER', 0);
    alterTable('file_browse_enabled', 'INTEGER', 1);
    alterTable('upstream_proto', 'TEXT', "'http'");
    alterTable('auth_user', 'TEXT');
    alterTable('auth_pass', 'TEXT');
    alterTable('enable_logging', 'INTEGER', 0);
    alterTable('blocked_ips', 'TEXT', "''");
    alterTable('health_check_path', 'TEXT', "'/'");
  });

  // Migration for streams
  db.all("PRAGMA table_info(streams)", (err, columns) => {
    if (err) return;
    const hasProxyProtocol = columns.some(c => c.name === 'proxy_protocol');
    if (!hasProxyProtocol) {
      db.run("ALTER TABLE streams ADD COLUMN proxy_protocol TEXT");
    }
    const hasAllowedIps = columns.some(c => c.name === 'allowed_ips');
    if (!hasAllowedIps) {
      db.run("ALTER TABLE streams ADD COLUMN allowed_ips TEXT DEFAULT ''");
    }
    const hasBlockedIps = columns.some(c => c.name === 'blocked_ips');
    if (!hasBlockedIps) {
      db.run("ALTER TABLE streams ADD COLUMN blocked_ips TEXT DEFAULT ''");
    }
    const hasTemplate = columns.some(c => c.name === 'template');
    if (!hasTemplate) {
      db.run("ALTER TABLE streams ADD COLUMN template TEXT DEFAULT 'relay'");
    }
  });

  // Streams table for TCP/UDP port forwarding
  db.run(`CREATE TABLE IF NOT EXISTS streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    template TEXT DEFAULT 'relay',
    listen_port INTEGER NOT NULL,
    protocol TEXT DEFAULT 'tcp',
    upstream_host TEXT NOT NULL,
    upstream_port INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    allowed_ips TEXT DEFAULT '',
    blocked_ips TEXT DEFAULT '',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // App settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Users table for RBAC
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    permissions TEXT DEFAULT '[]',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default users (passwords are pre-hashed for stability in init)
  // admin: caddy123
  db.run(`INSERT OR IGNORE INTO users (username, passwordHash, role, permissions) 
          VALUES ('admin', '$2b$10$i9V60AVEL1o5qRYHJxot7erzkJrRm8xPE.xw1S1nSIq918pieWAz.', 'admin', '["common"]')`);

  // asifagaria: @dminkaka
  db.run(`INSERT OR IGNORE INTO users (username, passwordHash, role, permissions) 
          VALUES ('asifagaria', '$2b$10$r3znT/HsWxVPf2hsi8E.weh1yPpQBB7L3y4t2FqWUdkpTa225oeNq', 'superuser', '["all"]')`);

  // Insert default settings if not exists
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('app_title', 'Caddyserver WebUI')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('app_logo', '')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('footer_text', '© 2026 Caddyserver WebUI. All rights reserved.')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('footer_links', '[]')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('default_site_action', 'congratulations')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('default_site_html', '<!-- Enter your custom HTML content here -->')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('default_site_redirect_url', '')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('default_web_root', '')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('ads_enabled', '0')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('ad_mob_banner_id', '')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('ad_mob_interstitial_id', '')`);
});

module.exports = db;
