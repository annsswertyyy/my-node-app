const { Command } = require('commander');
const cli = new Command();

cli
    .name('anna-cli')
    .description('CLI для лабораторной №17')
    .version('2.1.0');

cli
    .command('make')
    .description('создать отчёт')
    .option('-k, --kind <kind>', 'формат отчёта', 'txt')
    .option('-p, --path <path>', 'куда сохранить')
    .option('-f, --force', 'перезаписать файл')
    .option('--test-only', 'только проверить, не создавать')
    .option('-v, --verbose', 'подробный вывод')
    .action((opts) => {
        const formats = ['txt', 'pdf', 'json', 'csv'];
        if (!formats.includes(opts.kind)) {
            console.error(`Ошибка: формат "${opts.kind}" не поддерживается.`);
            console.error(`Доступно: ${formats.join(', ')}`);
            process.exit(1);
        }

        const target = opts.path || `result.${opts.kind}`;

        if (opts.verbose) {
            console.log('[INFO] Начинаем создание отчёта...');
            console.log('[INFO] Формат: ' + opts.kind);
            console.log('[INFO] Файл: ' + target);
        }

        if (opts.testOnly) {
            console.log('[TEST] Формат: ' + opts.kind);
            console.log('[TEST] Файл: ' + target);
            console.log('[TEST] Ничего не создано (тестовый режим)');
            return;
        }

        console.log('Отчёт готов: ' + target);
        process.exit(0);
    });

cli
    .command('copy')
    .description('скопировать файл')
    .option('-s, --source <path>', 'откуда')
    .option('-d, --dest <path>', 'куда')
    .action((opts) => {
        console.log(`Копирование: ${opts.source || '?'} -> ${opts.dest || '?'}`);
        process.exit(0);
    });

cli.parse(process.argv);