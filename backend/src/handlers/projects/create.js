const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { docClient, TABLE_NAME } = require("../../utils/db");
const { created, badRequest, serverError } = require("../../utils/response");
const { getUserId, parseBody } = require("../../utils/auth");

exports.handler = async (event) => {
  try {
    const userId = getUserId(event);
    const body = parseBody(event);

    if (!body.title || body.title.trim() === "") {
      return badRequest("Title is required");
    }

    const projectId = uuidv4();
    const now = new Date().toISOString();

    const item = {
      PK: `USER#${userId}`,
      SK: `PROJECT#${projectId}`,
      title: body.title.trim(),
      description: body.description || "",
      color: body.color || "#6366f1",
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

    return created({
      id: projectId,
      title: item.title,
      description: item.description,
      color: item.color,
      createdAt: item.createdAt,
    });
  } catch (err) {
    console.error("createProject error:", err);
    return serverError();
  }
};
