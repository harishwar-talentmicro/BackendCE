var DbHelper = require('./../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();

var User = require('./user-module.js');
var userModule = new User(db);
exports.FnRegistration = userModule.register;
exports.FnLogin = userModule.login;
exports.FnLogout = userModule.logout;
exports.FnGetCountry = userModule.getCountry;
exports.FnGetState = userModule.getState;
exports.FnGetCity = userModule.getCity;
exports.FnGetUserDetails = userModule.getUserDetails;
exports.FnCheckEzeid = userModule.checkEzeid;
exports.FnChangePassword = userModule.changePassword;
exports.FnForgetPassword = userModule.forgetPassword;
exports.FnDecryptPassword = userModule.decryptPassword;
exports.FnGetCompanyProfile = userModule.getCompanyProfile;
exports.FnSaveCompanyProfile = userModule.saveCompanyProfile;
exports.FnGetWebLink = userModule.getWebLink;
exports.FnSaveWebLink = userModule.saveWebLink;
exports.FnDeleteWebLink = userModule.deleteWebLink;
exports.FnEZEIDPrimaryDetails = userModule.getEzeidDetails;
exports.FnGetCVInfo = userModule.getResume;
exports.FnSaveCVInfo = userModule.saveResume;
exports.FnPGetSkills = userModule.getSkills;
exports.FnGetDocPin = userModule.getDocPin;
exports.FnGetDoc = userModule.getDoc;
exports.FnUpdateDocPin = userModule.updateDocPin;
exports.FnSaveDoc = userModule.saveDoc;
exports.FnGetFunctions = userModule.getFunctions;

var Audit = require('./audit-module.js');
var auditModule = new Audit(db);
exports.FnGetAccessHistory = auditModule.getAccessHistory;
exports.FnSaveWhiteBlackList = auditModule.saveList;
exports.FnGetWhiteBlackList = auditModule.getList;
exports.FnDeleteWhiteBlackList = auditModule.deleteList;
exports.FnGetWhiteListCount = auditModule.getListCount;
exports.FnGetRelationType = auditModule.getRelation;
exports.FnSaveMailTemplate = auditModule.saveMailTemplate;
exports.FnGetTemplateList = auditModule.getMailTemplate;
exports.FnGetTemplateDetails = auditModule.getTemplateDetails;
exports.FnSendBulkMailer = auditModule.sendBulkMailer;

var Location = require('./location-module.js');
var locationModule = new Location(db);
exports.FnGetSecondaryLocation = locationModule.getAll;
exports.FnAddLocation = locationModule.save;
exports.FnDeleteLocation = locationModule.deleteLocation;
exports.FnGetLocationListForEZEID = locationModule.getAllForEzeid;

var BusinessManager = require('./business-module.js');
var businessManager = new BusinessManager(db);
exports.FnGetTransaction = businessManager.getTransactions;
exports.FnSaveTransaction = businessManager.saveTransaction;
exports.FnUpdateTransaction = businessManager.updateTransaction;
exports.FnGetTransactionItems = businessManager.getTransactionItems;
exports.FnSaveTransactionItems = businessManager.saveTransactionItems;
exports.FnGetOutboxMessages = businessManager.getOutboxTransactions;
exports.FnGetTransAutoComplete = businessManager.getTransAutoComplete;
exports.FnGetItemListForEZEID = businessManager.getItemListForEZEID;
exports.FnDeleteTransaction = businessManager.deleteTransaction;
exports.FnItemList = businessManager.itemList;
exports.FnItemDetails = businessManager.itemDetails;

var Configuration = require('./configuration-module.js');
var configurationModule = new Configuration(db);
exports.FnSaveConfig = configurationModule.save;
exports.FnGetConfig = configurationModule.get;
exports.FnGetCategory = configurationModule.getBusinessCategories;
exports.FnGetStatusType = configurationModule.getStatusTypes;
exports.FnStatusType = configurationModule.StatusTypes;
exports.FnSaveStatusType = configurationModule.saveStatusType;
exports.FnGetActionType = configurationModule.getActionTypes;
exports.FnSaveActionType = configurationModule.saveActionType;
exports.FnGetItemList = configurationModule.getItems;
exports.FnSaveItem = configurationModule.saveItems;
exports.FnGetFolderList = configurationModule.getFolders;
exports.FnSaveFolderRules = configurationModule.saveFolder;
exports.FnGetSubUserList = configurationModule.getSubusers;
exports.FnCreateSubUser = configurationModule.createSubuser;
exports.FnGetReservationResource = configurationModule.getReservationResources;
exports.FnSaveReservationResource = configurationModule.saveReservationResource;
exports.FnUpdateReservationResource = configurationModule.updateReservationResource;
exports.FnGetReservationService = configurationModule.getReservationServices;
exports.FnSaveReservationService = configurationModule.saveReservationService;
exports.FnUpdateReservationService = configurationModule.updateReservationService;
exports.FnGetReservResourceServiceMap = configurationModule.getResourceServiceMaps;
exports.FnSaveReservResourceServiceMap = configurationModule.saveResourceServiceMap;
exports.FnGetWorkingHours = configurationModule.getWorkingHoursTemplates;
exports.FnSaveWorkingHours = configurationModule.saveWorkingHoursTemplate;
exports.FnGetHolidayList = configurationModule.getHolidays;
exports.FnSaveHolidayCalendar = configurationModule.saveHoliday;
exports.FnDeleteHolidayList = configurationModule.deleteHoliday;
exports.FnDeleteWorkingHours = configurationModule.deleteWorkingHours;

var Search = require('./search-module.js');
var searchModule = new Search(db);
exports.FnSearchByKeywords = searchModule.searchKeyword;
exports.FnGetSearchInformationNew = searchModule.searchInformation;
exports.FnGetWorkingHrsHolidayList = searchModule.getWorkingHrsHolidayList;
exports.FnGetBannerPicture = searchModule.getBanner;
exports.FnSearchForTracker = searchModule.searchTracker;

var Image = require('./image-module.js');
var imageModule = new Image(db);
exports.FnCropImage = imageModule.cropImage;

var Reservation = require('./reservation-module.js');
var reservationModule = new Reservation(db);
exports.FnSaveReservTransaction = reservationModule.SaveReservTrans;
exports.FnGetReservTask = reservationModule.getList;
exports.FnGetMapedServices = reservationModule.getMapedServices;
exports.FnGetResTransDetails = reservationModule.getTransDetails;
exports.FnChangeReservationStatus = reservationModule.changeReservStatus;
exports.FnGetworkinghoursList = reservationModule.getworkinghoursList;

function error(err, req, res, next) {
    // log it
    console.error(err.stack);
    console.log('Error Happened Please try Again..');
    // respond with 500 "Internal Server Error".
    res.json(500,{ status : false, message : 'Internal Server Error', error : {server : 'Exception'}});
};
//finding for which application the app is running ie whether cab or school


var FinalMessage = {
    Message: '',
    StatusCode: '',
    Result: ''
};
var FinalMsgJson = JSON.parse(JSON.stringify(FinalMessage));

var path ='D:\\EZEIDBanner\\';
//ezeid email id:
var EZEIDEmail = 'noreply@ezeid.com';
//EzeId services will start from here
//method to generate the token
function FnGenerateToken() {
    try {
        var text = "";
        var possible = "1234567890abcdefghjklmnopqrstuvwxyz!@#$%";

        for (var i = 0; i < 10; i++) {

            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            key = 'hire@123';

        var cipher = crypto.createCipher(algorithm, key)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }
    catch (ex) {
        console.log('OTP generate error:' + ex.description);
          
        return 'error'
    }
}

function FnSendMailEzeid(MailContent, CallBack) {
    try {

        //below query to check token exists for the users or not.
        if (MailContent != null) {
            //var Query = 'select Token from tmaster';
            //70084b50d3c43822fbef
            var RtnResponse = {
                IsSent: false
            };
            var RtnResponse = JSON.parse(JSON.stringify(RtnResponse));
            var nodemailer = require('nodemailer');
            var smtpTransport = require('nodemailer-smtp-transport');
            var transporter = nodemailer.createTransport(smtpTransport({
                host: 'mail.name.com',
                port: 25,
                auth: {
                    user: 'noreply@ezeid.com',
                    pass: 'Ezeid2015'
                }
            }));
            transporter.sendMail(MailContent, function (error, info) {
                if (error) {
                    console.log('FnSendMailEzeid: sending mail error ' + error);
                    CallBack(null, null);
                }
                else {
                    console.log('FnSendMailEzeid: Message sent: ' + info.response);
                    RtnResponse.IsSent = true;
                    CallBack(null, RtnResponse);
                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnSendMailEzeid: Token is empty');
        }

    }
    catch (ex) {
        console.log('OTP FnSendMailEzeid error:' + ex.description);
          
        return 'error'
    }
};

function FnMessageMail(MessageContent, CallBack) {
    try {

        //below query to check token exists for the users or not.
        if (MessageContent != null) {
            var RtnMessage = {
                IsSuccessfull: false
            };
            console.log(' this is MessageContent body............');
            console.log(MessageContent);
            var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
            var fs = require('fs');
            var MessageType = null;
            //  console.log(MessageContent.MessageType);

            if (MessageContent.MessageType == 0) {
                MessageType = 1;
            } else if (MessageContent.MessageType == 6) {
                MessageType = 3;
            } else {
                MessageType = MessageContent.MessageType;
            }
            var query = db.escape(MessageContent.Token) + ',' + db.escape(MessageContent.LocID) + ',' + db.escape(MessageType);

            //  console.log(query);//console.log('FnSaveMessage: Inserting data: ' + query);
            db.query('CALL PgetMailSendingDetails(' + query + ')', function (err, MessageContentResult) {
                if (!err) {
                    if (MessageContentResult[0] != null) {
                        if (MessageContentResult[0].length > 0) {

                            if (MessageContentResult[0].ToMailID != '') {
                                /* if (MessageContent.MessageType == 0) {
                                 fs.readFile("Individual.txt", "utf8", function (err, data) {
                                 if (err) throw err;
                                 // console.log(MessageContentResult);
                                 data = data.replace('[IsVerified]', MessageContentResult[0].EZEIDVerifiedID);
                                 data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                 data = data.replace("[Message]", MessageContent.Message);
                                 data = data.replace("[https://www.ezeid.com?ID=]", 'https://www.ezeid.com?ID=' + MessageContentResult[0].EZEID);
                                 // console.log('Body:' + data);
                                 //  console.log(MessageContentResult[0].ToMailID);
                                 var TomailOptions = {
                                 from: 'noreply@ezeid.com',
                                 to: MessageContentResult[0].ToMailID,
                                 subject: 'Message from ' + MessageContentResult[0].EZEID,
                                 html: data // html body
                                 };
                                 //console.log(TomailOptions);
                                 var post = { MessageType: db.escape(MessageContent.MessageType), ToMailID: MessageContentResult[0].ToMailID, Subject: TomailOptions.subject, Body: TomailOptions.html };
                                 //  console.log(post);
                                 var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                 // Neat!
                                 if (!err) {
                                 console.log('FnMessageMail: Mail saved Successfully');
                                 CallBack(null, RtnMessage);
                                 }
                                 else {
                                 console.log('FnMessageMail: mail not saved Successfully: ' + err);
                                 CallBack(null, null);
                                 }
                                 });
                                 });
                                 }
                                 else */
                                if (MessageContent.MessageType == 1) {
                                    fs.readFile("SalesEnquiry.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Message]", MessageContent.Message);
                                        data = data.replace("[https://www.ezeid.com/]", 'https://www.ezeid.com/' + MessageContentResult[0].EZEID);
                                        // console.log('Body:' + data);
                                        // console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Sales Enquiry from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType, Priority: 3,ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                        // console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: Mail saved Successfully....1');
                                                CallBack(null, RtnMessage);
                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');
                                                CallBack(null, null);
                                            }
                                        });
                                    });
                                } else if (MessageContent.MessageType == 2) {
                                    fs.readFile("HomeDelivery.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Message]", MessageContent.Message);
                                        data = data.replace("[https://www.ezeid.com/]", 'https://www.ezeid.com/' + MessageContentResult[0].EZEID);

                                        // console.log('Body:' + data);
                                        //  console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Home Delivery request from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType,Priority: 3, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                        // console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: Mail saved Successfully....2');
                                                CallBack(null, RtnMessage);
                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');
                                                CallBack(null, null);
                                            }
                                        });
                                    });
                                } else if (MessageContent.MessageType == 3) {
                                    fs.readFile("Reservation.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Message]", MessageContent.Message);
                                        var moment = require('moment');
                                        // console.log(moment(dateconvert).format('DD-MMM-YYYY HH:MM a'));
                                        if (MessageContent.TaskDateTime != null || MessageContent.TaskDateTime == null) {
                                            MessageContent.TaskDateTime = moment(new Date(MessageContent.TaskDateTime)).format('DD-MMM-YYYY HH:MM a');
                                        }
                                        else {
                                            MessageContent.TaskDateTime = '';
                                        }
                                        //  console.log(moment(new Date(MessageContent.TaskDateTime)).format('DD-MMM-YYYY HH:MM a'));
                                        data = data.replace("[ActionDate]", MessageContent.TaskDateTime);
                                        data = data.replace("[https://www.ezeid.com/]", 'https://www.ezeid.com/' + MessageContentResult[0].EZEID);
                                        // console.log('Body:' + data);
                                        // console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Reservation Request from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType, Priority: 3,ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                        // console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: Mail saved Successfully.....3');
                                                CallBack(null, RtnMessage);
                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');
                                                CallBack(null, null);
                                            }
                                        });
                                    });
                                } else if (MessageContent.MessageType == 4) {
                                    fs.readFile("ServiceRequest.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Message]", MessageContent.Message);
                                        data = data.replace("[https://www.ezeid.com/]", 'https://www.ezeid.com/' + MessageContentResult[0].EZEID);
                                        // console.log('Body:' + data);
                                        //  console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Service Request from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType,Priority: 3, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                        // console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: Mail saved Successfully.....4');
                                                CallBack(null, RtnMessage);
                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');
                                                CallBack(null, null);
                                            }
                                        });
                                    });
                                } else if (MessageContent.MessageType == 5) {
                                    fs.readFile("CV.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        console.log('--------------------------');
                                        console.log(MessageContentResult);
                                        console.log('--------------------------');
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Functions]", MessageContentResult[0].Function);
                                        data = data.replace("[Roles]", MessageContentResult[0].Role);
                                        data = data.replace("[Keyskills]", MessageContentResult[0].KeySkills);
                                        data = data.replace("[https://www.ezeid.com/]", 'https://www.ezeid.com/' + MessageContentResult[0].EZEID);

                                        if (MessageContentResult[0].DocPin == '') {
                                            data = data.replace("[PIN]", MessageContentResult[0].DocPin);
                                        }
                                        else {
                                            data = data.replace("[PIN]", MessageContentResult[0].DocPin);
                                        }
                                        // console.log(MessageContentResult[0].ToMailID);
                                        // console.log('Body:' + data);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Application for a Suitable Employment',
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType,Priority: 3, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                        console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: Mail saved Successfully....5');
                                                CallBack(null, RtnMessage);
                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');
                                                CallBack(null, null);
                                            }
                                        });
                                    });
                                }
                                /*else if (MessageContent.MessageType == 6) {
                                 fs.readFile("Appointment.txt", "utf8", function (err, data) {
                                 if (err) throw err;
                                 var moment = require('moment');
                                 if (MessageContent.TaskDateTime != null) {
                                 MessageContent.TaskDateTime = moment(new Date(MessageContent.TaskDateTime)).format('DD-MMM-YYYY HH:MM a');
                                 }
                                 else {
                                 MessageContent.TaskDateTime = '';
                                 }
                                 data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                 data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                 data = data.replace("[Message]", MessageContent.Message);
                                 var moment = require('moment');
                                 // console.log(moment(dateconvert).format('DD-MMM-YYYY HH:MM a'));

                                 data = data.replace("[ActionDate]", MessageContent.TaskDateTime);
                                 data = data.replace("[https://www.ezeid.com?ID=]", 'https://www.ezeid.com?ID=' + MessageContentResult[0].EZEID);
                                 // console.log('Body:' + data);
                                 // console.log(MessageContentResult[0].ToMailID);
                                 var mailOptions = {
                                 from: 'noreply@ezeid.com',
                                 to: MessageContentResult[0].ToMailID,
                                 subject: 'Appointment Request from  ' + MessageContentResult[0].EZEID,
                                 html: data // html body
                                 };
                                 var post = { MessageType: MessageContent.MessageType,Priority: 3, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                 // console.log(post);
                                 var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                 // Neat!
                                 if (!err) {
                                 console.log('FnMessageMail: Mail saved Successfully');
                                 CallBack(null, RtnMessage);
                                 }
                                 else {
                                 console.log('FnMessageMail: Mail not Saved Successfully');
                                 CallBack(null, null);
                                 }
                                 });
                                 });
                                 }*/
                            }
                            else {
                                console.log('FnMessageMail: Email  is empty');
                                CallBack(null, null);
                            }
                        }
                        else {
                            console.log('FnMessageMail: Messages not inserted');
                            CallBack(null, null);
                        }
                    }
                    else {
                        console.log('FnMessageMail: Messages not inserted');
                        CallBack(null, null);
                    }
                }
                else {
                    CallBack(null, null);
                    console.log('FnMessageMail: Error in saving Messages : ' + err);
                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnMessageMail: Token is empty');
        }

    }
    catch (ex) {
        console.log('OTP FnMessageMail error:' + ex.description);
          
        return 'error'
    }
};

