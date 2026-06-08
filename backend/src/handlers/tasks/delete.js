const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLE_NAME } = require("../../utils/db");
const { ok, badRequest, serverError } = require("../../utils/response");
const { getUserId } = require("../../utils/auth");

exports.handler = async (event) => {
  try {
    const userId = getUserId(event);
    const projectId = event.pathParameters?.projectId;
    const taskId = event.pathParameters?.taskId;

    if (!projectId || !taskId) return badRequest("Project ID and Task ID are required");

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `TASK#${projectId}#${taskId}` },
    }));

    return ok({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("deleteTask error:", err);
    return serverError();
  }
};
