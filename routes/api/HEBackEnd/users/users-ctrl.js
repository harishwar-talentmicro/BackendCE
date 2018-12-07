/**
 * Created by vedha on 11-03-2017.
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var request = require('request');
var randomstring = require("randomstring");
var http = require('https');
var CONFIG = require('../../../../ezeone-config.json');

var Mailer = require('../../../../mail/mailer.js');
var mailerApi = new Mailer();

const accountSid = 'AC62cf5e4f884a28b6ad9e2da511d24f4d';  //'ACcf64b25bcacbac0b6f77b28770852ec9';//'AC62cf5e4f884a28b6ad9e2da511d24f4d';
const authToken = 'ff62486827ce8b68c70c1b8f7cef9748';   //'3abf04f536ede7f6964919936a35e614';  //'ff62486827ce8b68c70c1b8f7cef9748';//
const FromNumber = CONFIG.DB.FromNumber || '+16012286363';  

const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();

var qs = require("querystring");
var options = {
    "method": "POST",
    "hostname": "www.smsgateway.center",
    "port": null,
    "path": "/SMSApi/rest/send",
    "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache"
    }
};

var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');


var DBSecretKey=CONFIG.DB.secretKey;



var userCtrl = {};
var error = {};

userCtrl.saveUser = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(!req.body.userMasterId){
        error.userMasterId = 'Invalid user masterId';
        validationFlag *= false;
    }

    if(!req.body.workGroupId){
        error.workGroupId = 'Invalid workGroupId';
        validationFlag *= false;
    }
    if(!req.body.RMGroupId){
        error.RMGroupId = 'Invalid RMGroupId';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.body.employeeCode = (req.body.employeeCode) ? req.body.employeeCode : '';
                req.body.jobTitle = (req.body.jobTitle) ? req.body.jobTitle : '';
                req.body.departmentId = (req.body.departmentId != undefined) ? req.body.departmentId : 0;
                req.body.locationTitle = (req.body.locationTitle) ? req.body.locationTitle : '';
                req.body.grade = (req.body.grade != undefined) ? req.body.grade : 0;
                req.body.status = (req.body.status) ? req.body.status : 1;
                // req.body.trackTemplateId = (req.body.trackTemplateId) ? req.body.trackTemplateId : 0;
                req.body.workLocationId = (req.body.workLocationId) ? req.body.workLocationId : 0;
                req.body.userType = (req.body.userType) ? req.body.userType : 0;
                req.body.firstName = (req.body.firstName) ? req.body.firstName : "";
                req.body.lastName = (req.body.lastName) ? req.body.lastName : "";
                req.body.mobileISD = (req.body.mobileISD) ? req.body.mobileISD : "";
                req.body.mobileNumber = (req.body.mobileNumber) ? req.body.mobileNumber : "";
                req.body.emailId = (req.body.emailId) ? req.body.emailId : "";
                req.body.DOJ = (req.body.DOJ) ? req.body.DOJ : null;
                // firstName,lastName,mobileISD,mobileNumber,emailId,displayName

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.userMasterId),
                    req.st.db.escape(req.body.employeeCode),
                    req.st.db.escape(req.body.jobTitle),
                    req.st.db.escape(req.body.departmentTitle),
                    req.st.db.escape(req.body.locationTitle),
                    req.st.db.escape(req.body.grade),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(JSON.stringify(req.body.trackTemplate)),
                    req.st.db.escape(req.body.workLocationId),
                    req.st.db.escape(req.body.formTemplateId),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.userType),
                    req.st.db.escape(req.body.workGroupId),
                    req.st.db.escape(req.body.RMGroupId),
                    req.st.db.escape(req.body.firstName),
                    req.st.db.escape(req.body.lastName),
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(req.body.DOJ),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL save_HE_user( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,currencyResult){
                    if(!err){
                        response.status = true;
                        response.message = "User data saved successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving user";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};

userCtrl.getMasterData = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading master data",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL get_HE_master_data( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,masterDataResult){
                    if(!err && masterDataResult){
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        response.data = {
                            jobTitleList : masterDataResult[0],
                            departmentList : masterDataResult[1],
                            locationList : masterDataResult[2],
                            bankNameList : masterDataResult[3],
                            workLocationList : masterDataResult[4],
                            trackTemplateList : masterDataResult[5],
                            formTemplateList : masterDataResult[6],
                            gradeList : masterDataResult[7],
                            docGroupList : masterDataResult[8],
                            workGroupList : masterDataResult[9],
                            RMGroupList : masterDataResult[10]
                        };
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting master data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }


};

userCtrl.getUserDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading master data",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        console.log("Entered....");
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else
    {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEUserId),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)                
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL get_HE_user_details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userData){
                    if(!err && userData){
                        // var outputArray=[];
                        // var userRights = JSON.parse("[" + userData[0][0].userRights + "]");
                        // console.log(userRights);
                        //
                        // for (var i = 0; i < userRights.length ; i++ ) {
                        //     var result = {};
                        //         result.HEFormId = userRights[i].HEFormId,
                        //         result.isMapped = userRights[i].isMapped,
                        //         result.HEFormTitle = userRights[i].HEFormTitle,
                        //         result.approvers = JSON.parse("[" + userRights[i].approvers + "]"),
                        //         result.receivers = JSON.parse("[" + userRights[i].receivers + "]"),
                        //         result.accessType = JSON.parse("[" + userRights[i].accessType + "]")
                        //             outputArray.push(result);
                        // }
                        var output=[];
                        var usertemplate = (JSON.parse( userData[0][0].tracktemplate )) ? (JSON.parse(userData[0][0].tracktemplate )):[];

                        for(var i=0; i<usertemplate.length; i++){
                            var res2={};
                            res2.trackTemplateId=usertemplate[i].templateId;
                                res2.trackTemplateTitle=usertemplate[i].title;
                            output.push(res2);
                        }
                        response.status = true;
                        response.message = "User details loaded successfully";
                        response.error = null;
                        response.data = {
                            name :  userData[0][0].name,
                            employeeCode : userData[0][0].employeeCode,
                            HEJobTitleId : userData[0][0].HEJobTitleId,
                            jobTitle : userData[0][0].jobTitle,
                            HEDepartmentId : userData[0][0].HEDepartmentId,
                            departmentTitle : userData[0][0].departmentTitle,
                            HELocationId : userData[0][0].HELocationId,
                            locationTitle : userData[0][0].locationTitle,
                            grade : userData[0][0].grade,
                            gradeTitle : userData[0][0].gradeTitle,
                            status : userData[0][0].status,
                            trackTemplateList : output,
                            // trackTemplateTitle : userData[0][0].trackTemplateTitle,
                            workLocationId : userData[0][0].workLocationId,
                            workLocationTitle : userData[0][0].workLocationTitle ,
                            userType : userData[0][0].userType ,
                            workGroupId : userData[0][0].workGroupId ,
                            workGroupTitle : userData[0][0].workGroupTitle ,
                            RMGroupId : userData[0][0].RMGroupId ,
                            RMGroupTitle : userData[0][0].RMGroupTitle,
                            firstName : userData[0][0].firstName,
                            lastName : userData[0][0].lastName,
                            mobileISD : userData[0][0].mobileISD,
                            mobileNumber : userData[0][0].mobileNumber,
                            emailId : userData[0][0].emailId,
                            displayName : userData[0][0].displayName,
                            DOJ : userData[0][0].DOJ
                        };
// firstName,lastName,mobileISD,mobileNumber,emailId,displayName


                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting user details";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

userCtrl.getUserList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading users",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        console.log("Entered....");
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.isExport = (req.query.isExport) ? (req.query.isExport) : 0;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                req.query.searchKeywords = (req.query.searchKeywords) ? (req.query.searchKeywords) : '';
                var startPage = 0;

                startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.searchKeywords),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.query.isExport)               
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL get_HE_user_List( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userData){
                    if(!err && userData){
                        response.status = true;
                        response.message = "Users loaded successfully";
                        response.error = null;
                        response.data = {
                            count : userData[1][0].count,
                            userList : userData[0]
                        };

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting users";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

userCtrl.getApproversList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading approvers",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){
            var procParams = [
                req.st.db.escape(req.query.HEFormId),
                req.st.db.escape(req.query.HEUserId),
                req.st.db.escape(DBSecretKey)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL get_HE_approvers_list( ' + procParams.join(',') + ')';

            req.db.query(procQuery,function(err,approversList){
                if(!err && approversList){
                    response.status = true;
                    response.message = "Approvers loaded successfully";
                    response.error = null;
                    response.data = {
                        approversList : approversList[0]
                    }

                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Error while getting approvers";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);
        }
    });
};

userCtrl.getReceiversList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading approvers",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.HEFormId),
                req.st.db.escape(req.query.HEUserId),
                req.st.db.escape(DBSecretKey)                
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL get_HE_receiver_list( ' + procParams.join(',') + ')';

            req.db.query(procQuery,function(err,approversList){
                if(!err && approversList){
                    response.status = true;
                    response.message = "Receivers loaded successfully";
                    response.error = null;
                    response.data = {
                        approversList : approversList[0]
                    }

                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Error while getting Receivers";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);
        }
    });
};

userCtrl.getUserDataAccessRights = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading access rights",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.HEUserId),
                req.st.db.escape(req.query.HEFormId),
                req.st.db.escape(DBSecretKey)                
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL get_HE_user_dataaccessrights( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,approversList){
                if(!err && approversList){
                    response.status = true;
                    response.message = "access rights loaded successfully";
                    response.error = null;
                    response.data = {
                        accessRights : approversList[0]
                    }

                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Error while getting Receivers";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);
        }
    });
};

userCtrl.searchUser = function(req,res,next){
    var response = {
        status : false,
        message : "Error while searching user",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.name),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL search_HE_user( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,searchList){
                    if(!err && searchList){
                        response.status = true;
                        response.message = "Users loaded successfully";
                        response.error = null;
                        response.data = {
                            searchList : searchList[0]
                        }

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while searching users";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }


};

userCtrl.validateEzeoneId = function(req,res,next){
    var response = {
        status : false,
        message : "Error while validating EZEOneId",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.EZEOneId),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL get_ezeonId_details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,searchList){
                    if(!err && searchList && searchList[0] && searchList[0][0]._error){
                        switch (searchList[0][0]._error) {
                            case 'ALREADY_USER' :
                                response.status = false;
                                response.message = "User already exists";
                                response.userMasterId = searchList[0][0].userMasterId ;
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                            case 'EZEONE_DOESNT_EXISTS' :
                                response.status = false;
                                response.message = "Invalid EZEOne ID try again with correct ID";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                            default:
                                break;
                        }
                    }
                    else if (!err)
                    {
                        response.status = true;
                        response.message = "Valid EZEOne ID";
                        response.error = null;
                        response.data = {
                            searchList : searchList[0]
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while validating EZEOne ID";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

userCtrl.postToProfile = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    // if (!req.query.APIKey)
    // {
    //     error.APIKey = 'Invalid APIKey';
    //     validationFlag *= false;
    // }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(req.body.userMasterId),
                    req.st.db.escape(DBSecretKey)                
                ];

                var procQuery = 'CALL he_profileDataHistory( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,searchList){
                    if (!err)
                    {
                        response.status = true;
                        response.message = "Profile data updated successfully ";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while updating data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};


userCtrl.uploadUsersfromweb = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    // function isValidDate(dateString) {
    //     var regEx = /[1-9][0-9][0-9][0-9][-/]((0?[1-9])|(1?[0-2]))[-/]((0?[1-9])|([12][0-9])|(3?[0-1]))/;
    //     return dateString.match(regEx) != null;
    //   }
    
    //   var JoiningDateValidate=isValidDate(req.body.JoiningDate);
    //   var BirthDateValidate=isValidDate(req.body.BirthDate);
    
    //   if (JoiningDateValidate==false) {
    //     error.JoiningDate = 'Invalid JoiningDateFormat';
    //     validationFlag *= false;
    // }

    // console.log("---------------------------",BirthDateValidate);
    // console.log("-==========================",JoiningDateValidate);

    
    // if (BirthDateValidate==false) {
    //     error.BirthDate = 'Invalid BirthDateFormat';
    //     validationFlag = "dateerror";
    // }


    if (!req.query.bulkImporterId) {
        error.bulkImporterId = 'Invalid bulkImporterId';
        validationFlag = "dateerror";
    }
console.log("validationFlag",validationFlag)
    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    // else if(validationFlag=="dateerror") {
    //     response.error = error;
    //     response.message = 'Please check the errors';
    //     res.status(500).json(response);
    //     console.log(response);
    // }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.body.Department = req.body.Department ? req.body.Department : '';
                req.body.JobTitle = req.body.JobTitle ? req.body.JobTitle : '';
                req.body.Location = req.body.Location ? req.body.Location : '';
                req.body.JoiningDate = req.body.JoiningDate ? req.body.JoiningDate : null;
                req.body.BirthDate = req.body.BirthDate ? req.body.BirthDate : null;


                var password = randomstring.generate({
                    length: 6,
                    charset: 'alphanumeric'
                });
                
            
                  

                var encryptPwd = req.st.hashPassword(password);
                // var Qndata = req.body.data;
                // console.log("req.body.data",req.body.data);
                // console.log('req.body', req.body);

                // var name = req.body.Name;
                // var email = req.body.Email;
                // var mobile = req.body.Mobile;
                // var isdmobile = req.body.ISDMobile;

                var resinput = {
                    Name: req.body.Name,
                    LoginId: req.body.LoginId,
                    EmployeeCode: req.body.EmployeeCode,
                    Mobile: req.body.Mobile,
                    ISDMobile: req.body.ISDMobile,
                    TrackTemplate: req.body.TrackTemplate,
                    WorkLocation: req.body.WorkLocation,
                    WorkGroup: req.body.WorkGroup,
                    ReportingManager: req.body.ReportingManager,
                    Email: req.body.Email,
                    Department: req.body.Department,
                    JobTitle: req.body.JobTitle,
                    Location: req.body.Location
                };



                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.LoginId),
                    req.st.db.escape(req.body.EmployeeCode),
                    req.st.db.escape(req.body.Name),
                    req.st.db.escape(req.body.Mobile),
                    req.st.db.escape(req.body.ISDMobile),
                    req.st.db.escape(encryptPwd),
                    req.st.db.escape(req.body.TrackTemplate),
                    req.st.db.escape(req.body.WorkLocation),
                    req.st.db.escape(req.body.WorkGroup),
                    req.st.db.escape(req.body.ReportingManager),
                    req.st.db.escape(req.body.Email),
                    req.st.db.escape(req.body.Department),
                    req.st.db.escape(req.body.JobTitle),
                    req.st.db.escape(req.body.Location),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.query.bulkImporterId),
                    req.st.db.escape(password),
                    req.st.db.escape(req.body.JoiningDate),
                    req.st.db.escape(req.body.BirthDate)


                ];

                var procQuery = 'CALL he_import_bulkUsersfromweb( ' + procParams.join(',') + ')';
                console.log(procQuery);
               
                        req.db.query(procQuery, function (err, userResult) {
                            console.log('err', err);

                            if (!err && userResult && userResult[0] && userResult[0][0]) {                               
                                response.status = true;
                                response.message = "Users uploaded successfully";
                                response.error = null;
                                response.data = {
                                    LoginId: resinput.LoginId,
                                    EmployeeCode: resinput.EmployeeCode,
                                    Name: resinput.Name,
                                    Mobile: resinput.Mobile,
                                    ISDMobile: resinput.ISDMobile,
                                    TrackTemplate: resinput.TrackTemplate,
                                    WorkLocation: resinput.WorkLocation,
                                    WorkGroup: resinput.WorkGroup,
                                    ReportingManager: resinput.ReportingManager,
                                    Email: resinput.Email,
                                    Department: resinput.Department,
                                    JobTitle: resinput.JobTitle,
                                    Location: resinput.Location,
                                    JoiningDate:req.body.JoiningDate,
                                    BirthDate:req.body.BirthDate,
                                    status: userResult[0][0].status
                                };
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while uploading users";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

userCtrl.bulkImporterTitleSave = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }
   
    if (!req.query.importTitle) {
        error.importTitle = 'Invalid importTitle';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
            
                req.query.importTitleId = req.query.importTitleId ? req.query.importTitleId : 0;
                req.query.isPublish = req.query.isPublish>0 ? req.query.isPublish : 0;

                // var password = randomstring.generate({
                //     length: 6,
                //     charset: 'alphanumeric'
                // });
              
                // var encryptPwd = req.st.hashPassword(password);

                var isPublish = req.query.isPublish ? req.query.isPublish :0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.importTitleId),
                    req.st.db.escape(req.query.importTitle),
                    req.st.db.escape(req.query.isPublish),
                    req.st.db.escape(DBSecretKey)                                       
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_bulkImporterTitle( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,userresult){
                    if(!err && userresult && userresult[0] && userresult[0][0]){

                        if(isPublish!=0){

                            for (var i =0; i<userresult[0].length ;i++){

                                var companyName = userresult[0][i].companyName;
                                var Email = userresult[0][i].Email ? userresult[0][i].Email: '';
                                var mobile = userresult[0][i].mobile ? userresult[0][i].mobile: '';
                                var isdmobile = userresult[0][i].isdmobile ? userresult[0][i].isdmobile: '';
                                var name = userresult[0][i].name ? userresult[0][i].name: '';
                                var password = userresult[0][i].unhashPassword ? userresult[0][i].unhashPassword:'';

                                if (userresult[0][i].status == "New") {
                                    if (Email != "") {
                                      
        
                                        if (userresult[0][i].emailtext != "") {
                                            userresult[0][i].emailtext = userresult[0][i].emailtext.replace("[Name]", name);
                                            userresult[0][i].emailtext = userresult[0][i].emailtext.replace("[UserName]", (userresult[0][i].loginId ? userresult[0][i].loginId : userresult[0][i].whatmateId));
                                            userresult[0][i].emailtext = userresult[0][i].emailtext.replace("[Password]", password);
        
                                            var mail = {
                                                from: 'noreply@talentmicro.com',
                                                to: Email,
                                                subject: userresult[0][i].whatmateSignUpSubject ? userresult[0][i].whatmateSignUpSubject : 'Your user Credentials for WhatMate App',
                                                html: userresult[0][i].emailtext ? userresult[0][i].emailtext:'' // html body
                                            };
        
                                            // console.log('new mail details',mail);
                                        
                                            var email = new sendgrid.Email();
                                            email.from = mail.from;
                                            email.to = mail.to;
        
                                            // email.addCc(cc);
                                            email.subject = mail.subject;
                                            email.html = mail.html;
                                            sendgrid.send(email, function (err, result) {
                                                if (!err) {
                                                    console.log("Mail sent success");
                                                }
                                                else {
                                                    console.log("Mail Error", err);
                                                }
                                            });
        
                                        }
                                    }
                                    //whatmateId
                                    // message = 'Dear ' + name + ', Your WhatMate credentials, Login ID: ' + (userresult[0][i].loginId ? userresult[0][i].loginId : userresult[0][i].whatmateId) + ',Password: ' + password;
        
        
                                    // message = userresult[0][i].whatmateSignUpMessage ? userresult[0][i].whatmateSignUpMessage : message;
                                    // message = message.replace('[LoginId]', (userresult[0][i].loginId ? userresult[0][i].loginId : userresult[0][i].whatmateId));
                                    // message = message.replace('[password]', password);
                
        
                                    // if (mobile != "") {
                                    //     if (isdmobile == "+977") {
                                    //         request({
                                    //             url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                    //             qs: {
                                    //                 token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                    //                 to: mobile,
                                    //                 message: message,
                                    //                 sender: 'Techingen'
                                    //             },
                                    //             method: 'GET'
        
                                    //         }, function (error, response, body) {
                                    //             if (error) {
                                    //                 console.log(error, "SMS");
                                    //             }
                                    //             else {
                                    //                 console.log("SUCCESS for isd +977", "SMS response");
                                    //             }
        
                                    //         });
                                    //     }
                                    //     else if (isdmobile == "+91") {
                                    //         request({
                                    //             url: 'https://aikonsms.co.in/control/smsapi.php',
                                    //             qs: {
                                    //                 user_name: 'janardana@hirecraft.com',
                                    //                 password: 'Ezeid2015',
                                    //                 sender_id: 'WtMate',
                                    //                 service: 'TRANS',
                                    //                 mobile_no: mobile,
                                    //                 message: message,
                                    //                 method: 'send_sms'
                                    //             },
                                    //             method: 'GET'
        
                                    //         }, function (error, response, body) {
                                    //             if (error) {
                                    //                 console.log(error, "SMS");
                                    //             }
                                    //             else {
                                    //                 console.log("SUCCESS for isd +91", "SMS response");
                                    //             }
                                    //         });
        
                                    //         var req = http.request(options, function (res) {
                                    //             var chunks = [];
        
                                    //             res.on("data", function (chunk) {
                                    //                 chunks.push(chunk);
                                    //             });
        
                                    //             res.on("end", function () {
                                    //                 var body = Buffer.concat(chunks);
                                    //                 console.log(body.toString());
                                    //             });
                                    //         });
        
                                    //         req.write(qs.stringify({
                                    //             userId: 'talentmicro',
                                    //             password: 'TalentMicro@123',
                                    //             senderId: 'WTMATE',
                                    //             sendMethod: 'simpleMsg',
                                    //             msgType: 'text',
                                    //             mobile: isdmobile.replace("+", "") + mobile,
                                    //             msg: message,
                                    //             duplicateCheck: 'true',
                                    //             format: 'json'
                                    //         }));
                                    //         req.end();
        
        
                                    //     }
                                    //     else if (isdmobile != "") {
                                    //         client.messages.create(
                                    //             {
                                    //                 body: message,
                                    //                 to: isdmobile + mobile,
                                    //                 from: '+14434322305'
                                    //             },
                                    //             function (error, response) {
                                    //                 if (error) {
                                    //                     console.log(error, "SMS");
                                    //                 }
                                    //                 else {
                                    //                     console.log("SUCCESS for isd others", "SMS response");
                                    //                 }
                                    //             }
                                    //         );
                                    //     }
        
                                    // }
        
                                }
                                else if (userresult[0][i].status == "Existing" || userresult[0][i].status == "Duplicate") {
                                    if (Email != "") {
                                       
                                        if (userresult[0][i].ExistingUserEmailText != "") {
                                            userresult[0][i].ExistingUserEmailText = userresult[0][i].ExistingUserEmailText.replace("[Name]", name);
                                            userresult[0][i].ExistingUserEmailText = userresult[0][i].ExistingUserEmailText.replace("[UserName]", (userresult[0][i].loginId ? userresult[0][i].loginId : userresult[0][i].whatmateId));
                                            userresult[0][i].ExistingUserEmailText = userresult[0][i].ExistingUserEmailText.replace("[CompanyName]", companyName);
        
                                            
                                            mail = {
                                                from: 'noreply@talentmicro.com',
                                                to: Email,
                                                subject: 'Your user Credentials for WhatMate App',
                                                html: userresult[0][i].ExistingUserEmailText // html body
                                            };
        
                                            // console.log('existing mail details',mail);
        
                                            email = new sendgrid.Email();
                                            email.from = mail.from;
                                            email.to = mail.to;
                                            // email.addCc(cc);
                                            email.subject = mail.subject;
                                            email.html = mail.html;
                                            sendgrid.send(email, function (err, result) {
                                                if (!err) {
                                                    console.log("Mail sent success");
                                                }
                                                else {
                                                    console.log("Mail Error", err);
                                                }
                                            });
        
                                        }        
                                    }
        
                                    // message = 'Dear ' + name + ', Your WhatMate credentials, Login ID: ' + (userresult[0][i].loginId ? userresult[0][i].loginId : userresult[0][i].whatmateId) + ',Password: ' + password;
        
        
                                    // message = userresult[0][i].whatmateSignUpMessage ? userresult[0][i].whatmateSignUpMessage : message;
                                    // message = message.replace('[LoginId]', (userresult[0][i].loginId ? userresult[0][i].loginId : userresult[0][i].whatmateId));
                                    // message = message.replace('[password]', password);
                                            
                                    // if (mobile != "") {
                                    //     if (isdmobile == "+977") {
                                    //         request({
                                    //             url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                    //             qs: {
                                    //                 token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                    //                 to: mobile,
                                    //                 message: message,
                                    //                 sender: 'Techingen'
                                    //             },
                                    //             method: 'GET'
        
                                    //         }, function (error, response, body) {
                                    //             if (error) {
                                    //                 console.log(error, "SMS");
                                    //             }
                                    //             else {
                                    //                 console.log("SUCCESS for isd +977", "SMS response");
                                    //             }
        
                                    //         });
                                    //     }
                                    //     else if (isdmobile == "+91") {
                                    //         request({
                                    //             url: 'https://aikonsms.co.in/control/smsapi.php',
                                    //             qs: {
                                    //                 user_name: 'janardana@hirecraft.com',
                                    //                 password: 'Ezeid2015',
                                    //                 sender_id: 'WtMate',
                                    //                 service: 'TRANS',
                                    //                 mobile_no: mobile,
                                    //                 message: message,
                                    //                 method: 'send_sms'
                                    //             },
                                    //             method: 'GET'
        
                                    //         }, function (error, response, body) {
                                    //             if (error) {
                                    //                 console.log(error, "SMS");
                                    //             }
                                    //             else {
                                    //                 console.log("SUCCESS for isd +91", "SMS response");
                                    //             }
                                    //         });
        
                                    //         req = http.request(options, function (res) {
                                    //             var chunks = [];
        
                                    //             res.on("data", function (chunk) {
                                    //                 chunks.push(chunk);
                                    //             });
        
                                    //             res.on("end", function () {
                                    //                 var body = Buffer.concat(chunks);
                                    //                 console.log(body.toString());
                                    //             });
                                    //         });
        
                                    //         req.write(qs.stringify({
                                    //             userId: 'talentmicro',
                                    //             password: 'TalentMicro@123',
                                    //             senderId: 'WTMATE',
                                    //             sendMethod: 'simpleMsg',
                                    //             msgType: 'text',
                                    //             mobile: isdmobile.replace("+", "") + mobile,
                                    //             msg: message,
                                    //             duplicateCheck: 'true',
                                    //             format: 'json'
                                    //         }));
                                    //         req.end();
                                    //     }
                                    //     else if (isdmobile != "") {
                                    //         client.messages.create(
                                    //             {
                                    //                 body: message,
                                    //                 to: isdmobile + mobile,
                                    //                 from: '+14434322305'
                                    //             },
                                    //             function (error, response) {
                                    //                 if (error) {
                                    //                     console.log(error, "SMS");
                                    //                 }
                                    //                 else {
                                    //                     console.log("SUCCESS for isd others", "SMS response");
                                    //                 }
                                    //             }
                                    //         );
                                    //     }
        
                                    // }
                                }

                            }
                            
                            for (var i =0; i<userresult[0].length ;i++){

                                var companyName = userresult[0][i].companyName;
                                var Email = userresult[0][i].Email ? userresult[0][i].Email: '';
                                var mobile = userresult[0][i].mobile ? userresult[0][i].mobile: '';
                                var isdmobile = userresult[0][i].isdmobile ? userresult[0][i].isdmobile: '';
                                var name = userresult[0][i].name ? userresult[0][i].name: '';
                                var password = userresult[0][i].unhashPassword ? userresult[0][i].unhashPassword:'';

                                if (userresult[0][i].status == "New") {
                                   
                                    //whatmateId
                                    message = 'Dear ' + name + ', Your WhatMate credentials, Login ID: ' + (userresult[0][i].loginId ? userresult[0][i].loginId : userresult[0][i].whatmateId) + ',Password: ' + password;
        
        
                                    message = userresult[0][i].whatmateSignUpMessage ? userresult[0][i].whatmateSignUpMessage : message;
                                    message = message.replace('[LoginId]', (userresult[0][i].loginId ? userresult[0][i].loginId : userresult[0][i].whatmateId));
                                    message = message.replace('[password]', password);
                
        
                                    if (mobile != "") {
                                        if (isdmobile == "+977") {
                                            request({
                                                url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                                qs: {
                                                    token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                                    to: mobile,
                                                    message: message,
                                                    sender: 'Techingen'
                                                },
                                                method: 'GET'
        
                                            }, function (error, response, body) {
                                                if (error) {
                                                    console.log(error, "SMS");
                                                }
                                                else {
                                                    console.log("SUCCESS for isd +977", "SMS response");
                                                }
        
                                            });
                                        }
                                        else if (isdmobile == "+91") {
                                            request({
                                                url: 'https://aikonsms.co.in/control/smsapi.php',
                                                qs: {
                                                    user_name: 'janardana@hirecraft.com',
                                                    password: 'Ezeid2015',
                                                    sender_id: 'WtMate',
                                                    service: 'TRANS',
                                                    mobile_no: mobile,
                                                    message: message,
                                                    method: 'send_sms'
                                                },
                                                method: 'GET'
        
                                            }, function (error, response, body) {
                                                if (error) {
                                                    console.log(error, "SMS");
                                                }
                                                else {
                                                    console.log("SUCCESS for isd +91", "SMS response");
                                                }
                                            });
        
                                            var req = http.request(options, function (res) {
                                                var chunks = [];
        
                                                res.on("data", function (chunk) {
                                                    chunks.push(chunk);
                                                });
        
                                                res.on("end", function () {
                                                    var body = Buffer.concat(chunks);
                                                    console.log(body.toString());
                                                });
                                            });
        
                                            req.write(qs.stringify({
                                                userId: 'talentmicro',
                                                password: 'TalentMicro@123',
                                                senderId: 'WTMATE',
                                                sendMethod: 'simpleMsg',
                                                msgType: 'text',
                                                mobile: isdmobile.replace("+", "") + mobile,
                                                msg: message,
                                                duplicateCheck: 'true',
                                                format: 'json'
                                            }));
                                            req.end();
        
        
                                        }
                                        else if (isdmobile != "") {
                                            client.messages.create(
                                                {
                                                    body: message,
                                                    to: isdmobile + mobile,
                                                    from: FromNumber
                                                },
                                                function (error, response) {
                                                    if (error) {
                                                        console.log(error, "SMS");
                                                    }
                                                    else {
                                                        console.log("SUCCESS for isd others", "SMS response");
                                                    }
                                                }
                                            );
                                        }
        
                                    }
        
                                }
                                else if (userresult[0][i].status == "Existing" || userresult[0][i].status == "Duplicate") {
                                  
                                    message = 'Dear ' + name + ', Your WhatMate credentials, Login ID: ' + (userresult[0][i].loginId ? userresult[0][i].loginId : userresult[0][i].whatmateId) + ',Password: ' + password;
        
        
                                    message = userresult[0][i].whatmateSignUpMessage ? userresult[0][i].whatmateSignUpMessage : message;
                                    message = message.replace('[LoginId]', (userresult[0][i].loginId ? userresult[0][i].loginId : userresult[0][i].whatmateId));
                                    message = message.replace('[password]', password);
                                            
                                    if (mobile != "") {
                                        if (isdmobile == "+977") {
                                            request({
                                                url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                                qs: {
                                                    token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                                    to: mobile,
                                                    message: message,
                                                    sender: 'Techingen'
                                                },
                                                method: 'GET'
        
                                            }, function (error, response, body) {
                                                if (error) {
                                                    console.log(error, "SMS");
                                                }
                                                else {
                                                    console.log("SUCCESS for isd +977", "SMS response");
                                                }
        
                                            });
                                        }
                                        else if (isdmobile == "+91") {
                                            request({
                                                url: 'https://aikonsms.co.in/control/smsapi.php',
                                                qs: {
                                                    user_name: 'janardana@hirecraft.com',
                                                    password: 'Ezeid2015',
                                                    sender_id: 'WtMate',
                                                    service: 'TRANS',
                                                    mobile_no: mobile,
                                                    message: message,
                                                    method: 'send_sms'
                                                },
                                                method: 'GET'
        
                                            }, function (error, response, body) {
                                                if (error) {
                                                    console.log(error, "SMS");
                                                }
                                                else {
                                                    console.log("SUCCESS for isd +91", "SMS response");
                                                }
                                            });
        
                                            req = http.request(options, function (res) {
                                                var chunks = [];
        
                                                res.on("data", function (chunk) {
                                                    chunks.push(chunk);
                                                });
        
                                                res.on("end", function () {
                                                    var body = Buffer.concat(chunks);
                                                    console.log(body.toString());
                                                });
                                            });
        
                                            req.write(qs.stringify({
                                                userId: 'talentmicro',
                                                password: 'TalentMicro@123',
                                                senderId: 'WTMATE',
                                                sendMethod: 'simpleMsg',
                                                msgType: 'text',
                                                mobile: isdmobile.replace("+", "") + mobile,
                                                msg: message,
                                                duplicateCheck: 'true',
                                                format: 'json'
                                            }));
                                            req.end();
                                        }
                                        else if (isdmobile != "") {
                                            client.messages.create(
                                                {
                                                    body: message,
                                                    to: isdmobile + mobile,
                                                    from: FromNumber
                                                },
                                                function (error, response) {
                                                    if (error) {
                                                        console.log(error, "SMS");
                                                    }
                                                    else {
                                                        console.log("SUCCESS for isd others", "SMS response");
                                                    }
                                                }
                                            );
                                        }
        
                                    }
                                }

                            }   
                        }

                        if(isPublish){
                            var resData = (userresult[1] && userresult[1][0]) ? userresult[1][0].bulkImporterId:0;
                            var resMessage = "User credentials sent successfully";
                        }
                        else{
                            var resData = (userresult[0] && userresult[0][0]) ? userresult[0][0].bulkImporterId:0;
                            var resMessage = "Importer title saved successfully";

                        }



                        response.status = true;
                        response.message =resMessage;
                        response.error = null;
                        response.bulkImporterId=resData;
                        res.status(200).json(response);
                    }
                    else{
                        if(isPublish){
                            var resError = "Error while notifing user credentials";
                        }
                        else{
                            var resError = "Error while saving importer title";
                        }
                        response.status = false;
                        response.message = resError;
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};


userCtrl.getBulkImporterTitles = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }
   
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
            
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                 
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_bulkImporterTitle( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,result){
                    if(!err){
                        response.status = true;
                        response.message = "Bulk importer list loaded successfully";
                        response.error = null;
                        response.importList = (result[0] &&  result[0][0]) ? result[0] :[];
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading list";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};


userCtrl.updateMultipleUserDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
  
    if (!req.query.APIKey){
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
             

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(req.body.HEUserId || [])),
                    req.st.db.escape(req.body.grade || 0),
                    req.st.db.escape(req.body.departmentTitle || 0),
                    req.st.db.escape(req.body.userType || 0),
                    req.st.db.escape(req.body.workLocationId || 0),
                    req.st.db.escape(req.body.RMGroupId || 0),
                    req.st.db.escape(req.body.jobTitle || ""),
                    req.st.db.escape(req.body.locationTitle || ""),
                    req.st.db.escape(req.body.DOJ || null),
                    req.st.db.escape(req.body.status || null),
                    req.st.db.escape(JSON.stringify(req.body.trackTemplate || [])),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.workGroupId || 0)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_update_HE_usersNew( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,currencyResult){
                    if(!err){
                        response.status = true;
                        response.message = "User data updated successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while updating user";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};

module.exports = userCtrl;