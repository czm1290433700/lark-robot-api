const larkMain = require("./lark_api/main");
const http = require("http");

const server = http.createServer();

server.on("request", (req, res) => {
  const larkAdapt = larkMain("/", true);
  larkAdapt(req, res);
});
server.listen(3000);
