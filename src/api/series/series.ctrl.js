const dayjs = require("dayjs");
require("dayjs/locale/ko");
const Joi = require("joi");
const seriesService = require("../../db/service/series.service");
const Series = require("../../db/models/series.model");

// 한글 날짜
dayjs.locale("ko");

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
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { title, thumbnail } = ctx.request.body;

  const series = new Series(0, title, thumbnail);

  try {
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
exports.postList = async (ctx) => {};

/*
  시리즈 삭제
  DELETE  /series/:id     
*/
exports.delete = async (ctx) => {
  const { id } = ctx.params;

  try {
    const res = await seriesService.deleteById(id);
    console.log(res);
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
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { title, thumbnail } = ctx.request.body;

  const series = new Series(id, title, thumbnail);

  try {
    const res = await seriesService.patch(series);

    if (res == null) {
      ctx.status = 404;
      return;
    }

    ctx.status = 200;
    ctx.body = res;
  } catch (e) {
    ctx.throw(500, e);
  }
};
