
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();

var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();

var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('https');
var path = require('path');

var request = require('request');
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var appConfig = require('../../../../ezeone-config.json');

var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

const accountSid = 'AC3765f2ec587b6b5b893566f1393a00f4';  //'ACcf64b25bcacbac0b6f77b28770852ec9';//'AC3765f2ec587b6b5b893566f1393a00f4';
const authToken = 'b36eba6376b5939cebe146f06d33ec57';   //'3abf04f536ede7f6964919936a35e614';  //'b36eba6376b5939cebe146f06d33ec57';//
const FromNumber = appConfig.DB.FromNumber || '+18647547021';
const client = require('twilio')(accountSid, authToken);


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



var paceUsersCtrl = {};
var error = {};
var bcrypt = null;

// try {
//     bcrypt = require('bcrypt');
// }
// catch (ex) {
//     console.log('Bcrypt not found, falling back to bcrypt-nodejs');
//     bcrypt = require('bcrypt-nodejs');
// }

// /**
//  * Hashes the password for saving into database
//  * @param password
//  * @returns {*}
//  */
// function hashPassword(password) {
//     if (!password) {
//         return null;
//     }
//     try {
//         var hash = bcrypt.hashSync(password, 12);
//         return hash;
//     }
//     catch (ex) {
//         console.log(ex);
//     }
// }

// /**
//  * Compare the password and the hash for authenticating purposes
//  * @param password
//  * @param hash
//  * @returns {*}
//  */
// function comparePassword(password, hash) {
//     if (!password) {
//         return false;
//     }
//     if (!hash) {
//         return false;
//     }
//     return bcrypt.compareSync(password, hash);
// }

paceUsersCtrl.checkUser = function (req, res, next) {
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
    if (!req.query.ezeoneId) {
        error.ezeoneId = 'Invalid ezeoneId';
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.ezeoneId),
                    req.st.db.escape(DBSecretKey)

                ];

                var procQuery = 'CALL wm_validate_paceUserId( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "User check completed successfully";
                        response.error = null;
                        response.data = result[0];
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while user check";
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


paceUsersCtrl.paceLoginValidation = function (req, res, next) {
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
    if (!req.query.ezeId) {
        error.ezeId = 'Invalid ezeId';
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.ezeId)
                ];

                var procQuery = 'CALL wm_pace_login( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Valid Pace HCM User";
                        response.error = null;
                        response.data = result[0][0];
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "No results found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Not a Valid Pace HCM User";
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

paceUsersCtrl.getUsers = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        validationFlag = false;
        error.heMasterId = "Invalid company";
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.query.userMasterId = req.query.userMasterId ? req.query.userMasterId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.userMasterId),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_get_pace_users( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Users loaded successfully";
                        response.error = false;

                        if (req.query.userMasterId == 0) {
                            for (var i = 0; i < result[0].length; i++) {
                                result[0][i].accessRights = (result[0][i].accessRights && JSON.parse(result[0][i].accessRights).templateId) ? JSON.parse(result[0][i].accessRights) : {};

                                result[0][i].department = (result[0][i].department && JSON.parse(result[0][i].department).departmentId) ? JSON.parse(result[0][i].department) : {};

                                result[0][i].branch = (result[0][i].branch && JSON.parse(result[0][i].branch).branchId) ? JSON.parse(result[0][i].branch) : {};

                                result[0][i].grade = (result[0][i].grade && JSON.parse(result[0][i].grade).gradeId) ? JSON.parse(result[0][i].grade) : {};


                            }
                        }
                        else {

                            result[0][0].jobTitle = (result[0][0].jobTitle && JSON.parse(result[0][0].jobTitle).jobTitleId) ? JSON.parse(result[0][0].jobTitle) : {};

                            result[0][0].userType = (result[0][0].userType && JSON.parse(result[0][0].userType).userTypeId) ? JSON.parse(result[0][0].userType) : {};

                            result[0][0].transferredTo = (result[0][0].transferredTo && JSON.parse(result[0][0].transferredTo).transferredToUserId) ? JSON.parse(result[0][0].transferredTo) : {};

                            result[0][0].reportingTo = result[0][0].reportingTo ? JSON.parse(result[0][0].reportingTo) : [];

                            result[0][0].accessRights = (result[0][0].accessRights && JSON.parse(result[0][0].accessRights).templateId) ? JSON.parse(result[0][0].accessRights) : {};

                            result[0][0].department = (result[0][0].department && JSON.parse(result[0][0].department).departmentId) ? JSON.parse(result[0][0].department) : {};

                            result[0][0].branch = (result[0][0].branch && JSON.parse(result[0][0].branch).branchId) ? JSON.parse(result[0][0].branch) : {};

                            result[0][0].grade = (result[0][0].grade && JSON.parse(result[0][0].grade).gradeId) ? JSON.parse(result[0][0].grade) : {};
                        }

                        response.data = {
                            userList: result[0] ? result[0] : [],
                            userDetail: result[0][0] ? result[0][0] : {}
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading users";
                        response.error = true;
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

paceUsersCtrl.saveTaskPlanner = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.body.heMasterId) {
        validationFlag = false;
        error.heMasterId = "Invalid Company";
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    var venue = req.body.venue;
    if (typeof (venue) == "string") {
        venue = JSON.parse(venue);
    }
    if (!venue) {
        venue = {};
    }

    var anchor = req.body.anchor;
    if (typeof (anchor) == "string") {
        anchor = JSON.parse(anchor);
    }
    if (!anchor) {
        anchor = {};
    }

    var attachmentList = req.body.attachmentList;
    if (typeof (attachmentList) == "string") {
        attachmentList = JSON.parse(attachmentList);
    }
    if (!attachmentList) {
        attachmentList = [];
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.taskId = req.body.taskId ? req.body.taskId : 0;
                req.body.priority = req.body.priority ? req.body.priority : 0;
                req.body.taskDateTime = req.body.taskDateTime ? req.body.taskDateTime : null;
                req.body.taskEndDate = req.body.taskEndDate ? req.body.taskEndDate : null;
                req.body.status = req.body.status ? req.body.status : 0;  // 0 pending ,1- completed
                // req.body.eventAttachment = req.body.eventAttachment ? req.body.eventAttachment : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.taskId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(req.body.taskTitle),
                    req.st.db.escape(req.body.taskDescription),
                    req.st.db.escape(req.body.taskDateTime),
                    req.st.db.escape(req.body.priority),
                    req.st.db.escape(req.body.taskEndDate),
                    req.st.db.escape(JSON.stringify(venue)),
                    req.st.db.escape(JSON.stringify(anchor)),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(JSON.stringify(attachmentList))

                ];

                var procQuery = 'CALL wm_save_pacePlanner( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    if (!err && result && result[0] || result[1]) {
                        response.status = true;
                        response.message = "Task saved successfully";
                        response.error = null;
                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].anchor = result[0][i].anchor ? JSON.parse(result[0][i].anchor) : {};
                            result[0][i].venue = result[0][i].venue ? JSON.parse(result[0][i].venue) : {};
                            result[0][i].attachmentList = result[0][i].attachmentList ? JSON.parse(result[0][i].attachmentList) : [];

                        }

                        for (var i = 0; i < result[1].length; i++) {
                            result[1][i].anchor = result[1][i].anchor ? JSON.parse(result[1][i].anchor) : {};
                            result[1][i].venue = result[1][i].venue ? JSON.parse(result[1][i].venue) : {};
                            result[1][i].attachmentList = result[1][i].attachmentList ? JSON.parse(result[1][i].attachmentList) : [];

                        }
                        response.data = {
                            pendingTasks: result[0],
                            tasks: result[1]
                        }
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving task";
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


