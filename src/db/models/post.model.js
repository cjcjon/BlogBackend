const dayjs = require("dayjs");
require("dayjs/locale/ko");
dayjs.locale("ko");

// 날짜 표시 포맷
const dateFormat = "MMM D일, YYYY년";
exports.dateFormat = dateFormat;

/** 포스트를 위해 사용하는 모델 */
class Post {
  /**
   * 포스트 생성자
   * @param {number} id 아이디
   * @param {string} title 제목
   * @param {string} body 내용
   * @param {number} likes 좋아요 수
   * @param {number} view 조회 수
   * @param {string[]} tags 태그 리스트
   * @param {string} makeDate 생성 일자
   * @param {number} lectureId 연결된 강의 아이디
   */
  constructor(
    id = 0,
    title = null,
    body = null,
    likes = 0,
    view = 0,
    tags = null,
    makeDate = "",
    lectureId = 0,
  ) {
    /** @type {number} @private 아이디 */
    this.id = id;

    /** @type {string} @private 제목 */
    this.title = title;

    /** @type {string} @private 내용 */
    this.body = body;

    /** @type {number} @private 좋아요 수 */
    this.likes = likes;

    /** @type {number} @private 조회 수 */
    this.view = view;

    /** @type {string[]} @private 태그 리스트 */
    this.tags = tags;

    /** @type {string} @private 생성 일자 */
    this.makeDate;
    this.setMakeDate(makeDate);

    /** @type {number} @private 연결된 강의 아이디 */
    this.lectureId = lectureId;
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
   * 내용 반환
   */
  getBody() {
    return this.body;
  }

  /**
   * 좋아요 수 반환
   */
  getLikes() {
    return this.likes;
  }

  /**
   * 조회 수 반환
   */
  getView() {
    return this.view;
  }

  /**
   * 태그 리스트 반환
   */
  getTags() {
    return this.tags;
  }

  /**
   * 생성일자 반환
   */
  getMakeDate() {
    return this.makeDate;
  }

  /**
   * 연결된 강의 아이디 반환
   */
  getLectureId() {
    return this.lectureId;
  }

  /**
   * 아이디 설정
   * @param {number} id 아이디
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
   * 내용 설정
   * @param {string} body 내용
   */
  setBody(body) {
    this.body = body;
  }

  /**
   * 좋아요 수 설정
   * @param {number} likes 좋아요 수
   */
  setLikes(likes) {
    this.likes = likes;
  }

  /**
   * 조회 수 설정
   * @param {number} view 조회 수
   */
  setView(view) {
    this.view = view;
  }

  /**
   * 태그 리스트 설정
   * @param {string[]} tags 태그 리스트
   */
  setTags(tags) {
    this.tags = tags;
  }

  /**
   * 생성일자 설정
   * @param {string} makeDate 생성일자
   */
  setMakeDate(makeDate) {
    if (makeDate == null || makeDate == "") {
      this.makeDate = "";
    } else {
      this.makeDate = dayjs(makeDate).format(dateFormat);
    }
  }

  /**
   * 연결된 강의 아이디 설정
   * @param {number} lectureId 연결된 강의 아이디
   */
  setLectureId(lectureId) {
    this.lectureId = lectureId;
  }

  /**
   * JSON을 post로 변환
   * @param {JSON} postJson JSON 형태의 post
   */
  static mapping(postJson) {
    return new Post(
      postJson.id,
      postJson.title,
      postJson.body,
      postJson.likes,
      postJson.view,
      postJson.tags ? postJson.tags.split(",") : [],
      postJson.make_date,
      postJson.lecture_id,
    );
  }

  /**
   * JSON array를 post array로 변환
   * @param {JSON[]} postArray JSON 형태의 post array
   */
  static mappingArray(postArray) {
    return Array.from(
      postArray,
      (data) =>
        new Post(
          data.id,
          data.title,
          data.body,
          data.likes,
          data.view,
          data.tags ? data.tags.split(",") : [],
          data.make_date,
          data.lecture_id,
        ),
    );
  }
}

module.exports = Post;
