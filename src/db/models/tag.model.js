/** 태그를 위해 사용하는 모델 */
class Tag {
  /**
   * 태그 생성자
   * @param {number} postId 연결된 포스트 아이디
   * @param {string} tag 태그
   */
  constructor(postId = 0, tag = "") {
    /** @type {number} @private 연결된 포스트 아이디 */
    this.postId = postId;
    /** @type {string} @private 태그 */
    this.tag = tag;
  }

  /**
   * 연결된 포스트 아이디 반환
   */
  getPostId() {
    return this.postId;
  }

  /**
   * 태그 반환
   */
  getTag() {
    return this.tag;
  }

  /**
   * 연결된 포스트 아이디 설정
   * @param {number} postId 연결된 포스트 아이디
   */
  setPostId(postId) {
    this.postId = postId;
  }

  /**
   * 태그 설정
   * @param {string} tag 태그
   */
  setTag(tag) {
    this.tag = tag;
  }

  /**
   * JSON을 tag로 변환
   * @param {JSON} tagJson JSON 형태의 tag
   */
  static mapping(tagJson) {
    return new Tag(tagJson.post_id, tagJson.tag);
  }

  /**
   * JSON Array를 tag array로 변환
   * @param {JSON[]} tagArray JSON 형태의 tag array
   */
  static mappingArray(tagArray) {
    return Array.from(tagArray, (data) => new Tag(data.post_id, data.tag));
  }
}

module.exports = Tag;
