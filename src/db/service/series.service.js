const pool = require("../index");
const Series = require("../models/series.model");

/**
 * 시리즈를 db에 추가한다
 * @param {Series} series 추가할 시리즈
 * @throws {Error} insert 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.insert = async (series) => {
  const res = await pool.query(
    "INSERT INTO series(title, thumbnail) VALUES(?, ?)",
    [series.getTitle(), series.getThumbnail()],
  );

  return {
    rel: "self",
    href: `${process.env.FRONT_URL}/series/${res.insertId}`,
    method: "GET",
  };
};

/**
 * 모든 시리즈를 가져온다
 * @throws {Error} 문제 발생시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectAll = async () => {
  let res = await pool.query("SELECT * FROM series_view");
  res = Series.mapping(res);

  return res;
};

/**
 * id로 시리즈를 삭제한다
 * @param {number} id 삭제할 시리즈 아이디
 */
exports.deleteById = async (id) => {
  const res = await pool.query("DELETE FROM series WHERE id=?", [id]);

  return res;
};

/**
 * 시리즈를 수정한다
 * @param {Series} series 수정할 시리즈
 */
exports.patch = async (series) => {
  if (series.getTitle() === "" && series.getThumbnail() === "") {
    return;
  }

  // 쿼리 생성
  let query = "UPDATE series SET ";
  let entities = [];
  if (series.getTitle() !== "") {
    query += "title=?";
    entities.push(series.getTitle());
  }
  if (series.getThumbnail() !== "") {
    query += ", thumbnail=?";
    entities.push(series.getThumbnail());
  }
  query += ` WHERE id = ${series.getId()}`;

  const res = await pool.query(query, entities);

  if (res.affectedRows === 0) {
    return null;
  }

  return {
    rel: "self",
    href: `${process.env.FRONT_URL}/series/${series.getId()}`,
    method: "GET",
  };
};
