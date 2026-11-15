const http = require('http');
const url = require('url');

let students = [
    { id: 1, name: 'Иван', group: '477' },
    { id: 2, name: 'Мария', group: '477' }
];
let nextId = 3;

function log(method, path, code) {
    const t = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(`[${t}] [477] ${method} ${path} ${code}`);
}

function send(res, code, data) {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
}

const srv = http.createServer((req, res) => {
    const u = url.parse(req.url, true);
    const p = u.pathname;
    const q = u.query;
    const m = req.method;

    if (m === 'GET' && p === '/api/students') {
        let result = students;
        if (q.group) result = students.filter(s => s.group === q.group);
        send(res, 200, result);
        log(m, req.url, 200);
    } else if (m === 'GET' && /^\/api\/students\/\d+$/.test(p)) {
        const id = Number(p.split('/')[3]);
        const s = students.find(x => x.id === id);
        if (!s) { send(res, 404, { error: 'Not found' }); log(m, req.url, 404); }
        else { send(res, 200, s); log(m, req.url, 200); }
    } else if (m === 'POST' && p === '/api/students') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
            try {
                const d = JSON.parse(body);
                const s = { id: nextId++, name: d.name, group: d.group || '477' };
                students.push(s);
                send(res, 201, s);
                log(m, req.url, 201);
            } catch (e) {
                send(res, 400, { error: 'Bad JSON' });
                log(m, req.url, 400);
            }
        });
    } else if (m === 'PUT' && /^\/api\/students\/\d+$/.test(p)) {
        const id = Number(p.split('/')[3]);
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
            const s = students.find(x => x.id === id);
            if (!s) { send(res, 404, { error: 'Not found' }); log(m, req.url, 404); return; }
            try {
                const d = JSON.parse(body);
                if (d.name) s.name = d.name;
                send(res, 200, s);
                log(m, req.url, 200);
            } catch (e) {
                send(res, 400, { error: 'Bad JSON' });
                log(m, req.url, 400);
            }
        });
    } else if (m === 'DELETE' && /^\/api\/students\/\d+$/.test(p)) {
        const id = Number(p.split('/')[3]);
        const idx = students.findIndex(x => x.id === id);
        if (idx === -1) { send(res, 404, { error: 'Not found' }); log(m, req.url, 404); }
        else {
            students.splice(idx, 1);
            send(res, 200, { deleted: true, id });
            log(m, req.url, 200);
        }
    } else {
        send(res, 405, { error: 'Method Not Allowed' });
        log(m, req.url, 405);
    }
});

srv.listen(3000, () => console.log('Сервер на порту 3000'));