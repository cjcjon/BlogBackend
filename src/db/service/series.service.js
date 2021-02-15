const pool = require("../index");
const Series = require("../models/series.model");

/**
 * 모든 시리즈를 가져온다
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectAll = async () => {
  let res = await pool.query("SELECT * FROM series_view");
  if (res.length === 0) {
    return null;
  }

  res = Series.mappingArray(res);

  return res;
};

/**
 * 시리즈를 아이디로 찾는다
 * @param {number} id 시리즈 아이디
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectById = async (id) => {
  let res = await pool.query("SELECT * FROM series_view WHERE id=?", [id]);
  if (res.length === 0) {
    return null;
  }

  res = Series.mapping(res[0]);

  return res;
};

/**
 * 추천 데이터들을 찾는다
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectRecommand = async () => {
  let res = await pool.query(
    `SELECT b.id AS id, b.title AS title, a.last_post_date AS last_post_date
    FROM 
        (SELECT series_id, SUM(likes) AS likes, MAX(make_date) AS last_post_date
        FROM posts
        GROUP BY series_id
        ORDER BY likes DESC
        LIMIT 5) a
      LEFT JOIN
        series b
      ON
        a.series_id = b.id`,
  );
  if (res.length === 0) {
    return null;
  }

  res = Series.mappingArray(res);

  return res;
};

/**
 * 시리즈를 db에 추가한다
 * @param {Series} series 추가할 시리즈
 * @throws {Error} Insert 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.insert = async (series) => {
  const res = await pool.query(
    "INSERT INTO series(title, thumbnail) VALUES(?, ?)",
    [series.getTitle(), series.getThumbnail()],
  );

  return {
    rel: "self",
    href: `/series/${res.insertId}/posts`,
    method: "GET",
  };
};

/**
 * id로 시리즈를 삭제한다
 * @param {number} id 삭제할 시리즈 아이디
 * @throws {Error} Delete 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.deleteById = async (id) => {
  const res = await pool.query("DELETE FROM series WHERE id=?", [id]);

  return res;
};

/**
 * 시리즈를 수정한다
 * @param {Series} series 수정할 시리즈
 * @throws {Error} Update 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.patch = async (series) => {
  // 쿼리 생성
  let query = "UPDATE series SET ";
  let entities = [];
  if (series.getTitle() !== null) {
    query += "title=?";
    entities.push(series.getTitle());
  }
  if (series.getThumbnail() !== null) {
    if (entities.length > 0) {
      query += ", ";
    }
    query += "thumbnail=?";
    entities.push(series.getThumbnail());
  }
  query += " WHERE id=?";
  entities.push(series.getId());

  // sereis 수정
  await pool.query(query, entities);

  return {
    rel: "self",
    href: `/series`,
    method: "GET",
  };
};
