////var crypto = require('crypto');
////console.log(crypto.getHashes());
////
////var crypto = require("crypto");
////var algo = "ecdsa-with-SHA1"
////var rand = crypto.randomBytes(64).toString('hex');;
////var token = crypto.createHmac(algo, rand)
////    .update(Date.now().toString())
////    .digest("hex");
////
////console.log(token);
//var mysql = require('mysql'),
////db_server = "10.0.100.223",//Name of the Server.
////db_server = "182.73.205.244",//Name of the Server.
//    db_server = "localhost",//Name of the Server.
//    db_port = 3306, //Integers please.
////db_collection = "ezeid"; //Name of DB Collection
//    db_collection = "livedb"; //Name of DB Collection
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
//        multipleStatements: true
//    });
//    return pool;
//
//};
//
//var db = getDBContext();
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
        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            password = 'ezeid@123';
        var decipher = crypto.createDecipher(algorithm,password)
        var dec = decipher.update(EncryptPassword,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    }
    catch(ex){
        console.log('FnDecrypterror:' + ex.description);
        var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
        return 'error'
    }
}


