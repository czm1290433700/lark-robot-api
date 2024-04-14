const LLMRequest = require('llm-request').default;

class Document {
  client;
  url = '';
  chatId = '';

  constructor(client, url, chatId) {
    this.client = client;
    this.chatId = chatId;
    this.url = url;
  }

  async getDocumentId () {
    if (this.url.includes('wiki')) {
      const token = this.url.split('/').pop();
      // 知识库文档
      const res = await this.client.wiki.space.getNode({
        params: {
          token,
        },
      })
      return res.data.node.obj_token;
    } else {
      // 非知识库文档
      return this.url.split('/').pop();
    }
  }

  async getDocumentText () {
    const docuemntId = await this.getDocumentId();
    const res = await this.client.docx.document.rawContent({
      path: {
        document_id: docuemntId,
      },
    })
    return res.data.content;
  }

  async summary () {
    const documentContent = await this.getDocumentText();
    const LLMRequestEntity = new LLMRequest(process.env.API_KEY);
    const chatRes = await LLMRequestEntity.openAIChat({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            '请扮演用户的女友一二，聊天话语温柔亲昵，称呼用户为布布。布布会给你一段文档内容，你需要完成总结后返回给布布，总结的内容需保证关键点完整且精炼',
        },
        {
          role: 'user',
          content: `总结这段文案的内容，文案为${documentContent}`
        }
      ],
    });
    await this.client.im.message.create({
      params: {
        receive_id_type: 'chat_id',
      },
      data: {
        receive_id: this.chatId,
        content: JSON.stringify({
          text: chatRes.answer,
        }),
        msg_type: 'text',
      },
    });
  }
}

module.exports = Document;