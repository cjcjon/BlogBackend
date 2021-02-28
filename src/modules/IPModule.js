const requestIp = require("request-ip");
const Address4 = require("ip-address").Address4;
const Address6 = require("ip-address").Address6;

/**
 * 유효한 IP 주소인지 확인한다
 * @param {string} ip 아이피 주소
 */
function isIp(ip) {
  return Address4.isValid(ip) || Address6.isValid(ip);
}

module.exports = async function (ctx, next) {
  const ipv4AttributeName = "clientIpv4";
  const ipv6AttributeName = "clientIpv6";
  let ip = requestIp.getClientIp(ctx.request);

  if (isIp(ip)) {
    // ip는 전부 ipv6 형태
    let addr6 = null;
    if (Address4.isValid(ip)) {
      addr6 = Address6.fromAddress4(ip);
    } else {
      addr6 = new Address6(ip);
    }

    const v4 = addr6.to4().address;
    const v6 = addr6.canonicalForm();

    // IP v4, v6 저장
    Object.defineProperty(ctx.request, ipv4AttributeName, {
      get: () => v4,
      configurable: true,
    });
    Object.defineProperty(ctx.request, ipv6AttributeName, {
      get: () => v6,
      configurable: true,
    });
  } else {
    // IP null
    Object.defineProperty(ctx.request, ipv4AttributeName, {
      get: () => null,
      configurable: true,
    });
    Object.defineProperty(ctx.request, ipv6AttributeName, {
      get: () => null,
      configurable: true,
    });
  }

  await next();
};