//method to validate token
function FnValidateToken(Token, CallBack) {
    try {

        //below query to check token exists for the users or not.
        if (Token != null && Token != '') {
            if(Token != 2){
                var Query = 'select TID,Token from tmaster where Token=' + db.escape(Token);
                //var Query = 'select Token from tmaster';
                //70084b50d3c43822fbef
                db.query(Query, function (err, Result) {
                    if (!err) {
                        if (Result.length > 0) {
                            // console.log(Result);
                            console.log('FnValidateToken: Token found');
                            CallBack(null, Result[0]);
                        }
                        else {
                            CallBack(null, null);
                            console.log('FnValidateToken:No Token found');
                        }
                    }
                    else {
                        CallBack(err, null);
                        console.log('FnValidateToken:' + err);

                    }
                });
            }
            else{
                CallBack(null, 'Pass');
            }
        }
        else {
            CallBack(null, null);
            console.log('FnValidateToken: Token is empty');
        }

    }
    catch (ex) {
        console.log('OTP FnValidateToken error:' + ex.description);
          
        return 'error'
    }
};

exports.FnToken = function (req, res) {
    try {
        FnValidateToken('70084b50d3c43822fbef', function (err, Result) {
            if (!err) {
                // console.log(Result);
                res.send(Result);
            }
            else {
                console.log(err);
                res.send(err);
            }
        });

    }
    catch (ex) {
        console.log('FnToken: OTP FnValidateToken error:' + ex.description);
          
        return 'error'
    }
};

//method to load functional role map
exports.FnGetFunctionRoleMap = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Query = 'select b.FunctionID,c.FunctionName,b.RoleID,a.RoleName from mroletype a, mfunctionrolemap b,mfunctiontype c where a.RoleID=b.RoleID and c.FunctionID=b.FunctionID'
        db.query(Query, function (err, FunctionRoleMapResult) {
            if (!err) {
                if (FunctionRoleMapResult.length > 0) {
                    res.send(FunctionRoleMapResult);
                    console.log('FnGetFunctionRoleMap: mfunctionrolemap: Function Rolemap sent successfully');
                }
                else {
                    res.json(null);
                    console.log('FnGetFunctionRoleMap: mfunctionrolemap: No function Rolemap found');
                }
            }
            else {

                res.json(null);
                res.statusCode = 500;
                console.log('FnGetFunctionRoleMap: mfunctionrolemap: ' + err);
            }
        });
    }
    catch (ex) {
        console.log('FnGetFunctionRoleMap error:' + ex.description);
          
    }
};

//method to load Roles based on functions
exports.FnGetRoles = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        var FunctionID = req.query.FunctionID;

        if (LangID.toString != 'NaN' && FunctionID != null) {
            var Query = ' select  b.RoleID,b.FunctionID,c.FunctionName,a.RoleName from mroletype a, mfunctionrolemap b,mfunctiontype c where a.RoleID=b.RoleID and c.FunctionID=b.FunctionID and c.LangID=' + db.escape(LangID) + ' and b.FunctionID in (' + db.escape(FunctionID) + ')';
            db.query(Query, function (err, FunctionRoleMapResult) {
                if (!err) {
                    if (FunctionRoleMapResult.length > 0) {
                        res.send(FunctionRoleMapResult);
                        console.log('FnGetRoles: mfunctiontype: Functions sent successfully');
                    }
                    else {
                        res.json(null);
                        res.statusCode = 500;
                        console.log('FnGetRoles: mfunctiontype: No function  found');
                    }
                }
                else {

                    res.json(null);
                    console.log('FnGetRoles: mfunctiontype: ' + err);
                }
            });
        }
        else {
            if (LangID.toString() == 'NaN') {
                console.log('FnGetRoles: LangId is empty');
            }
            else if (FunctionID == null) {
                console.log('FnGetRoles: FunctionId is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetFunctions error:' + ex.description);
          
    }
};

//method to load languages
exports.FnGetLanguage = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'Select LangID, LangName, SeqNo, Status from  mlang where LangID=' + db.escape(LangID);
            db.query(Query, function (err, LanguageResult) {
                if (!err) {
                    if (LanguageResult.length > 0) {
                        res.send(LanguageResult);
                        console.log('FnGetLanguage: mlang: Language sent successfully');
                    }
                    else {
                        res.json(null);
                        console.log('FnGetLanguage: mlang: No Language found');
                    }
                }
                else {
                    res.json(null);
                    res.statusCode = 500;
                    console.log('FnGetLanguage: mlang: ' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400
            console.log('FnGetLanguage: LangId is empty');
        }

    }
    catch (ex) {
        console.log('FnGetLanguage error:' + ex.description);
          
    }
};

//method to load role type
exports.FnGetFunctionRoleMapping = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Query = 'Select RoleID,FunctionID from mfunctionrolemap';
        db.query(Query, function (err, RoleFunctionMappingResult) {
            if (!err) {
                if (RoleFunctionMappingResult.length > 0) {
                    res.send(RoleFunctionMappingResult);
                    console.log('FnGetRoleFunctionMapping: mfunctionrolemap: Function Role Map sent successfully');
                }
                else {
                    res.json(null);
                    console.log('FnGetRoleFunctionMapping: mfunctionrolemap: No Function Role Map found');
                }
            }
            else {
                res.json(null);
                res.statusCode = 500;
                console.log('FnGetRoleFunctionMapping: mfunctionrolemap:' + err);
            }
        });

    }
    catch (ex) {
        console.log('FnGetRoleFunctionMapping error:' + ex.description);
          
    }
};

//method to load role type
exports.FnGetRoleType = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'Select RoleID, RoleName from mroletype where LangID=' + db.escape(LangID);
            db.query(Query, function (err, RoleTypeResult) {
                if (!err) {
                    if (RoleTypeResult.length > 0) {
                        res.send(RoleTypeResult);
                        console.log('FnGetRoleType: mroletype: Role Type sent successfully');
                    }
                    else {
                        res.json(null);
                        console.log('FnGetRoleType: mroletype: No Role Type found');
                    }
                }
                else {
                    res.json(null);
                    res.statusCode = 500;
                    console.log('FnGetRoleType: mroletype:' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('LangId is empty');
        }
    }
    catch (ex) {
        console.log('FnGetRoleType error:' + ex.description);
          
    }
};

//method to load Mtitle(Mr, Mrs)
exports.FnGetMTitle = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var LangID = parseInt(req.query.LangID);

        if (LangID.toString != 'NaN') {
            var Query = 'Select TitleID,Title from mtitle where LangID=' + db.escape(LangID);
            db.query(Query, function (err, MTitleResult) {
                if (!err) {
                    if (MTitleResult.length > 0) {
                        res.send(MTitleResult);
                        console.log('FnGetMTitle: mtitle: MTitle sent successfully');
                    }
                    else {
                        res.json(null);
                        console.log('FnGetMTitle: mtitle: No MTitle found');
                    }
                }
                else {
                    res.json(null);
                    res.statusCode = 500;
                    console.log('FnGetMTitle: mtitle: ' + err);
                }
            });
        }
        else {

            console.log('FnGetMTitle: LangId is empty');
            res.statusCode = 400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetMTitle error:' + ex.description);
          
    }
};

//method to load proxmity
exports.FnGetProxmity = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'Select Title,MetersValue, MilesValue from mproximity where LangID=' + db.escape(LangID);
            db.query(Query, function (err, ProximityResult) {
                if (!err) {
                    if (ProximityResult.length > 0) {
                        res.send(ProximityResult);
                        console.log('FnGetProxmity: mproximity: proximity sent successfully');
                    }
                    else {
                        res.json(null);
                        console.log('FnGetProxmity: mproximity: No proximity found');
                    }
                }
                else {
                    res.json(null);
                    res.statusCode = 500;
                    console.log('FnGetProxmity: mroletype:' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetProxmity: LangId is empty');
        }
    }
    catch (ex) {
        console.log('FnGetProxmity error:' + ex.description);
          
    }
};

//method to send mails
exports.FnSendMail = function (req, res) {
    try {
        res.setHeader('content-type', 'application/json');
        //user login
        var From = req.body.From;
        var To = req.body.To;
        var Subject = req.body.Subject;
        var Body = req.body.Body;

        if (From != null && To != null && Subject != null) {

            var fs = require('fs');
            fs.readFile("SimpleMail.txt", "utf8", function (err, data) {
                if (err) throw err;
                data = data.replace("[Body]", Body);
                //console.log('Body:' + data);
                var mailOptions = {
                    from: From,
                    to: To,
                    subject: Subject,
                    html: data // html body
                };
                //console.log('Mail Option:' + mailOptions);
                // send mail with defined transport object
                //transporter.sendMail(mailOptions, function (error, info) {
                //    if (error) {
                //        console.log(error);
                //        res.json(null);
                //    } else {
                //        console.log('Message sent: ' + info.response);
                //        FinalMsgJson.Message = 'Mail send';
                //        FinalMsgJson.StatusCode = 200;
                //        FinalMsgJson.Result = 'Pass';
                //        res.send(FinalMsgJson);
                //    }
                //});
                FnSendMailEzeid(mailOptions, function (err, Result) {
                    if (!err) {
                        if (Result != null) {
                            console.log('FnSendMail: Mail Sent Successfully');
                            res.send(RtnMessage);
                        }
                        else {
                            console.log('FnSendMail: Mail not Sent Successfully');
                            res.json(null);
                        }
                    }
                    else {
                        console.log('FnSendMail: Error in sending mails' + err);
                        res.json(null);
                    }
                });


            });
        }
        else {

            if (From == null) {
                FinalMsgJson.Message = 'FnSendMail: From is empty';
                console.log('FnSendMail: From is empty');
            }
            else if (To == null) {
                FinalMsgJson.Message = 'FnSendMail : To is empty';
                console.log('FnSendMail: To is empty');
            }
            else if (Subject == null) {
                FinalMsgJson.Message = 'FnSendMail: Subject is empty';
                console.log('FnSendMail: Subject is empty');
            }
            else if (Body == null) {
                FinalMsgJson.Message = 'FnSendMail: Body is empty';
                console.log('FnSendMail: Body is empty');
            }
            else if (Token == null) {
                FinalMsgJson.Message = 'FnSendMail: Token is empty';
                console.log('FnSendMail: Token is empty');
            }

            res.statusCode = 400;
            FinalMsgJson.StatusCode = res.statusCode;
            res.send(FinalMsgJson);
        }
    }

    catch (ex) {
        console.log('Logoin error:' + ex.description);
          
    }

};

//method to save messages
exports.FnSaveMessage = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.TokenNo;
        var ToMasterID = parseInt(req.body.ToMasterID);
        var MessageType = req.body.MessageType;
        var Message = req.body.Message;
        var Status = 0;
        var TaskDateTime = req.body.TaskDateTime;
        var CurrentTaskDate = req.body.CurrentTaskDate;
        var Notes = req.body.Notes;
        var LocID = req.body.LocID;
        if(CurrentTaskDate == null){
            CurrentTaskDate = TaskDateTime;
        }
        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null && ToMasterID.toString() != 'NaN' && LocID != null && CurrentTaskDate != null) {
                        var TaskDate = null;
                        if (TaskDateTime != null) {
                            console.log(Result);
                            // datechange = new Date(new Date(TaskDateTime).toUTCString());
                            TaskDate = new Date(TaskDateTime);
                            console.log(TaskDate);
                        }
                        // console.log(datechange);
                        var query = db.escape(Token) + ',' + db.escape(MessageType) + ',' + db.escape(Message) + ',' + db.escape(Status) + ',' + db.escape(TaskDate) + ',' + db.escape(ToMasterID) + ',' + db.escape(Notes) + ',' + db.escape(LocID);
                        console.log('CALL pSaveMessages(' + query + ')');
                        db.query('CALL pSaveMessages(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                //console.log(InsertResult);
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    console.log('FnSaveMessage: Messages Saved successfully');
                                    //console.log(RtnMessage);

                                    var MessageContent = {
                                        Token: Token,
                                        LocID: LocID,
                                        MessageType: MessageType,
                                        Message: Message,
                                        TaskDateTime: CurrentTaskDate,
                                        TID: Result.TID
                                    };
                                    //console.log(MessageContent);
                                    FnMessageMail(MessageContent, function (err, Result) {
                                        if (!err) {
                                            if (Result != null) {
                                                console.log('FnSaveMessage: Mail Sent Successfully');
                                                res.send(RtnMessage);
                                            }
                                            else {
                                                console.log('FnSaveMessage: Mail not Sent Successfully');
                                                res.send(RtnMessage);
                                            }
                                        }
                                        else {
                                            console.log('FnSaveMessage:Error in sending mails' + err);
                                            res.send(RtnMessage);
                                        }
                                    });

                                }
                                else {
                                    console.log('FnSaveMessage: Messages not inserted');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                res.send(RtnMessage);
                                console.log('FnSaveMessage: Error in saving Messages : ' + err);
                            }
                        });
                    }
                    else {
                        if (ToMasterID.toString() == 'NaN') {
                            console.log('FnSaveMessage: ToMasterID is empty');
                            res.statusCode = 400;
                        } else if (LocID == null) {
                            console.log('FnSaveMessage: LocID is empty');
                            res.statusCode = 400;
                        } else if (CurrentTaskDate == null) {
                            console.log('FnSaveMessage: CurrentTaskDate is empty');
                            res.statusCode = 400;
                        }
                        else {
                            console.log('FnSaveMessage: Invalid Token');
                            res.statusCode = 401;
                        }
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveMessage: Token error: ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });

        }
        else {
            console.log('FnSaveMessage: Token is empty');
            res.statusCode = 400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveMessage error:' + ex.description);
          
    }
};

