const Router = require("koa-router");
const lecturesCtrl = require("./lectures.ctrl");

const lectures = new Router();

/*
  POST      /lectures             강의 추가
  GET       /lectures/list        강의 목록 조회
  GET       /lectures/recommand   강의 추천 데이터 조회
  GET       /lectures/:id         강의 정보 조회
  DELETE    /lectures/:id         강의 삭제
  PATCH     /lectures/:id         강의 수정
  GET       /lectures/:id/posts   강의 내부 포스트 목록 조회
*/
lectures.post("/", lecturesCtrl.write);
lectures.get("/list", lecturesCtrl.list);
lectures.get("/recommand", lecturesCtrl.recommandList);
lectures.get("/:id", lecturesCtrl.info);
lectures.delete("/:id", lecturesCtrl.delete);
lectures.patch("/:id", lecturesCtrl.modify);
lectures.get("/:id/posts", lecturesCtrl.postList);

module.exports = lectures;