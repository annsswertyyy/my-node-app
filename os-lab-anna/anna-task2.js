const sys = require('os');

const totalBytes = sys.totalmem();
const freeBytes = sys.freemem();
const usedBytes = totalBytes - freeBytes;

const totalGb = (totalBytes / 1073741824).toFixed(2);
const freeGb = (freeBytes / 1073741824).toFixed(2);
const usedPct = ((usedBytes / totalBytes) * 100).toFixed(1);
const freePct = 100 - usedPct;

console.log('=== Ресурсы (группа 477) ===');
console.log('Всего памяти: ' + totalGb + ' ГБ');
console.log('Свободно: ' + freeGb + ' ГБ (' + freePct.toFixed(1) + '%)');
console.log('Использовано: ' + usedPct + '%');

if (freePct < 10) {
    console.log('ВНИМАНИЕ: Критически мало памяти!');
} else {
    console.log('Память в норме');
}

const cores = sys.cpus();
console.log('\nЯдер: ' + cores.length);
console.log('Модель: ' + cores[0].model);

const loads = sys.loadavg();
console.log('\nСредняя загрузка:');
console.log('1 мин: ' + loads[0].toFixed(2));
console.log('5 мин: ' + loads[1].toFixed(2));
console.log('15 мин: ' + loads[2].toFixed(2));

const user = sys.userInfo();
console.log('\nПользователь: ' + user.username);
console.log('Домашняя папка: ' + sys.homedir());
