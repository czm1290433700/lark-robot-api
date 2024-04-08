const lark = require("@larksuiteoapi/node-sdk");

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

      client.im.message.create({
        params: {
          receive_id_type: "chat_id",
        },
        data: {
          receive_id: chatId,
          content: JSON.stringify({
            text: `你好呀布布~你发的消息是"${msg}"`,
          }),
          msg_type: "text",
        },
      });
    } catch (err) {}
  },
});

module.exports = (path, isAutoChallenge) => {
  return lark.adaptDefault(path, eventDispatcher, {
    autoChallenge: isAutoChallenge,
  });
};