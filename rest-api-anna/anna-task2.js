require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const { MongoClient } = require('mongodb');
const User = require('./models/user');
const UserService = require('./services/userService');
const UserController = require('./controllers/userController');
const errorMiddleware = require('./middleware/errorMiddleware');
const loggerMiddleware = require('./middleware/loggerMiddleware');

const app = new Koa();
const router = new Router();
const GROUP = process.env.GROUP;

(async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME);

    const model = new User(db);
    const svc = new UserService(model);
    const ctrl = new UserController(svc);

    app.use(async (ctx, next) => { ctx.set('X-Group', GROUP); await next(); });
    app.use(loggerMiddleware);
    app.use(errorMiddleware);
    app.use(bodyParser());

    router.get('/api/users', async (ctx) => {
        const page = Math.max(1, Number(ctx.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(ctx.query.limit) || 10));
        const filter = {};
        if (ctx.query.group_name) filter.group_name = ctx.query.group_name;
        if (ctx.query.course) filter.course = Number(ctx.query.course);
        if (ctx.query.age_min || ctx.query.age_max) {
            filter.age = {};
            if (ctx.query.age_min) filter.age.$gte = Number(ctx.query.age_min);
            if (ctx.query.age_max) filter.age.$lte = Number(ctx.query.age_max);
        }

        let sort = {};
        if (ctx.query.sort === 'name') sort.name = 1;
        else if (ctx.query.sort === '-name') sort.name = -1;
        else if (ctx.query.sort === 'age') sort.age = 1;
        else if (ctx.query.sort === '-age') sort.age = -1;

        const total = await db.collection('users').countDocuments(filter);
        const data = await db.collection('users').find(filter).sort(sort).skip((page - 1) * limit).limit(limit).toArray();

        ctx.body = { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
    });

    router.get('/api/users/stats', async (ctx) => {
        const total = await db.collection('users').countDocuments();
        const avg = await db.collection('users').aggregate([
            { $group: { _id: null, avgAge: { $avg: '$age' } } }
        ]).toArray();
        const byGroup = await db.collection('users').aggregate([
            { $group: { _id: '$group_name', count: { $sum: 1 } } }
        ]).toArray();
        const byCourse = await db.collection('users').aggregate([
            { $group: { _id: '$course', count: { $sum: 1 } } }
        ]).toArray();
        ctx.body = { total, averageAge: avg[0]?.avgAge || 0, byGroup, byCourse };
    });

    router.get('/api/users/search', async (ctx) => {
        const q = ctx.query.q;
        if (!q) { ctx.status = 400; ctx.body = { error: 'Укажите q' }; return; }
        const found = await db.collection('users').find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).toArray();
        ctx.body = { found: found.length, data: found };
    });

    router.get('/api/users/export', async (ctx) => {
        const all = await db.collection('users').find({}).toArray();
        let csv = 'id,name,email,group_name,age,course\n';
        all.forEach(u => {
            csv += `${u._id},${u.name},${u.email},${u.group_name},${u.age || ''},${u.course || ''}\n`;
        });
        ctx.set('Content-Type', 'text/csv; charset=utf-8');
        ctx.set('Content-Disposition', 'attachment; filename="users.csv"');
        ctx.body = csv;
    });

    router.get('/api/users/:id', ctrl.getById.bind(ctrl));
    router.post('/api/users', ctrl.create.bind(ctrl));
    router.put('/api/users/:id', ctrl.update.bind(ctrl));
    router.delete('/api/users/:id', ctrl.delete.bind(ctrl));

    app.use(router.routes()).use(router.allowedMethods());
    app.listen(process.env.PORT || 3000, () => console.log('[INFO] Сервер на порту ' + process.env.PORT));
})();