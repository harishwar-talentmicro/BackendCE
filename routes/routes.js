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
exports.FnGetCompanyProfile = userModule.getCompanyProfile;
exports.FnSaveCompanyProfile = userModule.saveCompanyProfile;
exports.FnGetWebLink = userModule.getWebLink;
exports.FnSaveWebLink = userModule.saveWebLink;
exports.FnDeleteWebLink = userModule.deleteWebLink;
exports.FnEZEIDPrimaryDetails = userModule.getEzeidDetails;
exports.FnGetCVInfo = userModule.getResume;
exports.FnSaveCVInfo = userModule.saveResume;

var Audit = require('./audit-module.js');
var auditModule = new Audit(db);
exports.FnGetAccessHistory = auditModule.getAccessHistory;

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
exports.FnGetOutboxMessages = businessManager.getOutboxTransactions;

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

var Search = require('./search-module.js');
var searchModule = new Search(db);
exports.FnSearchByKeywords = searchModule.searchKeyword;
exports.FnGetSearchInformation = searchModule.searchInformation;

var Image = require('./image-module.js');
var imageModule = new Image(db);
exports.FnCropImage = imageModule.cropImage;



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
        throw new Error(ex);
        return 'error'
    }
}

function FnRandomPassword() {
    try {
        var text = "";
        var possible = "1234567890abcdefghjklmnopqrstuvwxyz!@#$%";

        for (var i = 0; i < 7; i++) {

            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    catch (ex) {
        console.log('OTP generate error:' + ex.description);
        throw new Error(ex);
        return 'error'
    }
}

function FnEncryptPassword(Password) {
    try {
        //var text = "";
        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            key = 'ezeid@123';

        var cipher = crypto.createCipher(algorithm, key)
        var crypted = cipher.update(Password, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }
    catch (ex) {
        console.log('OTP generate error:' + ex.description);
        throw new Error(ex);
        return 'error'
    }
}

function FnDecrypt(EncryptPassword){
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
        throw new Error(ex);
        return 'error'
    }
}

exports.FnDecryptPassword = function(req,res){
    try {
//res.setHeader("Access-Control-Allow-Origin", "*");
//res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

        var password = req.query.Password;

        var RtnMessage = {
            Password : ''
        };
        RtnMessage.Password = FnDecrypt(password);
        console.log(RtnMessage.Password);
        res.send(RtnMessage);


    }
    catch(ex){
        console.log('FnDecrypterror:' + ex.description);
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
    }
};

//method to load functions
exports.FnGetFunctions = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'select FunctionID, FunctionName  from mfunctiontype where LangID=' + db.escape(LangID);
            db.query(Query, function (err, FunctionRoleMapResult) {
                if (!err) {
                    if (FunctionRoleMapResult.length > 0) {
                        res.send(FunctionRoleMapResult);
                        console.log('FnGetFunctions: mfunctiontype: Functions sent successfully');
                    }
                    else {
                        res.json(null);
                        res.statusCode = 500;
                        console.log('FnGetFunctions: mfunctiontype: No function  found');
                    }
                }
                else {

                    res.json(null);
                    console.log('FnGetFunctions: mfunctiontype: ' + err);
                }
            });
        }
        else {
            console.log('FnGetFunctions: LangId is empty');
            res.statusCode = 400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetFunctions error:' + ex.description);
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
    }
};

