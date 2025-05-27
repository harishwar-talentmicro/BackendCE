/**
 * Created by Jana1 on 06-04-2017.
 */

var LoginCtrl = {};
var error = {};
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();


LoginCtrl.login = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid credentials",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.EZEOneId) {
        error.token = 'Invalid EZEOneId';
        validationFlag *= false;
    }
    if (!req.query.password) {
        error.token = 'Invalid password';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateHEToken(req.query.token, req.query.EZEOneId, req.query.password, function (err, tokenResult) {
        if ((!err) && tokenResult) {
            console.log(tokenResult[0].heUserId, "heuserId");

            var procParams = [
                req.st.db.escape(tokenResult[0].heUserId)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_formList( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, formList) {
                console.log(err);
                if (!err && formList && formList[0] && formList[0][0]) {
                    response.status = true;
                    response.message = "Form list loaded successfully";
                    response.error = null;
                    response.data = formList[0];
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "Error while getting formlist";
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
};

LoginCtrl.getHelloEZEUsers = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid credentials",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.EZEOneId) {
        error.token = 'Invalid EZEOneId';
        validationFlag *= false;
    }
    if (!req.query.password) {
        error.token = 'Invalid password';
        validationFlag *= false;
    }
    if (!req.query.userFormMapId) {
        error.userFormMapId = 'Invalid userFormMapId';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    req.st.validateHEToken(req.query.token, req.query.EZEOneId, req.query.password, function (err, tokenResult) {
        if ((!err) && tokenResult) {

            var procParams = [
                req.st.db.escape(req.query.userFormMapId),
                req.st.db.escape(DBSecretKey)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_accessUsersList( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, userList) {
                console.log(err);
                if (!err && userList && userList[0]) {
                    response.status = true;
                    response.message = "Access user list loaded successfully";
                    response.error = null;
                    response.data = userList[0];
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "Error while getting user list";
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
};

LoginCtrl.getFormStatus = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid credentials",
        data: null,
        error: null,
        filter: null
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
                var procParams = [
                    req.st.db.escape(req.query.formTypeId),
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey)
                ];

                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL WhatMate_get_StatusList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, taskList) {
                    console.log(err);
                    if (!err && taskList && taskList[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        if ((req.query.formTypeId) == '0000') {
                            for (var i = 0; i < taskList[0].length; i++) {
                                taskList[0][i].statusDetails = taskList[0][i].statusDetails ? JSON.parse(taskList[0][i].statusDetails) : '[]';
                            }

                            //     }
                        }
                        response.data = taskList[0];
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

LoginCtrl.getTasks = function (req, res, next) {
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
                req.query.companyMasterId = (req.query.companyMasterId) ? (req.query.companyMasterId) : 0;

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
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL WhatMate_get_taskList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, taskList) {
                    console.log(err);
                    if (!err && taskList && taskList[0]) {
                        response.status = true;
                        response.message = "Task list loaded successfully";
                        response.error = null;
                        response.data = {
                            taskList: taskList[0],
                            count: taskList[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Task list loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting task list";
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

LoginCtrl.getMeeting = function (req, res, next) {
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
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL WhatMate_get_MeetingList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, taskList) {
                    console.log(err);
                    if (!err && taskList && taskList[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            meetingList: taskList[0],
                            count: taskList[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Data loaded successfully";
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

LoginCtrl.getExpenseList = function (req, res, next) {
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
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL WhatMate_get_ExpenseClaim( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, expenseList) {
                    console.log(err);
                    if (!err && expenseList && expenseList[0]) {
                        // var output = [];
                        // for(var i = 0; i < expenseList[0].length; i++) {
                        //     var res1 = {};
                        //     res1.parentId = expenseList[0][i].parentId;
                        //     res1.title = expenseList[0][i].title;
                        //     res1.currencyId = expenseList[0][i].currencyId;
                        //     res1.currencyTitle = expenseList[0][i].currencyTitle;
                        //     res1.amount = expenseList[0][i].amount;
                        //     res1.createdDate = expenseList[0][i].createdDate;
                        //     res1.senderNotes = expenseList[0][i].senderNotes;
                        //     res1.approverNotes = expenseList[0][i].approvalNotes;
                        //     res1.amountSettled = expenseList[0][i].amountSettled;
                        //     res1.receiverNotes = expenseList[0][i].receiverNotes;
                        //     res1.status = expenseList[0][i].status;
                        //     res1.statusTitle = expenseList[0][i].statusTitle;
                        //     res1.senderName = expenseList[0][i].senderName;
                        //     res1.expenseCount = expenseList[0][i].expenseCount;
                        //     res1.transId = expenseList[0][i].transId;
                        //
                        //     // var expenseJSON = (expenseList[0][i].expenseList) ? JSON.parse(expenseList[0][i].expenseList) : "" ;
                        //     // var expenseOutput = [];
                        //     //
                        //     // for(var ii = 0; ii < expenseJSON.length; ii++) {
                        //     //     var expenseRes = {};
                        //     //     expenseRes.amount = expenseJSON[ii].amount;
                        //     //     expenseRes.expDate = expenseJSON[ii].expDate;
                        //     //     expenseRes.currencyId = expenseJSON[ii].currencyId;
                        //     //     expenseRes.particulars = expenseJSON[ii].particulars;
                        //     //     expenseRes.expenseTypeId = expenseJSON[ii].expenseTypeId;
                        //     //     expenseRes.currencySymbol = expenseJSON[ii].currencySymbol;
                        //     //     expenseRes.expenseTypeTitle = expenseJSON[ii].expenseTypeTitle;
                        //     //     expenseRes.attachment = (expenseJSON[ii].attachment) ? JSON.parse(expenseJSON[ii].attachment) : "" ;
                        //     //     expenseOutput.push(expenseRes)
                        //     // }
                        //     // res1.expenseList = expenseOutput;
                        //     output.push(res1);
                        // }
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            expenseList: expenseList[0],
                            count: expenseList[1][0].count
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

LoginCtrl.getExpenseDetails = function (req, res, next) {
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

                var procParams = [
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(req.query.transId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL WhatMate_get_ExpenseDetails( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, expenseList) {

                    if (!err && expenseList && expenseList[0]) {
                        var output = [];
                        var expenseJSON = (expenseList[0][0].expenses) ? JSON.parse(expenseList[0][0].expenses) : "";

                        for (var i = 0; i < expenseJSON.length; i++) {
                            var expenseRes = {};
                            console.log("expenseList[0][i].amount", expenseJSON[i].amount);
                            expenseRes.amount = expenseJSON[i].amount;
                            expenseRes.expDate = expenseJSON[i].expDate;
                            expenseRes.currencyId = expenseJSON[i].currencyId;
                            expenseRes.particulars = expenseJSON[i].particulars;
                            expenseRes.expenseTypeId = expenseJSON[i].expenseTypeId;
                            expenseRes.currencySymbol = expenseJSON[i].currencySymbol;
                            expenseRes.expenseTypeTitle = expenseJSON[i].expenseTypeTitle;
                            expenseRes.attachment = (expenseJSON[i].attachment) ? JSON.parse(expenseJSON[i].attachment) : "";
                            output.push(expenseRes);
                        }
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            expenseList: output
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Data loaded successfully";
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

LoginCtrl.getAttendanceRequestList = function (req, res, next) {
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

                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 100;

                var procParams = [
                    req.st.db.escape(req.query.status || 0),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(JSON.stringify(req.body.rmGroupId || [])),
                    req.st.db.escape(JSON.stringify(req.body.workLocationId || [])),
                    req.st.db.escape(req.body.exportALL || 0)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL WhatMate_get_AttendanceRequests( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, attendanceList) {
                    if (!err && attendanceList && attendanceList[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            attendanceList: attendanceList[0],
                            count: attendanceList[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Data loaded successfully";
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

LoginCtrl.getLeaveRegister = function (req, res, next) {
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

                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 100;

                var procParams = [
                    req.st.db.escape(req.query.status || 0),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(JSON.stringify(req.body.rmGroupId || [])),
                    req.st.db.escape(JSON.stringify(req.body.workLocationId || [])),
                    req.st.db.escape(req.body.exportALL || 0)

                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL WhatMate_get_leaves( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, leaveRegister) {
                    if (!err && leaveRegister && leaveRegister[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            leaveRegister: leaveRegister[0],
                            count: leaveRegister[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Data loaded successfully";
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

LoginCtrl.getTravelRequest = function (req, res, next) {
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
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL WhatMate_get_TravelRequest( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, travelRequest) {
                    if (!err && travelRequest && travelRequest[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            travelRequest: travelRequest[0],
                            count: travelRequest[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Data loaded successfully";
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

LoginCtrl.getTravelClaim = function (req, res, next) {
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

                req.query.status = req.query.status ? req.query.status : 1;
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
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.query.isExpenseClaim || 0)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL WhatMate_get_TravelClaim( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, travelClaim) {
                    console.log(err);
                    if (!err && travelClaim && travelClaim[0] && travelClaim[0][0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        for (var i = 0; i < travelClaim[0].length; i++) {
                            travelClaim[0][i].claimDetails = travelClaim[0][i] && travelClaim[0][i].claimDetails && JSON.parse(travelClaim[0][i].claimDetails) ? JSON.parse(travelClaim[0][i].claimDetails) : [];
                        }

                        response.data = {
                            travelClaim: travelClaim[0],
                            count: travelClaim[1][0].count
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            travelClaim: [],
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

LoginCtrl.getSalesMaster = function (req, res, next) {
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
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey)
                ];

                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL WhatMate_get_salesMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesMasterResult) {
                    if (!err && salesMasterResult && salesMasterResult[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            stageList: salesMasterResult[0],
                            probabilityList: JSON.parse(salesMasterResult[1][0].probabilityList)
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

LoginCtrl.getSalesList = function (req, res, next) {
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
    var stageList = req.query.stageList;
    if (typeof (stageList) == "string") {
        stageList = JSON.parse(stageList);
    }
    if (!stageList) {
        stageList = [];
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

                req.query.startDate = req.query.startDate ? req.query.startDate : null;
                req.query.probabilities = req.query.probabilities ? req.query.probabilities : "";
                req.query.endDate = req.query.endDate ? req.query.endDate : null;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 100;

                var procParams = [
                    req.st.db.escape(JSON.stringify(stageList)),
                    req.st.db.escape(req.query.startDate),
                    req.st.db.escape(req.query.endDate),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(req.query.probabilities),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL WhatMate_get_sales( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesList) {
                    console.log(err);
                    if (!err && salesList && salesList[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            salesList: salesList[0],
                            count: salesList[1][0].count
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

LoginCtrl.getAttendanceRegister = function (req, res, next) {
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
                req.query.gradeIds = (req.query.gradeIds) ? (req.query.gradeIds) : "";
                req.query.departmentIds = (req.query.departmentIds) ? (req.query.departmentIds) : "";
                req.query.workLocationIds = (req.query.workLocationIds) ? (req.query.workLocationIds) : "";

                var procParams = [
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.attendanceDate),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(req.query.gradeIds),
                    req.st.db.escape(req.query.departmentIds),
                    req.st.db.escape(req.query.workLocationIds),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.query.keywords || ""),
                    req.st.db.escape(req.query.exportAll || 0),
                    req.st.db.escape(JSON.stringify(req.body.rmGroupId || [])),
                    req.st.db.escape(JSON.stringify(req.body.workLocationId || [])),
                    req.st.db.escape(req.query.startDate || null),
                    req.st.db.escape(req.query.endDate || null)
                ];

                var procQuery = 'CALL WhatMate_get_attendanceRegister( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, attendanceRegister) {
                    console.log(err);
                    if (!err && attendanceRegister && attendanceRegister[0]) {
                        response.status = true;
                        response.message = "attendance register loaded successfully";
                        response.error = null;
                        response.data = {
                            attendanceRegister: attendanceRegister[0] ? attendanceRegister[0] : [],
                            count: attendanceRegister[1] && attendanceRegister[1][0] && attendanceRegister[1][0].count ? attendanceRegister[1][0].count : 0,
                            detailAttendance: attendanceRegister[2] ? attendanceRegister[2] : [],
                            detailAttendanceCount: attendanceRegister[3] && attendanceRegister[3][0] && attendanceRegister[3][0].count ? attendanceRegister[3][0].count : 0
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

LoginCtrl.getAttendanceRegisterDetails = function (req, res, next) {
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
    if (!req.query.HEUserId) {
        error.HEUserId = 'Invalid HEUserId';
        validationFlag *= false;
    }
    if (!req.query.day) {
        error.day = 'Invalid day';
        validationFlag *= false;
    }
    if (!req.query.month) {
        error.month = 'Invalid month';
        validationFlag *= false;
    }
    if (!req.query.year) {
        error.year = 'Invalid year';
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

                var procParams = [
                    req.st.db.escape(tokenResult[0].masterid),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.query.HEUserId),
                    req.st.db.escape(req.query.day),
                    req.st.db.escape(req.query.month),
                    req.st.db.escape(req.query.year)
                ];

                var procQuery = 'CALL WhatMate_get_attendanceRegister_Details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, attendanceRegister) {
                    console.log(err);
                    if (!err && attendanceRegister) {
                        response.status = true;
                        response.message = "attendance register loaded successfully";
                        response.error = null;
                        response.data = {
                            TITO: attendanceRegister[0] ? attendanceRegister[0] : [],
                            attendanceRequest: attendanceRegister[1] ? attendanceRegister[1] : [],
                            leaveRequest: attendanceRegister[2] ? attendanceRegister[2] : []
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

LoginCtrl.getStationaryList = function (req, res, next) {
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
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL whatmate_get_stationaryRequests( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, stationaryList) {
                    console.log(err);
                    if (!err && stationaryList && stationaryList[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            stationaryList: stationaryList[0],
                            count: stationaryList[1][0].count,
                            itemSummary: stationaryList[2]
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

LoginCtrl.getPantryList = function (req, res, next) {
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
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL whatmate_get_pantryRequests( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, pantryList) {
                    console.log(err);
                    if (!err && pantryList && pantryList[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            pantryList: pantryList[0],
                            count: pantryList[1][0].count,
                            itemSummary: pantryList[2]
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

LoginCtrl.getAssetList = function (req, res, next) {
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
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL whatmate_get_assetRequests( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, assetList) {
                    console.log(err);
                    if (!err && assetList && assetList[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            assetList: assetList[0],
                            count: assetList[1][0].count,
                            itemSummary: assetList[2]
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

LoginCtrl.getManpowerList = function (req, res, next) {
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
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL whatmate_get_manpower( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, manpowerList) {
                    console.log(err);
                    if (!err && manpowerList && manpowerList[0]) {

                        var output = [];
                        for (var i = 0; i < manpowerList[0].length; i++) {
                            var res1 = {};
                            res1.parentId = manpowerList[0][i].parentId;
                            res1.transId = manpowerList[0][i].transId;
                            res1.status = manpowerList[0][i].status;
                            res1.statusTitle = manpowerList[0][i].statusTitle;
                            res1.senderName = manpowerList[0][i].senderName;
                            res1.employeeCode = manpowerList[0][i].employeeCode;
                            res1.approver = manpowerList[0][i].approver;
                            res1.approverNotes = manpowerList[0][i].approverNotes;
                            res1.assessmentId = manpowerList[0][i].assessmentId;
                            res1.assessmentTitle = manpowerList[0][i].assessmentTitle;
                            res1.expFrom = manpowerList[0][i].expFrom;
                            res1.expTo = manpowerList[0][i].expTo;
                            res1.isAutoApproved = manpowerList[0][i].isAutoApproved;
                            res1.jobCode = manpowerList[0][i].jobCode;
                            res1.jobDescription = manpowerList[0][i].jobDescription;
                            res1.jobTitle = manpowerList[0][i].jobTitle;
                            res1.keySkills = manpowerList[0][i].keySkills;
                            res1.positions = manpowerList[0][i].positions;
                            res1.positionsFilled = manpowerList[0][i].positionsFilled;
                            res1.receiverNotes = manpowerList[0][i].receiverNotes;
                            res1.senderNotes = manpowerList[0][i].senderNotes;
                            res1.assessmentDetails = manpowerList[0][i].assessmentDetails ? JSON.parse(manpowerList[0][i].assessmentDetails) : [];
                            res1.attachments = manpowerList[0][i].attachments ? JSON.parse(manpowerList[0][i].attachments) : [];
                            res1.CVCount = manpowerList[0][i].CVCount;
                            res1.shortlsited = manpowerList[0][i].shortlsited;
                            res1.interview = manpowerList[0][i].interview;
                            res1.offer = manpowerList[0][i].offer;
                            res1.joined = manpowerList[0][i].joined;
                            res1.quit = manpowerList[0][i].quit;
                            res1.requestedDate = manpowerList[0][i].requestedDate;
                            res1.closedDate = manpowerList[0][i].closedDate;
                            output.push(res1);
                        }

                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            manpowerList: output,
                            count: manpowerList[1][0].count
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

LoginCtrl.getReferredCVs = function (req, res, next) {
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

                var procQuery = 'CALL whatmate_get_cvReferal( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, CVList) {
                    if (!err && CVList && CVList[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            CVList: CVList[0],
                            count: CVList[1][0].count
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

LoginCtrl.getInterviewScheduler = function (req, res, next) {
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

                var procQuery = 'CALL whatmate_get_InterviewSchedule( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, interviewScheduledList) {
                    if (!err && interviewScheduledList && interviewScheduledList[0]) {
                        var output = [];
                        for (var i = 0; i < interviewScheduledList[0].length; i++) {
                            var res1 = {};
                            res1.parentId = interviewScheduledList[0][i].parentId;
                            res1.transId = interviewScheduledList[0][i].transId;
                            res1.status = interviewScheduledList[0][i].status;
                            res1.statusTitle = interviewScheduledList[0][i].statusTitle;
                            res1.senderName = interviewScheduledList[0][i].senderName;
                            res1.employeeCode = interviewScheduledList[0][i].employeeCode;
                            res1.approver = interviewScheduledList[0][i].approver;
                            res1.attachments = interviewScheduledList[0][i].attachments ? JSON.parse(interviewScheduledList[0][i].attachments) : [];
                            res1.assessment = interviewScheduledList[0][i].assessment ? JSON.parse(interviewScheduledList[0][i].assessment) : [];
                            res1.approverNotes = interviewScheduledList[0][i].approverNotes;
                            res1.interviewDate = interviewScheduledList[0][i].interviewDate;
                            res1.isAutoApproved = interviewScheduledList[0][i].isAutoApproved;
                            res1.jobTitleId = interviewScheduledList[0][i].jobTitleId;
                            res1.jobTitle = interviewScheduledList[0][i].jobTitle;
                            res1.maxRating = interviewScheduledList[0][i].maxRating;
                            res1.name = interviewScheduledList[0][i].name;
                            res1.overallRating = interviewScheduledList[0][i].overallRating;
                            res1.receiverNotes = interviewScheduledList[0][i].receiverNotes;
                            res1.senderNotes = interviewScheduledList[0][i].senderNotes;
                            res1.stageId = interviewScheduledList[0][i].stageId;
                            res1.stageTitle = interviewScheduledList[0][i].stageTitle;
                            res1.panels = interviewScheduledList[0][i].panels;
                            res1.jobCode = interviewScheduledList[0][i].jobCode;
                            output.push(res1);
                        }

                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            interviewScheduledList: output,
                            count: interviewScheduledList[1][0].count
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

LoginCtrl.getDocumentRequestList = function (req, res, next) {
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

                var procQuery = 'CALL whatmate_get_DocumentsRequested( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, DocumentsRequestList) {
                    if (!err && DocumentsRequestList && DocumentsRequestList[0]) {
                        var output = [];
                        for (var i = 0; i < DocumentsRequestList[0].length; i++) {
                            var res1 = {};
                            res1.parentId = DocumentsRequestList[0][i].parentId;
                            res1.transId = DocumentsRequestList[0][i].transId;
                            res1.status = DocumentsRequestList[0][i].status;
                            res1.statusTitle = DocumentsRequestList[0][i].statusTitle;
                            res1.senderName = DocumentsRequestList[0][i].senderName;
                            res1.employeeCode = DocumentsRequestList[0][i].employeeCode;
                            res1.approver = DocumentsRequestList[0][i].approver;
                            res1.attachments = DocumentsRequestList[0][i].attachments ? JSON.parse(interviewScheduledList[0][i].attachments) : [];
                            res1.approverNotes = DocumentsRequestList[0][i].approverNotes;
                            res1.docPriority = DocumentsRequestList[0][i].docPriority;
                            res1.docRequiredDate = DocumentsRequestList[0][i].docRequiredDate;
                            res1.docTypeId = DocumentsRequestList[0][i].docTypeId;
                            res1.isAutoApproved = DocumentsRequestList[0][i].isAutoApproved;
                            res1.receiverNotes = DocumentsRequestList[0][i].receiverNotes;
                            res1.senderNotes = DocumentsRequestList[0][i].senderNotes;
                            res1.docTypeTitle = DocumentsRequestList[0][i].docTypeTitle;
                            output.push(res1);
                        }

                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            documentsRequestList: output,
                            count: DocumentsRequestList[1][0].count
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


LoginCtrl.getClaimDetails = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.transId) {
        error.transId = 'Invalid transId';
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
                    req.st.db.escape(req.query.parentId || 0),
                    req.st.db.escape(req.query.transId),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL whatmate_get_claimDetails( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].attachments = result[0][i] && result[0][i].attachments ? JSON.parse(result[0][i].attachments) : [];
                            if (!result[0][i].attachments[0].CDNPath || result[0][i].attachments[0].CDNPath == null) {
                                result[0][i].attachments = [];
                            }

                            result[0][i].attachmentList = result[0][i] && result[0][i].attachmentList ? JSON.parse(result[0][i].attachmentList) : [];
                            if (!result[0][i].attachmentList[0].CDNPath || result[0][i].attachmentList[0].CDNPath == null) {
                                result[0][i].attachmentList = [];
                            }
                        }

                        response.data = {
                            claimDetails: result[0] && result[0][0] ? result[0] : [],
                            enableRefNumber: result[1][0] ? result[1][0].enableRefNumber : 0
                        }

                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        // });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = {
                            claimDetails: []
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
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


LoginCtrl.updateExpenseClaimTransactionData = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey) {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    if (!req.body.parentId) {
        error.parentId = 'Invalid parentId';
        validationFlag *= false;
    }

    if (!req.body.transId) {
        error.transId = 'Invalid transId';
        validationFlag *= false;
    }

    if (!req.body.status) {
        error.status = 'Invalid status';
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
                console.log(req.body);

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.transId),
                    req.st.db.escape(JSON.stringify(req.body.expenseList || [])),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.notes || ""),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.body.referenceNumber || "")
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL whatmate_update_claimTransactionData( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data updated successfully";
                        response.error = null;

                        for (var i = 0; i < result[1].length; i++) {
                            result[1][i].attachments = result[1][i] && result[1][i].attachments ? JSON.parse(result[1][i].attachments) : [];
                            if (!result[1][i].attachments[0].CDNPath || result[1][i].attachments[0].CDNPath == null) {
                                result[1][i].attachments = [];
                            }
                        }

                        notifyMessages.getMessagesNeedToNotify();


                        response.data = {
                            details: result[0] && result[0][0] ? result[0][0] : null
                        }
                        response.data.expenseList = result[1] && result[1][0] ? result[1] : []
                        enableRefNumber: result[2][0] ? result[2][0].enableRefNumber : 0
                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        // });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = {
                            details: []
                        };
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


LoginCtrl.saveExpenseTypes = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    // if (!req.query.APIKey) {
    //     error.APIKey = 'Invalid APIKey';
    //     validationFlag *= false;
    // }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                console.log(req.body);

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.typeTitle),
                    req.st.db.escape(req.body.GLCode || ""),
                    req.st.db.escape(req.body.expenseTypeId || 0),
                    req.st.db.escape(req.body.minAmount || 0),
                    req.st.db.escape(req.body.maxAmount || 0),
                    req.st.db.escape(req.body.enableExpConveyance || 0),
                    req.st.db.escape(req.body.enableExpVault || 0),
                    req.st.db.escape(req.body.enableRefNumber || 0),
                    req.st.db.escape(req.body.enableExpTime || 0),
                    req.st.db.escape(req.body.expenseDefaultSelection || 0)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_save_mheexpensetypes( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data saved successfully";
                        response.error = null;

                        response.data = {
                            expenseTypeList: result[0] && result[0][0] ? result[0] : [],
                            configData: result[1][0]
                        }

                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        // });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = {
                            expenseTypeList: []
                        };
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


LoginCtrl.getExpenseTypes = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    // if (!req.query.APIKey) {
    //     error.APIKey = 'Invalid APIKey';
    //     validationFlag *= false;
    // }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                // console.log(req.body);

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_expenseTypesList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            expenseTypeList: result[0] && result[0][0] ? result[0] : [],
                            configData: result[1][0]
                        }

                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        // });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = {
                            expenseTypeList: []
                        };
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

module.exports = LoginCtrl;