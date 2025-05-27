var dataMigration = {};
var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var request = require('request');

var logger = require('../error-logger/error-log.js');
var integrationMethods = require('../whatmate-tallint-integration.js');
var integrationMethods = integrationMethods();



var fetchAPiUrl = function (req, callback) {

    var inputs = [
        req.st.db.escape(req.query.token),
        req.st.db.escape(req.query.heMasterId),
        req.st.db.escape(req.query.type)
    ];

    var procQuery = 'call wm_tallint_get_apiUrlData(' + inputs.join(',') + ')';
    console.log(procQuery);
    req.db.query(procQuery, function (err, result) {
        if (!err && result && result[0] && result[0][0]) {
            callback(err, result[0][0]);
        }
        else if (!err) {
            callback(err, result[0][0]);
        }
        else {
            callback(err, null);
        }
    });
}

dataMigration.resumeBackUp = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.resumeBackUp'
        }

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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

        if (!req.body.subBackupType) {
            error.subBackupType = 'Invalid subBackupType';
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.query.userMasterId = req.query.userMasterId ? req.query.userMasterId : 0;

                        console.log('req.body', req.body);
                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(req.body.customRange),
                            req.st.db.escape(req.body.from),
                            req.st.db.escape(req.body.to),
                            req.st.db.escape(req.body.startPage || 1),
                            req.st.db.escape(req.body.limit || 500),
                            req.st.db.escape(req.body.subBackupType)
                        ];


                        if (req.body.backupType == 1) {
                            var procQuery = 'CALL pace_backup_applicantResumeData( ' + inputs.join(',') + ')';
                        }
                        else if (req.body.backupType == 2) {
                            var procQuery = 'CALL pace_backup_requirementData( ' + inputs.join(',') + ')';
                        }
                        else if (req.body.backupType == 3) {
                            var procQuery = 'CALL pace_backup_clientData( ' + inputs.join(',') + ')';
                        }
                        else if (req.body.backupType == 4) {
                            var procQuery = 'CALL pace_backup_requirementApplicantData( ' + inputs.join(',') + ')';
                        }
                        else if (req.body.backupType == 5) {
                            var procQuery = 'CALL pace_backup_reqAppTransactionHistoryData( ' + inputs.join(',') + ')';
                        }

                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            try {
                                console.log(err);
                                if (!err && result) {
                                    response.status = true;
                                    response.message = "Data loaded successfully";
                                    response.error = null;
                                    if (req.body.backupType == 1) {
                                        response.data = {
                                            data: result[0] && result[0][0] ? result[0] : [],
                                            exportMore: result[1][0] && result[1][0].exportMore ? result[1][0].exportMore : 0
                                        }
                                    }
                                    else if (req.body.backupType == 2) {
                                        response.data = {
                                            data: result[0] && result[0][0] ? result[0] : [],
                                            exportMore: result[1][0] && result[1][0].exportMore ? result[1][0].exportMore : 0
                                        }
                                    }
                                    else if (req.body.backupType == 3) {
                                        response.data = {
                                            data: result[0] && result[0][0] ? result[0] : [],
                                            exportMore: result[1][0] && result[1][0].exportMore ? result[1][0].exportMore : 0
                                        }
                                    }
                                    else if (req.body.backupType == 4) {
                                        response.data = {
                                            data: result[0] && result[0][0] ? result[0] : [],
                                            exportMore: result[1][0] && result[1][0].exportMore ? result[1][0].exportMore : 0
                                        }
                                    }
                                    else if (req.body.backupType == 5) {
                                        response.data = {
                                            data: result[0] && result[0][0] ? result[0] : [],
                                            exportMore: result[1][0] && result[1][0].exportMore ? result[1][0].exportMore : 0
                                        }
                                    }


                                    if (req.query.isWeb == 0) {
                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                        zlib.gzip(buf, function (_, result) {
                                            try {
                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                res.status(200).json(response);
                                            }
                                            catch (ex) {
                                                console.log(ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    }
                                    else {
                                        res.status(200).json(response);
                                    }
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
                                    response.message = "Error while getting data";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            }
                            catch (ex) {
                                console.log(ex);
                                error_logger.error = ex;
                                logger(req, error_logger);
                                res.status(500).json(error_response);
                            }
                        });
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};



dataMigration.tallint_manpower_dashboard = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_manpower_dashboard'
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.userMasterId = req.body.userMasterId ? req.body.userMasterId : 0;

                        if (req.query.isTallint) {
                            if (!req.query.HCUserId) {
                                error.HCUserId = 'Invalid HCUserId';
                                validationFlag *= false;
                            }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 1;   // dashboard api

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath + req.query.HCUserId;
                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                            // body: dbResponse
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            console.log("error", err);
                                            try {
                                                if (!err && result) {
                                                    result[0].bgColorCode = "#91214e";
                                                    result[0].companyLogo = "dbf89bcf-836a-48ba-94c2-6eecd50f30b7.png";
                                                    response.status = true;
                                                    response.message = "Data loaded successfully";
                                                    response.error = null;

                                                    var stageList = [];
                                                    stageList = [
                                                        {
                                                            stageId: 1,
                                                            title: "Screening",
                                                            colorCode: "#91214e",
                                                            statusList: []
                                                        },
                                                        {
                                                            stageId: 1,
                                                            title: "Wheebox",
                                                            colorCode: "#91214e",
                                                            statusList: []
                                                        },
                                                        {
                                                            stageId: 2,
                                                            title: "HM Shortlist",
                                                            colorCode: "#91214e",
                                                            statusList: []
                                                        },
                                                        {
                                                            stageId: 4,
                                                            title: "Functional Interview",
                                                            colorCode: "#91214e",
                                                            statusList: []
                                                        },
                                                        {
                                                            stageId: 4,
                                                            title: "HR Interview",
                                                            colorCode: "#91214e",
                                                            statusList: []
                                                        },
                                                        {
                                                            stageId: 5,
                                                            title: "Offer",
                                                            colorCode: "#91214e",
                                                            statusList: []
                                                        },
                                                        {
                                                            stageId: 6,
                                                            title: "Joining",
                                                            colorCode: "#91214e",
                                                            statusList: []
                                                        }
                                                    ];

                                                    response.data = {
                                                        tallintDashboardData: result[0],
                                                        stageList: stageList,
                                                        cvSearchMasterData: {
                                                            skillList: [{ skillId: 43, skillName: "Android Studio" }, { skillId: 44, skillName: "Objective C" }],
                                                            roles: [{ jobtitleId: 43, title: "Android Developer" }, { jobtitleId: 44, title: "Ios Developer" }],
                                                            industry: [{ industryId: 43, title: "Software IT" }, { industryId: 44, title: "Business Development" }],
                                                            cvSource: [{ sourceId: 43, sourceName: "Naukri" }, { sourceId: 44, sourceName: "Monster" }],
                                                            functionalAreas: [{ functionalAreaId: 43, functionalAreaName: "Software" }, { functionalAreaId: 44, functionalAreaName: "Business Enhancement" }],
                                                            nationality: [{ nationalityId: 43, nationality: "India" }, { nationalityId: 44, nationality: "UAE" }]
                                                        },
                                                        offerMasterData: {
                                                            currency: [{ currencyId: 1, currencySymbol: "INR" }, { currencyId: 2, currencySymbol: "USD" }],
                                                            scale: [{ scaleId: 1, scale: "Hundreds" }, { scaleId: 2, scale: "Lakhs" }],
                                                            duration: [{ durationId: 1, duration: "Per Hour" }, { durationId: 2, duration: "Per Annnum" }],
                                                            attachment: [{ attachmentId: 1, attachmentName: "SSLC" }, { attachmentId: 2, attachmentName: "Degree" }],
                                                            grade: [{ gradeId: 1, gradeName: "Grade-E" }, { gradeId: 2, gradeName: "Grade-E" }],
                                                            designation: [{ jobtitleId: 1, title: "Android Developer" }, { jobtitleId: 1, title: "Ios Developer" }]
                                                        }
                                                    };
                                                    if (req.query.isWeb == 0) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } else {

                            var inputs = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.query.heMasterId),
                                req.st.db.escape(req.query.type)
                            ];

                            var procQuery = 'CALL pace_backup_reqAppTransactionHistoryData( ' + inputs.join(',') + ')';

                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            console.log("err",err);
                            response.status = true;
                            response.message = "Data loaded successfully";
                            response.error = null;
                            response.data = {
                                tallintDashboardData: {
                                    ManpowerRequests : result && result[0] && result[0][0] && result[0][0].ManpowerRequests ? result[0][0].ManpowerRequests : 0,
                                    ApprovalPending : result && result[1] && result[1][0] && result[1][0].ApprovalPending ? result[1][0].ApprovalPending : 0,
                                    ApprovedandOpen : result && result[2] && result[2][0] && result[2][0].ApprovedandOpen ? result[2][0].ApprovedandOpen : 0,
                                    ClosedorDropped : result && result[3] && result[3][0] && result[3][0].ClosedorDropped ? result[3][0].ClosedorDropped : 0
                                }
                            };
                            if (req.query.isWeb == 0) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }

                        });
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};



