const { Command } = require('commander');
const ask = require('inquirer');

const cli = new Command();
cli
    .name('anna-cli')
    .description('Интерактивный CLI')
    .version('2.1.0');

cli
    .command('create')
    .description('создать проект')
    .option('--title <title>', 'имя проекта')
    .option('--kind <kind>', 'тип проекта (web, cli, lib, micro)')
    .option('--ts', 'TypeScript')
    .option('--prettier', 'Prettier')
    .option('--eslint', 'ESLint')
    .option('--jest', 'Jest')
    .option('--git', 'Git')
    .option('--no-interactive', 'без вопросов')
    .action(async (opts) => {
        let title = opts.title;
        let kind = opts.kind;
        let extras = [];
        let useGit = opts.git;

        if (opts.ts) extras.push('TypeScript');
        if (opts.prettier) extras.push('Prettier');
        if (opts.eslint) extras.push('ESLint');
        if (opts.jest) extras.push('Jest');

        if (opts.interactive === false) {
            if (!title || !kind) {
                console.error('Ошибка: в неинтерактивном режиме нужны --title и --kind');
                process.exit(1);
            }
        } else if (!title || !kind) {
            const result = await ask.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'Название проекта:',
                    default: 'my-anna-app'
                },
                {
                    type: 'list',
                    name: 'kind',
                    message: 'Тип проекта:',
                    choices: ['Web-приложение', 'CLI-утилита', 'Библиотека', 'Микросервис']
                },
                {
                    type: 'checkbox',
                    name: 'extras',
                    message: 'Дополнительные опции:',
                    choices: ['TypeScript', 'ESLint', 'Prettier', 'Jest']
                },
                {
                    type: 'confirm',
                    name: 'git',
                    message: 'Использовать Git?',
                    default: true
                },
                {
                    type: 'password',
                    name: 'token',
                    message: 'Токен доступа:',
                    mask: '*'
                }
            ]);
            title = result.title;
            kind = result.kind;
            extras = result.extras;
            useGit = result.git;
        }

        console.log(` Проект "${title}" готов!`);
        console.log('Тип: ' + kind);
        console.log('Опции: ' + (extras.length > 0 ? extras.join(', ') : 'нет'));
        console.log('Git: ' + (useGit ? 'да' : 'нет'));
        process.exit(0);
    });

cli.parse(process.argv);