const { doBuild } = require('../services/buildService');
function buildCmd() {
    const r = doBuild();
    if (r.ok) {
        console.log(` Сборка за ${r.time}`);
        console.log('Файл: ' + r.file);
    }
}
module.exports = { buildCmd };