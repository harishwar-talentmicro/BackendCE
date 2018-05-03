/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title Location module
 *  @description Handles functions related to secondary locations
 *  1. Secondary Locations list fetching
 *  2. Secondary Location adding (saving)
 *
 */
"use strict";

var CONFIG = require('../../ezeone-config.json');
var DBSecretKey=CONFIG.DB.secretKey;


var Notification = require('./notification/notification-master.js');
var NotificationQueryManager = require('./notification/notification-query.js');
var notification = null;
var notificationQmManager = null;


var st = null;
function Location(db,stdLib){

    if(stdLib){
        st = stdLib;
        notification = new Notification(db,stdLib);
        notificationQmManager = new NotificationQueryManager(db,stdLib);
    }
};


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Location.prototype.getAll = function(req,res,next){
    /**
     * @todo FnGetSecondaryLocation
     */
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    res.statusCode = 200;
                }
                else {
                    console.log('FnGetSecondaryLocation: ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetSecondaryLocation :  token is empty');
        }
    }
    catch (ex) {
        console.log('FnGetSecondaryLocation error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Location.prototype.save = function(req,res,next){
    /**
     * @todo FnAddLocation
     */
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = parseInt(req.body.TID);
        var Token = req.body.Token;
        var LocTitle = req.body.LocTitle;
        var Latitude = parseFloat(req.body.Latitude);
        var Longitude = parseFloat(req.body.Longitude);
        var Altitude = req.body.Altitude;
        var AddressLine1 = req.body.AddressLine1;
        var AddressLine2 = req.body.AddressLine2;
        var CityName = req.body.CityTitle;
        var StateID = parseInt(req.body.StateID);
        var CountryID = parseInt(req.body.CountryID);
        var PostalCode = req.body.PostalCode;
        var PIN = req.body.PIN;
        var PhoneNumber = req.body.PhoneNumber;
        var MobileNumber = req.body.MobileNumber;
        var Picture = req.body.Picture;
        var PictureFileName = req.body.PictureFileName;
        var Website = req.body.Website;
        var ISDPhoneNumber = req.body.ISDPhoneNumber;
        var ISDMobileNumber = req.body.ISDMobileNumber;
        //below line of code is commented for phase 1
        var ParkingStatus = parseInt(req.body.ParkingStatus);
        if (isNaN(ParkingStatus)) {
            ParkingStatus = 0;
        }
        if (PIN == '') {
            PIN = null;
        }
        var TemplateID = (req.body.TemplateID) ? req.body.TemplateID : 0;

        if (!isNaN(TID) && Token != null && CityName != null && !isNaN(StateID) && !isNaN(CountryID) && LocTitle != null && AddressLine1 != null && !isNaN(Longitude) && !isNaN(Latitude)) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        var InsertQuery = st.db.escape(TID) + ',' + st.db.escape(Token) + ',' + st.db.escape(LocTitle) + ',' + st.db.escape(Latitude)
                            + ',' + st.db.escape(Longitude) + ',' + st.db.escape(Altitude) + ',' + st.db.escape(AddressLine1) + ',' + st.db.escape(AddressLine2)
                            + ',' + st.db.escape(CityName) + ',' + st.db.escape(StateID) + ',' + st.db.escape(CountryID) + ',' + st.db.escape(PostalCode)
                            + ',' + st.db.escape(PIN) + ',' + st.db.escape(PhoneNumber) + ',' + st.db.escape(MobileNumber)  + ',' + st.db.escape(Picture)
                            + ',' + st.db.escape(PictureFileName) + ',' + st.db.escape(Website) + ',' +   st.db.escape(ISDPhoneNumber) + ',' + st.db.escape(ISDMobileNumber) + ',' + st.db.escape(ParkingStatus) + ',' + st.db.escape(TemplateID);

                        st.db.query('CALL pInsertLocationData(' + InsertQuery + ')', function (err, InsertResult) {
                            if (!err) {
                                if (InsertResult) {
                                    if (InsertResult.affectedRows > 0) {
                                        //res.send(InsertResult);
                                        // console.log(InsertResult);
                                        console.log('Addlocation: Location added successfully');

                                        var selectqry = 'Select tlocations.TID,MasterID,EZEID,LocTitle,Latitude,Longitude,Altitude,AddressLine1,AddressLine2,StateID,CountryID,PostalCode,PIN,EMailVerifiedID,ifnull(PhoneNumber,"") as PhoneNumber,MobileNumber,ifnull(ISDPhoneNumber,"") as ISDPhoneNumber ,ifnull(ISDMobileNumber,"") as ISDMobileNumber,CreatedDate,LUDate,Website,SeqNo,Picture,PictureFileName,ifnull((Select CityName from mcity where CityID=tlocations.CityID),"") as CityTitle,ifnull(ParkingStatus,0) as ParkingStatus,ifnull(HcalID,0) as TemplateID from tlocations';

                                        if (TID == 0) {
                                            selectqry = selectqry + ' order by tlocations.TID desc limit 1';
                                        }
                                        else {
                                            selectqry = selectqry + ' where tlocations.TID=' + st.db.escape(TID);
                                        }
                                        //  console.log('AddLocaiton: selectqry: ' + selectqry);
                                        st.db.query(selectqry, function (err, SelectResult) {
                                            if (!err) {
                                                //console.log('AddLocaiton: SelectResult: ' + SelectResult);
                                                console.log('Addlocation: Sending location details ' + TID);
                                                res.send(SelectResult);
                                            }
                                            else {
                                                res.statusCode = 500;
                                                res.send([]);
                                                console.log('FnAddLocation: select qry failed' + err);
                                            }
                                        })
                                    }
                                    else {
                                        res.send([]);
                                        console.log('FnAddLocation: No affected rows');
                                    }
                                }
                                else {
                                    res.send([]);
                                    console.log('FnAddLocation: resgistration failed');
                                }
                            }
                            else {
                                res.send([]);
                                res.statusCode = 500;
                                console.log('FnAddLocation: mcity: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnAddLocation: Invalid token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnAddLocation: ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });
        }
        else {
            if (isNaN(TID)) {
                console.log('FnAddLocation: TID is empty');
            }
            else if (Token == null) {
                console.log('FnAddLocation: Token is empty');
            }
            else if (LocTitle == null) {
                console.log('FnAddLocation: LocTitle is empty');
            }
            else if (isNaN(Latitude)) {
                console.log('FnAddLocation: Latitude is empty');
            }
            else if (isNaN(Longitude)) {
                console.log('FnAddLocation: Longitude is empty');
            }
            else if (AddressLine1 == null) {
                console.log('FnAddLocation: AddressLine1 is empty');
            }
            else if (CityName == null) {
                console.log('FnAddLocation: CityName is empty');
            }
            else if (isNaN(StateID)) {
                console.log('FnAddLocation: StateID   is empty');
            }
            else if (isNaN(CountryID)) {
                console.log('FnAddLocation: CountryID   is empty');
            }

            res.statusCode = 400;
            res.send([]);
        }
    }
    catch (ex) {
        console.log('FnAddLocation error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Location.prototype.deleteLocation = function(req,res,next) {
    /**
     * @todo FnDeleteLocation
     */

    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.body.Token;
        var TID = parseInt(req.body.TID);
        var RtnMessage = {
            IsDeleted: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (token && !isNaN(TID)) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var query = 'DELETE FROM tlocations where TID=' + st.db.escape(TID);
                        //  console.log('FnDeleteLocation: DeleteQuery : ' + query);
                        st.db.query(query, function (err, DeleteResult) {
                            if (!err) {
                                if(DeleteResult) {
                                    //console.log('DeleteQuery: ' + DeleteResult);
                                    if (DeleteResult.affectedRows > 0) {
                                        RtnMessage.IsDeleted = true;
                                        res.send(RtnMessage);
                                    }
                                    else {
                                        console.log('FnDeleteLocation: deleting item is not avaiable');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnDeleteLocation: deleting item is not avaiable');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnDeleteLocation: ' + err);
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteLocation: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteLocation: ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (!token) {
                console.log('FnDeleteLocation: token is empty');
            }
            if (isNaN(TID)) {
                console.log('FnDeleteLocation: TID is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnDeleteLocation error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Location.prototype.getAllForEzeid = function(req,res,next){
    /**
     * @todo FnGetLocationListForEzeid
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        //var TID = req.query.TID;
        var RtnMessage = {
            Result: [],
            Message: ''
        };

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        //var Query ='select TID, MasterID,LocTitle, Latitude, Longitude,MobileNumber,ifnull((Select FirstName from tmaster where TID='+st.db.escape(TID)+'),"") as FirstName,ifnull((Select LastName from tmaster where TID='+st.db.escape(TID)+'),"")  as LastName from tlocations where MasterID='+st.db.escape(TID);
                        st.db.query('CALL pGetSubUserLocationList(' + st.db.escape(tokenResult.masterid) + ')', function (err, subUserResult) {
                            if (!err) {
                                if(subUserResult) {
                                    if (subUserResult[0]) {
                                        if (subUserResult[0].length > 0) {
                                            RtnMessage.Result = subUserResult[0];
                                            RtnMessage.Message = 'Location List Send successfully';
                                            console.log('FnGetLocationListForEZEID: Location List Send successfully');
                                            res.send(RtnMessage);
                                        }
                                        else {
                                            RtnMessage.Message = 'No Location List found';
                                            console.log('FnGetLocationListForEZEID:No Location List found1');
                                            res.send(RtnMessage);
                                        }
                                    }
                                    else {

                                        RtnMessage.Message = 'No Location List found';
                                        console.log('FnGetLocationListForEZEID:No Location List found2');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {

                                    RtnMessage.Message = 'No Location List found';
                                    console.log('FnGetLocationListForEZEID:No Location List found3');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                RtnMessage.Message ='error in getting Location List';
                                console.log('FnGetLocationListForEZEID: error in getting Resource details' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        RtnMessage.Message = 'Invalid Token';
                        res.send(RtnMessage);
                        console.log('FnGetLocationListForEZEID: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    RtnMessage.Message = 'Error in validating token';
                    res.send(RtnMessage);
                    console.log('FnGetLocationListForEZEID: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetLocationListForEZEID: Token is empty');
                RtnMessage.Message ='Token is empty';
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnGetLocationListForEZEID error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Location.prototype.getLoactionList = function(req,res,next){
    /**
     * @todo FnGetLocationList
     */

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        if (Token != null) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        st.db.query('CALL pGetLocationList(' + st.db.escape(Token) + ')', function (err, GetLocationResult) {
                            if (!err) {
                                if (GetLocationResult) {
                                    if (GetLocationResult[0]) {

                                        console.log('FnGetLocationList: Location List Send successfully');
                                        res.send(GetLocationResult[0]);
                                    }
                                    else {

                                        console.log('FnGetLocationList:No Location List found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetLocationList:No Location List found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetLocationList: error in getting Resource details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetLocationList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetLocationList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetLocationList: Token is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetLocationList error:' + ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};


/**
 * Get location details of a specific location
 * @param req
 * @param res
 * @param next
 *
 * @method GET
 * @service-param token <string>
 * @service-param seq_no <int> (Location Sequence Number)
 */

Location.prototype.getLocationDetails = function(req,res,next){
    var token = (req.query.token) ? req.query.token : null;
    var locationSequence = (parseInt(req.query.seq_no) !== NaN && parseInt(req.query.seq_no) >= 0) ?
        parseInt(req.query.seq_no) : 0;

    var validationFlag = true;
    var error = {};
    var respMsg = {
        status : false,
        error : null,
        message : 'Please check the errors',
        data : null
    };

    if(!validationFlag){
        respMsg.error = error;
        res.status(400).json(respMsg);
        return;
    }
    else{

        try{
            var queryParams = st.db.escape(token) +','+st.db.escape(locationSequence);
            //console.log(queryParams);
            st.db.query('CALL pGetLocationDetails('+queryParams+')',function(err,locationDetails){
                if(err){

                    console.log('FnGetLocationDetails error:' + err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');

                    respMsg.status = false;
                    respMsg.message = 'Internal Server error';
                    respMsg.error = {
                        server : 'Server Error'
                    };
                    respMsg.data = null;
                    res.status(500).json(respMsg);
                }
                else{
                    if(locationDetails){
                        if(locationDetails[0]){
                            if(locationDetails[0][0]){
                                respMsg.status = true;
                                respMsg.message = 'Location loaded successfully';
                                respMsg.error = null;
                                respMsg.data = locationDetails[0][0];
                            }
                            else{
                                respMsg.message = 'Location details not found';
                                respMsg.error = null;
                                respMsg.data = null;
                            }
                        }
                        else{
                            respMsg.message = 'Location details not found';
                            respMsg.error = null;
                            respMsg.data = null;
                        }

                        res.status(200).json(respMsg);
                    }
                }
            });
        }
        catch(ex){
            console.log('FnGetLocationDetails error:' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');

            respMsg.status = false;
            respMsg.message = 'Internal Server error';
            respMsg.error = {
                server : 'Server Error'
            };
            respMsg.data = null;
            res.status(500).json(respMsg);


        }
    }
};

/**
 * Get the Picture based on location for an ezeid
 * @param req
 * @param res
 * @param next
 *
 * @Method : GET
 * @service-param token <string> (Token of logged in user, Non mandatory only required in case if the user you
 *  you are searching is individual)
 * @service-param ezeone_id* <string> [Mandatory] (Ezeone id with location id eg. HIRECRAFT.L0, HIRECRAFT, HIRECRAFT.L1)
 */
Location.prototype.getLocationPicture = function(req,res,next){
    var token = (req.query.token) ? req.query.token : null;

    var ezeoneId = null;
    var locationSequence = 0;
    var pin = null;
    var validationFlag = true;
    var error = {};
    var respMsg = {
        status : false,
        error : null,
        message : 'Please check the errors',
        data : null
    };
    if(!req.query.ezeone_id){
        error['ezeone_id'] = 'Invalid EZEOne ID';
        validationFlag *= false;
    }

    if(!validationFlag){
        respMsg.error = error;
        res.status(400).json(respMsg);
        return;
    }
    else{

        try{
            var ezeParts = req.query.ezeone_id.split('.');
            ezeoneId = req.st.alterEzeoneId(ezeParts[0]);
            if(ezeParts.length > 1){
                if(ezeParts[1].toString()){

                    if(ezeParts[1][0].toString().toUpperCase() == 'L'){
                        var locNo = parseInt(ezeParts[1].substr(1));
                        locationSequence = (!isNaN(locNo) && locNo >= 0) ? locNo : 0;
                    }
                }

                if(ezeParts.length > 2){
                    if(ezeParts[2]){
                        pin = ezeParts[2];
                    }
                }

            }

            var queryParams = st.db.escape(token) +',' + st.db.escape(ezeoneId) + ',' +
                st.db.escape(locationSequence) +',' + st.db.escape(pin);
            // console.log(queryParams);
            st.db.query('CALL pSearchInfnPic('+queryParams+')',function(err,searchResult){
                if(err){
                    respMsg.status = false;
                    respMsg.message = 'Internal Server error';
                    respMsg.error = {
                        server : 'Server Error'
                    };
                    respMsg.data = null;
                    res.status(500).json(respMsg);
                }
                else{
                    if(searchResult){
                        if(searchResult[0]){
                            if(searchResult[0][0]){
                                if(searchResult[0][0].Picture){
                                    respMsg.status = true;
                                    respMsg.message = 'EZEOne ID Image loaded successfully';
                                    respMsg.error = null;
                                    respMsg.data = {
                                        image : searchResult[0][0].Picture,
                                        image_name : searchResult[0][0].PictureFileName
                                    };
                                    res.status(200).json(respMsg);
                                }
                                else{
                                    respMsg.status = false;
                                    respMsg.message = 'EZEOne ID Image not found';
                                    respMsg.error = null;
                                    respMsg.data = {
                                        image : null,
                                        image_name : null
                                    };
                                    res.status(200).json(respMsg);
                                }
                            }
                            else{
                                respMsg.status = false;
                                respMsg.message = 'EZEOne ID Image not found';
                                respMsg.error = null;
                                respMsg.data = {
                                    image : null,
                                    image_name : null
                                };
                                res.status(200).json(respMsg);
                            }

                        }
                        else{
                            respMsg.status = false;
                            respMsg.message = 'EZEOne ID Image not found';
                            respMsg.error = null;
                            respMsg.data = {
                                image : null,
                                image_name : null
                            };
                            res.status(200).json(respMsg);
                        }

                    }
                    else{
                        respMsg.status = false;
                        respMsg.message = 'EZEOne ID Image not found';
                        respMsg.error = null;
                        respMsg.data = {
                            image : null,
                            image_name : null
                        };
                        res.status(200).json(respMsg);
                    }
                }
            });
        }

        catch(ex){
            console.log('FnGetLocationPicture error:' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');

            respMsg.status = false;
            respMsg.message = 'Internal Server error';
            respMsg.error = {
                server : 'Server Error'
            };
            respMsg.data = null;
            res.status(500).json(respMsg);
        }

    }


};

/**
 * @todo FnShareLocation
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for get share location
 */
Location.prototype.shareLocation = function(req,res,next){

    var fs = require("fs");

    var token = req.body.token;
    var ezeone_id = req.st.alterEzeoneId(req.body.ezeone_id); // to ezeone_id
    var locationTitle = (req.body.lm) ? req.body.lm : ''; // landmark
    var latitude = req.body.lat;
    var longitude = req.body.long;
    var masterid='';
    var receiverId;
    var senderTitle;
    var groupTitle;
    var groupID;
    var messageText;
    var messageType;
    var operationType;
    var iphoneId;
    var iphoneID;
    var messageId;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!ezeone_id){
        error['ezeone_id'] = 'Invalid ezeone_id';
        validateStatus *= false;
    }
    if(!latitude){
        error['latitude'] = 'Invalid latitude';
        validateStatus *= false;
    }
    if(!longitude){
        error['longitude'] = 'Invalid longitude';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token) + ','  + st.db.escape(locationTitle)+ ','  + st.db.escape(latitude)
                            + ','  + st.db.escape(longitude)+ ','  + st.db.escape(ezeone_id) + ','  + st.db.escape(DBSecretKey);
                        var query = 'CALL psharelocation(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, locationResult) {
                            //console.log(locationResult[0]);
                            if (!err) {
                                if (locationResult) {
                                    if(locationResult[0]) {
                                        if (locationResult[0][0]) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'location send successfully';
                                            responseMessage.data = locationResult[0][0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnShareLocation: location send successfully');

                                            //send notification
                                            var queryParameters = 'select EZEID,IPhoneDeviceID as iphoneID from tmaster where EZEID=' + st.db.escape(ezeone_id);
                                            //console.log(queryParameters);
                                            st.db.query(queryParameters, function (err, iosResult) {
                                                if (iosResult) {
                                                    if (iosResult[0]) {
                                                        iphoneID = iosResult[0].iphoneID;
                                                    }
                                                    else {
                                                        iphoneID = '';
                                                    }
                                                    //console.log(iphoneID);
                                                    var queryParams = 'select tid,GroupName from tmgroups where GroupName=' + st.db.escape(ezeone_id);
                                                    //console.log(queryParams);
                                                    st.db.query(queryParams, function (err, userDetails) {
                                                        if (userDetails) {
                                                            if (userDetails[0]) {
                                                                //console.log(userDetails);
                                                                receiverId = userDetails[0].tid;
                                                                senderTitle = locationResult[0][0].ezeid;
                                                                groupTitle = userDetails[0].GroupName;
                                                                groupID = userDetails[0].tid;
                                                                if (locationTitle) {
                                                                    messageText = 'click here to navigate and reach ' + senderTitle.slice(1) + ' in ' + locationTitle;
                                                                }
                                                                else {
                                                                    messageText = 'click here to navigate and reach ' + senderTitle.slice(1);
                                                                }
                                                                messageType = 9;
                                                                operationType = 0;
                                                                iphoneId = iphoneID;
                                                                messageId = 0;
                                                                masterid = '';
                                                                // console.log(receiverId, senderTitle, groupTitle, groupID, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude);
                                                                notification.publish(receiverId, senderTitle, groupTitle, groupID, messageText, messageType, operationType, iphoneId, messageId, masterid, latitude, longitude);

                                                            }
                                                            else {
                                                                console.log('FnShareLocation:userDetails not loaded');
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnShareLocation:userDetails not loaded');
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log('FnShareLocation:iphoneID not loaded');
                                                }
                                            });
                                        }
                                        else {
                                            responseMessage.message = 'location not send';
                                            res.status(200).json(responseMessage);
                                            console.log('FnShareLocation:location not send');
                                        }
                                    }
                                    else
                                    {
                                        responseMessage.message = 'location not send';
                                        res.status(200).json(responseMessage);
                                        console.log('FnShareLocation:location not send');
                                    }
                                }
                                else {
                                    responseMessage.message = 'location not send';
                                    res.status(200).json(responseMessage);
                                    console.log('FnShareLocation:location not send');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnShareLocation: error in getting location:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnShareLocation: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnShareLocation:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnShareLocation ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnValidateEZEOne
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for validate group name
 */
Location.prototype.validateEZEOne = function(req,res,next){

    var name = req.st.alterEzeoneId(req.query.ezeone_id);
    var ezeid;
    var pin = null ;

    var ezeidArray = name.split('.');

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: [],
        isBussinessUser : 0
    };

    var validateStatus = true;
    var error = {};

    if(!name){
        error['name'] = 'Invalid name';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            if (ezeidArray.length > 1) {
                ezeid = ezeidArray[0];
                pin = parseInt(ezeidArray[1]) ? parseInt(ezeidArray[1]) : ezeidArray[1];
            }
            else
            {
                ezeid = name;
                pin = null;
            }
            var queryParams = st.db.escape(ezeid) + ',' + st.db.escape(pin) + ',' + st.db.escape(DBSecretKey);
            var query = 'CALL pvalidateEZEOne(' + queryParams + ')';
            //console.log(query);
            st.db.query(query, function (err, EZEOneResult) {
                //console.log(EZEOneResult);
                if (!err) {
                    if (EZEOneResult) {
                        if (EZEOneResult[0]) {
                            if (EZEOneResult[0][0]) {
                                if (EZEOneResult[0][0].masterid != 0) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'EZEoneID is available';
                                    responseMessage.data = EZEOneResult[0][0].masterid;
                                    responseMessage.isBussinessUser = EZEOneResult[0][0].isBussinessUser;
                                    res.status(200).json(responseMessage);
                                    console.log('FnValidateEZEOne: EZEoneID is available');
                                }
                                else {
                                    responseMessage.message = 'EZEoneID is not available';
                                    res.status(200).json(responseMessage);
                                    console.log('FnValidateEZEOne:EZEoneID is not available');
                                }
                            }
                            else {
                                responseMessage.message = 'EZEoneID is not available';
                                res.status(200).json(responseMessage);
                                console.log('FnValidateEZEOne:EZEoneID is not available');
                            }
                        }
                        else {
                            responseMessage.message = 'EZEoneID is not available';
                            res.status(200).json(responseMessage);
                            console.log('FnValidateEZEOne:EZEoneID is not available');
                        }
                    }
                    else {
                        responseMessage.message = 'EZEoneID is not available';
                        res.status(200).json(responseMessage);
                        console.log('FnValidateEZEOne:EZEoneID is not available');
                    }
                }
                else {
                    responseMessage.message = 'An error occured ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnValidateEZEOne: error in validating EZEoneID :' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnValidateEZEOne ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetLocationsofezeid
 * @param req
 * @param res
 * @param next
 * @method GET
 * @service-param token <string>
 * @service-param ezeid <varchar>
 */

Location.prototype.getLocationsofezeid = function(req,res,next){

    var ezeid = req.st.alterEzeoneId(req.query.ezeone_id);

    var validationFlag = true;
    var error = {};
    var respMsg = {
        status : false,
        error : null,
        message : 'Please check the errors',
        data : null
    };

    if(!ezeid){
        error['ezeid'] = 'Invalid ezeid';
        validationFlag *= false;
    }


    if(!validationFlag){
        respMsg.error = error;
        respMsg.message = 'Please check the errors';
        res.status(400).json(respMsg);
    }
    else{
        try{
            var queryParams = st.db.escape(ezeid);
            //console.log(queryParams);
            st.db.query('CALL pGetLocationsofezeid(' + queryParams + ')', function (err, getResult) {
                if (err) {
                    console.log('FnGetLocationsofezeid error:' + err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                    respMsg.status = false;
                    respMsg.message = 'Internal Server error';
                    respMsg.error = {
                        server: 'Server Error'
                    };
                    respMsg.data = null;
                    res.status(500).json(respMsg);
                }
                else {
                    if (getResult) {
                        if (getResult[0]) {
                            if (getResult[0].length > 0) {
                                respMsg.status = true;
                                respMsg.message = 'Locations loaded successfully';
                                respMsg.error = null;
                                respMsg.data = getResult[0];
                            }
                            else {
                                respMsg.message = 'Locations not found';
                                respMsg.error = null;
                                respMsg.data = null;
                            }
                        }
                        else {
                            respMsg.message = 'Locations not found';
                            respMsg.error = null;
                            respMsg.data = null;
                        }
                    }
                    else {
                        respMsg.message = 'Locations not found';
                        respMsg.error = null;
                        respMsg.data = null;
                    }
                    res.status(200).json(respMsg);
                }
            });
        }
        catch(ex){
            console.log('FnGetLocationsofezeid error:' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');

            respMsg.status = false;
            respMsg.message = 'Internal Server error';
            respMsg.error = {
                server : 'Server Error'
            };
            respMsg.data = null;
            res.status(500).json(respMsg);


        }
    }
};


/**
 * @todo FnSaveLocationforEmployers
 * Method : post
 * @param req
 * @param res
 * @param next
 * @description api code for get save location
 */
Location.prototype.saveLocationforEmployers = function(req,res,next){

    var fs = require("fs");

    var token = req.body.token;
    var masterId = req.body.master_id;
    var locId = req.body.loc_id;


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(masterId) + ','  + st.db.escape(locId);

                        var query = 'CALL pSaveLocEmployers(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'location Saved successfully';
                                    responseMessage.data = {
                                        master_id : req.body.master_id,
                                        loc_id : req.body.loc_id
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveLocationforEmployers: location Saved  successfully');
                                }
                                else {
                                    responseMessage.message = 'location not Saved';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveLocationforEmployers:location not Saved');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSaveLocationforEmployers: error in saving location:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveLocationforEmployers: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveLocationforEmployers:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnSaveLocationforEmployers ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};
module.exports = Location;
