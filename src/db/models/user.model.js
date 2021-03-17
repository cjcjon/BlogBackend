const bcrypt = require("bcrypt");

/** 유저를 위해 사용하는 모델 */
class User {
  /**
   * 유저 생성자
   * @param {string} userName 아이디
   * @param {number} auth 권한
   */
  constructor(userName = "", auth = 0) {
    /** @type {string} @private 아이디 */
    this.userName = userName;
    /** @type {string} @private 비밀번호 */
    this.password;
    /** @type {number} @private 권한 */
    this.auth = auth;
  }

  /**
   * 아이디 반환
   */
  getUserName() {
    return this.userName;
  }

  /**
   * 비밀번호 반환
   */
  getPassword() {
    return this.password;
  }

  /**
   * 권한 반환
   */
  getAuth() {
    return this.auth;
  }

  /**
   * 아이디 설정
   * @param {string} userName 아이디
   */
  setUsername(userName) {
    this.userName = userName;
  }

  /**
   * 비밀번호 암호화해서 설정
   * @param {string} password 암호화된 비밀번호
   */
  async setHashedPassword(password) {
    const hashed = await bcrypt.hash(password, 10);
    this.password = hashed;
  }

  /**
   * 비밀번호 암호화없이 설정
   * @param {string} password 비밀번호
   */
  setRawPassword(password) {
    this.password = password;
  }

  /**
   * 권한 설정
   * @param {number} auth 권한
   */
  setAuth(auth) {
    this.auth = auth;
  }

  /**
   * JSON을 User로 변환
   * @param {JSON} userJson JSON 형태의 User
   */
  static mapping(userJson) {
    const user = new User(userJson.user_name, userJson.auth);
    user.setRawPassword(userJson.password);
    return user;
  }
}

module.exports = User;
