/**
 * Created by Sanjit Nair on 04-11-2014.
 */

//Get the Libraries

var mysql = require('mysql'),
 //db_server = "10.0.100.223",//Name of the Server.
 //db_server = "182.73.205.244",//Name of the Server.
 // db_server = "104.199.128.226",//Name of the Server.
  // db_server = "182.74.145.170",//Name of the Server port= 4406 , p=ezeone.
   db_server = "104.196.9.194",
db_port = 3306, //Integers please db_port = 3306 .
    //db_collection = "ezeid"; //Name of DB Collection
    db_collection = "livedb"; //Name of DB Collection


exports.getDBContext = function () {

    console.log("TEST TEST TEST ");

    var pool = mysql.createPool({
        host: db_server,
        port: db_port,
        database: db_collection,
        user: 'whatmate',
        //password: 'ezeid',
        //commented below to access database from local vedha system
        // password: 'StesTEzeOneID*2016#S',
        password: 'mateonet@lentEZe2017',
        multipleStatements: true,
        waitForConnection : true,
        queueLimit : 0,
        dateStrings : true,
        charset : "utf8mb4"
    });
    return pool;

};