const { DeleteCommand, QueryCommand, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLE_NAME } = require("../../utils/db");
const { ok, notFound, badRequest, serverError } = require("../../utils/response");
const { getUserId } = require("../../utils/auth");

exports.handler = async (event) => {
  try {
    const userId = getUserId(event);
    const projectId = event.pathParameters?.projectId;

    if (!projectId) return badRequest("Project ID is required");

    // Видаляємо сам проєкт
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `PROJECT#${projectId}` },
    }));

    // Видаляємо всі задачі цього проєкту
    const tasks = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":prefix": `TASK#${projectId}#`,
      },
    }));

    if (tasks.Items.length > 0) {
      const deleteRequests = tasks.Items.map((item) => ({
        DeleteRequest: { Key: { PK: item.PK, SK: item.SK } },
      }));

      // DynamoDB batch write дозволяє максимум 25 елементів за раз
      for (let i = 0; i < deleteRequests.length; i += 25) {
        await docClient.send(new BatchWriteCommand({
          RequestItems: { [TABLE_NAME]: deleteRequests.slice(i, i + 25) },
        }));
      }
    }

    return ok({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("deleteProject error:", err);
    return serverError();
  }
};
