require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const { MongoClient, ObjectId } = require('mongodb');

const app = new Koa();
const router = new Router();

const cli = new MongoClient(process.env.MONGO_URI);
let db, col;
const met = { queries: 0, avgTime: 0, errors: 0 };

(async () => {
    await cli.connect();
    db = cli.db(process.env.DB_NAME);
    col = db.collection('students');

    await col.createIndex({ group_name: 1 });
    await col.createIndex({ name: 'text' });
    console.log('[INFO] MongoDB подключена: ' + process.env.DB_NAME);

    app.use(bodyParser());
    app.use(async (ctx, next) => {
        const t = Date.now();
        try { await next(); }
        catch (e) { ctx.status = e.status || 500; ctx.body = { error: e.message }; met.errors++; }
        met.queries++;
        met.avgTime = (met.avgTime + (Date.now() - t)) / 2;
    });

    router.get('/api/students', async (ctx) => {
        const lim = Number(ctx.query.limit) || 10;
        const off = Number(ctx.query.offset) || 0;
        const total = await col.countDocuments();
        const data = await col.find({}).skip(off).limit(lim).toArray();
        ctx.body = { data, pagination: { total, limit: lim, offset: off } };
    });

    router.get('/api/students/stats', async (ctx) => {
        const s = await col.aggregate([
            { $group: { _id: null, total: { $sum: 1 }, avgGrade: { $avg: '$grade' } } }
        ]).toArray();
        const g = await col.aggregate([
            { $group: { _id: '$group_name', count: { $sum: 1 } } }
        ]).toArray();
        ctx.body = { ...s[0], byGroup: g };
    });

    router.get('/api/students/search', async (ctx) => {
        const q = ctx.query.q;
        if (!q) { ctx.status = 400; ctx.body = { error: 'Укажите q' }; return; }
        const found = await col.find({ $text: { $search: q } }).toArray();
        ctx.body = { found: found.length, data: found };
    });

    router.get('/api/students/:id', async (ctx) => {
        const d = await col.findOne({ _id: new ObjectId(ctx.params.id) });
        if (!d) { ctx.status = 404; ctx.body = { error: 'Не найден' }; return; }
        ctx.body = d;
    });

    router.post('/api/students', async (ctx) => {
        const r = await col.insertOne(ctx.request.body);
        ctx.status = 201;
        ctx.body = { insertedId: r.insertedId };
    });

    router.put('/api/students/:id', async (ctx) => {
        const r = await col.updateOne({ _id: new ObjectId(ctx.params.id) }, { $set: ctx.request.body });
        ctx.body = r;
    });

    router.delete('/api/students/:id', async (ctx) => {
        const r = await col.deleteOne({ _id: new ObjectId(ctx.params.id) });
        ctx.body = r;
    });

    router.post('/api/students/batch', async (ctx) => {
        const arr = ctx.request.body;
        const sess = cli.startSession();
        try {
            sess.startTransaction();
            const r = await col.insertMany(arr, { session: sess });
            await sess.commitTransaction();
            ctx.body = { inserted: Object.keys(r.insertedIds).length, transaction: 'committed' };
        } catch (e) {
            await sess.abortTransaction();
            ctx.status = 400;
            ctx.body = { error: 'Откат', details: e.message };
        } finally {
            await sess.endSession();
        }
    });

    router.get('/api/metrics', async (ctx) => { ctx.body = met; });

    app.use(router.routes()).use(router.allowedMethods());
    app.listen(process.env.PORT || 3000, () => console.log('[INFO] Сервер на порту ' + process.env.PORT));
})();