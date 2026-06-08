const { UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLE_NAME } = require("../../utils/db");
const { ok, badRequest, notFound, serverError } = require("../../utils/response");
const { getUserId, parseBody } = require("../../utils/auth");

const VALID_STATUSES = ["todo", "in_progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

exports.handler = async (event) => {
  try {
    const userId = getUserId(event);
    const projectId = event.pathParameters?.projectId;
    const taskId = event.pathParameters?.taskId;
    const body = parseBody(event);

    if (!projectId || !taskId) return badRequest("Project ID and Task ID are required");
    if (body.status && !VALID_STATUSES.includes(body.status)) return badRequest("Invalid status");
    if (body.priority && !VALID_PRIORITIES.includes(body.priority)) return badRequest("Invalid priority");

    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `TASK#${projectId}#${taskId}` },
    }));

    if (!existing.Item) return notFound("Task not found");

    const names = {};
    const values = { ":updatedAt": new Date().toISOString() };
    let expr = "SET updatedAt = :updatedAt";

    if (body.title) { expr += ", #title = :title"; names["#title"] = "title"; values[":title"] = body.title; }
    if (body.description !== undefined) { expr += ", description = :description"; values[":description"] = body.description; }
    if (body.status) { expr += ", #status = :status"; names["#status"] = "status"; values[":status"] = body.status; }
    if (body.priority) { expr += ", priority = :priority"; values[":priority"] = body.priority; }
    if (body.dueDate !== undefined) { expr += ", dueDate = :dueDate"; values[":dueDate"] = body.dueDate; }

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `TASK#${projectId}#${taskId}` },
      UpdateExpression: expr,
      ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    }));

    const item = result.Attributes;
    return ok({
      id: taskId,
      projectId,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      dueDate: item.dueDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (err) {
    console.error("updateTask error:", err);
    return serverError();
  }
};
