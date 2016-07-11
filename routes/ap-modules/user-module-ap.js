/**
 *  @author Gowri Shankar
 *  @since July o6,2015 04:24 PM IST
 *  @title user module
 *  @description Handles functions related to user profile module
 *
 */
"use strict";

var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';



var st = null;
function User_AP(db,stdLib){

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
User_AP.prototype.getUserDetailsAP = function(req,res,next){
    /**
     * @todo FnGetUserDetailsAP
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var EZEID = req.st.alterEzeoneId(req.query.EZEID);
        if (EZEID) {
            console.log("EZEID",EZEID);
            var query = 'Call pgetUserProfileAP('+st.db.escape(EZEID)+')';
            console.log("query",query);
            st.db.query(query, function (err, UserDetailsResult) {
                if (!err) {
                    console.log(UserDetailsResult);
                    if (UserDetailsResult != null) {
                        if (UserDetailsResult[0].length > 0) {
                            UserDetailsResult[0][0].Picture = (UserDetailsResult[0][0].Picture) ?
                                (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserDetailsResult[0][0].Picture) : '';
                            console.log('FnGetUserDetailsAP : pgetUserProfileAP: User details sent successfully');

                            res.send(UserDetailsResult[0]);
                        }
                        else {
                            res.json(null);
                            console.log('FnGetUserDetailsAP : tmaster: No User details found');
                        }
                    }
                    else {
                        res.json(null);
                        console.log('FnGetUserDetailsAP : tmaster: No User details found');
                    }

                }
                else {
                    res.statusCode=500;
                    res.json(null);
                    console.log('FnGetUserDetailsAP : tmaster:' + err);
                }
            });
        }

        else {
            res.statusCode=400;
            res.json(null);
            console.log('FnGetUserDetailsAP :  EZEID is empty');
        }
    }
    catch (ex) {
        console.log('FnGetUserDetails error:' + ex);
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
User_AP.prototype.updateUserProfileAP = function(req,res,next){
    /**
     * @todo FnUpdateUserProfileAP
     */
    var _this = this;
    try {
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

        var EZEID = (req.body.EZEID) ? req.st.alterEzeoneId(req.body.EZEID) : '';
        var EZEIDVerifiedID = (req.body.EZEIDVerifiedID) ? (req.body.EZEIDVerifiedID) : '';
        var CategoryID = req.body.CategoryID;
        if (CategoryID == null || CategoryID == '') {
            CategoryID = 0;
        }
        var Latitude = req.body.Latitude;
        if (Latitude == null || Latitude == '') {
            Latitude = 0.0;
        }
        var Longitude = req.body.Longitude;
        if (Longitude == null || Longitude == '') {
            Longitude = 0.0;
        }

        var Keywords = (req.body.Keywords) ? req.body.Keywords : '';
        var ActiveInactive = (req.body.ActiveInactive) ? req.body.ActiveInactive : 0;
        var Token = req.body.Token;
        var Rating = (req.body.Rating) ? req.body.Rating : 0;
        var Size = (req.body.Size) ? req.body.Size : 0;
        var IDTypeId = (req.body.IDTypeID) ? req.body.IDTypeID : 0;
        var SelectionType = (req.body.SelectionType) ? req.body.SelectionType : 0;
        var headcount = (req.body.headcount) ? req.body.headcount : 0;
        var branch = (req.body.branch) ? req.body.branch : 0;
        var ismnc = (req.body.ismnc) ? req.body.ismnc : 0;
        var RtnMessage = {
            IsSuccessful: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (EZEID != null && Token != null && IDTypeId != null) {
            st.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        if(IDTypeId == 1){
                            var InsertQuery = st.db.escape(CategoryID) + ',' + st.db.escape(Latitude) + ',' + st.db.escape(Longitude)
                                + ',' + st.db.escape(EZEIDVerifiedID) + ',' + st.db.escape(Token) + ',' + st.db.escape(Keywords)
                                + ',' + st.db.escape(EZEID) + ',' + st.db.escape(ActiveInactive) + ',' + st.db.escape(Rating)
                                + ',' + st.db.escape(Size)+ ',' + st.db.escape(IDTypeId) + ',' + st.db.escape(SelectionType)
                                + ',' + st.db.escape(headcount)+ ',' + st.db.escape(branch)+ ',' + st.db.escape(ismnc);
                            // console.log(InsertQuery);
                            st.db.query('CALL pUpdateUserProfileAP(' + InsertQuery + ')', function (err, InsertResult) {
                                if (!err) {
                                    console.log(InsertResult);
                                    if (InsertResult != null) {
                                        RtnMessage.IsSuccessful = true;
                                        res.send(RtnMessage);
                                        console.log('FnUpdateUserProfileAP: User Profile update successfully');

                                    }
                                    else {
                                        //console.log(RtnMessage);
                                        res.send(RtnMessage);
                                        console.log('FnUpdateUserProfileAP:tmaster: User Profile update Failed');
                                    }
                                }
                                else {
                                    res.statusCode=500;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateUserProfileAP:tmaster:' + err);
                                }
                            });
                        }
                        else
                        {
                            var InsertQuery = st.db.escape(CategoryID) + ',' + st.db.escape(Latitude) + ',' + st.db.escape(Longitude)
                                + ',' + st.db.escape(EZEIDVerifiedID) + ',' + st.db.escape(Token) + ',' + st.db.escape(Keywords)
                                + ',' + st.db.escape(EZEID) + ',' + st.db.escape(ActiveInactive) + ',' + st.db.escape(Rating)
                                + ',' + st.db.escape(Size)+ ',' + st.db.escape(IDTypeId) + ',' + st.db.escape(SelectionType)
                                + ',' + st.db.escape(headcount)+ ',' + st.db.escape(branch)+ ',' + st.db.escape(ismnc);
                            st.db.query('CALL pUpdateUserProfileAP(' + InsertQuery + ')', function (err, InsertResult) {
                                if (!err) {
                                    console.log(InsertResult);
                                    if (InsertResult != null) {
                                        RtnMessage.IsSuccessful = true;
                                        res.send(RtnMessage);
                                        console.log('FnUpdateUserProfileAP: User Profile update successfully');

                                    }
                                    else {
                                        //console.log(RtnMessage);
                                        res.send(RtnMessage);
                                        console.log('FnUpdateUserProfileAP:tmaster: User Profile update Failed');
                                    }
                                }
                                else {
                                    res.statusCode=500;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateUserProfileAP:tmaster:' + err);
                                }
                            });
                        }

                    }
                    else
                    {
                        res.statusCode=401;
                        res.send(RtnMessage);
                        console.log('FnUpdateUserProfileAP:tmaster: Invalid Token');
                    }
                }
                else {
                    res.statusCode=500;
                    res.send(RtnMessage);
                    console.log('FnUpdateUserProfileAP:tmaster: error in validating token AP' +err);
                }
            });
        }
        else {
            res.statusCode=400;
            res.send(RtnMessage);
            console.log('FnUpdateUserProfileAP:tmaster: Manditatory field empty');
        }
    }
    catch (ex) {
        console.log('FnUpdateUserProfileAP error:' + ex);
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
User_AP.prototype.saveAPEZEID = function(req,res,next){
    /**
     * @todo FnSaveAPEZEID
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Purpose = parseInt(req.body.Purpose);
        var Type = parseInt(req.body.Type);
        var Preffereduser = req.body.Preffereduser;
        var AreaSize = req.body.AreaSize;
        var AreaUOM = req.body.AreaUOM;
        var Rate = req.body.Rate;
        var Amount = req.body.Amount;
        var SpaceQty = req.body.SpaceQty;
        var SpaceType = req.body.SpaceType;
        var FunishedType = req.body.FunishedType;
        var Description = req.body.Description;
        var Preferences = req.body.Preferences;
        var Rating = req.body.Rating;
        var EZEID = req.st.alterEzeoneId(req.body.EZEID);
        var Latitude = req.body.Latitude;
        if (Latitude == null || Latitude == '') {
            Latitude = 0.0;
        }
        var Longitude = req.body.Longitude;
        if (Longitude == null || Longitude == '') {
            Longitude = 0.0;
        }
        var Status = req.body.Status;
        var Reason = req.body.Reason;
        var AvailableDate = req.body.AvailableDate;
        var Token = req.body.Token;
        var APID = req.body.APID;
        var TID = req.body.TID;
        var NoCarParking =parseInt(req.body.NoCarParking);
        var NoBikeParking =parseInt(req.body.NoBikeParking);
        var OwnerPayment = req.body.OwnerPayment;
        var AgeOfProperty = req.body.AgeOfProperty;
        var NoOfBathrooms = req.body.NoOfBathrooms;
        var Gas = req.body.Gas;
        var Lift = req.body.Lift;
        var Gym = req.body.Gym;
        var SwimmingPool = req.body.SwimmingPool;
        var Security = req.body.Security;
        var UPS = req.body.UPS;
        var tAvailableDate = null;
        if (AvailableDate != null) {
            // datechange = new Date(new Date(TaskDateTime).toUTCString());
            tAvailableDate = new Date(AvailableDate);
            // console.log(TaskDate);
        }
        var RtnMessage = {
            TID: 0
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        st.validateTokenAp(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    //console.log('FnRegistration: Token: ' + TokenNo);
                    var InsertQuery = st.db.escape(Type) + ',' + st.db.escape(Preffereduser) + ',' + st.db.escape(AreaSize) + ',' +st.db.escape(AreaUOM)
                        + ','  + st.db.escape(Rate) + ',' + st.db.escape(Amount) + ',' + st.db.escape(SpaceQty) + ',' + st.db.escape(SpaceType)
                        + ',' + st.db.escape(FunishedType) + ',' + st.db.escape(Description) + ',' + st.db.escape(Preferences) + ',' + st.db.escape(Rating)
                        + ',' +st.db.escape(EZEID) + ',' + st.db.escape(Status) + ',' + st.db.escape(Reason) + ',' + st.db.escape(tAvailableDate) + ',' + st.db.escape(Token)
                        + ',' + st.db.escape(APID) + ',' + st.db.escape(Latitude) + ',' + st.db.escape(Longitude) + ',' + st.db.escape(TID) + ',' + st.db.escape(Purpose)
                        + ',' + st.db.escape(NoCarParking) + ',' + st.db.escape(NoBikeParking) + ',' + st.db.escape(OwnerPayment) + ',' + st.db.escape(AgeOfProperty)
                        + ',' + st.db.escape(NoOfBathrooms) + ',' + st.db.escape(Gas) + ',' + st.db.escape(Lift)
                        + ',' + st.db.escape(Gym) + ',' + st.db.escape(SwimmingPool) + ',' + st.db.escape(Security) + ',' + st.db.escape(UPS);
                    // console.log(InsertQuery);
                    st.db.query('CALL psaveRealEstateData(' + InsertQuery + ')', function (err, InsertResult) {
                        if (!err) {
                            //  console.log(InsertResult);
                            if (InsertResult != null) {
                                if (InsertResult[0].length > 0) {
                                    var insert = InsertResult[0];
                                    RtnMessage.TID = insert[0].TID;
                                    res.send(RtnMessage);
                                    console.log('psaveRealEstateData: psaveRealEstateData: Data saved successfully');
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('psaveRealEstateData:psaveRealEstateData: Data Saving Failed');
                                }
                            }
                            else {
                                console.log(RtnMessage);
                                res.send(RtnMessage);
                                console.log('psaveRealEstateData:psaveRealEstateData: Data Saving Failed');
                            }
                        }
                        else {
                            res.statusCode=500;
                            res.send(RtnMessage);
                            console.log('psaveRealEstateData:psaveRealEstateData:' + err);
                        }
                    });
                }
                else {
                    res.statusCode=401;
                    console.log('psaveRealEstateData: Invalid Token')
                    res.send(RtnMessage);
                }
            }
            else {
                res.statusCode=500;
                console.log('psaveRealEstateData: Error in processing Token' + err);
                res.send(RtnMessage);
            }
        });

        //res.send(RtnMessage);
        //console.log('FnRegistration:tmaster: Manditatory field empty');

    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('psaveRealEstateData error:' + ex);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User_AP.prototype.updateRedFlagAP = function(req,res,next){
    /**
     * @todo FnUpdateRedFlagAP
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var RedFlag = req.body.RedFlag;
        var Token = req.body.Token;
        var FromEZEID = req.st.alterEzeoneId(req.body.FromEZEID);
        var ToEZEID = req.st.alterEzeoneId(req.body.ToEZEID);
        var Message =req.body.Message;


        var RtnMessage = {
            IsUpdated: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (FromEZEID != null && ToEZEID != null && Token != null && RedFlag !=null && Message != null) {
            st.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = st.db.escape(FromEZEID) + ',' + st.db.escape(ToEZEID) + ',' + st.db.escape(Token) + ',' + st.db.escape(RedFlag) + ',' +st.db.escape(Message);
                        st.db.query('CALL pUpdateRedFlagAP(' + query + ')', function (err, UpdateRedflagResult) {
                            if (!err){
                                if (UpdateRedflagResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateRedFlagAP:Red flag history Update successfully');
                                }
                                else {
                                    console.log('FnUpdateRedFlagAP:Red flag history Update failed');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnUpdateRedFlagAP: error in Updating Red FlagAP' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateRedFlagAP: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnUpdateRedFlagAP:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (RedFlag == null) {
                console.log('FnUpdateRedFlagAP: Red flag is empty');
            }
            else if (Token == null) {
                console.log('FnUpdateRedFlagAP: Token is empty');
            }
            else if (FromEZEID == null) {
                console.log('FnUpdateRedFlagAP: From_Ezeid is empty');
            }
            else if (ToEZEID == null) {
                console.log('FnUpdateRedFlagAP: To_Ezeid is empty');
            }
            else if (Message == null) {
                console.log('FnUpdateRedFlagAP: Message is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnUpdateRedFlagAP:error ' + ex);

    }
}

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User_AP.prototype.updateEZEIDAP = function(req,res,next){
    /**
     * @todo FnUpdateEZEIDAP
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var OldEZEID = req.st.alterEzeoneId(req.body.OldEZEID);
        var NewEZEID = req.st.alterEzeoneId(req.body.NewEZEID);
        var RtnMessage = {
            IsChanged: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && OldEZEID != null && OldEZEID != '' && NewEZEID != null && NewEZEID != '') {
            st.validateTokenAp(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var Query = st.db.escape(OldEZEID) + ',' + st.db.escape(NewEZEID) + ',' + st.db.escape(Token);
                        st.db.query('CALL pUpdateEZEIDAP(' + Query + ')', function (err, ChangeEZEIDResult) {
                            if (!err) {

                                if (ChangeEZEIDResult != null) {
                                    if (ChangeEZEIDResult.affectedRows > 0) {
                                        RtnMessage.IsChanged = true;
                                        res.send(RtnMessage);
                                        console.log('FnUpdateEZEIDAP:EZEID CHANGED SUCCESSFULLY');
                                    }
                                    else {
                                        res.send(RtnMessage);
                                        console.log('FnUpdateEZEIDAP:EZEID changed failed');
                                    }
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('FnUpdateEZEIDAP:EZEID changed failed ');
                                }
                            }
                            else {
                                res.send(RtnMessage);
                                console.log('FnUpdateEZEIDAP:Error in getting change EZEID' + err);
                            }
                        });
                    } else {
                        res.send(RtnMessage);
                        console.log('FnUpdateEZEIDAP:Invalid Token');
                    }
                } else {
                    res.send(RtnMessage);
                    console.log('FnUpdateEZEIDAP:Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnUpdateEZEIDAP: Token is empty');
            }
            else if (OldEZEID == null && OldEZEID == ' ') {
                console.log('FnUpdateEZEIDAP: OldEZEID is empty');
            }
            else if (NewEZEID == null && NewEZEID == ' ') {
                console.log('FnUpdateEZEIDAP: NewEZEID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnUpdateEZEIDAP error:' + ex);

    }
};


/**
 * @todo FnSavePaidBannersAp
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for save banners ap
 */
User_AP.prototype.savePaidBannersAp = function(req,res,next){

    var _this = this;

    var token = req.body.token;
    var masterid = req.body.master_id;
    var apID = req.body.ap_id;
    var apUserid = req.body.apuser_id;
    var image = req.body.image;
    var tag = req.body.tag;
    var id = (!isNaN(parseInt(req.body.id))) ?  parseInt(req.body.id) : 0;
    var height = req.body.height;
    var width = req.body.width;
    var randomName,mimetype;


    var uuid = require('node-uuid');
    var request = require('request');

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        if (req.files.image) {

                            var uniqueId = uuid.v4();
                            randomName = uniqueId + '.' + req.files.image.extension;
                            mimetype = req.files.image.mimetype;
                            console.log(randomName);
                        }
                        else {
                            randomName = '';
                            mimetype = '';
                        }

                        //upload to cloud storage
                        //request({
                        //    url: 'https://www.googleapis.com/upload/storage/v1/b/' + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/o',
                        //    method: 'POST',
                        //    headers: {
                        //        'Content-Type': mimetype
                        //    },
                        //    uploadType: 'multipart',
                        //    body: 'hello',
                        //    name: randomName
                        //}, function (error, response, body) {
                        //    if (error) {
                        //        console.log('error..');
                        //        console.log(error);
                        //    } else {
                        //        console.log('response..');
                        //        console.log(response.statusCode);
                        //        console.log(body);
                        //    }
                        //});

                        //var pagePicture = function () {
                        //
                        //    var imageParams = {
                        //        path: req.files.pg_pic.path,
                        //        type: pictureType,
                        //        width: width,
                        //        height: height,
                        //        scale: '',
                        //        crop: ''
                        //    };
                        //    //console.log(imageParams);
                        //    FnCropImage(imageParams, function (err, pictureResult) {
                        //
                        //        if (pictureResult) {
                        //            var params = {
                        //                page_pic: pictureResult
                        //            };
                        //            saveContent(params);
                        //        }
                        //    });
                        //};

                        var queryParams = st.db.escape(masterid) + ',' + st.db.escape(apID) + ',' + st.db.escape(apUserid)
                            + ',' + st.db.escape(randomName) + ',' + st.db.escape(tag) + ',' + st.db.escape(id);

                        var query = 'CALL psavepaidbannersAP(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, insertResult) {
                            if (!err) {
                                if (insertResult.affectedRows > 0) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Banners Saved successfully';
                                    responseMessage.data = {
                                        master_id : req.body.master_id,
                                        ap_id : req.body.ap_id,
                                        apuser_id : req.body.apuser_id,
                                        tag : req.body.tag,
                                        id : (!isNaN(parseInt(req.body.id))) ?  parseInt(req.body.id) : 0
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSavePaidBannersAp: Banners Saved successfully');
                                }
                                else {
                                    responseMessage.message = 'Banners not Saved';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSavePaidBannersAp:Banners not Saved');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSavePaidBannersAp: error in saving Banners:' + err);
                            }

                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSavePaidBannersAp: Invalid token');
                    }
                } else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSavePaidBannersAp:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSavePaidBannersAp ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

//crop image
function FnCropImage(imageParams, callback){
    /**
     * @todo FnCropImage
     */
    var _this = this;

    var fs = require('fs');
    var deleteTempFile = function(){
        fs.unlink('../bin/'+imageParams.path);
        //fs.unlink('../bin/'+imageParams.path1);
    };

    var respMsg = {
        status : false,
        message : 'Invalid image',
        picture : null,
        error : {
            picture : 'Image file is invalid or corrupted'
        }
    };

    var allowedTypes = ['jpg','png'];

    var  targetHeight = (imageParams.height) ? (!isNaN(parseInt(imageParams.height)) ? parseInt(imageParams.height) : 0 ) : 0  ,
        targetWidth = (imageParams.width) ? (!isNaN(parseInt(imageParams.width)) ? parseInt(imageParams.width) : 0 ) : 0  ;


    var scaleHeight = null,scaleWidth = null;

    var cropFlag = (imageParams.crop) ? imageParams.crop : true;
    var scaleFlag = (imageParams.scale) ? imageParams.scale : true;
    //var token = (req.body.Token && req.body.Token !==2 ) ? req.body.Token : '';
    var outputType = (allowedTypes.indexOf(imageParams.type) == -1) ? 'png' : imageParams.type;

    if(!(targetHeight && targetWidth)){
        respMsg.message = 'Invalid target dimensions';
        respMsg.error = {
            required_height : (targetHeight) ? 'Invalid target height' : null,
            required_width : (targetWidth) ? 'Invalid target width' : null
        };
        //res.status(400).json(respMsg);
        callback(null, null);
        deleteTempFile();
        return;
    }

    //if(!token){
    //    respMsg.message = 'Please login to continue';
    //    respMsg.error = {
    //        Token : 'Token is invalid'
    //    };
    //    res.status(401).json(respMsg);
    //    //deleteTempFile();
    //    return;
    //}

    //st.validateToken(token, function (err, Result) {
    //    if (!err) {
    //        if (Result != null) {
    try{
        fs.readFile('../bin/'+ imageParams.path,function(err,data){
            if(!err){
                var bitmap = data;
                var gm = require('gm').subClass({ imageMagick: true });
                gm(bitmap).size(function (err, size) {
                    if (!err) {
                        // Orientation landscape
                        if(size.height < size.width){
                            // scale++
                            if(size.height < targetHeight || size.width < targetWidth){
                                if(targetHeight > targetWidth){
                                    //console.log("executing condition 1 : sOrient: landscape & scale++ & tOrient : potrait");
                                    scaleHeight = targetHeight.toString();
                                    ////
                                    scaleWidth = (size.width * scaleHeight)/ size.height;
                                }
                                else{
                                    //console.log("executing condition 2 : sOrient: landscape & scale++ & tOrient : landscape");
                                    scaleHeight = targetHeight;
                                    scaleWidth = (size.width * scaleHeight) / size.height;
                                }
                            }
                            // scale--
                            else{
                                if(targetHeight > targetWidth){
                                    //console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : landscape");
                                    scaleWidth = targetWidth.toString();
                                    ////
                                    scaleHeight = (scaleWidth * size.height)/ size.width;
                                }
                                else{

                                    //console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : potrait");
                                    scaleHeight = targetHeight.toString();
                                    scaleWidth = (scaleHeight * size.width) / size.height;

                                }
                            }
                        }

                        // Orientation is potrait
                        else{
                            //scale++
                            if(size.height < targetHeight || size.width < targetHeight){
                                if(targetHeight > targetWidth){
                                    console.log('condition false');

                                    scaleHeight = targetHeight.toString();
                                    scaleWidth = (scaleHeight * size.width)/ size.height;
                                }
                                else{
                                    scaleWidth = targetWidth.toString();
                                    scaleHeight = (scaleWidth * size.height) / size.width;
                                }
                            }
                            else{
                                scaleWidth = targetWidth.toString();
                                scaleHeight = (scaleWidth * size.height) / size.width;
                            }
                        }

                        var dimensions = {
                            originalHeight : size.height,
                            originalWidth : size.width,
                            scaleHeight : scaleHeight,
                            scaleWidth : scaleWidth,
                            targetHeight : targetHeight,
                            targetWidth : targetWidth
                        };

                        console.log(dimensions);

                        if(scaleFlag && cropFlag){
                            console.log('Scale and crop');
                            gm(bitmap)
                                .resize(scaleWidth,scaleHeight)
                                .crop(targetWidth,targetHeight,0,0).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                    if(!err){
                                        var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                        var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                        //res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                        callback(null, picUrl);
                                        deleteTempFile();
                                        console.log('FnCropImage:Picture cropped successfully...');
                                    }
                                    else{
                                        //res.status(400).json(respMsg);
                                        callback(null, null);
                                        deleteTempFile();
                                        console.log('FnCropImage:Picture not cropped');
                                    }
                                });
                        }

                        else if(scaleFlag && !cropFlag){
                            gm(bitmap)
                                .resize(scaleWidth,scaleHeight).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                    if(!err){
                                        var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                        var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                        //res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                        callback(null, picUrl);
                                        console.log('FnCropImage:Picture cropped successfully');
                                        deleteTempFile();

                                    }
                                    else{
                                        //res.status(400).json(respMsg);
                                        callback(null, null);
                                        deleteTempFile();
                                        console.log('FnCropImage:Picture not cropped');
                                    }
                                });

                        }

                        else if(!scaleFlag && cropFlag){
                            gm(bitmap)
                                .crop(targetWidth,targetHeight,0,0).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                    if(!err){
                                        var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                        var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                        //res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                        callback(null, picUrl);
                                        console.log('FnCropImage:Picture cropped successfully');
                                    }
                                    else{
                                        //res.status(400).json(respMsg);
                                        callback(null, null);
                                        console.log('FnCropImage:Picture not cropped');
                                    }
                                });
                            deleteTempFile();
                        }
                    }
                    else{
                        console.log('FnCropImage : Invalid image file. Unable to find image size :' +err);
                        callback(null, null);

                    }
                });
            }
            else{
                callback(null, null);
                console.log('FnCropImage : Error in reading file :' +err);

            }
        });

    }
    catch(ex){
        console.log(ex);
        callback(null, null);
        console.log('FnCropImage : '+ ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
    //}
    //        else{
    //            respMsg.message = 'Please login to continue';
    //            respMsg.error = {
    //                Token : 'Token is invalid'
    //            };
    //            res.status(401).json(respMsg);
    //            throw new Error('FnCropImage : '+ 'Invalid Token');
    //        }
    //    }
    //    else{
    //        throw new Error('FnCropImage : '+ 'Error in query execution while validating token');
    //        res.status(400).json(respMsg);
    //    }
    //});

};


module.exports = User_AP;
