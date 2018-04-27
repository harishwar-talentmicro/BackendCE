/**
 * Created by Jana1 on 18-12-2017.
 */

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

var masterCtrl = {};
var error = {};

masterCtrl.getReqMasterData = function (req, res, next) {
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.purpose)
                ];

                var procQuery = 'CALL wm_get_jobtype_curr_scale_duration( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(req.query.isWeb);

                    var isWeb = req.query.isWeb;
                    if (!err && result) {
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        response.data = {
                            heDepartment: (result && result[0]) ? result[0] : [],
                            jobType: (result && result[1]) ? result[1] : [],
                            currency: (result && result[2]) ? result[2] : [],
                            scale: (result && result[3]) ? result[3] : [],
                            duration: (result && result[4]) ? result[4] : [],
                            country: (result && result[5]) ? result[5] : [],
                            jobTitle: (result && result[6]) ? result[6] : [],
                            roleList: result[7] ? result[7] : [],
                            interviewRoundList: result[8] ? result[8] : [],
                            status: result[9] ? result[9] : [],
                            requirementList: result[10] ? result[10] : []

                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            heDepartment: [],
                            jobType: [],
                            currency: [],
                            scale: [],
                            duration: [],
                            country: [],
                            jobTitle: [],
                            roleList: [],
                            interviewRoundList: [],
                            status: [],
                            requirementList: []
                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading master data";
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

masterCtrl.getSpecializations = function (req, res, next) {
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

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token)
                ];

                var procQuery = 'CALL wm_get_edu_Specialization( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, specResult) {
                    console.log(err);

                    var isWeb = req.query.isWeb;
                    if (!err && specResult && specResult[0] && specResult[0][0]) {
                        response.status = true;
                        response.message = "Educations loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < specResult[0].length; i++) {
                            var res2 = {};
                            res2.educationId = specResult[0][i].educationId;
                            res2.educationTitle = specResult[0][i].EducationTitle;
                            res2.specialization = specResult[0][i].specialization ? JSON.parse(specResult[0][i].specialization) : [];
                            output.push(res2);
                        }
                        response.data = {
                            educationList: output
                        };

                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            educationList: []
                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading educations";
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


masterCtrl.saveClients = function (req, res, next) {
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

    var heDepartment = req.body.heDepartment;
    if (typeof (heDepartment) == "string") {
        heDepartment = JSON.parse(heDepartment);
    }
    if (!heDepartment) {
        heDepartment = [];
    }
    var businessLocation = req.body.businessLocation;
    if (typeof (businessLocation) == "string") {
        businessLocation = JSON.parse(businessLocation);
    }
    if (!businessLocation) {
        businessLocation = [];
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(heDepartment)),
                    req.st.db.escape(JSON.stringify(businessLocation))

                ];
                var procQuery = 'CALL wm_saveClientBusinessLocationContacts( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results) {
                        response.status = true;
                        response.message = "Client saved sucessfully";
                        response.error = null;
                        response.data = {
                            heDepartmentId: results[0][0].heDepartmentId
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving client";
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


masterCtrl.savebranches = function (req, res, next) {
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
    if (!req.body.heDepartmentId) {
        error.heDepartmentId = 'Invalid client';
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0; // 1- web, 0-mobile
                req.body.tId = (req.body.tId) ? req.body.tId : 0;
                //req.body.HEDepartmentId = (req.body.HEDepartmentId) ? req.body.HEDepartmentId : 0;
                req.body.branchName = (req.body.branchName) ? req.body.branchName : '';
                req.body.branchCode = (req.body.branchCode) ? req.body.branchCode : '';
                req.body.shippingAddress = (req.body.shippingAddress) ? req.body.shippingAddress : '';
                req.body.shipPhoneISD = (req.body.shipPhoneISD) ? req.body.shipPhoneISD : '';
                req.body.shipPhoneNumber = (req.body.shipPhoneNumber) ? req.body.shipPhoneNumber : '';
                req.body.shipLatitude = (req.body.shipLatitude) ? req.body.shipLatitude : 0.0;
                req.body.shipLongitude = (req.body.shipLongitude) ? req.body.shipLongitude : 0.0;
                req.body.BillingAddress = (req.body.BillingAddress) ? req.body.BillingAddress : '';
                req.body.billPhoneISD = (req.body.billPhoneISD) ? req.body.billPhoneISD : '';
                req.body.billPhoneNumber = (req.body.billPhoneNumber) ? req.body.billPhoneNumber : '';
                req.body.billLatitude = (req.body.billLatitude) ? req.body.billLatitude : 0.0;
                req.body.billLongitude = (req.body.billLongitude) ? req.body.billLongitude : 0.0;
                req.body.Status = (req.body.Status) ? req.body.Status : 1;
                req.body.LandMark = (req.body.LandMark) ? req.body.LandMark : '';
                req.body.EntryProcedure = (req.body.EntryProcedure) ? req.body.EntryProcedure : '';
                req.body.currencyId = (req.body.currencyId) ? req.body.currencyId : 0;
                //req.body.type = (req.body.type) ? req.body.type : 0;
                req.body.timeZone = (req.body.timeZone) ? req.body.timeZone : '';



                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tId),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(req.body.branchName),
                    req.st.db.escape(req.body.branchCode),
                    req.st.db.escape(req.body.shippingAddress),
                    req.st.db.escape(req.body.shipPhoneISD),
                    req.st.db.escape(req.body.shipPhoneNumber),
                    req.st.db.escape(req.body.shipLatitude),
                    req.st.db.escape(req.body.shipLongitude),
                    req.st.db.escape(req.body.BillingAddress),
                    req.st.db.escape(req.body.billPhoneISD),
                    req.st.db.escape(req.body.billPhoneNumber),
                    req.st.db.escape(req.body.billLatitude),
                    req.st.db.escape(req.body.billLongitude),
                    req.st.db.escape(req.body.Status),
                    req.st.db.escape(req.body.LandMark),
                    req.st.db.escape(req.body.EntryProcedure),
                    req.st.db.escape(req.body.currencyId),
                    //req.st.db.escape(req.body.type),
                    req.st.db.escape(req.body.timeZone)

                ];
                var procQuery = 'CALL WM_save_WDClientBranches( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    var isWeb = req.query.isWeb;
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Client branches saved sucessfully";
                        response.error = null;
                        response.data = {
                            clientbranchId: results[0]
                        };

                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving client branches";
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


masterCtrl.getbranchList = function (req, res, next) {
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.heDepartmentId = (req.query.heDepartmentId) ? req.query.heDepartmentId : 0;
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heDepartmentId)


                ];
                var procQuery = 'CALL WM_get_branches( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    var isWeb = req.query.isWeb;
                    if (!err && results) {
                        response.status = true;
                        response.message = "branchList loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < results[3].length; i++) {
                            var res2 = {};
                            res2.heDepartmentId = results[3][i].heDepartmentId ? results[3][i].heDepartmentId : 0;
                            res2.businessLocationId = results[3][i].businessLocationId ? results[3][i].businessLocationId : 0;
                            res2.businessLocationTitle = results[3][i].businessLocationTitle ? results[3][i].businessLocationTitle : '';
                            res2.location = results[3][i].location ? results[3][i].location : '';
                            res2.address = results[3][i].address ? results[3][i].address : '';
                            res2.latitude = results[3][i].latitude ? results[3][i].latitude : 0.0;
                            res2.longitude = results[3][i].longitude ? results[3][i].longitude : 0.0;
                            res2.nearestParking = results[3][i].nearestParking ? results[3][i].nearestParking : '';
                            res2.entryProcedure = results[3][i].entryProcedure ? results[3][i].entryProcedure : '';
                            res2.contactList = results[3][i].contactList ? JSON.parse(results[3][i].contactList) : [];
                            output.push(res2);
                        };

                        response.data = {
                            branchList: results[0] ? results[0] : [],
                            detailedBranchList: results[1] ? results[1] : [],
                            wBranchList: results[2] ? results[2] : [],
                            branch_contacts: output
                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Branches does not exist";
                        response.error = null;
                        response.data = {
                            branchList: [],
                            detailedBranchList: [],
                            wBranchList: [],
                            branch_contacts: []
                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting branchlist";
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


// Mail templates section

masterCtrl.getmailTemplate = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    if (!req.query.heMasterId) {
        error.heMasterId = 'invalid company';
        validationFlag *= false;
    }
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
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_1010_mailtemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Mail template list";
                        response.error = null;
                        response.data = {
                            screeningMailer: result[0] ? result[0] : [],
                            submissionMailer: result[1] ? result[1] : [],
                            jobseekerMailer: result[2] ? result[2] : [],
                            clientMailer: result[3] ? result[3] : [],
                            interviewMailer: result[4] ? result[4] : []
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while getting mail templates";
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

masterCtrl.savetemplate = function (req, res, next) {
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
    if (!req.body.templateName) {
        error.templateName = 'Invalid templateName';
        validationFlag *= false;
    }
    var tags = req.body.tags;
    if (typeof (tags) == "string") {
        tags = JSON.parse(tags);
    }
    if (!tags) {
        tags = [];
    }
    var toMail = req.body.toMail;
    if (typeof (toMail) == "string") {
        toMail = JSON.parse(toMail);
    }
    if (!toMail) {
        toMail = [];
    }
    var cc = req.body.cc;
    if (typeof (cc) == "string") {
        cc = JSON.parse(cc);
    }
    if (!cc) {
        cc = [];
    }
    var bcc = req.body.bcc;
    if (typeof (bcc) == "string") {
        bcc = JSON.parse(bcc);
    }
    if (!bcc) {
        bcc = [];
    }
    var attachment = req.body.attachment;
    if (typeof (attachment) == "string") {
        attachment = JSON.parse(attachment);
    }
    if (!attachment) {
        attachment = [];
    }
    var stage = req.body.stage;
    if (typeof (stage) == "string") {
        stage = JSON.parse(stage);
    }
    if (!stage) {
        stage = [];
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                req.body.templateId = (req.body.templateId) ? req.body.templateId : 0;
                req.body.type = (req.body.type) ? req.body.type : 0;
                req.body.subject = (req.body.subject) ? req.body.subject : '';
                req.body.mailBody = (req.body.mailBody) ? req.body.mailBody : '';
                req.body.replymailId = (req.body.replymailId) ? req.body.replymailId : '';
                req.body.priority = (req.body.priority) ? req.body.priority : 0;
                req.body.updateFlag = (req.body.updateFlag) ? req.body.updateFlag : 0;
                req.body.SMSMessage = (req.body.SMSMessage) ? req.body.SMSMessage : '';
                req.body.whatmateMessage = (req.body.whatmateMessage) ? req.body.whatmateMessage : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.templateId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.templateName),
                    req.st.db.escape(req.body.type),
                    req.st.db.escape(JSON.stringify(toMail)),
                    req.st.db.escape(JSON.stringify(cc)),
                    req.st.db.escape(JSON.stringify(bcc)),
                    req.st.db.escape(req.body.subject),
                    req.st.db.escape(req.body.mailBody),
                    req.st.db.escape(req.body.replymailId),
                    req.st.db.escape(req.body.priority),
                    req.st.db.escape(req.body.updateFlag),
                    req.st.db.escape(req.body.SMSMessage),
                    req.st.db.escape(req.body.whatmateMessage),
                    req.st.db.escape(JSON.stringify(attachment)),
                    req.st.db.escape(JSON.stringify(tags)),
                    req.st.db.escape(JSON.stringify(stage))

                ];
                var procQuery = 'CALL WM_save_1010_mailTemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Mail template saved successfully";
                        response.error = null;
                        response.data = {
                            templateId: results[0]
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving mail template";
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


masterCtrl.getLocation = function (req, res, next) {
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.keyword)

                ];
                var procQuery = 'CALL wm_get_location( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    var isWeb = req.query.isWeb;
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Locations loaded successfully";
                        response.error = null;
                        response.data = {
                            locationList: results[0] ? results[0] : []
                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Locations does not exist";
                        response.error = null;
                        response.data = {
                            locationList: []
                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting locations";
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

masterCtrl.getmailTemplatedetaile = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    if (!req.query.heMasterId) {
        error.heMasterId = 'invalid company';
        validationFlag *= false;
    }

    if (!req.query.mailtemplateId) {
        error.mailtemplateId = 'invalid template';
        validationFlag *= false;
    }
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
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.mailTemplateId)

                ];

                var procQuery = 'CALL WM_get_1010mailTemplateDetail( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Mail template detaile";
                        response.error = null;
                        response.data = {

                            mailTemplateDetails: JSON.parse(result[0][0].formDataJson) ? JSON.parse(result[0][0].formDataJson) : []
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while getting mail templates";
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


masterCtrl.getSkills = function (req, res, next) {
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token)

                ];
                var procQuery = 'CALL Wm_get_skills( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    var isWeb = req.query.isWeb;
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Skills loaded successfully";
                        response.error = null;
                        response.data = {
                            skillList: results[0]
                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Skills does not exist";
                        response.error = null;
                        response.data = {
                            skillList: []
                        };
                        if (isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting skills";
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

masterCtrl.getRoleLocationMasterData = function (req, res, next) {
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
                    req.st.db.escape(req.query.purpose),
                    req.st.db.escape(req.query.heDepartmentId)
                ];

                var procQuery = 'CALL wm_get_location_rolemaster( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(req.query.isWeb);

                    var isWeb = req.query.isWeb;
                    if (!err && result) {
                        response.status = true;
                        response.message = "Master data loaded successfully";
                        response.error = null;
                        response.data = {
                            locationList: (result && result[0]) ? result[0] : [],
                            roles: (result && result[1]) ? result[1] : []
                        };
                        if (req.query.isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "no results found";
                        response.error = null;
                        response.data = {
                            locationList: [],
                            roles: []
                        };
                        if (req.query.isWeb == 1) {
                            res.status(200).json(response);
                        }
                        else {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting master data";
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


masterCtrl.saveClientsBusinessLocation = function (req, res, next) {
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.tid = (req.body.tid) ? req.body.tid : 0;  // clientId
                req.body.heMasterId = (req.body.heMasterId) ? req.body.heMasterId : 0;
                req.body.clientName = (req.body.clientName) ? req.body.clientName : '';
                req.body.title = (req.body.title) ? req.body.title : '';
                req.body.location = (req.body.location) ? req.body.location : '';
                req.body.address = (req.body.address) ? req.body.address : '';
                req.body.nearestParking = req.body.nearestParking ? req.body.nearestParking : '';
                req.body.entryProcedure = (req.body.entryProcedure) ? req.body.entryProcedure : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tid),  // clientId
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.clientName),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.location),
                    req.st.db.escape(req.body.address),
                    req.st.db.escape(req.body.nearestParking),
                    req.st.db.escape(req.body.entryProcedure)

                ];
                var procQuery = 'CALL wm_save_businessLocation( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results) {
                        response.status = true;
                        response.message = "Business location  saved sucessfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving Business Location";
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

masterCtrl.saveMasterStageStatus = function (req, res, next) {
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

    var stage = req.body.stage;
    if (typeof (stage) == "string") {
        stage = JSON.parse(stage);
    }
    if (!stage) {
        stage = [];
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(stage))
                ];
                var procQuery = 'CALL wm_save_masterStageStatus( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results) {
                        response.status = true;
                        response.message = "Stage and status saved sucessfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < results[0].length; i++) {
                            var res2 = {};
                            res2.stageId = results[0][i].stageId;
                            res2.stageName = results[0][i].stageName;
                            res2.stageTypeId = results[0][i].stageTypeId;
                            res2.stageTypeName = results[0][i].stageTypeName;
                            res2.colorCode = results[0][i].colorCode;
                            res2.status = JSON.parse(results[0][i].status) ? JSON.parse(results[0][i].status) : [];
                            output.push(res2);
                        }
                        response.data = {
                            stage: output
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving stage and status";
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

masterCtrl.getRequirementView = function (req, res, next) {
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.heMasterId)
                ];
                var procQuery = 'CALL wm_get_requirementView( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = " Requirement View loaded sucessfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < results[0].length; i++) {
                            var res2 = {};
                            res2.parentId = results[0][i].parentId ? results[0][i].parentId : 0,
                                res2.transId = results[0][i].transId ? results[0][i].transId : 0,
                                res2.heDepartmentId = results[0][i].heDepartmentId ? results[0][i].heDepartmentId : 0,
                                res2.positions = results[0][i].positions ? results[0][i].positions : 0,
                                res2.positionsFilled = results[0][i].positionsFilled ? results[0][i].positionsFilled : 0,
                                res2.departmentTitle = results[0][i].departmentTitle ? results[0][i].departmentTitle : '',
                                res2.jobCode = results[0][i].jobCode ? results[0][i].jobCode : '',
                                res2.jobtitleId = results[0][i].jobtitleId ? results[0][i].jobtitleId : 0,
                                res2.title = results[0][i].title ? results[0][i].title : '',
                                res2.jobtypeid = results[0][i].jobtypeid ? results[0][i].jobtypeid : 0,
                                res2.jobType = results[0][i].jobType ? results[0][i].jobType : '',
                                res2.jobDescription = results[0][i].jobDescription ? results[0][i].jobDescription : '',
                                res2.remainingDays = results[0][i].remainingDays ? results[0][i].remainingDays : 0,
                                res2.keywords = results[0][i].keywords ? results[0][i].keywords : '',
                                res2.createdUserId = results[0][i].createdUserId ? results[0][i].createdUserId : 0,
                                res2.creatorName = results[0][i].name ? results[0][i].name : '',
                                res2.createdDate = results[0][i].createdDate,
                                res2.branchList = JSON.parse(results[0][i].branchList) ? JSON.parse(results[0][i].branchList) : [],
                                res2.contactList = JSON.parse(results[0][i].contactList) ? JSON.parse(results[0][i].contactList) : [],
                                res2.stageDetail = JSON.parse(results[0][i].stageDetail) ? JSON.parse(results[0][i].stageDetail) : []
                            output.push(res2);
                        }
                        response.data = {
                            requirementView: output
                        };

                        if (req.query.isWeb == 0) {
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            //});
                        }
                        else {
                            res.status(200).json(response);
                        }

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = " Requirement View is empty";
                        response.error = null;
                        response.data = {
                            requirementView: []

                        };
                        if (req.query.isWeb == 0) {
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            res.status(200).json(response);
                        }

                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading Requirement View";
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


masterCtrl.getClientView = function (req, res, next) {
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];
                var procQuery = 'CALL wm_get_clientView( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = " Client View loaded sucessfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < results[0].length; i++) {
                            var res2 = {};
                            res2.stageDetail = JSON.parse(results[0][i].stageDetail) ? JSON.parse(results[0][i].stageDetail) : [],
                                res2.heDepartmentId = results[0][i].departmentId ? results[0][i].departmentId : 0,
                                res2.clientName = results[0][i].clientName ? results[0][i].clientName : 0,
                                res2.requirementCount = results[0][i].count ? results[0][i].count : 0,
                                res2.notes = results[0][i].notes ? results[0][i].notes : 0
                            output.push(res2);
                        }
                        response.data = {
                            clientView: output
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while loading client View";
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


masterCtrl.mailTags = function (req, res, next) {

    //var applicantId=36;

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid company';
        validationFlag *= false;
    }

    var tags = req.body.tags;
    if (typeof (tags) == "string") {
        tags = JSON.parse(tags);
    }
    if (!tags) {
        tags = [];
    }
    var reqApplicants = req.body.reqApplicants;
    if (typeof (reqApplicants) == "string") {
        reqApplicants = JSON.parse(reqApplicants);
    }
    if (!reqApplicants) {
        reqApplicants = [];
    }

    var applicants = req.body.applicantId;
    if (typeof (applicants) == "string") {
        applicants = JSON.parse(applicants);
    }
    if (!applicants) {
        applicants = [];
    }

    var client = req.body.clientId;
    if (typeof (client) == "string") {
        client = JSON.parse(client);
    }
    if (!client) {
        client = [];
    }

    var clientContacts = req.body.clientContacts;
    if (typeof (clientContacts) == "string") {
        clientContacts = JSON.parse(clientContacts);
    }
    if (!clientContacts) {
        clientContacts = [];
    }

    var tableTags = req.body.tableTags;
    if (typeof (tableTags) == "string") {
        tableTags = JSON.parse(tableTags);
    }
    if (!tableTags) {
        tableTags = [];
    }

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
                req.body.mailBody = req.body.mailBody ? req.body.mailBody : '';
                var mailBody = req.body.mailBody;
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                req.body.mailerType = req.body.mailerType ? req.body.mailerType : 0;
                req.query.userId = req.query.userId ? req.query.userId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(tags)),
                    req.st.db.escape(JSON.stringify(reqApplicants)),
                    req.st.db.escape(JSON.stringify(applicants)),
                    req.st.db.escape(JSON.stringify(client)),
                    req.st.db.escape(req.query.userId),
                    req.st.db.escape(req.body.mailerType),
                    req.st.db.escape(JSON.stringify(tableTags)),
                    req.st.db.escape(JSON.stringify(clientContacts))

                ];
                var idArray;
                var mailbody_array = [];
                if (req.body.mailerType == 1 || req.body.mailerType == 2) {  // 1- Screening mailer, 2- Submission mailer
                    idArray = reqApplicants;
                }
                else if (req.body.mailerType == 3) {  // 3- JobSeeker mailer
                    idArray = applicants;
                }
                else {                     //Client mailer
                    idArray = client;
                }

                var procQuery = 'CALL wm_get_detailsByTags1( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(result);
                    if (!err && result) {
                        var temp = mailBody;
                        if (req.body.mailerType != 2) {
                            for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {
                                console.log('applicantIndex=', applicantIndex);

                                for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {
                                    mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                }
                                for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {
                                    mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[1][applicantIndex][tags.requirement[tagIndex].tagName]);
                                }

                                for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {
                                    mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[2][applicantIndex][tags.client[tagIndex].tagName]);
                                }

                                mailbody_array.push(mailBody);
                                mailBody = temp;
                            }
                        }

                        else {
                            for (var clientIndex = 0; clientIndex < clientContacts.length; clientIndex++) {
                                for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {

                                    for (var tagIndex = 0; tagIndex < tags.applicant.length; tagIndex++) {
                                        mailBody = mailBody.replace('[applicant.' + tags.applicant[tagIndex].tagName + ']', result[0][applicantIndex][tags.applicant[tagIndex].tagName]);
                                    }

                                    for (var tagIndex = 0; tagIndex < tags.requirement.length; tagIndex++) {
                                        mailBody = mailBody.replace('[requirement.' + tags.requirement[tagIndex].tagName + ']', result[1][applicantIndex][tags.requirement[tagIndex].tagName]);
                                    }

                                    for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {
                                        mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[2][applicantIndex][tags.client[tagIndex].tagName]);
                                    }
                                }
                                for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {
                                    mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[8][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                    console.log('result=', result[8]);
                                    console.log('result[8][k]=', result[8][clientIndex]);
                                }

                                if (tableTags.applicant.length > 0) {
                                    var position = mailBody.indexOf('@table');
                                    var tableContent = '';
                                    mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                    tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                    console.log(tableContent, 'mailbody');
                                    for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                        tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.applicant[tagCount].displayTagAs + "</th>";
                                    }
                                    tableContent += "</tr>";
                                    for (var candidateCount = 0; candidateCount < result[5].length; candidateCount++) {
                                        tableContent += "<tr>";
                                        for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                            tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[5][candidateCount][tableTags.applicant[tagCount].tagName] + "</td>";
                                        }
                                        tableContent += "</tr>";
                                    }

                                    tableContent += "</table>";
                                    mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');

                                }

                                mailbody_array.push(mailBody);
                                mailBody = temp;
                            }
                        }


                        response.status = true;
                        response.message = "Tags replaced successfully";
                        response.error = null;
                        response.data = {
                            tagsPreview: mailbody_array,
                            applicantTable: result[5] ? result[5] : [],
                            requirementTable: result[6] ? result[6] : [],
                            clientTable: result[7] ? result[7] : []
                        };
                        res.status(200).json(response);
                    }

                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            tagsPreview: mailbody_array,
                            applicantTable: [],
                            requirementTable: [],
                            clientTable: []
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while replacing tags";
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

