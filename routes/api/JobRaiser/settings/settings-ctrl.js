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

var settingsCtrl = {};
var error = {};

settingsCtrl.getAccessrightsMaster = function (req, res, next) {
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

                req.query.userManager = req.query.userManager ? req.query.userManager : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.userManager)
                ];

                var procQuery = 'CALL wm_accessRightsmaster( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (req.query.userManager == 0) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "data loaded successfully";
                            response.error = null;
                            var output1 = [];
                            for (var j = 0; j < result[2].length; j++) {
                                var res3 = {};
                                res3.templateId = result[2][j].templateId;
                                res3.templateName = result[2][j].templateName;
                                res3.templateData = result[2][j].templateData ? JSON.parse(result[2][j].templateData) : [];
                                output1.push(res3);
                            }
                            response.data =
                                {
                                    formDetails: result[0],
                                    formRights: result[1],
                                    templateDetails: output1
                                };
                            res.status(200).json(response);
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No results found";
                            response.error = null;
                            response.data = {
                                formDetails: [],
                                formRights: [],
                                templateDetails: []

                            };
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while loading data";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    }
                    else if (req.query.userManager == 1) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "data loaded successfully";
                            response.error = null;
                            var output1 = [];
                            for (var j = 0; j < result[0].length; j++) {
                                var res3 = {};
                                res3.templateId = result[0][j].templateId;
                                res3.templateName = result[0][j].templateName;
                                res3.templateData = result[0][j].templateData ? JSON.parse(result[0][j].templateData) : [];
                                output1.push(res3);
                            }
                            response.data =
                                {

                                    templateDetails: output1
                                };
                            res.status(200).json(response);
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No results found";
                            response.error = null;
                            response.data = {

                                templateDetails: []

                            };
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while loading data";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


settingsCtrl.saveAccessrightsTemplate = function (req, res, next) {
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

    if (!req.body.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    var moduleRights = req.body.moduleRights;
    if (typeof (moduleRights) == "string") {
        moduleRights = JSON.parse(moduleRights);
    }
    if (!moduleRights) {
        moduleRights = [];
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

                req.body.templateId = req.body.templateId ? req.body.templateId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.templateId),
                    req.st.db.escape(req.body.templateName),
                    req.st.db.escape(JSON.stringify(moduleRights))

                ];

                var procQuery = 'CALL wm_save_accessrightsTemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = false;
                        response.message = "TemplateName already exist";
                        response.error = null;
                        response.data = result[0];
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "Template saved successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving Template";
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


module.exports = settingsCtrl;
