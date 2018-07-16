/**
 * Created by vedha on 12-12-2017.
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
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var jobCtrl = {};
var error = {};

jobCtrl.saveJobDefaults = function (req, res, next) {
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
        error.heMasterId = 'Invalid tenant';
        validationFlag *= false;
    }

    var jobType = req.body.jobType;
    if (typeof (jobType) == "string") {
        jobType = JSON.parse(jobType);
    }
    if (!jobType) {
        jobType = {};
    }
    var heDepartment = req.body.heDepartment;
    if (typeof (heDepartment) == "string") {
        heDepartment = JSON.parse(heDepartment);
    }
    if (!heDepartment){
        heDepartment = [];
    }

    var currency = req.body.currency;
    if (typeof (currency) == "string") {
        currency = JSON.parse(currency);
    }
    if (!currency) {
        currency = {};
    }
    var scale = req.body.scale;
    if (typeof (scale) == "string") {
        scale = JSON.parse(scale);
    }
    if (!scale) {
        scale = {};
    }
    var duration = req.body.duration;
    if (typeof (duration) == "string") {
        duration = JSON.parse(duration);
    }
    if (!duration) {
        duration = {};
    }
    var country = req.body.country;
    if (typeof (country) == "string") {
        country = JSON.parse(country);
    }
    if (!country) {
        country = {};
    }

    var defaultClient = req.body.defaultClient;
    if (typeof (defaultClient) == "string") {
        defaultClient = JSON.parse(defaultClient);
    }
    if (!defaultClient) {
        defaultClient = {};
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

                req.body.defId = (req.body.defId) ? req.body.defId : 0;
                req.body.purpose = (req.body.purpose) ? req.body.purpose : 0;
                req.body.logoFile = (req.body.logoFile) ? req.body.logoFile : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.defId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.purpose),
                    req.st.db.escape(JSON.stringify(jobType)),
                    req.st.db.escape(JSON.stringify(currency)),
                    req.st.db.escape(JSON.stringify(scale)),
                    req.st.db.escape(JSON.stringify(duration)),
                    req.st.db.escape(JSON.stringify(country)),
                    req.st.db.escape(JSON.stringify(heDepartment)),
                    req.st.db.escape(JSON.stringify(defaultClient)),
                    req.st.db.escape(req.body.logoFile)
                ];
                var procQuery = 'CALL WM_save_1010Defaults1( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.error = null;
                        response.message = "Requirement default saved successfully";
                        response.data = {
                            defaultId: results[0],
                            defaultData: (results[1] && results[1][0] && results[1][0].defaultFormData) ? JSON.parse(results[1][0].defaultFormData) : {}
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving form default";
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

jobCtrl.saveJob = function (req, res, next) {
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

    if (!req.body.purpose) {
        error.purpose = 'select a purpose';
        validationFlag *= false;
    }

    if (!req.body.clientId) {
        error.clientId = 'Invalid client';
        validationFlag *= false;
    }
    if (!req.body.contactList) {
        error.contactList = 'Invalid contacts';
        validationFlag *= false;
    }

    if (!req.body.jobTitle) {
        error.jobTitle = 'Invalid jobTitle';
        validationFlag *= false;
    }
    if (!req.body.jobCode) {
        error.jobCode = 'Invalid jobCode';
        validationFlag *= false;
    }
    if (!req.body.positions) {
        error.positions = 'Positions is not specified';
        validationFlag *= false;
    }
    if (!req.body.jobTypeId) {
        error.jobTypeId = 'Invalid jobType';
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

                req.body.requirementId = (req.body.requirementId) ? req.body.requirementId : 0;
                req.body.purpose = (req.body.purpose) ? req.body.purpose : 0;

                req.body.jobDescription = (req.body.jobDescription) ? req.body.jobDescription : "";
                req.body.expFrom = (req.body.expFrom) ? req.body.expFrom : 0;
                req.body.expTo = (req.body.expTo) ? req.body.expTo : 0;
                req.body.targetDate = (req.body.targetDate) ? req.body.targetDate : null;
                req.body.primarySkills = (req.body.primarySkills) ? req.body.primarySkills : "";
                req.body.secondarySkills = (req.body.secondarySkills) ? req.body.secondarySkills : "";
                req.body.educationId = (req.body.educationId) ? req.body.educationId : 0;
                req.body.keywords = (req.body.keywords) ? req.body.keywords : "";

                req.body.currencyId = (req.body.currencyId) ? req.body.currencyId : 0;
                req.body.minSalary = (req.body.minSalary) ? req.body.minSalary : 0;
                req.body.maxSalary = (req.body.maxSalary) ? req.body.maxSalary : 0;
                req.body.scaleId = (req.body.scaleId) ? req.body.scaleId : 0;
                req.body.frequencyId = (req.body.frequencyId) ? req.body.frequencyId : 0;
                req.body.notes = (req.body.notes) ? req.body.notes : "";


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tenId),
                    req.st.db.escape(req.body.requirementId),
                    req.st.db.escape(req.body.purpose),
                    req.st.db.escape(req.body.clientId),
                    req.st.db.escape(JSON.stringify(req.body.contactList)),
                    req.st.db.escape(req.body.jobTitle),
                    req.st.db.escape(req.body.jobCode),
                    req.st.db.escape(req.body.positions),
                    req.st.db.escape(req.body.jobTypeId),
                    req.st.db.escape(req.body.jobDescription),
                    req.st.db.escape(req.body.expFrom),
                    req.st.db.escape(req.body.expTo),
                    req.st.db.escape(req.body.targetDate),
                    req.st.db.escape(req.body.primarySkills),
                    req.st.db.escape(req.body.secondarySkills),
                    req.st.db.escape(req.body.educationId),
                    req.st.db.escape(req.body.keywords),

                    req.st.db.escape(req.body.currencyId),
                    req.st.db.escape(req.body.minSalary),
                    req.st.db.escape(req.body.maxSalary),
                    req.st.db.escape(req.body.scaleId),
                    req.st.db.escape(req.body.frequencyId),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(JSON.stringify(req.body.members)),     // members json with contains roles for diff members
                    req.st.db.escape(JSON.stringify(req.body.locations)),
                    req.st.db.escape(JSON.stringify(req.body.membersInterviewRound))

                ];


                var procQuery = 'CALL wm_save_requirement( ' + procParams.join(',') + ')';  // call procedure to save requirement data
                console.log(procQuery);

                req.db.query(procQuery, function (err, requirementResult) {
                    console.log(err);    // if  any error then prints on command window, if no error then prints 'null'
                    console.log(requirementResult);

                    if (!err && requirementResult && requirementResult[0] && requirementResult[0][0]) {

                        response.status = true;
                        response.message = "Requirement saved successfully";
                        response.error = null;
                        response.data = {
                            requirementId: requirementResult[0][0].requirementId
                        };
                        res.status(200).json(response);

                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving requirement template";
                        response.error = null;
                        //response.data = {
                        //   requirementId : req.body.requirementId+' is not present to update'
                        //};
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

jobCtrl.saveJobStatus = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    if (!req.body.heParentId) {
        error.heParentId = 'invalid parentId';
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
                req.body.status = (req.body.status) ? req.body.status : 0;
                req.body.notes = (req.body.notes) ? req.body.notes : "";

                var statusParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heParentId),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.notes)
                ];

                var statusQuery = 'CALL wm_save_requirement_status( ' + statusParams.join(',') + ')';
                console.log(statusQuery);

                req.db.query(statusQuery, function (err, statusResult) {
                    console.log(err);    // if  any error then prints on command window, if no error then prints 'null'
                    console.log(statusResult);

                    if (!err && statusResult && statusResult[0] && statusResult[0][0]) {

                        response.status = true;
                        response.message = "This is the present status";
                        response.error = null;
                        response.data =
                            statusResult[0][0];

                        res.status(200).json(response);

                    }
                    else {
                        response.status = false;
                        response.message = "Error while entering status";
                        response.error = null;
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

jobCtrl.getJobStatus = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    if (!req.query.heParentId) {
        error.heParentId = 'Invalid parentId';
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
                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heParentId)
                ];

                var procQuery = 'CALL wm_get_requirement_status( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, statusResult) {
                    console.log(err);
                    if (!err && statusResult && statusResult[0] && statusResult[0][0]) {
                        response.status = true;
                        response.message = "Status loaded successfully";
                        response.error = null;
                        response.data = statusResult[0];
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Status not found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting status";
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

jobCtrl.getJobDefaultMemberList = function (req, res, next) {
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
    console.log(req.query.purpose, "req.query.purpose");
    if (!req.query.purpose) {
        error.purpose = 'Invalid purpose';
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
                req.query.heDepartmentId = (req.query.hedepartmentId) ? req.query.heDepartmentId : 0;
                req.query.heMasterId = (req.query.heMasterId) ? req.query.heMasterId : 0;
                req.query.purpose = (req.query.purpose) ? req.query.purpose : 0;


                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.defId),
                    req.st.db.escape(req.query.heDepartmentId),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.purpose),
                    req.st.db.escape(DBSecretKey)
                ];
                var procQuery = 'CALL WM_get_defMemberList( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, memberList) {
                    console.log(err);

                    if (!err && memberList[0]) {
                        response.status = true;
                        response.message = "Requirement default member list is";
                        response.error = null;
                        response.data = {
                            memberList: memberList[0] ? memberList : []

                        };

                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "MemberList not found";
                        response.error = null;
                        response.data = {
                            memberList: []
                        };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting default member list ";
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

jobCtrl.getJobDefaults = function (req, res, next) {
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
                req.query.defId = (req.query.defId) ? req.query.defId : 0;
                req.query.purpose = (req.query.purpose) ? req.query.purpose : 0;
                req.query.heMasterId = (req.query.heMasterId) ? req.query.heMasterId : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.defId),
                    req.st.db.escape(req.query.purpose),
                    req.st.db.escape(req.query.heMasterId)
                    //req.st.db.escape(req.query.heDepartmentId)

                ];
                var procQuery = 'CALL WM_get_1010Default( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Requirement default data is";
                        response.error = null;
                        response.data = results[0][0].defaultFormData ? JSON.parse(results[0][0].defaultFormData) : {};

                        res.status(200).json(response);
                    }
                    else if (!err && results) {
                        response.status = true;
                        response.message = "Default data not found";
                        response.error = null;
                        response.data = {};
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting data form default";
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


jobCtrl.getcontactlist = function (req, res, next) {
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
    if (!req.query.heDepartmentId) {
        error.heDepartmentId = 'Invalid departments';
        validationFlag *= false;
    }

    var roles = req.body.roles;
    if (typeof (roles) == "string") {
        roles = JSON.parse(roles);
    }
    if (!roles) {
        roles = [];
    }
    var locations = req.body.locations;
    if (typeof (locations) == "string") {
        roles = JSON.parse(locations);
    }
    if (!locations) {
        locations = [];
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
                req.query.purpose = (req.query.purpose) ? req.query.purpose : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.heDepartmentId),
                    req.st.db.escape(JSON.stringify(roles)),
                    req.st.db.escape(JSON.stringify(locations))
                ];
                var procQuery = 'CALL wm_get_contactFilter( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    var isWeb = req.query.isWeb;
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Requirement  contactlist loaded sucessfully  ";
                        response.error = null;
                        response.data =
                            {
                                contactList: results[0]

                            };
                        if (isWeb == 0) {
                            res.status(200).json(response);
                        }
                        else {
                            res.status(200).json(response);
                        }

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Requirement  contactlist  is null";
                        response.error = null;
                        response.data = {
                            contactList: []
                        };
                        if (isWeb == 0) {
                            res.status(200).json(response);
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }

                    else {
                        response.status = false;
                        response.message = "Error while getting contactlist";
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


jobCtrl.saveContact = function (req, res, next) {
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
        error.heMasterId = 'invalid tenant';
        validationFlag *= false;
    }
    if (!req.query.heDepartmentId) {
        error.heDepartmentId = 'invalid client';
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
                req.body.contactId = (req.body.contactId) ? req.body.contactId : 0;
                req.body.imageUrl = (req.body.imageUrl) ? req.body.imageUrl : '';
                req.body.firstName = (req.body.firstName) ? req.body.firstName : '';
                req.body.lastName = (req.body.lastName) ? req.body.lastName : '';
                req.body.phoneISD = (req.body.phoneISD) ? req.body.phoneISD : '';
                req.body.phoneNumber = (req.body.phoneNumber) ? req.body.phoneNumber : '';
                req.body.mobileISD = (req.body.mobileISD) ? req.body.mobileISD : '';
                req.body.mobileNumber = (req.body.mobileNumber) ? req.body.mobileNumber : '';
                req.body.emailId = (req.body.emailId) ? req.body.emailId : '';
                req.body.jobtitle = (req.body.jobtitle) ? req.body.jobtitle : '';
                req.body.isHiringManager = (req.body.isHiringManager) ? req.body.isHiringManager : 0;
                req.body.isinterviewPanel = (req.body.isinterviewPanel) ? req.body.isinterviewPanel : 0;
                req.body.isprocurement = (req.body.isprocurement) ? req.body.isprocurement : 0;
                req.body.isTAHead = (req.body.isTAHead) ? req.body.isTAHead : 0;
                req.body.isrecruiterSPOC = (req.body.isrecruiterSPOC) ? req.body.isrecruiterSPOC : 0;
                req.body.ishiringLead = (req.body.ishiringLead) ? req.body.ishiringLead : 0;
                req.body.notes = (req.body.notes) ? req.body.notes : 0;
                req.body.status = (req.body.status) ? req.body.status : 1;


                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.heDepartmentId),
                    req.st.db.escape(req.body.contactId),
                    req.st.db.escape(req.body.imageUrl),
                    req.st.db.escape(req.body.firstName),
                    req.st.db.escape(req.body.lastName),
                    req.st.db.escape(req.body.phoneISD),
                    req.st.db.escape(req.body.phoneNumber),
                    req.st.db.escape(req.body.mobileISD),
                    req.st.db.escape(req.body.mobileNumber),
                    req.st.db.escape(req.body.emailId),
                    req.st.db.escape(req.body.jobtitle),
                    req.st.db.escape(req.body.isHiringManager),
                    req.st.db.escape(req.body.isinterviewPanel),
                    req.st.db.escape(req.body.isprocurement),
                    req.st.db.escape(req.body.isTAHead),
                    req.st.db.escape(req.body.isrecruiterSPOC),
                    req.st.db.escape(req.body.ishiringLead),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.status)


                ];
                var procQuery = 'CALL wm_save_contactDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    var isWeb = req.query.isWeb;
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Contact saved sucessfully";
                        response.error = null;
                        response.data = {
                            contacts: results[0]
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
                        response.message = "Error while saving contact";
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


jobCtrl.saveEducation = function (req, res, next) {
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

    var education = req.body.education;
    if(typeof(education)=='string'){
        education = JSON.parse(education);
    }
    if(!education){
        education=[];
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
                req.body.level = (req.body.level) ? req.body.level : 0;
                req.body.educationAlternateName = (req.body.educationAlternateName) ? req.body.educationAlternateName : '';
                req.body.specialization = (req.body.specialization) ? req.body.specialization : '';
                req.body.specializationAlternateName = (req.body.specializationAlternateName) ? req.body.specializationAlternateName : '';

                var inputs = [
                    req.st.db.escape(req.query.token),
                    // req.st.db.escape(req.body.tid),  
                    req.st.db.escape(JSON.stringify(education)),
                    req.st.db.escape(req.body.level),
                    req.st.db.escape(req.body.educationAlternateName),
                    req.st.db.escape(req.body.specialization),
                    req.st.db.escape(req.body.specializationAlternateName),
                    req.st.db.escape(req.body.educationType)
                ];
                var procQuery = 'CALL wm_save_educationDetails( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    var isWeb = req.query.isWeb;
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Education and Specialization saved sucessfully";
                        response.error = null;

                        for (var j = 0; j < results[0].length; j++) {
                            results[0][j].educationId = results[0][j].educationId;
                            results[0][j].educationTitle = results[0][j].EducationTitle;
                            results[0][j].specialization = results[0][j].specialization ? JSON.parse(results[0][j].specialization) : [];
                        }
                        response.data = {
                            educationList: results[0]
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
                        response.message = "Error while saving education and Specialization";
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

jobCtrl.getdefaults = function (req, res, next) {
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
                    req.st.db.escape(req.query.heMasterId)
                    // req.st.db.escape(JSON.stringify(req.body.clients))
                ];
                var procQuery = 'CALL WM_get_1010Default1( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    var isWeb = req.query.isWeb;
                    if (!err && results && results[0] || results[1]) {
                        response.status = true;
                        response.message = "Requirement default data is";
                        response.error = null;
                        response.data =
                            {
                                purpose: results[0][0].purpose ? results[0][0].purpose : 0,
                                jobType: results[0][0].jobtype ? results[0][0].jobtype : 0,
                                currency: results[0][0].currency ? results[0][0].currency : 0,
                                scale: results[0][0].scale ? results[0][0].scale : 0,
                                duration: results[0][0].duration ? results[0][0].duration : 0,
                                List: JSON.parse(results[0][0].List) ? JSON.parse(results[0][0].List) : []

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
                        response.message = "Error while getting data form default";
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

jobCtrl.saveLocation = function (req, res, next) {
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
                req.body.cityName = (req.body.cityName) ? req.body.cityName : '';
                req.body.alternateName = (req.body.alternateName) ? req.body.alternateName : '';
                req.body.latitude = (req.body.latitude) ? req.body.latitude : 0.0;
                req.body.longitude = (req.body.longitude) ? req.body.longitude : 0.0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.cityName),
                    req.st.db.escape(req.body.alternateName),
                    req.st.db.escape(req.body.latitude),
                    req.st.db.escape(req.body.longitude)

                ];
                var procQuery = 'CALL WM_save_mcities( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    var isWeb = req.query.isWeb;
                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Location added sucessfully";
                        response.error = null;
                        response.data = {
                            location: results[0]
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
                        response.message = "Error while saving location";
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

jobCtrl.saveRequirement = function (req, res, next) {

    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var isWeb = (req.query.isWeb) ? req.query.isWeb : 0; // 1- web, 0-mobile

    var senderGroupId;
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
                if (isWeb) {
                    if (!req.body.heMasterId) {
                        error.heMasterId = 'Invalid tenant';
                        validationFlag *= false;
                    }
                    var heDepartment = req.body.heDepartment;
                    if (typeof (heDepartment) == "string") {
                        heDepartment = JSON.parse(heDepartment);
                    }

                    var contactList = req.body.contactList;
                    if (typeof (contactList) == "string") {
                        contactList = JSON.parse(contactList);
                    }

                    if(!contactList){
                        contactList=[];
                    }

                    var branchList = req.body.branchList;
                    if (typeof (branchList) == "string") {
                        branchList = JSON.parse(branchList);
                    }

                    if(!branchList){
                        branchList=[];
                    }

                    var jobTitle = req.body.jobTitle;
                    if (typeof (jobTitle) == "string") {
                        jobTitle = JSON.parse(jobTitle);
                    }
                    if(!jobTitle){
                        jobTitle=[];
                    }

                    if (!req.body.jobCode) {
                        error.jobCode = 'Invalid jobCode';
                        validationFlag *= false;
                    }
                    if (!req.body.positions) {
                        error.positions = 'Positions is not specified';
                        validationFlag *= false;
                    }
                    var jobType = req.body.jobType;
                    if (typeof (jobType) == "string") {
                        jobType = JSON.parse(jobType);
                    }
                    if (!req.body.jobType) {
                        error.jobType = 'Invalid jobType';
                        validationFlag *= false;
                    }
                    var educationSpecialization = req.body.educationSpecialization;
                    if (typeof (educationSpecialization) == "string") {
                        educationSpecialization = JSON.parse(educationSpecialization);
                    }
                    if (!educationSpecialization) {
                        educationSpecialization = [];
                    }
                    var primarySkills = req.body.primarySkills;
                    if (typeof (primarySkills) == "string") {
                        primarySkills = JSON.parse(primarySkills);
                    }
                    if (!primarySkills) {
                        primarySkills = [];
                    }
                    var secondarySkills = req.body.secondarySkills;
                    if (typeof (secondarySkills) == "string") {
                        secondarySkills = JSON.parse(secondarySkills);
                    }
                    if (!secondarySkills) {
                        secondarySkills = [];
                    }
                    var members = req.body.members;
                    if (typeof (members) == "string") {
                        members = JSON.parse(members);
                    }
                    if (!members) {
                        members = [];
                    }
                    var currency = req.body.currency;
                    if (typeof (currency) == "string") {
                        currency = JSON.parse(currency);
                    }
                    if (!currency) {
                        currency = {};
                    }
                    var scale = req.body.scale;
                    if (typeof (scale) == "string") {
                        scale = JSON.parse(scale);
                    }
                    if (!scale) {
                        scale = {};
                    }
                    var duration = req.body.duration;
                    if (typeof (duration) == "string") {
                        duration = JSON.parse(duration);
                    }
                    if (!duration) {
                        duration = {};
                    }
                    var locations = req.body.locations;
                    if (typeof (locations) == "string") {
                        locations = JSON.parse(locations);
                    }
                    if (!locations) {
                        locations = [];
                    }
                    var memberInterviewRound = req.body.memberInterviewRound;
                    if (typeof (memberInterviewRound) == "string") {
                        memberInterviewRound = JSON.parse(memberInterviewRound);
                    }
                    if (!memberInterviewRound) {
                        memberInterviewRound = [];
                    }
                    var attachmentList = req.body.attachmentList;
                    if (typeof (attachmentList) == "string") {
                        attachmentList = JSON.parse(attachmentList);
                    }
                    if (!attachmentList) {
                        attachmentList = [];
                    }

                    var industry = req.body.industry;
                    if (typeof (industry) == "string") {
                   industry = JSON.parse(industry);
                    }
                    if (!industry) {
                    industry = [];
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.jdTemplateFlag = (req.body.jdTemplateFlag) ? req.body.jdTemplateFlag : 0;
                        req.body.parentId = (req.body.parentId) ? req.body.parentId : 0;
                        req.body.jdTemplateTitle = (req.body.jdTemplateTitle) ? req.body.jdTemplateTitle : "";
                        req.body.jobDescription = (req.body.jobDescription) ? req.body.jobDescription : "";
                        req.body.expFrom = (req.body.expFrom) ? req.body.expFrom : 0;
                        req.body.expTo = (req.body.expTo) ? req.body.expTo : 0;
                        req.body.targetDate = (req.body.targetDate) ? req.body.targetDate : null;
                        req.body.keywords = (req.body.keywords) ? req.body.keywords : "";
                        req.body.minSalary = (req.body.minSalary) ? req.body.minSalary : 0;
                        req.body.maxSalary = (req.body.maxSalary) ? req.body.maxSalary : 0;
                        req.body.notes = (req.body.notes) ? req.body.notes : "";
                        req.body.senderNotes = (req.body.senderNotes) ? req.body.senderNotes : "";
                        req.body.approverNotes = (req.body.approverNotes) ? req.body.approverNotes : "";
                        req.body.positionsFilled = (req.body.positionsFilled) ? req.body.positionsFilled : 0;
                        req.body.receiverNotes = (req.body.receiverNotes) ? req.body.receiverNotes : "";
                        req.body.changeLog = (req.body.changeLog) ? req.body.changeLog : "";
                        req.body.groupId = (req.body.groupId) ? req.body.groupId : 0;
                        req.body.learnMessageId = (req.body.learnMessageId) ? req.body.learnMessageId : 0;
                        req.body.accessUserType = (req.body.accessUserType) ? req.body.accessUserType : 0;
                        req.body.approverCount = (req.body.approverCount) ? req.body.approverCount : 0;
                        req.body.receiverCount = (req.body.receiverCount) ? req.body.receiverCount : 0;
                        req.body.status = req.body.status ? req.body.status : 1;   // new requirement default status to pending
                        req.body.statusTitle = req.body.statusTitle ? req.body.statusTitle : 'Pending';
                        req.body.expectedJoining = (req.body.expectedJoining) ? req.body.expectedJoining : 0;
                        req.body.jdTemplateId = (req.body.jdTemplateId) ? req.body.jdTemplateId : 0;
                        req.body.jdAttachment = (req.body.jdAttachment) ? req.body.jdAttachment : '';

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.heMasterId),
                            req.st.db.escape(req.body.jdTemplateTitle),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.purpose),
                            req.st.db.escape(JSON.stringify(heDepartment)),
                            req.st.db.escape(JSON.stringify(contactList)),
                            req.st.db.escape(JSON.stringify(branchList)),
                            req.st.db.escape(JSON.stringify(jobTitle)),
                            req.st.db.escape(req.body.jobCode),
                            req.st.db.escape(req.body.positions),
                            req.st.db.escape(JSON.stringify(jobType)),
                            req.st.db.escape(req.body.jobDescription),
                            req.st.db.escape(req.body.expFrom),
                            req.st.db.escape(req.body.expTo),
                            req.st.db.escape(req.body.targetDate),
                            req.st.db.escape(JSON.stringify(primarySkills)),
                            req.st.db.escape(JSON.stringify(secondarySkills)),
                            req.st.db.escape(JSON.stringify(educationSpecialization)),
                            req.st.db.escape(req.body.keywords),
                            req.st.db.escape(JSON.stringify(currency)),
                            req.st.db.escape(req.body.minSalary),
                            req.st.db.escape(req.body.maxSalary),
                            req.st.db.escape(JSON.stringify(scale)),
                            req.st.db.escape(JSON.stringify(duration)),
                            req.st.db.escape(req.body.notes),
                            req.st.db.escape(req.body.senderNotes),
                            req.st.db.escape(req.body.approverNotes),
                            req.st.db.escape(req.body.positionsFilled),
                            req.st.db.escape(req.body.receiverNotes),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(req.body.approverCount),
                            req.st.db.escape(req.body.receiverCount),
                            req.st.db.escape(JSON.stringify(members)),      // members json with contains roles for diff members
                            req.st.db.escape(JSON.stringify(locations)),        // newly added location
                            req.st.db.escape(JSON.stringify(memberInterviewRound)),
                            req.st.db.escape(JSON.stringify(attachmentList)),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.statusTitle),
                            req.st.db.escape(req.body.expectedJoining),
                            req.st.db.escape(req.body.jdTemplateFlag),
                            req.st.db.escape(req.body.jdTemplateId),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.jdAttachment),
                            req.st.db.escape(JSON.stringify(industry))
                        ];

                        var procQuery = 'CALL WM_save_requirement_notification_new( ' + procParams.join(',') + ')';  // call procedure to save requirement data
                        console.log(procQuery);

                        req.db.query(procQuery, function (err, results) {
                            console.log(err);

                            if (!err && results && results[0]) {
                                senderGroupId = results[0][0].senderId;
                                notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                                    senderName: results[0][0].senderName
                                });

                                for (var i = 0; i < results[1].length; i++) {
                                    if (notificationTemplaterRes.parsedTpl) {
                                        notification.publish(
                                            results[1][i].receiverId,
                                            (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                            (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                            results[0][0].senderId,
                                            notificationTemplaterRes.parsedTpl,
                                            31,
                                            0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                            (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                            0,
                                            0,
                                            0,
                                            0,
                                            1,
                                            moment().format("YYYY-MM-DD HH:mm:ss"),
                                            '',
                                            0,
                                            0,
                                            null,
                                            '',
                                            /** Data object property to be sent with notification **/
                                            {
                                                messageList: {
                                                    messageId: results[1][i].messageId,
                                                    message: results[1][i].message,
                                                    messageLink: results[1][i].messageLink,
                                                    createdDate: results[1][i].createdDate,
                                                    messageType: results[1][i].messageType,
                                                    messageStatus: results[1][i].messageStatus,
                                                    priority: results[1][i].priority,
                                                    senderName: results[1][i].senderName,
                                                    senderId: results[1][i].senderId,
                                                    receiverId: results[1][i].receiverId,
                                                    groupId: results[1][i].senderId,
                                                    groupType: 2,
                                                    transId: results[1][i].transId,
                                                    formId: results[1][i].formId,
                                                    currentStatus: results[1][i].currentStatus,
                                                    currentTransId: results[1][i].currentTransId,
                                                    parentId: results[1][i].parentId,
                                                    accessUserType: results[1][i].accessUserType,
                                                    heUserId: results[1][i].heUserId,
                                                    formData: JSON.parse(results[1][i].formDataJSON)

                                                }
                                            },
                                            null,
                                            tokenResult[0].isWhatMate,
                                            results[1][i].secretKey);
                                        console.log('postNotification : notification for compose_message is sent successfully');
                                    }
                                    else {
                                        console.log('Error in parsing notification compose_message template - ',
                                            notificationTemplaterRes.error);
                                        console.log('postNotification : notification for compose_message is not sent successfully');
                                    }
                                }

                                response.status = true;
                                if (req.body.jdTemplateFlag==1){
                                    response.message = "Requirement template saved successfully";    
                                }
                                else{
                                    response.message = "Requirement saved successfully";
                                }

                                response.error = null;
                                response.data = {
                                    messageList: {
                                        messageId: results[0][0].messageId,
                                        message: results[0][0].message,
                                        messageLink: results[0][0].messageLink,
                                        createdDate: results[0][0].createdDate,
                                        messageType: results[0][0].messageType,
                                        messageStatus: results[0][0].messageStatus,
                                        priority: results[0][0].priority,
                                        senderName: results[0][0].senderName,
                                        senderId: results[0][0].senderId,
                                        receiverId: results[0][0].receiverId,
                                        transId: results[0][0].transId,
                                        formId: results[0][0].formId,
                                        groupId: req.body.groupId,
                                        currentStatus: results[0][0].currentStatus,
                                        currentTransId: results[0][0].currentTransId,
                                        localMessageId: req.body.localMessageId,
                                        parentId: results[0][0].parentId,
                                        accessUserType: results[0][0].accessUserType,
                                        heUserId: results[0][0].heUserId,
                                        formData: JSON.parse(results[0][0].formDataJSON),
                                        requirementList: (results && results[2] && results[2][0]) ? results[2] : [],
                                        jdTemplateList: (results && results[3] && results[3][0]) ? results[3] : [],
                                        requirementJobTitle:(results && results[4] && results[4][0]) ? results[4] : []
                                    }
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
                                response.message = "Error while saving requirement template";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);

                            }
                        });
                    }
                }
                else {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                        if (!req.body.heMasterId) {
                            error.heMasterId = 'Invalid tenant';
                            validationFlag *= false;
                        }
                        var heDepartment = req.body.heDepartment;
                        if (typeof (heDepartment) == "string") {
                            heDepartment = JSON.parse(heDepartment);
                        }


                        var contactList = req.body.contactList;
                        if (typeof (contactList) == "string") {
                            contactList = JSON.parse(contactList);
                        }


                        var branchList = req.body.branchList;
                        if (typeof (branchList) == "string") {
                            branchList = JSON.parse(branchList);
                        }

                        if(!branchList){
                            branchList = [];
                        }

                        var jobTitle = req.body.jobTitle;
                        if (typeof (jobTitle) == "string") {
                            jobTitle = JSON.parse(jobTitle);
                        }

                        if(!jobTitle){
                            jobTitle = {};
                        }

                        if (!req.body.jobCode) {
                            error.jobCode = 'Invalid jobCode';
                            validationFlag *= false;
                        }
                        if (!req.body.positions) {
                            error.positions = 'Positions is not specified';
                            validationFlag *= false;
                        }
                        var jobType = req.body.jobType;
                        if (typeof (jobType) == "string") {
                            jobType = JSON.parse(jobType);
                        }
                        if (!req.body.jobType) {
                            error.jobType = 'Invalid jobType';
                            validationFlag *= false;
                        }
                        var educationSpecialization = req.body.educationSpecialization;
                        if (typeof (educationSpecialization) == "string") {
                            educationSpecialization = JSON.parse(educationSpecialization);
                        }
                        if (!educationSpecialization) {
                            educationSpecialization = [];
                        }
                        var primarySkills = req.body.primarySkills;
                        if (typeof (primarySkills) == "string") {
                            primarySkills = JSON.parse(primarySkills);
                        }
                        if (!primarySkills) {
                            primarySkills = [];
                        }
                        var secondarySkills = req.body.secondarySkills;
                        if (typeof (secondarySkills) == "string") {
                            secondarySkills = JSON.parse(secondarySkills);
                        }
                        if (!secondarySkills) {
                            secondarySkills = [];
                        }
                        var members = req.body.members;
                        if (typeof (members) == "string") {
                            members = JSON.parse(members);
                        }
                        if (!members) {
                            members = [];
                        }
                        var currency = req.body.currency;
                        if (typeof (currency) == "string") {
                            currency = JSON.parse(currency);
                        }
                        if (!currency) {
                            currency = {};
                        }
                        var scale = req.body.scale;
                        if (typeof (scale) == "string") {
                            scale = JSON.parse(scale);
                        }
                        if (!scale) {
                            scale = {};
                        }
                        var duration = req.body.duration;
                        if (typeof (duration) == "string") {
                            duration = JSON.parse(duration);
                        }
                        if (!duration) {
                            duration = {};
                        }
                        var locations = req.body.locations;
                        if (typeof (locations) == "string") {
                            locations = JSON.parse(locations);
                        }
                        if (!locations) {
                            locations = [];
                        }
                        var memberInterviewRound = req.body.memberInterviewRound;
                        if (typeof (memberInterviewRound) == "string") {
                            memberInterviewRound = JSON.parse(memberInterviewRound);
                        }
                        if (!memberInterviewRound) {
                            memberInterviewRound = [];
                        }
                        var attachmentList = req.body.attachmentList;
                        if (typeof (attachmentList) == "string") {
                            attachmentList = JSON.parse(attachmentList);
                        }
                        if (!attachmentList) {
                            attachmentList = [];
                        }

                        if (!validationFlag) {
                            response.error = error;
                            response.message = 'Please check the errors';
                            res.status(400).json(response);
                            console.log(response);
                        }
                        else {
                            req.body.jdTemplateFlag = (req.body.jdTemplateFlag) ? req.body.jdTemplateFlag : 0;
                            req.body.parentId = (req.body.parentId) ? req.body.parentId : 0;
                            req.body.jdTemplateTitle = (req.body.jdTemplateTitle) ? req.body.jdTemplateTitle : "";
                            req.body.jobDescription = (req.body.jobDescription) ? req.body.jobDescription : "";
                            req.body.expFrom = (req.body.expFrom) ? req.body.expFrom : 0;
                            req.body.expTo = (req.body.expTo) ? req.body.expTo : 0;
                            req.body.targetDate = (req.body.targetDate) ? req.body.targetDate : null;
                            req.body.keywords = (req.body.keywords) ? req.body.keywords : "";
                            req.body.minSalary = (req.body.minSalary) ? req.body.minSalary : 0;
                            req.body.maxSalary = (req.body.maxSalary) ? req.body.maxSalary : 0;
                            req.body.notes = (req.body.notes) ? req.body.notes : "";
                            req.body.senderNotes = (req.body.senderNotes) ? req.body.senderNotes : "";
                            req.body.approverNotes = (req.body.approverNotes) ? req.body.approverNotes : "";
                            req.body.positionsFilled = (req.body.positionsFilled) ? req.body.positionsFilled : 0;
                            req.body.receiverNotes = (req.body.receiverNotes) ? req.body.receiverNotes : "";
                            req.body.changeLog = (req.body.changeLog) ? req.body.changeLog : "";
                            req.body.groupId = (req.body.groupId) ? req.body.groupId : 0;
                            req.body.learnMessageId = (req.body.learnMessageId) ? req.body.learnMessageId : 0;
                            req.body.accessUserType = (req.body.accessUserType) ? req.body.accessUserType : 0;
                            req.body.approverCount = (req.body.approverCount) ? req.body.approverCount : 0;
                            req.body.receiverCount = (req.body.receiverCount) ? req.body.receiverCount : 0;
                            req.body.status = req.body.status ? req.body.status : 1;   // new requirement default status to pending
                            req.body.statusTitle = req.body.statusTitle ? req.body.statusTitle : 'Pending';
                            req.body.expectedJoining = (req.body.expectedJoining) ? req.body.expectedJoining : 0;
                            req.body.jdTemplateId = (req.body.jdTemplateId) ? req.body.jdTemplateId : 0;
                            req.body.jdAttachment = (req.body.jdAttachment) ? req.body.jdAttachment : '';

                            var procParams = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.body.heMasterId),
                                req.st.db.escape(req.body.jdTemplateTitle),
                                req.st.db.escape(req.body.parentId),
                                req.st.db.escape(req.body.purpose),
                                req.st.db.escape(JSON.stringify(heDepartment)),
                                req.st.db.escape(JSON.stringify(contactList)),
                                req.st.db.escape(JSON.stringify(branchList)),
                                req.st.db.escape(JSON.stringify(jobTitle)),
                                req.st.db.escape(req.body.jobCode),
                                req.st.db.escape(req.body.positions),
                                req.st.db.escape(JSON.stringify(jobType)),
                                req.st.db.escape(req.body.jobDescription),
                                req.st.db.escape(req.body.expFrom),
                                req.st.db.escape(req.body.expTo),
                                req.st.db.escape(req.body.targetDate),
                                req.st.db.escape(JSON.stringify(primarySkills)),
                                req.st.db.escape(JSON.stringify(secondarySkills)),
                                req.st.db.escape(JSON.stringify(educationSpecialization)),
                                req.st.db.escape(req.body.keywords),
                                req.st.db.escape(JSON.stringify(currency)),
                                req.st.db.escape(req.body.minSalary),
                                req.st.db.escape(req.body.maxSalary),
                                req.st.db.escape(JSON.stringify(scale)),
                                req.st.db.escape(JSON.stringify(duration)),
                                req.st.db.escape(req.body.notes),
                                req.st.db.escape(req.body.senderNotes),
                                req.st.db.escape(req.body.approverNotes),
                                req.st.db.escape(req.body.positionsFilled),
                                req.st.db.escape(req.body.receiverNotes),
                                req.st.db.escape(req.body.changeLog),
                                req.st.db.escape(req.body.groupId),
                                req.st.db.escape(req.body.learnMessageId),
                                req.st.db.escape(req.body.accessUserType),
                                req.st.db.escape(req.body.approverCount),
                                req.st.db.escape(req.body.receiverCount),
                                req.st.db.escape(JSON.stringify(members)),      // members json with contains roles for diff members
                                req.st.db.escape(JSON.stringify(locations)),        // newly added location
                                req.st.db.escape(JSON.stringify(memberInterviewRound)),
                                req.st.db.escape(JSON.stringify(attachmentList)),
                                req.st.db.escape(req.body.status),
                                req.st.db.escape(req.body.statusTitle),
                                req.st.db.escape(req.body.expectedJoining),
                                req.st.db.escape(req.body.jdTemplateFlag),
                                req.st.db.escape(req.body.jdTemplateId),
                                req.st.db.escape(DBSecretKey),
                                req.st.db.escape(req.body.jdAttachment)
                            ];

                            var procQuery = 'CALL WM_save_requirement_notification_new( ' + procParams.join(',') + ')';  // call procedure to save requirement data
                            console.log(procQuery);

                            req.db.query(procQuery, function (err, results) {
                                console.log(err);

                                if (!err && results && results[0]) {
                                    senderGroupId = results[0][0].senderId;
                                    notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                                        senderName: results[0][0].senderName
                                    });

                                    for (var i = 0; i < results[1].length; i++) {
                                        if (notificationTemplaterRes.parsedTpl) {
                                            notification.publish(
                                                results[1][i].receiverId,
                                                (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                results[0][0].senderId,
                                                notificationTemplaterRes.parsedTpl,
                                                31,
                                                0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                                (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                                0,
                                                0,
                                                0,
                                                0,
                                                1,
                                                moment().format("YYYY-MM-DD HH:mm:ss"),
                                                '',
                                                0,
                                                0,
                                                null,
                                                '',
                                                /** Data object property to be sent with notification **/
                                                {
                                                    messageList: {
                                                        messageId: results[1][i].messageId,
                                                        message: results[1][i].message,
                                                        messageLink: results[1][i].messageLink,
                                                        createdDate: results[1][i].createdDate,
                                                        messageType: results[1][i].messageType,
                                                        messageStatus: results[1][i].messageStatus,
                                                        priority: results[1][i].priority,
                                                        senderName: results[1][i].senderName,
                                                        senderId: results[1][i].senderId,
                                                        receiverId: results[1][i].receiverId,
                                                        groupId: results[1][i].senderId,
                                                        groupType: 2,
                                                        transId: results[1][i].transId,
                                                        formId: results[1][i].formId,
                                                        currentStatus: results[1][i].currentStatus,
                                                        currentTransId: results[1][i].currentTransId,
                                                        parentId: results[1][i].parentId,
                                                        accessUserType: results[1][i].accessUserType,
                                                        heUserId: results[1][i].heUserId,
                                                        formData: JSON.parse(results[1][i].formDataJSON)

                                                    }
                                                },
                                                null,
                                                tokenResult[0].isWhatMate,
                                                results[1][i].secretKey);
                                            console.log('postNotification : notification for compose_message is sent successfully');
                                        }
                                        else {
                                            console.log('Error in parsing notification compose_message template - ',
                                                notificationTemplaterRes.error);
                                            console.log('postNotification : notification for compose_message is not sent successfully');
                                        }
                                    }

                                    response.status = true;
                                    if (req.body.jdTemplateFlag==1){
                                        response.message = "Requirement template saved successfully";    
                                    }
                                    else{
                                        response.message = "Requirement saved successfully";
                                    }

                                    response.error = null;
                                    response.data = {
                                        messageList: {
                                            messageId: results[0][0].messageId,
                                            message: results[0][0].message,
                                            messageLink: results[0][0].messageLink,
                                            createdDate: results[0][0].createdDate,
                                            messageType: results[0][0].messageType,
                                            messageStatus: results[0][0].messageStatus,
                                            priority: results[0][0].priority,
                                            senderName: results[0][0].senderName,
                                            senderId: results[0][0].senderId,
                                            receiverId: results[0][0].receiverId,
                                            transId: results[0][0].transId,
                                            formId: results[0][0].formId,
                                            groupId: req.body.groupId,
                                            currentStatus: results[0][0].currentStatus,
                                            currentTransId: results[0][0].currentTransId,
                                            localMessageId: req.body.localMessageId,
                                            parentId: results[0][0].parentId,
                                            accessUserType: results[0][0].accessUserType,
                                            heUserId: results[0][0].heUserId,
                                            formData: JSON.parse(results[0][0].formDataJSON)
                                        },
                                        requirementList: results[2]
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
                                    response.message = "Error while saving requirement template";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);

                                }
                            });
                        }
                    });
                }
            }
            else {
                res.status(401).json(response);
            }

        });
    }
};

