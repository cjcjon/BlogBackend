const Joi = require("joi");
const seriesService = require("../../db/service/series.service");
const postService = require("../../db/service/post.service");
const Series = require("../../db/models/series.model");

/*
  시리즈 작성
  POST  /series
*/
exports.write = async (ctx) => {
  // 객체 검증
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    thumbnail: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.throw(400, result.error);
  }

  const { title, thumbnail } = ctx.request.body;
  const series = new Series(0, title, thumbnail);

  try {
    // 시리즈 추가
    const res = await seriesService.insert(series);
    ctx.status = 201;
    ctx.body = res;
  } catch (e) {
    // TODO: 오류는 무조건 4XX 번대가 되도록 try catch 처리
    ctx.throw(500, e);
  }
};

/*
  시리즈 목록 조회
  GET   /series
*/
exports.list = async (ctx) => {
  try {
    const series = await seriesService.selectAll();
    ctx.status = 200;
    ctx.body = series;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  시리즈 내부 포스트 목록 조회
  GET   /series/:id     
*/
exports.postList = async (ctx) => {
  const { id } = ctx.params;

  try {
    // 시리즈 조회
    const seriesData = await seriesService.selectById(id);
    if (seriesData == null) {
      ctx.throw(404);
    }

    // 시리즈에 속한 포스트 내용 요약한 상태로 전부 조회
    const postsData = await postService.selectShortenBySeries(id);
    ctx.status = 200;
    ctx.body = {
      series: seriesData,
      posts: postsData,
    };
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  시리즈 추천 데이터 조회
  GET   /series/recommand
*/
exports.recommandList = async (ctx) => {
  try {
    const series = await seriesService.selectRecommand();
    ctx.status = 200;
    ctx.body = series;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  시리즈 삭제
  DELETE  /series/:id     
*/
exports.delete = async (ctx) => {
  const { id } = ctx.params;

  try {
    // 시리즈 아이디로 삭제
    await seriesService.deleteById(id);
    ctx.status = 204;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  시리즈 데이터의 일부 수정
  PATCH   /series/:id     
*/
exports.update = async (ctx) => {
  const { id } = ctx.params;

  // 객체 검증
  const schema = Joi.object().keys({
    title: Joi.string(),
    thumbnail: Joi.string(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.throw(400, result.error);
  }

  const { title, thumbnail } = ctx.request.body;
  const series = new Series(id, title, thumbnail);

  try {
    // 시리즈 업데이트
    const res = await seriesService.patch(series);

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
