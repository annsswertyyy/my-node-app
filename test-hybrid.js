const HybridFileManager = require('./fileOperationsHybrid');

const hybrid = new HybridFileManager('./hybrid-data');

console.log('== ТЕСТИРОВАНИЕ ГИБРИДНОГО ПОДХОДА ==\n');

console.log('1. Создание файла...');
hybrid.createFile('hybrid1.txt', 'Гибридный подход: колбэк + промис', (err, filePath) => {
    if (err) {
        console.error('  Ошибка создания:', err.message);
        return;
    }
    console.log('  Файл создан: ' + filePath);

    console.log('\n2. Чтение файла...');
    hybrid.readFile('hybrid1.txt', (err, content) => {
        if (err) {
            console.error('  Ошибка чтения:', err.message);
            return;
        }
        console.log('  Содержимое: "' + content + '"');

        console.log('\n3. Получение статистики...');
        hybrid.getFileStats('hybrid1.txt', (err, stats) => {
            if (err) {
                console.error('  Ошибка статистики:', err.message);
                return;
            }
            console.log('  Размер: ' + stats.size + ' байт');
            console.log('  Создан: ' + stats.created);

            console.log('\n4. Список файлов...');
            hybrid.listFiles((err, files) => {
                if (err) {
                    console.error('  Ошибка списка:', err.message);
                    return;
                }
                console.log('  Файлы:');
                files.forEach(f => console.log('   - ' + f));

                console.log('\n5. Удаление файла...');
                hybrid.deleteFile('hybrid1.txt', (err) => {
                    if (err) {
                        console.error('  Ошибка удаления:', err.message);
                        return;
                    }
                    console.log('  hybrid1.txt удалён');
                    console.log('\nГибридный подход работает!');
                });
            });
        });
    });
});