//method to load relation type
exports.FnGetRelationType = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'Select RelationID, RelationshipTitle from mrelationtype where LangID=' + db.escape(LangID);
            db.query(Query, function (err, RelationTypeResult) {
                if (!err) {
                    if (RelationTypeResult.length > 0) {
                        res.send(RelationTypeResult);
                        console.log('FnGetRelationType: mrelationtype: Relation Type sent successfully');
                    }
                    else {
                        res.json(null);
                        res.statusCode = 500;
                        console.log('FnGetRelationType: mrelationtype: No Relation type found');
                    }
                }
                else {
                    res.json(null);
                    console.log('FnGetRelationType: mrelationtype:' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetRelationType: LangId is empty');
        }


    }
    catch (ex) {
        console.log('FnGetRelationType error:' + ex.description);
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
    }

};

//method to get access history of users
exports.FnGetAccessHistory = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.TokenNo;
        var Page = parseInt(req.query.Page);

        if (Token != null && Page.toString() != 'NaN' && Page.toString() != '0') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var ToPage = 25 * Page;
                        var FromPage = ToPage - 24;

                        if (FromPage <= 1) {
                            FromPage = 0;
                        }

                        db.query('CALL pAccessHistory(' + db.escape(Token) + ',' + db.escape(FromPage) + ',' + db.escape(ToPage) + ')', function (err, AccessHistoryResult) {
                            if (!err) {
                                //    console.log(AccessHistoryResult);
                                if (AccessHistoryResult[0] != null) {
                                    if (AccessHistoryResult[0].length > 0) {
                                        res.send(AccessHistoryResult[0]);
                                        console.log('FnGetAccessHistory: History sent successfully');
                                    }
                                    else {
                                        console.log('FnGetAccessHistory: History not available');
                                        res.json(null);
                                    }

                                }
                                else {
                                    console.log('FnGetAccessHistory: No History available');
                                    res.json(null);
                                }
                            }
                            else {
                                res.json(null);
                                console.log('FnGetAccessHistory: Error in sending documents: ' + err);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        console.log('FnGetAccessHistory: Invalid Token');
                        res.json(null);
                    }
                }
                else {
                    res.statusCode = 500;
                    console.log('FnGetAccessHistory: Token error: ' + err);
                    res.json(null);
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnGetAccessHistory: Token is empty');
            }
            else if (Page.toString() != 'NaN') {
                console.log('FnGetAccessHistory: Type is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetAccessHistory error:' + ex.description);
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
    }
};

exports.FnUpdateDocPin = function (req, res) {

    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.body.TokenNo;
        var tPin = req.body.Pin;
        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (tPin == '') {
            tPin = null;
        }
        if (token != null && token != '') {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(token) + ',' + db.escape(tPin);
                        db.query('CALL pUpdateDocPIN(' + query + ')', function (err, UpdateResult) {
                            if (!err) {
                                //  console.log(UpdateResult);
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (UpdateResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateDocPin:  Doc Pin updates successfully');
                                }
                                else {
                                    console.log('FnUpdateDocPin:  Doc Pin  is not updated');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnUpdateDocPin: ' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateDocPin: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnUpdateDocPin: : ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }
        else {
            if (token == null || token == '') {
                console.log('FnUpdateDocPin: token is empty');
            }

            res.statusCode = 400;
            res.send(RtnMessage);

        }
    }
    catch (ex) {
        console.log('FnUpdateMessageStatus:  error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetDocPin = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.query.TokenNo;
        if (token != null) {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetDocPIN(' + db.escape(token) + ')', function (err, BussinessListingResult) {
                            if (!err) {
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (BussinessListingResult[0] != null) {
                                    if (BussinessListingResult[0].length > 0) {
                                        res.send(BussinessListingResult[0]);
                                        console.log('FnGetDocPin: Bussiness Pin sent successfully');
                                    }
                                    else {
                                        console.log('FnGetDocPin: Bussiness Pin is not avaiable');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetDocPin: Bussiness listing is not avaiable');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetDocPin: ' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        console.log('FnGetDocPin: Invalid token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetDocPin: : ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });
        }
        else {
            console.log('FnGetDocPin: token is empty');
            res.statusCode = 400;
            res.json(null);

        }
    }
    catch (ex) {
        console.log('FnGetDocPin:  error:' + ex.description);
        throw new Error(ex);
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
        throw new Error(ex);
    }
};
//method to save documents
exports.FnSaveDoc = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.TokenNo;
        var tRefNo = req.body.RefNo;
        var tRefExpiryDate = req.body.RefExpiryDate;
        var tRefType = parseInt(req.body.RefType);

        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null && tRefType.toString() != 'NaN') {
                        if (tRefExpiryDate != null) {
                            tRefExpiryDate = new Date(tRefExpiryDate);
                            //console.log(tRefExpiryDate);
                        }
                        var query = db.escape(Token) + ',' + db.escape(tRefNo) + ',' + db.escape(tRefExpiryDate) + ',' + db.escape(tRefType);
                        //console.log('FnSaveDoc: Inserting data: ' + query);
                        db.query('CALL pSaveDocs(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                //console.log(InsertResult);
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    console.log('Document Saved successfully');
                                    res.send(RtnMessage);
                                }
                                else {
                                    console.log('FnSaveDocs: Document not inserted');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.send(RtnMessage);
                                console.log('FnSaveDoc: Error in saving documents: ' + err);
                            }
                        });
                    }
                    else {
                        if (tRefType.toString() == 'NaN') {
                            console.log('FnSaveDoc: tRefType');
                            res.statusCode = 400;
                        }
                        else {
                            console.log('FnSaveDoc: Invalid Token');
                            res.statusCode = 401;
                        }
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveDoc: Token error: ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });

        }
        else {
            console.log('FnSaveDoc: Token is empty');
            res.statusCode = 400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveDoc error:' + ex.description);
        throw new Error(ex);
    }
};

//method to get documents
exports.FnGetDoc = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.TokenNo;
        var Type = parseInt(req.query.Type);

        if (Token != null && Type.toString() != 'NaN' && Type.toString() != '0') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetDocs(' + db.escape(Token) + ',' + db.escape(Type) + ')', function (err, DocumentResult) {
                            if (!err) {
                                //console.log(DocumentResult);
                                if (DocumentResult[0] != null) {
                                    if (DocumentResult[0].length > 0) {
                                        res.send(DocumentResult[0]);
                                        console.log('FnGetDoc: Document sent successfully');
                                    }
                                    else {
                                        console.log('FnGetDoc: No document available');
                                        res.json(null);
                                    }

                                }
                                else {
                                    console.log('FnGetDoc: No document available');
                                    res.json(null);
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.json(null);
                                console.log('FnGetDoc: Error in sending documents: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnGetDoc: Invalid Token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetDoc: Token error: ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnGetDoc: Token is empty');
            }
            else if (Type.toString() != 'NaN' || Type.toString() == '0') {
                console.log('FnGetDoc: Type is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetDoc error:' + ex.description);
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
    }
};

exports.FnGetBannerPicture = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var SeqNo = parseInt(req.query.SeqNo);
        var StateTitle = req.query.StateTitle;
        var Ezeid = req.query.Ezeid;
        var LocID = req.query.LocID;
        // var TokenNo = req.query.Token;

        RtnMessage = {
            Picture: ''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        Ezeid = Ezeid.split(',').pop();
        if ( SeqNo.toString() != 'NaN' && Ezeid != null && LocID != null) {
            var Query = db.escape(Ezeid) + ',' + db.escape(SeqNo) + ',' + db.escape(0);
            //console.log(InsertQuery);
            db.query('CALL PGetBannerPicsUsers(' + Query + ')', function (err, BannerResult) {
                if (!err) {
                    //console.log(InsertResult);
                    if (BannerResult != null) {
                        if (BannerResult[0].length > 0) {
                            var Picture = BannerResult[0];
                            console.log('FnGetBannerPicture: Banner picture sent successfully');
                            res.setHeader('Cache-Control', 'public, max-age=150000');
                            console.log('FnGetBannerPicture: Banner picture sent successfully');
                            RtnMessage.Picture = Picture[0].Picture;
                            res.send(RtnMessage);
                        }
                        else {
                            fs = require('fs');
                            //  var path = path + StateTitle+'.jpg' ;
                            fs.exists(path + StateTitle + '.jpg', function (exists) {
                                console.log(exists)
                                if (exists) {
                                    var bitmap = fs.readFileSync(path + StateTitle + '.jpg');
                                    // convert binary data to base64 encoded string
                                    RtnMessage.Picture = new Buffer(bitmap).toString('base64');
                                    res.send(RtnMessage);
                                    console.log('FnGetBannerPicture: State Banner sent successfully');
                                }
                                else {
                                    // path ='D:\\Mail\\Default.jpg';
                                    fs.exists(path + StateTitle + '.jpg', function (exists) {
                                        console.log(exists)
                                        if (exists) {

                                            var bitmap = fs.readFileSync(path + 'Default.jpg');
                                            // convert binary data to base64 encoded string
                                            RtnMessage.Picture = new Buffer(bitmap).toString('base64');
                                            res.send(RtnMessage);
                                            console.log('FnGetBannerPicture: Default Banner sent successfully');
                                        }
                                        else {
                                            res.json(null);
                                            console.log('FnGetBannerPicture: Default Banner not available');
                                        }
                                    });
                                }
                            });
                        }
                    }
                    else {
                        res.json(null);
                        console.log('FnGetBannerPicture:tmaster: Registration Failed');
                    }
                }
                else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetBannerPicture:tmaster:' + err);
                }
            });
        }
        else {
            if (SeqNo.toString() == 'NaN') {
                console.log('FnGetBannerPicture: SeqNo is empty');
            }
            else if(Ezeid == null) {
                console.log('FnGetBannerPicture: Ezeid is empty');
            }
            else if(LocID == null) {
                console.log('FnGetBannerPicture: LocID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetBannerPicture error:' + ex.description);
        throw new Error(ex);
    }
}

exports.FnSaveWhiteBlackList = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var List = req.body.List;
        var RelationType =parseInt(req.body.RelationType);
        var Tag = parseInt(req.body.Tag);
        var EZEID = req.body.EZEID;
        var Token = req.body.Token;

        var RtnMessage = {
            IsSuccessfull: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (List!= null && RelationType.toString() != 'NaN' && Tag.toString() != 'NaN' && EZEID !=null && Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(List) + ',' + db.escape(RelationType) + ',' + db.escape(EZEID) + ',' + db.escape(Tag) + ',' +db.escape(Token);
                        db.query('CALL pSavewhiteblacklist(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveWhiteBlackList: White/Black list details save successfully');
                                }
                                else {
                                    console.log('FnSaveWhiteBlackList:No Save White/Black list details');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnSaveWhiteBlackList: error in Updating White/Black list' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveWhiteBlackList: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveWhiteBlackList:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (List == null) {
                console.log('FnSaveWhiteBlackList: List is empty');
            }
            else if (RelationType == 'NaN') {
                console.log('FnSaveWhiteBlackList: RelationType is empty');
            }
            else if (EZEID == null) {
                console.log('FnSaveWhiteBlackList: Ezeid is empty');
            }
            else if (Tag == 'NaN') {
                console.log('FnSaveWhiteBlackList: Tag is empty');
            }
            else if (Token == null) {
                console.log('FnSaveWhiteBlackList: Token is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveWhiteBlackList:error ' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetWhiteBlackList = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        //var EZEID = req.query.EZEID;


        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pGetwhiteblacklist(' + db.escape(Token) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetWhiteBlackList: white/black list details Sent successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetWhiteBlackList:No white/black list details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetWhiteBlackList:No white/black list details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetWhiteBlackList: error in getting white/black list' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetWhiteBlackList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetWhiteBlackList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetWhiteBlackList: Token is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetWhiteBlackList error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnDeleteWhiteBlackList = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


        var Token = req.body.Token;
        var TID = req.body.TID;

        var RtnMessage = {
            IsSuccessfull: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (TID !=null && Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = db.escape(Token) + ',' + db.escape(TID);
                        db.query('CALL pDeletewhiteblacklist(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnDeleteWhiteBlackList: White/Black list details delete successfully');
                                }
                                else {
                                    console.log('FnDeleteWhiteBlackList:No delete White/Black list details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnDeleteWhiteBlackList: error in deleting White/Black list' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteWhiteBlackList: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteWhiteBlackList:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnDeleteWhiteBlackList: Token is empty');
            }
            else if (TID == null) {
                console.log('FnDeleteWhiteBlackList: TID is empty');
            }


            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnDeleteWhiteBlackList:error ' + ex.description);
        throw new Error(ex);
    }
}

exports.FnGetWhiteListCount = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var EZEID = req.query.EZEID;
        var List=req.query.List;
        var RtnMessage = {
            WhiteListCount : 0
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && EZEID != null && List != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = db.escape(Token) + ',' + db.escape(EZEID) + ',' + db.escape(List);

                        db.query('CALL pGetWhiteListCount(' + query + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult[0] != null) {
                                    if (GetResult[0].length > 0) {
                                        var WhiteListCount =GetResult[0];
                                        RtnMessage.WhiteListCount=WhiteListCount[0].WhiteListCount;
                                        console.log('FnGetWhiteListCount: white list count Sent successfully');
                                        res.send(RtnMessage);
                                    }
                                    else {

                                        console.log('FnGetWhiteListCount:No white list details found');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {

                                    console.log('FnGetWhiteListCount:No white list details found');
                                    res.send(RtnMessage);
                                }

                            }
                            else {

                                console.log('FnGetWhiteListCount: error in getting white list' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.send(RtnMessage);
                        console.log('FnGetWhiteListCount: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnGetWhiteListCount: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetWhiteListCount: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnGetWhiteListCount: EZEID is empty');
            }
            else if (List == null) {
                console.log('FnGetWhiteListCount: List is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnGetWhiteListCount error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnSearchForTracker = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var Keyword = req.body.Keyword;
        var Latitude = req.body.Latitude;
        var Longitude = req.body.Longitude;
        var Proximity = req.body.Proximity;

        if (Token != null && Keyword != null && Latitude != null && Longitude != null && Proximity  != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Keyword) + ','  + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' + db.escape(Proximity)+ ',' + db.escape(Token);
                        db.query('CALL pTrackerSearch(' + query + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnSearchForTracker: Search result sent successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {
                                        console.log('FnSearchForTracker:No Search found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnSearchForTracker:No Search found');
                                    res.json(null);
                                }
                            }
                            else {

                                console.log('FnSearchForTracker: error in getting search result' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnSearchForTracker: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnSearchForTracker: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnSearchForTracker: Token is empty');
            }
            else if (Keyword == null) {
                console.log('FnSearchForTracker: Keyword is empty');
            }
            else if (Latitude == null) {
                console.log('FnSearchForTracker: Latitude is empty');
            }
            else if (Longitude == null) {
                console.log('FnSearchForTracker: Longitude is empty');
            }
            else if (Proximity == null) {
                console.log('FnSearchForTracker: Proximity is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnSearchForTracker error:' + ex.description);
        throw new Error(ex);
    }
};

//below method get item list details
exports.FnGetItemList = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var FunctionType = req.query.FunctionType;
        if(Token == "")
            Token= null;
        if (Token != null && FunctionType != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetItemList(' + db.escape(Token) + ',' + db.escape(FunctionType) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult[0] != null) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnGetItemList: Item list details Send successfully');
                                        res.json(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetItemList:No Item list details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetItemList:No Item list details found');
                                    res.json(null);
                                }
                            }
                            else {

                                console.log('FnGetItemList: error in getting Item list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetItemList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetItemList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetItemList: Token is empty');
            }
            else if (FunctionType == null) {
                console.log('FnGetItemList: FunctionType is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetItemList error:' + ex.description);
        throw new Error(ex);
    }
};

//below method get transaction items list
exports.FnGetTransactionItems = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var MessageID = req.query.MessageID;

        if (Token != null && MessageID != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pGetTranscationItems(' + db.escape(MessageID) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetTranscationItems: transaction items details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetTranscationItems:No transaction items details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetTranscationItems:No transaction items details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetTranscationItems: error in getting transaction items details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetTranscationItems: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetTranscationItems: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetTranscationItems: Token is empty');
            }
            else if (MessageID == null) {
                console.log('FnGetTranscationItems: MessageID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetTranscationItems error:' + ex.description);
        throw new Error(ex);
    }
};

//below method to save transaction items
exports.FnSaveTransactionItems = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var MessageID = req.body.MessageID;
        var ItemID = req.body.ItemID;
        var Qty = req.body.Qty;
        var Rate = req.body.Rate;
        var Amount = req.body.Amount;
        var Duration = req.body.Duration;


        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && MessageID!= null && ItemID != null && Qty !=null && Rate !=null && Amount != null && Duration !=null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = db.escape(MessageID) + ',' + db.escape(ItemID) + ',' + db.escape(Qty) + ',' + db.escape(Rate) + ',' +db.escape(Amount) + ',' +db.escape(Duration);
                        db.query('CALL pSaveTranscationItems(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveTranscationItems: Transaction items details save successfully');
                                }
                                else {
                                    console.log('FnSaveTranscationItems:No Save Transaction items details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveTranscationItems: error in saving Transaction items' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveTranscationItems: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveTranscationItems:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnSaveTranscationItems: Token is empty');
            }
            else if (MessageID == null) {
                console.log('FnSaveTranscationItems: MessageID is empty');
            }
            else if (ItemID == null) {
                console.log('FnSaveTranscationItems: ItemID is empty');
            }
            else if (Qty == null) {
                console.log('FnSaveTranscationItems: Qty is empty');
            }
            else if (Rate == null) {
                console.log('FnSaveTranscationItems: Rate is empty');
            }
            else if (Amount == null) {
                console.log('FnSaveTranscationItems: Amount is empty');
            }
            else if (Duration == null) {
                console.log('FnSaveTranscationItems: Duration is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveTranscationItems:error ' + ex.description);
        throw new Error(ex);
    }
}

exports.FnItemDetails = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var TID = req.query.TID;

        if (Token != null && TID != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pItemDetails(' + db.escape(TID) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnItemDetails: Item list details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnItemDetails:No Item list details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnItemDetails:No Item list details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnItemDetails: error in getting Item list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnItemDetails: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnItemDetails: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnItemDetails: Token is empty');
            }
            else if (TID == null) {
                console.log('FnItemDetails: TID is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnItemDetails error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnSaveHolidayCalendar = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = req.body.TID;
        var HolidayDate = req.body.HolidayDate;
        var HolidayTitle = req.body.HolidayTitle;
        var TemplateID = req.body.TemplateID;

        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && TID != null && HolidayTitle != null  && HolidayDate != null && TemplateID != null ) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(TID) + ',' + db.escape(Token) + ',' + db.escape(new Date(HolidayDate)) + ',' + db.escape(HolidayTitle) + ',' + db.escape(TemplateID);
                        db.query('CALL pSaveHolidayCalendar(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveHolidayCalendar: Holiday calander details save successfully');
                                }
                                else {
                                    console.log('FnSaveHolidayCalendar:No Save Holiday calander details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveHolidayCalendar: error in saving Holiday calander details' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveHolidayCalendar: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveHolidayCalendar:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnSaveHolidayCalendar: Token is empty');
            }
            else if (TID == null) {
                console.log('FnSaveHolidayCalendar: TID is empty');
            }
            else if (HolidayTitle == null) {
                console.log('FnSaveHolidayCalendar: HolidayTitle is empty');
            }
            else if (HolidayDate == null) {
                console.log('FnSaveHolidayCalendar: HolidayDate is empty');
            }
            else if (TemplateID == null) {
                console.log('FnSaveHolidayCalendar: TemplateID is empty');
            }


            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveHolidayCalendar:error ' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetHolidayList = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var LocID = req.query.LocID;
        var TemplateID = req.query.TemplateID;
        if(LocID == null && LocID == '')
            LocID=0;
        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pGetHolidayList(' + db.escape(LocID) + ',' + db.escape(TemplateID)+ ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetHolidayList: Holiday list Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetHolidayList:No Holiday list found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetHolidayList:No Holiday list found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetHolidayList: error in getting Holiday list' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetHolidayList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetHolidayList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetHolidayList: Token is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetHolidayList error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnDeleteHolidayList = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


        var Token = req.query.Token;
        var TID = req.query.TID;

        var RtnMessage = {
            IsSuccessfull: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token !=null && TID != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        //var query = db.escape(Token) + ',' + db.escape(TID);
                        db.query('CALL pDeleteHolidayList(' + db.escape(TID) + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnDeleteHolidayList: Holiday list delete successfully');
                                }
                                else {
                                    console.log('FnDeleteHolidayList:No delete Holiday list');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnDeleteHolidayList: error in deleting Holiday list' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteHolidayList: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteHolidayList:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnDeleteHolidayList: Token is empty');
            }
            else if (TID == null) {
                console.log('FnDeleteHolidayList: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnDeleteHolidayList:error ' + ex.description);
        throw new Error(ex);
    }
}

exports.FnSaveTransaction = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = parseInt(req.body.TID);

        var MessageText =req.body.MessageText;
        var Status = req.body.Status;
        var TaskDateTime = req.body.TaskDateTime;
        var Notes = req.body.Notes;
        var LocID = req.body.LocID;
        var Country = req.body.Country;    //country short name
        var State = req.body.State;         //admin level 1
        var City = req.body.City;       //ADMIN level 2
        var Area = req.body.Area;       //admin level 3
        var FunctionType = req.body.FunctionType;
        var Latitude = req.body.Latitude;
        var Longitude = req.body.Longitude;
        var EZEID = req.body.EZEID;
        var ContactInfo = req.body.ContactInfo;
        var FolderRuleID = parseInt(req.body.FolderRuleID);
        var Duration = req.body.Duration;
        var DurationScales = req.body.DurationScales;
        var ItemsList = req.body.ItemsList;
        ItemsList = JSON.parse(ItemsList);
        var NextAction = req.body.NextAction;
        var NextActionDateTime = req.body.NextActionDateTime;
        var  TaskDateNew = new Date(TaskDateTime);
        var NextActionDateTimeNew = new Date(NextActionDateTime);
        var DeliveryAddress = req.body.DeliveryAddress;
        if(DeliveryAddress == '')
            DeliveryAddress = '';
        var ItemIDList='';
        var ToEZEID = req.body.ToEZEID;
        var item_list_type = 0;
        var companyName = req.body.companyName ? req.body.companyName : '' ;
        var company_id = req.body.company_id ? req.body.company_id : 0 ;
        var RtnMessage = {
            IsSuccessfull: false,
            MessageID:0
        };

        if(TID.toString() == 'NaN')
            TID = 0;

        if(TID != 0){
            for(var i=0; i < ItemsList.length; i++) {
                if(ItemsList[i].TID != 0 )
                    ItemIDList = ItemsList[i].TID + ',' + ItemIDList  ;
            }
            console.log(ItemIDList);
            ItemIDList=ItemIDList.slice(0,-1)
            console.log('TID comma Values:'+ ItemIDList);
        }
        if(FolderRuleID.toString() == 'NaN')
            FolderRuleID=0;

        if (Token != null && ItemsList != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = db.escape(Token)+","+db.escape(FunctionType)+","+ db.escape(MessageText)+ "," + db.escape(Status) +"," + db.escape(TaskDateNew) + ","  + db.escape(Notes) + "," + db.escape(LocID)  + "," + db.escape(Country)   + "," + db.escape(State) + "," + db.escape(City)   + "," + db.escape(Area) + ","  + db.escape(Latitude)  + "," + db.escape(Longitude)  +  "," + db.escape(EZEID)  + "," + db.escape(ContactInfo)  + "," + db.escape(FolderRuleID)  + "," + db.escape(Duration)  + "," + db.escape(DurationScales) + "," + db.escape(NextAction) + "," + db.escape(NextActionDateTimeNew) + "," + db.escape(TID) + "," + db.escape(((ItemIDList != "") ? ItemIDList : "")) + "," + db.escape(DeliveryAddress) + "," + db.escape(ToEZEID) + "," + db.escape(item_list_type) + "," + db.escape(companyName) + "," + db.escape(company_id);
                        // db.escape(NextActionDateTime);
                        console.log('CALL pSaveTrans(' + query + ')');
                        db.query('CALL pSaveTrans(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                console.log(InsertResult);
                                if (InsertResult[0] != null) {
                                    if(InsertResult[0].length > 0){
                                        RtnMessage.IsSuccessfull = true;
                                        var Message = InsertResult[0];
                                        RtnMessage.MessageID=Message[0].MessageID;
                                        console.log(Message);
                                        for(var i=0; i < ItemsList.length; i++) {
                                            var itemsDetails = ItemsList[i];
                                            var items = {
                                                MessageID: Message[0].MessageID,
                                                ItemID: itemsDetails.ItemID,
                                                Qty: itemsDetails.Qty,
                                                Rate: itemsDetails.Rate,
                                                Amount: itemsDetails.Amount,
                                                Duration: itemsDetails.Durations
                                            };
                                            console.log(items);
                                            console.log('TID:' +itemsDetails.TID);
                                            if(itemsDetails.TID == 0){
                                                var query = db.query('INSERT INTO titems SET ?', items, function (err, result) {
                                                    // Neat!
                                                    if (!err) {
                                                        if (result != null) {
                                                            if (result.affectedRows > 0) {
                                                                console.log('FnSaveFolderRules: Folder rules saved successfully');
                                                            }
                                                            else {
                                                                console.log('FnSaveFolderRules: Folder rule not saved');
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnSaveFolderRules: Folder rule not saved');
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnSaveFolderRules: error in saving folder rules' + err);
                                                    }
                                                });

                                            }

                                            else{
                                                var items = {

                                                    ItemID: itemsDetails.ItemID,
                                                    Qty: itemsDetails.Qty,
                                                    Rate: itemsDetails.Rate,
                                                    Amount: itemsDetails.Amount,
                                                    Duration: itemsDetails.Durations
                                                };
                                                console.log('TID:' +itemsDetails.TID);
                                                var query = db.query("UPDATE titems set ? WHERE TID = ? ",[items,itemsDetails.TID], function (err, result) {
                                                    // Neat!
                                                    console.log(result);
                                                    if (!err) {
                                                        if(result != null){
                                                            if(result.affectedRows > 0){

                                                                console.log('FnSaveFolderRules: Folder rules Updated successfully');
                                                            }
                                                            else
                                                            {
                                                                console.log('FnSaveFolderRules: Folder rule not updated');
                                                            }
                                                        }
                                                        else
                                                        {
                                                            console.log('FnSaveFolderRules: Folder rule not updated')
                                                        }
                                                    }
                                                    else
                                                    {
                                                        console.log('FnSaveFolderRules: error in saving folder rules' +err);
                                                    }
                                                });
                                            }
                                        }
                                        res.send(RtnMessage);
                                        console.log('FnSaveTranscationItems: Transaction items details save successfully');
                                    }
                                    else
                                    {
                                        console.log('FnSaveTranscationItems:No Save Transaction items details');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveTranscationItems:No Save Transaction items details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveTranscationItems: error in saving Transaction items' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveTranscationItems: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveTranscationItems:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnSaveTranscationItems: Token is empty');
            }
            else
                console.log(RtnMessage);

            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveTranscationItems:error ' + ex.description);
        throw new Error(ex);
    }
};

exports.FnUpdateTransaction = function (req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = parseInt(req.body.TID);
        var status = req.body.status;
        var folderRuleID = parseInt(req.body.folderRuleID);
        var nextAction = (parseInt(req.body.nextAction) != NaN ) ? parseInt(req.body.nextAction) : 0;
        var nextActionDateTime = new Date(req.body.nextActionDateTime);
        var Token = req.body.Token;


        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };

        if(Token){

            var query = db.escape(TID) + ', ' + db.escape(status) + ',' + db.escape(folderRuleID) + ',' + db.escape(nextAction) + ',' + db.escape(nextActionDateTime)+ ', ' + db.escape(Token);
            db.query('CALL pUpdateTrans(' + query + ')', function (err, updateResult) {
                if (!err){
                    if (updateResult) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Transaction details update successfully';
                        responseMessage.data = {
                            TID : req.body.TID,
                            status : req.body.status,
                            folderRuleID : req.body.folderRuleID,
                            nextAction : (parseInt(req.body.nextAction) != NaN ) ? parseInt(req.body.nextAction) : 0,
                            nextActionDateTime : req.body.nextActionDateTime
                        };
                        res.status(200).json(responseMessage);
                        console.log('FnUpdateTransaction: Transaction details update successfully');
                    }
                    else {
                        responseMessage.message = 'An error occured ! Please try again';
                        responseMessage.error = {};
                        res.status(400).json(responseMessage);
                        console.log('FnUpdateTransaction:No update transaction details');
                    }
                }
            });
        }
        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnUpdateTransaction: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnUpdateTransaction:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }

};

exports.FnSaveTranscationOld = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = parseInt(req.body.TID);
        var MessageText =req.body.MessageText;
        var MessageType = req.body.MessageType;
        var Status = req.body.Status;
        var TaskDateTime = req.body.TaskDateTime;
        var Notes = req.body.Notes;
        var LocID = req.body.LocID;
        var Country = req.body.Country;    //country short name
        var State = req.body.State;         //admin level 1
        var City = req.body.City;       //ADMIN level 2
        var Area = req.body.Area;       //admin level 3
        var FunctionType = req.body.FunctionType;
        var Latitude = req.body.Latitude;
        var Longitude = req.body.Longitude;
        var EZEID = req.body.EZEID;
        var ContactInfo = req.body.ContactInfo;
        var FolderRuleID = parseInt(req.body.FolderRuleID);
        var Duration = req.body.Duration;
        var DurationScales = req.body.DurationScales;
        var ItemsList = req.body.ItemsList;
        ItemsList = JSON.parse(ItemsList);
        var NextAction = req.body.NextAction;
        var NextActionDateTime = req.body.NextActionDateTime;
        var  TaskDateNew = new Date(TaskDateTime);
        var NextActionDateTimeNew = new Date(NextActionDateTime);
        var company_id = req.body.company_id ? req.body.company_id : 0;
        var RtnMessage = {
            IsSuccessfull: false
        };
        if(TID.toString() == 'NaN')
            TID = 0;
        if(FolderRuleID.toString() == 'NaN')
            FolderRuleID=0;
        if (Token != null ) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = db.escape(Token)+","+db.escape(MessageType)+","+ db.escape(MessageText)+ "," + db.escape(Status) +"," + db.escape(TaskDateNew) + ","  + db.escape(Notes) + "," + db.escape(LocID)  + "," + db.escape(Country)   + "," + db.escape(State) + "," + db.escape(City)   + "," + db.escape(Area)   + ","  + db.escape(Latitude)  + "," + db.escape(Longitude)  +  "," + db.escape(EZEID)  + "," + db.escape(ContactInfo)  + "," + db.escape(FolderRuleID)  + "," + db.escape(Duration)  + "," + db.escape(DurationScales) + "," + db.escape(NextAction) + "," + db.escape(NextActionDateTimeNew) + "," + db.escape(TID) + "," + db.escape(company_id);
                        // db.escape(NextActionDateTime);
                        db.query('CALL pSaveTrans(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                console.log(InsertResult);
                                if (InsertResult[0] != null) {
                                    if(InsertResult[0].length > 0){
                                        RtnMessage.IsSuccessfull = true;
                                        var Message = InsertResult[0];
                                        console.log(Message);
                                        ItemsList.forEach(function(itemsDetails){
                                            var items = {
                                                MessageID: Message[0].MessageID,
                                                ItemID: itemsDetails.ItemID,
                                                Qty: itemsDetails.Qty,
                                                Rate: itemsDetails.Rate,
                                                Amount: itemsDetails.Amount,
                                                Duration: itemsDetails.Durations
                                            };
                                            console.log(items);
                                            var query = db.query('INSERT INTO titems SET ?', items, function (err, result) {
                                                // Neat!
                                                if (!err) {
                                                    if (result != null) {
                                                        if (result.affectedRows > 0) {
                                                            console.log('FnSaveFolderRules: Folder rules saved successfully');
                                                        }
                                                        else {
                                                            console.log('FnSaveFolderRules: Folder rule not saved');
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnSaveFolderRules: Folder rule not saved');
                                                    }
                                                }
                                                else {
                                                    console.log('FnSaveFolderRules: error in saving folder rules' + err);
                                                }
                                            });
                                        });

                                        res.send(RtnMessage);
                                        console.log('FnSaveTranscationItems: Transaction items details save successfully');
                                    }
                                    else
                                    {
                                        console.log('FnSaveTranscationItems:No Save Transaction items details');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveTranscationItems:No Save Transaction items details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveTranscationItems: error in saving Transaction items' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveTranscationItems: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveTranscationItems:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnSaveTranscationItems: Token is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnSaveTranscationItems:error ' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetTransaction = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var FunctionType = parseInt(req.query.FunctionType);
        var Page = parseInt(req.query.Page);
        var Status = (req.query.Status) ? req.query.Status : null;
        var searchkeyword = req.query.searchkeyword ? req.query.searchkeyword : '';
        var sortBy = (parseInt(req.query.sort_by) !== NaN) ? parseInt(req.query.sort_by) : 0 ;
        var folderRules = (req.query.folder_rules) ? req.query.folder_rules : '';

        console.log(req.query);
        var RtnMessage = {
            TotalPage:'',
            Result:''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && FunctionType.toString() != null && Page.toString() != 'NaN' && Page.toString() != 0) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var ToPage = 10 * Page;
                        var FromPage = ToPage - 10;

                        if (FromPage <= 1) {
                            FromPage = 0;
                        }

                        var parameters = db.escape(Token) + ',' + db.escape(FunctionType) + ',' + db.escape(Status) + ',' + db.escape(FromPage) + ',' + db.escape(10) + ',' + db.escape(searchkeyword) + ',' + db.escape(sortBy) + ','+ db.escape(folderRules);
                        console.log('CALL pGetMessagesNew(' + parameters + ')');
                        db.query('CALL pGetMessagesNew(' + parameters + ')', function (err, GetResult) {
                            console.log(GetResult);
                            if (!err) {
                                if (GetResult != null) {
                                    console.log('Length:'+GetResult[0].length);
                                    if (GetResult[0].length > 0) {
                                        var totalRecord=GetResult[0][0].TotalCount;
                                        var limit= 10;
                                        var PageValue = parseInt(totalRecord / limit);
                                        var PageMod = totalRecord % limit;
                                        if (PageMod > 0){
                                            TotalPage = PageValue + 1;
                                        }
                                        else{
                                            TotalPage = PageValue;
                                        }

                                        //TotalPage = parseInt(GetResult[0][0].TotalCount / 10) + 1;
                                        RtnMessage.TotalPage = TotalPage;
                                        RtnMessage.Result =GetResult[0];
                                        res.send(RtnMessage);
                                        console.log('FnGetTranscation: Transaction details Send successfully');
                                    }

                                    else {
                                        console.log('FnGetTranscation:No Transaction details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetTranscation:No transaction details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetTranscation: error in getting transaction details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetTranscation: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetTranscation: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetTranscation: Token is empty');
            }
            else if (FunctionType == null) {
                console.log('FnGetTranscation: FunctionType is empty');
            }
            else if (Page.toString() == 'NaN') {
                console.log('FnGetMessages: Page is empty');
            }
            else if (Page.toString() == 0) {
                console.log('FnGetMessages: Sending page 0');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetTranscation error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnDeleteTransaction = function(req,res){
    try{

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var ItemTID = req.query.ItemTID;

        var RtnMessage = {
            IsSuccessfull:false
        };
        if (Token != null && ItemTID != null){
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pDeleteTransactionItems(' + db.escape(ItemTID) + ')', function (err, deleteResult) {
                            if (!err) {
                                if (deleteResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnDeleteTranscation: transaction items delete successfully');
                                }
                                else {
                                    console.log('FnDeleteTranscation:No delete transaction items');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnDeleteTranscation: error in deleting transaction items' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteTranscation: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteTranscation:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnDeleteTranscation: Token is empty');
            }
            else if (ItemTID == null) {
                console.log('FnDeleteTranscation: ItemTID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnDeleteTranscation:error ' + ex.description);
        throw new Error(ex);
    }
}

exports.FnSaveWorkingHours = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var SpilloverTime = req.body.SpilloverTime;
        var MO1 = req.body.MO1;
        var MO2 = req.body.MO2;
        var MO3 = req.body.MO3;
        var MO4 = req.body.MO4;
        var TU1 = req.body.TU1;
        var TU2 = req.body.TU2;
        var TU3 = req.body.TU3;
        var TU4 = req.body.TU4;
        var WE1 = req.body.WE1;
        var WE2 = req.body.WE2;
        var WE3 = req.body.WE3;
        var WE4 = req.body.WE4;
        var TH1 = req.body.TH1;
        var TH2 = req.body.TH2;
        var TH3 = req.body.TH3;
        var TH4 = req.body.TH4;
        var FR1 = req.body.FR1;
        var FR2 = req.body.FR2;
        var FR3 = req.body.FR3;
        var FR4 = req.body.FR4;
        var SA1 = req.body.SA1;
        var SA2 = req.body.SA2;
        var SA3 = req.body.SA3;
        var SA4 = req.body.SA4;
        var SU1 = req.body.SU1;
        var SU2 = req.body.SU2;
        var SU3 = req.body.SU3;
        var SU4 = req.body.SU4;
        var WorkingHrsTemplate = req.body.WorkingHrsTemplate;
        var TID = req.body.TID;


        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && SpilloverTime != null && WorkingHrsTemplate != null && TID != null ) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = db.escape(Token) + ',' + db.escape(SpilloverTime) + ',' + db.escape(MO1) + ',' + db.escape(MO2) + ',' + db.escape(MO3) + ',' + db.escape(MO4)
                            + ',' + db.escape(TU1) + ',' + db.escape(TU2) + ',' + db.escape(TU3) + ',' + db.escape(TU4)
                            + ',' + db.escape(WE1) + ',' + db.escape(WE2) + ',' + db.escape(WE3) + ',' + db.escape(WE4)
                            + ',' + db.escape(TH1) + ',' + db.escape(TH2) + ',' + db.escape(TH3) + ',' + db.escape(TH4)
                            + ',' + db.escape(FR1) + ',' + db.escape(FR2) + ',' + db.escape(FR3) + ',' + db.escape(FR4)
                            + ',' + db.escape(SA1) + ',' + db.escape(SA2) + ',' + db.escape(SA3) + ',' + db.escape(SA4)
                            + ',' + db.escape(SU1) + ',' + db.escape(SU2) + ',' + db.escape(SU3) + ',' + db.escape(SU4)
                            + ',' + db.escape(WorkingHrsTemplate) + ',' + db.escape(TID);
                        db.query('CALL pSaveWorkingHours(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveWorkingHours: Working Hours details save successfully');
                                }
                                else {
                                    console.log('FnSaveWorkingHours:No Save Working Hours details');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveWorkingHours: error in saving Working Hours details' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveWorkingHours: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveWorkingHours:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnSaveWorkingHours: Token is empty');
            }
            else if (SpilloverTime == null) {
                console.log('FnSaveWorkingHours: SpilloverTime is empty');
            }
            else if (WorkingHrsTemplate == null) {
                console.log('FnSaveWorkingHours: WorkingHrsTemplate is empty');
            }
            else if (TID == null) {
                console.log('FnSaveWorkingHours: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveWorkingHours:error ' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetWorkingHours = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pGetWorkingHours(' + db.escape(Token) +',' + db.escape(0)+ ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetWorkingHours: Working Hours details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetWorkingHours:No Working Hours details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetWorkingHours:No Working Hours details found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetWorkingHours: error in getting Working Hours details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetWorkingHours: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetWorkingHours: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetWorkingHours: Token is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetWorkingHours error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnDeleteWorkingHours = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var TID = req.query.TID;
        var RtnMessage = {
            IsSuccessfull: false,
            Message:''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token !=null && TID != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        //console.log('CALL pDeleteWorkinghours(' + db.escape(TID) + ')');
                        db.query('CALL pDeleteWorkinghours(' + db.escape(TID) + ')', function (err, deleteResult) {
                            if (!err){

                                RtnMessage.IsSuccessfull = true;
                                RtnMessage.Message = 'delete successfully';
                                res.send(RtnMessage);
                                console.log('FnDeleteWorkingHours:Working Hours delete successfully');
                            }
                            else {
                                console.log('FnDeleteWorkingHours: error in deleting Working Hours' + err);
                                res.statusCode = 500;
                                RtnMessage.Message = 'Error in deleting';
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteWorkingHours: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteWorkingHours:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnDeleteWorkingHours: Token is empty');
            }
            else if (TID == null) {
                console.log('FnDeleteWorkingHours: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnDeleteWorkingHours:error ' + ex.description);
        throw new Error(ex);
    }
}

//method to get working hours and holiday list
exports.FnGetWorkingHrsHolidayList = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var LocID = req.query.LocID;
        var RtnMessage = {
            WorkingHours: '',
            HolidayList:'',
            Result: false
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if(LocID == null)
            LocID = 0;
        if (Token != null && LocID != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var async = require('async');
                        async.parallel([ function FnWorkingHours(CallBack) {
                            try {

                                var query = db.escape(Token) + ',' + db.escape(LocID);
                                db.query('CALL pGetWorkingHours(' + query + ')', function (err, WorkingResult) {
                                    console.log('CALL pGetWorkingHours(' + query + ')');

                                    if (!err) {

                                        if(WorkingResult != null)
                                        {
                                            if(WorkingResult[0].length > 0 )
                                            {
                                                console.log('FnWorkingHours: Working Hours are available');
                                                RtnMessage.WorkingHours = WorkingResult[0];
                                                RtnMessage.Result = true;
                                                CallBack();
                                            }
                                            else
                                            {
                                                console.log('Fnworkinghours: no working hours avaiable');
                                                RtnMessage.Result = true;
                                                CallBack();
                                            }
                                        }
                                        else{
                                            console.log('Fnworkinghours: no working hours avaiable');
                                            RtnMessage.Result = true;
                                            CallBack();
                                        }
                                    }
                                    else {
                                        console.log('FnWorkingHours: sending workinghours error ' + error);
                                        CallBack();
                                    }
                                });
                            }
                            catch (ex) {
                                console.log('FnWorkingHours error:' + ex.description);
                                throw new Error(ex);
                                return 'error'
                            }
                        } ,function FnHolidayList(CallBack) {
                            try {
                                var query = db.escape(LocID) + ',' + db.escape(0);
                                db.query('CALL pGetHolidayList(' + query + ')', function (err, HolidayResult) {
                                    console.log('CALL pGetHolidayList(' + query + ')');

                                    if (!err) {
                                        if(HolidayResult != null)
                                        {
                                            if(HolidayResult[0].length > 0 )
                                            {
                                                console.log('FnHolidayList: Holiday List are available');
                                                RtnMessage.HolidayList = HolidayResult[0]
                                                RtnMessage.Result = true;
                                                CallBack();
                                            }
                                            else
                                            {
                                                console.log('FnHolidayList: No Holiday List avaiable');
                                                RtnMessage.Result = true;
                                                CallBack();
                                            }
                                        }
                                        else{
                                            console.log('FnHolidayList: No Holiday List avaiable');
                                            RtnMessage.Result = true;
                                            CallBack();
                                        }
                                    }
                                    else {
                                        console.log('FnHolidayList: sending holiday list error ' + error);
                                        CallBack();
                                    }
                                });
                            }
                            catch (ex) {
                                console.log('FnHolidayList error:' + ex.description);
                                throw new Error(ex);
                                return 'error'
                            }
                        }
                        ],function(err){
                            if(!err){
                                console.log('GnGetWorkingHrs : data sent successfully');
                                res.send(RtnMessage);
                            }
                            else
                            {
                                res.statusCode = 500;
                                res.send(RtnMessage);
                                console.log('error in parellel async callling' + err);
                            }

                        });

                    }
                    else {
                        res.statusCode = 401;
                        res.send(RtnMessage);
                        console.log('FnGetWorkingHours: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnGetWorkingHours: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetWorkingHours: Token is empty');
            }
            else if (LocID == null) {
                console.log('FnGetWorkingHours: LocID is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnGetWorkingHours error:' + ex.description);
        throw new Error(ex);
    }
};

function FnWorkingHours(WorkingContent, CallBack) {
    try {

        if (WorkingContent != null) {

            console.log('WorkingContent values');
            console.log(WorkingContent);

            var query = db.escape(WorkingContent.Token) + ',' + db.escape(WorkingContent.LocID);
            db.query('CALL pGetWorkingHours(' + query + ')', function (err, WorkingResult) {
                console.log('CALL pGetWorkingHours(' + query + ')');

                if (!err) {

                    if(WorkingResult != null)
                    {
                        if(WorkingResult[0].length > 0 )
                        {
                            console.log('FnWorkingHours: Working Hours are available');
                            CallBack(null, WorkingResult[0]);
                        }
                        else
                        {
                            console.log('Fnworkinghours: no working hours avaiable');
                            CallBack(null,null);
                        }
                    }
                    else{
                        console.log('Fnworkinghours: no working hours avaiable');
                        CallBack(null,null);
                    }
                }
                else {
                    console.log('FnWorkingHours: sending workinghours error ' + error);
                    CallBack(null, null);
                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnWorkingHours: Working content is empty');
        }

    }
    catch (ex) {
        console.log('FnWorkingHours error:' + ex.description);
        throw new Error(ex);
        return 'error'
    }
};

function FnHolidayList(HolidayContent, CallBack) {
    try {

        if (HolidayContent != null) {

            console.log('HolidayContent values');
            console.log(HolidayContent);

            var query = db.escape(HolidayContent.LocID) + ',' + db.escape(0);
            db.query('CALL pGetHolidayList(' + query + ')', function (err, HolidayResult) {
                console.log('CALL pGetHolidayList(' + query + ')');

                if (!err) {

                    if(HolidayResult != null)
                    {
                        if(HolidayResult[0].length > 0 )
                        {
                            console.log('FnHolidayList: Holiday List are available');
                            CallBack(null, HolidayResult[0]);
                        }
                        else
                        {
                            console.log('FnHolidayList: No Holiday List avaiable');
                            CallBack(null,null);
                        }
                    }
                    else{
                        console.log('FnHolidayList: No Holiday List avaiable');
                        CallBack(null,null);
                    }
                }
                else {
                    console.log('FnHolidayList: sending holiday list error ' + error);
                    CallBack(null, null);
                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnHolidayList: holiday list content is empty');
        }

    }
    catch (ex) {
        console.log('FnHolidayList error:' + ex.description);
        throw new Error(ex);
        return 'error'
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
        throw new Error(ex);
    }
};

//below method get item list details based on  ezeid
exports.FnGetItemListForEZEID = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var FunctionType = req.query.FunctionType;
        var EZEID = req.query.EZEID;
        if(Token == "")
            Token= null;
        if (Token != null && FunctionType != null && EZEID != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        console.log('CALL pItemListforEZEID(' +  db.escape(FunctionType)  + ',' + db.escape(EZEID) + ')');
                        db.query('CALL pItemListforEZEID(' +  db.escape(FunctionType)  + ',' + db.escape(EZEID) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult[0] != null) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnGetItemListForEZEID: Item list details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {
                                        console.log('FnGetItemListForEZEID:No Item list details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetItemListForEZEID:No Item list details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetItemListForEZEID: error in getting Item list details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetItemListForEZEID: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetItemListForEZEID: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetItemListForEZEID: Token is empty');
            }
            else if (FunctionType == null) {
                console.log('FnGetItemListForEZEID: FunctionType is empty');
            }
            else if (EZEID == null) {
                console.log('FnGetItemListForEZEID: EZEID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetItemListForEZEID error:' + ex.description);
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
    }
};

exports.FnSaveMailTemplate = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var Title = req.body.Title;
        var FromName = req.body.FromName;
        var FromEmailID = req.body.FromEmailID;
        var CCMailIDS = req.body.CCMailIDS;
        var BCCMailIDS = req.body.BCCMailIDS;
        var Subject  = req.body.Subject;
        var Body = req.body.Body;

        var RtnMessage = {
            IsSuccessfull: false
        };

        if (Token != null && Title != null && FromName != null && FromEmailID != null && Subject != null && Body != null ) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var query = db.escape(Token) + ', ' +db.escape(Title) + ',' + db.escape(FromName) + ',' + db.escape(FromEmailID)
                            + ',' + db.escape(CCMailIDS) + ',' + db.escape(BCCMailIDS) + ',' + db.escape(Subject) + ',' + db.escape(Body);
                        db.query('CALL pSaveMailTemplate(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    res.send(RtnMessage);
                                    console.log('FnSaveMailTemplate: Mail Template save successfully');
                                }
                                else {
                                    console.log('FnSaveMailTemplate:No save  Mail Template');
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveMailTemplate: error in saving  Mail Template' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveMailTemplate: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveMailTemplate:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if (Token == null) {
                console.log('FnSaveMailTemplate: Token is empty');
            }
            else if (Title == null) {
                console.log('FnSaveMailTemplate: Title is empty');
            }
            else if (FromName == null) {
                console.log('FnSaveMailTemplate: FromName is empty');
            }
            else if (FromEmailID == null) {
                console.log('FnSaveMailTemplate: FromEmailID is empty');
            }
            else if (Subject == null) {
                console.log('FnSaveMailTemplate: Subject is empty');
            }
            else if (Body == null) {
                console.log('FnSaveMailTemplate: Body is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveMailTemplate:error ' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetTemplateList = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pgetAllMailtemplate(' + db.escape(Token) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetTemplateList: Template list Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {
                                        console.log('FnGetTemplateList:No Template list found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetTemplateList:No Template list found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetTemplateList: error in getting Template list' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetTemplateList: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetTemplateList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetTemplateList: Token is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetTemplateList error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetTemplateDetails = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var TID = req.query.TID;

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        //var query = db.escape(Token) + ', ' +db.escape(TID);
                        db.query('CALL pgetMailtemplateDetails(' + db.escape(TID) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnGetTemplateDetails: Template Details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {
                                        console.log('FnGetTemplateDetails:No Template Details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetTemplateDetails:No Template Details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetTemplateDetails: error in getting Template Details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetTemplateDetails: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetTemplateDetails: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetTemplateDetails: Token is empty');
            }
            else if (TID == null) {
                console.log('FnGetTemplateDetails: TID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetTemplateDetails error:' + ex.description);
        throw new Error(ex);
    }
};

//method to send bulk mailer
exports.FnSendBulkMailerOld = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = req.body.TID;
        var TemplateID = req.body.TemplateID;
        var Attachment = req.body.Attachment;
        var AttachmentFileName = req.body.AttachmentFileName;
        var ToMailID = req.body.ToMailID;

        var RtnResponse = {
            IsSent: false
        };
        if(TID != null) {

            if (Token != null && Token != ' ' && TID != null && TID != ' ' && TemplateID != null && TemplateID != ' ') {
                FnValidateToken(Token, function (err, Result) {
                    if (!err) {
                        if (Result != null) {
                            //var query = db.escape(Token) + ', ' +db.escape(TID);
                            var query ='Select FirstName, LastName, CompanyName,ifnull(SalesMailID,"shailesh.singh009@gmail.com") as SalesMailID from tmaster where TID in (' + TID + ')' ;
                            console.log(query);
                            db.query(query, function (err, GetResult) {
                                if (!err) {
                                    if (GetResult != null) {
                                        console.log(GetResult);
                                        if (GetResult.length > 0)  {
                                            var templateQuery = 'Select * from mmailtemplate where TID = ' + db.escape(TemplateID);
                                            db.query(templateQuery, function(err, TemplateResult){
                                                if(!err){
                                                    if(TemplateResult != null) {
                                                        if(TemplateResult.length > 0){
                                                            console.log(TemplateResult);
                                                            RtnResponse.IsSent = true;
                                                            for(var i = 0; i < GetResult.length; i++){
                                                                if(GetResult[i].SalesMailID != null && GetResult[i].SalesMailID != ''){

                                                                    var mailOptions = {
                                                                        replyto: (TemplateResult[0].FromMailID != 'undefined') ?TemplateResult[0].FromMailID : " ",
                                                                        to: GetResult[i].SalesMailID,
                                                                        subject: TemplateResult[0].Subject,
                                                                        html: TemplateResult[0].Body, // html body
                                                                    };
                                                                    mailOptions.html = mailOptions.html.replace("[FirstName]", GetResult[0].FirstName);
                                                                    mailOptions.html = mailOptions.html.replace("[LastName]", GetResult[0].LastName);
                                                                    mailOptions.html = mailOptions.html.replace("[CompanyName]",GetResult[0].CompanyName);

                                                                    console.log(mailOptions.html);
                                                                    var post = { MessageType: 9, Priority: 5, ToMailID: GetResult[i].SalesMailID, Subject: mailOptions.subject, Body:mailOptions.html, Replyto:mailOptions.replyto };

                                                                    //console.log(post);
                                                                    var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                                        // Neat!
                                                                        if (!err) {
                                                                            console.log(result);
                                                                            console.log('FnSendBulkMailer: Mail saved Successfully');

                                                                            //CallBack(null, RtnMessage);
                                                                        }
                                                                        else {
                                                                            console.log('FnSendBulkMailer: Mail not Saved Successfully');
                                                                            // CallBack(null, null);
                                                                        }
                                                                    });
                                                                    console.log('FnSendBulkMailer:Mail details sent for processing');
                                                                    console.log(mailOptions);
                                                                }
                                                                else
                                                                {
                                                                    console.log('FnSendBulkMailer:Sales Mail Id is empty');
                                                                    //res.json(null);
                                                                }
                                                            }
                                                            res.send(RtnResponse);

                                                        }
                                                        else
                                                        {
                                                            console.log('FnGetTemplateDetails:No Template Details found');
                                                            res.json(null);
                                                        }
                                                    }
                                                    else
                                                    {
                                                        console.log('FnGetTemplateDetails:No Template Details found');
                                                        res.json(null);
                                                    }
                                                }
                                                else
                                                {
                                                    console.log('FnGetTemplateDetails:Error in getting template '+ err);
                                                    res.json(null);
                                                }
                                            });
                                        }
                                        else {
                                            console.log('FnGetTemplateDetails:User Details not available');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetTemplateDetails:No User Details not available');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetTemplateDetails: User Details not available' + err);
                                    res.statusCode = 500;
                                    res.json(null);
                                }
                            });
                        }
                        else {
                            res.statusCode = 401;
                            res.json(null);
                            console.log('FnSendBulkMailer: Invalid Token');
                        }
                    } else {
                        res.statusCode = 500;
                        res.json(null);
                        console.log('FnSendBulkMailer: Error in validating token:  ' + err);
                    }
                });
            }
        }
        else
        {
            if (Token != null  && Attachment != null && AttachmentFileName != null && ToMailID != null) {
                FnValidateToken(Token, function (err, Result) {
                    if (!err) {
                        if (Result != null) {
                            var mailOptions = {
                                To: ToMailID,
                                subject: 'test subject',
                                html: 'test body', // html body
                                Attachment:Attachment,
                                AttachmentFileName:AttachmentFileName
                            };

                            var post = { MessageType:10, Priority: 5,ToMailID: mailOptions.To, Subject: mailOptions.subject, Body: mailOptions.html, Attachment:mailOptions.Attachment,AttachmentFileName:mailOptions.AttachmentFileName};

                            console.log(post);
                            var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                // Neat!
                                if (!err) {
                                    console.log(result);
                                    console.log('FnSendBulkMailer: Mail saved Successfully');
                                    RtnResponse.IsSent = true;
                                    res.send(RtnResponse);
                                }
                                else {
                                    console.log('FnSendBulkMailer: Mail not Saved Successfully');
                                    res.send(RtnResponse);
                                }
                            });
                            console.log('FnSendBulkMailer:Mail details sent for processing');
                            console.log(mailOptions);
                        }
                        else {
                            res.statusCode = 401;
                            res.json(null);
                            console.log('FnSendBulkMailer: Invalid Token');
                        }
                    } else {
                        res.statusCode = 500;
                        res.json(null);
                        console.log('FnSendBulkMailer: Error in validating token:  ' + err);
                    }
                });
            }

            else {
                if (Token == null) {
                    console.log('FnSendBulkMailer: Token is empty');
                }
                else if (ToMailID == null) {
                    console.log('FnSendBulkMailer: ToMailID is empty');
                }
                else if (Attachment == null) {
                    console.log('FnSendBulkMailer: Attachment is empty');
                }
                else if (AttachmentFileName == null) {
                    console.log('FnSendBulkMailer: AttachmentFileName is empty');
                }
                res.statusCode=400;
                res.json(null);
            }
        }
    }
    catch (ex) {
        console.log('FnGetTemplateDetails error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnSendBulkMailer = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var TID = req.body.TID;
        var TemplateID = req.body.TemplateID;
        var Attachment = req.body.Attachment;
        var AttachmentFileName = req.body.AttachmentFileName;
        var ToMailID = req.body.ToMailID;
        var OutputFileName='';
        if (TID == '')
            TID = null;

        var RtnResponse = {
            IsSent: false
        };
        if (TID != null) {

            if (Token != null && Token != '' && TID != null && TID != '' && TemplateID != null && TemplateID != '') {
                FnValidateToken(Token, function (err, Result) {
                    if (!err) {
                        if (Result != null) {
                            //var query = db.escape(Token) + ', ' +db.escape(TID);
                            var query = 'Select FirstName, LastName, CompanyName,ifnull(SalesMailID," ") as SalesMailID from tmaster where TID in (' + TID + ')';
                            console.log(query);
                            db.query(query, function (err, GetResult) {
                                if (!err) {
                                    if (GetResult != null) {

                                        console.log(GetResult[0]);

                                        if (GetResult.length > 0) {
                                            var templateQuery = 'Select * from mmailtemplate where TID = ' + db.escape(TemplateID);
                                            db.query(templateQuery, function (err, TemplateResult) {
                                                if (!err) {
                                                    if (TemplateResult != null) {
                                                        if (TemplateResult.length > 0) {
                                                            console.log(TemplateResult);
                                                            RtnResponse.IsSent = true;
                                                            for (var i = 0; i < GetResult.length; i++) {
                                                                if (GetResult[i].SalesMailID != null && GetResult[i].SalesMailID != ' ') {

                                                                    var mailOptions = {
                                                                        replyto: (TemplateResult[0].FromMailID != 'undefined') ? TemplateResult[0].FromMailID : " ",
                                                                        to: GetResult[i].SalesMailID,
                                                                        subject: TemplateResult[0].Subject,
                                                                        html: TemplateResult[0].Body, // html body
                                                                    };
                                                                    mailOptions.html = mailOptions.html.replace("[FirstName]", GetResult[0].FirstName);
                                                                    mailOptions.html = mailOptions.html.replace("[LastName]", GetResult[0].LastName);
                                                                    mailOptions.html = mailOptions.html.replace("[CompanyName]", GetResult[0].CompanyName);

                                                                    //console.log(mailOptions.html);
                                                                    var post = {
                                                                        MessageType: 9,
                                                                        Priority: 5,
                                                                        ToMailID: GetResult[i].SalesMailID,
                                                                        Subject: mailOptions.subject,
                                                                        Body: mailOptions.html,
                                                                        Replyto: mailOptions.replyto
                                                                    };

                                                                    //console.log(post);
                                                                    var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                                        // Neat!
                                                                        if (!err) {
                                                                            console.log(result);
                                                                            console.log('FnSendBulkMailer: Mail saved Successfully');

                                                                            //CallBack(null, RtnMessage);
                                                                        }
                                                                        else {
                                                                            console.log('FnSendBulkMailer: Mail not Saved Successfully');
                                                                            // CallBack(null, null);
                                                                        }
                                                                    });
                                                                    console.log('FnSendBulkMailer:Mail details sent for processing');
                                                                    //console.log(mailOptions);
                                                                }
                                                                else {
                                                                    console.log('FnSendBulkMailer:Sales Mail Id is empty');
                                                                    //res.json(null);
                                                                }
                                                            }
                                                            res.send(RtnResponse);

                                                        }
                                                        else {
                                                            console.log('FnGetTemplateDetails:No Template Details found');
                                                            res.json(null);
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnGetTemplateDetails:No Template Details found');
                                                        res.json(null);
                                                    }
                                                }
                                                else {
                                                    console.log('FnGetTemplateDetails:Error in getting template ' + err);
                                                    res.json(null);
                                                }
                                            });
                                        }
                                        else {
                                            console.log('FnGetTemplateDetails:User Details not available');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetTemplateDetails:No User Details not available');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetTemplateDetails: User Details not available' + err);
                                    res.statusCode = 500;
                                    res.json(null);
                                }
                            });
                        }
                        else {
                            res.statusCode = 401;
                            res.json(null);
                            console.log('FnSendBulkMailer: Invalid Token');
                        }
                    } else {
                        res.statusCode = 500;
                        res.json(null);
                        console.log('FnSendBulkMailer: Error in validating token:  ' + err);
                    }
                });
            }
            else{
                if (Token == null) {
                    console.log('FnSendBulkMailer: Token is empty');
                }
                else if (TID == null) {
                    console.log('FnSendBulkMailer: TID is empty');
                }
                else if (TemplateID == null) {
                    console.log('FnSendBulkMailer: TemplateID is empty');
                }
            }
        }
        else {
            var fs = require('fs');

            if (Token != null && Attachment != null && AttachmentFileName != null && ToMailID != null) {
                FnValidateToken(Token, function (err, Result) {
                    if (!err) {
                        if (Result != null) {
                            var query = db.escape(Token);
                            console.log('CALL pSendMailerDetails(' + query + ')');
                            db.query('CALL pSendMailerDetails(' + query + ')', function (err, Result) {

                                if (!err) {
                                    if (Result.length > 0) {
                                        var output = Result[0];
                                        OutputFileName = output[0].Name;
                                        var EZEID = output[0].EZEID;

                                        console.log(OutputFileName+'.pdf');
                                        console.log('FnSendBulkMailer:UserDetails found..');

                                    }
                                    else{
                                        console.log('FnSendBulkMailer:No EZEID NAME found..');

                                    }
                                }
                                else{
                                    console.log('FnSendBulkMailer:Error in finding EZEID NAME');

                                }
                                fs.readFile("./MailContentTemplate.txt/", "utf8", function (err, data) {
                                    if (!err){
                                        data = data.replace("[EZEIDNAME]", OutputFileName);
                                        data = data.replace("[EZEID]", EZEID);
                                        console.log('FnSendBulkMailer:Replace name send successfully');

                                    }
                                    else
                                    {
                                        console.log('FnSendBulkMailer:Error in getting template file');


                                    }

                                    var pdfDocument = require('pdfkit');
                                    //var doc = new pdfDocument();
                                    var doc = new pdfDocument({
                                        size: 'A1',
                                        layout: 'portrait'
                                    });

                                    var bufferData = new Buffer(Attachment.replace(/^data:image\/(png|gif|jpeg|jpg);base64,/, ''), 'base64');
                                    var pdfdoc = doc.image(bufferData);
                                    //console.log(bufferData);

                                    var ws = fs.createWriteStream('./TempMapLocationFile/'+OutputFileName+'.pdf');
                                    var stream = doc.pipe(ws);
                                    doc.end();

                                    doc.on('end',function(){
                                        stream.end();
                                    });

                                    stream.on('end',function(){
                                        stream.close();
                                    });

                                    stream.on('close',function(){
                                        fs.exists('./TempMapLocationFile/'+OutputFileName+'.pdf', function (exists) {

                                            if (exists) {
                                                var bufferPdfDoc = fs.readFileSync('./TempMapLocationFile/'+OutputFileName+'.pdf');
                                                console.log(bufferPdfDoc);
                                                // convert binary data to base64 encoded string
                                                var Base64PdfData = new Buffer(bufferPdfDoc).toString('base64');
                                                //console.log(Base64PdfData);
                                                //fs.writeFileSync('base64.txt', Base64PdfData);
                                                fs.unlinkSync('TempMapLocationFile/'+OutputFileName+'.pdf');
                                                console.log('successfully deleted TempMapLocationFile/'+OutputFileName+'.pdf');

                                                var mailOptions = {
                                                    To: ToMailID,
                                                    subject: 'Route Map',
                                                    html: data, // html body
                                                    Attachment: Base64PdfData,
                                                    AttachmentFileName: OutputFileName+'.pdf'
                                                };

                                                var post = {
                                                    MessageType: 10,
                                                    Priority: 5,
                                                    ToMailID: mailOptions.To,
                                                    Subject: mailOptions.subject,
                                                    Body: mailOptions.html,
                                                    Attachment: mailOptions.Attachment,
                                                    AttachmentFileName: mailOptions.AttachmentFileName
                                                };

                                                //console.log(post);
                                                var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                    // Neat!
                                                    if (!err) {
                                                        //console.log(result);
                                                        console.log('FnSendBulkMailer: Mail saved Successfully');
                                                        RtnResponse.IsSent = true;
                                                        res.send(RtnResponse);
                                                    }
                                                    else {
                                                        console.log('FnSendBulkMailer: Mail not Saved Successfully');
                                                        res.send(RtnResponse);
                                                    }
                                                });

                                                console.log('FnSendBulkMailer:Mail details sent for processing');


                                            }
                                            else {
                                                res.json(null);
                                            }
                                        });

                                    });
                                });
                            });
                        }
                        else {
                            res.statusCode = 401;
                            res.json(null);
                            console.log('FnSendBulkMailer: Invalid Token');
                        }
                    } else {
                        res.statusCode = 500;
                        res.json(null);
                        console.log('FnSendBulkMailer: Error in validating token:  ' + err);

                    }
                });
            }

            else {
                if (Token == null) {
                    console.log('FnSendBulkMailer: Token is empty');
                }
                else if (ToMailID == null) {
                    console.log('FnSendBulkMailer: ToMailID is empty');
                }
                else if (Attachment == null) {
                    console.log('FnSendBulkMailer: Attachment is empty');
                }
                else if (AttachmentFileName == null) {
                    console.log('FnSendBulkMailer: AttachmentFileName is empty');
                }
                res.statusCode = 400;
                res.json(null);
            }
        }
    }
    catch (ex) {
        console.log('FnGetTemplateDetails error:' + ex.description);
        throw new Error(ex);
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

exports.FnGetSearchItem = function(req,res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var FunctionType = req.query.FunctionType;
        var ItemTitle = req.query.ItemTitle;

        if(Token != null && FunctionType != null && ItemTitle != null){
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var SearchQuery = db.escape(Token) + ',' + db.escape(FunctionType) + ',' + db.escape(ItemTitle);
                        db.query('CALL PGetItemAutocomplete(' + SearchQuery + ')', function (err, SearchResult) {
                            if (!err) {
                                if (SearchResult[0].length > 0) {
                                    res.send(SearchResult[0]);
                                    console.log('FnGetSearchItem:Items sent successfully');
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetSearchItem:No items found');
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.json(null);
                                console.log('FnGetSearchItem:Error in getting Search items' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnGetSearchItem: Invalid token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetSearchItem: Token error: ' + err);
                    res.statusCode = 500;
                    res.json(null);

                }
            });
        }
        else {
            if (Token = null) {
                console.log('FnGetSearchItem: Token is empty');
            }
            else if (FunctionType == null) {
                console.log('FnGetSearchItem:FunctionType is empty');
            }
            else if (ItemTitle == null) {
                console.log('FnGetSearchItem: ItemTitle is empty');
            }

            res.statusCode = 400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetSearchItem error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnSaveChatMessage = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var ToEZEID = req.body.ToEZEID;
        var Type = req.body.Type;
        var MsgType = req.body.MsgType;
        var Msg = req.body.Msg;
        var GroupID = req.body.GroupID;
        console.log(req.body);
        if (!GroupID)
            GroupID = 0;
        var RtnMessage = {
            IsSuccessfull: false,

        };

        if(Token != null && ToEZEID != null && Type != null){
            FnValidateToken(Token, function (err, Result) {
                console.log(Result);
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(ToEZEID) + ',' + db.escape(Type)
                            + ',' + db.escape(MsgType) + ',' + db.escape(Msg) + ',' + db.escape(GroupID);
                        console.log('CALL pSaveChatMsg(' + query + ')');
                        db.query('CALL pSaveChatMsg(' + query + ')', function (err, InsertResult) {
                            console.log(InsertResult);
                            console.log(err);
                            if (!err) {
                                if (InsertResult != null) {

                                    RtnMessage.IsSuccessfull = true;

                                    res.send(RtnMessage);
                                    console.log('FnSaveChatMessage:Inserted sucessfully..');
                                }
                                else
                                {
                                    console.log('FnSaveChatMessage:No Inserted sucessfully..');
                                    res.send(RtnMessage);}
                            }
                            else
                            {
                                console.log('FnSaveChatMessage:Error in Insert..');
                                res.send(RtnMessage);
                            }
                        });

                    }
                    else {
                        res.statusCode = 401;
                        res.send(RtnMessage);
                        console.log('FnSaveChatMessage:Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnSaveChatMessage:Error in validating token:  ' + err);
                }
            });
        }
        else{
            if(Token == null){
                console.log('FnSaveChatMessage:Token is empty');
            }
            else if (FromEZEID == null){
                console.log('FnSaveChatMessage:FromEZEID is empty');
            }
            else if (ToEZEID == null){
                console.log('FnSaveChatMessage:ToEZEID is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnSaveChatMessage: error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnCreateGroup = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var GroupTitle = req.body.GroupTitle;

        var RtnMessage = {
            IsSuccessfull: false,
            GroupID:0
        };
        if(Token != null && GroupTitle != null){
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(GroupTitle);

                        console.log('CALL pCreateGroup(' + query + ')');
                        db.query('CALL pCreateGroup(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                if (InsertResult != null){
                                    var Temp = InsertResult[0];
                                    RtnMessage.IsSuccessfull = true;
                                    RtnMessage.GroupID = Temp[0].GroupID;
                                    res.send(RtnMessage);
                                    console.log('FnCreateGroup:Inserted sucessfully..');
                                }
                                else
                                {
                                    console.log('FnCreateGroup:No Inserted sucessfully..');
                                    res.send(RtnMessage);}
                            }
                            else
                            {
                                console.log('FnCreateGroup:Error in Insert..');
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.send(RtnMessage);
                        console.log('FnCreateGroup:Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnCreateGroup:Error in validating token:  ' + err);
                }
            });
        }
        else{
            if(Token == null ){
                console.log('FnCreateGroup:Token is empty');
            }
            else if(GroupTitle == null ){
                console.log('FnCreateGroup:GroupTitle is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnSaveGroupChatList: Error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetGroupList = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        if(Token !=  null){
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var Query =
                            db.query('CALL pGetGroupList(' + db.escape(Token) + ')', function (err, GetResult) {
                                if (!err) {
                                    console.log(GetResult);
                                    if (GetResult != null) {
                                        if (GetResult.length > 0) {
                                            console.log('FnGetGroupList: GroupList Send successfully');
                                            res.send(GetResult[0]);
                                        }
                                        else {
                                            console.log('FnGetGroupList: No GroupList found');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetGroupList: No GroupList found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetGroupList: error in getting GroupList' + err);
                                    res.statusCode = 500;
                                    res.json(null);
                                }
                            });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetGroupList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetGroupList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetGroupList: Token is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetGroupList error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnSaveGroupMembers = function(req, res){
    try{

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var GroupID = req.body.GroupID;
        var EZEID = req.body.EZEID;

        var RtnMessage = {
            IsSuccessfull:false,
            MemberID:0
        };

        if(Token !=  null && GroupID != null && EZEID != null){
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(GroupID)+ ',' + db.escape(EZEID);
                        console.log('CALL pSaveGroupMembers(' + query + ')');
                        db.query('CALL pSaveGroupMembers(' + query + ')', function (err, InsertResult) {
                            console.log(InsertResult[0]);
                            console.log(err);
                            if (!err) {
                                if (InsertResult[0] != null) {
                                    console.log('err.........');
                                    var Temp = InsertResult[0];
                                    RtnMessage.IsSuccessfull = true;
                                    RtnMessage.MemberID = Temp[0].MemberID;
                                    res.send(RtnMessage);
                                    console.log('FnSaveGroupMembers:Inserted sucessfully..');
                                }
                                else
                                {
                                    console.log('FnSaveGroupMembers:No Inserted sucessfully..');
                                    res.send(RtnMessage);
                                }
                            }
                            else
                            {
                                console.log('FnSaveGroupMembers:Error in getting insert group members..');
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.send(RtnMessage);
                        console.log('FnAddGroupMembers:Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnAddGroupMembers:Error in validating token:  ' + err);
                }
            });
        }
        else{
            if(Token == null ){
                console.log('FnSaveGroupMembers:Token is empty');
            }
            else if(GroupID == null ){
                console.log('FnSaveGroupMembers:GroupID is empty');
            }
            else if(EZEID == null ){
                console.log('FnSaveGroupMembers:EZEID is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnSaveGroupMembers: Error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetMembersList = function(req, res){
    try{

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var GroupID = req.query.GroupID;

        if(Token !=  null && GroupID != null){
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetMembersList(' + db.escape(GroupID) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnGetMembersList: Members List Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {
                                        console.log('FnGetMembersList:No Members List found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetMembersList:No Members List found');
                                    res.json(null);
                                }

                            }
                            else {
                                console.log('FnGetMembersList: error in getting group members list' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetMembersList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetMembersList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetMembersList: Token is empty');
            }
            else if (GroupID == null) {
                console.log('FnGetMembersList: GroupID is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetMembersList error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnDeleteGroupMembers = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var MemberID = req.query.MemberID;

        var RtnMessage = {
            IsSuccessfull: false,
            Message:''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token !=null && MemberID != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(MemberID);
                        console.log('CALL pDeleteGroupMembers(' + query + ')');
                        db.query('CALL pDeleteGroupMembers(' + query + ')', function (err, DeleteResult) {
                            console.log(err);
                            if (!err){
                                if (DeleteResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    RtnMessage.Message = 'Delete Successfully';
                                    res.send(RtnMessage);
                                    console.log('FnDeleteGroupMembers: Group members delete successfully');
                                }
                                else {
                                    console.log('FnDeleteGroupMembers:No delete Group members');
                                    RtnMessage.Message = 'No Deleted';
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnDeleteGroupMembers: error in deleting Group members' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteGroupMembers: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteGroupMembers:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnDeleteGroupMembers: Token is empty');
            }
            else if (MemberID == null) {
                console.log('FnDeleteGroupMembers: MemberID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnDeleteGroupMembers:error ' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetChatDetails = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var ChatType = req.query.ChatType;
        var ToEZEID = req.query.ToEZEID;

        if(Token !=  null){
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var Query = db.escape(Token) + ',' + db.escape(ChatType) + ',' + db.escape(ToEZEID);
                        db.query('CALL pGetChatDetails(' + Query + ')', function (err, GetResult) {
                            if (!err) {

                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnGetChatDetails: Chat details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {
                                        console.log('FnGetChatDetails: No Chat details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetChatDetails: No Chat details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetChatDetails: error in getting GroupList' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetChatDetails: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetChatDetails: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetChatDetails: Token is empty');
            }
            if (ChatType == null) {
                console.log('FnGetChatDetails: ChatType is empty');
            }
            if (ToMasterID == null) {
                console.log('FnGetChatDetails: ToMasterID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetChatDetails error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetChatList = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var ChatType = req.query.ChatType;
        var ToEZEID = req.query.ToEZEID;

        if(Token !=  null){
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var Query = db.escape(Token) + ',' + db.escape(ChatType) + ',' + db.escape(ToEZEID);
                        db.query('CALL pGetChatList(' + Query + ')', function (err, GetResult) {
                            if (!err) {

                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {
                                        console.log('FnGetChatList: Chat details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {
                                        console.log('FnGetChatList: No Chat details found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetChatList: No Chat details found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetChatList: error in getting GroupList' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetChatList: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetChatList: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetChatList: Token is empty');
            }
            if (ChatType == null) {
                console.log('FnGetChatList: ChatType is empty');
            }
            if (ToMasterID == null) {
                console.log('FnGetChatList: ToMasterID is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        console.log('FnGetChatList error:' + ex.description);
        throw new Error(ex);
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
        throw new Error(ex);
    }
};

//mehtod to save the reservation resource
exports.FnSaveReservationResource = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = parseInt(req.body.TID);
        var picture = (req.body.picture) ? ((req.body.picture.trim().length > 0) ? req.body.picture : null ) : null ;;
        var title = (req.body.title) ? ((req.body.title.trim().length > 0) ? req.body.title : null ) : null ;;
        var description = req.body.description;
        var status = (parseInt(req.body.status)=== 1 || parseInt(req.body.status) === 2) ? req.body.status : 1;
        var operatorid = req.body.operatorid ? req.body.operatorid : '';
        var workingtemp = req.body.working_temp ? req.body.working_temp : 0;
        if (TID.toString() == 'NaN')
            TID = 0;
        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!picture){
            responseMessage.error['picture'] = 'Invalid Picture';
            validateStatus *= false;
        }

        if(!title){
            responseMessage.error['title'] = 'Invalid Title';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnSaveReservationResource  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save resource ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token && operatorid) {
            FnValidateToken(Token, function (err, result) {
                if (!err) {
                    if (result != null) {

                        var query = db.escape(Token) + ', ' + db.escape(TID) + ',' + db.escape(picture) + ',' + db.escape(title) + ',' + db.escape(description) + ',' + db.escape(status)+ ',' + db.escape(operatorid) + ',' + db.escape(workingtemp);
                        db.query('CALL pSaveResource(' + query + ')', function (err, insertResult) {
                            if (!err){
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Resource details save successfully';
                                    responseMessage.data = {
                                        TID : insertResult[0][0].maxid,
                                        title : req.body.title,
                                        status : req.body.status,
                                        description : req.body.description,
                                        picture : req.body.picture
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveReservationResource: Resource details save successfully');
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveReservationResource:No save Resource details');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnSaveReservationResource: error in saving Resource details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveReservationResource: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveReservationResource:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnSaveReservationResource: Token is mandatory field');
            }
            else if(!operatorid)
            {
                responseMessage.message = 'Invalid Operator ID';
                responseMessage.error = {operatorid : 'Invalid Operator ID'};
                console.log('FnSaveReservationResource: Operator ID is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnSaveReservationResource:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }
};

//mehtod to save the reservation service
exports.FnSaveReservationService = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = 0;
        var title = (req.body.title) ? ((req.body.title.trim().length > 0) ? req.body.title : null ) : null ;;
        var duration = req.body.duration;
        var rate = req.body.rate;
        var status = (parseInt(req.body.status)=== 1 || parseInt(req.body.status) === 2) ? req.body.status : 1;
        var service_ids = req.body.service_ids ? req.body.service_ids : 0;

        var ID=''
        if(service_ids){
            ID = service_ids + ',' + ID;
            service_ids =ID.slice(0,-1);
            console.log('service_ids Values:'+ service_ids);
        }

        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!title){
            responseMessage.error['title'] = 'Invalid Title';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnSaveReservationService  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save service ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }


        if (Token) {

            FnValidateToken(Token, function (err, result) {
                if (!err) {
                    if (result != null) {

                        var query = db.escape(Token) + ', ' + db.escape(TID) + ',' + db.escape(title) + ',' + db.escape(duration) + ',' + db.escape(rate) + ',' + db.escape(status)+ ',' + db.escape(service_ids);
                        db.query('CALL pSaveResServices(' + query + ')', function (err, insertResult) {
                            if (!err){
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Service details save successfully';
                                    responseMessage.data = {
                                        TID : insertResult[0][0].maxid,
                                        title : req.body.title,
                                        status : req.body.status,
                                        duration : req.body.duration,
                                        rate : req.body.rate,
                                        service_ids : req.body.service_ids
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveReservationService: Service details save successfully');
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveReservationService:No Service details saved');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnSaveReservationService: error in saving Service details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveReservationService: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveReservationService:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnSaveReservationService: Token is mandatory field hello');
            }
            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnSaveReservationService:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }
};

//method to update the reservation service
exports.FnUpdateReservationService = function(req, res){

    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = parseInt(req.body.TID);
        var title = (req.body.title) ? ((req.body.title.trim().length > 0) ? req.body.title : null ) : null ;;
        var duration = req.body.duration;
        var rate = req.body.rate;
        var status = (parseInt(req.body.status)=== 1 || parseInt(req.body.status) === 2) ? req.body.status : 1;
        var service_ids = req.body.service_ids;

        var ID=''
        if(service_ids){

            ID = service_ids + ',' + ID;
            var service_IDS =ID.slice(0,-1);
            console.log('service_ids Values:'+ service_IDS);
        }

        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!title){
            responseMessage.error['title'] = 'Invalid Title';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnUpdateReservationService  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to update service ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token) {
            FnValidateToken(Token, function (err, result) {
                if (!err) {
                    if (result != null) {

                        var query = db.escape(Token) + ', ' + db.escape(TID) + ',' + db.escape(title) + ',' + db.escape(duration) + ',' + db.escape(rate) + ',' + db.escape(status)+ ',' + db.escape(service_IDS);
                        db.query('CALL pSaveResServices(' + query + ')', function (err, insertResult) {
                            if (!err){
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Service details update successfully';
                                    responseMessage.data = {
                                        TID : req.body.TID,
                                        title : req.body.title,
                                        status : req.body.status,
                                        duration : req.body.duration,
                                        rate : req.body.rate,
                                        service_ids : req.body.service_ids
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateReservationService: Service details update successfully');
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnUpdateReservationService:No Service details updated');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnUpdateReservationService: error in saving Service details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnUpdateReservationService: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnUpdateReservationService:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnUpdateReservationService: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnUpdateReservationService:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }
};

//method to get reservation resource service details
exports.FnGetReservationService = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var ezeid = req.query.ezeid;
        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (ezeid) {
            db.query('CALL pGetResServices(' + db.escape(ezeid) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0];
                            responseMessage.error = null;
                            responseMessage.message = 'Service details Send successfully';
                            console.log('FnGetReservationService: Service details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded service details';
                            console.log('FnGetReservationService: No founded Service details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No Service details found';
                        console.log('FnGetReservationService: No Service details found');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Service details';
                    console.log('FnGetReservationService: error in getting Service details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }
        else {
            if (!Token) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {
                    ezeid : 'Invalid ezeid'
                };
                console.log('FnGetReservationService: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetReservationService:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }
};

//method to get resource and service map
exports.FnGetReservResourceServiceMap = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var ezeid = req.query.ezeid;
        var responseMessage = {
            status: false,
            data: null,
            error:{},
            Message:''
        };

        if (ezeid) {

            db.query('CALL pGetResResourceServiceMap(' + db.escape(ezeid) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'ResourceServiceMap details Send successfully';
                            console.log('FnGetReservResourceServiceMap: ResourceServiceMap details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded ResourceServiceMap details';
                            console.log('FnGetReservResourceServiceMap: No founded ResourceServiceMap details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No ResourceServiceMap details found';
                        console.log('FnGetReservResourceServiceMap: No ResourceServiceMap details found');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting ResourceServiceMap details';
                    console.log('FnGetReservResourceServiceMap: error in getting ResourceServiceMap details' + err);
                    res.status(500).json(responseMessage);
                }
            });

        }
        else {
            if (!ezeid) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {
                    ezeid : 'Invalid ezeid'
                };
                console.log('FnGetReservResourceServiceMap: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetReservResourceServiceMap:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }
};

//method to save the resource and service map
exports.FnSaveReservResourceServiceMap = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var resourceid = req.body.resourceid;
        var serviceids = req.body.serviceids;

        var ID=''
        if(serviceids){
            ID = serviceids + ',' + ID;
            serviceids =ID.slice(0,-1);
            console.log(serviceids);
        }
        service_id = serviceids.concat(',');
        console.log('service_ids Values:'+ service_id);
        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!resourceid){
            responseMessage.error['resourceid'] = 'Invalid Resourceid';
            validateStatus *= false;
        }

        if(!serviceids){
            responseMessage.error['serviceids'] = 'Invalid Service_ids';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnSaveReservResServiceMap  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save resource and service ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token) {
            FnValidateToken(Token, function (err, result) {
                if (!err) {
                    if (result != null) {
                        var query = db.escape(resourceid) + ',' + db.escape(service_id);
                        db.query('CALL pSaveResResourceServiceMap(' + query + ')', function (err, insertResult) {

                            if (!err){
                                if (insertResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'ResourceService Map details save successfully';
                                    responseMessage.data = {
                                        resourceid : req.body.resourceid,
                                        serviceids : service_id
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveReservResServiceMap: ResourceService Map details save successfully');

                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveReservResServiceMap:No save Resource details');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnSaveReservResServiceMap: error in saving Resource details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveReservResServiceMap: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveReservResServiceMap:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnSaveReservResServiceMap: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnSaveReservResServiceMap:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
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

//method to save reservation transaction
exports.FnSaveReservTransaction = function(req, res){
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token ;
        var TID = req.body.TID;
        var contactinfo = req.body.contactinfo;
        var toEzeid = req.body.toEzeid;
        var resourceid = req.body.resourceid;
        var res_datetime = new Date(req.body.res_datetime);
        var duration = req.body.duration;
        var status = req.body.status;
        var serviceid = req.body.serviceid;

        var ID=''
        if(serviceid){
            ID = serviceid + ',' + ID;
            serviceid =ID.slice(0,-1);
            console.log(serviceid);
        }



        var responseMessage = {
            status: false,
            error:{},
            message:'',
            data: null
        };
        var validateStatus = true;

        if(!toEzeid){
            responseMessage.error['toEzeid'] = 'Invalid toEzeid';
            validateStatus *= false;
        }

        if(!resourceid){
            responseMessage.error['resourceid'] = 'Invalid Resourceid';
            validateStatus *= false;
        }

        if(!serviceid){
            responseMessage.error['serviceid'] = 'Invalid Service_ids';
            validateStatus *= false;
        }


        if(!validateStatus){
            console.log('FnSaveReservTransaction  error : ' + JSON.stringify(responseMessage.error));
            responseMessage.message = 'Unable to save resource transaction ! Please check the errors';
            res.status(200).json(responseMessage);
            return;
        }

        if (Token) {
            FnValidateToken(Token, function (err, result) {
                if (!err) {
                    if (result != null) {

                        var query = db.escape(TID) + ',' + db.escape(Token) + ',' + db.escape(contactinfo) + ',' + db.escape(toEzeid) + ',' + db.escape(resourceid) + ',' + db.escape(res_datetime) + ',' + db.escape(duration) + ',' + db.escape(status) + ',' + db.escape(serviceid);
                        console.log(query);
                        console.log('CALL pSaveResTrans(' + query + ')');

                        db.query('CALL pSaveResTrans(' + query + ')', function (err, insertResult) {
                            console.log(insertResult);
                            console.log(err);
                            if (!err){
                                if (insertResult.affectedRows > 0) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Resource Transaction details save successfully';
                                    responseMessage.data = {
                                        resourceid : req.body.resourceid,
                                        serviceid : serviceid
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveReservTransaction: Resource Transaction details save successfully');

                                }
                                else {
                                    responseMessage.message = insertResult[0][0];
                                    responseMessage.error = {};
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveReservTransaction:No save Resource Transaction details');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {};
                                res.status(500).json(responseMessage);
                                console.log('FnSaveReservTransaction: error in saving Resource Transaction details:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveReservTransaction: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveReservTransaction:Error in processing Token' + err);
                }
            });

        }

        else {
            if (!Token)
            {
                responseMessage.message = 'Invalid Token';
                responseMessage.error = {Token : 'Invalid Token'};
                console.log('FnSaveReservTransaction: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }

    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnSaveReservTransaction:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }
};

//method to get reservation maped services
exports.FnGetMapedServices = function (req, res) {

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var ezeid = req.query.ezeid;
        var resourceid = req.query.resourceid;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (ezeid) {
            db.query('CALL pgetMapedservices(' + db.escape(ezeid) + ',' + db.escape(resourceid) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'service Maped details Send successfully';
                            console.log('FnGetMapedServices: service Maped details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded service Maped details';
                            console.log('FnGetMapedServices: No founded service Maped details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No founded service Maped details';
                        console.log('FnGetMapedServices: No founded service Maped details');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting service Maped details';
                    console.log('FnGetMapedServices: error in getting service Maped details' + err);
                    res.status(500).json(responseMessage);
                }
            });

        }
        else {
            if (!ezeid) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {
                    ezeid : 'Invalid ezeid'
                };
                console.log('FnGetMapedServices: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetReservTransaction:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }
};

//method to get reservation task
exports.FnGetReservTask = function (req, res) {

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var resourceid = req.query.resourceid;
        var date = new Date(req.query.date);
        var toEzeid = req.query.toEzeid;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (resourceid) {

            db.query('CALL pGetResTrans(' + db.escape(resourceid) + ',' + db.escape(date) + ',' + db.escape(toEzeid) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'Reservation Task details Send successfully';
                            console.log('FnGetReservTask: Reservation Task details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded Reservation Task details';
                            console.log('FnGetReservTask: No founded Reservation Task details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No founded Reservation Task details';
                        console.log('FnGetReservTask: No founded Reservation Task details');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Reservation Task details';
                    console.log('FnGetReservTask: error in getting Reservation Task details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!resourceid) {
                responseMessage.message = 'Invalid resourceid';
                responseMessage.error = {
                    resourceid : 'Invalid resourceid'
                };
                console.log('FnGetReservTask: resourceid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetReservTask:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }
};

//method to get trans details
exports.FnGetResTransDetails = function (req, res) {

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = req.query.TID;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (TID) {

            db.query('CALL pGetResTransDetails(' + db.escape(TID) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'Reservation Trans details Send successfully';
                            console.log('FnGetResTransDetails: Reservation Trans details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded Reservation Trans details';
                            console.log('FnGetResTransDetails: No founded Reservation Trans details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No founded Reservation Trans details';
                        console.log('FnGetResTransDetails: No founded Reservation Trans details');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Reservation Task details';
                    console.log('FnGetResTransDetails: error in getting Reservation Task details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!TID) {
                responseMessage.message = 'Invalid TID';
                responseMessage.error = {
                    resourceid : 'Invalid TID'
                };
                console.log('FnGetResTransDetails: TID is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetResTransDetails:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }
};

exports.FnPGetSkills = function(req,res){
    var responseMsg = {
        status : false,
        data : [],
        message : 'Unable to load skills ! Please try again',
        error : {
            server : 'An internal server error'
        }
    };

    try{
        db.query('CALL PGetSkills()',function(err,result){
            if(err){
                console.log('Error : FnPGetSkills ');
                res.status(400).json(responseMsg);
            }
            else{
                responseMsg.status = true;
                responseMsg.message = 'Skills loaded successfully';
                responseMsg.error = null;
                responseMsg.data = result[0];

                res.status(200).json(responseMsg);
            }
        });
    }

    catch(ex){
        res.status(500).json(responseMsg);
        console.log('Error : FnPGetSkills '+ ex.description);
        throw new Error('Error in FnPGetSkills');
    }
};

exports.FnChangeReservationStatus = function(req,res){

    var token = (req.body.Token && req.body.Token !== 2) ? req.body.Token : null;
    var tid = (req.body.tid && parseInt(req.body.tid) !== NaN) ? parseInt(req.body.tid) : null;
    var status = (req.body.status && parseInt(req.body.status) !== NaN) ? parseInt(req.body.status) : null;

    var responseMsg = {
        status : false,
        data : null,
        message : 'Please login to continue',
        error : {
            Token : 'Invalid Token'
        }
    };

    var validationFlag = true;
    if(!token){
        responseMsg.error['Token'] = 'Invalid Token';
        validationFlag *= false;
    }

    if(!tid){
        responseMsg.error['tid'] = 'Reservation Slot is empty';
        validationFlag *= false;
    }

    if(!status){
        responseMsg.error['status'] = 'Status cannot be empty';
        validationFlag *= false;
    }

    if(!validationFlag){
        res.status(401).json(responseMsg);
        return;
    }

    FnValidateToken(token,function(err,tokenRes){
        if(err || (!tokenRes)){
            res.status(401).json(responseMsg);
            return;
        }
        else{
            var queryParam = db.escape(tid) + ',' + db.escape(status);
            db.query('CALL PUpdateResTransStatus(' + queryParam + ')', function (err, updateRes) {
                if(err){
                    responseMsg.message = 'An error occurred ! Please try again';
                    responseMsg.error['server'] = 'Internal Server Error';
                    res.status(400).json(responseMsg);
                    console.log('FnChangeReservationStatus: An error occurred ! Please try again');

                }
                else{
                    if(updateRes.affectedRows > 0){
                        responseMsg['status'] = true;
                        responseMsg['error'] = null;
                        responseMsg['message'] = 'Status changed successfully';
                        responseMsg['data'] = {
                            tid : tid,
                            status : status
                        };
                        res.status(200).json(responseMsg);
                        console.log('FnChangeReservationStatus: Status changed successfully');
                    }
                    else{
                        responseMsg['status'] = false;
                        responseMsg['error'] = {server : 'An error occurred'};
                        responseMsg['message'] = 'Unable to update ! Please try again';
                        responseMsg['data'] = {
                            tid : req.body.tid,
                            status : req.body.status
                        };
                        res.status(400).json(responseMsg);
                        console.log('FnChangeReservationStatus: Unable to update ! Please try again');
                    }


                }
            });
        }
    });
};

exports.FnGetTransAutoComplete = function (req, res) {

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var title = req.query.title;
        var type = req.query.type;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (title) {

            db.query('CALL PgetTransAutocomplete(' + db.escape(title) + ',' + db.escape(type) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = 'Transaction details Send successfully';
                            console.log('FnGetTransAutoComplete: Transaction details Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded Transaction details';
                            console.log('FnGetTransAutoComplete: No founded Transaction details');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No founded Transaction details';
                        console.log('FnGetTransAutoComplete: No founded Transaction details');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Transaction details';
                    console.log('FnGetTransAutoComplete: error in getting Transaction details' + err);
                    res.status(500).json(responseMessage);
                }
            });
        }

        else {
            if (!title) {
                responseMessage.message = 'Invalid title';
                responseMessage.error = {
                    title : 'Invalid title'
                };
                console.log('FnGetTransAutoComplete: title is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetTransAutoComplete:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
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
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }
};

exports.FnGetOutboxMessages = function (req, res) {

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var pagesize = req.query.pagesize;
        var pagecount = req.query.pagecount;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (Token) {
            FnValidateToken(Token, function (err, result) {
                if (!err) {
                    if (result != null) {
                        db.query('CALL pGetOutboxMessages(' + db.escape(Token) + ',' + db.escape(pagesize) + ',' + db.escape(pagecount)+ ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.data = GetResult[0] ;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Company details Send successfully';
                                        console.log('FnGetOutboxMessages: Company details Send successfully');
                                        res.status(200).json(responseMessage);
                                    }
                                    else {

                                        responseMessage.error = {};
                                        responseMessage.message = 'No founded Company details';
                                        console.log('FnGetOutboxMessages: No founded Company details');
                                        res.json(responseMessage);
                                    }
                                }
                                else {


                                    responseMessage.error = {};
                                    responseMessage.message = 'No founded Company details';
                                    console.log('FnGetOutboxMessages: No founded Company details');
                                    res.json(responseMessage);
                                }

                            }
                            else {

                                responseMessage.data = null ;
                                responseMessage.error = {};
                                responseMessage.message = 'Error in getting Company details';
                                console.log('FnGetOutboxMessages: error in getting Company details' + err);
                                res.status(500).json(responseMessage);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {};
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetOutboxMessages: Invalid token');
                    }
                }
                else {
                    responseMessage.error= {};
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetOutboxMessages:Error in processing Token' + err);
                }
            });
        }
        else {
            if (!ezeid) {
                responseMessage.message = 'Invalid ezeid';
                responseMessage.error = {
                    ezeid : 'Invalid ezeid'
                };
                console.log('FnGetCompanyDetails: ezeid is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetOutboxMessages:error ' + ex.description);
        throw new Error(ex);
        res.status(400).json(responseMessage);
    }
};

exports.FnGetworkinghoursList = function (req, res) {

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        var responseMessage = {
            status: false,
            data: null,
            error:{},
            message:''
        };

        if (Token) {

            db.query('CALL PGetworkinghoursList(' + db.escape(Token) + ')', function (err, GetResult) {
                console.log(GetResult)
                if (!err) {
                    if (GetResult) {
                        if (GetResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.data = GetResult[0] ;
                            responseMessage.error = null;
                            responseMessage.message = ' Working hours list Send successfully';
                            console.log('FnGetworkinghoursList:Working hours list Send successfully');
                            res.status(200).json(responseMessage);
                        }
                        else {

                            responseMessage.error = {};
                            responseMessage.message = 'No founded Working hours list';
                            console.log('FnGetworkinghoursList: No founded Working hours list');
                            res.json(responseMessage);
                        }
                    }
                    else {


                        responseMessage.error = {};
                        responseMessage.message = 'No founded Working hours list';
                        console.log('FnGetworkinghoursList: No founded Working hours list');
                        res.json(responseMessage);
                    }

                }
                else {

                    responseMessage.data = null ;
                    responseMessage.error = {};
                    responseMessage.message = 'Error in getting Working hours list';
                    console.log('FnGetworkinghoursList: error in getting Working hours list' + err);
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
                console.log('FnGetworkinghoursList: Token is mandatory field');
            }

            res.status(401).json(responseMessage);
        }
    }
    catch (ex) {
        responseMessage.error = {};
        responseMessage.message = 'An error occured !'
        console.log('FnGetworkinghoursList:error ' + ex.description);
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
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
        throw new Error(ex);
    }
};

