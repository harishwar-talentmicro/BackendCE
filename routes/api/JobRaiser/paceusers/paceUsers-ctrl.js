var notification = null;
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
                    req.st.db.escape(req.query.ezeoneId)
                ];

                var procQuery = 'CALL wm_validate_paceUserId( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "user check completed successfully";
                        response.error = null;
                        response.data = result[0];


                        res.status(200).json(response);


                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "no results found";
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
                        response.message = "no results found";
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

    if(!req.query.heMasterId){
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

                var procQuery = 'CALL wm_get_pace_users( ' + inputs.join(',') + ')';

                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(result);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Users loaded successfully";
                        response.error = false;
                        response.data = result[0];
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Some error occurred";
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

module.exports = paceUsersCtrl;