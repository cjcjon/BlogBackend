const Router = require("koa-router");
const tagsCtrl = require("./tags.ctrl");

const tags = new Router();

/*
  GET   /tags/group     태그 그룹으로 묶어서 조회
  GET   /tags/:tagName  태그 이름으로 포스트 검색
*/
tags.get("/group", tagsCtrl.groupAll);
tags.get("/:tagName", tagsCtrl.search);

module.exports = tags;
