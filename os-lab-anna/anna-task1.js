const sys = require('os');

const platformId = sys.platform();
const osType = sys.type();
const arch = sys.arch();
const osVersion = sys.release();
const host = sys.hostname();
const uptimeSec = sys.uptime();

const days = Math.floor(uptimeSec / 86400);
const hours = Math.floor((uptimeSec % 86400) / 3600);
const minutes = Math.floor((uptimeSec % 3600) / 60);
const seconds = Math.floor(uptimeSec % 60);

console.log('=== Системная информация (группа 477) ===');
console.log('Платформа: ' + platformId);
console.log('Тип ОС: ' + osType);
console.log('Архитектура: ' + arch);
console.log('Версия ОС: ' + osVersion);
console.log('Хост: ' + host);
console.log('Uptime: ' + days + ' д ' + hours + ' ч ' + minutes + ' мин ' + seconds + ' сек');

if (platformId === 'win32') {
    console.log('Вы работаете в Windows');
} else if (platformId === 'linux') {
    console.log('Вы работаете в Linux');
} else if (platformId === 'darwin') {
    console.log('Вы работаете в macOS');
} else {
    console.log('Неизвестная платформа');
}