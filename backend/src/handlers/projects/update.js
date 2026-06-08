const { UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLE_NAME } = require("../../utils/db");
const { ok, badRequest, notFound, forbidden, serverError } = require("../../utils/response");
const { getUserId, parseBody } = require("../../utils/auth");

exports.handler = async (event) => {
  try {
    const userId = getUserId(event);
    const projectId = event.pathParameters?.projectId;
    const body = parseBody(event);

    if (!projectId) return badRequest("Project ID is required");

    // Перевіряємо що проєкт існує і належить цьому користувачу
    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `PROJECT#${projectId}` },
    }));

    if (!existing.Item) return notFound("Project not found");

    const updates = {};
    const names = {};
    const values = { ":updatedAt": new Date().toISOString() };
    let expr = "SET updatedAt = :updatedAt";

    if (body.title) { expr += ", #title = :title"; names["#title"] = "title"; values[":title"] = body.title; }
    if (body.description !== undefined) { expr += ", description = :description"; values[":description"] = body.description; }
    if (body.color) { expr += ", color = :color"; values[":color"] = body.color; }

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `PROJECT#${projectId}` },
      UpdateExpression: expr,
      ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    }));

    const item = result.Attributes;
    return ok({
      id: projectId,
      title: item.title,
      description: item.description,
      color: item.color,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (err) {
    console.error("updateProject error:", err);
    return serverError();
  }
};
