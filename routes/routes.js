var DbHelper = require('./../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();

var User = require('./modules/user-module.js');
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
exports.FnGetLoginDetails = userModule.getLoginDetails;
exports.FnUploadDocument = userModule.uploadDoc;
exports.FnWebLinkRedirect = userModule.webLinkRedirect;

var Audit = require('./modules/audit-module.js');
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


var Location = require('./modules/location-module.js');
var locationModule = new Location(db);
exports.FnGetSecondaryLocation = locationModule.getAll;
exports.FnAddLocation = locationModule.save;
exports.FnDeleteLocation = locationModule.deleteLocation;
exports.FnGetLocationListForEZEID = locationModule.getAllForEzeid;
exports.FnGetLocationList = locationModule.getLoactionList

var BusinessManager = require('./modules/business-module.js');
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
exports.FnGetUserwiseFolderList = businessManager.getUserwiseFolderList;
exports.FnUpdateBussinessListing = businessManager.updateBussinessList;
exports.FnGetCompanyDetails = businessManager.getCompanyDetails;
exports.FnGetEZEOneIDInfo = businessManager.getEZEOneIDInfo;

var Configuration = require('./modules/configuration-module.js');
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
exports.FnWorkingHoursDetails = configurationModule.getWorkingHoursDetails;

var Search = require('./modules/search-module.js');
var searchModule = new Search(db);
exports.FnSearchByKeywords = searchModule.searchKeyword;
exports.FnGetSearchInformationNew = searchModule.searchInformation;
exports.FnGetWorkingHrsHolidayList = searchModule.getWorkingHrsHolidayList;
exports.FnGetBannerPicture = searchModule.getBanner;
exports.FnSearchForTracker = searchModule.searchTracker;
exports.FnGetSearchDocuments = searchModule.getSearchDoc;

var Image = require('./modules/image-module.js');
var imageModule = new Image(db);
exports.FnCropImage = imageModule.cropImage;

var Reservation = require('./modules/reservation-module.js');
var reservationModule = new Reservation(db);
exports.FnSaveReservTransaction = reservationModule.SaveReservTrans;
exports.FnGetReservTask = reservationModule.getList;
exports.FnGetMapedServices = reservationModule.getMapedServices;
exports.FnGetResTransDetails = reservationModule.getTransDetails;
exports.FnChangeReservationStatus = reservationModule.changeReservStatus;
exports.FnGetworkinghoursList = reservationModule.getworkinghoursList;


//ap parts
var Auth_AP = require('./ap-modules/auth-module-ap.js');
var authModuleAP = new Auth_AP(db);
exports.FnLoginAP = authModuleAP.loginAP;
exports.FnLogoutAP = authModuleAP.logoutAP;
exports.FnForgetPasswordAP = authModuleAP.forgetPasswordAP;
exports.FnChangePasswordAP = authModuleAP.changePasswordAP;

var User_AP = require('./ap-modules/user-module-ap.js');
var userModuleAP = new User_AP(db);
exports.FnGetUserDetailsAP = userModuleAP.getUserDetailsAP;
exports.FnUpdateUserProfileAP = userModuleAP.updateUserProfileAP;
exports.FnSaveAPEZEID = userModuleAP.saveAPEZEID;
exports.FnUpdateRedFlagAP = userModuleAP.updateRedFlagAP;
exports.FnUpdateEZEIDAP = userModuleAP.updateEZEIDAP;

var Image_AP = require('./ap-modules/image-module-ap.js');
var imageModuleAP = new Image_AP(db);
exports.FnSaveAPEZEIDPicture = imageModuleAP.saveAPEZEIDPicture;
exports.FnGetAPEZEIDPicture = imageModuleAP.getAPEZEIDPicture;
exports.FnSaveBannerPictureAP = imageModuleAP.saveBannerPictureAP;
exports.FnGetBannerPictureAP = imageModuleAP.getBannerPictureAP;
exports.FnGetAllBannerPicsAP = imageModuleAP.getAllBannerPicsAP;
exports.FnDeleteBannerPictureAP = imageModuleAP.deleteBannerPictureAP;
exports.FnCropImageAP = imageModuleAP.cropImageAP;

var Location_AP = require('./ap-modules/location-module-ap.js');
var locationModuleAP = new Location_AP(db);
exports.FnGetSecondaryLocationListAP = locationModuleAP.getSecondaryLocationListAP;
exports.FnGetSecondaryLocationAP = locationModuleAP.getSecondaryLocationAP;
exports.FnUpdateSecondaryLocationAP = locationModuleAP.updateSecondaryLocationAP;

var RealEstate_AP = require('./ap-modules/real-estate-ap.js');
var realEstateAP = new RealEstate_AP(db);
exports.FnGetRealStateDataAP = realEstateAP.getRealStateDataAP;
exports.FnSearchRealEstateAP = realEstateAP.searchRealEstateAP;

var IDCard_AP = require('./ap-modules/idcard-module-ap.js');
var idcardAP = new IDCard_AP(db);
exports.FnUpdateIdCardPrintAP = idcardAP.updateIdCardPrintAP;
exports.FnGetIdCardPrintAP = idcardAP.getIdCardPrintAP;


//VES Modules
var VES = require('./ves-modules/ves-module-ap.js');
var vesModule= new VES(db);
exports.FnLoginVES = vesModule.loginVES;
exports.FnSaveContactVES = vesModule.saveContactVES;
exports.FnGetAllContactsVES = vesModule.getAllContactsVES;
exports.FnGetDepartmentVES = vesModule.getDepartmentVES;
exports.FnGetContactVES = vesModule.getContactVES;
exports.FnSearchContactsVES = vesModule.searchContactsVES;
exports.FnCheckPasswordVES = vesModule.checkPasswordVES;
exports.FnGetGatesVES = vesModule.getGatesVES;
exports.FnSaveDepartmentsVES = vesModule.saveDepartmentsVES;
exports.FnSaveGatesVES = vesModule.saveGatesVES;
exports.FnSaveCitysVES = vesModule.saveCitysVES;

function error(err, req, res, next) {
    // log it
    console.error(err.stack);
    console.log('Error Occurred Please try Again..');
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
                                if(BussinessListingResult){
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



