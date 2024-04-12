const LLMRequest = require('llm-request').default;

class Message {
  client;

  constructor(client) {
    this.client = client;
  }

  async sendMessageToUsers (users, request) {
    const LLMRequestEntity = new LLMRequest(process.env.API_KEY);
    const chatRes = await LLMRequestEntity.openAIChat({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            '用户会让你想一段某个主题的内容，他会把这个内容转发给别人，请直接输出转发的内容，不要输出其他无关信息，如语气词等',
        },
        {
          role: 'user',
          content: request
        }
      ],
    });
    users.forEach((item) => {
      this.client.im.message.create({
        params: {
          receive_id_type: "open_id",
        },
        data: {
          receive_id: item,
          content: JSON.stringify({
            text: chatRes.answer,
          }),
          msg_type: "text",
        },
      });
    })
  }
}

module.exports = Message;