const Router = require("koa-router");
const comments = new Router();

/*
  POST      /comments/:postId     포스트에 덧글 등록                      
  GET       /comments/:postId     포스트의 댓글 목록 조회
  DELETE    /comments/:commentId  포스트의 댓글 삭제
  PATCH     /comments/:commentId  포스트의 댓글 수정
*/

module.exports = comments;
