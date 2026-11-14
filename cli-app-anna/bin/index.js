#!/usr/bin/env node
const { Command } = require('commander');
const { createCmd } = require('../commands/create');
const { buildCmd } = require('../commands/build');
const { testCmd } = require('../commands/test');
const { deployCmd } = require('../commands/deploy');

const cli = new Command();
cli.name('anna-cli').version('2.1.0').description('CLI Ани');

cli.command('create').option('--name <name>', 'имя', 'anna-app').option('--type <type>', 'тип', 'cli').action(createCmd);
cli.command('build').action(buildCmd);
cli.command('test').action(testCmd);
cli.command('deploy').option('--env <env>', 'окружение', 'production').option('--force').action(deployCmd);

process.on('uncaughtException', (e) => {
    if (process.env.NODE_ENV === 'production') {
        console.error('Ошибка: ' + e.message);
    } else {
        console.error(e.stack);
    }
    process.exit(1);
});

cli.parse(process.argv);