paceUsersCtrl.getTaskPlanner = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        validationFlag *= false;
        error.heMasterId = "Invalid Company";
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
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

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.taskByMonth),
                    req.st.db.escape(req.query.keywords || "")
                ];

                var procQuery = 'CALL wm_get_pacePlanner( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && (result[0] || result[1])) {
                        response.status = true;
                        response.message = "Tasks loaded successfully";
                        response.error = null;
                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].anchor = result[0][i].anchor ? JSON.parse(result[0][i].anchor) : {};
                            result[0][i].venue = result[0][i].venue ? JSON.parse(result[0][i].venue) : {};
                            result[0][i].attachmentList = result[0][i].attachmentList ? JSON.parse(result[0][i].attachmentList) : [];

                        }

                        for (var i = 0; i < result[1].length; i++) {
                            result[1][i].anchor = result[1][i].anchor ? JSON.parse(result[1][i].anchor) : {};
                            result[1][i].venue = result[1][i].venue ? JSON.parse(result[1][i].venue) : {};
                            result[1][i].attachmentList = result[1][i].attachmentList ? JSON.parse(result[1][i].attachmentList) : [];

                        }
                        response.data =
                            {
                                pendingTasks: result[0],
                                tasks: result[1]
                            };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading tasks";
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

paceUsersCtrl.getdashBoard = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag = false;
    }

    if (!req.query.userMasterId) {
        error.userMasterId = "Invalid user";
        validationFlag = false;
    }

    if (!req.query.token) {
        error.token = 'Invalid token';
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
                req.query.type = req.query.type ? req.query.type : 1;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.userMasterId),
                    req.st.db.escape(req.query.type),
                    req.st.db.escape(req.body.from),
                    req.st.db.escape(req.body.to)
                ];

                var procQuery = 'CALL wm_get_DashBoard( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "data loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < result[1].length; i++) {
                            var res2 = {};
                            res2.stage = result[1][i].stage ? JSON.parse(result[1][i].stage) : {};
                            output.push(res2);
                        }

                        var output1 = [];

                        for (var i = 0; i < result[2].length; i++) {
                            var res3 = {};
                            res3.name = result[2][i] ? result[2][i].name:"";
                            res3.userMasterId = result[2] && result[2][i] ? result[2][i].userMasterId : 0;
                            res3.stage = result[2][i].stage ? JSON.parse(result[2][i].stage) : [];
                            output1.push(res3);
                        }

                        var output2 = [];
                        for (var i = 0; i < result[4].length; i++) {
                            var res4 = {};
                            res4.clientId = result[4][i].clientId;
                            res4.clientName = result[4][i].clientName;
                            res4.stage = result[4][i].stage ? JSON.parse(result[4][i].stage) : {};
                            output2.push(res4);
                        }

                        // for (var i = 0; i < result[7].length; i++) {
                        //     result[7][i].reqAppDetails = result[7][i].reqAppDetails ? JSON.parse(result[7][i].reqAppDetails) : [];
                        // }

                        // for (var i = 0; i < result[8].length; i++) {
                        //     result[8][i].reqAppDetails = result[8][i].reqAppDetails ? JSON.parse(result[8][i].reqAppDetails) : [];
                        // }


                        response.data =
                            {
                                requirementStatus: result[0][0].requirementStatus ? JSON.parse(result[0][0].requirementStatus) : {},
                                stages: output,
                                requirementReport: output1,
                                requirementReportTotalCount: result[3],
                                fullfilmentReport: output2,
                                fullfilmentReportTotalCount: result[5],
                                converstionReport: result[6][0],
                                turnAroundTime: result[7][0],
                                firstCVResponse: result[8][0]
                            };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            requirementStatus: {},
                            stages: [],
                            requirementReport: [],
                            requirementReportTotalCount: [],
                            fullfilmentReport: [],
                            fullfilmentReportTotalCount: [],
                            converstionReport: {},
                            turnAroundTime: [],
                            firstCVResponse: []

                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading dashobard data";
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

