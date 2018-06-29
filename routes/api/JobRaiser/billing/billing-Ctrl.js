var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var bodyParser = require('body-parser');

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var billingCtrl = {};
var error = {};


billingCtrl.billingFilter = function (req, res, next) {
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

    var billStage = req.body.billStage;
    if (typeof (billStage) == "string") {
        billStage = JSON.parse(billStage);
    }
    if (!billStage) {
        billStage = [];
    }

    var billStatus = req.body.billStatus;
    if (typeof (billStatus) == "string") {
        billStatus = JSON.parse(billStatus);
    }
    if (!billStatus) {
        billStatus = [];
    }

    var billBranch = req.body.billBranch;
    if (typeof (billBranch) == "string") {
        billBranch = JSON.parse(billBranch);
    }
    if (!billBranch) {
        billBranch = [];
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
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
                    req.st.db.escape(JSON.stringify(billStage)),
                    req.st.db.escape(JSON.stringify(billStatus)),
                    req.st.db.escape(JSON.stringify(billBranch)),
                    req.st.db.escape(req.body.heDepartmentId)                   
                ];
                var procQuery = 'CALL wm_get_pacebillingFilter( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0][0]) {
                        response.status = true;
                        response.message = "Billing Data loaded sucessfully";
                        response.error = null;
                        response.data = {
                            billingData : (result[0] && result[0][0]) ? result[0] :[]
                        };
                        res.status(200).json(response);
                    }
                   
                    else {
                        response.status = false;
                        response.message = "Error while loading billing data";
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

module.exports = billingCtrl;