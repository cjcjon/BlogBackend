const Joi = require("joi");
const userService = require("../../db/service/user.service");
const User = require("../../db/models/user.model");

/*
  회원가입
  POST  /users/register
*/
exports.register = async (ctx) => {
  // Body 검증
  const schema = Joi.object().keys({
    userName: Joi.string().alphanum().min(3).max(16).required(),
    password: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.throw(400, "잘못된 Form 형식입니다");
  }

  const { userName, password } = ctx.request.body;
  try {
    // 중복검사
    const exists = await userService.findByUserName(userName);
    if (exists) {
      ctx.throw(409, "중복된 아이디가 존재합니다");
    }

    // 유저 생성
    const user = new User(userName);
    await user.setHashedPassword(password);

    // 등록
    const res = await userService.register(user);

    ctx.status = 201;
    ctx.body = res;
  } catch (e) {
    if (e.status) {
      ctx.throw(e.status, e.message);
    }

    ctx.throw(400, "유저 등록에 실패하였습니다");
  }
};

/*
  로그인
  POST  /users/login
*/
exports.login = async (ctx) => {
  const { userName, password } = ctx.request.body;

  // 아이디나 패스워드 없으면 에러
  if (!userName || !password) {
    ctx.throw(401, "아이디나 비밀번호가 입력되지 않았습니다");
  }

  try {
    const user = await userService.findByUserName(userName);
    // 계정이 없으면 에러
    if (!user) {
      ctx.throw(401, "아이디나 비밀번호가 다릅니다");
    }

    const valid = await userService.checkPassword(password, user.getPassword());
    // 비밀번호가 다르면 에러
    if (!valid) {
      ctx.throw(401, "아이디나 비밀번호가 다릅니다");
    }

    // 반환 설정
    ctx.status = 200;
    ctx.body = {
      rel: "self",
      href: "/",
      method: "GET",
    };

    // json web token 쿠키에 설정
    const token = userService.generateToken(user);
    ctx.cookies.set("access_token", token, {
      maxAge: 1000 * 60 * 60 * 24, // 1일
      httpOnly: true,
    });
  } catch (e) {
    if (e.status) {
      ctx.throw(e.status, e.message);
    }

    ctx.throw(400, "로그인에 실패했습니다");
  }
};

/*
  로그인 상태 확인
  GET   /users/check
*/
exports.check = async (ctx) => {
  const { user } = ctx.state;

  // 로그인 중이 아니라면
  if (!user) {
    ctx.throw(401, "로그인하지 않았습니다");
    return;
  }

  // ip 정보 지우기
  delete user.ip;

  ctx.status = 201;
  ctx.body = user;
};

/*
  로그아웃
  POST  /users/logout
*/
exports.logout = async (ctx) => {
  ctx.cookies.set("access_token");
  ctx.status = 204;
};
