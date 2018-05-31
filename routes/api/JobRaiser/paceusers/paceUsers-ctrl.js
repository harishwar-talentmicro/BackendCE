
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('https');
var request = require('request');
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var paceUsersCtrl = {};
var error = {};

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
                        response.status = true;
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
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Users loaded successfully";
                        response.error = false;
                        if (result[1].length > 0) {
                            result[1][0].jobTitle = result[1][0].jobTitle ? JSON.parse(result[1][0].jobTitle) : {};
                            result[1][0].userType = result[1][0].userType ? JSON.parse(result[1][0].userType) : {};
                            result[1][0].transferredTo = result[1][0].transferredTo ? JSON.parse(result[1][0].transferredTo) : {};
                            result[1][0].reportingTo = result[1][0].reportingTo ? JSON.parse(result[1][0].reportingTo) : [];
                            result[1][0].accessRights = result[1][0].accessRights ? JSON.parse(result[1][0].accessRights) : {};
                        }
                        response.data = {
                            userList: result[0] ? result[0] : [],
                            userDetail: result[1][0] ? result[1][0] : {}
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
                req.body.priority = req.body.priority ? req.body.priority : 1;
                req.body.taskDateTime = req.body.taskDateTime ? req.body.taskDateTime : null;
                req.body.taskEndDate = req.body.taskEndDate ? req.body.taskEndDate : null;
                req.body.status = req.body.status ? req.body.status : 0;

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
                    req.st.db.escape(req.body.status)

                ];

                var procQuery = 'CALL wm_save_pacePlanner( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(result);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Task saved successfully";
                        response.error = null;
                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].anchor = result[0][i].anchor ? JSON.parse(result[0][i].anchor) : {};
                            result[0][i].venue = result[0][i].venue ? JSON.parse(result[0][i].venue) : {};
                        }
                        response.data = result[0];
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
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_pacePlanner( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Tasks loaded successfully";
                        response.error = null;
                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].anchor = result[0][i].anchor ? JSON.parse(result[0][i].anchor) : {};
                            result[0][i].venue = result[0][i].venue ? JSON.parse(result[0][i].venue) : {};
                        }
                        response.data =
                            {
                                tasks: result[0]
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
        error.userMasterId = "Invalid Company";
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
                    req.st.db.escape(req.query.type)
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


                        response.data =
                            {
                                requirementStatus: result[0][0].requirementStatus ? JSON.parse(result[0][0].requirementStatus) : {},
                                stages: output
                            };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            requirementStatus: {},
                            stages: []
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
                    console.log(result);
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
                        buf=new Buffer(buf).toString("base64");
                        response.data=buf;
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

module.exports = paceUsersCtrl;