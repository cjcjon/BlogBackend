const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const mime = require("mime-types");
const { v4: uuidv4 } = require("uuid");

const allowedImageType = ["image/jpg", "image/png", "image/jpeg", "image/gif"];

/**
 * Amazon S3 생성
 * @returns AWS.S3
 */
function makeS3() {
  return new AWS.S3({
    endpoint: new AWS.Endpoint(process.env.END_POINT),
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_KEY,
    },
  });
}

/**
 * 파일의 확장자가 허용된 확장자인지 확인
 * @param {File} file 이미지 파일
 * @returns true / false
 */
function isAllowedExtension(file) {
  for (let i = 0; i < allowedImageType.length; ++i) {
    if (file.type === allowedImageType[i]) {
      return true;
    }
  }

  return false;
}

/**
 * 이미지 서버에 업로드
 * @param {File} file 업로드할 이미지 파일
 * @param {string} folder 이미지 파일 폴더
 * @param {string} name 이미지 파일 저장할 이름
 * @returns 이미지 경로
 * @throws {Error} 400 에러
 */
async function uploadImage(file, folder, name) {
  // 에러처리
  if (file === null || false === isAllowedExtension(file)) {
    let error = new Error("이미지가 유효하지 않습니다");
    error.status = 400;
    throw error;
  }

  const [fileOriginPath, fileOriginName, fileType] = [
    file.path,
    file.name,
    file.type,
  ];
  const saveName = `${folder}/${name}`;
  const contentType = mime.lookup(fileOriginName);
  const ext = mime.extension(fileType);

  const S3 = makeS3();
  await S3.putObject({
    Bucket: process.env.BUCKET_NAME, // 버킷 이름
    Key: `${saveName}.${ext}`, // 파일 이름 ({folder}/name.{extension})
    ContentType: contentType, // 파일 형식 (image/png 같은거)
    ACL: "public-read", // ACL 지울 시 전체공개 불가
    Body: fs.createReadStream(fileOriginPath), // 파일 읽어와서 버퍼에 넣기
  }).promise();

  return `${process.env.END_POINT}/${process.env.BUCKET_NAME}/${saveName}.${ext}`;
}

/**
 * 이미지 서버에서 삭제
 * @param {string} folder 이미지가 저장된 폴더
 * @param {string} url 이미지가 저장된 url
 */
async function deleteImage(folder, url) {
  const fileName = `${folder}/${path.basename(url)}`;

  const S3 = makeS3();
  await S3.deleteObject({
    Bucket: process.env.BUCKET_NAME, // 버킷 이름
    Key: fileName, // 삭제할 파일 이름
  }).promise();
}

/**
 * 썸네일 이미지 서버에 업로드
 * @param {File} file 저장할 이미지 파일
 * @returns 이미지 경로
 * @throws {Error} 400 에러
 */
exports.uploadThumbnail = async (file) => {
  const saveName = uuidv4();
  const imageUrl = await uploadImage(
    file,
    process.env.THUMBNAIL_FOLDER,
    saveName,
  );

  return imageUrl;
};

/**
 * 썸네일 이미지 삭제
 * @param {string} url 썸네일 경로
 */
exports.deleteThumbnail = async (url) => {
  await deleteImage(process.env.THUMBNAIL_FOLDER, url);
};

/**
 * 포스트에서 사용하는 이미지 서버에 업로드
 * @param {File} file 저장할 이미지 파일
 * @returns 이미지 경로
 * @throws {Error} 400 에러
 */
exports.uploadPostImage = async (file) => {
  const saveName = uuidv4();
  const imageUrl = await uploadImage(file, process.env.POST_FOLDER, saveName);

  return imageUrl;
};

/**
 * 포스트 이미지 삭제
 * @param {string} url 포스트 이미지 경로
 */
exports.deletePostImage = async (url) => {
  await deleteImage(process.env.POST_FOLDER, url);
};