//method to get messages
exports.FnGetMessages = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.TokenNo;
        var Page = parseInt(req.query.Page);
        var Status = req.query.Status;
        var MessageType = req.query.MessageType;
        //console.log(req.query);
        if (Token != null && Page.toString() != 'NaN' && Page.toString() != '0') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var ToPage = 25 * Page;
                        var FromPage = ToPage - 24;

                        if (FromPage <= 1) {
                            FromPage = 0;
                        }
                        //  console.log('From Page: ' + FromPage);
                        //console.log('To Page: ' + ToPage);
                        var getMessageQuery = 'CALL pGetMessages(' + db.escape(Token) + ',' + db.escape(FromPage) + ',' + db.escape(ToPage) + ',' + db.escape(Status) + ',' + db.escape(MessageType) + ')';
                        db.query(getMessageQuery, function (err, MessagesResult) {
                            if (!err) {
                                //  console.log(MessagesResult);
                                if (MessagesResult != null) {
                                    if (MessagesResult[0].length > 0) {
                                        res.send(MessagesResult[0]);
                                        console.log('FnGetMessages: Messages sent successfully');
                                    }
                                    else {
                                        console.log('FnGetMessages: No Messages available');
                                        res.json(null);
                                    }

                                }
                                else {
                                    console.log('FnGetMessages: No Messages available');
                                    res.json(null);
                                }
                            }
                            else {
                                res.statusCode = 500;
                                console.log('FnGetMessages: Error in sending Messages: ' + err);
                                res.json(null);
                            }
                        });
                    }
                    else {
                        console.log('FnGetMessages: Invalid Token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    res.statusCode = 500;
                    console.log('FnGetMessages: Token error: ' + err);
                    res.json(null);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetMessages: Token is empty');
            } else if (Page.toString() == 'NaN') {
                console.log('FnGetMessages: Page is empty');
            }
            else if (Page.toString() == '0') {
                console.log('FnGetMessages: Sending page 0');
            }
            res.statusCode = 400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetMessages error:' + ex.description);
          
    }
};

//method to update status of messages
exports.FnUpdateMessageStatus = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.body.TokenNo;
        var Status = parseInt(req.body.Status);
        var TID = parseInt(req.body.TID);
        var Notes = req.body.Notes;
        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Notes == null)
            Notes = '';
        if (token != null && token != '' && Status.toString() != 'NaN' && TID.toString() != 'NaN') {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        //var query = 'update tmessages set Status=' + db.escape(Status) + ' where TID=' + db.escape(TID);
                        var query = 'update ttrans set Status=' + db.escape(Status) + ', Notes=' + db.escape(Notes) + ' where TID=' + db.escape(TID);
                        // console.log('Update query : ' + query);
                        db.query(query, function (err, UpdateResult) {
                            if (!err) {
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (UpdateResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateMessageStatus: Message status update successfully');
                                }
                                else {
                                    console.log('FnUpdateMessageStatus: Update item is not avaiable');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnUpdateMessageStatus: ' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateMessageStatus: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    res.statusCode = 500;
                    console.log('FnUpdateMessageStatus: : ' + err);
                    res.send(RtnMessage);

                }
            });

        }
        else {
            if (token == null || token == '') {
                console.log('FnUpdateMessageStatus: token is empty');
            }
            else if (Status.toString() == 'NaN') {
                console.log('FnUpdateMessageStatus: Status is empty');
            }
            else if (TID.toString() != 'NaN') {
                console.log('FnUpdateMessageStatus: TID is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);

        }
    }
    catch (ex) {
        console.log('FnUpdateMessageStatus:  error:' + ex.description);
          
    }
};

//method to udpate primary location picture
exports.FnUpdateProfilePicture = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.TokenNo;
        var Picture = req.body.Picture;
        var PictureFileName = req.body.PictureFileName;
        //console.log('FnUpdateProfilePicture');
        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        //if (Picture == null)
        //    Picture = '';
        //if (PictureFileName == null)
        //    PictureFileName = '';
        if (Token != null && Picture != null && PictureFileName != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('select TID from tmaster where Token=' + db.escape(Token), function (err, UserResult) {
                            if (!err) {
                                //console.log(UserResult);
                                if (UserResult != null) {
                                    if (UserResult.length > 0) {
                                        var query = 'Update tlocations set Picture = ' + db.escape(Picture) + ',' + 'PictureFileName= ' + db.escape(PictureFileName) + ' where SeqNo=0 and MasterID=' + db.escape(UserResult[0].TID);
                                        // console.log(query);
                                        db.query(query, function (err, PicResult) {
                                            if (!err) {
                                                //console.log(PicResult);
                                                if (PicResult.affectedRows > 0) {
                                                    RtnMessage.IsSuccessfull = true;
                                                    res.send(RtnMessage);
                                                    console.log('FnUpdateProfilePicture: Picture updated successfully');
                                                }
                                                else {
                                                    console.log('FnUpdateProfilePicture: No picture avaiable');
                                                    res.send(RtnMessage);
                                                }

                                            }
                                            else {
                                                console.log('FnUpdateProfilePicture: No document available: ' + err);
                                                res.send(RtnMessage);
                                            }
                                        });
                                    }
                                    else {
                                        console.log('FnUpdateProfilePicture: No user available');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnUpdateProfilePicture: No user avaiable');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                res.send(RtnMessage);
                                res.statusCode = 500;
                                console.log('FnUpdateProfilePicture: Error in sending documents: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateProfilePicture: Invalid Token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnUpdateProfilePicture: Token error: ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnUpdateProfilePicture: Token is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnUpdateProfilePicture error:' + ex.description);
          
    }
};

exports.FnCheckCV = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var qry = 'select TID from tmaster where Token=' + db.escape(Token);
                        db.query(qry, function (err, TokenTitleResult) {
                            if (!err) {
                                if (TokenTitleResult != null) {
                                    if (TokenTitleResult.length > 0) {
                                        var TID = TokenTitleResult[0].TID;
                                        var Query = 'Select CVDoc from tcv where MasterID=' + db.escape(TID);
                                        db.query(Query, function (err, TCVResult) {
                                            if (!err) {
                                                if (TCVResult.length > 0) {
                                                    if (TCVResult[0].CVDoc != null && TCVResult[0].CVDoc != '') {
                                                        RtnMessage.IsSuccessfull = true;
                                                        res.send(RtnMessage);
                                                        console.log('FnCheckCV: tcv: CV is available');
                                                    }
                                                    else {
                                                        res.send(RtnMessage);
                                                        console.log('FnCheckCV: tcv: CV is not available');
                                                    }
                                                }
                                                else {
                                                    res.send(RtnMessage);
                                                    console.log('FnCheckCV: mtitle: cv is not avaiable');
                                                }
                                            }
                                            else {
                                                res.statusCode = 500;
                                                res.send(RtnMessage);
                                                console.log('FnCheckCV: tcv: ' + err);
                                            }
                                        });
                                    }
                                    else {
                                        res.send(RtnMessage);
                                        console.log('FnCheckCV: No user informations')
                                    }
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('FncheckCV: No user information')
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.send(RtnMessage);
                                console.log('FnCheckCV:Error in Getting userdetails: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnCheckCV:Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnCheckCV: Error in checking token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            console.log('FnCheckCV: LangId is empty');
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnCheckCV error:' + ex.description);
          
    }
};

exports.FnUpdateBussinessListing = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.body.TokenNo;
        var CategoryID = parseInt(req.body.CategoryID);
        var Keywords = req.body.Keywords;
        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (token != null && token != '' && CategoryID.toString() != 'NaN' && Keywords != null) {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        //  var fileName = BrochureDocFile.split('.').pop();
                        var query = db.escape(token) + ',' + db.escape(Keywords) + ',' + db.escape(CategoryID);
                        //console.log(query);
                        db.query('CALL pUpdateBusinesslist(' + query + ')', function (err, UpdateResult) {
                            if (!err) {
                                //console.log(UpdateResult);
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (UpdateResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateBussinessListing: Bussiness listing update successfully');
                                }
                                else {
                                    console.log('FnUpdateBussinessListing: Bussiness listing is not avaiable');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnUpdateBussinessListing: ' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        console.log('FnUpdateBussinessListing: Invalid token');
                        res.send(RtnMessage);
                    }
                }
                else {
                    res.statusCode = 500;
                    console.log('FnUpdateBussinessListing: : ' + err);
                    res.send(RtnMessage);

                }
            });

        }
        else {
            if (token == null || token == '') {
                console.log('FnUpdateBussinessListing: token is empty');
            }
            else if (CategoryID.toString() == 'NaN') {
                console.log('FnUpdateMessageStatus: CategoryID is empty');
            }
            else if (Keywords == null) {
                console.log('FnUpdateMessageStatus: Keywords is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);

        }
    }
    catch (ex) {
        console.log('FnUpdateMessageStatus:  error:' + ex.description);
          
    }
};

exports.FnGetBussinessListing = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.query.TokenNo;
        if (token != null) {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetBusinesslist(' + db.escape(token) + ')', function (err, BussinessListingResult) {
                            if (!err) {
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (BussinessListingResult[0] != null) {
                                    if (BussinessListingResult[0].length > 0) {
                                        res.send(BussinessListingResult[0]);
                                        console.log('FnGetBussinessListing: Bussiness listing sent successfully');
                                    }
                                    else {
                                        console.log('FnGetBussinessListing: Bussiness listing is not avaiable');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetBussinessListing: Bussiness listing is not avaiable');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetBussinessListing: ' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        console.log('FnGetBussinessListing: Invalid token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetBussinessListing: : ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });
        }
        else {
            console.log('FnGetBussinessListing: token is empty');
            res.statusCode = 400;
            res.json(null);

        }
    }
    catch (ex) {
        console.log('FnGetBussinessListing:  error:' + ex.description);
          
    }
};

var fs = require("fs");
exports.FnUploadDocument = function (req, res) {
    try {

        var deleteTempFile = function(){
            fs.unlink('../bin/'+req.files.file.path);
        };

        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        // console.log(req.files);
        // console.log(req.body);
        var Token = req.body.TokenNo;
        var CntType = req.files.file.mimetype;
        var RefFileName = req.files.file.path;
        //var RefFileName = req.body.Filename;
        var tRefType = req.body.RefType;
        //console.log(req.body);

        FnValidateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    if (req && req.files) {
                        if (CntType != null && RefFileName != null && tRefType != null && Token != null) {

                            var fileName = '';
                            if (RefFileName != null) {
                                fileName = RefFileName.split('.').pop();
                            }
                            //console.log(Token);
                            fs.readFile(RefFileName, function (err, original_data) {
                                var query = db.escape(Token) + ',' + db.escape( new Buffer(original_data).toString('base64')) + ',' + db.escape(fileName) + ',' + db.escape(tRefType) + ',' + db.escape(CntType);
                                //console.log(query);
                                db.query('CALL pSaveDocsFile(' + query + ')', function (err, InsertResult) {
                                    if (!err) {
                                        //    console.log(InsertResult);
                                        if (InsertResult.affectedRows > 0) {
                                            RtnMessage.IsSuccessfull = true;
                                            console.log('FnUploadDocument: Document Saved successfully');
                                            res.send(RtnMessage);
                                            deleteTempFile();
                                        }
                                        else {
                                            console.log('FnUploadDocument: Document not inserted');
                                            res.send(RtnMessage);
                                            deleteTempFile();
                                        }
                                    }
                                    else {
                                        res.statusCode = 500;
                                        res.send(RtnMessage);
                                        console.log('FnUploadDocument: Error in saving documents:' + err);
                                        deleteTempFile();
                                    }
                                });
                            });
                        }
                        else {
                            res.send(RtnMessage);
                            console.log('FnUploadDocument: Mandatory field are available');
                            deleteTempFile();
                        }
                    }
                    else {
                        res.send(RtnMessage);
                        console.log('FnUploadDocument: Mandatory field are available');
                        deleteTempFile();
                    }
                }
                else {
                    res.statusCode = 401;
                    res.send(RtnMessage);
                    console.log('FnUploadDocument: Invalid Token');
                    deleteTempFile();
                }
            }
            else {
                res.statusCode = 500;
                res.send(RtnMessage);
                console.log('FnUploadDocument: Error in validating token: ' + err);
                deleteTempFile();
            }
        });
    }
    catch (ex) {
        console.log('FnGetDocument error:' + ex.description);
          
        deleteTempFile();
    }
};

exports.FnGetDocument = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.TokenNo;
        var Type = parseInt(req.query.RefType);
        if (Token != null && Type.toString() != 'NaN' && Type.toString() != '0') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(Type);
                        //console.log(query);
                        db.query('CALL  pGetDocsFile(' + query + ')', function (err, DocumentResult) {
                            if (!err) {
                                if (DocumentResult[0] != null) {
                                    if (DocumentResult[0].length > 0) {
                                        DocumentResult = DocumentResult[0];
                                        var docs = DocumentResult[0];
                                        // console.log(docs);
                                        res.setHeader('Content-Type', docs.ContentType);
                                        res.setHeader('Content-Disposition', 'attachment; filename=' + docs.Filename);
                                        res.setHeader('Cache-Control', 'public, max-age=0');
                                        res.writeHead('200', { 'Content-Type': docs.ContentType });
                                        //console.log(docs.Docs);
                                        res.end(docs.Docs, 'base64');
                                        console.log('FnGetDocument: Document sent successfully-1');
                                    }
                                    else {
                                        console.log('FnGetDocument: No document available');
                                        res.json(null);
                                    }

                                }
                                else {
                                    console.log('FnGetDocument: No document available');
                                    res.json(null);
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.json(null);
                                console.log('FnGetDocument: Error in sending documents: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnGetDocument: Invalid Token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetDocument: Token error: ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnGetDocument: Token is empty');
            }
            else if (Type.toString() != 'NaN' || Type.toString() == '0') {
                console.log('FnGetDocument: Type is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetDocument error:' + ex.description);
          
    }
};

exports.FnGetSearchDocuments = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var find = req.query.Keywords;
        var token = req.query.Token;
        //console.log(token);
        if (token != null && find != null && token != '' && find != '') {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var EZEID, Pin = null;
                        var DocType = '';
                        var FindArray = find.split('.');
                        var type ='';

                        //console.log('findarray: ' + FindArray.length);
                        if (FindArray.length > 0) {
                            EZEID = FindArray[0];
                            //checking the fisrt condition
                            if (FindArray.length > 1) {
                                if (FindArray[1] != '') {
                                    if (FindArray[1].toUpperCase() == 'ID') {
                                        //console.log('ID');
                                        DocType = 'ID';
                                        type = 3;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'DL') {
                                        //console.log('DL');
                                        DocType = 'DL';
                                        type = 7;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'PP') {
                                        //console.log('PP');
                                        DocType = 'PP';
                                        type = 4;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'BR') {
                                        //console.log('BR');
                                        DocType = 'BR';
                                        type = 1;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'CV') {
                                        //console.log('CV');
                                        DocType = 'CV';
                                        type = 2;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'D1') {
                                        //console.log('D1');
                                        DocType = 'D1';
                                        type = 5;
                                    }
                                    else if (FindArray[1].toUpperCase() == 'D2') {
                                        //console.log('D2');
                                        DocType = 'D2';
                                        type = 6;
                                    }
                                    else {
                                        Pin = FindArray[1];
                                    }
                                    //checking the second condition
                                    if (typeof FindArray[2] != 'undefined') {
                                        Pin = FindArray[2];
                                    }
                                    //checking the final condition
                                }
                            }
                        }
                        var SearchQuery = db.escape(EZEID) + ',' + db.escape(Pin) + ',' + db.escape(DocType);
                        console.log('CALL  PGetSearchDocuments(' + SearchQuery + ')');
                        db.query('CALL  PGetSearchDocuments(' + SearchQuery + ')', function (err, SearchResult) {
                            // db.query(searchQuery, function (err, SearchResult) {
                            if (!err) {
                                if (SearchResult[0] != null) {
                                    if (SearchResult[0].length > 0) {
                                        SearchResult = SearchResult[0];
                                        //console.log(DocumentResult)
                                        var docs = SearchResult[0];
                                        res.setHeader('Content-Type', docs.ContentType);
                                        res.setHeader('Content-Disposition', 'attachment; filename=' + docs.Filename);
                                        //res.setHeader('Cache-Control', 'public, max-age=86400000');
                                        res.setHeader('Cache-Control', 'public, max-age=0');
                                        res.writeHead('200', { 'Content-Type': docs.ContentType });
                                        res.end(docs.Docs, 'base64');
                                        console.log('FnGetSearchDocuments: tmaster: Search result sent successfully');


                                        var getQuery = 'select TID from tmaster where Token='+db.escape(token);
                                        db.query(getQuery, function (err, getResult) {
                                            if(!err){
                                                var tid = getResult[0].TID;
                                                console.log(tid);
                                            }
                                            var query = db.escape(tid) + ',' + db.escape(EZEID) + ',' + db.escape(req.ip) + ',' + db.escape(type);
                                            console.log('CALL pCreateAccessHistory(' + query + ')');

                                            db.query('CALL pCreateAccessHistory(' + query + ')', function (err){
                                                if(!err){
                                                    console.log('FnSearchByKeywords:Access history is created');
                                                }
                                                else {
                                                    console.log('FnSearchByKeywords: tmaster: ' + err);
                                                }
                                            });
                                        });
                                    }
                                    else {
                                        res.json(null);


                                        console.log('FnGetSearchDocuments: tmaster: no search found');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetSearchDocuments: tmaster: no search found');
                                }

                            }
                            else {
                                res.statusCode = 500;
                                res.json(null);
                                console.log('FnGetSearchDocuments: tmaster: ' + err);
                            }
                        });


                    }
                    else {
                        console.log('FnGetSearchDocuments: Invalid token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetSearchDocuments: ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });
        }
        else {
            if (token == null) {
                console.log('FnGetSearchDocuments: token is empty');
            }
            else if (find == null) {
                console.log('FnGetSearchDocuments: find is empty');
            }
            res.statusCode = 400;
            res.json(null);

        }
    }
    catch (ex) {
        console.log('FnGetSearchDocuments error:' + ex.description);
          
    }
};

exports.FnUpdatePwdEncryption = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        db.query('select TID,Firstname,Password from tmaster where password is not null ', function (err, UserResult) {
            if (!err) {
                //  console.log(InsertResult);
                if (UserResult.length > 0) {
                    //var EncryptPWD;
                    for (var i = 0; i < UserResult.length; i++) {
                        var RegData = UserResult[i];
                        //console.log('user details');
                        //console.log(RegData);
                        //console.log(RegData.Password);
                        var EncryptPWD = null;
                        if (typeof RegData.Password != 'undefined' && RegData.Password != '' && RegData.Password != null) {
                            EncryptPWD = FnEncryptPassword(RegData.Password);
                            // console.log(EncryptPWD);
                            var query = 'update tmaster set password= ' + db.escape(EncryptPWD) + ' where TID =' + db.escape(RegData.TID);
                            //console.log(query);
                            db.query(query, function (err, UpdateResult) {
                                if (!err) {
                                    console.log('update happened');
                                }
                                else {
                                    console.log('Update not happened');
                                }
                            });
                        }



                        //db.query(query, function (err, UpdateResult) {
                        //    if (!err) {
                        //        console.log('update happened');
                        //    }
                        //    else {
                        //        console.log('Update not happened');
                        //    }
                        //});

                        //  res.send(RegData);
                    }
                    res.send(UserResult);
                }
                else {
                    //console.log(RtnMessage);
                    res.send(RtnMessage);
                    console.log('FnUpdateUserProfileAP:tmaster: User Profile update Failed');
                }
            }
            else {
                res.statusCode = 500;
                res.send(RtnMessage);
                console.log('FnUpdateUserProfileAP:tmaster:' + err);
            }
        });
    }
    catch (ex) {
        console.log('FnUpdateUserProfileAP error:' + ex.description);
          
    }
};

exports.FnGetLoginCheck = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        RtnMessage = {
            IsAvailable: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null && Token != '') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        RtnMessage.IsAvailable = true;
                        res.send(RtnMessage);
                        console.log('FnGetLoginCheck: Valid Login');
                    }
                    else {
                        console.log('FnGetLoginCheck: Invalid token');
                        // res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnGetLoginCheck: Token error: ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }
        else {
            res.statusCode = 400;
            res.send(RtnMessage);
            console.log('FnGetLoginCheck :  token is empty');
        }
    }
    catch (ex) {
        console.log('FnGetUserDetails error:' + ex.description);
          
    }
};

exports.FnGetUserwiseFolderList = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var RuleFunction = req.query.RuleFunction;

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pGetUserWiseFolderList(' + db.escape(Token) + ',' + db.escape(RuleFunction) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetUserwiseFolderList: Folder list details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetUserwiseFolderList:No Folder list details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetUserwiseFolderList:No Folder list details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetUserwiseFolderList: error in getting Folder list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetUserwiseFolderList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetUserwiseFolderList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetUserwiseFolderList: Token is empty');
            }
            if (RuleFunction == null) {
                console.log('FnGetUserwiseFolderList: RuleFunction is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetUserwiseFolderList error:' + ex.description);
          
    }
};

exports.FnGetLocationList = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pGetLocationList(' + db.escape(Token) + ')', function (err, GetResult) {
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
          
    }
};