paceUsersCtrl.saveTrackerTemplate = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.body.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    var tagsJson = req.body.tagsJson;
    if (typeof (tagsJson) == "string") {
        tagsJson = JSON.parse(tagsJson);
    }
    if (!tagsJson) {
        tagsJson = [];
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.trackerId),
                    req.st.db.escape(req.body.userMasterId),
                    req.st.db.escape(req.body.templateName),
                    req.st.db.escape(req.body.generatedFileName),
                    req.st.db.escape(JSON.stringify(tagsJson))
                ];

                var procQuery = 'CALL paceusers_tracker( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "tracker saved successfully";
                        response.error = null;
                        response.data = result[0][0];
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving tracker template";
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

paceUsersCtrl.getBaseFile = function (req, res, next) {
    var response = {
        status: false,
        code: null,
        message: "bas64 File",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.query.cdnPath = req.query.cdnPath ? req.query.cdnPath : "";

                var url = "https://storage.googleapis.com/ezeone/" + req.query.cdnPath;
                http.get(url, function (fileResponse) {
                    var bufs = [];

                    fileResponse.on('data', function (d) { bufs.push(d); });
                    fileResponse.on('end', function () {
                        var buf = Buffer.concat(bufs);
                        // console.log('before base',buf);
                        buf = new Buffer(buf).toString("base64");
                        // console.log('base 64',buf);
                        response.data = buf;
                        res.status(200).json(response);
                    });
                });



                // request.get(url, function (error, response, body) { 
                //     if (!error && response.statusCode == 200) 
                //     { 

                //         data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64'); 
                //         // console.log(data);
                //         res.status(200).json(data);
                //         // console.log(body,'----body');
                //         // console.log(response,'----response');
                //     }});
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

paceUsersCtrl.toVerifyOtp = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid otp",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.body.mobileNo) {
        error.mobileNo = "Mobile number is mandatory";
        validationFlag = false;
    }
    if (!req.body.isdMobile) {
        error.isdMobile = "isdMobile number is mandatory";
        validationFlag = false;
    }

    if (!req.body.otp) {
        error.otp = "Please enter OTP";
        validationFlag = false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        var inputs = [
            req.st.db.escape(req.body.isdMobile),
            req.st.db.escape(req.body.mobileNo),
            req.st.db.escape(req.body.otp),
            req.st.db.escape(DBSecretKey)
        ];

        var procQuery = 'CALL wm_paceUserManager_verifyOtpInuse( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            // console.log(result);
            if (!err && result && result[0][0].message == "OTP verified successfully" && result[1][0].error == "user already exist") {
                response.status = false;
                response.message = result[0][0].message;
                response.code = 100;
                response.error = false;
                response.data = {
                    message: result[1][0].error
                };
                res.status(200).json(response);
            }

            else if (!err && result && result[0][0].message == "OTP verified successfully" && result[1][0].error == "user exists but inactive") {
                response.status = false;
                response.message = result[0][0].message;
                response.code = 100;
                response.error = false;
                response.data = {
                    message: result[1][0].error
                };
                res.status(200).json(response);
            }

            else if (!err && result && result[0][0].message == "OTP verified successfully" && result[1][0].success == "paceuser does not exist") {
                response.status = true;
                response.message = result[1][0].success;
                response.code = 200;
                response.error = false;
                response.data = {
                    userDetails: result[2][0]
                };
                res.status(200).json(response);
            }

            else if (!err && result && result[0][0].message == "OTP verified successfully" && result[1][0].success == "user does not exist in whatmate") {
                response.status = true;
                response.message = result[1][0].success;
                response.code = 300;
                response.error = false;
                response.data = null;
                res.status(200).json(response);
            }

            else if (!err && result && result[0][0].message == "INVALID OTP") {
                response.status = false;
                response.message = result[0][0].message;
                response.error = false;
                response.code = 400;
                response.data = {
                    message: result[0][0].message
                };
                res.status(200).json(response);
            }
            else if (!err) {
                response.status = true;
                response.message = "No result found";
                response.code = 600;
                response.error = false;
                response.data = null;
                res.status(200).json(response);
            }
            else {
                response.status = false;
                response.message = "Error while verifying OTP";
                response.error = true;
                response.code = 500;
                response.data = null;
                res.status(500).json(response);
            }
        });
    }
};