dataMigration.tallint_requirement_teamMembers = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_requirement_teamMembers'
        }

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.userMasterId = req.body.userMasterId ? req.body.userMasterId : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 3;   // dashboard api

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath;
                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                            // body: dbResponse
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            console.log("error", err);
                                            try {
                                                if (!err && result) {

                                                    response.status = true;
                                                    response.message = "Data loaded successfully";
                                                    response.error = null;
                                                    response.data = result.data;

                                                    if (req.query.isWeb == 0) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
                                                }
                                                else if (!err) {
                                                    response.status = true;
                                                    response.message = "no results found";
                                                    response.error = null;
                                                    response.data = {
                                                        teamMembers: []
                                                    };
                                                    if (req.query.isWeb == 0) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
                                                }
                                                else {
                                                    response.status = false;
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log(ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else if (!err) {
                                        response.status = true;
                                        response.message = "Tallint api not configured";
                                        response.error = null;
                                        response.data = {
                                            teamMembers: []
                                        };
                                        if (req.query.isWeb == 0) {
                                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                            zlib.gzip(buf, function (_, result) {
                                                try {
                                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                    res.status(200).json(response);
                                                }
                                                catch (ex) {
                                                    console.log(ex);
                                                    error_logger.error = ex;
                                                    logger(req, error_logger);
                                                    res.status(500).json(error_response);
                                                }
                                            });
                                        }
                                        else {
                                            res.status(200).json(response);
                                        }
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } else {
                            response.status = true;
                            response.message = "No team member data for whatmate user";
                            response.error = null;
                            response.data = {
                                teamMembers: []
                            }
                            if (req.query.isWeb == 0) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


dataMigration.tallint_ER_jobList = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_Employee_portal_jobList'
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.userMasterId = req.body.userMasterId ? req.body.userMasterId : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 8;   // jobdetails api

                                fetchAPiUrl(req, function (err, urlData) {
                                    console.log("kjahdojhfou",urlData);
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath + "lng_id=" + (req.query.lng_id ? req.query.lng_id : 1)+ "&tn_id=" + (req.query.tn_id ? req.query.tn_id:1) + "&flag=" + (req.query.flag ? req.query.flag:1) +"&user_id=" +req.query.HCUserId ;
                                        console.log(url);
                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                            // body: dbResponse
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            var err = null;
                                            
                                            console.log("error", err);
                                            try {
                                                if (!err && result) {
                                                    // var result = {
                                                    //     "code": 200,
                                                    //     "message": "Data Retrieved Successfully",
                                                    //     "error": null,
                                                    //     "data": {
                                                    //         "masters": {},
                                                    //         "list": [
                                                    //             {
                                                    //                 "reqId": 342,
                                                    //                 "title": ".Net Architect",
                                                    //                 "jobCode": "JCDR232",
                                                    //                 "shortJobDescription" : "Designation: Dot net Developer Total Experience: 4- 10 years Notice Period : Immediate or 30 Days Max",
                                                    //                 "jobDescription" : `Job responsibilities for DotNet developer:

                                                    //                 • Design and implementation of new software architectures based on Linux and Adaptive AUTOSAR for high-performance computing platforms for embedded automotive applications
                                                    //                 • Elaboration of technical documentation and reports
                                                    //                 • Technical contact to customers, stakeholders and development partners
                                                    //                 Skills required:
                                                    //                 • 4 to10 years of experience in automotive embedded software development (Must).
                                                    //                 • Adaptive AUTOSAR experience (Must).
                                                    //                 • Experience with in AUTOSAR development methodology, architecture and workflow.
                                                    //                 • Experience with Vector/Electrobit Adaptive AUTOSAR stack is highly preferred.
                                                    //                 • Good object-oriented programming skills, preferably in C++ or Java.
                                                    //                 • Experience in development and/or integration of Linux based for automotive embedded applications
                                                    //                 • Experience with automotive networks like CAN, Flexray, Ethernet etc.
                                                    //                 • Familiarity with tools like JIRA, GitHub, Jenkins etc.`
                                                    //             },
                                                    //             {
                                                    //                 "reqId": 343,
                                                    //                 "title": "Java developer",
                                                    //                 "jobCode": "JCRR236",
                                                    //                 "shortJobDescription" : "Designation: Java Developer Total Experience: 4- 10 years Notice Period : Immediate or 30 Days Max",
                                                    //                 "jobDescription" : `Job responsibilities for Java developer:

                                                    //                 • Design and implementation of new software architectures based on Linux and Adaptive AUTOSAR for high-performance computing platforms for embedded automotive applications
                                                    //                 • Elaboration of technical documentation and reports
                                                    //                 • Technical contact to customers, stakeholders and development partners
                                                    //                 Skills required:
                                                    //                 • 4 to10 years of experience in automotive embedded software development (Must).
                                                    //                 • Adaptive AUTOSAR experience (Must).
                                                    //                 • Experience with in AUTOSAR development methodology, architecture and workflow.
                                                    //                 • Experience with Vector/Electrobit Adaptive AUTOSAR stack is highly preferred.
                                                    //                 • Good object-oriented programming skills, preferably in C++ or Java.
                                                    //                 • Experience in development and/or integration of Linux based for automotive embedded applications
                                                    //                 • Experience with automotive networks like CAN, Flexray, Ethernet etc.
                                                    //                 • Familiarity with tools like JIRA, GitHub, Jenkins etc.`
                                                    //             },
                                                    //             {
                                                    //                 "reqId": 344,
                                                    //                 "title": "Node developer",
                                                    //                 "jobCode": "NRRR236",
                                                    //                 "shortJobDescription" : "Designation: Node Developer Total Experience: 4- 10 years Notice Period : Immediate or 30 Days Max",
                                                    //                 "jobDescription" : `Job responsibilities of Node developer:

                                                    //                 • Design and implementation of new software architectures based on Linux and Adaptive AUTOSAR for high-performance computing platforms for embedded automotive applications
                                                    //                 • Elaboration of technical documentation and reports
                                                    //                 • Technical contact to customers, stakeholders and development partners
                                                    //                 Skills required:
                                                    //                 • 4 to10 years of experience in automotive embedded software development (Must).
                                                    //                 • Adaptive AUTOSAR experience (Must).
                                                    //                 • Experience with in AUTOSAR development methodology, architecture and workflow.
                                                    //                 • Experience with Vector/Electrobit Adaptive AUTOSAR stack is highly preferred.
                                                    //                 • Good object-oriented programming skills, preferably in C++ or Java.
                                                    //                 • Experience in development and/or integration of Linux based for automotive embedded applications
                                                    //                 • Experience with automotive networks like CAN, Flexray, Ethernet etc.
                                                    //                 • Familiarity with tools like JIRA, GitHub, Jenkins etc.`
                                                    //             }
                                                    //         ],
                                                    //         "details": {}
                                                    //     },
                                                    //     "status": true,
                                                    //     "query_data": null,
                                                    //     "form_data": null
                                                    // };

                                                    // response.status = true;
                                                    // response.message = "Data loaded successfully";
                                                    // response.error = null;
                                                    // response.data = result;
                                                    response = result;
                                                    if (req.query.isWeb == 1) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } else {
                            response.status = true;
                            response.message = "No Dashboard data for whatmate user";
                            response.error = null;
                            response.data = {
                                tallintDashboardData: null
                            };
                            if (req.query.isWeb == 1) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

dataMigration.tallint_ER_Dashboard = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_ER_Dashboard'
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.userMasterId = req.body.userMasterId ? req.body.userMasterId : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 9;   // dashboard api

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath + "lng_id=" + (req.query.lng_id ? req.query.lng_id :1) +"&user_id=" + (req.query.HCUserId ? req.query.HCUserId :1) +"&tn_id=" + (req.query.tn_id ?  req.query.tn_id :1) ;
                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                            // body: dbResponse
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            var err = null;
                                           console.log(url);
                                            console.log("error", err);
                                            try {
                                                if (!err && result) {
                                                   

                                                    // response.status = true;
                                                    // response.message = "Data loaded successfully";
                                                    // response.error = null;
                                                    // response.data = result;
                                                    response = result;
                                                    if (req.query.isWeb == 1) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } else {
                            response.status = true;
                            response.message = "No Dashboard data for whatmate user";
                            response.error = null;
                            response.data = {
                                tallintDashboardData: null
                            };
                            if (req.query.isWeb == 1) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

dataMigration.tallint_ER_JobDetails = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_ER_JobDetails'
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.userMasterId = req.body.userMasterId ? req.body.userMasterId : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 10;   // JobDetails api

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath + "lng_id=" + req.query.lng_id + "&req_id=" + req.query.req_id;

                                        console.log("url for job details" ,url);
                                        console.log("type",urlData.method)
                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                            // body: dbResponse
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            var err = null;
                                           // var result = 1;
                                            console.log("error", err);
                                            try {
                                                if (!err && result) {
                                                    result.data=result.data ? result.data[0] : result.data;

                                                    // response.status = true;
                                                    // response.message = "Data loaded successfully";
                                                    // response.error = null;
                                                    // response.data = result;
                                                    response = result;
                                                    if (req.query.isWeb == 1) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } 
                        else {
                            response.status = true;
                            response.message = "No Details Found";
                            response.error = null;
                            response.data = null;
                            if (req.query.isWeb == 1) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

dataMigration.tallint_ER_Link = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_ER_Link'
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.userMasterId = req.body.userMasterId ? req.body.userMasterId : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 11;   // JobDetails api

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath + "req_id=" + req.query.req_id + "&user_id=" + req.query.HCUserId  ;

                                        console.log("url for Link" ,url);
                                        console.log("type",urlData.method)
                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                            // body: dbResponse
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            var err = null;
                                           // var result = 1;
                                            console.log("error", err);
                                            console.log("datajdnhv", result);
                                            try {
                                                if (!err && result) {
                                                //    result.data=result.data ? result.data[0] : result.data;

                                                    // response.status = true;
                                                    // response.message = "Data loaded successfully";
                                                    // response.error = null;
                                                    // response.data = result;
                                                    response = result;
                                                    if (req.query.isWeb == 1) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } 
                        else {
                            response.status = true;
                            response.message = "No Details Found";
                            response.error = null;
                            response.data = null;
                            if (req.query.isWeb == 1) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


dataMigration.tallint_ER_Like = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_ER_Like'
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.like_flag = req.body.like_flag ? req.body.like_flag : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 12;   // JobDetails api

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath  ;

                                        console.log("url for Link" ,url);
                                        console.log("jadjshfjvb cjvbh uasdnfoi[chadsljbhxfcoiadsnzxo[ufcniosdipauhfvc" ,req.body);
                                        console.log("type",urlData.method)
                                        var input={};
                                    
                                        input.req_id=req.body.req_id,
                                        input.like_flag=req.body.like_flag,
                                        input.user_id= req.body.HCUserId,

                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                            body: input
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            var err = null;
                                           // var result = 1;
                                            console.log("error", err);
                                            console.log("datajdnhv", result);
                                            try {
                                                if (!err && result) {
                                                //    result.data=result.data ? result.data[0] : result.data;

                                                    // response.status = true;
                                                    // response.message = "Data loaded successfully";
                                                    // response.error = null;
                                                    // response.data = result;
                                                    response = result;
                                                    if (req.query.isWeb == 1) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } 
                        else {
                            response.status = true;
                            response.message = "No Details Found";
                            response.error = null;
                            response.data = null;
                            if (req.query.isWeb == 1) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

dataMigration.tallint_ER_Comment = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_ER_Comment'
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.like_flag = req.body.like_flag ? req.body.like_flag : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 13;   // JobDetails api

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath  ;

                                        console.log("url for Link" ,url);
                                        console.log("type",urlData.method)
                                        var input={};
                                    
                                        input.req_id=req.body.req_id;
                                        input.status_flag=req.body.status_flag?req.body.status_flag :1;
                                        input.user_id= req.body.HCUserId;
                                        input.comment= req.body.comment;

                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                             body: input
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            var err = null;
                                           // var result = 1;
                                            console.log("error", err);
                                            console.log("datajdnhv", result);
                                            try {
                                                if (!err && result) {
                                                //    result.data=result.data ? result.data[0] : result.data;

                                                    // response.status = true;
                                                    // response.message = "Data loaded successfully";
                                                    // response.error = null;
                                                    // response.data = result;
                                                    response = result;
                                                    if (req.query.isWeb == 1) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } 
                        else {
                            response.status = true;
                            response.message = "No Details Found";
                            response.error = null;
                            response.data = null;
                            if (req.query.isWeb == 1) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

dataMigration.tallint_ER_Comment_Details = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_ER_Comment_Details'
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.like_flag = req.body.like_flag ? req.body.like_flag : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 14;   // JobDetails api

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath + "lng_id=" + req.query.lng_id + "&req_id=" + req.query.req_id + "&user_id=" + req.query.HCUserId  ;

                                        console.log("url for Link" ,url);
                                        console.log("type",urlData.method)
                                        var input={};
                                    
                                        input.req_id=req.body.req_id;
                                        input.status_flag=req.body.status_flag?req.body.status_flag :1;
                                        input.user_id= req.body.HCUserId;
                                        input.comment= req.body.comment;

                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                           //  body: input
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            var err = null;
                                           // var result = 1;
                                            console.log("error", err);
                                            console.log("datajdnhv", result);
                                            try {
                                                if (!err && result) {
                                                //    result.data=result.data ? result.data[0] : result.data;

                                                    // response.status = true;
                                                    // response.message = "Data loaded successfully";
                                                    // response.error = null;
                                                    // response.data = result;
                                                    response = result;
                                                    if (req.query.isWeb == 1) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } 
                        else {
                            response.status = true;
                            response.message = "No Details Found";
                            response.error = null;
                            response.data = null;
                            if (req.query.isWeb == 1) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

// dataMigration.tallint_ER_ClaimReward = function (req, res, next) {
//     try {
//         var error_logger = {
//             details: 'dataMigration.tallint_ER_ClaimReward'
//         }
//         var error = {};

//         var error_response = {
//             status: false,
//             message: "Some error occurred!",
//             error: null,
//             data: null
//         }
//         var response = {
//             status: false,
//             message: "Invalid Token",
//             data: null,
//             error: null
//         };
//         var validationFlag = true;

//         if (!req.query.token) {
//             error.token = 'Invalid token';
//             validationFlag *= false;
//         }

//         if (!req.query.heMasterId) {
//             error.heMasterId = 'Invalid company';
//             validationFlag *= false;
//         }

//         if (!validationFlag) {
//             response.error = error;
//             response.message = 'Please check the errors';
//             res.status(400).json(response);
//             console.log(response);
//         }
//         else {
//             req.st.validateToken(req.query.token, function (err, tokenResult) {
//                 try {
//                     if ((!err) && tokenResult) {
//                         req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
//                         req.body.like_flag = req.body.like_flag ? req.body.like_flag : 0;

//                         if (req.query.isTallint) {

//                             // if (!req.query.HCUserId) {
//                             //     error.HCUserId = 'Invalid HCUserId';
//                             //     validationFlag *= false;
//                             // }

//                             if (!validationFlag) {
//                                 response.error = error;
//                                 response.message = 'Please check the errors';
//                                 res.status(400).json(response);
//                                 console.log(response);
//                             }
//                             else {
//                                 // pass api type to below function
//                                 req.query.type = 15;   // claim reward

//                                 fetchAPiUrl(req, function (err, urlData) {
//                                     if (!err && urlData && urlData.apiPath) {

//                                         // use this after getting url from tallint
//                                         var url = urlData.apiPath + "reward_type_code=" + req.query.rewardTypeCode  + "&reward_template_code=" + req.query.rewardTemplateCode + "&tn_id=" + req.query.tnId ? req.query.tnId :1 +"&user_id=" + req.query.HCUserId ? req.query.HCUserId :1 ;

//                                         console.log("lsdhxndoaihfg",urlData.apiPath)
//                                         console.log("url for Link" ,url);
//                                         console.log("type",urlData.method)
//                                         var input={};
                                  
//                                         request({
//                                             url: url,
//                                             method: urlData.method,
//                                             json: true,   // <--Very important!!!
//                                            //  body: input
//                                         }, function (err, resp, result) {   // result contains tallint response data
//                                             var err = null;
//                                            // var result = 1;
//                                             console.log("error", err);
//                                             console.log("datajdnhv", result);
//                                             try {
//                                                 if (!err && result) {
//                                                 //    result.data=result.data ? result.data[0] : result.data;

//                                                     // response.status = true;
//                                                     // response.message = "Data loaded successfully";
//                                                     // response.error = null;
//                                                     // response.data = result;
//                                                     response = result;
//                                                     if (req.query.isWeb == 1) {
//                                                         var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
//                                                         zlib.gzip(buf, function (_, result) {
//                                                             try {
//                                                                 response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
//                                                                 res.status(200).json(response);
//                                                             }
//                                                             catch (ex) {
//                                                                 console.log(ex);
//                                                                 error_logger.error = ex;
//                                                                 logger(req, error_logger);
//                                                                 res.status(500).json(error_response);
//                                                             }
//                                                         });
//                                                     }
//                                                     else {
//                                                         res.status(200).json(response);
//                                                     }
//                                                 }
//                                                 else if (!err) {
//                                                     response.status = true;
//                                                     response.message = "no results found";
//                                                     response.error = null;
//                                                     response.data = null;
//                                                     res.status(200).json(response);
//                                                 }
//                                                 else {
//                                                     response.status = false;
//                                                     response.message = "Error while getting data";
//                                                     response.error = null;
//                                                     response.data = null;
//                                                     res.status(500).json(response);
//                                                 }
//                                             }
//                                             catch (ex) {
//                                                 console.log("tallint Response", ex);
//                                                 error_logger.error = ex;
//                                                 logger(req, error_logger);
//                                                 res.status(500).json(error_response);
//                                             }
//                                         });
//                                     } else {
//                                         response.status = false;
//                                         response.message = "Error while getting data";
//                                         response.error = err;
//                                         response.data = null;
//                                         res.status(500).json(response);
//                                     }
//                                 })
//                             }
//                         } 
//                         else {
//                             response.status = true;
//                             response.message = "No Details Found";
//                             response.error = null;
//                             response.data = null;
//                             if (req.query.isWeb == 1) {
//                                 var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
//                                 zlib.gzip(buf, function (_, result) {
//                                     try {
//                                         response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
//                                         res.status(200).json(response);
//                                     }
//                                     catch (ex) {
//                                         console.log(ex);
//                                         error_logger.error = ex;
//                                         logger(req, error_logger);
//                                         res.status(500).json(error_response);
//                                     }
//                                 });
//                             }
//                             else {
//                                 res.status(200).json(response);
//                             }
//                         }
//                     }
//                     else {
//                         res.status(401).json(response);
//                     }
//                 }
//                 catch (ex) {
//                     console.log(ex);
//                     error_logger.error = ex;
//                     logger(req, error_logger);
//                     res.status(500).json(error_response);
//                 }
//             });
//         }
//     }

//     catch (ex) {
//         console.log(ex);
//         error_logger.error = ex;
//         logger(req, error_logger);
//         res.status(500).json(error_response);
//     }
// };


dataMigration.tallint_ER_ClaimReward = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_ER_ClaimReward'
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.like_flag = req.body.like_flag ? req.body.like_flag : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 15;   // claim reward

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath + "reward_type_code=" + req.query.reward_type_code + "&reward_template_code=" + req.query.reward_template_code + "&tn_id=" + (req.query.tn_id ? req.query.tn_id :1) + "&user_id=" + (req.query.HCUserId ? req.query.HCUserId :1 );

                                        console.log("d;sknf",urlData.apiPath)
                                        console.log("url for Link" ,url);
                                        console.log("type",urlData.method)
                                        var input={};
                                  
                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                           //  body: input
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            var err = null;
                                           // var result = 1;
                                            console.log("error", err);
                                            console.log("datajdnhv", result);
                                            try {
                                                if (!err && result) {
                                                //    result.data=result.data ? result.data[0] : result.data;

                                                    // response.status = true;
                                                    // response.message = "Data loaded successfully";
                                                    // response.error = null;
                                                    // response.data = result;
                                                    response = result;
                                                    if (req.query.isWeb == 1) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } 
                        else {
                            response.status = true;
                            response.message = "No Details Found";
                            response.error = null;
                            response.data = null;
                            if (req.query.isWeb == 1) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

dataMigration.tallint_ER_ReqDetails = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_ER_ReqDetails'
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.like_flag = req.body.like_flag ? req.body.like_flag : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 16;   // req Details

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath + "lng_id=" + req.query.lng_id + "&tn_id=" + (req.query.tn_id ? req.query.tn_id :1) +"&user_id" + (req.query.HCUserId ? req.query.HCUserId :1 );

                                        console.log("url for Link" ,url);
                                        console.log("type",urlData.method)
                                        var input={};
                                  
                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                           //  body: input
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            var err = null;
                                           // var result = 1;
                                            console.log("error", err);
                                            console.log("datajdnhv", result);
                                            try {
                                                if (!err && result) {
                                                //    result.data=result.data ? result.data[0] : result.data;

                                                    // response.status = true;
                                                    // response.message = "Data loaded successfully";
                                                    // response.error = null;
                                                    // response.data = result;
                                                    response = result;
                                                    if (req.query.isWeb == 1) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } 
                        else {
                            response.status = true;
                            response.message = "No Details Found";
                            response.error = null;
                            response.data = null;
                            if (req.query.isWeb == 1) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

dataMigration.tallint_ER_AppDetails = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_ER_AppDetails '
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.like_flag = req.body.like_flag ? req.body.like_flag : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 17;   // applicants Details

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath + "lng_id=" + req.query.lng_id + "&tn_id=" + (req.query.tn_id ? req.query.tn_id :1) + "&er_status_id=" + (req.query.status_id ? req.query.status_id:1) +"&user_id=" + (req.query.HCUserId ? req.query.HCUserId :1 );

                                        console.log("url for Link" ,url);
                                        console.log("type",urlData.method)
                                        var input={};
                                  
                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                           //  body: input
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            var err = null;
                                           // var result = 1;
                                            console.log("error", err);
                                            console.log("datajdnhv", result);
                                            try {
                                                if (!err && result) {
                                                //    result.data=result.data ? result.data[0] : result.data;

                                                    // response.status = true;
                                                    // response.message = "Data loaded successfully";
                                                    // response.error = null;
                                                    // response.data = result;
                                                    response = result;
                                                    if (req.query.isWeb == 1) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } 
                        else {
                            response.status = true;
                            response.message = "No Details Found";
                            response.error = null;
                            response.data = null;
                            if (req.query.isWeb == 1) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};


dataMigration.tallint_ER_Resume = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.tallint_ER_Resume '
        }
        var error = {};

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
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
                try {
                    if ((!err) && tokenResult) {
                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.body.like_flag = req.body.like_flag ? req.body.like_flag : 0;

                        if (req.query.isTallint) {

                            // if (!req.query.HCUserId) {
                            //     error.HCUserId = 'Invalid HCUserId';
                            //     validationFlag *= false;
                            // }

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                // pass api type to below function
                                req.query.type = 18;   // applicants Details

                                fetchAPiUrl(req, function (err, urlData) {
                                    if (!err && urlData && urlData.apiPath) {

                                        // use this after getting url from tallint
                                        var url = urlData.apiPath + "requisitionId=" + req.query.req_id +"&userId=" + (req.query.HCUserId ? req.query.HCUserId :1 );

                                        console.log("url for Link" ,url);
                                        console.log("type",urlData.method)
                                        var input={};
                                  
                                        request({
                                            url: url,
                                            method: urlData.method,
                                            json: true,   // <--Very important!!!
                                             body: req.body
                                        }, function (err, resp, result) {   // result contains tallint response data
                                            var err = null;
                                           // var result = 1;
                                            console.log("error", err);
                                            console.log("datajdnhv", result);
                                            try {
                                                if (!err && result) {
                                                //    result.data=result.data ? result.data[0] : result.data;

                                                    // response.status = true;
                                                    // response.message = "Data loaded successfully";
                                                    // response.error = null;
                                                    // response.data = result;
                                                    response = result;
                                                    if (req.query.isWeb == 1) {
                                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                        zlib.gzip(buf, function (_, result) {
                                                            try {
                                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                                res.status(200).json(response);
                                                            }
                                                            catch (ex) {
                                                                console.log(ex);
                                                                error_logger.error = ex;
                                                                logger(req, error_logger);
                                                                res.status(500).json(error_response);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.status(200).json(response);
                                                    }
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
                                                    response.message = "Error while getting data";
                                                    response.error = null;
                                                    response.data = null;
                                                    res.status(500).json(response);
                                                }
                                            }
                                            catch (ex) {
                                                console.log("tallint Response", ex);
                                                error_logger.error = ex;
                                                logger(req, error_logger);
                                                res.status(500).json(error_response);
                                            }
                                        });
                                    } else {
                                        response.status = false;
                                        response.message = "Error while getting data";
                                        response.error = err;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                })
                            }
                        } 
                        else {
                            response.status = true;
                            response.message = "No Details Found";
                            response.error = null;
                            response.data = null;
                            if (req.query.isWeb == 1) {
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    try {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    }
                                    catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }
                                });
                            }
                            else {
                                res.status(200).json(response);
                            }
                        }
                    }
                    else {
                        res.status(401).json(response);
                    }
                }
                catch (ex) {
                    console.log(ex);
                    error_logger.error = ex;
                    logger(req, error_logger);
                    res.status(500).json(error_response);
                }
            });
        }
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

dataMigration.hcNotification = function (req, res, next) {
    try {
        var error_logger = {
            details: 'dataMigration.hcNotification'
        }

        var error_response = {
            status: false,
            message: "Some error occurred!",
            error: null,
            data: null
        }
        var response = {
            status: false,
            message: "Invalid Token",
            data: null,
            error: null
        };

        var inputs = [
            req.st.db.escape(JSON.stringify(req.query || {})),
            req.st.db.escape(JSON.stringify(req.body || {}))
        ];
        var procQuery = 'CALL wm_save_hirecraftNotificationData( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, result) {
            if (!err && result) {
                response.status = true;
                response.message = "Data saved successfully";
                response.error = null;
                res.status(200).json(response);
            }
            else {
                response.status = false;
                response.message = "something went wrong";
                response.error = null;
                res.status(500).json(response);

            }
        });
    }

    catch (ex) {
        console.log(ex);
        error_logger.error = ex;
        logger(req, error_logger);
        res.status(500).json(error_response);
    }
};

module.exports = dataMigration;