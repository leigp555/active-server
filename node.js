var http = require("http");
var fs = require("fs");
var url = require("url");
const { stringify } = require("querystring");
var port = process.argv[2];

if (!port) {
  console.log("请指定端口号好不啦？\nnode server.js 8888 这样不会吗？");
  process.exit(1);
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;

  /******** 从这里开始看，上面不要看 ************/

  console.log("有个傻子发请求过来啦！路径（带查询参数）为：" + pathWithQuery);
  if (path === "/sign" && method === "POST") {
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    const arr = [];
    const userArray = JSON.parse(fs.readFileSync("./date/date.json"));
    request.on("data", (chunk) => {
      arr.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(arr).toString();
      let obj = JSON.parse(string);
      const user = userArray.find((user) => user.name === obj.name);
      if (user === undefined) {
        response.statusCode = 404;
        response.setHeader("Content-Type", "text/json;charset=utf-8");
        response.end(`{"errorCode":4001}`);
      } else {
        if (user.password === obj.password) {
          let session = JSON.parse(fs.readFileSync("./date/x.json"));
          response.statusCode = 200;
          let random = Math.random();
          let note = { [random]: user.id };
          for (let i = 0; i < session.length; i++) {
            if (Object.values(session[i])[0] === user.id) {
              let a = session.indexOf(session[i]);
              console.log(a);
              session.splice(a, 1);
            }
          }
          session.push(note);
          fs.writeFileSync("./date/x.json", JSON.stringify(session));
          response.setHeader("Set-cookie", `session_id=${random}; HttpOnly`);
          response.end("登陆成功");
        } else {
          response.statusCode = 405;
          response.setHeader("Content-Type", "text/json;charset=utf-8");
          response.end(`{"errorCode":4002}`);
        }
      }
    });
  } else if (path === "/register" && method === "POST") {
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    const arr = [];
    let array = [];
    const userArray = JSON.parse(fs.readFileSync("./date/date.json"));
    request.on("data", (chunk) => {
      arr.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(arr).toString();
      let obj = JSON.parse(string);
      userArray.forEach((element) => {
        array.push(element.name);
      });
      if (array.indexOf(obj.name) >= 0) {
        response.end("用户名已存在");
      } else {
        let lastUser = userArray[userArray.length - 1];
        const newUser = {
          id: lastUser ? lastUser.id + 1 : 1,
          name: obj.name,
          password: obj.password,
        };
        userArray.push(newUser);
        fs.writeFileSync("./date/date.json", JSON.stringify(userArray));
        response.write("注册成功");
        response.end();
      }
    });
  } else if (path === "/home.html") {
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    const cookie = request.headers["cookie"];
    let sessionId;
    try {
      sessionId = cookie
        .split(";")
        .find((x) => x.indexOf("session_id=") >= 0)
        .split("=")[1];
    } catch (error) {}
    let session = JSON.parse(fs.readFileSync("./date/x.json").toString());
    let arr = [];
    for (let i = 0; i < session.length; i++) {
      if (Object.keys(session[i])[0] === sessionId) {
        arr.push(session[i]);
      }
    }
    let userId = arr[0][sessionId];
    let htmlHome = fs.readFileSync("./home/home.html").toString();
    if (userId) {
      const userArray = JSON.parse(fs.readFileSync("./date/date.json"));
      const user = userArray.find(
        (item) => item.id.toString() === userId.toString()
      );
      let string;
      if (user) {
        string = htmlHome
          .replace("{{data}}", "已登录")
          .replace("{{user}}", user.name);
      }
      response.write(string);
    } else {
      string = htmlHome.replace("{{data}}", "未登录").replace("{{user}}", "");
      response.write(string);
    }
    response.end();
  } else {
    response.statusCode = 200;
    //路径为 "/"则返回 "/index.html"
    console.log(path);
    let filePath = path === "/" ? "/home/home.html" : path;
    let index = filePath.lastIndexOf(".");
    let suffix = filePath.substring(index);
    const fileType = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".png": "image/png",
      jpg: "image/jpeg",
    };
    response.setHeader(
      "Content-Type",
      `${fileType[suffix] || "text/html"};charset=utf-8`
    );
    let xx = `.${filePath}`;

    //文件名不存在时捕捉错误并且返回404
    let string;
    try {
      string = fs.readFileSync(`.${filePath}`);
    } catch (error) {
      string = "文件不存在";
      request.statusCode = 404;
    }
    response.write(string);
    response.end();
  }
  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log(
  "监听 " +
    port +
    " 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:" +
    port
);
