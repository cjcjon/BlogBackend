const jwt = require("jsonwebtoken");
// const userService = require("../db/service/user.service");

module.exports = /*async*/ (ctx, next) => {
  const token = ctx.cookies.get("access_token");

  // 토큰 없으면 무시
  if (!token) {
    return next();
  }

  try {
    // 토큰 검사
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 토큰 해석 정보 context state에 저장
    ctx.state.user = {
      userName: decoded.userName,
      auth: decoded.auth,
      ip: decoded.ip,
    };

    // IP 다르면 부정접속
    if (ctx.state.user.ip !== ctx.request.clientIpv6) {
      throw new Error();
    }

    // 토큰의 유효기간이 7시간 미만이면 재발급
    // Nextjs의 server function에서는 쿠키의 추가와 삭제가 동작하지 않는다
    // const now = Math.floor(Date.now() / 1000);
    // if (decoded.exp - now < 60 * 60 * 7) {
    //   const user = await userService.findByUserName(decoded.userName);
    //   const token = userService.generateToken(user, ctx.request.clientIpv6);
    //   ctx.cookies.set("access_token", token, {
    //     maxAge: 1000 * 60 * 60 * 24, // 1일
    //     httpOnly: true,
    //   });
    // }

    return next();
  } catch (e) {
    // 검증 실패시 토큰 지우기
    // Nextjs의 server function에서는 쿠키의 추가와 삭제는 동작하지 않는다.
    ctx.cookies.set("access_token", null, { maxAge: -1, httpOnly: true });
    if (ctx.state.user) {
      delete ctx.state.user;
    }
    return next();
  }
};
