const Router = require("koa-router");
const postsCtrl = require("./posts.ctrl");

const posts = new Router();

/*
  POST      /posts                    포스트 작성
  GET       /posts/recent             포스트 최신 데이터 조회
  GET       /posts/recommand          포스트 추천 데이터 조회
  GET       /posts/views              포스트 많이 본 순서대로 조회
  POST      /posts/image              포스트용 이미지 업로드
  DELETE    /posts/image/:imageName   포스트용 이미지 삭제
  GET       /posts/:id                포스트 조회
  DELETE    /posts/:id                포스트 삭제
  PATCH     /posts/:id                포스트 수정
*/
posts.post("/", postsCtrl.write);
posts.get("/recent", postsCtrl.recentList);
posts.get("/recommand", postsCtrl.recommandList);
posts.get("/views", postsCtrl.mostView);
posts.post("/image", postsCtrl.uploadImage);
posts.delete("/image/:imageName", postsCtrl.deleteImage);
posts.get("/:id", postsCtrl.read);
posts.delete("/:id", postsCtrl.delete);
posts.patch("/:id", postsCtrl.update);

module.exports = posts;
