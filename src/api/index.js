const Router = require("koa-router");
const series = require("./series/series");
const post = require("./post/post");
const comment = require("./comment/comment");

const api = new Router();

api.use("/series", series.routes());
api.use("/post", post.routes());
api.use("/comment", comment.routes());

module.exports = api;
