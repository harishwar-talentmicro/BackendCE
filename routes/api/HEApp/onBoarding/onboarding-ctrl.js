
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var uuid = require('node-uuid');


var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;

var onboardingctrl = {};
var error = {};


onboardingctrl.onBoardingDynamicForm = function (req, res, next) {
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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),

                ];

                var procQuery = 'CALL wm_get_DynamicOnBoardingDetails( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0][0]) {

                        response.status = true;
                        response.message = "OnBoarding fields loaded successfully";
                        response.error = null;

                        var output = {};
                        for (var i = 0; i < results[7].length; i++) {
                            output[results[7][i].queryTitle] = results[7][i].queryTypeList ? JSON.parse(results[7][i].queryTypeList) : []
                        }

                        response.data = {
                            formId : results[0][0].formId,
                            totalScreenWidth: results[0][0].totalScreenWidth,
                            controlFields : (results[0] && results[0][0]) ? JSON.parse(results[0][0].dynamicFormFields).sectionList: [],

                            masterData:{
                                jobType : results[1] ? results[1] :[],
                                currency :results[2] ? results[2] :[],
                                scale : results[3] ? results[3] :[],
                                duration : results[4] ? results[4] :[],
                                designation : results[5] ? results[5] :[],
                                YesNo : results[6] ? results[6][0]:{},
                                sampleSegment :output
                            }
                        }
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data =null;

                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting data";
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
















module.exports = onboardingctrl;
