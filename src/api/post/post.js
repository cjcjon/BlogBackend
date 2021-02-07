const Router = require("koa-router");
const postCtrl = require("./post.ctrl");

const post = new Router();

/*
  POST      /posts        포스트 작성
  GET       /posts/:id    포스트 조회
  DELETE    /posts/:id    포스트 삭제
  PATCH     /posts/:id    포스트 수정
*/
post.post("/", postCtrl.write);
post.get("/:id", postCtrl.read);
post.delete("/:id", postCtrl.delete);
post.patch("/:id", postCtrl.update);

module.exports = post;
