const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { docClient, TABLE_NAME } = require("../../utils/db");
const { created, badRequest, serverError } = require("../../utils/response");
const { getUserId, parseBody } = require("../../utils/auth");

const VALID_STATUSES = ["todo", "in_progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

exports.handler = async (event) => {
  try {
    const userId = getUserId(event);
    const projectId = event.pathParameters?.projectId;
    const body = parseBody(event);

    if (!projectId) return badRequest("Project ID is required");
    if (!body.title || body.title.trim() === "") return badRequest("Title is required");
    if (body.status && !VALID_STATUSES.includes(body.status)) return badRequest("Invalid status");
    if (body.priority && !VALID_PRIORITIES.includes(body.priority)) return badRequest("Invalid priority");

    const taskId = uuidv4();
    const now = new Date().toISOString();

    const item = {
      PK: `USER#${userId}`,
      SK: `TASK#${projectId}#${taskId}`,
      title: body.title.trim(),
      description: body.description || "",
      status: body.status || "todo",
      priority: body.priority || "medium",
      dueDate: body.dueDate || null,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

    return created({
      id: taskId,
      projectId,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      dueDate: item.dueDate,
      createdAt: item.createdAt,
    });
  } catch (err) {
    console.error("createTask error:", err);
    return serverError();
  }
};
