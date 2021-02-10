const dayjs = require("dayjs");
require("dayjs/locale/ko");
dayjs.locale("ko");

// 최근 갱신에 허용되는 날짜 차이
const allowedDateDiff = 3;

// 날짜 표시 포맷
const dateFormat = "MMM D일, YYYY년";
exports.dateFormat = dateFormat;

/** 시리즈를 위해 사용하는 모델 */
class Series {
  /**
   * 시리즈 생성자
   * @param {number} id 아이디
   * @param {string} title 제목
   * @param {string} thumbnail 썸네일 url
   * @param {string} makeDate 생성 일자
   * @param {number} postCount 포스트 갯수
   * @param {number} likes 시리즈 내 포스트 좋아요 총 갯수
   * @param {string} lastPostDate 시리즈 내의 최신 포스트 생성일자
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

    /** @type {number} @private 시리즈 내 포스트 좋아요 수 */
    this.likes = likes;

    /** @type {string} @private 시리즈 내의 최신 포스트 생성일자 */
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
   * 시리즈 내 포스트 좋아요 수 반환
   */
  getLikes() {
    return this.likes;
  }

  /**
   * 시리즈 내의 최신 포스트 생성일자 반환
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
   * 시리즈 내 포스트 좋아요 수 설정
   * @param {number} likes 좋아요 수
   */
  setLikes(likes) {
    this.likes = likes;
  }

  /**
   * 시리즈 내의 최신 포스트 생성일자 설정
   * @param {string} lastPostDate 날짜
   */
  setLastPostDate(lastPostDate) {
    if (lastPostDate === null || lastPostDate === "") {
      this.lastPostDate = "";
    } else {
      this.lastPostDate = dayjs(lastPostDate).format(dateFormat);
      this.updated =
        dayjs().diff(this.lastPostDate, "day", true) <= allowedDateDiff;
    }
  }

  /**
   * Json을 Series로 변환
   * @param {JSON} seriesJson JSON 형태의 series
   */
  static mapping(seriesJson) {
    return new Series(
      seriesJson.id,
      seriesJson.title,
      seriesJson.thumbnail,
      seriesJson.make_date,
      seriesJson.post_count,
      seriesJson.likes,
      seriesJson.last_post_date,
    );
  }

  /**
   * Json Array를 Series array로 변환
   * @param {JSON Array} seriesArray JSON 형태의 series array
   */
  static mappingArray(seriesArray) {
    return Array.from(
      seriesArray,
      (data) =>
        new Series(
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

module.exports = Series;
