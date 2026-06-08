const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLE_NAME } = require("../../utils/db");
const { ok, serverError } = require("../../utils/response");
const { getUserId } = require("../../utils/auth");

exports.handler = async (event) => {
  try {
    const userId = getUserId(event);

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":prefix": "PROJECT#",
      },
    }));

    const projects = result.Items.map((item) => ({
      id: item.SK.replace("PROJECT#", ""),
      title: item.title,
      description: item.description,
      color: item.color,
      createdAt: item.createdAt,
    }));

    return ok(projects);
  } catch (err) {
    console.error("listProjects error:", err);
    return serverError();
  }
};
