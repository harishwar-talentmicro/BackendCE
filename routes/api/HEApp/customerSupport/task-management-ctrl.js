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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tid),
                    req.st.db.escape(req.query.heMasterid),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.description),
                    req.st.db.escape(JSON.stringify(req.body.attachments || [])),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(JSON.stringify(req.body.stages || []))


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
                    req.st.db.escape(req.query.keywords)
                ];

                var procQuery = 'call get_project_details(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            Project_Details: result[0]
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

                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterid)
                ];

                var procQuery = 'call get_stages(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

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
                    req.st.db.escape(req.body.parentId || 0),
                    req.st.db.escape(req.body.projectId),
                    req.st.db.escape(req.body.priority),
                    req.st.db.escape(req.body.ticketTitle),
                    req.st.db.escape(req.body.ticketDescription),
                    req.st.db.escape(JSON.stringify(req.body.attachments)),
                    req.st.db.escape(req.body.progress),
                    req.st.db.escape(req.body.efforts),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.reason),
                    req.st.db.escape(JSON.stringify(req.body.assignTo)),
                    req.st.db.escape(req.body.assignDate),
                    req.st.db.escape(req.query.offset || 0),
                    req.st.db.escape(req.query.pages || 0),
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
                    req.st.db.escape(req.query.ticketId),
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

                        if (result[1][0].status = "true")
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

taskManagementCtrl.companymanager = function (req, res, next) {
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
                    req.st.db.escape(req.body.ezeid),
                    req.st.db.escape(req.body.latitude),
                    req.st.db.escape(req.body.longitude),
                    req.st.db.escape(req.body.companyTitle),
                    req.st.db.escape(req.body.aboutCompany),
                    req.st.db.escape(req.body.keywords),
                    req.st.db.escape(req.body.address),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(JSON.stringify(req.body.attachments)),
                    req.st.db.escape(JSON.stringify(req.body.customers)),
                    req.st.db.escape(encryptPwd),
                    req.st.db.escape(DBSecretKey)

                ];

                var procQuery = 'call wm_save_companymanager(' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;

                        response.data = {
                            companymanager: result[0]
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


taskManagementCtrl.getcompanymanager = function (req, res, next) {
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

                ];

                var procQuery = 'call get_companymanager(' + inputs.join(',') + ')';
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

                    req.st.db.escape(req.body.parentId || 0),

                    req.st.db.escape(req.body.projectId),
                    req.st.db.escape(req.body.priority),
                    req.st.db.escape(req.body.ticketTitle),
                    req.st.db.escape(req.body.ticketDescription),
                    req.st.db.escape(JSON.stringify(req.body.attachments)),
                    req.st.db.escape(req.body.progress),
                    req.st.db.escape(req.body.efforts),

                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.reason),
                    req.st.db.escape(JSON.stringify(req.body.assignTo)),
                    req.st.db.escape(JSON.stringify(req.body.task)),
                    req.st.db.escape(req.body.assignDate),
                    req.st.db.escape(req.query.offset || 0),
                    req.st.db.escape(req.query.pages || 0)

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
                    req.st.db.escape(req.query.ticketId)



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
                    req.st.db.escape(JSON.stringify(req.body.task)),

                    req.st.db.escape(req.query.offset || 0),
                    req.st.db.escape(req.query.pages || 0)

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

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data saved successfully";
                        response.error = null;
                        response.data = {}

                        response.data = result[0][0] ? result[0] : [],
                            response.data.stage = result[1]
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
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;


                        response.data = {}

                        response.data = result[0][0] ? result[0] : [],
                            response.data.stage = result[1]
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
            if ((!err) && tokenResult) {

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(req.body))
                ];

                var procQuery = 'call wm_save_ticket_config(' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data saved successfully";
                        response.error = null;

                        response.data = {
                            ticket_details: result[0][0]
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
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result) {
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;


                        response.data = {
                            ticket_config_list: result[0]
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

                    if (!err && result) {
                        response.status = true;
                        response.message = "Data saved successfully";
                        response.error = null;
                        response.data = {}
                        response.data = result[0][0] ? result[0] : []
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


                        response.data = {}

                        response.data = result[0][0] ? result[0] : []
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