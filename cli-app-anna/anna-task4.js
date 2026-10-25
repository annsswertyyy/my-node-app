const { Command } = require('commander');
const color = require('chalk');
const spin = require('ora');
const ProgressBar = require('cli-progress');

const cli = new Command();
cli
    .name('anna-cli')
    .description('CLI с красивым выводом')
    .version('2.1.0');

cli
    .command('handle')
    .description('обработать файлы')
    .option('-f, --files <files...>', 'файлы')
    .action(async (opts) => {
        const list = opts.files || [];
        if (list.length === 0) {
            console.error(color.red('Ошибка: передайте файлы через --files'));
            process.exit(1);
        }

        const s = spin('Ищем файлы...').start();
        await new Promise(r => setTimeout(r, 800));
        s.succeed(color.green(`Найдено файлов: ${list.length}`));

        const bar = new ProgressBar.SingleBar({}, ProgressBar.Presets.shades_classic);
        bar.start(list.length, 0);
        for (let i = 0; i < list.length; i++) {
            await new Promise(r => setTimeout(r, 400));
            bar.update(i + 1);
        }
        bar.stop();

        console.log(color.green('✔ Готово'));
        console.log(color.blue('Файл: output.json'));
        process.exit(0);
    });

cli.parse(process.argv);