const Joi = require("joi");
const seriesService = require("../../db/service/series.service");
const postService = require("../../db/service/post.service");
const Series = require("../../db/models/series.model");
const imageUploader = require("../../commons/imageUploader");

/*
  시리즈 작성
  POST  /series
*/
exports.write = async (ctx) => {
  // formdata 필드는 일반적으로 body에 들어옴
  // file 형식은 ctx.request.files 안에 있고, form의 key값이 더해져서 ctx.request.files.[key] 형식이 된다

  const schema = Joi.object().keys({
    title: Joi.string().required(),
  });

  // 객체 검증
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.throw(400, result.error);
  }

  // 파일 서버에 업로드
  const thumbnailFile = ctx.request.files.thumbnailFile;
  let thumbnailUrl = "";
  try {
    thumbnailUrl = await imageUploader.uploadThumbnail(thumbnailFile);
  } catch (e) {
    if (e.status === 400) {
      ctx.throw(e.status, e.message);
    } else {
      ctx.throw(400, "이미지 업로드에 실패하였습니다");
    }
  }

  // 시리즈 데이터 생성
  const { title } = ctx.request.body;
  const series = new Series(0, title, thumbnailUrl);

  try {
    // 데이터베이스에 추가
    const res = await seriesService.insert(series);

    ctx.status = 201;
    ctx.body = res;
  } catch (e) {
    ctx.throw(400, "저장에 실패하였습니다");
  }
};

/*
  시리즈 목록 조회
  GET   /series/list
*/
exports.list = async (ctx) => {
  try {
    const series = await seriesService.selectAll();

    ctx.status = 200;
    ctx.body = series;
  } catch (e) {
    ctx.throw(400, "조회에 실패하였습니다");
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
    ctx.throw(400, "조회에 실패하였습니다");
  }
};

/*
  시리즈 정보 조회
  GET   /series/:id 
*/
exports.info = async (ctx) => {
  // 객체 검증
  const schema = Joi.object().keys({
    id: Joi.number().required(),
  });

  // 검증 실패시 에러 반환
  const result = schema.validate(ctx.params);
  if (result.error) {
    ctx.throw(400, result.error);
  }

  // id 가져오기
  const { id } = ctx.params;

  try {
    const series = await seriesService.selectById(id);

    ctx.status = 200;
    ctx.body = series;
  } catch (e) {
    ctx.throw(400, "조회에 실패하였습니다");
  }
};

/*
  시리즈 삭제
  DELETE  /series/:id     
*/
exports.delete = async (ctx) => {
  // 객체 검증
  const schema = Joi.object().keys({
    id: Joi.number().required(),
  });

  // 검증 실패시 에러 반환
  const result = schema.validate(ctx.params);
  if (result.error) {
    ctx.throw(400, result.error);
  }

  // id 가져오기
  const { id } = ctx.params;

  let series = null;
  try {
    // 요청한 시리즈 없으면 에러 반환
    series = await seriesService.selectById(id);
    if (series === null) {
      ctx.throw(404);
    }

    // 시리즈 아이디로 삭제
    await seriesService.deleteById(id);
  } catch (e) {
    if (e.status === 404) {
      ctx.throw(404);
    } else {
      ctx.throw(400, "시리즈 삭제에 실패하였습니다");
    }
  }

  try {
    // 썸네일 이미지 삭제
    await imageUploader.deleteThumbnail(series.thumbnail);
  } catch (e) {
    ctx.throw(400, "썸네일 삭제에 실패하였습니다");
  }

  // No content
  ctx.status = 204;
};

/*
  시리즈 데이터의 일부 수정
  PATCH   /series/:id     
*/
exports.modify = async (ctx) => {
  const { id } = ctx.params;

  // 객체 검증
  const schema = Joi.object().keys({
    id: Joi.number(),
    title: Joi.string(),
  });

  // 오류일경우 400 에러 반환
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.throw(400, result.error);
  }

  // id값 비교
  if (id !== ctx.request.body.id) {
    ctx.throw(400, "id가 유효하지 않습니다");
  }

  // 시리즈가 DB에 존재하는지 검사
  let series = null;
  try {
    series = await seriesService.selectById(id);
    if (series === null) {
      ctx.throw(404);
    }
  } catch (e) {
    if (e.status === 404) {
      ctx.throw(404);
    } else {
      ctx.throw(400, "조회에 실패하였습니다");
    }
  }

  // 이미지 서버에 저장
  const thumbnailFile = ctx.request.files.thumbnailFile;
  let thumbnailUrl = null;
  if (thumbnailFile) {
    try {
      // 서버에 저장
      thumbnailUrl = await imageUploader.uploadThumbnail(thumbnailFile);

      // 원래 썸네일 삭제
      await imageUploader.deleteThumbnail(series.thumbnail);
    } catch (e) {
      if (e.status === 400) {
        ctx.throw(e.status, e.message);
      } else {
        ctx.throw(400, "이미지 업로드에 실패하였습니다");
      }
    }
  }

  const { title } = ctx.request.body;
  const modifySeries = new Series(id, title, thumbnailUrl);

  try {
    // 시리즈 수정
    const res = await seriesService.patch(modifySeries);

    ctx.status = 200;
    ctx.body = res;
  } catch (e) {
    ctx.throw(400, "시리즈 수정에 실패하였습니다");
  }
};

/*
  시리즈 내부 포스트 목록 조회
  GET   /series/:id     
*/
exports.postList = async (ctx) => {
  // 객체 검증
  const schema = Joi.object().keys({
    id: Joi.number().required(),
  });

  // 검증 실패시 에러 반환
  const result = schema.validate(ctx.params);
  if (result.error) {
    ctx.throw(400, result.error);
  }

  // id 가져오기
  const { id } = ctx.params;

  try {
    const seriesData = await seriesService.selectById(id);
    if (seriesData === null) {
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
    if (e.status === 404) {
      ctx.throw(404);
    } else {
      ctx.throw(400, "조회에 실패하였습니다");
    }
  }
};
