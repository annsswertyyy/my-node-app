const { EventEmitter } = require('events');

class Plugins extends EventEmitter {
    constructor() {
        super();
        this.on('newListener', (name) => {
            console.log('[newListener] Добавлен: ' + name);
        });
        this.on('removeListener', (name) => {
            console.log('[removeListener] Удалён: ' + name);
        });
    }
    add(name) {
        console.log('\n[PLUGIN] Добавлен: ' + name);
        this.emit('plugin:add', name);
    }
    remove(name) {
        this.emit('plugin:remove', name);
        console.log('[PLUGIN] Удалён: ' + name);
    }
}

const pm = new Plugins();

function logFn(m) { console.log('Лог: ' + m); }

pm.on('log', logFn);
pm.add('Logger');

pm.on('alert', (m) => console.log('Алерт: ' + m));
pm.add('Alert');

pm.removeListener('log', logFn);
pm.remove('Logger');

console.log('\nУтечка:');
const leak = new EventEmitter();
for (let i = 0; i < 10; i++) leak.on('t', () => {});
console.log('До: ' + leak.listenerCount('t'));
for (let i = 0; i < 1000; i++) leak.on('t', () => {});
console.log('После 1000: ' + leak.listenerCount('t'));
leak.removeAllListeners('t');
console.log('После removeAll: ' + leak.listenerCount('t'));

console.log('\nAsync:');
const asyncEv = new EventEmitter();
asyncEv.on('async', async () => {
    await new Promise(r => setTimeout(r, 100));
    console.log('[477] async завершён через 100ms');
});
console.log('[477] emit вызван (не ждёт)');
asyncEv.emit('async');