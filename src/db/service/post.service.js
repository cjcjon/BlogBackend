const pool = require("../index");
const Post = require("../models/post.model");
const dayjs = require("dayjs");
require("dayjs/locale/ko");
dayjs.locale("ko");

/**
 * 포스트를 아이디로 찾는다
 * @param {number} id 포스트 아이디
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectById = async (id) => {
  let res = await pool.query("SELECT * FROM posts_tags_view WHERE id=?", [id]);
  if (res.length === 0) {
    return null;
  }

  res = Post.mapping(res[0]);

  return res;
};

/**
 * 강의 아이디로 포스트 전부 반환
 * @param {number} id 강의 아이디
 * @throws {Error} Select 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.selectByLecture = async (id) => {
  let res = await pool.query(
    "SELECT id, title, body, view, likes, tags, make_date, lecture_id FROM posts_tags_view WHERE lecture_id=?",
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
      (SELECT id, title, body, lecture_id, make_date FROM posts ORDER BY id DESC LIMIT 2) a LEFT JOIN
      (SELECT id, thumbnail FROM lectures) b
    ON a.lecture_id = b.id`,
  );

  return Array.from(res, (data) => ({
    ...data,
    makeDate: dayjs(data.makeDate).format("YYYY년 MMM Dddd"),
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
      "INSERT INTO posts(title, body, lecture_id) VALUES(?, ?, ?)",
      [post.getTitle(), post.getBody(), post.getLectureId()],
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
    href: `/posts/${res.insertId}`,
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
 * 포스트 조회수 증가
 * @param {number} id 조회수 늘릴 포스트 아이디
 * @throws {Error} Update 문제 발생 시 Error object 반환 https://mariadb.com/kb/en/connector-nodejs-promise-api/#error
 */
exports.countView = async (id) => {
  const res = await pool.query("UPDATE posts SET view = view + 1 WHERE id=?", [
    id,
  ]);

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
    throw error;
  }

  // id에 해당하는 포스트가 존재하나 확인
  const res = await pool.query("SELECT * FROM posts WHERE id=?", [
    post.getId(),
  ]);
  if (res.length === 0) {
    let error = new Error();
    error.status = 404;
    throw error;
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
    href: `/post/${post.getId()}`,
    method: "GET",
  };
};

/**
 * 포스트에 좋아요를 추가한다
 * @param {Post} id 좋아요를 누를 포스트
 * @throws {Error} 포스트가 없을땐 404 Error, 좋아요 이미 눌렀으면 400, 그 외는 일반 Error 반환
 */
exports.like = async (id, ipv6) => {
  // id에 해당하는 포스트가 존재하나 확인
  let res = await pool.query("SELECT * FROM posts WHERE id=?", [id]);
  if (res.length === 0) {
    let error = new Error("포스트가 존재하지 않습니다");
    error.status = 404;
    throw error;
  }

  let conn = null;
  try {
    conn = await pool.getConnection();

    // 트랜잭션 시작
    await conn.beginTransaction();

    // 좋아요 정보 저장
    await conn.query(
      "INSERT INTO likes(post_id, ip) VALUES(?, INET6_ATON(?))",
      [id, ipv6],
    );

    // 좋아요 수 변경
    await conn.query("UPDATE posts SET likes=likes + 1 WHERE id=?", [id]);

    // 트랜잭션 종료
    conn.commit();
  } catch (e) {
    if (conn) {
      conn.rollback();
    }

    // 키 중복
    if (e.errno === 1062) {
      let error = new Error();
      error.status = 400;
      error.message = "이미 좋아요를 누른 포스트입니다";
      throw error;
    } else {
      throw e;
    }
  } finally {
    if (conn) conn.end();
  }

  // 좋아요 수 반환
  res = await pool.query("SELECT likes FROM posts WHERE id=?", [id]);
  return { likes: res[0].likes };
};
