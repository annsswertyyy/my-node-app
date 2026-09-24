

const fs = require('fs').promises;
const path = require('path');

const VARIANT = 2;
const MAX_SIZE = 10 * 1024 * 1024;

let totalFiles = 0;
let totalFolders = 0;
let totalSize = 0;
const extensions = {};
const allFiles = [];

async function scanDir(dir) {
    let items;
    try {
        items = await fs.readdir(dir);
    } catch (err) {
        return;
    }

    for (const item of items) {
        const fullPath = path.join(dir, item);

        // Пропускаем служебные папки
        if (item === '.git' || item === 'node_modules') continue;

        let stat;
        try {
            stat = await fs.stat(fullPath);
        } catch (err) {
            continue;
        }

        if (stat.isDirectory()) {
            totalFolders++;
            await scanDir(fullPath);
        } else {
            if (stat.size > MAX_SIZE) continue;

            totalFiles++;
            totalSize += stat.size;

            const ext = path.extname(item) || '(без расширения)';
            if (!extensions[ext]) {
                extensions[ext] = { count: 0, size: 0 };
            }
            extensions[ext].count++;
            extensions[ext].size += stat.size;

            allFiles.push({ name: item, path: fullPath, size: stat.size });
        }
    }
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' байт';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(2) + ' МБ';
}

async function main() {
    const targetDir = process.argv[2] || '.';

    console.log('Анализ директории: ' + targetDir + '\n');

    await scanDir(targetDir);

    console.log('Общее количество папок: ' + totalFolders);
    console.log('Общее количество файлов: ' + totalFiles);
    console.log('Общий размер: ' + formatSize(totalSize) + ' (' + totalSize + ' байт)\n');

    console.log('Расширения файлов:');
    for (const ext in extensions) {
        const data = extensions[ext];
        console.log('  ' + ext + ': ' + data.count + ' файлов (' + formatSize(data.size) + ')');
    }

    allFiles.sort((a, b) => b.size - a.size);
    console.log('\nТоп-5 самых больших файлов:');
    allFiles.slice(0, 5).forEach((f, i) => {
        console.log('  ' + (i + 1) + '. ' + f.name + ' (' + formatSize(f.size) + ') - ' + f.path);
    });

    const sortedAsc = allFiles.slice().sort((a, b) => a.size - b.size);
    console.log('\nТоп-5 самых маленьких файлов:');
    sortedAsc.slice(0, 5).forEach((f, i) => {
        console.log('  ' + (i + 1) + '. ' + f.name + ' (' + formatSize(f.size) + ') - ' + f.path);
    });

    const report = {
        directory: targetDir,
        totalFolders: totalFolders,
        totalFiles: totalFiles,
        totalSize: totalSize,
        totalSizeFormatted: formatSize(totalSize),
        extensions: extensions,
        top5Largest: allFiles.slice(0, 5),
        top5Smallest: sortedAsc.slice(0, 5)
    };

    const reportFile = 'report_' + VARIANT + '.json';
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2), 'utf8');
    console.log('\nОтчет сохранен: ' + reportFile);
}

main().catch(err => console.error('Ошибка: ' + err.message));