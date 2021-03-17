const dayjs = require("dayjs");
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

/*
  방문 카운트
  GET   /visitors/visit
*/
exports.visit = async (ctx) => {
  // 방문 날짜 저장
  const today = dayjs().format("YYYY-MM-DD");
  const maxAge = dayjs(dayjs().add(1, "day").format("YYYY-MM-DD")).diff(
    dayjs(),
    "ms",
  );

  ctx.cookies.set("visitDate", today, {
    maxAge: maxAge,
    httpOnly: false,
  });
  await visitorService.insertIP(ctx.request.clientIpv6, today);

  ctx.status = 204;
};
