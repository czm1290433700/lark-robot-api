const LLMRequest = require('llm-request').default;
const Document = require("./document");

class Task {
  client;
  constructor(client) {
    this.client = client;
  }

  async createTask (summary, text, time, assignee, follower, isDocument) {
    let taskInfo = '';
    if (isDocument) {
      const documentEntity = new Document(this.client, text, '');
      const documentText = await documentEntity.getDocumentText();
      taskInfo = documentText;
    } else {
      taskInfo = text;
    }

    const LLMRequestEntity = new LLMRequest(process.env.API_KEY);
    const chatRes = await LLMRequestEntity.openAIChat({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            '你是一个PMO，负责为用户生成任务概述。用户会发给你一段内容，你需要对内容进行合适的扩充删减，在保留内容完整度的同时，描述精炼准确，能让群成员快速理解任务关键点',
        },
        {
          role: 'user',
          content: taskInfo
        }
      ],
    });

    await this.client.task.v2.task.create({
      data: {
        summary: summary,
        description: chatRes.answer,
        due: {
          timestamp: new Date(time).getTime(),
          is_all_day: true,
        },
        members: [
          ...assignee.map((item) => ({
            id: item,
            type: 'user',
            role: 'assignee'
          })),
          ...follower.map((item) => ({
            id: item,
            type: 'user',
            role: 'follower'
          }))
        ],
      },
    })
  }
}

module.exports = Task;