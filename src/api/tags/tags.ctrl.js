const tagService = require("../../db/service/tag.service");

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
    ctx.throw(500, e);
  }
};
