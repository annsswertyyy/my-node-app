const { Transform, Readable, Writable } = require('stream');

const upper = new Transform({
    transform(chunk, enc, cb) {
        cb(null, '[477] ' + chunk.toString().toUpperCase() + '\n');
    }
});

const jsonParser = new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
        try {
            cb(null, JSON.parse(chunk.toString()));
        } catch (e) {
            cb(e);
        }
    }
});

const filter = new Transform({
    objectMode: true,
    transform(obj, enc, cb) {
        if (obj.group === '477') cb(null, obj);
        else cb(null, null);
    }
});

const sink = new Writable({
    objectMode: true,
    write(obj, enc, cb) {
        console.log('Принят: ' + JSON.stringify(obj));
        cb();
    }
});

const src = Readable.from(['привет', 'мир']);
console.log('=== UpperCaseTransform ===');
src.pipe(upper).pipe(process.stdout);

setTimeout(() => {
    console.log('\n=== Object Mode ===');
    const jsonSrc = Readable.from([
        '{"name":"Анна","group":"477"}',
        '{"name":"Иван","group":"477"}',
        '{"name":"Петр","group":"478"}'
    ]);

    jsonSrc.pipe(jsonParser).pipe(filter).pipe(sink);

    setTimeout(async () => {
        console.log('\n=== Async Iterator ===');
        const iterSrc = Readable.from(['один', 'два', 'три']);
        for await (const chunk of iterSrc) {
            console.log('Итератор: ' + chunk.toString());
        }
        console.log('Готово');
    }, 500);
}, 500);