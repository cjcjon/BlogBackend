const mariadb = require("mariadb");

// env에서 정보 가져오기
const { USER, PASSWORD, DATABASE, HOST } = process.env;

const pool = mariadb.createPool({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
});

/**
 * 사용시 주의사항
 * pool에서 직접 query 함수를 호출하면 release 까지 자동으로 해주므로 편하지만 transaction 불가
 * promise 기반이므로 await 사용 가능
 *
 * 복잡한 쿼리는 connection을 pool에서 가져오고 반환해줘야 한다
 * pool.getConnection().then(conn => {
 *  conn.query("쿼리").then((rows) => { conn.end() }).catch(err => { conn.end() })
 * }).catch(err => {
 *  // not connected
 * })
 * 또는
 * try {
 *  const conn = await pool.getConnection()
 *  const data = await conn.query("쿼리")
 * } catch (err) {
 *  throw err;
 * } finally {
 *  if (conn) conn.end();
 * }
 */
module.exports = pool;
