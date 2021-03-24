const mysql = require('mysql');
const colors = require('colors/safe');

module.exports = class MySQL {

    constructor(host, username, password) {
        this.host = host;

        this.username = username;

        this.password = password;


    }

    createConnection() {
        let con = mysql.createConnection({
            host: this.host,
            user: this.username,
            password: this.password,
            database: "amyandcharlie",
            charset: "utf8mb4"
        });

        con.connect(function (err) {
            if (err) {
                console.error(colors.red(`Error while connecting to Database: \n${err.code === "ECONNREFUSED" ? "Connection Refused (DB not running?)" : err}`));
                return;
            }

            console.log(colors.green('Connected to MySQL Server! Thread ID: ' + con.threadId));

        });

        return con;
    }


}