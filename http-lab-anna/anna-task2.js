const http = require('http');

const srv = http.createServer((req, res) => {
    if (req.url === '/headers') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            headers: req.headers,
            method: req.method,
            url: req.url,
            httpVersion: req.httpVersion
        }, null, 2));
    } else if (req.url === '/headers/set') {
       res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Powered-By', 'Node.js');
        res.setHeader('X-Group', '477');
        res.setHeader('Cache-Control', 'no-cache');
        res.writeHead(200);
        res.end('<h1>Заголовки установлены</h1>');
    } else if (req.url === '/headers/check') {
        res.setHeader('X-Group', '477');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            hasContentType: res.hasHeader('Content-Type'),
            hasXGroup: res.hasHeader('X-Group'),
            hasUnknown: res.hasHeader('X-Unknown')
        }, null, 2));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

srv.listen(3000, () => console.log('Сервер на порту 3000'));