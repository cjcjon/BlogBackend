require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const KoaBody = require("koa-body");
const requestIp = require("request-ip");

// DB 생성
require("./db");

// api router 생성
const api = require("./api");

// KOA 사용
const app = new Koa();
const router = new Router();

// 라우터 기본 경로 설정
router.use("/api", api.routes());

// clientIp request에 추가
app.use(async (ctx, next) => {
  const ipAttributeName = "clientIp";
  const ip = requestIp.getClientIp(ctx.request);
  Object.defineProperty(ctx.request, ipAttributeName, {
    get: () => ip,
    configurable: true,
  });

  await next();
});

// 라우터보다 우선으로 KoaBody 적용
app.use(KoaBody({ multipart: true }));

// 라우터 미들웨어 사용
app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log("Listening to port 4000");
});
