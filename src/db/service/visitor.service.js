const pool = require("../index");
const dayjs = require("dayjs");

/**
 * 방문인의 IP를 저장한다
 * @param {string} IP 현재 IP
 */
exports.insertIP = async (IP) => {
  let conn = null;
  try {
    conn = await pool.getConnection();

    // 트랜잭션 시작
    await conn.beginTransaction();

    // IP 정보 저장
    await conn.query("INSERT INTO today_visitors(ip) VALUES(INET6_ATON(?))", [
      IP,
    ]);

    // 방문인 수 변경
    await conn.query(
      "INSERT INTO total_visitors(day, total) VALUES(CURDATE(), 1) ON DUPLICATE KEY UPDATE total=total+1;",
    );

    // 트랜잭션 종료
    conn.commit();
  } catch (e) {
    if (conn) {
      conn.rollback();
    }
  } finally {
    if (conn) conn.end();
  }
};

exports.select = async (limit) => {
  const res = await pool.query(
    "SELECT day, total FROM total_visitors ORDER BY day DESC LIMIT ?",
    [limit],
  );

  if (res) {
    res.forEach((element) => {
      element.day = dayjs(element.day).format("MM/DD");
    });
    res.reverse();
  }

  return res;
};
