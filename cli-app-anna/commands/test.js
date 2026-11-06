const { doTest } = require('../services/testService');
function testCmd() {
    const r = doTest();
    console.log(` Тестов: ${r.passed}/${r.total}`);
    console.log(` Покрытие: ${r.coverage}%`);
}
module.exports = { testCmd };