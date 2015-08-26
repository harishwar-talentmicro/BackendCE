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

var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';

function alterEzeoneId(ezeoneId){
    var alteredEzeoneId = '';
    if(ezeoneId){
        if(ezeoneId.toString().substr(0,1) == '@'){
            alteredEzeoneId = ezeoneId;
        }
        else{
            alteredEzeoneId = '@' + ezeoneId.toString();
        }
    }
    return alteredEzeoneId;
}

var st = null;

function Location(db,stdLib){

    if(stdLib){
        st = stdLib;
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
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;

        if (Token != null && Token != '') {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        st.db.query('CALL pGetSecondaryLocationDetails(' + st.db.escape(Token) + ')', function (err, SecondaryResult) {
                            if (!err) {
                                // console.log(UserDetailsResult);
                                if (SecondaryResult[0]) {
                                    if (SecondaryResult[0].length > 0) {
                                        // console.log('FnGetSecondaryLocation: Token: ' + Token);
                                        console.log('FnGetSecondaryLocation : tmaster: Secondary User details sent successfully');
                                        res.send(SecondaryResult[0]);
                                    }
                                    else {
                                        res.json(null);
                                        console.log('FnGetSecondaryLocation : tmaster: No secondary location available');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetSecondaryLocation : tmaster: No secondary location found');
                                }

                            }
                            else {
                                res.json(null);
                                res.statusCode = 500;
                                console.log('FnGetSecondaryLocation : tmaster:' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnGetSecondaryLocation: Invalid token');
                        res.statusCode = 401;
                        res.json(null);
                    }
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
        console.log('FnGetSecondaryLocation error:' + ex.description);
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
    var _this = this;
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
        if (ParkingStatus.toString() == 'NaN') {
            ParkingStatus = 0;
        }
        if (PIN == '') {
            PIN = null;
        }
        var TemplateID = (req.body.TemplateID) ? req.body.TemplateID : 0;

        if (TID.toString() != 'NaN' && Token != null && CityName != null && StateID.toString() != 'NaN' && CountryID.toString() != 'NaN' && LocTitle != null && AddressLine1 != null && Longitude.toString() != 'NaN' && Latitude.toString() != 'NaN') {
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
            if (TID.toString() == 'NaN') {
                console.log('FnAddLocation: TID is empty');
            }
            else if (Token == null) {
                console.log('FnAddLocation: Token is empty');
            }
            else if (LocTitle == null) {
                console.log('FnAddLocation: LocTitle is empty');
            }
            else if (Latitude.toString() == 'NaN') {
                console.log('FnAddLocation: Latitude is empty');
            }
            else if (Longitude.toString() == 'NaN') {
                console.log('FnAddLocation: Longitude is empty');
            }
            else if (AddressLine1 == null) {
                console.log('FnAddLocation: AddressLine1 is empty');
            }
            else if (CityName == null) {
                console.log('FnAddLocation: CityName is empty');
            }
            else if (StateID.toString() == 'NaN') {
                console.log('FnAddLocation: StateID   is empty');
            }
            else if (CountryID.toString() == 'NaN') {
                console.log('FnAddLocation: CountryID   is empty');
            }

            res.statusCode = 400;
            res.send([]);
        }
    }
    catch (ex) {
        console.log('FnAddLocation error:' + ex.description);
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
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.body.Token;
        var TID = parseInt(req.body.TID);
        var RtnMessage = {
            IsDeleted: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (token != null && token != '' && TID.toString() != 'NaN') {
            st.validateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = 'DELETE FROM tlocations where TID=' + st.db.escape(TID);
                        //  console.log('FnDeleteLocation: DeleteQuery : ' + query);
                        st.db.query(query, function (err, DeleteResult) {
                            if (!err) {
                                console.log('DeleteQuery: ' + DeleteResult);
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
            if (token == null || token == '') {
                console.log('FnDeleteLocation: token is empty');
            }
            if (TID.toString() == 'NaN') {
                console.log('FnDeleteLocation: TID is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnDeleteLocation error:' + ex.description);
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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        //var TID = req.query.TID;
        var RtnMessage = {
            Result: [],
            Message: ''
        };
        console.log(req.query.Token);
        console.log(Token);
        if (Token) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        console.log(Result);
                        //var Query ='select TID, MasterID,LocTitle, Latitude, Longitude,MobileNumber,ifnull((Select FirstName from tmaster where TID='+st.db.escape(TID)+'),"") as FirstName,ifnull((Select LastName from tmaster where TID='+st.db.escape(TID)+'),"")  as LastName from tlocations where MasterID='+st.db.escape(TID);
                        st.db.query('CALL pGetSubUserLocationList(' + st.db.escape(Result.masterid) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult[0]) {
                                    if (GetResult[0].length > 0) {
                                        RtnMessage.Result = GetResult[0];
                                        RtnMessage.Message ='Location List Send successfully';
                                        console.log('FnGetLocationListForEZEID: Location List Send successfully');
                                        res.send(RtnMessage);
                                    }
                                    else {
                                        RtnMessage.Message ='No Location List found';
                                        console.log('FnGetLocationListForEZEID:No Location List found');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {

                                    RtnMessage.Message ='No Location List found';
                                    console.log('FnGetLocationListForEZEID:No Location List found');
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
        console.log('FnGetLocationListForEZEID error:' + ex.description);
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
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        if (Token != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        st.db.query('CALL pGetLocationList(' + st.db.escape(Token) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetLocationList: Location List Send successfully');
                                        res.send(GetResult[0]);
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
        console.log('FnGetLocationList error:' + ex.description);
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
            var queryParams = st.db.escape(token) +','
                st.db.escape(locationSequence);
            console.log(queryParams);
            st.db.query('CALL pGetLocationDetails('+queryParams+')',function(err,result){
                if(err){

                    console.log('FnGetLocationDetails error:' + ex.description);
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
                    if(result){
                        respMsg.status = true;
                        respMsg.message = 'Location loaded successfully';
                        respMsg.error = null;
                        respMsg.data = result[0][0];
                    }
                }
            });
        }
        catch(ex){
            console.log('FnGetLocationDetails error:' + ex.description);
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

    var ezeoneId = null, locationSequence = 0, pin = null, validationFlag = true;
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
            ezeoneId = alterEzeoneId(ezeParts[0]);
            if(ezeParts.length > 1){
                if(ezeParts[1].toString()){

                    if(ezeParts[1][0].toString().toUpperCase() == 'L'){
                        var locNo = parseInt(ezeParts[1].substr(1));
                        locationSequence = (locNo !== NaN && locNo >= 0) ? locNo : 0;
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
            console.log(queryParams);
            st.db.query('CALL pSearchInfnPic('+queryParams+')',function(err,result){
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
                    if(result){
                        if(result[0]){
                            if(result[0][0]){
                                if(result[0][0].Picture){
                                    respMsg.status = true;
                                    respMsg.message = 'EZEOne ID Image loaded successfully';
                                    respMsg.error = null;
                                    respMsg.data = {
                                        image : result[0][0].Picture,
                                        image_name : result[0][0].PictureFileName
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
            console.log('FnGetLocationPicture error:' + ex.description);
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
module.exports = Location;