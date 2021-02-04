const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");

const api = require("./api");

const app = new Koa();
const router = new Router();

// 라우터 설정
router.use("/api", api.routes());

// 라우터보다 우선으로 bodyparser 적용
app.use(bodyParser());

// 라우터 미들웨어 사용
app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log("Listening to port 4000");
});
