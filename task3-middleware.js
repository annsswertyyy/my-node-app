const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();
const PORT = 3000;

let users = [
    { id: 1, name: 'Иванов Иван', group: 'ББМО-01-23' }
];


app.use(async (ctx, next) => {
    const start = Date.now();
    const now = new Date().toLocaleString('ru-RU');
    await next();
    const ms = Date.now() - start;
    console.log(`[${now}] ${ctx.method} ${ctx.url} - ${ms}ms`);
});


app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = {
            error: err.message || 'Внутренняя ошибка сервера',
            status: ctx.status
        };
    }
});

async function auth(ctx, next) {
    const authHeader = ctx.headers['authorization'];
    if (!authHeader) {
        ctx.status = 401;
        ctx.body = { error: 'Не авторизован', status: 401 };
        return;
    }
    await next();
}


router.get('/api/users', async (ctx) => {
    ctx.body = users;
});


router.get('/protected', auth, async (ctx) => {
    ctx.body = { message: 'Доступ разрешён' };
});


router.get('/error', async (ctx) => {
    throw new Error('Внутренняя ошибка сервера');
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
    console.log('Сервер запущен на порту ' + PORT);
});