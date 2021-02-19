const Joi = require("joi");
const sanitizeHtml = require("../../commons/sanitizeHtml");
const postService = require("../../db/service/post.service");
const Post = require("../../db/models/post.model");
const imageUploader = require("../../commons/imageUploader");

/*
  포스트 작성
  POST    /posts
*/
exports.write = async (ctx) => {
  // array로 온 데이터를 먼저 파싱해줘야한다
  ctx.request.body.tags = JSON.parse(ctx.request.body.tags);

  // 객체 검증
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    lectureId: Joi.number().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.throw(400, result.error);
  }

  const { title, body, tags, lectureId } = ctx.request.body;
  const post = new Post(
    0,
    title,
    sanitizeHtml.sanitizeHtml(body),
    0,
    0,
    tags,
    "",
    lectureId,
  );

  try {
    // 포스트 추가
    const res = await postService.insert(post);

    ctx.status = 201;
    ctx.body = res;
  } catch (e) {
    ctx.throw(400, "포스트 입력에 실패하였습니다");
  }
};

/*
  포스트 최신 데이터 조회
  GET     /posts/recent
*/
exports.recentList = async (ctx) => {
  try {
    const posts = await postService.selectRecent();
    posts.forEach((data) => {
      data.body = sanitizeHtml.removeHtmlAndShorten(data.body, 225);
    });

    ctx.status = 200;
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  포스트 추천 데이터 조회
  GET   /posts/recommand
*/
exports.recommandList = async (ctx) => {
  try {
    const posts = await postService.selectRecommand();
    ctx.status = 200;
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  포스트 많이 본 순서대로 조회
  GET   /posts/views
*/
exports.mostView = async (ctx) => {
  try {
    const posts = await postService.selectMostView();
    ctx.status = 200;
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  포스트용 이미지 업로드
  POST    /posts/image
*/
exports.uploadImage = async (ctx) => {
  const imageFile = ctx.request.files.image;
  let imageUrl = "";
  try {
    imageUrl = await imageUploader.uploadPostImage(imageFile);
  } catch (e) {
    if (e.status === 400) {
      ctx.throw(e.status, e.message);
    } else {
      ctx.throw(400, "이미지 업로드에 실패하였습니다");
    }
  }

  ctx.status = 200;
  ctx.body = imageUrl;
};

/*
  포스트용 이미지 삭제
  DELETE  /posts/image/:imageName  
*/
exports.deleteImage = async (ctx) => {
  const schema = Joi.object().keys({
    imageName: Joi.string().required(),
  });

  // 객체 검증
  const result = schema.validate(ctx.params);
  if (result.error) {
    ctx.throw(400, result.error);
  }

  const { imageName } = ctx.params;

  // 이미지 삭제
  try {
    await imageUploader.deletePostImage(imageName);
  } catch (e) {
    ctx.throw(400, "이미지 삭제에 실패하였습니다");
  }

  // No content
  ctx.status = 204;
};

/*
  포스트 조회
  GET     /posts/:id
*/
exports.read = async (ctx) => {
  const { id } = ctx.params;

  try {
    // 포스트 아이디로 조회
    const post = await postService.selectById(id);

    // 발견하지 못할경우 에러
    if (!post) {
      ctx.throw(404);
    }

    // 조회수 증가 (IP 검사 안함)
    await postService.countView(id);
    post.setView(post.getView() + 1);

    ctx.status = 200;
    ctx.body = post;
  } catch (e) {
    if (e.status === 404) {
      ctx.throw(404);
    } else {
      ctx.throw(400, "조회에 실패하였습니다");
    }
  }
};

/*
  포스트 삭제
  DELETE  /posts/:id    
*/
exports.delete = async (ctx) => {
  const { id } = ctx.params;

  try {
    // 포스트 아이디로 삭제
    await postService.deleteById(id);
    ctx.status = 204;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  포스트 수정
  PATCH   /posts/:id  
*/
exports.update = async (ctx) => {
  const { id } = ctx.params;

  // 객체 검증
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.throw(400, result.error);
  }

  const { title, body, tags } = ctx.request.body;
  const post = new Post(id, title, sanitizeHtml.sanitizeHtml(body), 0, tags);

  try {
    // 포스트 업데이트
    const res = await postService.patch(post);

    // 에러 상태가 반환되었을경우
    if (res.status) {
      throw res;
    }

    ctx.status = 200;
    ctx.body = res;
  } catch (e) {
    ctx.throw(500, e);
  }
};
