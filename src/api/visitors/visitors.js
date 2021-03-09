const Router = require("koa-router");
const visitorsCtrl = require("./visitors.ctrl");

const visitors = new Router();

/*
  GET   /visitors   방문자 통계 조회
*/
visitors.get("/", visitorsCtrl.count);

module.exports = visitors;