exports.FnGetLoginDetails = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pLoginDetails(' + db.escape(Token) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetLoginDetails: Login details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetLoginDetails:No Login details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetLoginDetails:No Login details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetLoginDetails: error in getting Login details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetLoginDetails: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetLoginDetails: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetLoginDetails: Token is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetLoginDetails error:' + ex.description);
          
    }
};

//method to redirect the weblink
var FnGetRedirectLink = function(ezeid,urlSeqNumber,redirectCallback){
    var Insertquery = db.escape(ezeid) + ',' + db.escape(urlSeqNumber);
    db.query('CALL pRedirectWebLink(' + Insertquery + ')', function (err, results) {
        if(err){
            console.log(err);
            redirectCallback(null);
        }
        else{
            if(results.length > 0){
                if(results[0].length > 0){
                    redirectCallback(results[0][0].URL);
                }
                else{
                    redirectCallback(null);
                }
            }
            else{
                redirectCallback(null);
            }
        }
    });
};

exports.FnWebLinkRedirect = function(req,res,next){
    if(req.params.id){
        var link = req.params.id;
        var arr = link.split('.');
        if(arr.length > 1){
            var lastItem = arr[arr.length - 1];

            arr.splice(arr.length - 1,1);

            var ezeid = arr.join('.');

            var urlBreaker = lastItem.split('');
            if(urlBreaker.length > 1 && urlBreaker.length < 4){
                if(urlBreaker[0] === 'U'){
                    urlBreaker.splice(0,1);
                    var urlSeqNumber = parseInt(urlBreaker.join(''));
                    if(!isNaN(urlSeqNumber)){
                        if(urlSeqNumber > 0 && urlSeqNumber < 100){
                            FnGetRedirectLink(ezeid,urlSeqNumber,function(url){

                                if(url){
                                    res.redirect(url);
                                }
                                else{

                                    next();
                                }
                            });
                        }
                        else{
                            next();
                        }
                    }
                    else{
                        next();
                    }
                }
                else{
                    next();
                }
            }
            else{
                next();
            }
        }
        else{
            next();
        }
    }
    else{
        next();
    }
}

