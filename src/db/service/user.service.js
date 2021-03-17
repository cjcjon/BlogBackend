const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../index");
const User = require("../models/user.model");

/**
 * 아이디로 찾기
 * @param {string} userName 아이디
 */
exports.findByUserName = async (userName) => {
  const res = await pool.query(
    "SELECT user_name, password, auth FROM users WHERE user_name = ?",
    [userName],
  );

  // 아무것도 없으면 null
  if (res.length === 0) {
    return null;
  }

  const user = User.mapping(res[0]);
  return user;
};

/**
 * 유저 등록
 * @param {User} user 유저 정보
 * @returns 이동할 주소(href)가 포함된 Object
 */
exports.register = async (user) => {
  await pool.query("INSERT INTO users(user_name, password) VALUES(?, ?)", [
    user.getUserName(),
    user.getPassword(),
  ]);

  return {
    rel: "self",
    href: "/",
    method: "GET",
  };
};

/**
 * 비밀번호 같은지 검사
 * @param {string} rawPassword 원본 비밀번호
 * @param {string} hashedPassword 암호화된 비밀번호
 * @returns 비밀번호 같으면 true
 */
exports.checkPassword = async (rawPassword, hashedPassword) => {
  const result = await bcrypt.compare(rawPassword, hashedPassword);
  return result;
};

/**
 * JWT token 발행
 * @param {User} user 유저
 * @returns Json web token
 */
exports.generateToken = (user) => {
  const token = jwt.sign(
    // 첫 원소에는 넣고싶은 값
    { userName: user.getUserName(), auth: user.getAuth() },
    // 두 번째 원소에는 암호화 키
    process.env.JWT_SECRET,
    // 세 번째 원소는 옵션
    { expiresIn: "1d" },
  );

  return token;
};
