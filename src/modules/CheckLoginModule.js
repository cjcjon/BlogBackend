module.exports = function (ctx, next) {
  // User 정보가 없거나 권한이 없을경우
  if (!ctx.state.user || ctx.state.user.auth !== 1) {
    ctx.throw(401, "로그인 정보가 없습니다");
  }

  return next();
};
