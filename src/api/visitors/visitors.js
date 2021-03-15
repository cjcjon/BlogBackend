const Router = require("koa-router");
const visitorsCtrl = require("./visitors.ctrl");

const visitors = new Router();

/*
  GET   /visitors   방문자 통계 조회
  GET   /visitors/visit        방문 카운트
*/
visitors.get("/", visitorsCtrl.count);
visitors.get("/visit", visitorsCtrl.visit);

module.exports = visitors;
