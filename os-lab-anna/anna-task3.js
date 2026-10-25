const sys = require('os');

function hideMac(mac) {
    if (!mac || mac === '00:00:00:00:00:00') return 'скрыт';
    const parts = mac.split(':');
    return parts.slice(0, 3).join(':') + ':****:****';
}

console.log('=== Сетевые интерфейсы (группа 477) ===');

const nets = sys.networkInterfaces();
let primaryIp = null;
let primaryName = null;

for (const ifaceName of Object.keys(nets)) {
    for (const addr of nets[ifaceName]) {
        console.log('\nИнтерфейс: ' + ifaceName);
        console.log('  Семейство: ' + addr.family);
        console.log('  IP: ' + addr.address);
        console.log('  MAC: ' + hideMac(addr.mac));
        console.log('  Внутренний: ' + (addr.internal ? 'да' : 'нет'));

        if (!addr.internal && addr.family === 'IPv4' && !primaryIp) {
            primaryIp = addr.address;
            primaryName = ifaceName;
        }
    }
}

if (primaryIp) {
    console.log('\nОсновной интерфейс: ' + primaryName + ' (' + primaryIp + ')');
}

const info = sys.userInfo();
console.log('\n=== Пользователь ===');
console.log('Имя: ' + info.username);
console.log('UID: ' + (info.uid !== undefined ? info.uid : 'нет (Windows)'));
console.log('GID: ' + (info.gid !== undefined ? info.gid : 'нет (Windows)'));
console.log('Домашняя папка: ' + sys.homedir());
console.log('Оболочка: ' + (info.shell || 'не определена'));

console.log('\n=== Проверка root ===');
const isRoot = info.username === 'root' || info.uid === 0;
console.log('Root: ' + (isRoot ? 'ДА' : 'нет'));