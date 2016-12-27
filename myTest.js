/**
 * Created by Hirecraft on 01-09-2016.
 */

var mysql = require('mysql'),
//db_server = "10.0.100.223",//Name of the Server.
//db_server = "182.73.205.244",//Name of the Server.
    db_server = "www.ezeone.com",//Name of the Server.
    db_port = 3306, //Integers please.
//db_collection = "ezeid"; //Name of DB Collection
    db_collection = "livedb"; //Name of DB Collection



getDBContext = function () {

    console.log("TEST TEST TEST ");


    var pool = mysql.createPool({
        host: db_server,
        port: db_port,
        database: db_collection,
        user: 'root',
        //password: 'ezeid',
        password: '#EzEonE_2015tmi',
        multipleStatements: true,
        dateStrings : true
    });
    return pool;

};

dbCon = getDBContext();


var queryStr = "INSERT INTO test(test) VALUES()";
dbCon.query(queryStr,function(err,result){
    if ((!err) && result ){
        console.log(result);
    }
    else {
        console.error(err);
    }
});

