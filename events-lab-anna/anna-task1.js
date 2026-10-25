const { EventEmitter } = require('events');
const bus = new EventEmitter();

bus.on('hello', (who) => {
    console.log('Привет, ' + who + '!');
});

bus.on('group', (g) => {
    console.log('Группа: ' + g);
});

console.log('События:');
bus.emit('hello', 'Аня');
bus.emit('group', '477');

const r1 = bus.emit('hello', 'Аня');
console.log('emit есть слушатели: ' + r1);

const r2 = bus.emit('nothing');
console.log('emit нет слушателей: ' + r2);