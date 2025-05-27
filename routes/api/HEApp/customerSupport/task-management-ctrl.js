var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var http = require('http');
var path = require('path');
var request = require('request');

var taskManagementCtrl = {};
var error = {};
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;

const accountSid = 'AC3765f2ec587b6b5b893566f1393a00f4';  //'ACcf64b25bcacbac0b6f77b28770852ec9';//'AC3765f2ec587b6b5b893566f1393a00f4';
const authToken = 'b36eba6376b5939cebe146f06d33ec57';   //'3abf04f536ede7f6964919936a35e614';  //'b36eba6376b5939cebe146f06d33ec57';//
const FromNumber = appConfig.DB.FromNumber || '+18647547021';
const client = require('twilio')(accountSid, authToken);

var FCM = require('fcm-node');
var serverKey = 'AAAAq8ESmns:APA91bHzHuE3gXnePqkoAHQ_zF1uzOHuQFqizdd7SSnrGVvXPwQsFUUWo606ptOimEbmmLDVvspc40qrE_jV5Fjii0DPhmlx5uTilQnORhblYA1jtflDJtQxYLzUonNaOCw8KkVbauR1';
var fcm = new FCM(serverKey);

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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterid),
                    req.st.db.escape(JSON.stringify(req.body))
                ];

                var procQuery = 'call save_projects(' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
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
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterid),
                    req.st.db.escape(req.query.keywords || ""),
                    req.st.db.escape(req.query.projectId || 0)
                ];

                var procQuery = 'call get_project_details(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);


                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    else if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            Project_Details: result[0]
                        }
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterid),
                    req.st.db.escape(req.query.stageId || 0)
                ];

                var procQuery = 'call get_stages(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);


                    if (!err && result && result[0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {

                            stageList: result[0] && result[0][0] ? result[0] : [],

                            stagestatus: result[1] && result[1][0].stageStatus ? result[1] && result[1][0].stageStatus : []
                        }

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


taskManagementCtrl.saveticketforcustomers = function (req, res, next) {
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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(req.body)),
                    req.st.db.escape(DBSecretKey)

                ];

                var procQuery = 'call wm_save_ticketsforcustomers(' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            ticketforcustomers: result[0] && result[0][0] ? result[0] : []



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


taskManagementCtrl.getticketsforcustomers = function (req, res, next) {
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
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.ticketId || 0),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'call wm_get_ticketsforcustomers(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            ticketcustomer_details: result[0]
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

taskManagementCtrl.checkezeid = function (req, res, next) {
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
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.ezeid)
                ];

                var procQuery = 'call wm_check_ezeid_unique(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(result);
                    if (!err && result) {

                        if (result[1][0].status == "true")
                            response.status = true;
                        else
                            response.status = false;

                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;


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

taskManagementCtrl.customermanager = function (req, res, next) {
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


                var encryptPwd = req.st.hashPassword(req.body.password);
                req.body.isWhatMate = req.body.isWhatMate ? req.body.isWhatMate : 0;
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(req.body)),
                    req.st.db.escape(encryptPwd),
                    req.st.db.escape(DBSecretKey)

                ];

                var procQuery = 'call wm_save_customermanager(' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    else if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            companymanager: result[0]
                        }
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


taskManagementCtrl.getcustomermanager = function (req, res, next) {
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
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId || 0),
                    req.st.db.escape(req.query.startPage || 0),
                    req.st.db.escape(req.query.limit || 0)
                ];

                var procQuery = 'call get_customermanager(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            customermanager_details: result[0]
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

taskManagementCtrl.getcompanycustomer = function (req, res, next) {
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
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.iscustomer || 0),
                ];

                var procQuery = 'call wm_get_companycustomer(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            companycustomer_list: result[0],
                            accessRights: result[1]
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

