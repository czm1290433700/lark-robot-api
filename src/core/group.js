const LLMRequest = require('llm-request').default;
const Document = require("./document");

class Group {
  client;
  constructor(client) {
    this.client = client;
  }

  async createGroup (groupName, ownerId, userIds, text, isDocument) {
    const res = await this.client.im.chat.create({
      params: {
        user_id_type: 'open_id',
        set_bot_manager: true,
      },
      data: {
        name: groupName,
        description: '基于OpenAI API的飞书机器人一二熊自动生成',
        owner_id: ownerId,
        user_id_list: userIds,
      },
    });

    let groupInfo = '';
    if (isDocument) {
      const documentEntity = new Document(this.client, text, '');
      const documentText = await documentEntity.getDocumentText();
      groupInfo = documentText;
    } else {
      groupInfo = text;
    }

    const LLMRequestEntity = new LLMRequest(process.env.API_KEY);
    const chatRes = await LLMRequestEntity.openAIChat({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            '你是一个群的管理员，负责在群创建之初给群成员说明拉群用意。用户会发给你一段内容，你需要对内容进行合适的扩充删减，在保留内容完整度的同时，描述精炼准确，能让群成员快速理解拉群用意',
        },
        {
          role: 'user',
          content: groupInfo
        }
      ],
    });

    await this.client.im.message.create({
      params: {
        receive_id_type: "chat_id",
      },
      data: {
        receive_id: res.data.chat_id,
        content: JSON.stringify({
          text: chatRes.answer,
        }),
        msg_type: "text",
      },
    });
  }
}

module.exports = Group;