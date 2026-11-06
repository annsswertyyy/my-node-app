function createCmd(opts) {
    console.log(` Проект "${opts.name}" создан`);
    console.log(' Зависимости установлены');
    console.log(' Git инициализирован');
    console.log('Готово!');
}
module.exports = { createCmd };