jobCtrl.deleteReqContacts = function (req, res, next) {
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
    if (!req.body.contacts) {
        error.contacts = 'contact not selected';
        validationFlag *= false;
    }
    if (!req.body.reqId) {
        error.reqId = 'Invalid requirementId';
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
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.reqId),  // or transId
                    req.st.db.escape(JSON.stringify(req.body.contacts))

                ];
                var procQuery = 'CALL wm_delete_1010reqContacts( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Contacts deleted successfully";
                        response.error = null;
                        response.data = {
                            contacts: results[0][0].contacts
                        };

                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while deleting contacts";
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

jobCtrl.deleteMainContacts = function (req, res, next) {
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
    console.log('heDepartmentId ' + req.body.heDepartmentId);
    console.log('contacts ' + req.body.contacts);
    var contacts = req.body.contacts;
    if (typeof (contacts) == "string") {
        contacts = JSON.parse(contacts);
    }
    if (!contacts) {
        error.contacts = 'Invalid contacts';
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
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(JSON.stringify(contacts))
                ];
                var procQuery = 'CALL wm_delete_contacts( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Contacts deleted successfully";
                        response.error = null;

                        response.data = {
                            contacts: results[0][0].contacts
                        };

                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while deleting contacts";
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

jobCtrl.deleteMainBranches = function (req, res, next) {
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
    var branches = req.body.branches;
    if (typeof (branches) == "string") {
        branches = JSON.parse(branches);
    }
    if (!branches) {
        error.branches = 'Invalid branches';
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
                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.heDepartmentId),
                    req.st.db.escape(JSON.stringify(branches))

                ];

                var procQuery = 'CALL wm_delete_branches( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);

                    if (!err && results && results[0]) {
                        response.status = true;
                        response.message = "Branches deleted successfully";
                        response.error = null;

                        response.data = {
                            branches: results[0][0].branches
                        };

                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while deleting branches";
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

jobCtrl.getRequirementDetails = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    if (!req.query.heParentId) {
        error.heParentId = 'Invalid parentId';
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heParentId),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(DBSecretKey)

                ];

                var procQuery = 'CALL wm_get_requirementDetails( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    var isWeb = req.query.isWeb;

                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Requirement Details loaded successfully";
                        response.error = null;

                        result[2][0].branchList = (result[2] && result[2][0]) ? JSON.parse(result[2][0].branchList):[];
                        result[2][0].contactList = (result[2] && result[2][0]) ? JSON.parse(result[2][0].contactList):[];
                        result[2][0].currency = (result[2] && result[2][0]) ? JSON.parse(result[2][0].currency):{};
                        result[2][0].duration = (result[2] && result[2][0]) ? JSON.parse(result[2][0].duration):{};
                        result[2][0].educationSpecialization = (result[2] && result[2][0]) ? JSON.parse(result[2][0].educationSpecialization):[];
                        result[2][0].heDepartment = (result[2] && result[2][0]) ? JSON.parse(result[2][0].heDepartment):{};
                        result[2][0].jobTitle = (result[2] && result[2][0]) ? JSON.parse(result[2][0].jobTitle):{};
                        result[2][0].jobType = (result[2] && result[2][0]) ? JSON.parse(result[2][0].jobType):{};
                        result[2][0].locationlist = (result[2] && result[2][0]) ? JSON.parse(result[2][0].locationlist):[];
                        result[2][0].memberInterviewRound = (result[2] && result[2][0]) ? JSON.parse(result[2][0].memberInterviewRound):[]; 
                        result[2][0].members = (result[2] && result[2][0]) ? JSON.parse(result[2][0].members):[];
                        result[2][0].primarySkills = (result[2] && result[2][0]) ? JSON.parse(result[2][0].primarySkills):[];
                        result[2][0].scale = (result[2] && result[2][0]) ? JSON.parse(result[2][0].scale):{};
                        result[2][0].secondarySkills = (result[2] && result[2][0]) ? JSON.parse(result[2][0].secondarySkills):[];
                        result[2][0].industry = (result[2] && result[2][0]) ? JSON.parse(result[2][0].industry):[];
                        result[2][0].attachmentList = (result[2] && result[2][0]) ? JSON.parse(result[2][0].attachmentList):[];

                        response.data = {
                            requirementDetails: result[0][0] ? result[0][0] : [],
                            //  requirementCompleteDetails: (result[1][0].reqJsonData) ? JSON.parse(result[1][0].reqJsonData) : {},
                             requirementCompleteDetails: (result[2] && result[2][0]) ? result[2][0]: {}
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
                        response.message = "Requirement Details not found";
                        response.error = null;
                        response.data = {
                            requirementDetails: {},
                            requirementCompleteDetails: {},
                            requirementNew: {}
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
                        response.message = "Error while getting requirement Details";
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


jobCtrl.getJdTemplate = function (req, res, next) {
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_requirementJDTemplate( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    var isWeb = req.query.isWeb;

                    if (!err && result && result[0]) {
                        response.status = true;
                        response.message = "Jd TemplateList  loaded successfully";
                        response.error = null;
                        response.data = {
                            jdTemplateList: result[0]
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
                        response.message = "Jd TemplateList not found";
                        response.error = null;
                        response.data = {
                            jdTemplateList: []
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
                        response.message = "Error while getting jdTemplateList";
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

jobCtrl.getJdTemplateDetails = function (req, res, next) {
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
                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0; // 1- web, 0-mobile

                var getStatus = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.jdtemplateId)

                ];

                var procQuery = 'CALL wm_get_requirementJDTemplateDetails( ' + getStatus.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Jd Template Details  loaded successfully";
                        response.error = null;

                        result[0][0].branchList = (result[0] && result[0][0]) ? JSON.parse(result[0][0].branchList):[];
                        result[0][0].contactList = (result[0] && result[0][0]) ? JSON.parse(result[0][0].contactList):[];
                        result[0][0].currency = (result[0] && result[0][0]) ? JSON.parse(result[0][0].currency):{};
                        result[0][0].duration = (result[0] && result[0][0]) ? JSON.parse(result[0][0].duration):{};
                        result[0][0].educationSpecialization = (result[0] && result[0][0]) ? JSON.parse(result[0][0].educationSpecialization):[];
                        result[0][0].heDepartment = (result[0] && result[0][0]) ? JSON.parse(result[0][0].heDepartment):{};
                        result[0][0].jobTitle = (result[0] && result[0][0]) ? JSON.parse(result[0][0].jobTitle):{};
                        result[0][0].jobType = (result[0] && result[0][0]) ? JSON.parse(result[0][0].jobType):{};
                        result[0][0].locationlist = (result[0] && result[0][0]) ? JSON.parse(result[0][0].locationlist):[];
                        result[0][0].memberInterviewRound = (result[0] && result[0][0]) ? JSON.parse(result[0][0].memberInterviewRound):[]; 
                        result[0][0].members = (result[0] && result[0][0]) ? JSON.parse(result[0][0].members):[];
                        result[0][0].primarySkills = (result[0] && result[0][0]) ? JSON.parse(result[0][0].primarySkills):[];
                        result[0][0].scale = (result[0] && result[0][0]) ? JSON.parse(result[0][0].scale):{};
                        result[0][0].secondarySkills = (result[0] && result[0][0]) ? JSON.parse(result[0][0].secondarySkills):[];
                        result[0][0].industry = (result[0] && result[0][0]) ? JSON.parse(result[0][0].industry):[];
                        result[0][0].attachmentList = (result[0] && result[0][0]) ? JSON.parse(result[0][0].attachmentList):[];

                        response.data = {
                            jdTemplateDetails:(result[0] && result[0][0]) ? result[0][0] : []
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
                        response.message = "Jd Template Details not found";
                        response.error = null;
                        response.data = {
                            jdTemplateDetails: []
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
                        response.message = "Error while getting jdTemplateDetails";
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


jobCtrl.manpowerRequirementStatus = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
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
                var input = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_get_manpowerRequirementOnStatus( ' + input.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    var isWeb = req.query.isWeb;
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Requirement status loaded successfully";
                        response.error = null;
                        response.data = {

                            manpowerStatus: result[0]
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
                        response.message = "Requirement status not found";
                        response.error = null;
                        response.data = null;

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
                        response.message = "Error while getting requirement status";
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


jobCtrl.getClientManagerList = function (req, res, next) {
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                var input = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_get_clientManagerList( ' + input.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[1]) {
                        response.status = true;
                        response.message = "Clients loaded successfully";
                        response.error = null;
                        response.data = {
                            internalList: result[0] ? result[0] : [],
                            clientList: result[1] ? result[1] : []
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Clients  not found";
                        response.error =
                            response.data = {
                                internalList: [],
                                clientList: []
                            };
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting clients";
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

module.exports = jobCtrl;