taskManagementCtrl.saveticket = function (req, res, next) {
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
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(req.body))
                ];

                var procQuery = 'call wm_savetickets(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            save_ticket: result[0]
                        }


                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(JSON.stringify(result[1]))
                        ];

                        var procQuery = 'call pm_notifier_data(' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            console.log(err);
                            if (!err && result) {
                                response.status = true;
                                response.message = "Data loaded successfully";
                                response.error = null;

                                response.data = {
                                    save_ticket: result[0]
                                }

                                var procQuery = 'call pm_notifier_data(' + inputs.join(',') + ')';
                                console.log(procQuery);
                                req.db.query(procQuery, function (err, result) {
                                    console.log(err);
                                    if (!err && result) {
                                        response.status = true;
                                        response.message = "Data loaded successfully";
                                        response.error = null;

                                        response.data = {
                                            save_ticket: result[0]
                                        }

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
        });
    }
};


taskManagementCtrl.getticket = function (req, res, next) {
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.ticketId || 0),
                    req.st.db.escape(DBSecretKey)



                ];

                var procQuery = 'call wm_get_tickets(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;


                        response.data = {
                            ticket: result[0]
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

taskManagementCtrl.gettask = function (req, res, next) {
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.taskId || 0),
                    req.st.db.escape(DBSecretKey)



                ];

                var procQuery = 'call wm_get_task(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;


                        response.data = {
                            task: result[0]
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

taskManagementCtrl.savetask = function (req, res, next) {
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
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.ticket_parentId || 0),
                    req.st.db.escape(JSON.stringify(req.body.task))

                ];

                var procQuery = 'call wm_savetasks(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            save_ticket: result[0]



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
taskManagementCtrl.saveStagestatus = function (req, res, next) {
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
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(req.body))
                ];

                var procQuery = 'call wm_save_stage_status(' + inputs.join(',') + ')';
                req.db.query(procQuery, function (err, result) {
                    console.log(err);


                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data saved successfully";
                        response.error = null;
                        response.data = {

                            heMasterId: result[0][0].heMasterId ? result[0][0].heMasterId : [],
                            stage: result[1] ? result[1] : []
                        }

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
taskManagementCtrl.getStagestatus = function (req, res, next) {
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterid)
                ];

                var procQuery = 'call wm_get_stage_status(' + inputs.join(',') + ')';
                req.db.query(procQuery, function (err, result) {
                    console.log(err);


                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {

                            heMasterId: result[0][0].heMasterId ? result[0][0].heMasterId : [],
                            stage: result[1]
                        }
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
taskManagementCtrl.savetaskstatus = function (req, res, next) {
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
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.taskId),
                    req.st.db.escape(req.body.newStagestatusId),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'call wm_save_taskstatuslog(' + inputs.join(',') + ')';
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    try {
                        if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                            response.status = true;
                            response.message = result[0][0].message;
                            response.error = null;
                            response.data = null;

                            res.status(result[0][0].statusCode).json(response);

                        }
                        else if (!err && result && result[0]) {
                            response.status = true;
                            response.message = "data saved successfully";
                            response.error = null;
                            response.data = {

                                taskStatus: result[0] ? result[0] : [],

                            };
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Something went wrong";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    }
                    catch (ex) {
                        console.log(ex);
                        response.error = ex;
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

taskManagementCtrl.gettaskstatus = function (req, res, next) {
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.taskId)
                ];

                var procQuery = 'call wm_get_taskstatuslog(' + inputs.join(',') + ')';
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data =
                            res.status(result[0][0].statusCode).json(response);
                    }

                    else if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {

                            taskStatus: result[0] ? result[0] : [],

                        };
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

taskManagementCtrl.getTickettask = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
        data: null,
        error: null
    };
    var projectId = req.body.projectId ? req.body.projectId : [];
    var priority = req.body.priority ? req.body.priority : [];
    var stagestatus = req.body.stagestatus ? req.body.stagestatus : [];
    var start_date = req.body.start_date ? req.body.start_date : null;
    var end_date = req.body.end_date ? req.body.end_date : null;
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(JSON.stringify(projectId)),
                    req.st.db.escape(JSON.stringify(priority)),
                    req.st.db.escape(JSON.stringify(stagestatus)),
                    req.st.db.escape(start_date),
                    req.st.db.escape(end_date),
                    req.st.db.escape(req.query.startPage || 0),
                    req.st.db.escape(req.query.limit || 0)
                ];

                var procQuery = 'call wm_get_alltickets(' + inputs.join(',') + ')';
                console.log(procQuery)
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            ticket_list: result[0],
                            task_list: result[1]
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
taskManagementCtrl.saveTicketconfig = function (req, res, next) {
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
            console.log(err);
            if ((!err) && tokenResult) {

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(req.body))
                ];

                var procQuery = 'call wm_save_ticket_config(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    else if (!err && result) {
                        response.status = true;
                        response.message = "Data saved successfully";
                        response.error = null;

                        response.data = {
                            ticket_details: result[0][0]
                        }
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
taskManagementCtrl.getTicketconfig = function (req, res, next) {
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterid)
                ];

                var procQuery = 'call wm_get_ticket_config(' + inputs.join(',') + ')';

                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;


                        response.data = {
                            ticket_details: result[0]
                        }
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
taskManagementCtrl.saveReasonconfig = function (req, res, next) {
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
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(req.body))
                ];

                var procQuery = 'call wm_save_reason_config(' + inputs.join(',') + ')';
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    else if (!err && result) {
                        response.status = true;
                        response.message = "Data saved successfully";
                        response.error = null;
                        response.data = {
                            heMasterId: result[0][0].heMasterId ? result[0][0].heMasterId : [],
                            reason_details: result[1] ? result[1] : []
                        }
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
taskManagementCtrl.getReasonconfig = function (req, res, next) {
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterid)
                ];

                var procQuery = 'call wm_get_reason_config(' + inputs.join(',') + ')';
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;


                        response.data = {
                            heMasterId: result[0][0].heMasterId ? result[0][0].heMasterId : [],
                            reason_details: result[1]
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

taskManagementCtrl.ticketmaster = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
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
        response.message = 'Please check the error';
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

                var procQuery = 'call pm_get_ticketmaster(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    else if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            customers: result[0] && result[0][0] ? result[0] : [],
                            projects: result[1][0].projects,
                            priority: result[2] ? result[2] : [],
                            ticketstatus: result[3] ? result[3] : [],
                            reasons: result[4] ? result[4] : [],
                            stagestatus: result[5] ? result[5] : [],
                            taskTypes: result[6] ? result[6] : [],
                            ticketTypes: result[7] ? result[7] : [],
                            userList: result[8] ? result[8] : [],
                            stageList: result[9] ? result[9] : [],
                            managerList: result[10] ? result[10] : [],
                            statusList: result[11] ? result[11] : [],//projectStageStatusList
                            stageStatusList: result[12] ? result[12] : [],//taskstagestatuslist
                            Isd: result[13] ? result[13] : [],
                            customerUser: result[14] ? result[14] : [],
                            projectstages: result[15] ? result[15] : [],
                            ticketstatus: result[16] ? result[16] : []
                        }
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

