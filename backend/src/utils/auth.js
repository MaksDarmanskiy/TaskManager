// Витягує userId з JWT токена, який вже перевірений API Gateway Authorizer
const getUserId = (event) => {
  const claims = event.requestContext?.authorizer?.claims;
  return claims?.sub || claims?.["cognito:username"];
};

// Парсить тіло запиту
const parseBody = (event) => {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return {};
  }
};

module.exports = { getUserId, parseBody };
