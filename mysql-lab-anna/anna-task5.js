require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const mysql = require('mysql2/promise');

const app = new Koa();
const router = new Router();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

const met = { queries: 0, avgTime: 0, errors: 0 };

app.use(async (ctx, next) => {
    const t = Date.now();
    try { await next(); }
    catch (e) { ctx.status = e.status || 500; ctx.body = { error: e.message }; met.errors++; }
    const ms = Date.now() - t;
    met.queries++;
    met.avgTime = (met.avgTime + ms) / 2;
});

router.get('/api/students', async (ctx) => {
    const lim = Number(ctx.query.limit) || 10;
    const off = Number(ctx.query.offset) || 0;
    const [rows] = await pool.query('SELECT * FROM students LIMIT ? OFFSET ?', [lim, off]);
    const [c] = await pool.query('SELECT COUNT(*) AS total FROM students');
    ctx.body = { data: rows, pagination: { total: c[0].total, limit: lim, offset: off } };
});

router.get('/api/students/stats', async (ctx) => {
    const [s] = await pool.query('SELECT COUNT(*) AS total, AVG(grade) AS avg FROM students');
    const [g] = await pool.query('SELECT group_name, COUNT(*) AS count FROM students GROUP BY group_name');
    ctx.body = { ...s[0], byGroup: g };
});

router.get('/api/students/:id', async (ctx) => {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [ctx.params.id]);
    if (!rows.length) { ctx.status = 404; ctx.body = { error: 'Не найден' }; return; }
    ctx.body = rows[0];
});

router.post('/api/students', async (ctx) => {
    const { name, group_name, course, grade } = ctx.request.body;
    if (!name || !group_name || !course) { ctx.status = 400; ctx.body = { error: 'Неверные данные' }; return; }
    const [r] = await pool.query('INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)', [name, group_name, course, grade || null]);
    ctx.status = 201;
    ctx.body = { id: r.insertId, name, group_name, course, grade };
});

router.put('/api/students/:id', async (ctx) => {
    const { name, group_name, course, grade } = ctx.request.body;
    const [r] = await pool.query('UPDATE students SET name=COALESCE(?,name), group_name=COALESCE(?,group_name), course=COALESCE(?,course), grade=COALESCE(?,grade) WHERE id=?', [name, group_name, course, grade, ctx.params.id]);
    if (!r.affectedRows) { ctx.status = 404; ctx.body = { error: 'Не найден' }; return; }
    ctx.body = { message: 'Обновлено' };
});

router.delete('/api/students/:id', async (ctx) => {
    const [r] = await pool.query('DELETE FROM students WHERE id = ?', [ctx.params.id]);
    if (!r.affectedRows) { ctx.status = 404; ctx.body = { error: 'Не найден' }; return; }
    ctx.body = { message: 'Удалено' };
});

router.post('/api/students/batch', async (ctx) => {
    const arr = ctx.request.body;
    if (!Array.isArray(arr)) { ctx.status = 400; ctx.body = { error: 'Ожидается массив' }; return; }
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        for (const s of arr) {
            await conn.query('INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)', [s.name, s.group_name, s.course, s.grade || null]);
        }
        await conn.commit();
        ctx.body = { created: arr.length, transaction: 'committed' };
    } catch (e) {
        await conn.rollback();
        ctx.status = 400;
        ctx.body = { error: 'Откат', details: e.message };
    } finally {
        conn.release();
    }
});

router.get('/api/metrics', async (ctx) => { ctx.body = met; });

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => console.log('[INFO] Сервер на порту 3000'));