taskManagementCtrl.saveprojectStagestatus = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var inputs = [

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(req.body))
                ];

                var procQuery = 'call wm_save_project_stage_status(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);


                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data saved successfully";
                        response.error = null;

                        response.data = {
                            heMasterId: result[0][0].heMasterId ? result[0][0].heMasterId : [],
                            projectStagestatus: result[1] ? result[1] : []
                        }
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

taskManagementCtrl.getprojectStagestatus = function (req, res, next) {
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'call wm_get_project_stage_status(' + inputs.join(',') + ')';

                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;


                        response.data = {
                            heMasterId: result[0][0].heMasterId ? result[0][0].heMasterId : [],
                            project_stage_status: result[1] ? result[1] : []
                        }
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

taskManagementCtrl.saveticketStatus = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var inputs = [

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(req.body))
                ];

                var procQuery = 'call wm_save_ticket_status(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);


                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data saved successfully";
                        response.error = null;

                        response.data = {
                            heMasterId: result[0][0].heMasterId ? result[0][0].heMasterId : [],
                            ticketStatus: result[1] ? result[1] : []
                        }
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

taskManagementCtrl.getticketStatus = function (req, res, next) {
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'call wm_get_ticket_status(' + inputs.join(',') + ')';

                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;


                        response.data = {
                            heMasterId: result[0][0].heMasterId ? result[0][0].heMasterId : [],
                            ticket_status: result[1] ? result[1] : []
                        }
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

taskManagementCtrl.getprojectusers = function (req, res, next) {
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.projectId),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'call wm_saveproject_users(' + inputs.join(',') + ')';

                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;


                        response.data = {
                            project_users: result[0] ? result[0] : []
                        }
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

taskManagementCtrl.saveTicketTypes = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var inputs = [

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(req.body))
                ];

                var procQuery = 'call pm_save_config_ticketTypes(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);


                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data saved successfully";
                        response.error = null;

                        response.data = {
                            ticketTypes: result[0] ? result[0] : []
                        }
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


