const Router = require("koa-router");
const tagsCtrl = require("./tags.ctrl");

const tags = new Router();

/*
  GET   /tags/group   태그 그룹으로 묶어서 조회
*/
tags.get("/group", tagsCtrl.groupAll);

module.exports = tags;
