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
                                                    result[0].bgColorCode = "#C71585";
                                                    result[0].companyLogo = "dbf89bcf-836a-48ba-94c2-6eecd50f30b7.png";
                                                    response.status = true;
                                                    response.message = "Data loaded successfully";
                                                    response.error = null;
                                                    response.data = {
                                                        tallintDashboardData: result[0]
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
                                                console.log(ex);
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

module.exports = dataMigration;