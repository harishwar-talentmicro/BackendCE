////var crypto = require('crypto');
////console.log(crypto.getHashes());
////
var crypto = require("crypto");
var bcrypt = require("bcrypt");
////var algo = "ecdsa-with-SHA1"
//var rand = crypto.randomBytes(128).toString('hex');
//console.log(rand);
//console.log('Length : '+ rand.length);
////var token = crypto.createHmac(algo, rand)
////    .update(Date.now().toString())
////    .digest("hex");
////
////console.log(token);
var mysql = require('mysql'),
db_server = "104.199.128.226",//Name of the Server.
////db_server = "182.73.205.244",//Name of the Server.
//    db_server = "localhost",//Name of the Server.
    db_port = 3306 //Integers please.
////db_collection = "ezeid"; //Name of DB Collection
    db_collection = "test_ezeid"; //Name of DB Collection



var getDBContext = function () {

    //console.log("TEST TEST TEST ");


    var pool = mysql.createPool({
        host: db_server,
        port: db_port,
        database: db_collection,
        user: 'root',
        //password: 'ezeid',
        //password: '#EzEonE_2015tmi',
        password: 'Test_Ezeid2015#db',
        multipleStatements: true
    });
    return pool;

};

var db = getDBContext();
//var fs = require('fs');
//var ip = '127.0.0.1';
//var ua = 'user-agent';
//var eze = '@IND1';
//var type = 1;
//
//var tokenGenQueryParams = db.escape(ip) + ',' + db.escape(ua)  + ',' + db.escape(eze) + ',' + db.escape(type);
//var tokenGenQuery = 'CALL pGenerateTokenNew('+tokenGenQueryParams + ')';
//console.log(tokenGenQuery);
//db.query(tokenGenQuery,function(err,results){
//   if(err){
//       console.log(err);
//   }
//    else{
//       console.log(results);
//       fs.writeFileSync('token.json',JSON.stringify(results));
//   }
//});
//
//
//var tokenGenQuery = 'SELECT tid,ezeid FROM tmaster WHERE ezeid='+db.escape('@IND1');
//console.log(tokenGenQuery);
//db.query(tokenGenQuery,function(err,results){
//    if(err){
//        console.log(err);
//    }
//    else{
//        console.log(results);
//        fs.writeFileSync('token1.json',JSON.stringify(results));
//    }
//});

//var ezeInfo = {
//    ezeid : '@CCAFE1',
//    seqNo : 0
//};
//
//var masterQuery = " SELECT IDTypeID, EZEID, EZEIDVerifiedID, FirstName, LastName, CompanyName, JobTitle, AboutCompany,"+
//    " "+
//    "  Redflagstatus, BusinessSize, VisibleModules,"+
//    " SalesURL, ReservationURL, HomeDeliveryURL, ServiceURL, CVURL, dealdesc, dealbanner, dealenable" +
//    " FROM tmaster WHERE EZEID = " + db.escape(ezeInfo.ezeid);
//
//var locationQuery = "SELECT Latitude, Longitude,AddressLine1, AddressLine2, PostalCode, EmailID,Picture,"+
//    "(SELECT CountryName FROM mcountry WHERE mcountry.CountryID = tlocations.CountryID) AS CountryTitle,"+
//    " (SELECT CityName FROM mcity WHERE mcity.CityID = tlocations.CityID) AS CityTitle,"+
//    " (SELECT StateName FROM mstate WHERE mstate.StateID = tlocations.StateID) AS StateTitle,"+
//    " PhoneNumber, MobileNumber, Website,SeqNo,ParkingStatus, ISDPhoneNumber, ISDMobileNumber,Rating FROM tlocations"+
//    " WHERE EZEID = " + db.escape(ezeInfo.ezeid) +" AND SeqNo = " + db.escape(ezeInfo.seqNo);
//var startDate = new Date();
//console.log('StartTime : ' + startDate.toLocaleString());
//
//
//db.query(masterQuery,function(err,masterQueryRes){
//    if(!err){
//        var endMasterTime = new Date();
//        console.log('EndTime : masterQuery : '+ endMasterTime.toLocaleString());
//        console.log('Difference : masterQuery : '+ (endMasterTime.getTime() - startDate.getTime()) /1000);
//    }
//    else{
//        console.log('Error masterQuery');
//        console.log(err);
//    }
//});
//
//db.query(locationQuery,function(err,locationQueryRes){
//    if(!err){
//        var endLocationTime = new Date();
//        console.log('EndTime : locationQuery : '+ endLocationTime.toLocaleString());
//        console.log('Difference : locationQuery : '+ (endLocationTime.getTime() - startDate.getTime()) /1000);
//    }
//    else{
//        console.log('Error locationQuery');
//        console.log(err);
//    }
//});
//