exports.FnGetSearchPicture = function(req, res){
    try{

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var TID = req.query.TID;
        var ID=''
        if(TID != null){

            ID = TID + ',' + ID;
            var IDS =ID.slice(0,-1);
            console.log('TID Values:'+ IDS);}

        if (Token != null && IDS != null){
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        console.log('CALL pGetSearchPics(' + db.escape(IDS) + ')');
                        db.query('CALL pGetSearchPics(' + db.escape(IDS) + ')', function (err, SearchResult) {

                            if (!err) {
                                if (SearchResult != null) {
                                    if (SearchResult[0] != null) {
                                        console.log('FnGetSearchPicture:Picture send sucessfully..');
                                        res.send(SearchResult[0]);
                                    }
                                    else {
                                        console.log('FnGetSearchPicture: No Picture send sucessfully');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetSearchPicture: No Picture send sucessfully');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetSearchPicture: error in getting picture result' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetSearchPicture: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetSearchPicture: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetSearchPicture: Token is empty');
            }
            else if (TID == null) {
                console.log('FnGetSearchPicture: TID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetSearchPicture error:' + ex.description);
          
    }
};

/**
 * Finds the user login status using a cookie login
 * which is created by angular at the time of signin or signup
 * @param req
 * @param res
 * @param next
 * @constructor
 */
exports.FnSearchBusListing = function(req,res,next){
    /**
     * HTML Pages list from angular routings scheme
     * Any new url pattern addition in angular should be added in this list also
     * @type {string[]}
     */
    var htmlPagesList = [
        'signup',
        'messages',
        'landing',
        'access-history',
        'busslist',
        'terms',
        'help',
        'legal',
        'blackwhitelist',
        'salesenquiry',
        'bulksalesenquiry',
        'viewdirection',
        'service-reservation',
        'business-manager',
        'profile-manager',
        'searchResult',
        'searchDetails',
        'outbox'
    ];

    var loginCookie = (req.cookies['login']) ? ((req.cookies['login'] === 'true') ? true : false ) : false;
    if(!loginCookie){
        /**
         * Checks if ezeid parameter is existing and checks in the list that is it a
         * ezeid angular url using the htmlPageList
         * If not then it will see in the database for
         * business ID
         */
        if(req.params['ezeid'] && htmlPagesList.indexOf(req.params.ezeid) === -1){
            /**
             * Checking the EZEID for it's validity
             */
            var arr = req.params.ezeid.split('.');

            if(arr.length < 2 && arr.length > 0){
                /**
                 * Find if the user type is business or not
                 */
                var ezeidQuery = "SELECT tlocations.PIN AS PIN, tmaster.TID, tlocations.TID AS LID ,"+
                    " tmaster.IDTypeID AS IDTypeID FROM tlocations"+
                    " INNER JOIN tmaster ON " +
                    "tmaster.TID = tlocations.MasterID AND tlocations.SeqNo = 0 AND tmaster.EZEID = "+
                    db.escape(req.params.ezeid)+ " LIMIT 1";
                db.query(ezeidQuery,function(err,results){
                    if(!err){
                        if(results.length > 0){
                            if((!results[0].PIN) && results[0].IDTypeID !== 1){
                                res.redirect('/searchDetails?searchType=2&TID='+results[0].LID);
                            }
                            else{
                                next();
                            }
                        }
                        else{
                            next();
                        }
                    }
                    else{
                        next();
                    }
                });
            }
            else{
                next();
            }
        }
        else{
            next();
        }
    }
    else{
        next();
    }
};

exports.FnGetCompanyDetails = function (req, res) {

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var functiontype =  req.query.functiontype;
        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (Token) {

            db.query('CALL pGetCompanyDetails(' + db.escape(Token) + ',' + db.escape(functiontype) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'Company details Send successfully';
                            console.log('FnGetCompanyDetails: Company details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded Company details';
                            console.log('FnGetCompanyDetails: No founded Company details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No founded Company details';
                        console.log('FnGetCompanyDetails: No founded Company details');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Company details';
                    console.log('FnGetCompanyDetails: error in getting Company details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!Token) {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {
                    Token : 'Invalid Token'
                };
                console.log('FnGetCompanyDetails: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetCompanyDetails:error ' + ex.description);
          
        res.status(400).json(responseMessage);
    }
};


//EZEIDAP Parts
function FnValidateTokenAP(Token, CallBack) {
    try {

        //below query to check token exists for the users or not.
        if (Token != null) {
            var Query = 'select Token from tapuser where Token=' + db.escape(Token);
            //var Query = 'select Token from tmaster';
            //70084b50d3c43822fbef
            db.query(Query, function (err, Result) {
                if (!err) {
                    if (Result.length > 0) {
                        // console.log(Result);
                        console.log('FnValidateToken: Token found');
                        CallBack(null, Result[0]);
                    }
                    else {
                        CallBack(null, null);
                        console.log('FnValidateToken:No Token found');
                    }
                }
                else {
                    CallBack(err, null);
                    console.log('FnValidateToken:' + err);

                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnValidateToken: Token is empty');
        }

    }
    catch (ex) {
        console.log('OTP FnValidateToken error:' + ex.description);
          
        return 'error'
    }
};

exports.FnLoginAP = function (req, res) {
    try {
        //res.setHeader("Access-Control-Allow-Origin", "*");
        //res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        //res.setHeader('content-type', 'application/json');
        var UserName = req.body.UserName;
        var Password = req.body.Password;
        var RtnMessage = {
            Token: '',
            IsAuthenticate: false,
            FullName: '',
            APID: 0
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (UserName != null && UserName != '' && Password != null && Password != '') {
            var encryptPassword= FnEncryptPassword(Password);
            var Query = 'select TID, FullName,APMasterID from tapuser where APLoginID=' + db.escape(UserName) + ' and APPassword=' + db.escape(encryptPassword);
            db.query(Query, function (err, loginResult) {
                if (!err) {
                    if (loginResult.length > 0) {
                        var Encrypt = FnGenerateToken();
                        var Query = 'update tapuser set Token=' + db.escape(Encrypt) + ' where TID=' + db.escape(loginResult[0].TID);
                        db.query(Query, function (err, TokenResult) {
                            if (!err) {
                                if (TokenResult.affectedRows > 0) {
                                    RtnMessage.Token = Encrypt;
                                    RtnMessage.IsAuthenticate = true;
                                    RtnMessage.FullName = loginResult[0].FullName;
                                    RtnMessage.TID = loginResult[0].TID;
                                    RtnMessage.APID = loginResult[0].APMasterID;
                                    res.send(RtnMessage);
                                    console.log('FnLoginAP:tmaster: Login success');
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('FnLoginAP:tmaster:Fail to generate Token');
                                }
                            }
                            else {

                                res.send(RtnMessage);
                                console.log('FnLoginAP:tmaster:' + err);
                            }
                        });
                    }
                    else {

                        res.send(RtnMessage);
                        console.log('FnLoginAP:tmaster: Invalid login credentials');
                    }
                }
                else {

                    res.send(RtnMessage);
                    console.log('FnLoginAP:tmaster:' + err);
                }
            });
        }
        else {
            if (UserName == null || UserName == '') {
                console.log('FnLoginAP: UserName is empty');
            }
            else if (Password == null || Password == '') {
                console.log('FnLoginAP: password is empty');
            }
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnLogin error:' + ex.description);
          
    }
};

exports.FnLogoutAP = function (req, res) {
    try {
        //res.setHeader("Access-Control-Allow-Origin", "*");
        //res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        //res.setHeader('content-type', 'application/json');
        var Token = req.query.Token;

        var RtnMessage = {
            Token: '',
            IsAuthenticate: true,
            FirstName: ''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && Token != '') {
            var Query = 'update tapuser set Token=' + db.escape('') + ' where Token=' + db.escape(Token);
            db.query(Query, function (err, TokenResult) {
                if (!err) {
                    RtnMessage.Token = '';
                    RtnMessage.IsAuthenticate = false;
                    res.send(RtnMessage);
                    console.log('FnLogoutAP: tmaster: Logout success');
                }
                else {
                    res.send(RtnMessage);
                    console.log('FnLogoutAP:tmaster:' + err);
                }
            });
        }
        else {
            if (Token == null || Token == '') {
                console.log('FnLogoutAP: Token is empty');
            }
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnLogoutAP error:' + ex.description);
          
    }
};

//getting the details of user
exports.FnGetUserDetailsAP = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var TokenNo = req.query.Token;
        var EZEID = req.query.EZEID;
        if (EZEID != null && EZEID != '' && TokenNo != null) {

            FnValidateTokenAP(TokenNo, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        //var Query = 'Select a.TID as MasterID, b.TID as LocationID,IDTypeID,a.EZEID,ifnull(EZEIDVerifiedID,0) as EZEIDVerifiedID,ifnull(EZEIDVerifiedByID,0) EZEIDVerifiedByID,ifnull(StatusID,0) as StatusID,FirstName,ifnull(LastName,"") as LastName,ifnull(CompanyName,"") as CompanyName,ifnull(CategoryID,0) as CategoryID,ifnull(FunctionID,0) as FunctionID,ifnull(RoleID,0) as RoleID,ifnull(JobTitle,"") as JobTitle,ifnull(NameTitleID,0) as NameTitleID,ifnull(AboutCompany,"") as AboutCompany,ifnull(LanguageID,1) as LanguageID,ifnull(Keywords,"") as Keywords,ifnull(LocTitle,"") as LocTitle,Latitude,Longitude,Altitude,ifnull(AddressLine1,"") as AddressLine1,ifnull(AddressLine2,"") as AddressLine2,CityID,StateID,CountryID,ifnull(PostalCode,"") as PostalCode,b.PIN,ifnull(EMailID,"") as EMailID,ifnull(EMailVerifiedID,"") as EMailVerifiedID,ifnull(PhoneNumber,"") as PhoneNumber, ifnull(MobileNumber,"") as MobileNumber,ifnull(LaptopSLNO,"") as LaptopSLNO,ifnull(VehicleNumber,"") as VehicleNumber,ifnull(Website,"") as Website,ifnull(Picture,"") as Picture,ifnull(PictureFileName,"") as PictureFileName ,ifnull((Select CityName from mcity where CityID=b.CityID and LangID=a.LanguageID),"") as CityTitle,ifnull((Select CountryName from mcountry where CountryID=b.CountryID and LangID=a.LanguageID),"") as CountryTitle,ifnull((Select StateName from mstate where StateID=b.StateID and LangID=a.LanguageID),"") as StateTitle,ifnull(d.ParkingStatus,1) as ParkingStatus,ifnull(d.OpenStatus,1) as OpenStatus,ifnull(d.WorkingHours,"") as WorkingHours,ifnull(d.SalesEnquiryButton,1) as SalesEnquiryButton ,ifnull(d.SalesEnquiryMailID,"") as SalesEnquiryMailID,ifnull(d.HomeDeliveryButton,1) as HomeDeliveryButton,ifnull(d.HomeDeliveryMailID,"") as HomeDeliveryMailID,ifnull(d.ReservationButton,1) as ReservationButton,ifnull(d.ReservationMailID,"") as ReservationMailID,ifnull(d.SupportButton,1) as SupportButton,ifnull(d.SupportMailID,"") as SupportMailID,ifnull(d.CVButton,1) as CVButton,ifnull(d.CVMailID,"") as CVMailID,ifnull((Select CategoryTitle from mcategory where CategoryID=a.CategoryID and LangID=a.LanguageID),"") as CategoryTitle, ifnull(a.Icon,"") as Icon, ifnull(a.IconFileName,"") as IconFileName  from tlocations b left outer Join tlcoationsettings d On b.TID=d.LocID,tmaster a left outer Join tDocs c On a.TID=c.MasterID where b.EZEID=a.EZEID and b.SeqNo=0  and a.EZEID= ' + db.escape(EZEID);
                        //   var Query ='Select a.TID as MasterID, b.TID as LocationID,IDTypeID,a.EZEID,ifnull(EZEIDVerifiedID,0) as EZEIDVerifiedID,ifnull(EZEIDVerifiedByID,0) EZEIDVerifiedByID,ifnull(StatusID,0) as StatusID,FirstName,ifnull(LastName,"") as LastName,ifnull(CategoryID,0) as CategoryID,ifnull(LanguageID,1) as LanguageID,ifnull(Keywords,"") as Keywords,ifnull(LocTitle,"") as LocTitle,Latitude,Longitude,Altitude,ifnull(Picture,"") as Picture,ifnull(PictureFileName,"") as PictureFileName, ifnull(a.Icon,"") as Icon, ifnull(a.IconFileName,"") as IconFileName,ifnull(doc.BRDocFilename,"") as BRDocFilename, ifnull(doc.BRDoc,"") as BRDoc,ifnull(doc.BRContentType,"") as BRContentType,b.Rating,ifnull(a.BusinessSize,0) as Size  from tmaster a left outer join tlocations b on a.TID = b.MasterID left outer Join tDocs c On a.TID=c.MasterID left outer join tdocs doc on a.TID= doc.MasterID where b.SeqNo=0  and a.EZEID=' + db.escape(EZEID);
                        db.query('Call pgetUserProfileAP('+db.escape(EZEID)+')', function (err, UserDetailsResult) {
                            if (!err) {
                                if (UserDetailsResult != null) {
                                    if (UserDetailsResult[0].length > 0) {
                                        //console.log('FnGetUserDetails: Token: ' + Token);
                                        console.log('FnGetUserDetailsAP : pgetUserProfileAP: User details sent successfully');
                                        //  console.log(UserDetailsResult);
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
                        res.statusCode=401;
                        res.json(null);
                        console.log("Invalid Token");
                    }
                }
                else
                {
                    res.statusCode=500;
                    res.json(null);
                    console.log("Error in validating the token: "+err);
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
        console.log('FnGetUserDetails error:' + ex.description);
          
    }
};

//method to udpate user profile based on ezeid
exports.FnUpdateUserProfileAP = function (req, res) {
    try {
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

        var EZEID = req.body.EZEID;
        var EZEIDVerifiedID = req.body.EZEIDVerifiedID;
        // var TID = parseInt(req.body.TID);
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

        var Keywords = req.body.Keywords;
        var Picture = req.body.Picture;
        var PictureFileName = req.body.PictureFileName;
        var Icon = req.body.Icon;
        var IconFileName = req.body.IconFileName;
        var BrochureDoc = req.body.BrochureDoc;
        var BrochureDocFile = req.body.BrochureDocFile;
        var ActiveInactive = req.body.ActiveInactive;
        var BRContentType = req.body.BRContentType;
        var Token = req.body.Token;
        var Rating = req.body.Rating;
        var Size = req.body.Size;
        var IDTypeId = req.body.IDTypeID;
        var SelectionType = req.body.SelectionType;
        var RtnMessage = {
            IsSuccessful: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (EZEID != null && Token != null && IDTypeId != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        if(IDTypeId == 1){
                            var InsertQuery = db.escape(0) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' +
                                db.escape(EZEIDVerifiedID) + ',' + db.escape(Token) + ',' + db.escape('') + ',' + db.escape('') + ',' + db.escape('') + ',' +
                                db.escape('') + ',' + db.escape('') + ',' + db.escape(EZEID) + ',' +
                                db.escape('') + ',' + db.escape('') + ',' + db.escape(0)+ ',' + db.escape('')+ ',' + db.escape(0) + ',' + db.escape(0)+ ',' + db.escape(IDTypeId) + ',' + db.escape(SelectionType);
                            // console.log(InsertQuery);
                            db.query('CALL pUpdateUserProfileAP(' + InsertQuery + ')', function (err, InsertResult) {
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
                            var InsertQuery = db.escape(CategoryID) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' +
                                db.escape(EZEIDVerifiedID) + ',' + db.escape(Token) + ',' + db.escape(Keywords) + ',' + db.escape(Picture) + ',' + db.escape(PictureFileName) + ',' +
                                db.escape(Icon) + ',' + db.escape(IconFileName) + ',' + db.escape(EZEID) + ',' +
                                db.escape(BrochureDoc) + ',' + db.escape(BrochureDocFile) + ',' + db.escape(ActiveInactive)+ ',' + db.escape(BRContentType)+ ',' + db.escape(Rating) + ',' + db.escape(Size)+ ',' + db.escape(IDTypeId)  + ',' + db.escape(SelectionType);
                            // console.log('InsertQuery: ' + InsertQuery);
                            db.query('CALL pUpdateUserProfileAP(' + InsertQuery + ')', function (err, InsertResult) {
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
        console.log('FnUpdateUserProfileAP error:' + ex.description);
          
    }
};

//method to change password
exports.FnChangePasswordAP = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var TokenNo = req.body.Token;
        var OldPassword = req.body.OldPassword;
        var NewPassword = req.body.NewPassword;
        var RtnMessage = {
            IsChanged: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (OldPassword != null && OldPassword != '' && NewPassword != null && NewPassword != '' && TokenNo != null) {
            FnValidateTokenAP(TokenNo, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var EncryptOldPWD = FnEncryptPassword(OldPassword);
                        var EncryptNewPWD = FnEncryptPassword(NewPassword);
                        var Query = db.escape(TokenNo) + ',' + db.escape(EncryptOldPWD) + ',' + db.escape(EncryptNewPWD);
                        db.query('CALL pChangePasswordAP(' + Query + ')', function (err, ChangePasswordResult) {
                            if (!err) {
                                //console.log(ChangePasswordResult);
                                if (ChangePasswordResult != null) {
                                    if (ChangePasswordResult.affectedRows > 0) {
                                        RtnMessage.IsChanged = true;
                                        res.send(RtnMessage);
                                        console.log('FnChangePassword:pChangePassword: PASSSWORD CHANGED SUCCESSFULLY');
                                    }
                                    else {
                                        res.send(RtnMessage);
                                        console.log('FnChangePassword:pChangePassword: Password changed failed');
                                    }
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('FnChangePassword:pChangePassword: Password changed failed ');
                                }
                            }
                            else {
                                res.send(RtnMessage);
                                console.log('FnChangePassword:pChangePassword:' + err);
                            }
                        });
                    } else {
                        res.send(RtnMessage);
                        console.log('FnChangePassword:pChangePassword: Invalid Token');
                        res.statusCode=401;
                    }
                } else {
                    res.send(RtnMessage);
                    console.log('FnChangePassword:pChangePassword: Error in validating token:  ' + err);
                    res.statusCode=500;
                }
            });
        }
        else {
            if (OldPassword == null) {
                console.log('FnChangePassword: OldPassword is empty');
            }
            else if (NewPassword == null) {
                console.log('FnChangePassword: NewPassword is empty');
            }
            else if (TokenNo == null) {
                console.log('FnChangePassword: TokenNo is empty');
            }
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnChangePassword error:' + ex.description);
          
    }
};

//method for forget password. in this method we are resetting the password and sending to user via mail.
exports.FnForgetPasswordAP = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LoginID = req.body.LoginID;
        var RtnMessage = {
            IsChanged: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (LoginID != null) {
            var Password = FnRandomPassword();
            var EncryptPWD = FnEncryptPassword(Password);
            var Query = 'Update tapuser set APPassword= ' + db.escape(EncryptPWD) + ' where APLoginID=' + db.escape(LoginID);
            // console.log('FnForgotPassword: ' + Query);
            db.query(Query, function (err, ForgetPasswordResult) {
                if (!err) {
                    //console.log(InsertResult);
                    if (ForgetPasswordResult != null) {
                        if (ForgetPasswordResult.affectedRows > 0) {
                            RtnMessage.IsChanged = true;
                            var UserQuery = 'Select ifnull(Fullname,"") as Fullname,APPassword,ifnull(EMailID,"") as EMailID from tapuser where APLoginID=' + db.escape(LoginID);
                            //  console.log(UserQuery);
                            db.query(UserQuery, function (err, UserResult) {
                                if (!err) {
                                    //  console.log(UserResult);

                                    var fs = require('fs');
                                    fs.readFile("ForgetPasswordTemplate.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[Firstname]", UserResult[0].Fullname);
                                        data = data.replace("[Lastname]", "");
                                        data = data.replace("[Password]", Password);

                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: UserResult[0].EMailID,
                                            subject: 'Password reset request',
                                            html: data // html body
                                        };

                                        // send mail with defined transport object
                                        //message Type 7 - Forgot password mails service
                                        var post = { MessageType: 7, ToMailID: mailOptions.to, Subject: mailOptions.subject, Body: mailOptions.html };
                                        // console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnRegistration: Mail saved Successfully');
                                                res.send(RtnMessage);
                                            }
                                            else {
                                                console.log('FnRegistration: Mail not Saved Successfully' + err);
                                                res.send(RtnMessage);
                                            }
                                        });
                                    });

                                    console.log('FnForgetPassword:tmaster: Password reset successfully');
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('FnForgetPassword: Email sending Fails: ' + err);
                                }
                            });

                        }
                        else {
                            res.send(RtnMessage);
                            console.log('FnForgetPassword:tmaster: Password reset  Failed');
                        }

                    }
                    else {
                        res.send(RtnMessage);
                        console.log('FnForgetPassword:tmaster: Password reset Failed');
                    }
                }
                else {

                    res.send(RtnMessage);
                    console.log('FnForgetPassword:tmaster:' + err);
                }
            });

        }
        else {
            console.log('FnForgetPasswordAP: EZEID is empty')
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnForgetPasswordAP error:' + ex.description);
          
    }
};

exports.FnGetEZEIDDetailsAP = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;
        var EZEID = req.query.EZEID;
        if (Token != null && EZEID != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pGetEZEIDDetailsForAP(' + db.escape(EZEID) + ')', function (err, UserDetailsResult) {
                            if (!err) {
                                if (UserDetailsResult != null) {
                                    if (UserDetailsResult[0].length > 0) {
                                        //console.log('FnGetUserDetails: Token: ' + Token);
                                        console.log('FnGetEZEIDDetailsAP : tmaster: User details sent successfully');
                                        res.send(UserDetailsResult[0]);
                                    }
                                    else {
                                        res.json(null);
                                        console.log('FnGetEZEIDDetailsAP : tmaster: No User details found');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetEZEIDDetailsAP : tmaster: No User details found');
                                }

                            }
                            else {
                                res.json(null);
                                console.log('FnGetEZEIDDetailsAP : tmaster:' + err);
                            }
                        });
                    } else {
                        res.send(RtnMessage);
                        console.log('FnGetEZEIDDetailsAP: Invalid Token');
                        res.statusCode=401;
                    }
                } else {
                    res.send(RtnMessage);
                    console.log('FnGetEZEIDDetailsAP: Error in validating token:  ' + err);
                    res.statusCode=500;
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetEZEIDDetailsAP: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnGetEZEIDDetailsAP: EZEID is empty');
            }
            res.json(null);

        }
    }
    catch (ex) {
        console.log('FnGetEZEIDDetailsAP error:' + ex.description);
          
    }
};

exports.FnSaveAPEZEID = function (req, res) {
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
        var EZEID = req.body.EZEID;
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

        FnValidateTokenAP(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    //console.log('FnRegistration: Token: ' + TokenNo);
                    var InsertQuery = db.escape(Type) + ',' + db.escape(Preffereduser) + ',' + db.escape(AreaSize) + ',' +db.escape(AreaUOM)
                        + ','  + db.escape(Rate) + ',' + db.escape(Amount) + ',' + db.escape(SpaceQty) + ',' + db.escape(SpaceType)
                        + ',' + db.escape(FunishedType) + ',' + db.escape(Description) + ',' + db.escape(Preferences) + ',' + db.escape(Rating)
                        + ',' +db.escape(EZEID) + ',' + db.escape(Status) + ',' + db.escape(Reason) + ',' + db.escape(tAvailableDate) + ',' + db.escape(Token)
                        + ',' + db.escape(APID) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' + db.escape(TID) + ',' + db.escape(Purpose)
                        + ',' + db.escape(NoCarParking) + ',' + db.escape(NoBikeParking) + ',' + db.escape(OwnerPayment) + ',' + db.escape(AgeOfProperty)
                        + ',' + db.escape(NoOfBathrooms) + ',' + db.escape(Gas) + ',' + db.escape(Lift)
                        + ',' + db.escape(Gym) + ',' + db.escape(SwimmingPool) + ',' + db.escape(Security) + ',' + db.escape(UPS);
                    // console.log(InsertQuery);
                    db.query('CALL psaveRealEstateData(' + InsertQuery + ')', function (err, InsertResult) {
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
        console.log('psaveRealEstateData error:' + ex.description);
          
    }
};

exports.FnSaveAPEZEIDPicture = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var PicNo = parseInt(req.body.PicNo);
        var Picture = req.body.Picture;
        var TID = parseInt(req.body.TID);
        var Token = req.body.Token;

        var RtnMessage = {
            TID: 0
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Picture != null && Picture != '' && PicNo.toString() != 'NaN' && TID.toString() != 'NaN') {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var InsertQuery = db.escape(TID) + ',' + db.escape(Picture) + ',' + db.escape(PicNo);
                        console.log(InsertQuery);
                        db.query('CALL psaveRealEstatePicture(' + InsertQuery + ')', function (err, InsertResult) {
                            if (!err) {
                                console.log(InsertResult);
                                if (InsertResult != null) {
                                    var insert = InsertResult[0];
                                    RtnMessage.TID = insert[0].TID;
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                }
                                else {
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnSaveAPEZEIDPicture:tmaster: Registration Failed');
                                }
                            }
                            else {

                                res.send(RtnMessage);
                                console.log('FnSaveAPEZEIDPicture:tmaster:' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveAPEZEIDPicture: Invalid Token')
                        res.send(RtnMessage);
                        res.statusCode=401;
                    }
                }
                else {
                    console.log('FnSaveAPEZEIDPicture: Error in processing Token' + err);
                    res.send(RtnMessage);
                    res.statusCode=500;
                }
            });
        }
        else {
            if (Picture != null || Picture != '') {
                console.log('FnSaveAPEZEIDPicture: Picture is empty');
            }
            else if (PicNo.toString() == 'NaN') {
                console.log('FnSaveAPEZEIDPicture: PicNo is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveAPEZEIDPicture: TID is empty');
            }
            res.send(RtnMessage);
        }


        //res.send(RtnMessage);
        //console.log('FnRegistration:tmaster: Manditatory field empty');

    }
    catch (ex) {
        console.log('FnSaveAPEZEIDPicture error:' + ex.description);
          
    }
};

exports.FnGetRealStateDataAP = function(req,res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = req.query.TID;
        var Token = req.query.Token;

        if(Token != null && TID != null){
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetRealEstateData(' + db.escape(TID)  + ')', function (err, RealStateResult) {
                            if (!err) {
                                // console.log(PictuerResult);
                                if (RealStateResult != null) {
                                    if (RealStateResult[0].length > 0) {
                                        res.send(RealStateResult[0]);
                                        console.log('FnGetRealStateDataAP: Realstate Data sent successfully');
                                    }
                                    else {
                                        res.json(null);
                                        console.log('FnGetRealStateDataAP:pGetRealEstateData: No real state data found');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetRealStateDataAP:pGetRealEstateData: No real state data found');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.json(null);
                                console.log('FnGetRealStateDataAP:pGetRealEstateData:' + err);
                            }
                        });
                    }
                    else
                    {
                        console.log('FnGetRealStateDataAP: Invalid Token');
                        res.statusCode=401;
                        res.json(null);
                    }
                }
                else
                {
                    console.log('FnGetRealStateDataAP: Error in validating token: '+err);
                    res.statusCode=500;
                    res.json(null);
                }
            });
        }
        else
        {
            if (Token == null) {
                console.log('FnGetRealStateDataAP: Token is empty');
            }
            else if (TID == null) {
                console.log('FnGetRealStateDataAP: TID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch(ex){
        console.log('FnGetRealStateDataAP error: ' + ex.description);
          
    }
}

exports.FnGetAPEZEIDPicture = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = parseInt(req.query.TID);
        var PicNo = parseInt(req.query.PicNo);
        var Token = req.query.Token;
        if (Token != null && TID.toString() != 'NaN' && PicNo.toString() != 'NaN') {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetRealEstatePicture(' + db.escape(TID) + ',' + db.escape(PicNo) + ')', function (err, PictuerResult) {
                            if (!err) {
                                // console.log(PictuerResult);
                                if (PictuerResult[0] != null) {
                                    if (PictuerResult[0].length > 0) {
                                        res.send(PictuerResult[0]);
                                        console.log('FnGetAPEZEIDPicture: Realstate Data sent successfully');
                                    }
                                    else {
                                        res.json(null);
                                        console.log('FnGetAPEZEIDPicture:pGetRealEstateData: No real state data found');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetAPEZEIDPicture:pGetRealEstateData: No real state data found');
                                }
                            }
                            else {

                                res.json(null);
                                console.log('FnGetAPEZEIDPicture:pGetRealEstateData:' + err);
                            }
                        });

                    } else {
                        res.json(null);
                        console.log('FnGetAPEZEIDPicture: Invalid Token');
                        res.statusCode=401;
                    }
                } else {
                    res.json(null);
                    console.log('FnGetAPEZEIDPicture: Error in validating token:  ' + err);
                    res.statusCode=500;
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetAPEZEIDPicture: Token is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnGetAPEZEIDPicture: TID is empty');
            }
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetAPEZEIDPicture error:' + ex.description);
          
    }
};

exports.FnSaveBannerPictureAP = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var SeqNo = parseInt(req.body.SeqNo);
        var Picture = req.body.Picture;
        var Token = req.body.Token;
        var Ezeid = req.body.Ezeid;
        var TID = req.body.TID;
        if(TID == null ){
            TID = 0;
        }
        var RtnMessage = {
            IsSaved: false,
            TID: 0
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null && Picture != null  && SeqNo.toString() != 'NaN' && Ezeid != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var InsertQuery = db.escape(Ezeid)  + ',' + db.escape(SeqNo) + ',' + db.escape(Picture) + ',' + db.escape(TID);
                        //console.log(InsertQuery);
                        db.query('CALL PSaveBannerPics(' + InsertQuery + ')', function (err, InsertResult) {
                            if (!err) {
                                console.log(InsertResult);
                                if (InsertResult != null) {
                                    var InsertData = InsertResult[0];
                                    RtnMessage.IsSaved =true;
                                    RtnMessage.TID=InsertData[0].TID;
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);

                                }
                                else {
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnSaveBannerPicture:tmaster: Banner Save Failed');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.send(RtnMessage);
                                console.log('FnSaveBannerPicture:tmaster:' + err);
                            }
                        });
                    }
                    else {
                        res.statusCode=401;
                        console.log('FnSaveBannerPicture: Invalid Token')
                        res.send(RtnMessage);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnSaveBannerPicture: Error in processing Token' + err);
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Picture != null || Picture != '') {
                console.log('FnSaveBannerPicture: Picture is empty');
            }
            else if (SeqNo.toString() == 'NaN') {
                console.log('FnSaveBannerPicture: SeqNo is empty');
            }
            else if(Token == null) {
                console.log('FnSaveBannerPicture: Token is empty');
            }else if(Ezeid == null) {
                console.log('FnSaveBannerPicture: Ezeid is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveBannerPicture error:' + ex.description);
          
    }
}

exports.FnGetBannerPictureAP = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var SeqNo = parseInt(req.query.SeqNo);
        var Token = req.query.Token;
        var Ezeid = req.query.Ezeid;

        if (Token != null  && SeqNo.toString() != 'NaN' && Ezeid != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var Query = db.escape(Ezeid)  + ',' + db.escape(SeqNo);
                        //console.log(InsertQuery);
                        db.query('CALL PGetBannerPics(' + Query + ')', function (err, BannerResult) {
                            if (!err) {
                                //console.log(InsertResult);
                                if (BannerResult != null) {
                                    if(BannerResult[0].length > 0){
                                        var Picture = BannerResult[0];
                                        console.log('FnGetBannerPicsAP:tmaster: Banner Picture send sucessfully ');
                                        res.send(Picture[0]);
                                    }
                                    else
                                    {
                                        res.json(null);
                                        console.log('FnGetBannerPicsAP:tmaster: No Banner Picture send sucessfully ');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetBannerPicsAP:tmaster: No Banner Picture send sucessfully ');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.json(null);
                                console.log('FnGetBannerPicsAP:tmaster:' + err);
                            }
                        });
                    }
                    else {
                        res.statusCode=401;
                        console.log('FnGetBannerPicsAP: Invalid Token')
                        res.json(null);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnGetBannerPicsAP: Error in processing Token' + err);
                    res.json(null);
                }
            });
        }
        else {
            if (SeqNo.toString() == 'NaN') {
                console.log('FnGetBannerPicsAP: SeqNo is empty');
            }
            else if(Token == null) {
                console.log('FnGetBannerPicsAP: Token is empty');
            }else if(Ezeid == null) {
                console.log('FnGetBannerPicsAP: Ezeid is empty');
            }
            res.statusCode=400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetBannerPicsAP error:' + ex.description);
          
    }
}

exports.FnGetAllBannerPicsAP = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;
        var EZEID = req.query.EZEID;

        if (Token != null && EZEID != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var Query = db.escape(EZEID);
                        //console.log(InsertQuery);
                        db.query('CALL pGetAllBannerPics(' + Query + ')', function (err, BannerResult) {
                            console.log(err);

                            if (!err) {
                                //console.log(InsertResult);
                                if (BannerResult != null) {
                                    //if(BannerResult[0].length > 0){
                                    //var Picture = BannerResult;
                                    console.log('FnGetAllBannerPicsAP:tmaster: Banner Picture send sucessfully ');
                                    //res.send(Picture);
                                    res.send(BannerResult[0]);
                                }
                                else
                                {
                                    res.json(null);
                                    console.log('FnGetAllBannerPicsAP:tmaster: No Banner Picture send sucessfully ');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.json(null);
                                console.log('FnGetAllBannerPicsAP:tmaster:' + err);
                            }
                        });
                    }
                    else {
                        res.statusCode=401;
                        console.log('FnGetAllBannerPicsAP: Invalid Token')
                        res.json(null);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnGetAllBannerPicsAP: Error in processing Token' + err);
                    res.json(null);
                }
            });
        }
        else {
            if(Token == null) {
                console.log('FnGetAllBannerPicsAP: Token is empty');
            }else if(Ezeid == null) {
                console.log('FnGetAllBannerPicsAP: Ezeid is empty');
            }
            res.statusCode=400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetAllBannerPicsAP error:' + ex.description);
          
    }
}