paceUsersCtrl.saveLayout = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    var layout = req.body.layout;
    if (typeof (layout) == "string") {
        layout = JSON.parse(layout);
    }
    if (!layout) {
        layout = [];
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(layout))
                ];

                var procQuery = 'CALL wm_save_pacelayout( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Layout saved successfully";
                        response.error = null;
                        if (typeof (layout) == "string") {
                            layout = JSON.parse(layout);
                        }
                        response.data = layout;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving layout";
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



paceUsersCtrl.getMailDetails = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        validationFlag *= false;
        error.heMasterId = "Invalid Company";
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.reqAppId) {
        error.reqAppId = 'Invalid reqApplicant';
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
                req.query.transactionId = req.query.transactionId ? req.query.transactionId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.reqAppId),
                    req.st.db.escape(req.query.stageId),
                    req.st.db.escape(req.query.transactionId)
                ];

                var procQuery = 'CALL wm_getMailDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Mail details loaded successfully";
                        response.error = null;
                        response.data = JSON.parse(result[0][0].mailDetails);
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading mails";
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


paceUsersCtrl.saveJobPortalUsers = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    var portalName = req.body.portalName;
    if (typeof (portalName) == "string") {
        portalName = JSON.parse(portalName);
    }
    if (!portalName) {
        portalName = {};
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                // var encryptPwd = '';
                // if (req.body.password) {
                //     encryptPwd = req.st.hashPassword(req.body.password);
                // }

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(portalName)),
                    req.st.db.escape(req.body.userName),
                    req.st.db.escape(req.body.password)
                ];

                //if (comparePassword(password, loginResult[0][0].Password)) {

                var procQuery = 'CALL wm_save_jobPortalUsers( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Job portal details saved successfully";
                        response.error = null;

                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].portalName = result[0] ? JSON.parse(result[0][i].portalName) : {};
                        }

                        response.data = {
                            portalUsersList: result[0] ? result[0] : []
                        }
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while job portal details";
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


paceUsersCtrl.getJobPortalUsers = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_jobPortalUsersList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    if (!err && result && (result[0] || result[1][0])) {
                        response.status = true;
                        response.message = "Job portal details loaded successfully";
                        response.error = null;

                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].portalName = result[0] ? JSON.parse(result[0][i].portalName) : {};
                        }

                        response.data = {
                            portalUsersList: result[0] ? result[0] : [],
                            jobPortalList: result[1] ? result[1] : []
                        }
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            portalUsersList: [],
                            jobPortalList: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading job portal details";
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


paceUsersCtrl.freeJobPortalUsers = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.portalId) {
        error.portalId = 'Invalid portalId';
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.portalId)
                ];

                var procQuery = 'CALL wm_get_freeJobPortalUser( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Job portal details loaded successfully";
                        response.error = null;

                        result[0][0].portalName = (result[0] && result[0][0] && JSON.parse(result[0][0].portalName)) ? JSON.parse(result[0][0].portalName) : {};

                        response.data = {
                            freePortal: (result[0] && result[0]) ? result[0][0] : {}

                        }
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            freePortal: {}
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading job portal details";
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

paceUsersCtrl.checkApplicantExists = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.portalId) {
        error.portalId = 'Invalid portalId';
        validationFlag *= false;
    }

    var applicants = req.body.applicants;
    if (typeof (applicants) == 'string') {
        applicants = JSON.parse(applicants);
    }

    if (!applicants) {
        applicants = [];
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
                req.body.lastName = req.body.lastName ? req.body.lastName : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(applicants)),
                    req.st.db.escape(req.query.portalId)
                ];

                var procQuery = 'CALL wm_checkApplicantsFromPortal( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Applicants imported successfully";
                        response.error = null;
                        if (result[0][0].importerResults && typeof (result[0][0].importerResults) == 'string') {
                            result[0][0].importerResults = JSON.parse(result[0][0].importerResults);
                        }
                        response.data = result[0][0].importerResults ? result[0][0].importerResults : [];
                        res.status(200).json(response);
                    }
                    // else if (!err && result && result[0] && result[0][0] && result[0][0].newResume) {
                    //     response.status = true;
                    //     response.message =result[0][0].newResume;
                    //     response.error = null;
                    //     response.data =null;
                    //     res.status(200).json(response);
                    // }
                    else {
                        response.status = false;
                        response.message = "Something went wrong! Please try again";
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


paceUsersCtrl.deleteJobPortalUsers = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        error.heMasterId = "Invalid Company";
        validationFlag *= false;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(req.body.portalUserId || []))
                ];

                var procQuery = 'CALL wm_delete_jobportaluserIds( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    // console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Portal users deleted successfully";
                        response.error = null;
                        response.data = result[0][0];

                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while deleting portal user";
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


