// var mysql = require('mysql');

// var con = mysql.createConnection({
//   host: "192.168.10.10",
//   user: "admin",
//   password: "Mulia@admin",
//   database: "admin"
// });

// con.connect(function (err){
//     if(err) throw err;
// });

// module.exports = con;

var mysql = require("mysql2");
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

// function handleDisconnect() {
//   connection = mysql.createConnection(db_config);

//   connection.connect(function(err) {
//     if(err) {
//       console.log('error when connecting to db:', err);
//       setTimeout(handleDisconnect, 2000);
//     }
//   });

//   connection.on('error', function(err) {
//     console.log('db error', err);

//     if(err.code === 'PROTOCOL_CONNECTION_LOST') {
//       console.log(err.code+'sukses');
//       handleDisconnect();
//     } else {
//       console.log(err.code+'gagal');
//       throw err;
//     }
//   });

//   module.exports = connection;
// }

// handleDisconnect();