taskManagementCtrl.saveTaskTypes = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var inputs = [

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(req.body))
                ];

                var procQuery = 'call pm_save_config_taskTypes(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data saved successfully";
                        response.error = null;

                        response.data = {
                            taskTypes: result[0] ? result[0] : []
                        }
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

taskManagementCtrl.getCustomerlist = function (req, res, next) {
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.customerId || 0)


                ];

                var procQuery = 'call wm_customerList(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        res.status(result[0][0].statusCode).json(response);
                    }
                    else if (!err && result && result[0] && req.query.customerId == 0) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            customerList: result[0] ? result[0] : []
                        }
                        res.status(200).json(response);
                    }
                    else if (!err && result && result[0] && result[0][0] && req.query.customerId != 0) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            customerDetails: result[0][0] ? result[0][0] : []
                        }
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


taskManagementCtrl.GetCustomerTickets = function (req, res, next) {
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(req.body)),
                    req.st.db.escape(DBSecretKey)

                ];

                var procQuery = 'call wm_get_customerTickets(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            ticket: result[0] ? result[0] : [],
                            count: result[1] && result[1][0] && result[1][0].count ? result[1][0].count : 0
                        }
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            tickets: []
                        };
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

taskManagementCtrl.sendPasswordResetOTP = function (req, res, next) {

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

            console.log('CALL wm_validatePMuser(' + query + ')');
            req.st.db.query('CALL wm_validatePMuser(' + query + ')', function (err, userResult) {

                console.log("error", err);

                if (!err && userResult && userResult[0] && userResult[0][0].userMasterId) {
                    // code = userResult[0][0].otp;

                    message = 'Your Project Management password reset OTP is ' + code + ' .';

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

taskManagementCtrl.passwordResetVerifyOtp = function (req, res, next) {
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

        var procQuery = 'CALL wm_passwordResetverifyOtp( ' + inputs.join(',') + ')';
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

taskManagementCtrl.resetPassword = function (req, res, next) {
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

        var procQuery = 'CALL wm_resetPassword( ' + inputs.join(',') + ')';
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

taskManagementCtrl.saveBlogs = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        var inputs = [
            req.st.db.escape(req.query.token),
            req.st.db.escape(JSON.stringify(req.body))
        ];

        var procQuery = 'call wm_save_blogs(' + inputs.join(',') + ')';
        req.db.query(procQuery, function (err, result) {
            console.log(err);

            if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                response.status = true;
                response.message = result[0][0].message;
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }
            if (!err && result && result[0]) {
                response.status = true;
                response.message = "Data saved successfully";
                response.error = null;

                response.data = {
                    blogDetails: result[0][0] ? result[0][0] : []
                }
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
};


taskManagementCtrl.getBlogs = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        var inputs = [

            req.st.db.escape(req.query.token),
            req.st.db.escape(req.query.blogId || 0)

        ];

        var procQuery = 'call wm_get_blogList(' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                response.status = true;
                response.message = result[0][0].message;
                response.error = null;
                res.status(200).json(response);
            }
            else if (!err && result && result[0] && result[1] && result[1][0]) {
                response.status = true;
                response.message = "Data loaded successfully";
                response.error = null;
                response.data = {
                    blogList: result[0] && result[0][0] ? result[0] : [],
                    statusMaster: result[1] && result[1][0] ? result[1] : []
                }
                res.status(200).json(response);
            }
            else if (!err && result && result[0] && result[0][0] && req.query.blogId != 0) {
                response.status = true;
                response.message = "Data loaded successfully";
                response.error = null;
                response.data = {
                    blogDetails: result[0][0] ? result[0][0] : []
                }
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
};

taskManagementCtrl.saveBlogUserSession = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.body.loginId) {
        error.loginId = 'Invalid loginId';
        validationFlag *= false;
    }
    if (!req.body.password) {
        error.password = 'Invalid password';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        var inputs = [
            req.st.db.escape(req.body.loginId),
            req.st.db.escape(req.body.password)
        ];

        var procQuery = 'call wm_blogUserSession(' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);

            if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                response.status = true;
                response.message = result[0][0].message;
                response.error = null;
                response.data = null;
                res.status(200).json(response);
            }
            if (!err && result && result[0] && result[0][0]) {
                response.status = true;
                response.message = "Data saved successfully";
                response.error = null;

                response.data = {
                    blogUserDetails: result[0][0] ? result[0][0] : [],
                    token: result[1][0].token ? result[1][0].token : []
                }
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
};

taskManagementCtrl.getWebsiteBlogs = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.website) {
        error.website = 'Invalid website';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        var inputs = [
            req.st.db.escape(req.query.website)
        ];

        var procQuery = 'call wm_save_blogUsersWebsite(' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            if (!err && result && result[0] && result[0][0] && result[0][0].message) {
                response.status = true;
                response.message = result[0][0].message;
                response.error = null;
                res.status(200).json(response);
            }
            else if (!err && result && result[0]) {
                response.status = true;
                response.message = "Data loaded successfully";
                response.error = null;
                response.data = {
                    WebsiteBlogList: result[0] && result[0][0] ? result[0] : [],
                }
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
};

taskManagementCtrl.getbloglogout = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        var inputs = [
            req.st.db.escape(req.query.token)
        ];

        var procQuery = 'call wm_blogLogout(' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            if (err) {
                response.status = true;
                response.message = result[0][0].message;
                response.error = null;
                res.status(200).json(response);
            }
            else {
                response.status = true;
                response.message = "LogOut Success";
                response.error = null;
                response.data = {}
                res.status(200).json(response);
            }
        });

    }
};

