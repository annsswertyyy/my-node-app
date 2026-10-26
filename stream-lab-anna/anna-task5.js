const { Readable, Transform, Writable, pipeline } = require('stream');
const fs = require('fs');

class Source extends Readable {
    constructor(total) {
        super({ objectMode: true });
        this.total = total;
        this.n = 0;
        this.generated = 0;
    }
    _read() {
        if (this.n >= this.total) { this.push(null); return; }
        const id = this.n + 1;
        this.push({
            id,
            name: 'Студент ' + id,
            group: id % 4 === 0 ? '478' : '477',
            course: (id % 4) + 1,
            grade: (id % 5) + 1
        });
        this.n++;
        this.generated++;
    }
}

const validate = new Transform({
    objectMode: true,
    transform(s, enc, cb) {
        if (!s.name || s.grade < 1) {
            fs.appendFileSync('errors.log', '[' + new Date().toISOString() + '] [477] Ошибка: id=' + s.id + '\n');
            return cb(null, null);
        }
        cb(null, s);
    }
});

const enrich = new Transform({
    objectMode: true,
    transform(s, enc, cb) {
        s.avg = (s.grade * 0.8 + 0.5).toFixed(1);
        cb(null, s);
    }
});

const filter = new Transform({
    objectMode: true,
    transform(s, enc, cb) {
        if (s.grade > 3) cb(null, s);
        else cb(null, null);
    }
});

const toCSV = new Transform({
    objectMode: true,
    transform(s, enc, cb) {
        cb(null, [s.id, s.name, s.group, s.course, s.grade, s.avg].join(',') + '\n');
    }
});

let count = 0;
const start = Date.now();

const dest = new Writable({
    highWaterMark: 16,
    write(chunk, enc, cb) {
        count++;
        if (count % 1000 === 0) {
            const sec = (Date.now() - start) / 1000;
            console.log('[PROGRESS] ' + Math.round((count / 7512) * 100) + '% | ' + count + '/7512 | ' + Math.round(count / sec) + ' записей/сек');
        }
        setTimeout(cb, 1);
    }
});

fs.writeFileSync('students.csv', 'id,name,group,course,grade,avg\n');
const file = fs.createWriteStream('students.csv', { flags: 'a' });

console.log('=== Конвейер Ани (группа 477) ===');
console.log('Источник: 10000 студентов');
console.log('Фильтр: оценка > 3\n');

const src = new Source(10000);

pipeline(src, validate, enrich, filter, toCSV, file, (err) => {
    if (err) { console.error(err.message); return; }
    const sec = ((Date.now() - start) / 1000).toFixed(1);
    console.log('\n=== Результаты ===');
    console.log('Сгенерировано: ' + src.generated);
    console.log('Записано: ' + count);
    console.log('Время: ' + sec + ' сек');
    console.log('Файл: students.csv (' + (fs.statSync('students.csv').size / 1024).toFixed(1) + ' КБ)');
});