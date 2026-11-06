require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const app = new Koa();
const router = new Router();
const JWT_SECRET = 'anna_secret_key_2026';
const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

let db, users, refreshTokens;

(async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db(process.env.DB_NAME);
    users = db.collection('users');
    refreshTokens = db.collection('refresh_tokens');

    app.use(bodyParser());

    app.use(async (ctx, next) => {
        const t = Date.now();
        try { await next(); }
        catch (e) { ctx.status = e.status || 500; ctx.body = { error: e.message }; }
        console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url} ${ctx.status} ${Date.now() - t}ms`);
    });

    router.post('/api/auth/register', async (ctx) => {
        const { name, email, password } = ctx.request.body;
        if (!name || !email || !password) {
            ctx.status = 400; ctx.body = { error: 'name, email, password обязательны' }; return;
        }
        const ex = await users.findOne({ email });
        if (ex) { ctx.status = 409; ctx.body = { error: 'Email существует' }; return; }

        const hash = await bcrypt.hash(password, 10);
        const r = await users.insertOne({
            name, email, password: hash, role: 'user', created_at: new Date()
        });

        const payload = { userId: r.insertedId.toString(), email, role: 'user' };
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
        const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TTL });

        await refreshTokens.insertOne({ token: refreshToken, userId: r.insertedId.toString(), created_at: new Date() });

        ctx.status = 201;
        ctx.body = {
            data: { userId: r.insertedId, email },
            accessToken,
            refreshToken
        };
    });

    router.post('/api/auth/login', async (ctx) => {
        const { email, password } = ctx.request.body;
        if (!email || !password) {
            ctx.status = 400; ctx.body = { error: 'email, password обязательны' }; return;
        }
        const user = await users.findOne({ email });
        if (!user) { ctx.status = 401; ctx.body = { error: 'Invalid credentials' }; return; }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) { ctx.status = 401; ctx.body = { error: 'Invalid credentials' }; return; }

        const payload = { userId: user._id.toString(), email: user.email, role: user.role };
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
        const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TTL });

        await refreshTokens.insertOne({ token: refreshToken, userId: user._id.toString(), created_at: new Date() });

        ctx.body = { accessToken, refreshToken, expiresIn: 900 };
    });

    router.post('/api/auth/refresh', async (ctx) => {
        const { refreshToken } = ctx.request.body;
        if (!refreshToken) { ctx.status = 400; ctx.body = { error: 'refreshToken обязателен' }; return; }

        try {
            const decoded = jwt.verify(refreshToken, JWT_SECRET);
            const stored = await refreshTokens.findOne({ token: refreshToken });
            if (!stored) { ctx.status = 401; ctx.body = { error: 'Token не найден' }; return; }

            const payload = { userId: decoded.userId, email: decoded.email, role: decoded.role };
            const newAccess = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
            ctx.body = { accessToken: newAccess, expiresIn: 900 };
        } catch (e) {
            ctx.status = 401; ctx.body = { error: 'Неверный refresh token' };
        }
    });

    router.post('/api/auth/logout', async (ctx) => {
        const { refreshToken } = ctx.request.body;
        if (refreshToken) await refreshTokens.deleteOne({ token: refreshToken });
        ctx.body = { message: 'Выход выполнен' };
    });

    async function auth(ctx, next) {
        const h = ctx.headers['authorization'];
        if (!h || !h.startsWith('Bearer ')) {
            ctx.status = 401; ctx.body = { error: 'Unauthorized' }; return;
        }
        try {
            const token = h.slice(7);
            ctx.state.user = jwt.verify(token, JWT_SECRET);
            await next();
        } catch (e) {
            ctx.status = 401; ctx.body = { error: 'Token неверный или истёк' };
        }
    }

    function requireRole(role) {
        return async (ctx, next) => {
            if (!ctx.state.user || ctx.state.user.role !== role) {
                ctx.status = 403; ctx.body = { error: `Forbidden: ${role} required` }; return;
            }
            await next();
        };
    }

    router.get('/api/admin/users', auth, requireRole('admin'), async (ctx) => {
        const all = await users.find({}, { projection: { password: 0 } }).toArray();
        ctx.body = { data: all };
    });

    router.post('/api/users', auth, async (ctx) => {
        const { name, email, group_name, age, course } = ctx.request.body;
        if (!name || !email) { ctx.status = 400; ctx.body = { error: 'name, email обязательны' }; return; }
        const r = await users.insertOne({ name, email, group_name, age, course, created_at: new Date() });
        ctx.status = 201; ctx.body = { data: { _id: r.insertedId, name, email } };
    });

    app.use(router.routes()).use(router.allowedMethods());
    app.listen(4000, () => console.log('[INFO] Auth-сервер на порту 4000'));
})();