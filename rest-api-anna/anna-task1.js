require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const helmet = require('koa-helmet');
const { MongoClient, ObjectId } = require('mongodb');

const app = new Koa();
const router = new Router();
const GROUP = process.env.GROUP;

let db, users;

(async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db(process.env.DB_NAME);
    users = db.collection('users');

    app.use(helmet());
    app.use(cors());
    app.use(bodyParser());
    app.use(async (ctx, next) => {
        ctx.set('X-Group', GROUP);
        const t = Date.now();
        try { await next(); }
        catch (e) { ctx.status = e.status || 500; ctx.body = { error: e.message }; }
        console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url} ${ctx.status} ${Date.now() - t}ms`);
    });

    router.get('/api/users', async (ctx) => {
        const data = await users.find({}).toArray();
        ctx.body = { data };
    });

    router.get('/api/users/:id', async (ctx) => {
        try {
            const u = await users.findOne({ _id: new ObjectId(ctx.params.id) });
            if (!u) { ctx.status = 404; ctx.body = { error: 'Не найден' }; return; }
            ctx.body = { data: u };
        } catch (e) {
            ctx.status = 404;
            ctx.body = { error: 'Неверный ID' };
        }
    });

    router.post('/api/users', async (ctx) => {
        const { name, email, group_name, age, course } = ctx.request.body;
        const errs = [];
        if (!name || name.length < 2) errs.push({ field: 'name', message: 'минимум 2 символа' });
        if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) errs.push({ field: 'email', message: 'неверный формат' });
        if (errs.length) { ctx.status = 400; ctx.body = { error: 'Validation failed', details: errs }; return; }

        const ex = await users.findOne({ email });
        if (ex) { ctx.status = 409; ctx.body = { error: 'Email уже существует' }; return; }

        const r = await users.insertOne({ name, email, group_name: group_name || GROUP, age, course, created_at: new Date() });
        ctx.status = 201;
        ctx.body = { data: { _id: r.insertedId, name, email, group_name, age, course } };
    });

    app.use(router.routes()).use(router.allowedMethods());
    app.listen(process.env.PORT || 3000, () => console.log(`[INFO] Сервер на порту ${process.env.PORT}`));
})();