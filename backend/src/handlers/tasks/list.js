const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLE_NAME } = require("../../utils/db");
const { ok, badRequest, serverError } = require("../../utils/response");
const { getUserId } = require("../../utils/auth");

exports.handler = async (event) => {
  try {
    const userId = getUserId(event);
    const projectId = event.pathParameters?.projectId;
    const { status, priority } = event.queryStringParameters || {};

    if (!projectId) return badRequest("Project ID is required");

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":prefix": `TASK#${projectId}#`,
      },
    }));

    let tasks = result.Items.map((item) => ({
      id: item.SK.split("#")[2],
      projectId,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      dueDate: item.dueDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    // Фільтрація на рівні додатку
    if (status) tasks = tasks.filter((t) => t.status === status);
    if (priority) tasks = tasks.filter((t) => t.priority === priority);

    // Сортування: спочатку нові
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return ok(tasks);
  } catch (err) {
    console.error("listTasks error:", err);
    return serverError();
  }
};
