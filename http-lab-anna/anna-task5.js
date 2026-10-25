const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const mws = [];
function use(fn) { mws.push(fn); }

const PUB = path.join(__dirname, 'public');
if (!fs.existsSync(PUB)) {
    fs.mkdirSync(PUB);
    fs.writeFileSync(path.join(PUB, 'index.html'), '<h1>Статика Ани</h1>');
    fs.writeFileSync(path.join(PUB, 'style.css'), 'body { color: blue; }');
}

const stats = {
    total: 0,
    byMethod: {},
    byStatus: {},
    group: '477',
    start: Date.now()
};

function logAccess(m, u, c) {
    const t = new Date().toISOString().slice(0, 19).replace('T', ' ');
    fs.appendFileSync('access.log', `[${t}] [477] ${m} ${u} ${c}\n`);
}

use((req, res, next) => {
    stats.total++;
    stats.byMethod[req.method] = (stats.byMethod[req.method] || 0) + 1;
    const origEnd = res.end.bind(res);
    res.end = (d) => {
        stats.byStatus[res.statusCode] = (stats.byStatus[res.statusCode] || 0) + 1;
        logAccess(req.method, req.url, res.statusCode);
        return origEnd(d);
    };
    res.setHeader('X-Group', '477');
    next();
});

const srv = http.createServer((req, res) => {
    let i = 0;
    function next() {
        if (i < mws.length) {
            const mw = mws[i++];
            try { mw(req, res, next); } catch (e) { res.writeHead(500); res.end('Error'); }
        } else {
            handle(req, res);
        }
    }
    next();
});

function handle(req, res) {
    const u = url.parse(req.url, true);
    const p = u.pathname;

    if (p === '/metrics') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            group: stats.group,
            total: stats.total,
            byMethod: stats.byMethod,
            byStatus: stats.byStatus,
            uptime: Math.floor((Date.now() - stats.start) / 1000)
        }, null, 2));
        return;
    }

    if (p.startsWith('/static/')) {
        if (req.url.includes('..') || req.url.includes('%2e') || req.url.includes('%2E')) {
            res.writeHead(403);
            res.end('403 Forbidden');
            return;
        }
        const fp = path.join(PUB, p.replace('/static/', ''));
        if (!fs.existsSync(fp)) { res.writeHead(404); res.end('Not Found'); return; }
        const ext = path.extname(fp);
        const mime = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : 'text/plain';
        res.writeHead(200, { 'Content-Type': mime + '; charset=utf-8', 'Cache-Control': 'max-age=60' });
        fs.createReadStream(fp).pipe(res);
        return;
    }

    if (p === '/stream') {
        const big = path.join(__dirname, 'big.txt');
        if (!fs.existsSync(big)) {
            let data = '';
            for (let i = 0; i < 100000; i++) data += 'Строка ' + i + '\n';
            fs.writeFileSync(big, data);
        }
        res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
        fs.createReadStream(big).pipe(res);
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>HTTP-сервер Ани (группа 477)</h1><p><a href="/metrics">/metrics</a> | <a href="/static/index.html">/static</a> | <a href="/stream">/stream</a></p>');
}

srv.listen(3000, () => {
    console.log('Сервер на порту 3000');
});

process.on('SIGINT', () => {
    console.log('Сервер остановлен');
    process.exit(0);
});