const Router = require("koa-router");
const posts = new Router();

/*
  POST      /posts            포스트 작성
  GET       /posts/:postId    포스트 조회
  DELETE    /posts/:postId    포스트 삭제
  PATCH     /posts/:postId    포스트 수정
*/

module.exports = posts;
