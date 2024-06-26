const LLMRequest = require("llm-request").default;
const lark = require("@larksuiteoapi/node-sdk");
const Document = require("./document");
const Message = require("./message");
const Group = require("./group");
const Task = require("./task");

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
          container_id_type: "chat",
          container_id: chatId,
          sort_type: "ByCreateTimeDesc",
          page_size: 10,
        },
      });
      const msgList = (res.data.items || []).filter(
        (item) => !item.deleted && item
      ); // 未被删除的有效信息列表
      const messages = msgList.slice(0, 5).map((item) => {
        return {
          role: item.sender.sender_type === "user" ? "user" : "assistant",
          content: JSON.parse(item.body.content).text,
        };
      });
      // 反转数组使得时间正序
      messages.reverse();
      const LLMRequestEntity = new LLMRequest(process.env.API_KEY);
      const chatRes = await LLMRequestEntity.openAIChat({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "请扮演用户的女友一二，聊天话语温柔亲昵，称呼用户为布布。解答布布的问题，并且让布布开心。",
          },
          ...messages,
        ],
      });
      await this.client.im.message.create({
        params: {
          receive_id_type: "chat_id",
        },
        data: {
          receive_id: chatId,
          content: JSON.stringify({
            text: chatRes.answer,
          }),
          msg_type: "text",
        },
      });
    } catch (err) { }
  }

  async groupChat (msg, msgId) {
    try {
      const LLMRequestEntity = new LLMRequest(process.env.API_KEY);
      const chatRes = await LLMRequestEntity.openAIChat({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "请扮演用户的女友一二，聊天话语温柔亲昵，称呼用户为布布。解答布布的问题，并且让布布开心。",
          },
          {
            role: "user",
            content: msg.split(" ")?.slice(1)?.join(" ") || msg,
          },
        ],
      });
      await this.client.im.message.reply({
        path: {
          message_id: msgId,
        },
        data: {
          content: JSON.stringify({
            text: chatRes.answer,
          }),
          msg_type: "text",
        },
      });
    } catch (err) { }
  }

  async chat (data) {
    const { chat_id, chat_type, content, message_id, mentions } = data.message;
    try {
      const text = JSON.parse(content).text;

      if (text.includes("/help")) {
        // 帮助文档
        await this.client.im.message.create({
          params: {
            receive_id_type: "chat_id",
          },
          data: {
            receive_id: chat_id,
            content: JSON.stringify({
              type: "template",
              data: {
                template_id: "AAqkcUbceDqJv",
                template_version_name: "1.0.5",
              },
            }),
            msg_type: "interactive",
          },
        });
        return;
      } else if (text.includes("/summary-document")) {
        // 总结文档
        const documentEntity = new Document(
          this.client,
          text.split(" ")[1],
          chat_id
        );
        await documentEntity.summary();
        return;
      } else if (text.includes("/send-msg-to-user")) {
        // 给指定人发送消息通知
        const users = mentions.map((item) => item.id.open_id);
        const messageEntity = new Message(this.client);
        await messageEntity.sendMessageToUsers(users, text.split(' ').pop());
        return;
      } else if (text.includes("/send-msg-to-group") && !text.includes("/send-msg-to-group-by-id")) {
        // 通过群名给指定群组发消息
        const [_, chatName, request] = text.split(' ');
        const messageEntity = new Message(this.client);
        await messageEntity.sendMessageToGroup(chatName, request, chat_id);
        return;
      } else if (text.includes("/send-msg-to-group-by-id")) {
        // 通过群id给指定群组发消息
        const [_, chatIds, request] = text.split(' ');
        const messageEntity = new Message(this.client);
        await messageEntity.sendMessageToGroupById(chatIds.split(','), request);
        return;
      } else if (text.includes("/create-group-by-text")) {
        // 自动拉群，使用文案要求发送拉群用意
        const [_, groupName, __, request] = text.split(' ');
        const groupEntity = new Group(this.client);
        await groupEntity.createGroup(groupName, data.sender.sender_id.open_id, mentions.map((item) => item.id.open_id), request, false);
        return;
      } else if (text.includes("/create-group-by-document")) {
        // 自动拉群，使用文档发送拉群用意
        const [_, groupName, __, documentUrl] = text.split(' ');
        const groupEntity = new Group(this.client);
        await groupEntity.createGroup(groupName, data.sender.sender_id.open_id, mentions.map((item) => item.id.open_id), documentUrl, true);
        return;
      } else if (text.includes("/create-task-by-text")) {
        // 使用文案创建任务
        const [_, taskName, taskText, assignee, __, time] = text.split(' ');
        const assigneeLength = assignee.split('@').length - 1;
        const assigneeIds = mentions.map((item) => item.id.open_id).slice(0, assigneeLength);
        const followerIds = mentions.map((item) => item.id.open_id).slice(assigneeLength);
        const taskEntity = new Task(this.client);
        await taskEntity.createTask(taskName, taskText, time, assigneeIds, followerIds, false);
        return;
      } else if (text.includes("/create-task-by-document")) {
        // 使用文档创建任务
        const [_, taskName, taskText, assignee, __, time] = text.split(' ');
        const assigneeLength = assignee.split('@').length - 1;
        const assigneeIds = mentions.map((item) => item.id.open_id).slice(0, assigneeLength);
        const followerIds = mentions.map((item) => item.id.open_id).slice(assigneeLength);
        const taskEntity = new Task(this.client);
        await taskEntity.createTask(taskName, taskText, time, assigneeIds, followerIds, true);
        return;
      }

      if (chat_type === "group") {
        this.groupChat(text, message_id);
      } else {
        this.p2pChat(chat_id);
      }
    } catch (err) { }
  }
}

module.exports = Chat;