masterCtrl.getClientLocationContacts = function (req, res, next) {
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
        error.heMasterId = 'Invalid tenant';
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

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.heDepartmentId)
                ];

                var procQuery = 'CALL wm_get_clientBusinessContacts( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "client data loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < result[1].length; i++) {
                            var res2 = {};
                            res2.businessLocationId = result[1][i].businessLocationId;
                            res2.businessLocationTitle = result[1][i].businessLocationTitle;
                            res2.location = result[1][i].location;
                            res2.address = result[1][i].type;
                            res2.latitude = result[1][i].latitude;
                            res2.longitude = result[1][i].longitude;
                            res2.nearestParking = result[1][i].nearestParking;
                            res2.entryProcedure = result[1][i].entryProcedure;
                            res2.landmark = result[1][i].landmark;
                            res2.contactList = JSON.parse(result[1][i].contactList) ? JSON.parse(result[1][i].contactList) : [];
                            output.push(res2);
                        }
                        result[0][0].managers = JSON.parse(result[0][0].managers);

                        response.data = {
                            heDepartment: result[0][0],
                            businessLocation: output
                        };


                        if (isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                        else {
                            res.status(200).json(response);
                        }

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            clientData: []
                        };
                        if (isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting client data";
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

masterCtrl.saveAssessmentTemplates = function (req, res, next) {
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

    var question = req.body.question;
    if (typeof (question) == "string") {
        question = JSON.parse(question);
    }
    if (!question) {
        question = [];
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                req.body.deleteFlag = req.body.deleteFlag ? req.body.deleteFlag : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.assessmentId),
                    req.st.db.escape(req.body.assessmentTitle),
                    req.st.db.escape(req.body.deleteFlag),
                    req.st.db.escape(JSON.stringify(question))
                ];
                var procQuery = 'CALL wm_save_assessmentTemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results) {
                        response.status = true;
                        response.message = "Assessment saved sucessfully";
                        response.error = null;

                        response.data = {
                            assessmentId: results[0][0].assessmentId
                        };
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving assessment";
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

masterCtrl.getAssessmentTemplates = function (req, res, next) {
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

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.assessmentId)
                ];

                var procQuery = 'CALL wm_get_assessmentDetailsByTemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Assessment loaded successfully";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < result[1].length; i++) {
                            var res2 = {};
                            res2.questionId = result[1][i].questionId ? result[1][i].questionId : 0;
                            res2.questionName = result[1][i].questionName ? result[1][i].questionName : "";
                            res2.questionWeightage = result[1][i].questionWeightage ? result[1][i].questionWeightage : 0;
                            res2.groupTypeId = result[1][i].groupTypeId ? result[1][i].groupTypeId : 0;
                            res2.groupTypeName = result[1][i].groupTypeName ? result[1][i].groupTypeName : "";
                            res2.options = result[1][i].options ? JSON.parse(result[1][i].options) : [];
                            output.push(res2);
                        }
                        response.data = {
                            assessmentId: result[0][0].assessmentId ? result[0][0].assessmentId : 0,
                            assessmentTitle: result[0][0].assessmentTitle ? result[0][0].assessmentTitle : "",
                            question: output ? output : []
                        };

                        if (isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            assessmentId: 0,
                            assessmentTitle: "",
                            question: []
                        };
                        if (isWeb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting assessment templates";
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


masterCtrl.saveUserManager = function (req, res, next) {
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

    var accessRights = req.body.accessRights;
    if (typeof (accessRights) == "string") {
        accessRights = JSON.parse(accessRights);
    }
    if (!accessRights) {
        accessRights = [];
    }
    var reportingTo = req.body.reportingTo;
    if (typeof (reportingTo) == "string") {
        reportingTo = JSON.parse(reportingTo);
    }
    if (!reportingTo) {
        reportingTo = [];
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
                req.query.apiKey = req.query.apiKey ? req.query.apiKey : 0;
                req.body.userMasterId = req.body.userMasterId ? req.body.userMasterId : 0;
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.shortSignature = req.body.shortSignature ? req.body.shortSignature : '';
                req.body.fullSignature = req.body.userMasterId ? req.body.fullSignature : '';
                req.body.userType = req.body.userType ? req.body.userType : 0;
                req.body.firstName = req.body.firstName ? req.body.firstName : '';
                req.body.lastName = req.body.lastName ? req.body.lastName : '';
                req.body.mobileISD = req.body.mobileISD ? req.body.mobileISD : '';
                req.body.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : '';
                req.body.emailId = req.body.emailId ? req.body.emailId : '';
                req.body.heDepartmentId = req.body.heDepartmentId ? req.body.heDepartmentId : 0;
                req.body.location = req.body.location ? req.body.location : '';
                req.body.gradeId = req.body.gradeId ? req.body.gradeId : 0;
                req.body.workGroupId = req.body.workGroupId ? req.body.workGroupId : 0;
                req.body.RMId = req.body.RMId ? req.body.RMId : 0;
                req.body.RMId = req.body.RMId ? req.body.exitDate : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.apiKey),
                    req.st.db.escape(req.body.userMasterId),
                    req.st.db.escape(req.body.employeeCode),
                    req.st.db.escape(typeof (req.body.jobTitle) == "string" ? req.body.jobTitle : JSON.stringify(req.body.jobTitle)),
                    req.st.db.escape(JSON.stringify(accessRights)),
                    req.st.db.escape(JSON.stringify(reportingTo)),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.shortSignature),
                    req.st.db.escape(req.body.fullSignature),
                    req.st.db.escape(JSON.stringify(req.body.transferredTo)),
                    req.st.db.escape(typeof (req.body.userType) == "string" ? req.body.userType : JSON.stringify(req.body.userType)),
                    req.st.db.escape(req.body.firstName),
                    req.st.db.escape(req.body.lastName),
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(req.body.location),
                    req.st.db.escape(req.body.gradeId),
                    req.st.db.escape(req.body.workGroupId),
                    req.st.db.escape(req.body.RMId),
                    req.st.db.escape(req.body.exitDate),
                    req.st.db.escape(req.body.joiningDate)
                ];
                var procQuery = 'CALL save_Pace_User( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results) {
                        response.status = true;
                        response.message = "User data saved sucessfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while saving user data";
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

//for whatmate web configuration
masterCtrl.getAssessmentGroupType = function (req, res, next) {
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

                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_AssessmentgroupType( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Assessment groupType loaded successfully";
                        response.error = null;
                        response.data = {
                            groupType: result[0]
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            groupType: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting assessment groupType";
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


// save Assessment groupType 
masterCtrl.saveAssessmentGroupType = function (req, res, next) {
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
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                req.body.deleteFlag = req.body.deleteFlag ? req.body.deleteFlag : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.groupTypeId),
                    req.st.db.escape(req.body.groupTypeName),
                    req.st.db.escape(req.body.deleteFlag)
                ];
                var procQuery = 'CALL wm_Save_AssessmentgroupType( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "GroupType saved sucessfully";
                        response.error = null;
                        response.data = {
                            groupType: results[0][0]
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving groupType";
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


module.exports = masterCtrl;
