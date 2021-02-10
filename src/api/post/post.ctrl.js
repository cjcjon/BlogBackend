const Joi = require("joi");
const postService = require("../../db/service/post.service");
const Post = require("../../db/models/post.model");

/*
  포스트 작성
  POST    /post
*/
exports.write = async (ctx) => {
  // 객체 검증
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    seriesId: Joi.number().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.throw(400, result.error);
  }

  const { title, body, tags, seriesId } = ctx.request.body;
  const post = new Post(0, title, body, 0, tags, "", seriesId);

  try {
    // 포스트 추가
    const res = await postService.insert(post);
    ctx.status = 201;
    ctx.body = res;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  포스트 최신 데이터 조회
  GET     /post/recent
*/
exports.recentList = async (ctx) => {
  try {
    const posts = await postService.selectRecent();
    ctx.status = 200;
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  포스트 추천 데이터 조회
  GET   /post/recommand
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
  GET   /post/views
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
  포스트 조회
  GET     /post/:id
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

    ctx.status = 200;
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  포스트 삭제
  DELETE  /post/:id    
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
  PATCH   /post/:id  
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
  const post = new Post(id, title, body, 0, tags);

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