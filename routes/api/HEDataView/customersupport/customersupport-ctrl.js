/**
 * Created by Jana1 on 01-09-2017.
 */
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var customerSupportCtrl = {};
var error = {};

customerSupportCtrl.getCustomerSupport = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid credentials",
        data: null,
        error: null
    };
    var validationFlag = true;

    // req.query.APIKey = req.query.APIKey ? req.query.APIKey : "";
    req.query.EZEOneId = req.query.EZEOneId ? req.query.EZEOneId : "";
    req.query.password = req.query.password ? req.query.password : "";
    req.query.token = req.query.token ? req.query.token : "";

    if (!req.query.APIKey) {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateHEToken(req.query.APIKey, req.query.EZEOneId, req.query.password, req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.status = req.query.status ? req.query.status : 0;
                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 100;

                var procParams = [
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL WhatMate_get_customerSupport( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, suppportList) {
                    if (!err && suppportList && suppportList[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        for (var i = 0; i < suppportList[0].length; i++) {
                            suppportList[0][i].assignedTo = suppportList[0][i] && suppportList[0][i].assignedTo && JSON.parse(suppportList[0][i].assignedTo) ? JSON.parse(suppportList[0][i].assignedTo) : [];
                        }

                        response.data = {
                            supportList: suppportList[0] ? suppportList[0] : [],
                            count: suppportList[1][0] && suppportList[1][0].count ? suppportList[1][0].count : 0
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = {
                            supportList: [],
                            count: 0
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting data list";
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


customerSupportCtrl.getCustomerFeedback = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid credentials",
        data: null,
        error: null
    };
    var validationFlag = true;

    // req.query.APIKey = req.query.APIKey ? req.query.APIKey : "";
    req.query.EZEOneId = req.query.EZEOneId ? req.query.EZEOneId : "";
    req.query.password = req.query.password ? req.query.password : "";
    req.query.token = req.query.token ? req.query.token : "";

    if (!req.query.APIKey) {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateHEToken(req.query.APIKey, req.query.EZEOneId, req.query.password, req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.status = req.query.status ? req.query.status : 0;
                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 100;

                var procParams = [
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid)
                ];

                var procQuery = 'CALL WhatMate_get_customerFeedback( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, feedbackList) {
                    if (!err && feedbackList && feedbackList[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            feedbackList: feedbackList[0],
                            count: feedbackList[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting data list";
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


module.exports = customerSupportCtrl;