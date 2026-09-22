


const http = require('http');
const EventEmitter = require('events');
const logger = require('./logger');


class AppServer extends EventEmitter {
    constructor() {
        super();
        this.server = null;
    }

    start(port) {
        this.server = http.createServer((req, res) => {
            this.emit('request:received', { url: req.url, method: req.method });

         
            if (req.url.startsWith('/order/')) {
                const orderId = req.url.split('/')[2];
                orderHandler.processOrder(orderId);
            }

            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Hello from Event-Driven Server!');
        });

        this.server.listen(port, () => {
            this.emit('server:started', port);
        });
    }

    stop() {
        if (this.server) {
            this.server.close(() => {
                this.emit('server:stopped');
            });
        }
    }
}

class OrderHandler extends EventEmitter {
    processOrder(orderId) {
        this.emit('order:start', orderId);

        setTimeout(() => {
            this.emit('order:processing', 'Заказ #' + orderId + ': Идёт обработка...');
        }, 2000);

        setTimeout(() => {
            const sum = Math.floor(Math.random() * 900) + 100;
            this.emit('order:complete', { orderId: orderId, sum: sum });
        }, 4000);
    }
}


function calculatePi(digits) {
    let pi = 0;
    for (let i = 0; i < 1000000; i++) {
        if (i % 2 === 0) {
            pi += 1 / (2 * i + 1);
        } else {
            pi -= 1 / (2 * i + 1);
        }
    }
    return (pi * 4).toFixed(digits);
}


class UserTracker extends EventEmitter {
    trackAction(userId, action, metadata) {
        const eventData = {
            userId: userId,
            action: action,
            timestamp: new Date().toISOString(),
            metadata: metadata,
            id: Math.random().toString(36).substr(2, 9)
        };
        this.emit('user:action', eventData);
    }
}


const app = new AppServer();
const orderHandler = new OrderHandler();
const tracker = new UserTracker();


logger.setupLogger(app);


app.on('server:started', (port) => {
    console.log('Сервер запущен на порту ' + port);

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
 origin/main
});

app.on('request:received', (data) => {
    console.log('Получен запрос: ' + data.method + ' ' + data.url);
});

app.on('server:stopped', () => {
    console.log('Сервер остановлен');
});

orderHandler.on('order:start', (id) => {
    console.log('[order:start] Заказ #' + id + ' начат');
});

orderHandler.on('order:processing', (msg) => {
    console.log('[order:processing] ' + msg);
});

orderHandler.on('order:complete', (data) => {
    const pi = calculatePi(7);
    console.log('[order:complete] Заказ #' + data.orderId + ' завершён на сумму ' + data.sum + ' руб. PI = ' + pi);
});


tracker.on('user:action', (data) => {
    console.log('Пользователь ' + data.userId + ' совершил действие "' + data.action + '"');
    console.log('Время: ' + data.timestamp);
    console.log('ID события: ' + data.id);
    console.log('Доп. данные: ' + JSON.stringify(data.metadata));
    console.log('---');
});

tracker.trackAction('user1', 'login', { ip: '192.168.1.1' });
tracker.trackAction('user2', 'purchase', { item: 'book', price: 500 });
tracker.trackAction('user3', 'logout', { reason: 'timeout' });


app.start(3000);


setTimeout(() => {
    app.stop();
}, 15000);