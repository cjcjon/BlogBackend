const Router = require("koa-router");
const tagCtrl = require("./tag.ctrl");

const tag = new Router();

/*
  GET   /tag/group    태그 그룹으로 묶어서 조회
*/
tag.get("/group", tagCtrl.groupAll);

module.exports = tag;