taskManagementCtrl.savenotificationids = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        var inputs = [
            req.st.db.escape(req.query.token),
            req.st.db.escape(req.query.fcm_id)
        ];

        var procQuery = 'call cv_save_notifierids_web(' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            console.log(err);
            if (!err && result) {
                response.status = true;
                response.message = result[0][0].message;
                response.error = null;
                res.status(200).json(response);
            }
            else {
                response.status = true;
                response.error = null;
                res.status(200).json(response);
            }
        });

    }
};

taskManagementCtrl.sendnotification = function (req, res, next) {
    var response = {
        status: false,
        message: "Some error occured",
        data: null,
        error: null
    };
    var update_notification = [];
    var obj = {};
    var procQuery = 'call fetch_notifier_data()';
    console.log(procQuery);
    req.db.query(procQuery, function (err, result) {
        console.log(err);
        console.log(result);
        if (!err && result) {
            response.status = true;
            response.error = null;
            for (var i = 0; i < result[0].length; i++) {
                var message = {
                    to: result[0][i].fcm_id,
                    collapse_key: 'xxxxxxxxxxxxxx',
                    notification: {
                        title: 'you got a new task from project management',
                        body: 'please check that'
                    },
                    data: {
                        my_key: 'my value',
                        contents: "abcv/"
                    }
                };
                console.log(message);
                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log("Something has gone wrong!");
                        var isnotified = 0;
                    } else {
                        console.log("Successfully sent with response: ", response);
                        var isnotified = 1;
                    }
                    obj["isnotified"] = isnotified;
                    update_notification.push(obj);

                });
                obj["masterid"] = result[0][i].masterid;
                update_notification.push(obj);
                console.log(update_notification);
                
                var inputs = [
                    req.st.db.escape(JSON.stringify(update_notification))
                ]
                var procQuery = 'call cv_update_notification(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = true;
                        response.error = null;
                        res.status(200).json(response);
                    }
                });
            }
        }
        else {
            response.status = true;
            response.error = null;
            res.status(200).json(response);
        }
    });
};

module.exports = taskManagementCtrl;
