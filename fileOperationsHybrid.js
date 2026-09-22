const fs = require('fs');
const path = require('path');
const { writeFile, readFile, stat, unlink, readdir } = require('fs/promises');

class HybridFileManager {
    constructor(baseDir = './hybrid-data') {
        this.baseDir = baseDir;
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
            console.log('Создана директория: ' + baseDir);
        }
    }

    createFile(filename, content, callback) {
        const filePath = path.join(this.baseDir, filename);
        writeFile(filePath, content, 'utf8')
            .then(() => callback(null, filePath))
            .catch((err) => callback(err, null));
    }

    readFile(filename, callback) {
        const filePath = path.join(this.baseDir, filename);
        readFile(filePath, 'utf8')
            .then((data) => callback(null, data))
            .catch((err) => callback(err, null));
    }

    getFileStats(filename, callback) {
        const filePath = path.join(this.baseDir, filename);
        stat(filePath)
            .then((stats) => {
                callback(null, {
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    isFile: stats.isFile()
                });
            })
            .catch((err) => callback(err, null));
    }

    deleteFile(filename, callback) {
        const filePath = path.join(this.baseDir, filename);
        unlink(filePath)
            .then(() => callback(null))
            .catch((err) => callback(err));
    }

    listFiles(callback) {
        readdir(this.baseDir)
            .then((files) => {
                return Promise.all(
                    files.map(async (file) => {
                        const filePath = path.join(this.baseDir, file);
                        const stats = await stat(filePath);
                        return { name: file, isFile: stats.isFile() };
                    })
                );
            })
            .then((results) => {
                const onlyFiles = results.filter(r => r.isFile).map(r => r.name);
                callback(null, onlyFiles);
            })
            .catch((err) => callback(err, null));
    }
}

module.exports = HybridFileManager;