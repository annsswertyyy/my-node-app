require('dotenv').config();
const mysql = require('mysql2/promise');

const cfg = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function single() {
    console.log('=== Одиночное соединение ===');
    let conn;
    try {
        conn = await mysql.createConnection(cfg);
        console.log(' Подключение установлено');
        const [rows] = await conn.query('SELECT VERSION() AS v, DATABASE() AS d, USER() AS u');
        console.log('Версия MySQL: ' + rows[0].v);
        console.log('Текущая БД: ' + rows[0].d);
        console.log('Пользователь: ' + rows[0].u);
        await conn.end();
        console.log(' Соединение закрыто');
    } catch (e) {
        console.error(' Ошибка: ' + e.message);
    }
}

async function pool() {
    console.log('\n=== Пул соединений ===');
    const p = mysql.createPool({ ...cfg, connectionLimit: 10 });
    try {
        console.log(' Пул создан (лимит: 10)');
        const [rows] = await p.query('SELECT VERSION() AS v, DATABASE() AS d');
        console.log('Версия MySQL: ' + rows[0].v);
        console.log('Текущая БД: ' + rows[0].d);
        console.log('Соединений в пуле: 10');
        console.log(' Пул готов к работе');
    } catch (e) {
        console.error(' Ошибка пула: ' + e.message);
    } finally {
        await p.end();
    }
}

(async () => {
    await single();
    await pool();
})();