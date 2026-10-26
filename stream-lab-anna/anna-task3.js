const fs = require('fs');
const { pipeline, Transform } = require('stream');

fs.writeFileSync('input.txt', 'Это тестовый файл для потоков Ани!');

console.log('== pipe() ==');
console.log('Чтение: input.txt');
console.log('Запись: out-pipe.txt');

const r1 = fs.createReadStream('input.txt');
const w1 = fs.createWriteStream('out-pipe.txt');
r1.pipe(w1);

w1.on('finish', () => {
    console.log(' Копирование завершено');
    console.log('Размер: ' + fs.statSync('out-pipe.txt').size + ' байт\n');

    console.log('== pipe() с ошибкой ==');
    console.log('Чтение: missing.txt');
    const r2 = fs.createReadStream('missing.txt');
    const w2 = fs.createWriteStream('out-bad.txt');
    r2.on('error', (e) => {
        console.error(' Ошибка: ' + e.message);
        console.log(' pipe() не закрыл целевой поток!\n');
        runPipeline();
    });
    r2.pipe(w2);
});

function runPipeline() {
    console.log('== pipeline() ==');
    console.log('Чтение: input.txt');
    console.log('Запись: out-pipeline.txt');

    pipeline(
        fs.createReadStream('input.txt'),
        fs.createWriteStream('out-pipeline.txt'),
        (err) => {
            if (err) { console.error(err.message); return; }
            console.log(' Копирование завершено\n');
            runPipelineError();
        }
    );
}

function runPipelineError() {
    console.log('== pipeline() с ошибкой ==');
    console.log('Чтение: missing.txt');
    pipeline(
        fs.createReadStream('missing.txt'),
        fs.createWriteStream('out-bad-pipeline.txt'),
        (err) => {
            if (err) {
                console.error(' Ошибка: ' + err.message);
                console.log(' Все потоки закрыты');
                console.log(' Утечек нет\n');
                runChain();
            }
        }
    );
}

function runChain() {
    console.log('== Цепочка потоков ==');
    console.log('input.txt - upper - reverse - out-chain.txt');

    const up = new Transform({
        transform(chunk, enc, cb) {
            cb(null, chunk.toString().toUpperCase());
        }
    });

    const rev = new Transform({
        transform(chunk, enc, cb) {
            cb(null, chunk.toString().split('').reverse().join(''));
        }
    });

    pipeline(
        fs.createReadStream('input.txt'),
        up,
        rev,
        fs.createWriteStream('out-chain.txt'),
        (err) => {
            if (err) { console.error(err.message); return; }
            console.log('\n Обработка завершена');
            console.log('Содержимое out-chain.txt:');
            console.log(fs.readFileSync('out-chain.txt', 'utf8'));
        }
    );
}