var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var textract = require('textract');
var http = require('https');
var defer = require('q');  // for handling promise
var bodyParser = require('body-parser');
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var applicantCtrl = {};
var error = {};
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var gulfCtrl = {};
var error = {};

gulfCtrl.saveMedical = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag = false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag = false;
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
                req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;
                req.query.medicalId = (req.query.medicalId) ? req.query.medicalId : 0;
                req.query.currencyId = (req.query.currencyId) ? req.query.currencyId : 1;
                req.query.scaleId = (req.query.scaleId) ? req.query.scaleId : 1;
                req.query.tokenNumber = (req.query.tokenNumber) ? req.query.tokenNumber : 0;
                req.query.medicalNotes = (req.query.medicalNotes) ? req.query.medicalNotes : "";
                req.query.notes = (req.query.notes) ? req.query.notes : "";
                // req.body.jobTitleId = (req.body.jobTitleId) ? req.body.jobTitleId : [];
                // req.body.stageId = (req.body.stageId) ? req.body.stageId : [];
                // req.body.statusId = (req.body.statusId) ? req.body.statusId : 0;
                
                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.reqAppId),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(req.body.applicantId),
                    req.st.db.escape(req.body.billTo),
                    req.st.db.escape(req.body.amount),
                    req.st.db.escape(req.body.currencyId),
                    req.st.db.escape(req.body.scaleId),
                    req.st.db.escape(req.body.receivedDate),
                    req.st.db.escape(req.body.sentDate),
                    req.st.db.escape(req.body.date),
                    req.st.db.escape(req.body.tokenNumber),
                    req.st.db.escape(req.body.MOFANumber),
                    req.st.db.escape(req.body.medicalStatus),
                    req.st.db.escape(req.body.medicalNotes),

                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.reMedical)
                    
                ];

                var procQuery = 'CALL wm_save_1010_medical( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    console.log(err);
                    if (!err && Result) {
                        response.status = true;
                        response.message = "Medicaldata saved successfully";
                        response.error = null;
                        response.data = {
                           
                            medicalId: Result[0][0].medicalId
                        };
                        res.status(200).json(response);
                    }
                    
                    else {
                        response.status = false;
                        response.message = "Error while saving Medicaldata";
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



gulfCtrl.getMedical = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag = false;
    }
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag = false;
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
            
                
                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.reqAppId)
                   
                    
                ];

                var procQuery = 'CALL wm_save_1010_medical( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    console.log(err);
                    if (!err && Result) {
                        response.status = true;
                        response.message = "Medicaldata loaded successfully";
                        response.error = null;
                        response.data = {
                           
                            medicalDetails: Result[0][0]
                        };
                        res.status(200).json(response);
                    }
                    
                    else {
                        response.status = false;
                        response.message = "Error while loading Medicaldata";
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

module.exports = gulfCtrl;