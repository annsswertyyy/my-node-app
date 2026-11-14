const { EventEmitter } = require('events');
const ev = new EventEmitter();

let onCnt = 0;
let onceCnt = 0;

ev.on('beat', () => {
    onCnt++;
    console.log('[beat #' + onCnt + '] on');
});

ev.once('beat', () => {
    onceCnt++;
    console.log('[beat #' + onceCnt + '] once');
});

ev.emit('beat');
ev.emit('beat');
ev.emit('beat');

console.log('\non: ' + onCnt + ' раз');
console.log('once: ' + onceCnt + ' раз');

console.log('\nУправление:');
console.log('Слушателей beat: ' + ev.listenerCount('beat'));

function tmp() { console.log('tmp'); }
ev.on('x', tmp);
ev.on('x', () => console.log('x2'));
ev.on('x', () => console.log('x3'));

console.log('Слушателей x: ' + ev.listenerCount('x'));
ev.removeListener('x', tmp);
console.log('После removeListener: ' + ev.listenerCount('x'));
ev.removeAllListeners('x');
console.log('После removeAllListeners: ' + ev.listenerCount('x'));

console.log('\nПорядок:');
ev.on('ord', () => console.log('1. Первый (группа 477)'));
ev.on('ord', () => console.log('2. Второй'));
ev.on('ord', () => console.log('3. Третий'));
ev.emit('ord');