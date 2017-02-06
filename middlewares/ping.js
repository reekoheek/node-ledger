module.exports = function () {
  return async (ctx, next) => {
    if (ctx.method !== 'GET' || ctx.url !== '/ping') {
      await next();
      return;
    }

    ctx.body = { time: new Date() };
  };
};