function decrypt(EncryptPassword){
    try {
        //var crypto = require('crypto'),
        var algorithm = 'aes-256-ctr',
            password = 'ezeid@123';
        var crypto = require('crypto');
        var decipher = crypto.createDecipher(algorithm,password);
        var dec = decipher.update(EncryptPassword,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }
    catch(ex){
        console.log(ex);
        //console.log('FnDecrypterror:' + ex.description);
        //var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
        //return 'error';
        throw(ex);
    }
}
//
//
//var mysql = require('mysql'),
////db_server = "10.0.100.223",//Name of the Server.
////db_server = "182.73.205.244",//Name of the Server.
////db_server = "104.199.128.226",//Live test server
//    db_server = "localhost",//Name of the Server.
//    db_port = 3306, //Integers please.
////db_collection = "ezeid"; //Name of DB Collection
//    db_collection = "livedb"; //Name of DB Collection
////    db_collection = "test_ezeid"; //Name of DB Collection
//
//
//
//var getDBContext = function () {
//
//    //console.log("TEST TEST TEST ");
//
//
//    var pool = mysql.createPool({
//        host: db_server,
//        port: db_port,
//        database: db_collection,
//        user: 'root',
//        //password: 'ezeid',
//        password: '#EzEonE_2015tmi',
//        //password: 'Test_Ezeid2015#db',
//        multipleStatements: true
//    });
//    return pool;
//
//};
//
//var db = getDBContext();
var fs = require('fs');

var countQuery = "SELECT COUNT(*) AS total FROM tmaster WHERE 1";
var totalCount = 0;

var userList = [];
var failedList = [];

var updateString = "";
function passUpdateString(password,ezeid){
    var query = "UPDATE tmaster SET password = "+ password + " WHERE ezeid = "+ezeid +";";
    updateString+=query;
}


function decryptAllPasswords(totalCount){
    var selectQuery = "SELECT TID as tid,EZEID as ezeid,Password as password FROM tmaster WHERE 1";
    db.query(selectQuery,function(err,results){
        if(err){
            console.log('Error in select Query');
        }
        else{
            if(results){
                if(results.length > 0){
                    for(var i=0; i<results.length;i++){
                        var user = {
                            ezeid : null,
                            password : null,
                            encpassword : null
                        };
                        //console.log(results[i].password);
                        //console.log(decrypt(results[i].password));
                        user.ezeid = results[i].ezeid;
                        user.encpassword = results[i].password;
                        try{
                            console.log('user : '+i+' started');
                            user.password = (results[i].password) ? decrypt(results[i].password) : null;
                            if(user.password){
                                passUpdateString( bcrypt.hashSync(user.password, 12),user.ezeid);
                            }
                            else{
                                passUpdateString( user.password,user.ezeid);
                            }

                            console.log('user : '+i+' finished');

                        }
                        catch(ex){
                            console.log(ex);
                            failedList.push(user);
                        }

                        userList.push(user);
                    }

                    console.log('UserList : '+userList.length);
                    console.log('FailedList : '+failedList.length);

                    fs.writeFileSync('./test-user-details.json',JSON.stringify(userList));
                    fs.writeFileSync('./test-failed-details.json',JSON.stringify(failedList));
                    fs.writeFileSync('./password-update.sql',updateString);
                    console.log('All Done');
                }
            }
        }
    });

};

db.query(countQuery,function(err,result){
    if(err){
       console.log('Error in count query');
    }
    else{
        if(result){
            if(result.length > 0){
                totalCount = result[0].total;
                console.log('Total Count done');
                decryptAllPasswords(totalCount);
            }
        }
    }
});

//fs.appendFile('message.txt', 'data to append');
//var bcrypt = require('bcrypt');
//var hash = bcrypt.hashSync(password, 12);
//console.log(hash);


/***
 * Data for generating reports
 * @type {{status: boolean, data: {from_date: string, to_date: string, stages: string, probabilities: string, transactions: *[], total_amount: number, total_items: number, funnel: *[]}, message: string, error: null}}
 */
//var data = {
//    status : true,
//    data : {
//        from_date : '2015-07-13', // Same as passed in parameters, if null send me the date of starting record in result
//        to_date : '2015-07-16', // Same as passed in parameters, if null send me the date of ending record in result
//        stages : '32,451,32', // Same as passed in parameters,
//        probabilities : '1,2,3,4', // Same as passed parameters
//        transactions : [
//            {
//                tid : 21,
//                user : 'IND1', // User who created the lead
//                customer : 'Krunal Patel',
//                customer_company : 'Patel Group of Companies',
//                decription : 'I want a quick review of your products and services', // transaction message
//                qty : 12, // Total item qty if not applicable send 0
//                amount : 130000.00, // Total amount for this transaction
//                next_action : 'Call', // Next action label
//                next_action_date : '2015-07-25 17:54'
//            },
//            {
//                tid : 26,
//                user : 'IND1', // User who created the lead
//                customer : 'Sandeep Gantait',
//                customer_company : 'Sandeep Consultancy Pvt. Ltd.',
//                decription : 'I want a quick review of your products and services', // transaction message
//                qty : 43, // Total item qty if not applicable send 0
//                amount : 4300000.00, // Total amount for this transaction
//                next_action : 'Followup', // Next action label
//                next_action_date : '2015-08-12 01:54'
//            }
//        ],
//        total_amount : 42300000.00, // Total amount of all transactions
//        total_items : 43224, // Total number of items i.e. sum of all transactions
//        funnel : [
//            {
//                stage_title : 'New Lead',
//                stage_id : 21,
//                count : 35
//            },
//            {
//                stage_title : 'Hot Lead',
//                stage_id : 22,
//                count : 12
//            },
//            {
//                stage_title : 'Opportunities',
//                stage_id : 23,
//                count : 5
//            },
//            {
//                stage_title : 'Contract',
//                stage_id : 24,
//                count : 3
//            },
//            {
//                stage_title : 'Customers',
//                stage_id : 25,
//                count : 4
//            }
//        ]
//    },
//    message : 'Statistics for Sales are generated successfully',
//    error : null
//};
