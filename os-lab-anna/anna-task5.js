const sys = require('os');
const fs = require('fs');

const report = {
    group: '477',
    timestamp: new Date().toISOString(),
    platform: sys.platform(),
    type: sys.type(),
    arch: sys.arch(),
    release: sys.release(),
    hostname: sys.hostname(),
    uptime: {
        seconds: Math.floor(sys.uptime()),
        days: Math.floor(sys.uptime() / 86400),
        hours: Math.floor((sys.uptime() % 86400) / 3600)
    },
    memory: {
        totalGb: (sys.totalmem() / 1073741824).toFixed(2),
        freeGb: (sys.freemem() / 1073741824).toFixed(2),
        usedPercent: (((sys.totalmem() - sys.freemem()) / sys.totalmem()) * 100).toFixed(1)
    },
    cpu: {
        model: sys.cpus()[0].model,
        cores: sys.cpus().length,
        loadAvg: sys.loadavg().map(l => l.toFixed(2))
    },
    user: {
        username: sys.userInfo().username,
        homedir: sys.homedir(),
        shell: sys.userInfo().shell || 'N/A'
    },
    network: {}
};

const nets = sys.networkInterfaces();
for (const name in nets) {
    const external = nets[name].find(a => !a.internal && a.family === 'IPv4');
    if (external) {
        report.network[name] = {
            ip: external.address,
            mac: external.mac.slice(0, 11) + '****'
        };
    }
}

console.log('=== Экспертный отчёт о системе (группа 477) ===');
console.log(JSON.stringify(report, null, 2));

fs.writeFileSync('system-report.json', JSON.stringify(report, null, 2));
console.log('\n✔ Отчёт сохранён: system-report.json');