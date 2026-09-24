const fs = require('fs');

function setupLogger(app) {
    app.on('server:started', (port) => {
        const time = new Date().toISOString();
        const text = '[' + time + '] server:started: Сервер запущен на порту ' + port + '\n';
        fs.appendFile('logs.txt', text, (err) => {
            if (err) console.log('Ошибка записи в лог');
        });
    });

    app.on('request:received', (data) => {
        const time = new Date().toISOString();
        const text = '[' + time + '] request:received: ' + data.method + ' ' + data.url + '\n';
        fs.appendFile('logs.txt', text, (err) => {
            if (err) console.log('Ошибка записи в лог');
        });
    });

    app.on('server:stopped', () => {
        const time = new Date().toISOString();
        const text = '[' + time + '] server:stopped: Сервер остановлен\n';
        fs.appendFile('logs.txt', text, (err) => {
            if (err) console.log('Ошибка записи в лог');
        });
    });
}

module.exports = { setupLogger };