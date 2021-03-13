const Router = require("koa-router");
const usersCtrl = require("./users.ctrl");

const users = new Router();

/*
  POST  /users/register     회원가입
  POST  /users/login        로그인
  GET   /users/check        로그인 상태 확인
  POST  /users/logout       로그아웃
*/
users.post("/register", usersCtrl.register);
users.post("/login", usersCtrl.login);
users.get("/check", usersCtrl.check);
users.post("/logout", usersCtrl.logout);

module.exports = users;
