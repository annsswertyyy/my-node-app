const { Writable } = require('stream');

const data = [
    'Группа: 477',
    'Студент: Седура Анна',
    'Лабораторная работа: №21',
    'Тема: Потоки в Node.js'
];

let written = 0;

const out = new Writable({
    highWaterMark: 16,
    write(chunk, enc, cb) {
        console.log('[WRITE] ' + chunk.toString());
        setTimeout(() => {
            written++;
            cb();
        }, 100);
    }
});

console.log('=== Writable-поток ===\n');

out.on('drain', () => {
    console.log('[DRAIN] Буфер свободен');
});

out.on('finish', () => {
    console.log('\n[FINISH] Все данные записаны');
    console.log('Всего: ' + written + ' чанков');
});

out.on('error', (e) => {
    console.error('Ошибка: ' + e.message);
});

for (let i = 0; i < data.length; i++) {
    const ok = out.write(data[i]);
    console.log('write() -> ' + ok + (ok ? '' : ' (буфер переполнен)'));
}

out.end();