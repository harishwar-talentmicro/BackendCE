/**
 * Created by Sanjit Nair on 04-11-2014.
 */

//Get the Libraries

var mysql = require('mysql'),
 db_server = "10.0.100.223",//Name of the Server.
 //db_server = "182.73.205.244",//Name of the Server.
 db_port = 3306, //Integers please.
db_collection = "ezeid"; //Name of DB Collection



exports.getDBContext = function () {

    console.log("TEST TEST TEST ");


    var pool = mysql.createPool({
        host: db_server,
        port: db_port,
        database: db_collection,
        user: 'root',
        password: 'ezeid',
        multipleStatements: true
    });
    return pool;

};