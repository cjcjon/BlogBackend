const pool = require("../index");
const Tag = require("../models/tag.model");

/**
 * 태그 전부 반환
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectAll = async () => {
  let res = await pool.query("SELECT * FROM tags");
  if (res.length === 0) {
    return null;
  }

  res = Tag.mappingArray(res);

  return res;
};

/**
 * 태그 그룹으로 모아서 반환
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.groupSelect = async () => {
  let res = await pool.query(
    "SELECT tag, COUNT(*) AS count FROM tags GROUP BY tag",
  );

  return res;
  // res = res.reduce(function (acc, obj, index) {
  //   const tag = obj.getTag();

  //   if (index === 1) {
  //     acc = [{ tag: acc.getTag(), count: 1 }];
  //   }
  //   const idx = acc.findIndex((element) => element.tag === tag);
  //   if (idx === -1) {
  //     acc.push({
  //       tag: tag,
  //       count: 1,
  //     });
  //   } else {
  //     acc[idx].count += 1;
  //   }

  //   return acc;
  // });
};
