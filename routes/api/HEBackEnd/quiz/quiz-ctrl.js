var quizCtrl = {};
var error = {};

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

const accountSid = 'AC3765f2ec587b6b5b893566f1393a00f4';  //'ACcf64b25bcacbac0b6f77b28770852ec9';//'AC3765f2ec587b6b5b893566f1393a00f4';
const authToken = 'b36eba6376b5939cebe146f06d33ec57';   //'3abf04f536ede7f6964919936a35e614';  //'b36eba6376b5939cebe146f06d33ec57';//
const FromNumber = appConfig.DB.FromNumber || '+18647547021';
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

quizCtrl.getQuizList = function (req, res, next) {
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
                var procQuery = 'CALL wm_get_quizTemplate( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {

                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Quiz list loaded successfully";
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
                           quizList: results[0],
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
                            quizList: []
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

quizCtrl.saveQuizOfUsers = function (req, res, next) {
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

                req.body.QuizMasterId = (req.body.QuizMasterId) ? (req.body.QuizMasterId) : 0;
                req.body.QTemplateId = (req.body.QTemplateId) ? req.body.QTemplateId : 0;

                // req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                // req.query.searchKeywords = (req.query.searchKeywords) ? (req.query.searchKeywords) : '';
                // var startPage = 0;

                // startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.body.quizMasterId),
                    req.st.db.escape(req.body.QTemplateId),
                    req.st.db.escape(JSON.stringify(questionDetails))
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_quizByUsers( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Quiz submitted successfully";
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

quizCtrl.quizConfigureToUsers = function (req, res, next) {
    var response = {
        status: false,
        message: "Error while publishing Quiz",
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

                req.body.quizManagerId = (req.body.quizManagerId) ? (req.body.quizManagerId) : 0;
                req.body.publishingType = (req.body.publishingType) ? req.body.publishingType : 0;
                req.body.reminderText = (req.body.reminderText) ? (req.body.reminderText) : "";
                req.body.startDate = (req.body.startDate) ? (req.body.startDate) : null;
                req.body.endDate = (req.body.endDate) ? (req.body.endDate) : null;
                req.body.reminderDate = (req.body.reminderDate) ? (req.body.reminderDate) : null;
                req.body.publishQuiz = (req.body.publishQuiz) ? (req.body.publishQuiz) : 0;
                req.body.status = 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.quizManagerId),
                    req.st.db.escape(req.body.templateId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.startDate),
                    req.st.db.escape(req.body.endDate),
                    req.st.db.escape(req.body.reminderDate),
                    req.st.db.escape(req.body.reminderText),
                    req.st.db.escape(req.body.publishingType),
                    req.st.db.escape(JSON.stringify(users)),
                    req.st.db.escape(req.body.publishQuiz),
                    req.st.db.escape(JSON.stringify(userList)),
                    req.st.db.escape(JSON.stringify(branchList)),
                    req.st.db.escape(JSON.stringify(departmentList)),
                    req.st.db.escape(JSON.stringify(gradeList)),
                    req.st.db.escape(JSON.stringify(groupList)),
                    req.st.db.escape(req.body.status)
                ];
                /**CALL wm_save_employeeQuizpublish
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_employeeQuizpublish_new( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Quiz data saved successfully";
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

quizCtrl.getQuizMaster = function (req, res, next) {
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
                var procQuery = 'CALL wm_get_quizMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Quiz master loaded successfully";
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
                        response.message = "Error while loading Quiz data";
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


quizCtrl.saveQuizForWebConfig = function (req, res, next) {
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
                var procQuery = 'CALL wm_save_quizQuestionsMaster( ' + procParams.join(',') + ')';
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

quizCtrl.saveQuizTemplateWithQuestions = function (req, res, next) {
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
                var procQuery = 'CALL wm_save_EmployeeQuizTemplate( ' + procParams.join(',') + ')';
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


quizCtrl.getQuizListWeb = function (req, res, next) {
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
                var procQuery = 'CALL wm_get_quizListWeb( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Quiz list loaded successfully";
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
                           quizList: (results[0] && results[0][0]) ? results[0] : []
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
                        response.message = "Error while loading quiz list";
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

quizCtrl.quizStatusChange = function (req, res, next) {
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

    if (!req.query.quizStatus) {
        error.quizStatus = 'Invalid quiz status';
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
                    req.st.db.escape(req.query.quizMasterId),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.quizStatus)
                ];
                /**
                 * Calling procedure to My self and my team leave apllications
                 * @type {string}
                 */
                var procQuery = 'CALL wm_update_quizStatus( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {

                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Quiz status changed successfully";
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

quizCtrl.notifyquiz = function (req, res, next) {
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
                    req.st.db.escape(req.query.quizMasterId),
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
                var procQuery = 'CALL wm_save_quizNotifier( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {

                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Quiz notified successfully";
                        response.error = null;
                        response.data = (results[0] && results[0][0]) ? results[0][0] : {};
                        res.status(200).json(response);

                        notifyMessages.getMessagesNeedToNotify();
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Quiz notify failed";
                        response.error = null;
                        response.data = {};
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while notifying Quiz";
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

quizCtrl.quizQuestionReport = function (req, res, next) {
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

    if (!req.query.quizMasterId) {
        error.quizMasterId = 'Invalid quizId';
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
                        req.st.db.escape(req.query.quizMasterId)

                    ];

                    /**
                     * Calling procedure to My self and my team leave apllications
                     * @type {string}
                     */
                    var procQuery = 'CALL wm_get_quizQuestionReports( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, results) {

                        if (!err && results && results[0] && results[0][0]) {
                            response.status = true;
                            response.message = "Quiz report loaded successfully";
                            response.error = null;

                            for (var i = 0; i < results[0].length; i++) {
                                results[0][i].optionDetail = (results[0] && results[0][i]) ? JSON.parse(results[0][i].optionDetail) : [];
                            }

                            response.data = results[0];
                            res.status(200).json(response);
                        }
                        else if (!err) {
                            response.status = true;
                            response.message = "Quiz report empty";
                            response.error = null;
                            response.data = {};
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting quiz report";
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


quizCtrl.quizReportExport = function (req, res, next) {
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
    if (!req.query.quizMasterId) {
        error.quizMasterId = 'Invalid quizMasterId';
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
                    req.st.db.escape(req.query.quizMasterId),
                    req.st.db.escape(req.query.heMasterId)
                ];
                /**
                 * Calling procedure to My self and my team leave apllications
                 * @type {string}
                 */
                var procQuery = 'CALL wm_quizReportExport( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {

                    if (!err && results && results[0] && results[0][0] && results[1] && results[1][0]) {
                        response.status = true;
                        response.message = "Quiz report loaded successfully";
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
                        response.message = "Quiz report empty";
                        response.error = null;
                        response.data = {};
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting quiz report";
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

module.exports = quizCtrl;