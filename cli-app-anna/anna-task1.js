const argv = process.argv.slice(2);

if (argv.length === 0) {
    console.log('Использование: node anna-task1.js <команда> [аргументы]');
    console.log('Команды:');
    console.log('  hello <имя> - поздороваться');
    console.log('  whoami - информация о студенте');
    process.exit(0);
}

const action = argv[0];

if (action === 'hello') {
    const userName = argv[1];
    if (!userName) {
        console.error('Ошибка: не указано имя');
        process.exit(1);
    }
    console.log(`Здравствуйте, ${userName}! Это CLI-приложение группы 477.`);
    process.exit(0);
} else if (action === 'whoami') {
    console.log('Студент: Седура Анна');
    console.log('Группа: 477');
    console.log('Лабораторная: №17');
    console.log('Дата: ' + new Date().toLocaleDateString('ru-RU'));
    process.exit(0);
} else if (action === '--help' || action === '-h') {
    console.log('Использование: node anna-task1.js <команда> [аргументы]');
    console.log('Команды:');
    console.log('  hello <имя> - поздороваться');
    console.log('  whoami - информация о студенте');
    process.exit(0);
} else {
    console.error(`Ошибка: команда "${action}" не найдена`);
    console.error('Попробуйте: node anna-task1.js --help');
    process.exit(1);
}