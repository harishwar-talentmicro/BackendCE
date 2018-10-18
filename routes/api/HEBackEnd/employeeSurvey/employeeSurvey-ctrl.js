var express = require('express');
var router = express.Router();
var moment = require('moment');
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var request = require('request');
var randomstring = require("randomstring");
var http = require('https');

var Mailer = require('../../../../mail/mailer.js');
var mailerApi = new Mailer();
var appConfig = require('../../../../ezeone-config.json');

const accountSid = 'AC62cf5e4f884a28b6ad9e2da511d24f4d';  //'ACcf64b25bcacbac0b6f77b28770852ec9';//'AC62cf5e4f884a28b6ad9e2da511d24f4d';
const authToken = 'ff62486827ce8b68c70c1b8f7cef9748';   //'3abf04f536ede7f6964919936a35e614';  //'ff62486827ce8b68c70c1b8f7cef9748';//
const FromNumber = appConfig.DB.FromNumber || '+16012286363';
const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;
var DBSecretKey = appConfig.DB.secretKey;


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



var employeeSurveyCtrl = {};
var error = {};

employeeSurveyCtrl.getSurveyList = function (req, res, next) {
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
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),

                ];
                /**
                 * Calling procedure to My self and my team leave apllications
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_surveyTemplate( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {

                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Survey list loaded successfully";
                        response.error = null;


                        for (var i = 0; i < results[0].length; i++) {
                            if (typeof (results[0][i].questionDetails) == 'string') {
                                results[0][i].questionDetails = JSON.parse(results[0][i].questionDetails);
                            }

                            for (var j = 0; j < results[0][i].questionDetails.length; j++) {
                                if (typeof (results[0][i].questionDetails[j].options) == 'string') {
                                    results[0][i].questionDetails[j].options = JSON.parse(results[0][i].questionDetails[j].options);
                                }
                            }
                        }

                        response.data = {
                            surveyList: results[0],
                            upcomingEvents: results[1]
                        };
                        // res.status(200).json(response);
                        buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No task requests found";
                        response.error = null;
                        response.data = {
                            surveyList: []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting task requests";
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

employeeSurveyCtrl.serveyConfigureToUsers = function (req, res, next) {
    var response = {
        status: false,
        message: "Error while publishing survey",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.body.heMasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!req.body.templateId) {
        error.templateId = 'Invalid templateId';
        validationFlag *= false;
    }

    var users = req.body.users;
    if (typeof (users) == "string") {
        users = JSON.parse(users);
    }
    if (!users) {
        users = [];
    }

    var branchList = req.body.branchList;
    if (typeof (branchList) == "string") {
        branchList = JSON.parse(branchList);
    }
    if (!branchList) {
        branchList = [];
    }
    var departmentList = req.body.departmentList;
    if (typeof (departmentList) == "string") {
        departmentList = JSON.parse(departmentList);
    }
    if (!departmentList) {
        departmentList = [];
    }
    var gradeList = req.body.gradeList;
    if (typeof (gradeList) == "string") {
        gradeList = JSON.parse(gradeList);
    }
    if (!gradeList) {
        gradeList = [];
    }
    var groupList = req.body.groupList;
    if (typeof (groupList) == "string") {
        groupList = JSON.parse(groupList);
    }
    if (!groupList) {
        groupList = [];
    }

    var userList = req.body.userList;
    if (typeof (userList) == "string") {
        userList = JSON.parse(userList);
    }
    if (!userList) {
        userList = [];
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.body.surveyManagerId = (req.body.surveyManagerId) ? (req.body.surveyManagerId) : 0;
                req.body.publishingType = (req.body.publishingType) ? req.body.publishingType : 0;
                req.body.reminderText = (req.body.reminderText) ? (req.body.reminderText) : "";
                req.body.startDate = (req.body.startDate) ? (req.body.startDate) : null;
                req.body.endDate = (req.body.endDate) ? (req.body.endDate) : null;
                req.body.reminderDate = (req.body.reminderDate) ? (req.body.reminderDate) : null;
                req.body.publishSurvey = (req.body.publishSurvey) ? (req.body.publishSurvey) : 0;
                req.body.status = 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.surveyManagerId),
                    req.st.db.escape(req.body.templateId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.startDate),
                    req.st.db.escape(req.body.endDate),
                    req.st.db.escape(req.body.reminderDate),
                    req.st.db.escape(req.body.reminderText),
                    req.st.db.escape(req.body.publishingType),
                    req.st.db.escape(JSON.stringify(users)),
                    req.st.db.escape(req.body.publishSurvey),
                    req.st.db.escape(JSON.stringify(userList)),
                    req.st.db.escape(JSON.stringify(branchList)),
                    req.st.db.escape(JSON.stringify(departmentList)),
                    req.st.db.escape(JSON.stringify(gradeList)),
                    req.st.db.escape(JSON.stringify(groupList)),
                    req.st.db.escape(req.body.status)
                ];
                /**CALL wm_save_employeeSurveypublish
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_employeeSurveypublish_New( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Survey data saved successfully";
                        response.error = null;
                        response.data = results[0][0];
                        res.status(200).json(response);

                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving data";
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


employeeSurveyCtrl.saveServeyOfUsers = function (req, res, next) {
    var response = {
        status: false,
        message: "Error while loading users",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!req.query.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }


    var questionDetails = req.body.questionDetails;
    if (typeof (questionDetails) == "string") {
        questionDetails = JSON.parse(questionDetails);
    }
    if (!questionDetails) {
        questionDetails = [];
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.body.surveyMasterId = (req.body.surveyMasterId) ? (req.body.surveyMasterId) : 0;
                req.body.QTemplateId = (req.body.QTemplateId) ? req.body.QTemplateId : 0;

                // req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                // req.query.searchKeywords = (req.query.searchKeywords) ? (req.query.searchKeywords) : '';
                // var startPage = 0;

                // startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.body.surveyMasterId),
                    req.st.db.escape(req.body.QTemplateId),
                    req.st.db.escape(JSON.stringify(questionDetails))
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_employeeSurveyByUsers( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Survey submitted successfully";
                        response.error = null;
                        response.data = results[0][0];
                        res.status(200).json(response);

                    }
                    else {
                        response.status = false;
                        response.message = "Error while submitting data";
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

employeeSurveyCtrl.getSurveyMaster = function (req, res, next) {
    var response = {
        status: false,
        message: "Error while loading data",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.token = req.query.token ? req.query.token : '';
                req.query.heMasterId = req.query.heMasterId ? req.query.heMasterId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_SurveyMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Survey master loaded successfully";
                        response.error = null;

                        // template list with questions options
                        for (var i = 0; i < results[3].length; i++) {
                            if (typeof (results[3][i].questionDetails) == 'string') {
                                results[3][i].questionDetails = JSON.parse(results[3][i].questionDetails);
                            }

                            for (var j = 0; j < results[3][i].questionDetails.length; j++) {
                                if (typeof (results[3][i].questionDetails[j].options) == 'string') {
                                    results[3][i].questionDetails[j].options = JSON.parse(results[3][i].questionDetails[j].options);
                                }
                            }
                        }


                        for (var i = 0; i < results[2].length; i++) {
                            results[2][i].questionType = (results[2][i] && results[2][i].questionType) ? JSON.parse(results[2][i].questionType) : {};
                            results[2][i].dropDownType = (results[2][i] && results[2][i].dropDownType) ? JSON.parse(results[2][i].dropDownType) : {};
                        }

                        response.data = {
                            questionTypeList: results[0] ? results[0] : [],
                            dropDownTypeList: results[1] ? results[1] : [],
                            questionList: (results[2] && results[2][0]) ? results[2] : [],
                            templateList: (results[3] && results[3][0]) ? results[3] : [],
                            userList: (results[4] && results[4][0]) ? results[4] : []
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = false;
                        response.message = "No data found";
                        response.error = null;
                        response.data = {};
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading survey data";
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


employeeSurveyCtrl.saveSurveyForWebConfig = function (req, res, next) {
    var response = {
        status: false,
        message: "Error while saving datass",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }

    var questions = req.body.questions;
    if (typeof (questions) == "string") {
        questions = JSON.parse(questions);
    }
    if (!questions) {
        questions = [];
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.body.token = (req.body.token) ? (req.body.token) : '';
                req.body.heMasterId = (req.body.heMasterId) ? req.body.heMasterId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(questions))
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_EmployeeSurveyForQuestionsMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Question added successfully";
                        response.error = null;

                        for (var i = 0; i < results[0].length; i++) {
                            results[0][i].dropDownType = (results[0][i] && results[0][i].dropDownType) ? results[0][i].dropDownType : {}
                            results[0][i].questionType = (results[0][i] && results[0][i].questionType) ? results[0][i].questionType : {}
                        }
                        response.data = results[0];
                        res.status(200).json(response);

                    }
                    else {
                        response.status = false;
                        response.message = "Error while adding question";
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



employeeSurveyCtrl.saveSurveyTemplateWithQuestions = function (req, res, next) {
    var response = {
        status: false,
        message: "No token Found",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }

    var template = req.body.template;
    if (typeof (template) == "string") {
        template = JSON.parse(template);
    }
    if (!template) {
        template = {};
    }

    var questions = req.body.questions;
    if (typeof (questions) == "string") {
        questions = JSON.parse(questions);
    }
    if (!questions) {
        questions = [];
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.body.token = (req.body.token) ? (req.body.token) : '';
                req.body.heMasterId = (req.body.heMasterId) ? req.body.heMasterId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(template)),
                    req.st.db.escape(JSON.stringify(questions))
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_EmployeeSurveyTemplate( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Survey template saved successfully";
                        response.error = null;
                        response.data = results[0][0];
                        res.status(200).json(response);

                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving survey template";
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

employeeSurveyCtrl.uploadUsersfromweb = function (req, res, next) {

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

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.body.Department = req.body.Department ? req.body.Department : '';
                req.body.JobTitle = req.body.JobTitle ? req.body.JobTitle : '';
                req.body.Location = req.body.Location ? req.body.Location : '';

                var password = randomstring.generate({
                    length: 6,
                    charset: 'alphanumeric'
                });
                var message = "";

                var encryptPwd = req.st.hashPassword(password);
                // var Qndata = req.body.data;
                // console.log("req.body.data",req.body.data);
                console.log('req.body', req.body);

                var name = req.body.Name;
                var email = req.body.Email;
                var mobile = req.body.Mobile;
                var isdmobile = req.body.ISDMobile;

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
                    req.st.db.escape(DBSecretKey)
                ];

                //CompanyName
                var procQuery = 'CALL he_import_bulkUsersfromweb( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query("select title as companyName from wmlist where tid=(select wmlistId from themaster where tid=" + req.query.heMasterId + ");", function (err1, companyResult) {
                    console.log('err', err);
                    console.log("companyResult", companyResult[0].companyName);
                    if (!err1 && companyResult && companyResult[0]) {
                        var companyName = companyResult[0] ? companyResult[0].companyName : '';

                        req.db.query(procQuery, function (err, userResult) {
                            console.log('err', err);
                            // console.log('userResult',userResult);
                            if (!err && userResult && userResult[0]) {
                                if (userResult[0][0].status == "New") {
                                    if (resinput.Email != "") {
                                        // mailerApi.sendMailNew('NewUserUpload', {
                                        //     name : Qndata[0].name,
                                        //     UserName : userResult[0][0].whatmateId,
                                        //     Password : password
                                        // }, '',Qndata[0].email,[]);

                                        if (userResult[0][0].emailtext != "") {
                                            userResult[0][0].emailtext = userResult[0][0].emailtext.replace("[Name]", name);
                                            userResult[0][0].emailtext = userResult[0][0].emailtext.replace("[UserName]", (userResult[0][0].loginId ? userResult[0][0].loginId : userResult[0][0].whatmateId));
                                            userResult[0][0].emailtext = userResult[0][0].emailtext.replace("[Password]", password);



                                            var mail = {
                                                from: 'noreply@talentmicro.com',
                                                to: resinput.Email,
                                                subject: userResult[0][0].whatmateSignUpSubject ? userResult[0][0].whatmateSignUpSubject : 'Your user Credentials for WhatMate App',
                                                html: userResult[0][0].emailtext // html body
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
                                    message = 'Dear ' + name + ', Your WhatMate credentials, Login ID: ' + (userResult[0][0].loginId ? userResult[0][0].loginId : userResult[0][0].whatmateId) + ',Password: ' + password;


                                    message = userResult[0][0].whatmateSignUpMessage ? userResult[0][0].whatmateSignUpMessage : message;
                                    message = message.replace('[LoginId]', (userResult[0][0].loginId ? userResult[0][0].loginId : userResult[0][0].whatmateId));
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
                                                    console.log("SUCCESS", "SMS response");
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
                                                    console.log("SUCCESS", "SMS response");
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
                                                        console.log("SUCCESS", "SMS response");
                                                    }
                                                }
                                            );

                                            // request({
                                            //     url: 'https://rest.nexmo.com/sms/json',
                                            //     qs: {
                                            //         api_key : '4405b7b5 ',
                                            //         api_secret : '77dfad076c27e4c8',
                                            //         to: Qndata[0].isdmobile.replace("+","") + Qndata[0].mobile,
                                            //         from : 'WtMate',
                                            //         text: message
                                            //     },
                                            //     method: 'POST'
                                            //
                                            // }, function (error, response, body) {
                                            //     if(error)
                                            //     {
                                            //         console.log(error,"SMS");
                                            //     }
                                            //     else{
                                            //         console.log("SUCCESS","SMS response");
                                            //     }
                                            // });

                                        }

                                    }

                                }
                                else if (userResult[0][0].status == "Existing" || userResult[0][0].status == "Duplicate") {
                                    if (resinput.Email != "") {
                                        // mailerApi.sendMailNew('existingUsers', {
                                        //     name : Qndata[0].name,
                                        //     UserName : userResult[0][0].whatmateId,
                                        //     CompanyName : req.query.CompanyName
                                        // }, '',Qndata[0].email,[]);
                                        if (userResult[0][0].ExistingUserEmailText != "") {
                                            userResult[0][0].ExistingUserEmailText = userResult[0][0].ExistingUserEmailText.replace("[Name]", name);
                                            userResult[0][0].ExistingUserEmailText = userResult[0][0].ExistingUserEmailText.replace("[UserName]", (userResult[0][0].loginId ? userResult[0][0].loginId : userResult[0][0].whatmateId));
                                            userResult[0][0].ExistingUserEmailText = userResult[0][0].ExistingUserEmailText.replace("[CompanyName]", companyName);

                                            
                                            mail = {
                                                from: 'noreply@talentmicro.com',
                                                to: resinput.Email,
                                                subject: 'Your user Credentials for WhatMate App',
                                                html: userResult[0][0].ExistingUserEmailText // html body
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

                                    message = 'Dear ' + name + ', Your existing profile on WhatMate is successfully linked to ' + companyName + ' now.';

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
                                                    console.log("SUCCESS", "SMS response");
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
                                                    console.log("SUCCESS", "SMS response");
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
                                                        console.log("SUCCESS", "SMS response");
                                                    }
                                                }
                                            );
                                            // request({
                                            //     url: 'https://rest.nexmo.com/sms/json',
                                            //     qs: {
                                            //         api_key : '4405b7b5 ',
                                            //         api_secret : '77dfad076c27e4c8',
                                            //         to: Qndata[0].isdmobile.replace("+","") + Qndata[0].mobile,
                                            //         from : 'WtMate',
                                            //         text: message
                                            //     },
                                            //     method: 'POST'
                                            //
                                            // }, function (error, response, body) {
                                            //     if(error)
                                            //     {
                                            //         console.log(error,"SMS");
                                            //     }
                                            //     else{
                                            //         console.log("SUCCESS","SMS response");
                                            //     }
                                            // });

                                        }

                                    }
                                }

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
                });

            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

employeeSurveyCtrl.getSurveyListWeb = function (req, res, next) {
    var response = {
        status: false,
        message: "Error while loading data",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.hemasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.token = req.query.token ? req.query.token : '';
                req.query.heMasterId = req.query.heMasterId ? req.query.heMasterId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_surveyListWeb( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Survey list loaded successfully";
                        response.error = null;

                        // template list with questions options
                        for (var i = 0; i < results[0].length; i++) {
                            if (typeof (results[0][i].questionDetails) == 'string') {
                                results[0][i].questionDetails = JSON.parse(results[0][i].questionDetails);
                            }

                            if (typeof (results[0][i].userDetails) == 'string') {
                                results[0][i].userDetails = JSON.parse(results[0][i].userDetails);
                            }

                            for (var j = 0; j < results[0][i].questionDetails.length; j++) {
                                if (typeof (results[0][i].questionDetails[j].options) == 'string') {
                                    results[0][i].questionDetails[j].options = JSON.parse(results[0][i].questionDetails[j].options);
                                }
                            }
                        }


                        response.data = {
                            surveyList: (results[0] && results[0][0]) ? results[0] : []
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {};
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading survey list";
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


employeeSurveyCtrl.notifySurvey = function (req, res, next) {
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
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.usersFlag = req.query.usersFlag != undefined ? req.query.usersFlag : 3;
                req.query.reminderTitle = req.query.reminderTitle != undefined ? req.query.reminderTitle : '';

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.surveyMasterId),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.reminderTitle),
                    req.st.db.escape(req.query.usersFlag),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to My self and my team leave apllications
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_surveyNotifier( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {

                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Survey notified successfully";
                        response.error = null;
                        response.data = (results[0] && results[0][0]) ? results[0][0] : {};
                        res.status(200).json(response);

                        notifyMessages.getMessagesNeedToNotify();
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Survey notify failed";
                        response.error = null;
                        response.data = {};
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while notifying survey";
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


employeeSurveyCtrl.surveyReportExport = function (req, res, next) {
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
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }
    if (!req.query.surveyMasterId) {
        error.surveyMasterId = 'Invalid surveyId';
        validationFlag *= false;
    }


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.surveyMasterId),
                    req.st.db.escape(req.query.heMasterId)
                ];
                /**
                 * Calling procedure to My self and my team leave apllications
                 * @type {string}
                 */
                var procQuery = 'CALL wm_surveyReportExport( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {

                    if (!err && results && results[0] && results[0][0] && results[1] && results[1][0]) {
                        response.status = true;
                        response.message = "Survey report loaded successfully";
                        response.error = null;

                        for (var i = 0; i < results[1].length; i++) {
                            results[1][i].answers = (results[1] && results[1][i]) ? JSON.parse(results[1][i].answers) : [];
                        }

                        response.data = {
                            questions: (results[0] && results[0][0]) ? results[0] : [],
                            userReport: (results[1] && results[1][0]) ? results[1] : []

                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Survey report empty";
                        response.error = null;
                        response.data = {};
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting survey report";
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

employeeSurveyCtrl.surveyStatusChange = function (req, res, next) {
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
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!req.query.surveyStatus) {
        error.surveyStatus = 'Invalid survey status';
        validationFlag *= false;
    }



    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.surveyMasterId),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.surveyStatus)
                ];
                /**
                 * Calling procedure to My self and my team leave apllications
                 * @type {string}
                 */
                var procQuery = 'CALL wm_update_surveyStatus( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {

                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Survey status changed successfully";
                        response.error = null;
                        response.data = (results[0] && results[0][0]) ? results[0][0] : {};
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Unable to change status";
                        response.error = null;
                        response.data = {};
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while notifying survey";
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


