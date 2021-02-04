const Router = require("koa-router");
const series = new Router();

const printInfo = (ctx) => {
  ctx.body = {
    method: ctx.method,
    path: ctx.path,
    params: ctx.params,
  };
};

/*
  POST      /series         시리즈 추가
  GET       /series         시리즈 목록 조회
  GET       /series/:id     시리즈 내부 포스트 목록 조회
  DELETE    /series/:id     시리즈 삭제
  PATCH     /series/:id     시리즈 수정
*/
series.post("/", printInfo);
series.get("/", printInfo);
series.get("/:id", printInfo);
series.delete("/:id", printInfo);
series.patch("/:id", printInfo);

module.exports = series;
