const Chat = require("../core/chat");
const lark = require("@larksuiteoapi/node-sdk");

const chatEntity = new Chat();

const eventDispatcher = new lark.EventDispatcher({}).register({
  "im.message.receive_v1": (data) => {
    chatEntity.chat(data);
  },
});

module.exports = (path, isAutoChallenge) => {
  return lark.adaptDefault(path, eventDispatcher, {
    autoChallenge: isAutoChallenge,
  });
};
