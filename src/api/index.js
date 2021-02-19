const Router = require("koa-router");
const lectures = require("./lectures/lectures");
const posts = require("./posts/posts");
const tags = require("./tags/tags");
const comment = require("./comment/comment");

const api = new Router();

api.use("/lectures", lectures.routes());
api.use("/posts", posts.routes());
api.use("/tags", tags.routes());
api.use("/comment", comment.routes());

module.exports = api;
