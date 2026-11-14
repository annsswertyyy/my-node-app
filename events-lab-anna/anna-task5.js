const { EventEmitter } = require('events');
const http = require('http');

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.map = {};
        this.stats = { events: {}, total: 0 };
        this.any = [];
        this.origEmit = this.emit.bind(this);

        this.emit = (name, ...args) => {
            if (name === 'newListener' || name === 'removeListener') {
                return this.origEmit(name, ...args);
            }
            this.stats.total++;
            this.stats.events[name] = (this.stats.events[name] || 0) + 1;

            this.any.forEach(fn => {
                try { fn(name, args); } catch (e) { console.error('Ошибка: ' + e.message); }
            });

            if (this.map[name]) {
                this.map[name].sort((a, b) => b.priority - a.priority);
                this.map[name].forEach(item => {
                    try { item.fn(...args); } catch (e) { console.error('[ERROR] [477] ' + e.message); }
                });
            }
            return true;
        };
    }

    on(name, fn, priority = 0) {
        if (!this.map[name]) this.map[name] = [];
        this.map[name].push({ fn, priority });
        return this;
    }

    once(name, fn, priority = 0) {
        const wrap = (...args) => {
            fn(...args);
            this.off(name, wrap);
        };
        wrap.orig = fn;
        return this.on(name, wrap, priority);
    }

    onAny(fn) { this.any.push(fn); }

    off(name, fn) {
        if (this.map[name]) {
            this.map[name] = this.map[name].filter(i => i.fn !== fn && i.fn.orig !== fn);
        }
    }

    getMetrics() {
        return { group: '477', events: this.stats.events, total: this.stats.total };
    }
}

const bus = new EventBus();

console.log('=== EventBus (группа 477) ===\n');

console.log('Приоритеты:');
bus.on('greet', () => console.log('[10] Высокий'), 10);
bus.on('greet', () => console.log('[5] Средний'), 5);
bus.on('greet', () => console.log('[0] Низкий'), 0);
bus.emit('greet', 'Аня');

console.log('\nWildcard:');
bus.onAny((name, args) => console.log('[onAny] ' + name + ': ' + JSON.stringify(args)));
bus.emit('greet', 'Аня');
bus.emit('info', '477');

console.log('\nOnce:');
let onceCalls = 0;
bus.once('tick', () => { onceCalls++; console.log('[tick] ' + onceCalls); });
bus.emit('tick');
bus.emit('tick');
bus.emit('tick');
console.log('once вызван: ' + onceCalls + ' раз');

console.log('\nОшибки:');
bus.on('test', () => { throw new Error('тест'); }, 10);
bus.on('test', () => { throw new Error('тест2'); }, 5);
bus.emit('test');

console.log('\nМетрики:');
const m = bus.getMetrics();
for (const e in m.events) console.log(e + ': ' + m.events[e]);
console.log('Всего: ' + m.total);

const srv = http.createServer((req, res) => {
    bus.emit('request', req.url);
    if (req.url === '/metrics') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(bus.getMetrics(), null, 2));
    } else {
        res.writeHead(200);
        res.end('OK');
    }
});

srv.listen(3000, () => {
    console.log('\nHTTP на порту 3000');
    console.log('Откройте http://localhost:3000/metrics');
    bus.emit('server:started', 3000);
});