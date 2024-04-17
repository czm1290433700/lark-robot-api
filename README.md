# lark-robot-api

基于 openAI API 的飞书机器人一二熊,底层基于兼容 node 和 web 端的请求库 llm-request。

## 启动 & 使用

本 API 依赖三个环境变量 API_ID API_SECRET 以及 API_KEY，前两个可以在创建的飞书机器人中拿到，属于密钥属性，API_KEY 填写 openAI_key 即可。

API 启动后，需要完成必要 API 权限的开启，可以根据控制台提示缺啥开啥，然后与飞书机器人绑定即可。API 已配置 vercel，可以使用 build 命令完成快速部署。

本地测试阶段考虑使用 ngrok 反向代理工具进行内网穿透测试。

## 能力

一二熊机器人支持以下功能：

-   正常交流沟通，它会称你为布布，语气温柔，在意你的个人感受，也可以在群聊中使用
    ![image](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae7d7fa0f5f1479887be8338dd1e1d62~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=857&h=720&s=1854916&e=png&b=fcfcfc)
-   输出帮助文档
    ![image](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/713c73924a014b6991d34c6dbdc2f418~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=916&h=720&s=1982561&e=png&b=fcfbfb)
    ![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b61938668ff942cc926d139f8fbfaa66~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=720&h=771&s=1668901&e=png&b=fefdfd)
-   文档总结，可以输入任何飞书链接（给机器人开权限），机器人能对文档完成总结
    ![image](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/460752bd67d045e994c1b3dfdac4f8a1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=784&h=720&s=1696976&e=png&b=fcfcfc)
-   指定人发送消息
    ![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1de7cf6c4054469188d9ec2413fcd5e5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1280&h=295&s=1135005&e=png&b=fbfbfb)
    ![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d9677172bb1641d3bf2739426ff5f7ac~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=720&h=745&s=1612626&e=png&b=fefefe)
-   指定群发送消息，会完成自动查重
    ![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1cbfb2a184eb475d8f8e324c88921177~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=786&h=720&s=1701308&e=png&b=fcfbfb)
    ![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ea986bd06a024132b27df301e0623353~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1280&h=393&s=1512035&e=png&b=fbfbfb)
-   支持自动拉群并总结用意
    ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/277f46611d8c4b79a55d50b6ea500016~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1247&h=720&s=2698670&e=png&b=fdfdfd)
    ![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/adb8463e61294e66aefc0a707d5f3d18~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1280&h=553&s=2127585&e=png&b=fcfcfc)
-   支持创建任务并生成任务摘要
    ![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/479073d3871345a4ab5aaf67db35fe91~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1280&h=286&s=1100383&e=png&b=fbfbfb)
    ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/846b42ec16c44361aa10464626ed512a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=720&h=1142&s=2471933&e=png&b=ffffff)
