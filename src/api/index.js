const Router = require("koa-router");
const series = require("./series/series");
const posts = require("./posts/posts");
const comments = require("./comments/comments");

const api = new Router();

api.use("/series", series.routes());
api.use("/posts", posts.routes());
api.use("/comments", comments.routes());

module.exports = api;
