const Joi = require("joi");
const sanitizeHtml = require("../../commons/sanitizeHtml");
const lectureService = require("../../db/service/lecture.service");
const postService = require("../../db/service/post.service");
const Lecture = require("../../db/models/lecture.model");
const imageUploader = require("../../commons/imageUploader");

/*
  강의 작성
  POST  /lectures
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

  // 강의 데이터 생성
  const title = sanitizeHtml.removeHtml(ctx.request.body.title);
  const lecture = new Lecture(0, title, thumbnailUrl);

  try {
    // 데이터베이스에 추가
    const res = await lectureService.insert(lecture);
    ctx.status = 201;
    ctx.body = res;
  } catch (e) {
    ctx.throw(400, "저장에 실패하였습니다");
  }
};

/*
  강의 목록 조회
  GET   /lectures/list
*/
exports.list = async (ctx) => {
  try {
    const lectures = await lectureService.selectAll();

    ctx.status = 200;
    ctx.body = lectures;
  } catch (e) {
    ctx.throw(400, "조회에 실패하였습니다");
  }
};

/*
  강의 추천 데이터 조회
  GET   /lectures/recommand
*/
exports.recommandList = async (ctx) => {
  try {
    const lectures = await lectureService.selectRecommand();

    ctx.status = 200;
    ctx.body = lectures;
  } catch (e) {
    ctx.throw(400, "조회에 실패하였습니다");
  }
};

/*
  강의 정보 조회
  GET   /lectures/:id 
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
    const lecture = await lectureService.selectById(id);

    ctx.status = 200;
    ctx.body = lecture;
  } catch (e) {
    ctx.throw(400, "조회에 실패하였습니다");
  }
};

/*
  강의 삭제
  DELETE  /lectures/:id     
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

  let lecture = null;
  try {
    // 요청한 강의 없으면 에러 반환
    lecture = await lectureService.selectById(id);
    if (lecture === null) {
      ctx.throw(404);
    }

    // TODO: postService의 delete로 관련된 포스트 전부 지우기

    // 강의 아이디로 삭제
    await lectureService.deleteById(id);
  } catch (e) {
    if (e.status === 404) {
      ctx.throw(404);
    } else {
      ctx.throw(400, "강의 삭제에 실패하였습니다");
    }
  }

  try {
    // 썸네일 이미지 삭제
    await imageUploader.deleteThumbnail(lecture.thumbnail);
  } catch (e) {
    ctx.throw(400, "썸네일 삭제에 실패하였습니다");
  }

  // No content
  ctx.status = 204;
};

/*
  강의 데이터의 일부 수정
  PATCH   /lectures/:id     
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

  // 강의가 DB에 존재하는지 검사
  let lecture = null;
  try {
    lecture = await lectureService.selectById(id);
    if (lecture === null) {
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
      await imageUploader.deleteThumbnail(lecture.thumbnail);
    } catch (e) {
      if (e.status === 400) {
        ctx.throw(e.status, e.message);
      } else {
        ctx.throw(400, "이미지 업로드에 실패하였습니다");
      }
    }
  }

  let { title } = ctx.request.body;
  if (title) {
    title = sanitizeHtml.removeHtml(title);
  }
  const modifyLecture = new Lecture(id, title, thumbnailUrl);

  try {
    // 강의 수정
    const res = await lectureService.patch(modifyLecture);

    ctx.status = 200;
    ctx.body = res;
  } catch (e) {
    ctx.throw(400, "강의 수정에 실패하였습니다");
  }
};

/*
  깅의 내부 포스트 목록 조회
  GET   /lectures/:id     
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
    const lectureData = await lectureService.selectById(id);
    if (lectureData === null) {
      ctx.throw(404);
    }

    // 강의에 속한 포스트 내용 전부 조회
    const postsData = await postService.selectByLecture(id);
    if (postsData) {
      postsData.forEach((data) => {
        data.setBody(sanitizeHtml.removeHtmlAndShorten(data.getBody(), 150));
      });
    }

    ctx.status = 200;
    ctx.body = {
      lecture: lectureData,
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
