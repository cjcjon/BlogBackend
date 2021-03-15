const Joi = require("joi");
const tagService = require("../../db/service/tag.service");
const sanitizeHtml = require("../../commons/sanitizeHtml");

/*
  태그 그룹으로 묶어서 조회
  GET   /tag/group
*/
exports.groupAll = async (ctx) => {
  try {
    const tags = await tagService.groupSelect();
    ctx.status = 200;
    ctx.body = tags;
  } catch (e) {
    ctx.throw(400, "태그 조회 실패");
  }
};

/*
  태그 이름으로 포스트 검색
  GET   /tags/:tagName
*/
exports.search = async (ctx) => {
  const { tagName } = ctx.params;

  try {
    const posts = await tagService.search(decodeURIComponent(tagName));
    if (posts) {
      posts.forEach((data) => {
        data.body = sanitizeHtml.removeHtmlAndShorten(data.body, 1000);
      });
    }

    ctx.status = 200;
    ctx.body = posts;
  } catch (e) {
    ctx.throw(400, "검색 실패");
  }
};
