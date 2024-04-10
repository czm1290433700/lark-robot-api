const LLMRequest = require('llm-request').default;
const lark = require("@larksuiteoapi/node-sdk");

class Chat {
  client;

  constructor() {
    this.client = new lark.Client({
      appId: process.env.APP_ID,
      appSecret: process.env.APP_SECRET,
      appType: lark.AppType.SelfBuild,
    });
  }

  async p2pChat (chatId) {
    try {
      const res = await this.client.im.message.list({
        params: {
          container_id_type: 'chat',
          container_id: chatId,
          sort_type: 'ByCreateTimeDesc',
          page_size: 10,
        },
      });
      const msgList = (res.data.items || []).filter(
        (item) => !item.deleted && item
      ); // 未被删除的有效信息列表
      const messages = msgList.slice(0, 5).map((item) => {
        return {
          role: item.sender.sender_type === 'user' ? 'user' : 'assistant',
          content: JSON.parse(item.body.content).text,
        }
      });
      // 反转数组使得时间正序
      messages.reverse();
      const LLMRequestEntity = new LLMRequest(process.env.API_KEY);
      const chatRes = await LLMRequestEntity.openAIChat({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              '请扮演用户的女友一二，聊天话语温柔亲昵，称呼用户为布布。解答布布的问题，并且让布布开心。',
          },
          ...messages,
        ],
      });
      await this.client.im.message.create({
        params: {
          receive_id_type: 'chat_id',
        },
        data: {
          receive_id: chatId,
          content: JSON.stringify({
            text: chatRes.answer,
          }),
          msg_type: 'text',
        },
      });
    } catch (err) {
    }
  }

  async groupChat (msg, msgId) {
    try {
      const LLMRequestEntity = new LLMRequest(process.env.API_KEY);
      const chatRes = await LLMRequestEntity.openAIChat({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              '请扮演用户的女友一二，聊天话语温柔亲昵，称呼用户为布布。解答布布的问题，并且让布布开心。',
          },
          {
            role: "user",
            content: msg.split(' ')?.slice(1)?.join(' ') || msg
          }
        ],
      });
      await this.client.im.message.reply({
        path: {
          message_id: msgId
        },
        data: {
          content: JSON.stringify({
            text: chatRes.answer
          }),
          msg_type: 'text'
        },
      });
    } catch (err) {
    }
  }

  async chat (data) {
    try {
      const { chat_id, chat_type, content, message_id } = data.message;
      if (chat_type === 'group') {
        this.groupChat(JSON.parse(content).text, message_id);
      } else {
        this.p2pChat(chat_id);
      }
    } catch (err) {

    }
  }
}

module.exports = Chat;
