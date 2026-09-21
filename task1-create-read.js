

const fs = require('fs').promises;
const path = require('path');

const VARIANT = 2;
const fileName = 'student_' + VARIANT + '.txt';
const filePath = path.join(__dirname, fileName);

async function main() {
    try {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 19).replace('T', ' ');

        let content = '';
        content += 'Студент: Седура Анна\n';
        content += 'Группа: 477\n';
        content += 'Вариант: ' + VARIANT + '\n';
        content += 'Дата: ' + dateStr + '\n';
        content += '\nЛюбимые книги:\n';
        content += '1. "Мастер и Маргарита" - М. Булгаков\n';
        content += '2. "Преступление и наказание" - Ф. Достоевский\n';
        content += '3. "1984" - Дж. Оруэлл\n';
        content += '4. "Гарри Поттер" - Дж. Роулинг\n';
        content += '5. "Война и мир" - Л. Толстой\n';

        await fs.writeFile(filePath, content, 'utf8');
        console.log('Создан файл: ' + fileName);

        const lines = content.split('\n').filter(line => line.trim() !== '').length;

        const finalContent = content + '\nКоличество записей: ' + lines + '\n';
        await fs.writeFile(filePath, finalContent, 'utf8');

        const data = await fs.readFile(filePath, 'utf8');

        console.log('\nСодержимое файла:\n');
        console.log(data);

    } catch (err) {
        console.error('Ошибка: ' + err.message);
    }
}

main();