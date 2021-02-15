const Router = require("koa-router");
const postCtrl = require("./post.ctrl");

const post = new Router();

/*
  POST      /post             포스트 작성
  GET       /post/recent      포스트 최신 데이터 조회
  GET       /post/recommand   포스트 추천 데이터 조회
  GET       /post/views       포스트 많이 본 순서대로 조회
  POST      /post/image       포스트용 이미지 업로드
  DELETE    /post/image/:imageName  포스트용 이미지 삭제
  GET       /post/:id         포스트 조회
  DELETE    /post/:id         포스트 삭제
  PATCH     /post/:id         포스트 수정
*/
post.post("/", postCtrl.write);
post.get("/recent", postCtrl.recentList);
post.get("/recommand", postCtrl.recommandList);
post.get("/views", postCtrl.mostView);
post.post("/image", postCtrl.uploadImage);
post.delete("/image/:imageName", postCtrl.deleteImage);
post.get("/:id", postCtrl.read);
post.delete("/:id", postCtrl.delete);
post.patch("/:id", postCtrl.update);

module.exports = post;
