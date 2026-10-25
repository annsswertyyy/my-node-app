const { EventEmitter } = require('events');

class DBConnect extends EventEmitter {
    connect() {
        this.emit('connected', 'Соединение установлено');
    }
    query(sql) {
        this.emit('query', sql);
    }
    close() {
        this.emit('closed', 'Соединение закрыто');
    }
    fail(msg) {
        this.emit('error', new Error(msg));
    }
}

const db = new DBConnect();

db.on('connected', (m) => console.log('[EVENT] ' + m));
db.on('query', (sql) => {
    console.log('[EVENT] Запрос: ' + sql);
    console.log('[EVENT] Результат: 50 записей');
});
db.on('closed', (m) => console.log('[EVENT] ' + m));
db.on('error', (e) => console.log('[EVENT] Ошибка: ' + e.message));

console.log('1. DBConnect (группа 477)');
console.log('2. [EVENT] Подключение...');
db.connect();
db.query('SELECT * FROM students');
db.query('INSERT INTO students');
db.close();

console.log('\n[EVENT] Демонстрация ошибки');
db.fail('Connection timeout');
console.log('(без слушателя error — процесс упал бы)');