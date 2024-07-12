var express = require("express"),
  app = express(),
  port = process.env.PORT || 8016,
  bodyParser = require("body-parser");
const server = require("http").createServer(app);
var cors = require("cors");

app.use(cors());
app.use("/images", express.static(__dirname + "/images"));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

var routes = require("./routes/routes");
routes(app);

express.timeout = 10000;
server.listen(port, () => console.log("Server:" + port));
