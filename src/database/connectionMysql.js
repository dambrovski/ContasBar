const mysql = require('mysql');

const connection = mysql.createConnection({
  host:'mysql741.umbler.com',
  port:41890,
  user:'contasbar_admin',
  password:'1q2w3e4r',
  database : 'contasbar'
  });

const query = (sql, callBack) => {
  return connection.query(sql, callBack);
  };

module.exports = {
    connection,
    query,
};