const Router = require("koa-router");
const seriesCtrl = require("./series.ctrl");

const series = new Router();

/*
  POST      /series             시리즈 추가
  GET       /series/list        시리즈 목록 조회
  GET       /series/recommand   시리즈 추천 데이터 조회
  GET       /series/:id         시리즈 정보 조회
  DELETE    /series/:id         시리즈 삭제
  PATCH     /series/:id         시리즈 수정
  GET       /series/:id/posts   시리즈 내부 포스트 목록 조회
*/
series.post("/", seriesCtrl.write);
series.get("/list", seriesCtrl.list);
series.get("/recommand", seriesCtrl.recommandList);
series.get("/:id", seriesCtrl.info);
series.delete("/:id", seriesCtrl.delete);
series.patch("/:id", seriesCtrl.modify);
series.get("/:id/posts", seriesCtrl.postList);

module.exports = series;
