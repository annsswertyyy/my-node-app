const sys = require('os');
const fs = require('fs');

function cpuSnapshot() {
    const c = sys.cpus();
    let idle = 0;
    let total = 0;
    for (const core of c) {
        for (const t in core.times) total += core.times[t];
        idle += core.times.idle;
    }
    return { idle: idle / c.length, total: total / c.length };
}

function stamp() {
    const d = new Date();
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

function warn(text) {
    fs.appendFileSync('monitor.log', '[' + stamp() + '] [477] ' + text + '\n');
}

let prev = cpuSnapshot();
let warnCount = 0;

console.log('Мониторинг (группа 477). Ctrl+C — выход.\n');

const timer = setInterval(() => {
    const curr = cpuSnapshot();
    const idleDiff = curr.idle - prev.idle;
    const totalDiff = curr.total - prev.total;
    const cpuPct = (100 - (100 * idleDiff / totalDiff)).toFixed(1);

    const totalMem = sys.totalmem();
    const freeMem = sys.freemem();
    const memPct = (((totalMem - freeMem) / totalMem) * 100).toFixed(1);
    const freeGb = (freeMem / 1073741824).toFixed(2);

    let flag = 'норма';
    if (cpuPct > 80) {
        flag = 'КРИТИЧНО';
        warnCount++;
        warn('Критическая загрузка CPU: ' + cpuPct + '%');
    } else if (cpuPct > 50) {
        flag = 'предупреждение';
        warnCount++;
        warn('Высокая загрузка CPU: ' + cpuPct + '%');
    }

    if (freeMem / totalMem < 0.1) {
        flag += ', мало памяти';
        warnCount++;
        warn('Мало свободной памяти: ' + freeGb + ' ГБ');
    }

    console.log('CPU: ' + cpuPct + '% | RAM: ' + memPct + '% (' + freeGb + ' ГБ свободно) | ' + flag);

    prev = curr;
}, 2000);

process.on('SIGINT', () => {
    clearInterval(timer);
    console.log('\nМониторинг остановлен. Предупреждений: ' + warnCount);
    process.exit(0);
});