exports.FnGetSecondaryLocationListAP = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var Ezeid = req.query.EZEID;

        if (Token != null && Ezeid != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var Query = 'select TID,LocTitle from tlocations where SeqNo>0 and  EZEID=' + db.escape(Ezeid);
                        db.query(Query, function (err, Result) {
                            if (!err) {
                                if (Result.length > 0) {
                                    console.log("FnGetSecondaryLocationList: Location send successfully");
                                    res.send(Result);
                                }
                                else
                                {
                                    console.log("FnGetSecondaryLocationList: Location send failed");
                                    res.json(null);
                                }
                            }
                            else
                            {
                                res.statusCode=500;
                                res.json(null);
                                console.log('FnGetSecondaryLocationList: error in getting secondary location list'+err);
                            }
                        });

                    }
                    else {
                        res.statusCode=401;
                        console.log('FnGetSecondaryLocationList: Invalid Token')
                        res.json(null);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnGetSecondaryLocationList: Error in processing Token' + err);
                    res.json(null);
                }
            });
        }
        else
        {
            res.statusCode=400;
            res.json(null);
            if(Token == null){
                console.log('FnGetSecondaryLocationList: token is empty');
            }
            else if(Ezeid == null) {
                console.log('FnGetSecondaryLocationList: Ezeid is empty');
            }

            console.log('FnGetSecondaryLocationList: Mandatory field is empty');

        }
    }
    catch (ex) {
        console.log('FnGetSecondaryLocationList:' + ex.description);
          
    }
}

exports.FnGetSecondaryLocationAP = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var Ezeid = req.query.EZEID;
        var Locid = req.query.LocID;

        if (Token != null && Ezeid != null && Locid!=null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var Query = 'select TID, ifnull(LocTitle,"") as LocTitle, Latitude, Longitude, Picture, PictureFileName, Rating from tlocations where SeqNo > 0 and  EZEID=' + db.escape(Ezeid) +' and TID = ' + db.escape(Locid);
                        db.query(Query, function (err, Result) {
                            if (!err) {
                                if (Result.length > 0) {
                                    console.log("FnGetSecondaryLocationListAP:Location send successfully");
                                    res.send(Result);
                                }
                                else
                                {
                                    console.log("FnGetSecondaryLocationListNew:Location send failed");
                                    res.json(null);
                                }
                            }
                            else
                            {
                                res.statusCode=500;
                                res.json(null);
                                console.log('FnGetSecondaryLocationAP: error in getting secondary locationAP'+err);
                            }
                        });
                    }
                    else {
                        res.statusCode=401;
                        console.log('FnGetSecondaryLocationAP: Invalid Token')
                        res.json(null);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnGetSecondaryLocationAP: Error in processing Token' + err);
                    res.json(null);
                }
            });
        }
        else
        {
            res.statusCode=400;
            res.json(null);
            if(Token == null){
                console.log('FnGetSecondaryLocationAP: token is empty');
            }
            else if(Ezeid == null) {
                console.log('FnGetSecondaryLocationAP: Ezeid is empty');
            }
            else if(Locid == null) {
                console.log('FnGetSecondaryLocationAP: Locationid is empty');
            }

            console.log('FnGetSecondaryLocationAP: Mandatory field is empty');

        }
    }
    catch (ex) {
        console.log('FnGetSecondaryLocationAP:' + ex.description);
          
    }
}

