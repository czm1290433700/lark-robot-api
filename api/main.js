// vercel部署入口
const larkMain = require("../src/lark_api/main");

module.exports = async (req, res) => {
  const { challenge, type } = req.body;

  if (type === "url_verification") {
    res.status(200).json({ challenge });
  } else {
    res.status(200);
  }

  const larkAdapt = larkMain("/api/main", false);
  larkAdapt(req, res);
};
