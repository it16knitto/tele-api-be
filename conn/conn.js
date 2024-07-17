var mysql = require("mysql");
var db_config = {
  connectTimeout: 10000,
  waitForConnections: 10000,
  connectionLimit: 30,
  host: "192.168.20.27",
  port: "31001",
  user: "app",
  password: "dka5vrSq5eATyGQxK4v@4pP",
  database: "ci_cd",
  multipleStatements: true,
};

function handleDisconnect() {
  connection = mysql.createPool(db_config);
  connection.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }

    connection.release();
  });

  module.exports = connection;
}
handleDisconnect();
