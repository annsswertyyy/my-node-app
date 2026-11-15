const http = require('http');

function log(method, path, code) {
    const t = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(`[${t}] ${method} ${path} ${code}`);
}

const srv = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Главная</h1>');
        log('GET', '/', 200);
    } else if (req.url === '/about') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>О сайте</h1>');
        log('GET', '/about', 200);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 — не найдено</h1>');
        log('GET', req.url, 404);
    }
});

srv.listen(3000, () => {
    console.log('Сервер на порту 3000');
});