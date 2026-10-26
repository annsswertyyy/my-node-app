module.exports = async (ctx, next) => {
    const t = Date.now();
    await next();
    console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url} ${ctx.status} ${Date.now() - t}ms`);
};