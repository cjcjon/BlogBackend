const dayjs = require("dayjs");
const visitorService = require("../db/service/visitor.service");

function saveVisitDate(ctx, today) {
  ctx.cookies.set("visitDate", today, {
    maxAge: 1000 * 60 * 60 * 24, // 하루
    httpOnly: true,
  });
}

module.exports = async function (ctx, next) {
  // 방문 날짜 확인
  const visitDate = ctx.cookies.get("visitDate");
  const today = dayjs().format("YYYY-MM-DD");

  let reqSave = false;
  if (!visitDate) {
    saveVisitDate(ctx, today);

    // DB에 저장필요
    reqSave = true;
  } else {
    // 하루가 지났으면 새로운 방문자로 처리
    const diff = dayjs(today).diff(visitDate, "day");
    if (diff > 0) {
      saveVisitDate(ctx, today);

      // DB에 저장필요
      reqSave = true;
    }
  }

  // 저장이 필요할경우
  if (true === reqSave) {
    visitorService.insertIP(ctx.request.clientIpv6, today);
  }

  await next();
};
