const Router = require("koa-router");
const seriesCtrl = require("./series.ctrl");

const series = new Router();

/*
  POST      /series         시리즈 추가
  GET       /series         시리즈 목록 조회
  GET       /series/:id     시리즈 내부 포스트 목록 조회
  DELETE    /series/:id     시리즈 삭제
  PATCH     /series/:id     시리즈 수정
*/
series.post("/", seriesCtrl.write);
series.get("/", seriesCtrl.list);
series.get("/:id", seriesCtrl.postList);
series.delete("/:id", seriesCtrl.delete);
series.patch("/:id", seriesCtrl.update);

module.exports = series;
