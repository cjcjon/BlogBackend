const sanitizeHtml = require("sanitize-html");

const sanitizeOption = {
  allowedTags: [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "b",
    "em",
    "u",
    "s",
    "blockquote",
    "pre",
    "span",
    "a",
    "img",
    "image",
    "iframe",
    "ol",
    "ul",
    "li",
    "sub",
    "sup",
    "br",
  ],
  allowedAttributes: {
    h1: ["id"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
    h5: ["id"],
    h6: ["id"],
    a: ["href", "class", "style", "name", "rel", "target"],
    img: ["src", "class", "style", "width", "height", "data-align"],
    iframe: [
      "src",
      "class",
      "frameborder",
      "allowfullscreen",
      "data-blot-formatter-unclickable-bound",
      "style",
      "width",
      "height",
      "data-align",
    ],
  },
  allowedIframeHostnames: ["www.youtube.com"],
};

// html 다 지우는 함수
exports.removeHtml = (body) => {
  return sanitizeHtml(body, { allowedTags: [] });
};

// html 다 지우고 내용이 길면 주어진 숫자만큼 제한하는 함수
exports.removeHtmlAndShorten = (body, length) => {
  const filtered = this.removeHtml(body);
  return filtered.length < length
    ? filtered
    : `${filtered.slice(0, length)}...`;
};

// 허용된 html tag만 남겨주는 함수
exports.sanitizeHtml = (body) => {
  return sanitizeHtml(body, sanitizeOption);
};
