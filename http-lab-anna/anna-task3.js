const http = require('http');
const qs = require('querystring');

const LIMIT = 1048576;

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        let size = 0;
        req.on('data', c => {
            size += c.length;
            if (size > LIMIT) {
                reject(new Error('413'));
                req.destroy();
                return;
            }
            data += c.toString();
        });
        req.on('end', () => resolve(data));
        req.on('error', e => reject(e));
    });
}

const srv = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/echo') {
        try {
            const body = await readBody(req);
            const ct = req.headers['content-type'] || '';
            console.log('Размер тела: ' + Buffer.byteLength(body) + ' байт');

            if (ct.includes('application/json')) {
                try {
                    const obj = JSON.parse(body);
                    obj.group = '477';
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(obj, null, 2));
                } catch (e) {
                    res.writeHead(400);
                    res.end('Invalid JSON');
                }
            } else {
                res.writeHead(200, { 'Content-Type': ct || 'text/plain; charset=utf-8' });
                res.end(body);
            }
        } catch (e) {
            if (e.message === '413') {
                res.writeHead(413, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('413 Payload Too Large');
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        }
    } else if (req.method === 'POST' && req.url === '/form') {
        try {
            const body = await readBody(req);
            const obj = qs.parse(body);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(obj, null, 2));
        } catch (e) {
            res.writeHead(413);
            res.end('413 Payload Too Large');
        }
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

srv.listen(3000, () => console.log('Сервер на порту 3000'));