exports.FnUpdateSecondaryLocationAP = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var Locid =req.body.LocID;
        var LocTitle = req.body.LocTitle;
        var Latitude = parseFloat(req.body.Latitude);
        var Longitude = parseFloat(req.body.Longitude);
        var Picture = req.body.Picture;
        var PictureFileName = req.body.PictureFileName;
        var Rating =req.body.Rating;
        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null && Locid != null && LocTitle != null && Longitude.toString() != 'NaN' && Latitude.toString() != 'NaN' && Picture != null && PictureFileName!=null && Rating != null ) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = db.escape(Locid) + ',' + db.escape(LocTitle) + ',' + db.escape(Picture) + ',' + db.escape(PictureFileName) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' + db.escape(Rating);
                        db.query('CALL pUpdateSecondaryLocationAP(' + query + ')', function (err, UpdateResult) {
                            if (!err){
                                if (UpdateResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateSecondaryLocationAP:Update successfully');
                                }
                                else {
                                    console.log('FnUpdateSecondaryLocationAP:Update failed');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnUpdateSecondaryLocationAP: error in Updating secondary LocationAP' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateSecondaryLocationAP: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnUpdateSecondaryLocationAP:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnUpdateSecondaryLocationAP: Token is empty');
            }
            else if (Locid == null) {
                console.log('FnUpdateSecondaryLocationAP: Locid is empty');
            }
            else if (LocTitle == null) {
                console.log('FnUpdateSecondaryLocationAP: LocTitle is empty');
            }
            else if (Latitude.toString() == 'NaN') {
                console.log('FnUpdateSecondaryLocationAP: latitude is empty');
            }
            else if (Longitude.toString() == 'NaN') {
                console.log('FnUpdateSecondaryLocationAP: longitude is empty');
            }
            else if(Picture == null) {
                console.log('FnUpdateSecondaryLocationAP: Picture is empty');
            }
            else if(PictureFileName == null) {
                console.log('FnUpdateSecondaryLocationAP: PictureFileName is empty');
            }
            else if(Rating == null) {
                console.log('FnUpdateSecondaryLocationAP: Rating is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnUpdateSecondaryLocationAP:' + ex.description);
          
    }
}

exports.FnUpdateIdCardPrintAP = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var EZEID =req.body.EZEID;

        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null && EZEID != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(EZEID) + ',' + db.escape(Token);
                        db.query('CALL pUpdateIDCardAP(' + query + ')', function (err, UpdateIdResult) {
                            if (!err){
                                if (UpdateIdResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateIdCardPrintAP:Id card details Update successfully');
                                }
                                else {
                                    console.log('FnUpdateIdCardPrintAP:Id card details Update failed');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnUpdateIdCardPrintAP: error in Updating Id card detailsAP' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateIdCardPrintAP: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnUpdateIdCardPrintAP:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnUpdateIdCardPrintAP: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnUpdateIdCardPrintAP: Ezeid is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnUpdateIdCardPrintAP:error ' + ex.description);
          
    }
};

exports.FnGetIdCardPrintAP = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;
        var EZEID = req.query.EZEID;
        if (Token != null && EZEID != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetIDCardDetailsAP(' + db.escape(EZEID) + ')', function (err, SecLocationResult) {
                            if (!err) {
                                if (SecLocationResult != null) {
                                    if (SecLocationResult[0].length > 0) {
                                        console.log('FnGetIdCardPrintAP: ID Card details Sent successfully');
                                        res.send(SecLocationResult[0]);
                                    }
                                    else {
                                        console.log('FnGetIdCardPrintAP:No ID Card Details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetIdCardPrintAP:No ID Card Details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetIdCardPrintAP: error in getting ID Card DetailsAP' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetIdCardPrintAP: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetIdCardPrintAP: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetIdCardPrintAP: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnGetIdCardPrintAP: EZEID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetEZEIDDetailsAP error:' + ex.description);
          
    }
};

exports.FnSearchRealEstateAP = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Status = req.body.Status;
        var Purpose = parseInt(req.body.Purpose);
        var PropertyType = req.body.PropertyType;
        var PrefUser = req.body.PrefUser;
        var SpaceType = req.body.SpaceType;
        var SpaceQtyF = req.body.SpaceQtyFrom;
        var SpaceQtyT = req.body.SpaceQtyTo;
        var RatingFrom = req.body.RatingFrom;
        var RatingTo = req.body.RatingTo;
        var Latitude = req.body.Latitude;
        if (Latitude == null || Latitude == '') {
            Latitude = 0.0;
        }
        var Longitude = req.body.Longitude;
        if (Longitude == null || Longitude == '') {
            Longitude = 0.0;
        }
        var Proximity = req.body.Proximity;
        var AreaUOM = req.body.AreaUOM;
        var AreaFrom = req.body.AreaFrom;
        var AreaTo = req.body.AreaTo;
        var FunishedType = req.body.FunishedType;
        var AmountFrom = req.body.AmountFrom;
        var AmountTo = req.body.AmountTo;
        var Token = req.body.Token;
        var AgeFrom = req.body.AgeFrom;
        var AgeTO = req.body.AgeTO;
        var NoOfBathrooms = req.body.NoOfBathrooms;
        var Gas = req.body.Gas;
        var Lift = req.body.Lift;
        var Gym = req.body.Gym;
        var SwimmingPool = req.body.SwimmingPool;
        var Security = req.body.Security;
        var UPS = req.body.UPS;



        /*if (Status!=null && Purpose.toString() != 'NaN' && PropertyType!=null && PrefUser!=null && SpaceType !=null && SpaceQtyF !=null && SpaceQtyT !=null && RatingFrom !=null
         && RatingTo !=null && Latitude !=null && Longitude !=null && Proximity !=null && AreaUOM !=null && AreaFrom !=null
         && AreaTo !=null && FunishedType !=null && AmountFrom !=null && AmountTo !=null) {*/
        FnValidateTokenAP(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {

                    var SearchQuery = db.escape(Status) + ',' + db.escape(Purpose) + ',' + db.escape(PropertyType) + ',' + db.escape(PrefUser) + ',' +
                        db.escape(SpaceType) + ',' + db.escape(SpaceQtyF) + ',' + db.escape(SpaceQtyT) + ',' + db.escape(RatingFrom) + ',' + db.escape(RatingTo) + ',' +
                        db.escape(Latitude) + ',' + db.escape(Longitude) + ',' + db.escape(Proximity) + ',' +db.escape(AreaUOM) + ',' + db.escape(AreaFrom) + ',' +
                        db.escape(AreaTo) + ',' + db.escape(FunishedType) + ',' + db.escape(AmountFrom) + ',' + db.escape(AmountTo) + ',' +
                        db.escape(AgeFrom) + ',' + db.escape(AgeTO) + ',' + db.escape(NoOfBathrooms) + ',' +
                        db.escape(Gas) + ',' + db.escape(Lift) + ',' + db.escape(Gym) + ',' + db.escape(SwimmingPool)
                        + ',' + db.escape(Security) + ',' + db.escape(UPS);

                    console.log(SearchQuery);

                    db.query('CALL pSearchRealEstateData(' + SearchQuery + ')', function (err, SearchResult) {
                        if (!err) {
                            if (SearchResult[0] != null) {
                                if (SearchResult[0].length > 0) {
                                    res.send(SearchResult[0]);
                                    console.log('FnSearchRealEstateAP:Search result sent successfully');
                                }
                                else {
                                    res.json(null);
                                    console.log('FnSearchRealEstateAP: No search found');
                                }
                            }
                            else {
                                res.json(null);
                                console.log('FnSearchRealEstateAP:No search found');
                            }

                        }
                        else {
                            res.statusCode = 500;
                            res.json(null);
                            console.log('FnSearchRealEstateAP: error in getting search RealEstateData' + err);
                        }
                    });
                }
                else {
                    res.statusCode = 401;
                    console.log('FnSearchRealEstateAP: Invalid token');
                    res.json(null);
                }
            }
            else {
                console.log('FnSearchRealEstateAP: Error in validating token:' + err);
                res.statusCode = 500;
                res.json(null);
            }
        });
    }
    catch (ex) {
        console.log('FnSearchRealEstateAP error:' + ex.description);
          
    }
};

exports.Base64Data = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var RtnResponse = {
            IsSent: false
        };
        var RtnResponse = JSON.parse(JSON.stringify(RtnResponse));
        //var path = path + StateTitle+'.jpg' ;
        var bitmap = fs.readFileSync("D:\\images\\Product1.jpg");
        // convert binary data to base64 encoded string
        RtnResponse.Picture = new Buffer(bitmap).toString('base64');
        res.send(RtnResponse);
        console.log('Base64Data: Default Banner sent successfully');

    }
    catch (ex) {
        console.log('OTP fnCreateFile error:' + ex.description);
          
        return 'error'
    }
};

exports.FnUpdateRedFlagAP = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var RedFlag = req.body.RedFlag;
        var Token = req.body.Token;
        var FromEZEID =req.body.FromEZEID;
        var ToEZEID =req.body.ToEZEID;
        var Message =req.body.Message;


        var RtnMessage = {
            IsUpdated: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (FromEZEID != null && ToEZEID != null && Token != null && RedFlag !=null && Message != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = db.escape(FromEZEID) + ',' + db.escape(ToEZEID) + ',' + db.escape(Token) + ',' + db.escape(RedFlag) + ',' +db.escape(Message);
                        db.query('CALL pUpdateRedFlagAP(' + query + ')', function (err, UpdateRedflagResult) {
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
        console.log('FnUpdateRedFlagAP:error ' + ex.description);
          
    }
}

exports.FnUpdateEZEIDAP = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var OldEZEID = req.body.OldEZEID;
        var NewEZEID = req.body.NewEZEID;
        var RtnMessage = {
            IsChanged: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && OldEZEID != null && OldEZEID != '' && NewEZEID != null && NewEZEID != '') {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var Query = db.escape(OldEZEID) + ',' + db.escape(NewEZEID) + ',' + db.escape(Token);
                        db.query('CALL pUpdateEZEIDAP(' + Query + ')', function (err, ChangeEZEIDResult) {
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
        console.log('FnUpdateEZEIDAP error:' + ex.description);
          
    }
};

exports.FnDeleteBannerPictureAP = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var EZEID = req.body.EZEID;
        var SeqNo = req.body.SeqNo;
        var RtnMessage = {
            IsSuccessfull: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token !=null && EZEID != null && SeqNo !=null)  {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(SeqNo) + ',' + db.escape(EZEID);
                        db.query('CALL pDeleteBanner(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnDeleteBannerPictureAP: Banner Picture delete successfully');
                                }
                                else {
                                    console.log('FnDeleteBannerPictureAP:No delete Banner Picture');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnDeleteBannerPictureAP: error in deleting Banner Picture' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteBannerPictureAP: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteBannerPictureAP:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnDeleteBannerPictureAP: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnDeleteBannerPictureAP: EZEID is empty');
            }
            else if (SeqNo == null) {
                console.log('FnDeleteBannerPictureAP: SeqNo is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnDeleteBannerPictureAP:error ' + ex.description);
          
    }
};

exports.FnCropImageAP = function(req,res){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var fs = require('fs');

    console.log(req.files.image.path);
    var deleteTempFile = function(){
        fs.unlink('../bin/uploads/'+req.files.image.path);
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

    var  targetHeight = (req.body.required_height) ? (!isNaN(parseInt(req.body.required_height)) ? parseInt(req.body.required_height) : 0 ) : 0  ,
        targetWidth = (req.body.required_width) ? (!isNaN(parseInt(req.body.required_width)) ? parseInt(req.body.required_width) : 0 ) : 0  ;


    var scaleHeight = null,scaleWidth = null;

    var cropFlag = (req.body.crop) ? req.body.crop : true;
    var scaleFlag = (req.body.scale) ? req.body.scale : true;
    var token = (req.body.Token && req.body.Token !==2 ) ? req.body.Token : '';
    var outputType = (allowedTypes.indexOf(req.body.output_type) == -1) ? 'png' : req.body.output_type;

    if(!(targetHeight && targetWidth)){
        respMsg.message = 'Invalid target dimensions';
        respMsg.error = {
            required_height : (targetHeight) ? 'Invalid target height' : null,
            required_width : (targetWidth) ? 'Invalid target width' : null
        };
        res.status(400).json(respMsg);
        deleteTempFile();
        return;
    }

    if(!token){
        respMsg.message = 'Please login to continue';
        respMsg.error = {
            Token : 'Token is invalid'
        };
        res.status(401).json(respMsg);
        deleteTempFile();
        return;
    }

    FnValidateTokenAP(token, function (err, Result) {
        if (!err) {
            if (Result != null) {
                try{
                    console.log(req.files.image.path);
                    //var bitmap = fs.readFileSync('../bin/'+req.files.image.path);

                    fs.readFile('../bin/'+ req.files.image.path,function(err,data){
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
                                                console.log("executing condition 1 : sOrient: landscape & scale++ & tOrient : potrait");
                                                scaleHeight = targetHeight.toString();
                                                ////
                                                scaleWidth = (size.width * scaleHeight)/ size.height;
                                            }
                                            else{
                                                console.log("executing condition 2 : sOrient: landscape & scale++ & tOrient : landscape");
                                                scaleWidth = targetWidth.toString();
                                                ////
                                                scaleHeight = (size.height * scaleWidth) / size.width;
                                            }
                                        }
                                        // scale--
                                        else{
                                            if(targetHeight > targetWidth){
                                                console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : landscape");
                                                scaleWidth = targetWidth.toString();
                                                ////
                                                scaleHeight = (scaleWidth * size.height)/ size.width;
                                            }
                                            else{

                                                console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : potrait");
                                                scaleHeight = targetHeight.toString();
                                                ////
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
                                            ////
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
                                                    res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                                }
                                                else{
                                                    res.status(400).json(respMsg);
                                                }
                                            });

                                    }

                                    else if(scaleFlag && !cropFlag){
                                        gm(bitmap)
                                            .resize(scaleWidth,scaleHeight).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                                if(!err){
                                                    var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                                    var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                                    res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                                }
                                                else{
                                                    res.status(400).json(respMsg);
                                                }
                                            });

                                    }

                                    else if(!scaleFlag && cropFlag){
                                        gm(bitmap)
                                            .crop(targetWidth,targetHeight,0,0).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                                if(!err){
                                                    var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                                    var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                                    res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                                }
                                                else{
                                                    res.status(400).json(respMsg);
                                                }
                                            });
                                    }
                                }
                                else{
                                    throw new Error('FnCropImage : '+ 'Invalid image file. Unable to find image size');
                                    res.status(400).json(respMsg);
                                }
                            });
                        }
                        else{
                            res.status(400).json(respMsg);
                            throw new Error('FnCropImage : Error in reading file '+ ex.description);
                        }
                    });

                }
                catch(ex){
                    console.log(ex);
                    res.status(400).json(respMsg);
                    throw new Error('FnCropImage : '+ ex.description);
                }
            }
            else{
                respMsg.message = 'Please login to continue';
                respMsg.error = {
                    Token : 'Token is invalid'
                };
                res.status(401).json(respMsg);
                throw new Error('FnCropImage : '+ 'Invalid Token');
            }
        }
        else{
            throw new Error('FnCropImage : '+ 'Error in query execution while validating token');
            res.status(400).json(respMsg);
        }
    });
};


