require('dotenv').config();
const mysql = require('mysql2/promise');

function cfg() {
    return {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };
}

class StudentDAO {
    constructor(pool) { this.pool = pool; }

    validate(d) {
        if (!d.name || d.name.length < 2 || d.name.length > 100) throw new Error('Имя: 2-100 символов');
        if (!d.group_name || !/^ББМО-\d{2}-\d{2}$/.test(d.group_name)) throw new Error('Формат: ББМО-XX-XX');
        if (!d.course || d.course < 1 || d.course > 4) throw new Error('Курс: 1-4');
        if (d.grade !== null && d.grade !== undefined && (d.grade < 0 || d.grade > 5)) throw new Error('Оценка: 0-5');
    }

    async create(d) {
        this.validate(d);
        const [r] = await this.pool.query('INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)', [d.name, d.group_name, d.course, d.grade || null]);
        return { id: r.insertId, ...d };
    }

    async findById(id) {
        const [rows] = await this.pool.query('SELECT * FROM students WHERE id = ?', [id]);
        return rows[0] || null;
    }

    async findAll(o = {}) {
        const lim = o.limit || 10;
        const off = o.offset || 0;
        let sql = 'SELECT * FROM students';
        const p = [];
        const c = [];
        if (o.group_name) { c.push('group_name = ?'); p.push(o.group_name); }
        if (o.course) { c.push('course = ?'); p.push(o.course); }
        if (o.grade_min !== undefined) { c.push('grade >= ?'); p.push(o.grade_min); }
        if (o.grade_max !== undefined) { c.push('grade <= ?'); p.push(o.grade_max); }
        if (c.length) sql += ' WHERE ' + c.join(' AND ');
        if (o.sort === 'name') sql += ' ORDER BY name ASC';
        else if (o.sort === '-name') sql += ' ORDER BY name DESC';
        else if (o.sort === 'grade') sql += ' ORDER BY grade ASC';
        else if (o.sort === '-grade') sql += ' ORDER BY grade DESC';
        sql += ' LIMIT ? OFFSET ?';
        p.push(lim, off);
        const [rows] = await this.pool.query(sql, p);
        const [cnt] = await this.pool.query('SELECT COUNT(*) AS total FROM students');
        return { data: rows, total: cnt[0].total, limit: lim, offset: off };
    }

    async update(id, d) {
        const f = [];
        const p = [];
        if (d.name) { f.push('name = ?'); p.push(d.name); }
        if (d.group_name) { f.push('group_name = ?'); p.push(d.group_name); }
        if (d.course) { f.push('course = ?'); p.push(d.course); }
        if (d.grade !== undefined) { f.push('grade = ?'); p.push(d.grade); }
        if (!f.length) return null;
        p.push(id);
        const [r] = await this.pool.query('UPDATE students SET ' + f.join(', ') + ' WHERE id = ?', p);
        return r.affectedRows > 0 ? this.findById(id) : null;
    }

    async delete(id) {
        const [r] = await this.pool.query('DELETE FROM students WHERE id = ?', [id]);
        return r.affectedRows > 0;
    }

    async search(q) {
        const [rows] = await this.pool.query('SELECT * FROM students WHERE name LIKE ?', ['%' + q + '%']);
        return rows;
    }

    async getStats() {
        const [s] = await this.pool.query('SELECT COUNT(*) AS total, AVG(grade) AS avgGrade, MIN(grade) AS minGrade, MAX(grade) AS maxGrade FROM students');
        const [g] = await this.pool.query('SELECT group_name, COUNT(*) AS count FROM students GROUP BY group_name');
        const [c] = await this.pool.query('SELECT course, COUNT(*) AS count FROM students GROUP BY course');
        return { ...s[0], byGroup: g, byCourse: c };
    }
}

(async () => {
    const p = mysql.createPool({ ...cfg(), connectionLimit: 10 });
    const dao = new StudentDAO(p);

    console.log('=== Создание ===');
    try {
        const s = await dao.create({ name: 'Тест', group_name: 'ББМО-01-23', course: 2, grade: 4.5 });
        console.log(' Создан:', s);
    } catch (e) {
        console.log(' ' + e.message);
    }
    try {
        await dao.create({ name: 'X', group_name: 'ББМО-01-23', course: 2 });
    } catch (e) {
        console.log(' Валидация: ' + e.message);
    }

    console.log('\n=== Пагинация ===');
    const list = await dao.findAll({ limit: 2, offset: 0 });
    console.log('Всего:', list.total, '| Получено:', list.data.length);

    console.log('\n=== Фильтр ===');
    const f = await dao.findAll({ group_name: 'ББМО-01-23' });
    console.log('В ББМО-01-23:', f.data.length);

    console.log('\n=== Поиск ===');
    const s = await dao.search('Ан');
    console.log('Найдено:', s.length);

    console.log('\n=== Статистика ===');
    console.log(await dao.getStats());

    await p.end();
})();