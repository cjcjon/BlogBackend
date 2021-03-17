const pool = require("../index");
const Lecture = require("../models/lecture.model");

/**
 * 모든 강의를 가져온다
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectAll = async () => {
  let res = await pool.query("SELECT * FROM lectures_view");
  if (res.length === 0) {
    return null;
  }

  res = Lecture.mappingArray(res);

  return res;
};

/**
 * 강의를 아이디로 찾는다
 * @param {number} id 강의 아이디
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectById = async (id) => {
  let res = await pool.query("SELECT * FROM lectures_view WHERE id=?", [id]);
  if (res.length === 0) {
    return null;
  }

  res = Lecture.mapping(res[0]);

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
        (SELECT lecture_id, SUM(likes) AS likes, MAX(make_date) AS last_post_date
        FROM posts
        GROUP BY lecture_id
        ORDER BY likes DESC
        LIMIT 5) a
      LEFT JOIN
        lectures b
      ON
        a.lecture_id = b.id`,
  );
  if (res.length === 0) {
    return null;
  }

  res = Lecture.mappingArray(res);

  return res;
};

/**
 * 강의를 db에 추가한다
 * @param {Lecture} lecture 추가할 강의
 * @throws {Error} Insert 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.insert = async (lecture) => {
  const res = await pool.query(
    "INSERT INTO lectures(title, thumbnail) VALUES(?, ?)",
    [lecture.getTitle(), lecture.getThumbnail()],
  );

  return {
    rel: "self",
    href: `/lectures/${res.insertId}/posts`,
    method: "GET",
  };
};

/**
 * id로 강의를 삭제한다
 * @param {number} id 삭제할 강의 아이디
 * @throws {Error} Delete 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.deleteById = async (id) => {
  const res = await pool.query("DELETE FROM lectures WHERE id=?", [id]);

  return res;
};

/**
 * 강의를 수정한다
 * @param {Lecture} lecture 수정할 강의
 * @throws {Error} Update 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.patch = async (lecture) => {
  // 쿼리 생성
  let query = "UPDATE lectures SET ";
  let entities = [];
  if (lecture.getTitle() !== null) {
    query += "title=?";
    entities.push(lecture.getTitle());
  }
  if (lecture.getThumbnail() !== null) {
    if (entities.length > 0) {
      query += ", ";
    }
    query += "thumbnail=?";
    entities.push(lecture.getThumbnail());
  }
  query += " WHERE id=?";
  entities.push(lecture.getId());

  // sereis 수정
  await pool.query(query, entities);

  return {
    rel: "self",
    href: `/lectures`,
    method: "GET",
  };
};