//EZEID VAS

exports.FnLoginVES = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var EZEID = req.query.EZEID;
        var Password = req.query.Password;
        if (EZEID != null && EZEID != '' && Password != null && Password != '') {
            //var EncryptPWD = FnEncryptPassword(Password);
            //console.log('Encrypt password' +EncryptPWD);
            db.query('CALL pLoginVES(' + db.escape(EZEID) + ',' + db.escape(Password) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult != null) {
                        if (GetResult[0].length > 0) {
                            console.log('FnLoginVES: LoginVES details Send successfully');
                            res.send(GetResult[0]);
                        }
                        else {
                            console.log('FnLoginVES:No LoginVES Details found');
                            res.json(null);
                        }
                    }
                    else {
                        console.log('FnLoginVES:No LoginVES Details found');
                        res.json(null);
                    }
                }
                else {
                    console.log('FnLoginVES: error in getting LoginVES details' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });
        }
        else {
            if (EZEID == null) {
                console.log('FnLoginVES: EZEID is empty');
            }
            if (Password == null) {
                console.log('FnLoginVES: Password is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnLoginVES error:' + ex.description);
          
    }
};

exports.FnSaveContactVES = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var EZEID = req.body.EZEID;
        var Pic = req.body.Pic;
        var FirstName = req.body.FirstName;
        var LastName = req.body.LastName;
        var PhoneNo = req.body.PhoneNo;
        var MobileNo = req.body.MobileNo;
        var EmailID = req.body.EmailID;
        var CompanyName = req.body.CompanyName;
        var Address1 = req.body.Address1;
        var Address2 = req.body.Address2;
        var CountryID = req.body.CountryID;
        var StateID = req.body.StateID;
        var City = req.body.City;
        var PostalCode = req.body.PostalCode;
        var Synced = req.body.Synced;
        var ContactID = req.body.ContactID;
        var LaptopSLNO = req.body.LaptopSLNO;
        var VehicalTypeNo = req.body.VehicalTypeNo;
        var InTime = req.body.InTime;
        var OutTime = req.body.OutTime;
        var ContactDeptID = req.body.ContactDeptID;
        var PassReturned = req.body.PassReturned;
        var Status = req.body.Status;
        var GateNo  = req.body.GateNo;
        var SyncedInout = req.body.SyncedInout;
        var ContactEZEID = req.body.ContactEZEID;
        var ContactName = req.body.ContactName;
        var InTimeNew = new Date(InTime);

        if(OutTime != null){
            var OutTimeNew = new Date(OutTime);
        }
        else{
            var OutTimeNew=null;
        }
        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && EZEID != null && ContactID != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(EZEID) + ',' + db.escape(Pic) + ',' + db.escape(FirstName) + ',' +db.escape(LastName)
                            + ',' +db.escape(PhoneNo) + ',' +db.escape(MobileNo) + ',' +db.escape(EmailID) + ',' +db.escape(CompanyName)
                            + ',' +db.escape(Address1) + ',' +db.escape(Address2) + ',' +db.escape(CountryID) + ',' +db.escape(StateID) + ',' +db.escape(City)
                            + ',' + db.escape(PostalCode) + ',' + db.escape(Synced) + ',' + db.escape(ContactID) + ',' +db.escape(LaptopSLNO) + ',' +db.escape(VehicalTypeNo)
                            + ',' + db.escape(InTimeNew) + ',' + db.escape(OutTimeNew) + ',' + db.escape(ContactDeptID) + ',' + db.escape(PassReturned) + ',' + db.escape(Status)
                            + ',' + db.escape(GateNo) + ',' + db.escape(SyncedInout) + ',' + db.escape(ContactEZEID) + ',' + db.escape(ContactName);
                        db.query('CALL pSaveContactVES(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveContactVES:  Contact details save successfully');
                                }
                                else {
                                    console.log('FnSaveContactVES:No Save Contact details');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnSaveContactVES: error in saving Contact details' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveContactVES: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveContactVES:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnSaveContactVES: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnSaveContactVES: EZEID is empty');
            }
            else if (ContactID == null) {
                console.log('FnSaveContactVES: ContactID is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveContactVES:error ' + ex.description);
          
    }
};

exports.FnGetAllContactsVES = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;
        var Date1 = req.query.Date1;
        var Date2 = req.query.Date2;
        var DateNew1 = new Date(Date1);
        var DateNew2 = new Date(Date2);

        if (Token != null && DateNew1 !=null && DateNew2 != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(DateNew1) + ',' + db.escape(DateNew2);
                        db.query('CALL pGetAllContactsVES(' + query + ')', function (err, GetResult) {

                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetAllContactsVES: ContactsVES details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetAllContactsVES:No ContactsVES details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetAllContactsVES:No ContactsVES details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetAllContactsVES: error in getting ContactsVES details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetAllContactsVES: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetAllContactsVES: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetAllContactsVES: Token is empty');
            }
            else if (DateNew1 == null) {
                console.log('FnGetAllContactsVES: Date1 is empty');
            }
            else if (DateNew2 == null) {
                console.log('FnGetAllContactsVES: Date2 is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetAllContactsVES error:' + ex.description);
          
    }
};

exports.FnGetDepartmentVES = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var MasterID = req.query.MasterID;
        if (MasterID != null) {
            var Query = 'Select TID,DeptName from mdept where MasterID=' + db.escape(MasterID);
            //var MaxQuery = 'Select max(TID) as ID from  mdept';

            db.query(Query, function (err, DeptResult) {
                if (!err) {
                    if (DeptResult.length > 0) {
                        res.send(DeptResult);
                        console.log('FnGetDepartmentVES: Departments details sent successfully');
                    }
                    else {
                        res.json(null);
                        res.statusCode = 500;
                        console.log('FnGetDepartmentVES: No Departments details found');
                    }
                }
                else {
                    res.json(null);
                    console.log('FnGetDepartmentVES: ' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetDepartmentVES: MasterID is empty');
        }


    }
    catch (ex) {
        console.log('FnGetDepartmentVES error:' + ex.description);
          
    }
};

exports.FnGetContactVES = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;
        var TID = req.query.TID;

        if (Token != null && TID != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pGetContactVES(' + db.escape(Token) + ',' + db.escape(TID) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetContactsVES: ContactsVES details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetContactsVES:No ContactsVES details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetContactsVES:No ContactsVES details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetContactsVES: error in getting ContactsVES details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetContactsVES: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetContactsVES: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetContactsVES: Token is empty');
            }
            else if (TID == null) {
                console.log('FnGetContactsVES: TID is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetContactsVES error:' + ex.description);
          
    }
};

exports.FnSearchContactsVES = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var Date1 = req.query.Date1;
        var Date2 = req.query.Date2;
        var Status = req.query.Status;
        var Keywords = req.query.Keywords;
        var Type = req.query.Type;
        var DateNew1 = new Date(Date1);
        var DateNew2 = new Date(Date2);

        if (Token != null && DateNew1 !=null && DateNew2 != null && Status !=null && Keywords != null && Type !=null) {

            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var SearchParameter = db.escape(Token) + ',' + db.escape(DateNew1) + ',' + db.escape(DateNew2) + ',' + db.escape(Status) + ',' + db.escape(Keywords) + ',' + db.escape(Type);

                        db.query('CALL pSearchContactsVES(' + SearchParameter + ')', function (err, Result) {
                            if (!err) {
                                if (Result[0].length > 0) {
                                    res.send(Result[0]);
                                    console.log('FnSearchContactsVES: Search result sent successfully');
                                }
                                else {
                                    res.json(null);
                                    console.log('FnSearchContactsVES: No search found');
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.json(null);
                                console.log('FnSearchContactsVES: error in getting search contact' + err);
                            }
                        });

                    }
                    else {
                        console.log('FnSearchContactsVES: Invalid token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnSearchContactsVES: Token error: ' + err);
                    res.statusCode = 500;
                    res.json(null);

                }
            });
        }

        else {
            if (Token == null) {
                console.log('FnSearchContactsVES: Token is empty');
            }
            else if (DateNew1 == null) {
                console.log('FnSearchContactsVES: Date1 is empty');
            }
            else if (DateNew2 == null) {
                console.log('FnSearchContactsVES: Date2 is empty');
            }
            else if (Status == null) {
                console.log('FnSearchContactsVES: Status is empty');
            }
            else if (Keywords == null) {
                console.log('FnSearchContactsVES: Keywords is empty');
            }
            else if (Type == null) {
                console.log('FnSearchContactsVES: Type is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnSearchContactsVES error:' + ex.description);
          
    }
};

exports.FnCheckPasswordVES  = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Password = req.query.Password;
        if (Password != null) {
            var Query = 'Select TID from tmaster where StatusID=1 and VESPassword=' + db.escape(Password);
            db.query(Query, function (err, PasswordResult) {
                if (!err) {
                    if (PasswordResult.length > 0) {
                        res.send(PasswordResult);
                        console.log('FnCheckPasswordVES : Password check details sent successfully');
                    }
                    else {
                        res.json(null);
                        res.statusCode = 500;
                        console.log('FnCheckPasswordVES : No Password check details found');
                    }
                }
                else {
                    res.json(null);
                    console.log('FnCheckPasswordVES : error in getting check password' + err);
                }
            });
        }
        else {
            if (Password == null) {
                console.log('FnCheckPasswordVES: Password is empty');
            }

            res.statusCode=400;
            res.json(null);
        }


    }
    catch (ex) {
        console.log('FnCheckPasswordVES : error:' + ex.description);
          
    }
};

exports.FnGetGatesVES = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var MasterID = req.query.MasterID;
        if (MasterID != null) {
            var Query = 'Select TID,GateNo from mgates where MasterID=' + db.escape(MasterID);
            db.query(Query, function (err, Result) {
                if (!err) {
                    if (Result.length > 0) {
                        res.send(Result);
                        console.log('FnGetGatesVES: GatesVES details sent successfully');
                    }
                    else {
                        res.json(null);
                        res.statusCode = 500;
                        console.log('FnGetGatesVES: No GatesVES details found');
                    }
                }
                else {
                    res.json(null);
                    console.log('FnGetGatesVES: ' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetGatesVES: MasterID is empty');
        }


    }
    catch (ex) {
        console.log('FnGetGatesVES error:' + ex.description);
          
    }
};

exports.FnSaveDepartmentsVES = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var Name = req.body.Name;
        var TID = parseInt(req.body.TID);

        var RtnMessage = {
            IsSuccessfull: false,
            TID:0
        };
        if(TID.toString() == 'NaN')
            TID = 0;

        if (Token != null && Name != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(Name) + ',' + db.escape(TID);
                        db.query('CALL pSaveDepartments(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                //console.log(InsertResult);
                                if (InsertResult != null) {
                                    if (InsertResult[0].length > 0) {
                                        RtnMessage.IsSuccessfull = true;
                                        var Insert = InsertResult[0];
                                        RtnMessage.TID=Insert[0].TID;
                                        res.send(Insert);
                                        //res.send(RtnMessage);
                                        console.log('FnSaveDepartmentsVES: DepartmentsVES details saved successfully');
                                    }
                                    else {
                                        res.send(RtnMessage);
                                        console.log('FnSaveDepartmentsVES: DepartmentsVES details Saving Failed');
                                    }
                                }
                                else {
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnSaveDepartmentsVES: DepartmentsVES details saving Failed');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.send(RtnMessage);
                                console.log('FnSaveDepartmentsVES: Error in getting DepartmentsVES details' + err);
                            }
                        });

                    }
                    else {
                        res.statusCode=401;
                        console.log('FnSaveDepartmentsVES: Invalid Token')
                        res.send(RtnMessage);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnSaveDepartmentsVES: Error in processing Token' + err);
                    res.send(RtnMessage);
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnSaveDepartmentsVES: Token is empty');
            }
            else if (Name == null) {
                console.log('FnSaveDepartmentsVES: Name is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveDepartmentsVES: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveContactVES:error ' + ex.description);
          
    }
};

exports.FnSaveGatesVES = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var Name = req.body.Name;
        var TID = parseInt(req.body.TID);

        var RtnMessage = {
            IsSuccessfull: false,
            TID:0
        };
        if(TID.toString() == 'NaN')
            TID = 0;

        if (Token != null && Name != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(Name) + ',' + db.escape(TID);
                        db.query('CALL pSaveGates(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                //  console.log(InsertResult);
                                if (InsertResult != null) {
                                    if (InsertResult[0].length > 0) {
                                        RtnMessage.IsSuccessfull = true;
                                        var Insert = InsertResult[0];
                                        RtnMessage.TID=Insert[0].TID;
                                        res.send(Insert);
                                        //res.send(RtnMessage);
                                        console.log('FnSaveGatesVES: GatesVES details saved successfully');
                                    }
                                    else {
                                        res.send(RtnMessage);
                                        console.log('FnSaveGatesVES: GatesVES details Saving Failed');
                                    }
                                }
                                else {
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnSaveGatesVES: GatesVES details saving Failed');
                                }
                            }
                            else {
                                res.statusCode=500;
                                res.send(RtnMessage);
                                console.log('FnSaveGatesVES: Error in getting GatesVES etails' + err);
                            }
                        });
                    }
                    else {
                        res.statusCode=401;
                        console.log('FnSaveGatesVES: Invalid Token')
                        res.send(RtnMessage);
                    }
                }
                else {
                    res.statusCode=500;
                    console.log('FnSaveGatesVES: Error in processing Token' + err);
                    res.send(RtnMessage);
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnSaveGatesVES: Token is empty');
            }
            else if (Name == null) {
                console.log('FnSaveGatesVES: Name is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveGatesVES: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveGatesVES:error ' + ex.description);
          
    }
};

exports.FnSaveCitysVES = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var StateID = req.body.StateID;
        var CityTitle = req.body.CityTitle;
        var TID = parseInt(req.body.TID);

        var RtnMessage = {
            IsSuccessfull: false,
            TID:0
        };
        if(TID.toString() == 'NaN')
            TID = 0;

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));


        if (StateID != null && CityTitle != null) {
            var Insertquery = db.escape(StateID) + ',' + db.escape(CityTitle) + ',' + db.escape(TID);
            db.query('CALL pSaveCitysVES(' + Insertquery + ')', function (err, InsertResult) {
                if (!err) {
                    //  console.log(InsertResult);
                    if (InsertResult != null) {
                        if (InsertResult[0].length > 0) {
                            RtnMessage.IsSuccessfull = true;
                            var Insert = InsertResult[0];
                            RtnMessage.TID=Insert[0].TID;
                            res.send(Insert);
                            //res.send(RtnMessage);
                            console.log('FnSaveCitysVES: CitysVES details saved successfully');
                        }
                        else {
                            res.send(RtnMessage);
                            console.log('FnSaveCitysVES: CitysVES details Saving Failed');
                        }
                    }
                    else {
                        console.log(RtnMessage);
                        res.send(RtnMessage);
                        console.log('FnSaveCitysVES: CitysVES details saving Failed');
                    }
                }
                else {
                    res.statusCode=500;
                    res.send(RtnMessage);
                    console.log('FnSaveCitysVES: Error in getting CitysVES etails' + err);
                }
            });
        }

        else {
            if (StateID == null) {
                console.log('FnSaveCitysVES: StateID is empty');
            }
            else if (CityTitle == null) {
                console.log('FnSaveCitysVES: CityTitle is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveCitysVES: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveCitysVES:error ' + ex.description);
          
    }
};

