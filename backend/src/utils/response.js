const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  },
  body: JSON.stringify(body),
});

const ok = (data) => response(200, { success: true, data });
const created = (data) => response(201, { success: true, data });
const notFound = (msg = "Not found") => response(404, { success: false, error: msg });
const badRequest = (msg = "Bad request") => response(400, { success: false, error: msg });
const serverError = (msg = "Internal server error") => response(500, { success: false, error: msg });
const forbidden = (msg = "Forbidden") => response(403, { success: false, error: msg });

module.exports = { ok, created, notFound, badRequest, serverError, forbidden };
