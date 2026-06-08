const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLE_NAME } = require("../../utils/db");
const { ok, serverError } = require("../../utils/response");
const { getUserId } = require("../../utils/auth");

exports.handler = async (event) => {
  try {
    const userId = getUserId(event);

    // Отримуємо всі проєкти
    const projectsResult = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":prefix": "PROJECT#",
      },
    }));

    // Отримуємо всі задачі
    const tasksResult = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":prefix": "TASK#",
      },
    }));

    const tasks = tasksResult.Items;

    // Статистика по статусах
    const byStatus = {
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    };

    // Статистика по пріоритетах
    const byPriority = {
      low: tasks.filter((t) => t.priority === "low").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      high: tasks.filter((t) => t.priority === "high").length,
    };

    // Прострочені задачі
    const today = new Date().toISOString().split("T")[0];
    const overdue = tasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.status !== "done"
    ).length;

    // Статистика по проєктах
    const projectStats = projectsResult.Items.map((project) => {
      const projectId = project.SK.replace("PROJECT#", "");
      const projectTasks = tasks.filter((t) => t.SK.startsWith(`TASK#${projectId}#`));
      return {
        id: projectId,
        title: project.title,
        color: project.color,
        total: projectTasks.length,
        done: projectTasks.filter((t) => t.status === "done").length,
      };
    });

    return ok({
      totalProjects: projectsResult.Items.length,
      totalTasks: tasks.length,
      byStatus,
      byPriority,
      overdue,
      projectStats,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return serverError();
  }
};
