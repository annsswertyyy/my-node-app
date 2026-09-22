const http = require('http');

function calculatePi(digits) {
    let pi = 0;
    for (let k = 0; k < 100; k++) {
        pi += (1 / Math.pow(16, k)) * (
            4 / (8 * k + 1) -
            2 / (8 * k + 4) -
            1 / (8 * k + 5) -
            1 / (8 * k + 6)
        );
    }
    return pi.toFixed(digits);
}

const fio = 'Седура Анна';
const group = '477';
const journalNumber = 20;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(
        '<h1>' + fio + '</h1>' +
        '<p>Группа: ' + group + '</p>' +
        '<p>Число Пи (' + journalNumber + ' знаков): ' + calculatePi(journalNumber) + '</p>'
    );
});

server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});