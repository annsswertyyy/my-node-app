require('dotenv').config();
const mysql = require('mysql2/promise');

const cfg = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

(async () => {
    const p = mysql.createPool({ ...cfg, connectionLimit: 10 });
    try {
        console.log('=== Создание таблицы ===');
        await p.query('DROP TABLE IF EXISTS students');
        await p.query(`
            CREATE TABLE students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                group_name VARCHAR(20) NOT NULL,
                course INT NOT NULL,
                grade DECIMAL(3,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log(' Таблица students создана');

        console.log('\n=== INSERT ===');
        const [r1] = await p.query('INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)', ['Анна', 'ББМО-01-23', 2, 4.5]);
        console.log(' Вставлен: id=' + r1.insertId + ', affectedRows=' + r1.affectedRows);

        const [r2] = await p.query('INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)', ['Иван', 'ББМО-01-23', 2, 3.8, 'Петр', 'ББМО-01-23', 3, 4.2, 'Мария', 'ББМО-02-23', 1, 4.9]);
        console.log(' Вставлено 3: affectedRows=' + r2.affectedRows);

        console.log('\n=== SELECT ===');
        const [all] = await p.query('SELECT * FROM students');
        all.forEach(s => console.log('id=' + s.id + ', name=' + s.name + ', group=' + s.group_name + ', grade=' + s.grade));

        console.log('\nСтуденты ББМО-01-23 (по grade):');
        const [f] = await p.query('SELECT * FROM students WHERE group_name = ? ORDER BY grade DESC', ['ББМО-01-23']);
        f.forEach(s => console.log('id=' + s.id + ', name=' + s.name + ', grade=' + s.grade));

        console.log('\n=== UPDATE ===');
        const [u1] = await p.query('UPDATE students SET grade = ? WHERE id = ?', [5.0, 1]);
        console.log(' affectedRows=' + u1.affectedRows + ', changedRows=' + u1.changedRows);
        const [u2] = await p.query('UPDATE students SET grade = ? WHERE id = ?', [5.0, 1]);
        console.log(' Повторно: affectedRows=' + u2.affectedRows + ', changedRows=' + u2.changedRows);

        console.log('\n=== DELETE ===');
        const [d] = await p.query('DELETE FROM students WHERE id = ?', [1]);
        console.log(' Удалён id=1: affectedRows=' + d.affectedRows);

        console.log('\n=== SQL-инъекция ===');
        const inj = "' ; DROP TABLE students; --";
        const [safe] = await p.query('SELECT * FROM students WHERE name = ?', [inj]);
        console.log(' Параметризованный запрос безопасен (найдено: ' + safe.length + ')');
    } catch (e) {
        console.error('Ошибка:', e.message);
    } finally {
        await p.end();
    }
})();