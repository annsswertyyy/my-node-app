require('dotenv').config();
const mysql = require('mysql2/promise');

const base = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function testError(label, cfg) {
    try {
        const c = await mysql.createConnection(cfg);
        await c.end();
        console.log('[' + label + '] Нет ошибки');
    } catch (e) {
        console.log('[' + e.code + '] ' + e.message);
    }
}

(async () => {
    console.log('=== Демонстрация ошибок ===');

    await testError('ECONNREFUSED', { ...base, host: 'localhost', port: 9999 });
    await testError('ER_ACCESS_DENIED_ERROR', { ...base, password: 'wrong' });

    const p = mysql.createPool(base);

    try {
        await p.query('SELECT * FRM students');
    } catch (e) {
        console.log('[' + e.code + '] ' + e.message);
    }

    try {
        await p.query('INSERT INTO students (name, group_name, course) VALUES (?, ?, ?)', ['Test', 'ББМО-01-23', 1]);
        await p.query('INSERT INTO students (id, name, group_name, course) VALUES (?, ?, ?, ?)', [1, 'Dup', 'ББМО-01-23', 1]);
    } catch (e) {
        console.log('[' + e.code + '] ' + e.message);
    }

    try {
        await p.query('INSERT INTO students (group_name, course) VALUES (?, ?)', ['ББМО-01-23', 1]);
    } catch (e) {
        console.log('[' + e.code + '] ' + e.message);
    }

    await p.end();
})();