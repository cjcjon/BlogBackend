const pool = require("../index");
const Tag = require("../models/tag.model");
const Post = require("../models/post.model");

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
  const res = await pool.query(
    "SELECT tag, COUNT(*) AS count FROM tags GROUP BY tag",
  );

  return res;
};

/**
 * 태그 검색
 * @param {string} tagName 검색용 태그
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.search = async (tagName) => {
  const searchName = `%${tagName}%`;
  let res = await pool.query(
    "SELECT a.id AS id, a.title AS title, a.body AS body, a.likes AS likes, a.view AS view FROM posts a, (SELECT post_id FROM tags WHERE tag like ?) b WHERE b.post_id = a.id",
    [searchName],
  );
  if (res.length === 0) {
    return null;
  }

  res = Post.mappingArray(res);

  return res;
};
