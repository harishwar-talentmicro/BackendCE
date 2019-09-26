var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var taskManagementCtrl = {};
var error = {};
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;



taskManagementCtrl.saveproject = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var inputs = [
                    db.escape(req.query.token),
                    db.escape(req.body.tid),
                    db.escape(req.query.heMasterid),
                    db.escape(req.body.title),
                    db.escape(req.body.description),
                    db.escape(JSON.stringify(req.body.attachments || [])),
                    db.escape(req.body.status),
                    db.escape(JSON.stringify(req.body.stages || []))


                ];

                var procQuery = 'call save_projects(' + inputs.join(',') + ')';
                console.log(procQuery);
                db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            projectList: result[0] && result[0][0] ? result[0] : []
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
                        response.message = "Something went wrong";
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


taskManagementCtrl.projectdetails = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var inputs = [
                    db.escape(req.query.token),
                    db.escape(req.query.heMasterid),
                    db.escape(req.query.keywords)
                ];

                var procQuery = 'call get_project_details(' + inputs.join(',') + ')';
                console.log(procQuery);
                db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(result);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            Project_Details: result[0] && result[0][0] ? result[0][0] : null
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
                        response.message = "Something went wrong";
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


taskManagementCtrl.getstage = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var inputs = [

                    db.escape(req.query.token),
                    db.escape(req.query.heMasterid)
                ];

                var procQuery = 'call get_stages(' + inputs.join(',') + ')';
                console.log(procQuery);
                db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(result);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            stageList: result[0] && result[0][0] ? result[0] : []
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
                        response.message = "Something went wrong";
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

module.exports = taskManagementCtrl;