employeeSurveyCtrl.surveyQuestionReport = function (req, res, next) {
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
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    if (!req.query.surveyMasterId) {
        error.surveyMasterId = 'Invalid surveyId';
        validationFlag *= false;
    }


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        try {

            req.st.validateToken(req.query.token, function (err, tokenResult) {

                if ((!err) && tokenResult) {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.query.surveyMasterId)

                    ];

                    /**
                     * Calling procedure to My self and my team leave apllications
                     * @type {string}
                     */
                    var procQuery = 'CALL wm_get_surveyQuestionReports( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, results) {

                        if (!err && results && results[0] && results[0][0]) {
                            response.status = true;
                            response.message = "Survey report loaded successfully";
                            response.error = null;

                            for (var i = 0; i < results[0].length; i++) {
                                results[0][i].optionDetail = (results[0] && results[0][i]) ? JSON.parse(results[0][i].optionDetail) : [];
                            }

                            response.data = results[0];
                            res.status(200).json(response);
                        }
                        else if (!err) {
                            response.status = true;
                            response.message = "Survey report empty";
                            response.error = null;
                            response.data = {};
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting survey report";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            response.status = false;
            response.message = "An error occurred!";
            response.error = null;
            response.data = null;
            res.status(500).json(response);
        }

    }

};

module.exports = employeeSurveyCtrl;