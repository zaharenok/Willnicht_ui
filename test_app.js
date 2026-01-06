#!/usr/bin/env node

/**
 * Simple Node.js test for Willnicht app
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const TEST_DIR = '/Users/oleg/PythonBox HD/Willnicht_ui';

// MIME types
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    let filePath = '.' + req.url;
    if (filePath === './') filePath = './test_app.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   Willnicht Test Server Running              ║
╠══════════════════════════════════════════════╣
║   URL:  http://127.0.0.1:${PORT}             ║
║   File: test_app.html                        ║
╚══════════════════════════════════════════════╝

Open this URL in your browser to test:
🌐 http://127.0.0.1:${PORT}/test_app.html

Press Ctrl+C to stop
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n\n🛑 Server stopped by user');
    server.close(() => {
        process.exit(0);
    });
});
