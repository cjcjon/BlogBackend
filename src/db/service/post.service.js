const pool = require("../index");
const Post = require("../models/post.model");
const dayjs = require("dayjs");

/**
 * 포스트를 아이디로 찾는다
 * @param {number} id 포스트 아이디
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectById = async (id) => {
  let res = await pool.query("SELECT * FROM posts_view WHERE id=?", [id]);
  if (res.length === 0) {
    return null;
  }

  res = Post.mapping(res[0]);

  return res;
};

/**
 * 시리즈 아이디로 내용이 잘린 포스트 전부 반환
 * @param {number} id 시리즈 아이디
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectShortenBySeries = async (id) => {
  let res = await pool.query(
    "SELECT id, title, LEFT(body, 100) AS body, likes, tags, make_date, series_id FROM posts_view WHERE series_id=?",
    [id],
  );
  if (res.length === 0) {
    return null;
  }

  res = Post.mappingArray(res);

  return res;
};

/**
 * 최근에 작성된 데이터를 찾는다
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectRecent = async () => {
  let res = await pool.query(
    `
    SELECT a.id, a.title, a.body, b.thumbnail, a.make_date as makeDate
    FROM
      (SELECT id, title, body, series_id, make_date FROM posts ORDER BY id DESC LIMIT 2) a LEFT JOIN
      (SELECT id, thumbnail FROM series) b
    ON a.series_id = b.id`,
  );

  return Array.from(res, (data) => ({
    ...data,
    makeDate: dayjs(data.makeDate).format("YYYY-MM-DD HH:mm:ss"),
  }));
};

/**
 * 추천 데이터들을 찾는다
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectRecommand = async () => {
  let res = await pool.query(
    "SELECT id, title, likes, make_date FROM posts ORDER BY likes DESC LIMIT 5",
  );
  if (res.length === 0) {
    return null;
  }

  res = Post.mappingArray(res);

  return res;
};

/**
 * 가장 많이 본 데이터들을 찾는다
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectMostView = async () => {
  let res = await pool.query(
    "SELECT id, title, view FROM posts ORDER BY view DESC LIMIT 5",
  );
  if (res.length === 0) {
    return null;
  }

  res = Post.mappingArray(res);

  return res;
};

/**
 * 포스트를 db에 추가한다
 * @param {Post} post 추가할 포스트
 * @throws {Error} Insert 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.insert = async (post) => {
  let conn = null;
  let res = null;

  try {
    conn = await pool.getConnection();

    // 트랜잭션 시작
    await conn.beginTransaction();

    // 포스트 추가
    res = await conn.query(
      "INSERT INTO posts(title, body, series_id) VALUES(?, ?, ?)",
      [post.getTitle(), post.getBody(), post.getSeriesId()],
    );

    // 태그 추가
    if (post.getTags().length > 0) {
      await conn.batch(
        `INSERT INTO tags(post_id, tag) VALUES(${res.insertId}, ?)`,
        post.getTags(),
      );
    }

    // 트랜잭션 종료
    conn.commit();
    // eslint-disable-next-line no-useless-catch
  } catch (e) {
    if (conn) {
      conn.rollback();
    }

    throw e;
  } finally {
    if (conn) conn.end();
  }

  return {
    rel: "self",
    href: `${process.env.FRONT_URL}/post/${res.insertId}`,
    method: "GET",
  };
};

/**
 * id로 포스트를 삭제한다
 * @param {number} id 삭제할 포스트 아이디
 * @throws {Error} Delete 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.deleteById = async (id) => {
  const res = await pool.query("DELETE FROM posts WHERE id=?", [id]);

  return res;
};

/**
 * 포스트를 수정한다
 * @param {Post} post 수정할 포스트
 * @throws {Error} Update 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.patch = async (post) => {
  // 필요한 데이터가 없을경우 에러 반환
  if (
    post.getTitle() === null &&
    post.getBody() === null &&
    post.getTags() === null
  ) {
    let error = new Error("Empty request body");
    error.status = 400;
    return error;
  }

  // id에 해당하는 포스트가 존재하나 확인
  const res = await pool.query("SELECT * FROM posts WHERE id=?", [
    post.getId(),
  ]);
  if (res.length === 0) {
    let error = new Error();
    error.status = 404;
    return error;
  }

  // 쿼리 생성
  let postQuery = "UPDATE posts SET ";
  let entities = [];
  if (post.getTitle() !== null) {
    postQuery += "title=?";
    entities.push(post.getTitle());
  }
  if (post.getBody() !== null) {
    if (entities.length > 0) {
      postQuery += ", ";
    }
    postQuery += "body=?";
    entities.push(post.getBody());
  }
  postQuery += ` WHERE id=${post.getId()}`;

  let conn = null;

  try {
    conn = await pool.getConnection();

    // 트랜잭션 시작
    conn.beginTransaction();

    // post 수정
    if (post.getTitle() !== null || post.getBody() !== null) {
      await conn.query(postQuery, entities);
    }

    // 태그 수정이 필요할경우
    if (post.getTags() !== null) {
      // 연관된 태그 전부 삭제
      conn.query("DELETE FROM tags WHERE post_id=?", post.getId());

      // 바꿀 태그가 존재할경우
      if (post.getTags().length > 0) {
        await conn.batch(
          `INSERT INTO tags(post_id, tag) VALUES(${post.getId()}, ?)`,
          post.getTags(),
        );
      }
    }

    // 트랜잭션 종료
    conn.commit();
  } catch (e) {
    if (conn) {
      conn.rollback();
    }

    throw e;
  } finally {
    if (conn) conn.end();
  }

  return {
    rel: "self",
    href: `${process.env.FRONT_URL}/post/${post.getId()}`,
    method: "GET",
  };
};
