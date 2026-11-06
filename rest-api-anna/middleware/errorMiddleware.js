module.exports = async (ctx, next) => {
    try { await next(); }
    catch (e) {
        if (e.message.includes('24 character hex string')) {
            ctx.status = 404;
            ctx.body = { error: 'Не найден (неверный ID)' };
            return;
        }
        ctx.status = e.status || 500;
        ctx.body = { error: e.message };
    }
};