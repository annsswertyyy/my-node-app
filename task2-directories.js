

const fs = require('fs').promises;
const path = require('path');

const VARIANT = 2;
const projectDir = 'project_' + VARIANT;

async function createFolder(folderPath, description) {
    await fs.mkdir(folderPath, { recursive: true });

    await fs.writeFile(
        path.join(folderPath, 'info.txt'),
        'Назначение папки: ' + description,
        'utf8'
    );

    const now = new Date().toISOString().slice(0, 10);
    await fs.writeFile(
        path.join(folderPath, 'README.md'),
        'Дата создания: ' + now,
        'utf8'
    );
}

async function printTree(dir, prefix) {
    prefix = prefix || '';
    const items = await fs.readdir(dir);
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);
        const isLast = i === items.length - 1;
        const marker = isLast ? '└── ' : '├── ';
        console.log(prefix + marker + item);
        if (stat.isDirectory()) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            await printTree(fullPath, newPrefix);
        }
    }
}

async function main() {
    try {
        await fs.rm(path.join(__dirname, projectDir), { recursive: true, force: true });

        const structure = [
            ['src', 'Исходный код'],
            ['src/modules', 'Модули приложения'],
            ['src/components', 'Компоненты интерфейса'],
            ['src/utils', 'Утилиты'],
            ['data', 'Данные'],
            ['data/input', 'Входные данные'],
            ['data/output', 'Выходные данные'],
            ['temp', 'Временные файлы']
        ];

        for (const [folder, description] of structure) {
            await createFolder(path.join(__dirname, projectDir, folder), description);
        }

        console.log('Структура ' + projectDir + ':');
        console.log(projectDir + '/');
        await printTree(path.join(__dirname, projectDir));

        await fs.rename(
            path.join(__dirname, projectDir, 'temp'),
            path.join(__dirname, projectDir, 'data', 'temp')
        );

        await fs.rename(
            path.join(__dirname, projectDir, 'data', 'output'),
            path.join(__dirname, projectDir, 'data', 'results')
        );

        await fs.rm(
            path.join(__dirname, projectDir, 'data', 'temp'),
            { recursive: true, force: true }
        );

        console.log('\nОбновлённая структура:');
        console.log(projectDir + '/');
        await printTree(path.join(__dirname, projectDir));

    } catch (err) {
        console.error('Ошибка: ' + err.message);
    }
}

main();