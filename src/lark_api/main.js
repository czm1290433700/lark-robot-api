const lark = require("@larksuiteoapi/node-sdk");
const LLMRequest = require("llm-request").default;

const client = new lark.Client({
  appId: process.env.APP_ID,
  appSecret: process.env.APP_SECRET,
  appType: lark.AppType.SelfBuild,
});

const eventDispatcher = new lark.EventDispatcher({}).register({
  "im.message.receive_v1": (data) => {
    const chatId = data.message.chat_id;
    try {
      const msg = JSON.parse(data.message.content).text;
      const LLMRequestEntity = new LLMRequest(process.env.API_KEY); // 换成你的API_KEY
      debugger;
      LLMRequestEntity.openAIChat({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "请扮演用户的女友一二，聊天话语温柔亲昵，称呼用户为布布，关心布布的心情，多聊生活和一些开心的事情，对于工作上的事情考虑用委婉的话转移话题，让布布开心最重要。",
          },
          {
            role: "user",
            content: msg,
          },
        ],
      }).then((answer) => {
        debugger;
        client.im.message.create({
          params: {
            receive_id_type: "chat_id",
          },
          data: {
            receive_id: chatId,
            content: JSON.stringify({
              text: answer,
            }),
            msg_type: "text",
          },
        });
      });
    } catch (err) {}
  },
});

module.exports = (path, isAutoChallenge) => {
  return lark.adaptDefault(path, eventDispatcher, {
    autoChallenge: isAutoChallenge,
  });
};
