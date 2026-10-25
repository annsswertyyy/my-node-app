const ask = require('inquirer');
async function deployCmd(opts) {
    if (!opts.force) {
        const ans = await ask.prompt([
            { type: 'confirm', name: 'go', message: 'Развернуть проект?', default: false }
        ]);
        if (!ans.go) {
            console.log('Отменено');
            return;
        }
    }
    console.log(' Развёрнуто');
    console.log('URL: https://anna-app.example.com');
}
module.exports = { deployCmd };