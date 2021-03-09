const visitorService = require("../../db/service/visitor.service");

/*
  방문자 통계 조회
  GET   /visitors
*/
exports.count = async (ctx) => {
  try {
    const visitors = await visitorService.select(5);

    ctx.status = 200;
    ctx.body = visitors;
  } catch (e) {
    ctx.throw(400, "방문자 통계 조회에 실패했습니다");
  }
};
