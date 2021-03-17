const dayjs = require("dayjs");
require("dayjs/locale/ko");
dayjs.locale("ko");

// 최근 갱신에 허용되는 날짜 차이
const allowedDateDiff = 3;

// 날짜 표시 포맷
const dateFormat = "MMM D일, YYYY년";
exports.dateFormat = dateFormat;

/** 강의를 위해 사용하는 모델 */
class Lecture {
  /**
   * 강의 생성자
   * @param {number} id 아이디
   * @param {string} title 제목
   * @param {string} thumbnail 썸네일 url
   * @param {string} makeDate 생성 일자
   * @param {number} postCount 포스트 갯수
   * @param {number} likes 강의 내 포스트 좋아요 총 갯수
   * @param {string} lastPostDate 강의 내의 최신 포스트 생성일자
   */
  constructor(
    id = 0,
    title = null,
    thumbnail = null,
    makeDate = null,
    postCount = 0,
    likes = 0,
    lastPostDate = null,
  ) {
    /** @type {Number} @private 아이디 */
    this.id = id;

    /** @type {string} @private 제목 */
    this.title = title;

    /** @type {string} @private 썸네일 url */
    this.thumbnail = thumbnail;

    /** @type {string} @private 생성일자 */
    this.makeDate;
    this.setMakeDate(makeDate);

    /** @type {number} @private 포스트 갯수 */
    this.postCount = postCount;

    /** @type {number} @private 강의 내 포스트 좋아요 수 */
    this.likes = likes;

    /** @type {string} @private 강의 내의 최신 포스트 생성일자 */
    this.lastPostDate;

    /** @type {boolean} @private 최근 갱신 상태 */
    this.updated;
    this.setLastPostDate(lastPostDate);
  }

  /**
   * 아이디 반환
   */
  getId() {
    return this.id;
  }

  /**
   * 제목 반환
   */
  getTitle() {
    return this.title;
  }

  /**
   * 썸네일 url 반환
   */
  getThumbnail() {
    return this.thumbnail;
  }

  /**
   * 생성일자 반환
   */
  getMakeDate() {
    return this.makeDate;
  }

  /**
   * 포스트 갯수 반환
   */
  getPostCount() {
    return this.postCount;
  }

  /**
   * 강의 내 포스트 좋아요 수 반환
   */
  getLikes() {
    return this.likes;
  }

  /**
   * 강의 내의 최신 포스트 생성일자 반환
   */
  getLastPostDate() {
    return this.lastPostDate;
  }

  /**
   * 최근 갱신 상태
   */
  getUpdated() {
    return this.updated;
  }

  /**
   * 아이디 설정
   * @param {Number} id 아이디
   */
  setId(id) {
    this.id = id;
  }

  /**
   * 제목 설정
   * @param {string} title 제목
   */
  setTitle(title) {
    this.title = title;
  }

  /**
   * 썸네일 url 설정
   * @param {string} thumbnail 썸네일 url
   */
  setThumbnail(thumbnail) {
    this.thumbnail = thumbnail;
  }

  /**
   * 생성일자 설정
   * @param {string} makeDate 생성일자
   */
  setMakeDate(makeDate) {
    if (makeDate === null || makeDate === "") {
      this.makeDate = "";
    } else {
      this.makeDate = dayjs(makeDate).format(dateFormat);
    }
  }

  /**
   * 포스트 갯수 설정
   * @param {number} postCount 포스트 갯수
   */
  setPostCount(postCount) {
    this.postCount = postCount;
  }

  /**
   * 강의 내 포스트 좋아요 수 설정
   * @param {number} likes 좋아요 수
   */
  setLikes(likes) {
    this.likes = likes;
  }

  /**
   * 강의 내의 최신 포스트 생성일자 설정
   * @param {string} lastPostDate 날짜
   */
  setLastPostDate(lastPostDate) {
    if (lastPostDate === null || lastPostDate === "") {
      this.lastPostDate = "";
    } else {
      this.lastPostDate = dayjs(lastPostDate).format(dateFormat);
      this.updated =
        dayjs().diff(dayjs(lastPostDate), "day", true) <= allowedDateDiff;
    }
  }

  /**
   * Json을 Lecture로 변환
   * @param {JSON} lectureJson JSON 형태의 lecture
   */
  static mapping(lectureJson) {
    return new Lecture(
      lectureJson.id,
      lectureJson.title,
      lectureJson.thumbnail,
      lectureJson.make_date,
      lectureJson.post_count,
      lectureJson.likes,
      lectureJson.last_post_date,
    );
  }

  /**
   * Json Array를 Lecture array로 변환
   * @param {JSON Array} lectureArray JSON 형태의 lecture array
   */
  static mappingArray(lectureArray) {
    return Array.from(
      lectureArray,
      (data) =>
        new Lecture(
          data.id,
          data.title,
          data.thumbnail,
          data.make_date,
          data.post_count,
          data.likes,
          data.last_post_date,
        ),
    );
  }
}

module.exports = Lecture;
