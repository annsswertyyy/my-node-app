const { Readable } = require('stream');

const parts = [
    'Группа: 477',
    'Студент: Седура Анна',
    'Лабораторная работа: №21',
    'Тема: Потоки в Node.js'
];

let idx = 0;

const src = new Readable({
    read() {
        if (idx < parts.length) {
            this.push(parts[idx]);
            idx++;
        } else {
            this.push(null);
        }
    }
});

let total = 0;

console.log('=== Демонстрация Readable ===\n');

src.on('data', (c) => {
    total++;
    console.log('[CHUNK ' + total + '] ' + c.toString());
});

src.on('end', () => {
    console.log('\n[END] Поток завершён');
    console.log('Всего чанков: ' + total);
});

src.on('error', (e) => {
    console.error('Ошибка: ' + e.message);
});