paceUsersCtrl.pacehcmTips = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        // req.st.validateToken(req.query.token, function (err, tokenResult) {
        //     if ((!err) && tokenResult) {
        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

        var inputs = [
            req.st.db.escape(req.query.currentDateTime)
        ];

        var procQuery = 'CALL wm_get_pacehcmTips( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            // console.log(result);
            if (!err && result && result[0] && result[0][0]) {
                response.status = true;
                response.message = "paceHCM tips loaded successfully";
                response.error = null;
                response.data = {
                    tipsArray: result[0] && result[0][0] ? result[0] : []
                }

                res.status(200).json(response);
            }
            else if (!err) {
                response.status = true;
                response.message = "No result found";
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }
            else {
                response.status = false;
                response.message = "Error while getting tips";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }
        });
        //     }
        //     else {
        //         res.status(401).json(response);
        //     }
        // });
    }
};


paceUsersCtrl.saveOrgChartBranches = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        validationFlag = false;
        error.heMasterId = "Invalid Company";
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    var branches = req.body.branches;
    if (typeof (branches) == "string") {
        branches = JSON.parse(branches);
    }
    if (!branches) {
        branches = [];
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(branches))
                ];

                var procQuery = 'CALL pace_save_orgchartBranches( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Organization branches saved successfully";
                        response.error = null;
                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].contactISD = result[0][i].contactISD ? JSON.parse(result[0][i].contactISD) : {};
                            result[0][i].currency = result[0][i].currency && JSON.parse(result[0][i].currency).currencyId ? JSON.parse(result[0][i].currency) : {};
                            result[0][i].duration = result[0][i].duration && JSON.parse(result[0][i].duration).durationId ? JSON.parse(result[0][i].duration) : {};
                            result[0][i].scale = result[0][i].scale && JSON.parse(result[0][i].scale).scaleId ? JSON.parse(result[0][i].scale) : {};
                        }

                        response.data = {
                            organizationBranches: result[0] && result[0][0] ? result[0] : []
                        }
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "Organization branches saved successfully";
                        response.error = null;
                        response.data = {
                            organizationBranches: []
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving organization branches";
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


paceUsersCtrl.saveOrgChartDepartments = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        validationFlag = false;
        error.heMasterId = "Invalid Company";
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    var departments = req.body.departments;
    if (typeof (departments) == "string") {
        departments = JSON.parse(departments);
    }
    if (!departments) {
        departments = [];
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(departments))
                ];

                var procQuery = 'CALL pace_save_departments( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Organization departments saved successfully";
                        response.error = null;
                        response.data = {
                            organizationDepartments: result[0] && result[0][0] ? result[0] : []
                        }
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "Organization departments saved successfully";
                        response.error = null;
                        response.data = {
                            organizationDepartments: []
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving organization departments";
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


paceUsersCtrl.saveOrgChartGrades = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        validationFlag = false;
        error.heMasterId = "Invalid Company";
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    var grades = req.body.grades;
    if (typeof (grades) == "string") {
        grades = JSON.parse(grades);
    }
    if (!grades) {
        grades = [];
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(grades))
                ];

                var procQuery = 'CALL pace_save_grade( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Organization grades saved successfully";
                        response.error = null;
                        response.data = {
                            organizationGrades: result[0] && result[0][0] ? result[0] : []
                        }
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "Organization grades saved successfully";
                        response.error = null;
                        response.data = {
                            organizationGrades: []
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving organization grades";
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


paceUsersCtrl.saveOrgChartJobtitles = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        validationFlag = false;
        error.heMasterId = "Invalid Company";
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    var jobTitles = req.body.jobTitles;
    if (jobTitles != "" && typeof (jobTitles) == "string") {
        jobTitles = JSON.parse(jobTitles);
    }
    if (!jobTitles) {
        jobTitles = [];
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(jobTitles))
                ];

                var procQuery = 'CALL pace_save_jobtitles( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Organization jobtitles saved successfully";
                        response.error = null;
                        response.data = {
                            organizationJobTitles: result[0] && result[0][0] ? result[0] : []
                        }
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "Organization jobtitles saved successfully";
                        response.error = null;
                        response.data = {
                            organizationJobTitles: []
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving organization jobtitles";
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

paceUsersCtrl.getOrgChartData = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.heMasterId) {
        validationFlag = false;
        error.heMasterId = "Invalid Company";
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL pace_get_orgChartDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && (result[0] || result[1] || result[2] || result[3])) {
                        response.status = true;
                        response.message = "Organization data loaded successfully";
                        response.error = null;

                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].contactISD = result[0][i].contactISD ? JSON.parse(result[0][i].contactISD) : {};
                            result[0][i].currency = result[0][i].currency && JSON.parse(result[0][i].currency).currencyId ? JSON.parse(result[0][i].currency) : {};
                            result[0][i].duration = result[0][i].duration && JSON.parse(result[0][i].duration).durationId ? JSON.parse(result[0][i].duration) : {};
                            result[0][i].scale = result[0][i].scale && JSON.parse(result[0][i].scale).scaleId ? JSON.parse(result[0][i].scale) : {};
                        }

                        response.data = {
                            organizationBranches: result[0] && result[0][0] ? result[0] : [],
                            organizationDepartments: result[1] && result[1][0] ? result[1] : [],
                            organizationGrades: result[2] && result[2][0] ? result[2] : [],
                            organizationJobTitles: result[3] && result[3][0] ? result[3] : []
                        }
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "Organization data loaded successfully";
                        response.error = null;
                        response.data = {
                            organizationBranches: [],
                            organizationDepartments: [],
                            organizationGrades: []
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while loaded organization data";
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


paceUsersCtrl.sendPasswordResetOTP = function (req, res, next) {

    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (!req.body.loginId) {
        error['loginId'] = 'loginId is mandatory';
        status *= false;
    }

    if (status) {
        try {
            var message = "";

            //generate otp 6 digit random number
            var code = "";
            var possible = "1234567890";

            for (var i = 0; i <= 3; i++) {

                code += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            var query = [
                req.st.db.escape(req.body.loginId),
                req.st.db.escape(code),
                req.st.db.escape(DBSecretKey)
            ];

            console.log('CALL pace_validatePaceuser(' + query + ')');
            req.st.db.query('CALL pace_validatePaceuser(' + query + ')', function (err, userResult) {

                console.log("error", err);

                if (!err && userResult && userResult[0] && userResult[0][0].userMasterId) {
                    // code = userResult[0][0].otp;

                    message = 'Your paceHCM password reset OTP is ' + code + ' .';

                    if (userResult[0][0].emailId) {
                        var file = path.join(__dirname, '../../../../mail/templates/passwordResetOTP.html');

                        fs.readFile(file, "utf8", function (err, data) {

                            if (!err) {
                                data = data.replace("[name]", userResult[0][0].displayName);
                                data = data.replace("[OTP]", code);

                                var mailOptions = {
                                    from: "noreply@talentmicro.com",
                                    to: userResult[0][0].emailId,
                                    subject: 'Password Reset Request',
                                    html: data // html body
                                };

                                var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                var email = new sendgrid.Email();
                                email.from = mailOptions.from;
                                email.to = mailOptions.to;
                                email.subject = mailOptions.subject;
                                email.html = mailOptions.html;

                                sendgrid.send(email, function (err, result) {
                                    if (!err) {
                                        console.log('message sent successfully');
                                    }
                                });
                            }
                        });
                    }

                    if (userResult[0][0].isd && userResult[0][0].mobile) {
                        if (userResult[0][0].isd == "+977") {
                            request({
                                url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                qs: {
                                    token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                    to: userResult[0][0].mobile,
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
                        else if (userResult[0][0].isd == "+91") {
                            request({
                                url: 'https://aikonsms.co.in/control/smsapi.php',
                                qs: {
                                    user_name: 'janardana@hirecraft.com',
                                    password: 'Ezeid2015',
                                    sender_id: 'WtMate',
                                    service: 'TRANS',
                                    mobile_no: userResult[0][0].mobile,
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
                                mobile: userResult[0][0].isd.replace("+", "") + userResult[0][0].mobile,
                                msg: message,
                                duplicateCheck: 'true',
                                format: 'json'
                            }));
                            req.end();


                        }
                        else if (userResult[0][0].isd != "") {
                            client.messages.create(
                                {
                                    body: message,
                                    to: userResult[0][0].isd + userResult[0][0].mobile,
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
                        }
                    }
                    respMsg.status = true;
                    respMsg.message = 'OTP Sent Successfully';
                    respMsg.data = null;
                    res.status(200).json(respMsg);

                }
                else if (!err && userResult && userResult[0] && userResult[0][0].messageError) {
                    respMsg.status = true;
                    respMsg.message = userResult[0][0].messageError;
                    respMsg.data = null;
                    res.status(200).json(respMsg);
                }
                else {
                    respMsg.status = false;
                    respMsg.message = 'Something went wrong';
                    res.status(500).json(respMsg);
                }
            });
        }
        catch (ex) {
            console.log('Error : FnSendOtp ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            respMsg.error = { server: 'Internal Server Error' };
            respMsg.message = 'An error occurred ! Please try again';
            res.status(400).json(respMsg);
        }
    }
    else {
        respMsg.error = error;
        respMsg.message = 'Please check all the errors';
        res.status(400).json(respMsg);
    }
};


paceUsersCtrl.passwordResetVerifyOtp = function (req, res, next) {
    console.log("inside otp");
    var response = {
        status: false,
        message: "Invalid otp",
        data: null,
        error: null
    };

    var otp = req.body.otp;
    var loginId = req.body.loginId;

    var validationFlag = true;
    if (!loginId) {
        error.loginId = "Invalid loginId";
        validationFlag = false;
    }

    if (!otp) {
        error.otp = "Please enter OTP";
        validationFlag = false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        var inputs = [
            req.st.db.escape(loginId),
            req.st.db.escape(otp),
            req.st.db.escape(DBSecretKey)
        ];

        var procQuery = 'CALL pace_passwordResetverifyOtp( ' + inputs.join(',') + ')';
        console.log(procQuery);

        req.db.query(procQuery, function (err, result) {
            console.log(err);
            console.log(result);
            if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                response.status = true;
                response.message = result[0][0].message;
                response.error = false;
                response.data = {
                    message: result[0][0].message
                };
                res.status(200).json(response);
            }

            else if (!err && result && result[0] && result[0][0] && result[0][0].messageError) {
                response.status = false;
                response.message = result[0][0].messageError;
                response.error = false;
                response.data = {
                    message: result[0][0].messageError
                };
                res.status(200).json(response);
            }
            else if (!err && result && result[0] && result[0][0] && result[0][0]._error) {
                response.status = false;
                response.message = result[0][0]._error;
                response.error = false;
                response.data = {
                    message: result[0][0]._error
                };
                res.status(200).json(response);
            }
            else {
                response.status = false;
                response.message = "Error while verifying OTP";
                response.error = true;
                response.data = null;
                res.status(500).json(response);
            }
        });
    }
};


paceUsersCtrl.paceresetPassword = function (req, res, next) {
    console.log("inside otp");
    var response = {
        status: false,
        message: "Invalid mobile number",
        data: null,
        error: null
    };

    var otp = req.body.otp;
    var loginId = req.body.loginId;
    var newPassword = req.body.newPassword;

    var validationFlag = true;
    if (!loginId) {
        error.loginId = "loginId is mandatory";
        validationFlag = false;
    }
    if (!otp) {
        error.otp = "otp is mandatory";
        validationFlag = false;
    }

    if (!newPassword) {
        error.newPassword = "Please enter New Password";
        validationFlag = false;
    }

    if (!req.body.otp) {
        error.otp = "Enter otp";
        validationFlag = false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        var encryptPwd = req.st.hashPassword(newPassword);
        console.log(encryptPwd);

        var inputs = [
            req.st.db.escape(loginId),
            req.st.db.escape(encryptPwd),
            req.st.db.escape(DBSecretKey),
            req.st.db.escape(otp)
        ];

        var procQuery = 'CALL pace_resetPassword( ' + inputs.join(',') + ')';
        console.log(procQuery);

        req.db.query(procQuery, function (err, result) {
            console.log(err);
            console.log(result);
            if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                response.status = true;
                response.message = result[0][0].message;
                response.error = false;
                response.data = {
                    message: result[0][0].message
                };
                res.status(200).json(response);
            }

            else if (!err && result && result[0] && result[0][0] && result[0][0].messageError) {
                response.status = false;
                response.message = result[0][0].messageError;
                response.error = false;
                response.data = {
                    message: result[0][0].messageError
                };
                res.status(200).json(response);
            }
            else if (!err && result && result[0] && result[0][0] && result[0][0]._error) {
                response.status = false;
                response.message = result[0][0]._error;
                response.error = false;
                response.data = {
                    message: result[0][0]._error
                };
                res.status(200).json(response);
            }
            else {
                response.status = false;
                response.message = "Error while updating password";
                response.error = true;
                response.data = null;
                res.status(500).json(response);
            }
        });
    }
};


paceUsersCtrl.sendApplicantInfoToPhone = function (req, res, next) {

    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (!req.query.token) {
        error['token'] = 'token is mandatory';
        status *= false;
    }
    var applicantInfo = req.body.applicantInfo || {};


    if (status) {
        try {
            var message = "";
            for (var i = 0; i < applicantInfo.length; i++) {
                if (i + 1 == applicantInfo.length)
                    message = message + applicantInfo.applicantName + ", " + applicantInfo.mobileNumber;
                else
                    message = message + applicantInfo.applicantName + ", " + applicantInfo.mobileNumber + ", ";
            }

            message = "Contact details: " + message + " --PaceHCM";

            var query = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.userMasterId || 0),
                req.st.db.escape(JSON.parse(req.body.applicantInfo || [])),
                req.st.db.escape(DBSecretKey)
            ];

            console.log('CALL pace_get_callApplicantMobile(' + query.join(',') + ')');
            req.st.db.query('CALL pace_get_callApplicantMobile(' + query.join(',') + ')', function (err, userResult) {

                console.log("error", err);

                if (!err && userResult && userResult[0] && userResult[0][0] && userResult[0][0].mobile) {

                    if (userResult[0][0].isd && userResult[0][0].mobile) {
                        if (userResult[0][0].isd == "+977") {
                            request({
                                url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                qs: {
                                    token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                    to: userResult[0][0].mobile,
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
                        else if (userResult[0][0].isd == "+91") {
                            request({
                                url: 'https://aikonsms.co.in/control/smsapi.php',
                                qs: {
                                    user_name: 'janardana@hirecraft.com',
                                    password: 'Ezeid2015',
                                    sender_id: 'WtMate',
                                    service: 'TRANS',
                                    mobile_no: userResult[0][0].mobile,
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
                                mobile: userResult[0][0].isd.replace("+", "") + userResult[0][0].mobile,
                                msg: message,
                                duplicateCheck: 'true',
                                format: 'json'
                            }));
                            req.end();


                        }
                        else if (userResult[0][0].isd != "") {
                            client.messages.create(
                                {
                                    body: message,
                                    to: userResult[0][0].isd + userResult[0][0].mobile,
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
                        }
                    }
                    respMsg.status = true;
                    respMsg.message = 'Contact details Sent Successfully';
                    respMsg.data = null;
                    res.status(200).json(respMsg);

                }
                // else if (!err && userResult && userResult[0] && userResult[0][0].messageError) {
                //     respMsg.status = true;
                //     respMsg.message = userResult[0][0].messageError;
                //     respMsg.data = null;
                //     res.status(200).json(respMsg);
                // }
                else {
                    respMsg.status = false;
                    respMsg.message = 'Something went wrong';
                    res.status(500).json(respMsg);
                }
            });
        }
        catch (ex) {
            console.log('Error : FnSendOtp ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            respMsg.error = { server: 'Internal Server Error' };
            respMsg.message = 'An error occurred ! Please try again';
            res.status(400).json(respMsg);
        }
    }
    else {
        respMsg.error = error;
        respMsg.message = 'Invalid token';
        res.status(401).json(respMsg);
    }
};


paceUsersCtrl.sendApplicantInfoAsNotification = function (req, res, next) {

    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (!req.query.token) {
        error['token'] = 'token is mandatory';
        status *= false;
    }
    var applicantInfo = req.body.applicantInfo || {};

    if (status) {
        try {
            var message = "";
            message = message + applicantInfo[0].applicantName + ", " + applicantInfo[0].mobileIsd + applicantInfo[0].mobileNumber ;
            message = "Contact details: " + message + " --PaceHCM";

            var query = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(JSON.stringify(req.body.applicantInfo || {})),                
                req.st.db.escape(message),
                req.st.db.escape(DBSecretKey)
            ];

            console.log('CALL pace_notifyApplicantInfo(' + query.join(',') + ')');
            req.st.db.query('CALL pace_notifyApplicantInfo(' + query.join(',') + ')', function (err, userResult) {

                console.log("error", err);

                if (!err && userResult && userResult[0] && userResult[0][0] && userResult[0][0].mobile) {

                    // if (userResult[0][0].isd && userResult[0][0].mobile) {
                    //     if (userResult[0][0].isd == "+977") {
                    //         request({
                    //             url: 'http://beta.thesmscentral.com/api/v3/sms?',
                    //             qs: {
                    //                 token: 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                    //                 to: userResult[0][0].mobile,
                    //                 message: message,
                    //                 sender: 'Techingen'
                    //             },
                    //             method: 'GET'

                    //         }, function (error, response, body) {
                    //             if (error) {
                    //                 console.log(error, "SMS");
                    //             }
                    //             else {
                    //                 console.log("SUCCESS", "SMS response");
                    //             }

                    //         });
                    //     }
                    //     else if (userResult[0][0].isd == "+91") {
                    //         request({
                    //             url: 'https://aikonsms.co.in/control/smsapi.php',
                    //             qs: {
                    //                 user_name: 'janardana@hirecraft.com',
                    //                 password: 'Ezeid2015',
                    //                 sender_id: 'WtMate',
                    //                 service: 'TRANS',
                    //                 mobile_no: userResult[0][0].mobile,
                    //                 message: message,
                    //                 method: 'send_sms'
                    //             },
                    //             method: 'GET'

                    //         }, function (error, response, body) {
                    //             if (error) {
                    //                 console.log(error, "SMS");
                    //             }
                    //             else {
                    //                 console.log("SUCCESS", "SMS response");
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
                    //             mobile: userResult[0][0].isd.replace("+", "") + userResult[0][0].mobile,
                    //             msg: message,
                    //             duplicateCheck: 'true',
                    //             format: 'json'
                    //         }));
                    //         req.end();


                    //     }
                    //     else if (userResult[0][0].isd != "") {
                    //         client.messages.create(
                    //             {
                    //                 body: message,
                    //                 to: userResult[0][0].isd + userResult[0][0].mobile,
                    //                 from: FromNumber
                    //             },
                    //             function (error, response) {
                    //                 if (error) {
                    //                     console.log(error, "SMS");
                    //                 }
                    //                 else {
                    //                     console.log("SUCCESS", "SMS response");
                    //                 }
                    //             }
                    //         );
                    //     }
                    // }
                    respMsg.status = true;
                    respMsg.message = 'Applicant details sent to whatmate.Please login into whatmate';
                    respMsg.data = null;
                    res.status(200).json(respMsg);

                }
                else if (!err && userResult && userResult[0] && userResult[0][0] && userResult[0][0].loggedInWhatmateUser) {

                    notifyMessages.getMessagesNeedToNotify();
                    respMsg.status = true;
                    respMsg.message = userResult[0][0].loggedInWhatmateUser;
                    respMsg.data = null;
                    res.status(200).json(respMsg);
                }
                else {
                    respMsg.status = false;
                    respMsg.message = 'Something went wrong';
                    res.status(500).json(respMsg);
                }
            });
        }
        catch (ex) {
            console.log('Error : FnSendOtp ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            respMsg.error = { server: 'Internal Server Error' };
            respMsg.message = 'An error occurred ! Please try again';
            res.status(400).json(respMsg);
        }
    }
    else {
        respMsg.error = error;
        respMsg.message = 'Invalid token';
        res.status(401).json(respMsg);
    }
};


module.exports = paceUsersCtrl;