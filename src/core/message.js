const LLMRequest = require('llm-request').default;
const Image = require("./image");

class Message {
  client;

  constructor(client) {
    this.client = client;
  }

  async getMessage (request) {
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
    return chatRes.answer;
  }

  async sendMessageToUsers (users, request) {
    const answer = await this.getMessage(request);
    users.forEach((item) => {
      this.client.im.message.create({
        params: {
          receive_id_type: "open_id",
        },
        data: {
          receive_id: item,
          content: JSON.stringify({
            text: answer,
          }),
          msg_type: "text",
        },
      });
    })
  }

  async getGroupList (chats) {
    const finalChats = [];
    for (let i = 0; i < chats.length; i++) {
      const imageEntity = new Image(this.client, chats[i].avatar);
      const imageKey = await imageEntity.getImageKey();
      finalChats.push({
        ...chats[i],
        avatar: imageKey,
        key: i + 1
      })
    }
    return finalChats;
  }

  async sendMessageToGroup (chatName, request, chat_id) {
    const answer = await this.getMessage(request);
    const res = await this.client.im.chat.search({
      params: {
        query: chatName,
        page_size: 100,
      },
    })
    // 精准搜索的同名chats
    const validChats = res.data.items.filter((item) => item.name === chatName);
    if (validChats.length === 1) {
      // 有一个有效群聊，发送消息
      await this.client.im.message.create({
        params: {
          receive_id_type: "chat_id",
        },
        data: {
          receive_id: validChats[0].chat_id,
          content: JSON.stringify({
            text: answer,
          }),
          msg_type: "text",
        },
      });
    } else if (validChats.length > 1) {
      try {
        const groupList = await this.getGroupList(validChats);
        // 有多个同名群聊，推送消息要求使用id确认
        await this.client.im.message.create({
          params: {
            receive_id_type: "chat_id",
          },
          data: {
            receive_id: chat_id,
            content: JSON.stringify({
              type: "template",
              data: {
                template_id: "AAqkuJdDSDGNX",
                template_version_name: "1.0.0",
                template_variable: {
                  group_name: chatName,
                  group_list: groupList
                }
              },
            }),
            msg_type: "interactive",
          },
        });
      } catch (err) {
      }
    }
  }

  async sendMessageToGroupById (chatIds, request) {

    const answer = await this.getMessage(request);
    chatIds.forEach((item) => {
      this.client.im.message.create({
        params: {
          receive_id_type: "chat_id",
        },
        data: {
          receive_id: item,
          content: JSON.stringify({
            text: answer,
          }),
          msg_type: "text",
        },
      });
    })
  }
}

module.exports = Message;