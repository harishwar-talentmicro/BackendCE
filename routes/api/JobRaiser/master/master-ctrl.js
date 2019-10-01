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

var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey = CONFIG.DB.secretKey;

var masterCtrl = {};
var error = {};
var logger = require('../error-logger/error-log.js');
var request = require('request');

// whatmate-tallint integration function
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

masterCtrl.getReqMasterData = function (req, res, next) {


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
                // req.query.isTallint = 0; // Delete isTallint this line later
                console.log('req.query.isTallint', req.query.isTallint);
                console.log('req.query.HCUserId', req.query.HCUserId);

                if (req.query.isTallint == 1) {

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
                        req.query.type = 2;   // dashboard api

                        fetchAPiUrl(req, function (err, urlData) {
                            if (!err && urlData && urlData.apiPath) {

                                // use this after getting url from tallint
                                var url = urlData.apiPath;
                                console.log(url);
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
                                            response.message = "Tallint master data loaded successfully";
                                            response.error = null;
                                            result.data.scale = result.data.scale && result.data.scale != null ? result.data.scale : [{ scaleId: 1, scale: "Hundreds" }, { scaleId: 2, scale: "Lakhs" }];
                                            result.data.industry = result.data.industry && result.data.industry != null ? result.data.industry : [{ industryId: 43, title: "Software IT", industryTitle: "Software IT" }, { industryId: 44, title: "Business Development", industryTitle: "Business Development" }];
                                            result.data.teamMembers = [{ memberId: 1, displayName: "Hirecraft HC" }, { memberId: 1, displayName: "Hirecraft HC" }, { memberId: 43589, displayName: "Aauyush sharma" }, { memberId: 43589, displayName: "Aauyush sharma" }];
                                            
                                            // result.data.department = result.data.department && result.data.department.length!=0 ? result.data.department : [{ departmentId: 1, department: "Sales" }, { departmentId: 2, department: "Customer Support" }];

                                            // result.data.subDepartments = result.data.subDepartments && result.data.subDepartments.length!=0 ? result.data.subDepartments : [{ subDepartmentId: 1, subDepartment: "Sales Division A" }, { subDepartmentId: 2, subDepartment: "Customer Support Division A" }];

                                            // result.data.vertical = result.data.vertical && result.data.vertical.length!=0 ? result.data.vertical : [{ verticalId: 1, verticalTitle: "Test 10" }, { verticalId: 2, verticalTitle: "Test 11" }];

                                            response.data = result.data;
                                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                            zlib.gzip(buf, function (_, result) {
                                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                res.status(200).json(response);
                                            });
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

                                    } catch (ex) {
                                        console.log(ex);
                                        error_logger.error = ex;
                                        logger(req, error_logger);
                                        res.status(500).json(error_response);
                                    }

                                })
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

                    req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                    var inputs = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.query.purpose || 1)
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
                            var intRoundList = [];
                            if (isWeb) {
                                intRoundList = result[8] ? result[8] : [];
                            }
                            else {
                                intRoundList = result[13] ? result[13] : [];
                            }

                            response.data = {
                                heDepartment: (result && result[0]) ? result[0] : [],
                                jobType: (result && result[1]) ? result[1] : [],
                                currency: (result && result[2]) ? result[2] : [],
                                scale: (result && result[3]) ? result[3] : [],
                                duration: (result && result[4]) ? result[4] : [],
                                country: (result && result[5]) ? result[5] : [],
                                jobTitle: (result && result[6]) ? result[6] : [],
                                roleList: result[7] ? result[7] : [],
                                interviewRoundList: intRoundList,
                                status: result[9] ? result[9] : [],
                                requirementList: result[10] ? result[10] : [],
                                portalList: result[11] ? result[11] : [],
                                reasons: result[12] ? result[12] : [],
                                teamMembers: result[14] ? result[14] : [],
                                industry: result[15] ? result[15] : [],
                                functionalAreas: result[16] ? result[16] : []

                            };
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
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
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
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



    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    console.log(req.body);

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

                    var contactList = req.body.contactList;
                    if (typeof (contactList) == "string") {
                        contactList = JSON.parse(contactList);
                    }
                    if (!contactList) {
                        contactList = [];
                    }

                    var contracts = req.body.contracts;
                    if (typeof (contracts) == "string") {
                        contracts = JSON.parse(contracts);
                    }
                    if (!contracts) {
                        contracts = [];
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(JSON.stringify(heDepartment)),
                            req.st.db.escape(JSON.stringify(businessLocation)),
                            req.st.db.escape(JSON.stringify(contracts)),
                            req.st.db.escape(JSON.stringify(contactList))
                        ];
                        var procQuery = 'CALL wm_saveClientBusinessLocationContacts( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(err);

                            if (!err && results && results[0] && results[0][0]) {
                                response.status = true;
                                response.message = "Client saved sucessfully";
                                response.error = null;

                                results[1][0].clientCareerData = results[1] && results[1][0] && JSON.parse(results[1][0].clientCareerData) ? JSON.parse(results[1][0].clientCareerData) : {};

                                if (results[2] && results[2][0]) {
                                    for (var i = 0; i < results[2].length; i++) {

                                        results[2][i].location = results[2][i].location ? JSON.parse(results[2][i].location) : [];
                                    }
                                }

                                results[1][0].managers = JSON.parse(results[1][0].managers);
                                results[1][0].department = JSON.parse(results[1][0].department);
                                results[1][0].clientStatus = JSON.parse(results[1][0].clientStatus);


                                // contracts parsing
                                if (results[3] && results[3][0]) {
                                    var contracts = (results[3] && results[3][0]) ? JSON.parse(results[3][0].contracts) : [];
                                    if (contracts) {
                                        for (var j = 0; j < contracts.length; j++) {
                                            contracts[j].managers = JSON.parse(contracts[j].managers);
                                        }
                                    }
                                }

                                // client contact parsing
                                results[4][0].contactList = (results && results[4] && results[4][0]) ? JSON.parse(results[4][0].contactList) : [];

                                if (results[7] && results[7][0] && typeof (results[7][0].newClient) == 'string') {
                                    results[7][0].newClient = JSON.parse(results[7][0].newClient);
                                }

                                if (results[8] && results[8][0] && typeof (results[8][0]) == 'string') {
                                    for (var i = 0; i < results[8].length; i++) {
                                        results[8][i].followUpNotes = (results[8] && results[8][i]) ? JSON.parse(results[8][i].followUpNotes) : [];
                                    }
                                }

                                response.data = {
                                    heDepartmentId: results[0][0].heDepartmentId,
                                    // department: (results[1] && results[1][0]) ? results[1] : [],
                                    // client: (results[2] && results[2][0]) ? results[2] : [],

                                    heDepartment: results[1][0],
                                    businessLocation: results[2],
                                    contracts: contracts,//(result[2] && result[2][0]) ? JSON.parse(result[2][0].contracts) : []
                                    contactList: results[4][0].contactList,
                                    roles: results[5] ? results[5] : [],
                                    group: results[6] ? results[6] : [],
                                    newClient: results[7] ? results[7][0].newClient : {},
                                    followUpNotes: results[8] && results[8][0] ? results[8] : []
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
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

                if (req.query.isTallint == 1) {
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
                        req.query.type = 5;   // dashboard api

                        fetchAPiUrl(req, function (err, urlData) {
                            if (!err && urlData && urlData.apiPath) {

                                // use this after getting url from tallint
                                var url = urlData.apiPath;
                                console.log(url);
                                request({
                                    url: url,
                                    method: urlData.method,
                                    json: true,   // <--Very important!!!
                                    // body: dbResponse
                                }, function (err, resp, result) {   // result contains tallint response data
                                    console.log("error", err);
                                    try {
                                        if (!err && result && result.branchContacts) {
                                            response.status = true;
                                            response.message = "Data loaded successfully";
                                            response.error = null;
                                            response.data = result;
                                            console.log(response);
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
                                        else if (!err) {
                                            response.status = true;
                                            response.message = "no results found";
                                            response.error = null;
                                            response.data = {
                                                branchList: [],
                                                detailedBranchList: [],
                                                wBranchList: [],
                                                branch_contacts: []
                                            };
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
                                            response.status = false;
                                            response.message = "Error while getting data";
                                            response.error = err;
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
                                response.message = "Tallint url not configured";
                                response.error = err;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        })
                    }
                }
                else {
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
                                results[3][i].contactList = results[3][i].contactList ? JSON.parse(results[3][i].contactList) : [];
                            };

                            response.data = {
                                branchList: results[0] ? results[0] : [],
                                detailedBranchList: results[1] ? results[1] : [],
                                wBranchList: results[2] ? results[2] : [],
                                branch_contacts: results[3] ? results[3] : []
                            };

                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

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
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
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
    if (!req.query.heMasterId || req.query.heMasterId == 'null' || req.query.heMasterId == null) {
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
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.requirementId || 0)
                ];

                var procQuery = 'CALL wm_get_1010_mailtemplate( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    if (!err && result && result[0] || result[0][0] || result[1] || result[2] || result[5]) {
                        response.status = true;
                        response.message = "Mail template list loaded successfully";
                        response.error = null;

                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].cc = result[0][i] ? JSON.parse(result[0][i].cc) : [];
                            result[0][i].bcc = result[0][i] ? JSON.parse(result[0][i].bcc) : [];
                            result[0][i].attachment = result[0][i] ? JSON.parse(result[0][i].attachment) : [];

                        }
                        for (var i = 0; i < result[1].length; i++) {
                            result[1][i].cc = result[1][i] ? JSON.parse(result[1][i].cc) : [];
                            result[1][i].bcc = result[1][i] ? JSON.parse(result[1][i].bcc) : [];
                            result[1][i].attachment = result[1][i] ? JSON.parse(result[1][i].attachment) : [];
                        }

                        for (var i = 0; i < result[2].length; i++) {
                            result[2][i].cc = result[2][i] ? JSON.parse(result[2][i].cc) : [];
                            result[2][i].bcc = result[2][i] ? JSON.parse(result[2][i].bcc) : [];
                            result[2][i].attachment = result[2][i] ? JSON.parse(result[2][i].attachment) : [];
                        }

                        for (var i = 0; i < result[3].length; i++) {
                            result[3][i].cc = result[3][i] ? JSON.parse(result[3][i].cc) : [];
                            result[3][i].bcc = result[3][i] ? JSON.parse(result[3][i].bcc) : [];
                            result[3][i].attachment = result[3][i] ? JSON.parse(result[3][i].attachment) : [];
                        }

                        for (var i = 0; i < result[4].length; i++) {
                            result[4][i].cc = result[4][i] ? JSON.parse(result[4][i].cc) : [];
                            result[4][i].bcc = result[4][i] ? JSON.parse(result[4][i].bcc) : [];
                            result[4][i].attachment = result[4][i] ? JSON.parse(result[4][i].attachment) : [];
                        }

                        response.data = {
                            screeningMailer: result[0] ? result[0] : [],
                            submissionMailer: result[1] ? result[1] : [],
                            jobseekerMailer: result[2] ? result[2] : [],
                            clientMailer: result[3] ? result[3] : [],
                            interviewMailer: result[4] ? result[4] : [],
                            trackerTemplates: result[5] ? result[5] : [],

                            tags: {
                                candidate: result[6] ? result[6] : [],
                                requirement: result[7] ? result[7] : [],
                                client: result[8] ? result[8] : [],
                                general: result[9] ? result[9] : [],
                                clientContact: result[10] ? result[10] : [],
                                interview: result[11] ? result[11] : [],
                                billing: result[12] ? result[12] : [],
                                billingTable: result[13] ? result[13] : [],
                                offer: result[14] ? result[14] : []
                            },
                            interviewPanelMembers: result[15] && result[15][0] ? result[15] : []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = {
                            screeningMailer: [],
                            submissionMailer: [],
                            jobseekerMailer: [],
                            clientMailer: [],
                            interviewMailer: [],
                            trackerTemplates: []
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


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

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
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                        req.body.type = (req.body.type) ? req.body.type : 0;
                        req.body.subject = (req.body.subject) ? req.body.subject : '';
                        req.body.mailBody = (req.body.mailBody) ? req.body.mailBody : '';
                        req.body.replymailId = (req.body.replymailId) ? req.body.replymailId : '';
                        req.body.priority = (req.body.priority) ? req.body.priority : 0;
                        req.body.updateFlag = (req.body.updateFlag) ? req.body.updateFlag : 0;
                        req.body.SMSMessage = (req.body.SMSMessage) ? req.body.SMSMessage : '';
                        req.body.whatmateMessage = (req.body.whatmateMessage) ? req.body.whatmateMessage : '';
                        var templateId =  req.body.template && (req.body.template.templateId)  ? (req.body.template.templateId)  : req.body.templateId || 0;
                        var whatmateMessage = req.body.whatmateMessage || '';
                        var smsMsg = req.body.smsMsg || '';
                        var smsFlag = req.body.smsFlag || 0;
                        var tableTags = req.body.tableTags || {};
                        var trackerTemplate = req.body.trackerTemplate || {};

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(templateId),
                            req.st.db.escape(req.query.heMasterId),
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
                            req.st.db.escape(smsMsg),
                            req.st.db.escape(whatmateMessage),
                            req.st.db.escape(JSON.stringify(attachment)),
                            req.st.db.escape(JSON.stringify(tags)),
                            req.st.db.escape(JSON.stringify(stage)),
                            req.st.db.escape(req.body.mailerType),
                            req.st.db.escape(JSON.stringify(tableTags)),
                            req.st.db.escape(req.body.smsFlag || 0),
                            req.st.db.escape(req.body.attachJD || 0),
                            req.st.db.escape(req.body.attachResume || 0),
                            req.st.db.escape(req.body.interviewerFlag || 0),
                            req.st.db.escape(req.body.resumeFileName || ''),
                            req.st.db.escape(req.body.attachResumeFlag || 0),
                            req.st.db.escape(JSON.stringify(trackerTemplate)),
                            req.st.db.escape(req.body.isSingleMail || 0)
                        ];
                        var procQuery = 'CALL WM_save_1010_mailTemplate( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(err);
                            if (!err && results && results[0] && results[0][0] && results[0][0].templateId) {
                                response.status = true;
                                response.message = "Mail template saved successfully";
                                response.error = null;
                                response.data = {
                                    templateId: results[0][0].templateId
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

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
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
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



    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                    var stage = req.body.stage;
                    if (typeof (stage) == "string") {
                        stage = JSON.parse(stage);
                    }
                    if (!stage) {
                        stage = [];
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
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
                                for (var i = 0; i < results[0].length; i++) {
                                    results[0][i].status = JSON.parse(results[0][i].status) ? JSON.parse(results[0][i].status) : [];
                                }
                                response.data = {
                                    stage: results[0] ? results[0] : []
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
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

                });


            }
            else {
                res.status(401).json(response);
            }


        });
    }
};

masterCtrl.getRequirementView = function (req, res, next) {

    var error = {};
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

                if (req.query.isWeb == 1) {
                    if (tokenResult[0] && tokenResult[0].secretKey && tokenResult[0].secretKey != "") {
                        var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);


                        zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                            req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                            var validationFlag = true;

                            if (!validationFlag) {
                                response.error = error;
                                response.message = 'Please check the errors';
                                res.status(400).json(response);
                                console.log(response);
                            }
                            else {
                                req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                                req.query.status = (req.query.status) ? req.query.status : 0;
                                req.query.type = (req.query.type) ? req.query.type : 0;

                                var inputs = [
                                    req.st.db.escape(req.query.token),
                                    req.st.db.escape(req.query.status),
                                    req.st.db.escape(req.query.heMasterId),
                                    req.st.db.escape(req.query.type),
                                    req.st.db.escape(req.query.startPage || 0),
                                    req.st.db.escape(req.query.limit || 0),
                                    req.st.db.escape(JSON.stringify(req.body.heDepartmentId || [])),
                                    req.st.db.escape(req.query.search || ""),
                                    req.st.db.escape(JSON.stringify(req.body.webStatusFilter || [])),
                                    req.st.db.escape(req.query.isWeb || 0),
                                    req.st.db.escape(req.body.departmentTitle || ""),
                                    req.st.db.escape(req.body.branchName || ""),
                                    req.st.db.escape(req.body.jobCode || ""),
                                    req.st.db.escape(req.body.jobTitle || ""),
                                    req.st.db.escape(req.body.positions || 0),
                                    req.st.db.escape(req.body.positionsFilled || 0),
                                    req.st.db.escape(req.body.requirementTeam || ""),
                                    req.st.db.escape(req.body.notes || ""),
                                    req.st.db.escape(req.body.offeredCTC || 0),
                                    req.st.db.escape(req.body.joiningDate || null),
                                    req.st.db.escape(req.body.jobType || 0),
                                    req.st.db.escape(req.body.creatorName || ""),
                                    req.st.db.escape(req.body.createdDate || null)
                                ];

                                var procQuery = 'CALL wm_get_requirementView( ' + inputs.join(',') + ')';
                                console.log(procQuery);
                                req.db.query(procQuery, function (err, results) {
                                    console.log(err);

                                    if (!err && results && (results[0] || results[1])) {
                                        response.status = true;
                                        response.message = " Requirement View loaded sucessfully";
                                        response.error = null;
                                        var output = [];
                                        for (var i = 0; i < results[0].length; i++) {
                                            results[0][i].branchList = results[0][i].branchList && JSON.parse(results[0][i].branchList) ? JSON.parse(results[0][i].branchList) : [],
                                                results[0][i].contactList = results[0][i].contactList && JSON.parse(results[0][i].contactList) ? JSON.parse(results[0][i].contactList) : [],
                                                results[0][i].stageDetail = results[0][i].stageDetail && JSON.parse(results[0][i].stageDetail) ? JSON.parse(results[0][i].stageDetail) : [],
                                                results[0][i].followUpNotes = results[0][i].followUpNotes && JSON.parse(results[0][i].followUpNotes) ? JSON.parse(results[0][i].followUpNotes) : []
                                        }

                                        for (var i = 0; i < results[3].length; i++) {
                                            results[3][i].status = results[3] && results[3][i] && JSON.parse(results[3][i].status) ? JSON.parse(results[3][i].status) : [];
                                        }

                                        response.data = {
                                            requirementView: results[0] ? results[0] : [],
                                            requirementCount: (results[2] && results[2][0] && results[2][0].requirementCount) ? results[2][0].requirementCount : 0,
                                            stageList: results[3] && results[3][0] ? results[3] : []
                                        };
                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                        zlib.gzip(buf, function (_, result) {
                                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                            res.status(200).json(response);
                                        });

                                    }
                                    else if (!err) {
                                        response.status = true;
                                        response.message = " Requirement View is empty";
                                        response.error = null;
                                        response.data = {
                                            requirementView: [],
                                            stageList: (results && results[2] && results[2][0]) && results[2][0].stageList ? JSON.parse(results[2][0].stageList) : []

                                        };
                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                        zlib.gzip(buf, function (_, result) {
                                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                            res.status(200).json(response);
                                        });
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

                        });
                    }
                    else {
                        response.message = "Session expired.! Please re-login";
                        res.status(401).json(response);
                        return;
                    }
                }
                else {
                    // req.query.isTallint = 0; // Delete isTallint this line later
                    if (req.query.isTallint == 1) {
                        var validationFlag = true;

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
                            req.query.type = 6;   // requirement view
                            console.log("Tallint here")
                            fetchAPiUrl(req, function (err, urlData) {
                                console.log(err);
                                if (!err && urlData && urlData.apiPath) {

                                    req.query.startPage = req.query.startPage ? req.query.startPage : 1;
                                    req.query.limit = req.query.limit ? req.query.limit : 20;
                                    req.query.status = req.query.status ? req.query.status : 0;

                                    // use this after getting url from tallint
                                    var url = urlData.apiPath + 'status=' + req.query.status + '&startpage=' + req.query.startPage + '&limit=' + req.query.limit;
                                    console.log(url);
                                    request({
                                        url: url,
                                        method: urlData.method,
                                        json: true,   // <--Very important!!!
                                        // body: req.body
                                    }, function (err, resp, result) {   // result contains tallint response data
                                        console.log("error", err);
                                        try {
                                            if (!err && result && result.data) {
                                                var requirementView = [];
                                                if (result.data && result.data.requirementList && result.data.requirementList.length) {
                                                    var reqList = result.data.requirementList;
                                                    for (var i = 0; i < reqList.length; i++) {

                                                        if (reqList[i].title && reqList[i].title != "" && reqList[i].title != "null" && reqList[i].title != null && reqList[i].title != " ") {
                                                            var obj = {};
                                                            obj.parentId = reqList[i].ReqId;
                                                            obj.transId = reqList[i].transId ? reqList[i].transId : 0;
                                                            obj.heDepartmentId = reqList[i].hedepartmentId ? reqList[i].hedepartmentId : 0;
                                                            obj.positions = reqList[i].positions ? reqList[i].positions : 0;
                                                            obj.positionsFilled = reqList[i].positionsFilled ? reqList[i].positionsFilled : 0;
                                                            obj.departmentTitle = reqList[i].heDepartmentTitle ? reqList[i].heDepartmentTitle : "";
                                                            obj.jobCode = reqList[i].jobCode ? reqList[i].jobCode : "";
                                                            obj.jobtitleId = reqList[i].jobtitleId ? reqList[i].jobtitleId : 0;
                                                            obj.title = reqList[i].title ? reqList[i].title : "";
                                                            obj.jobtypeid = reqList[i].jobtypeid ? reqList[i].jobtypeid : 0;
                                                            obj.jobType = reqList[i].jobType ? reqList[i].jobType : "";
                                                            obj.jobDescription = reqList[i].jobDescription ? reqList[i].jobDescription : "";
                                                            obj.keywords = reqList[i].keywords ? reqList[i].keywords : "";
                                                            obj.creatorName = reqList[i].creatorName ? reqList[i].creatorName : "";
                                                            obj.createdDate = reqList[i].createdDate ? moment(reqList[i].createdDate).format("YYYY-MM-DD HH:mm:ss") : null;

                                                            var stageDetail = [];
                                                            stageDetail.push({
                                                                stageId: reqList[i].screeningStageId ? reqList[i].screeningStageId : 0,
                                                                title: reqList[i].screeningStage ? reqList[i].screeningStage : "",
                                                                applicant: reqList[i].screeningCount ? reqList[i].screeningCount : 0,
                                                                colorCode: reqList[i].colorCode ? reqList[i].colorCode : "#C71585"
                                                            }, {
                                                                    stageId: reqList[i].shortlistStageId ? reqList[i].shortlistStageId : 0,
                                                                    title: reqList[i].shortlistStage ? reqList[i].shortlistStage : "",
                                                                    applicant: reqList[i].shortlistCount ? reqList[i].shortlistCount : 0,
                                                                    colorCode: reqList[i].colorCode ? reqList[i].colorCode : "#C71585"
                                                                }, {
                                                                    stageId: reqList[i].interviewStageId ? reqList[i].interviewStageId : 0,
                                                                    title: reqList[i].interviewStage ? reqList[i].interviewStage : "",
                                                                    applicant: reqList[i].interviewCount ? reqList[i].interviewCount : 0,
                                                                    colorCode: reqList[i].colorCode ? reqList[i].colorCode : "#C71585"
                                                                }, {
                                                                    stageId: reqList[i].joinedStageId ? reqList[i].joinedStageId : 0,
                                                                    title: reqList[i].joinedStage ? reqList[i].joinedStage : "",
                                                                    applicant: reqList[i].joinedCount ? reqList[i].joinedCount : 0,
                                                                    colorCode: reqList[i].colorCode ? reqList[i].colorCode : "#C71585"
                                                                }, {
                                                                    stageId: reqList[i].offerStageId ? reqList[i].offerStageId : 0,
                                                                    title: reqList[i].offerStage ? reqList[i].offerStage : "",
                                                                    applicant: reqList[i].offerCount ? reqList[i].offerCount : 0,
                                                                    colorCode: reqList[i].colorCode ? reqList[i].colorCode : "#C71585"
                                                                })
                                                            obj.stageDetail = stageDetail;

                                                            let stageList = [];

                                                            if (reqList[i].master_stages && reqList[i].master_stages != "" && typeof (reqList[i].master_stages) == "string") {
                                                                reqList[i].master_stages = JSON.parse(reqList[i].master_stages);
                                                            }
                                                            else if (reqList[i].master_stages && reqList[i].master_stages != "") {
                                                                reqList[i].master_stages = reqList[i].master_stages;
                                                            }
                                                            else {
                                                                reqList[i].master_stages = [];
                                                            }

                                                            for (var k = 0; k < reqList[i].master_stages.length; k++) {
                                                                var stageObj = {};
                                                                stageObj.stageId = reqList[i].master_stages[k].stage_id ? reqList[i].master_stages[k].stage_id : 0;
                                                                stageObj.colorCode = "#C71585";
                                                                stageObj.stageTitle = reqList[i].master_stages[k].stage_title ? reqList[i].master_stages[k].stage_title : "No-title";
                                                                stageObj.stageTypeId = reqList[i].master_stages[k].stage_type ? reqList[i].master_stages[k].stage_type : 1;
                                                                stageList.push(stageObj);
                                                            }
                                                            obj.stageList = stageList;

                                                            requirementView.push(obj);
                                                        }
                                                    }
                                                }
                                                else {
                                                    requirementView = [];
                                                }

                                                var stageList = [];
                                                if (result.data && result.data.stageList && result.data.stageList.length) {
                                                    var stageListTemp = result.data.stageList;
                                                    for (var i = 0; i < stageListTemp.length; i++) {

                                                        var statusList = [];
                                                        var statusListTemp = stageListTemp[i].statusList ? stageListTemp[i].statusList : [];
                                                        for (var j = 0; j < statusListTemp.length; j++) {
                                                            if (statusListTemp[j].statusId) {
                                                                statusList.push({
                                                                    statusId: statusListTemp[j].statusId ? statusListTemp[j].statusId : 0,
                                                                    statusName: statusListTemp[j].statusName ? statusListTemp[j].statusName : ""
                                                                })
                                                            }
                                                        }

                                                        stageList.push({
                                                            stageId: stageListTemp[i].stageLevel ? stageListTemp[i].stageLevel : 0,
                                                            stageTitle: stageListTemp[i].stageTitle ? stageListTemp[i].stageTitle : "",
                                                            stageTypeId: stageListTemp[i].stageTypeId ? stageListTemp[i].stageTypeId : stageListTemp[i].stageLevel,
                                                            statusList: statusList
                                                        });
                                                    }
                                                }

                                                var reqCount = 0;
                                                if (result.data && result.data.count) {
                                                    reqCount = result.data.count
                                                }


                                                response.status = true;
                                                response.message = "Data loaded successfully";
                                                response.error = null;
                                                response.data = {
                                                    requirementView: requirementView,
                                                    requirementCount: reqCount,
                                                    stageList: stageList
                                                };

                                                // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                // zlib.gzip(buf, function (_, result) {
                                                //     try {
                                                //         response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                res.status(200).json(response);
                                                //     }
                                                //     catch (ex) {
                                                //         console.log(ex);
                                                //         error_logger.error = ex;
                                                //         logger(req, error_logger);
                                                //         res.status(500).json(error_response);
                                                //     }
                                                // });
                                            }
                                            else if (!err) {
                                                response.status = true;
                                                response.message = "no results found";
                                                response.error = null;
                                                response.data = {
                                                    requirementView: [],
                                                    requirementCount: 0,
                                                    stageList: []
                                                };
                                                // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                                // zlib.gzip(buf, function (_, result) {
                                                //     try {
                                                //         response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                                res.status(200).json(response);
                                                //     }
                                                //     catch (ex) {
                                                //         console.log(ex);
                                                //         error_logger.error = ex;
                                                //         logger(req, error_logger);
                                                //         res.status(500).json(error_response);
                                                //     }
                                                // });

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
                                    response.status = false;
                                    response.message = "Tallint api not configured";
                                    response.error = null;
                                    response.data = null;
                                    res.status(200).json(response);
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
                        var validationFlag = true;
                        if (!validationFlag) {
                            response.error = error;
                            response.message = 'Please check the errors';
                            res.status(400).json(response);
                            console.log(response);
                        }
                        else {
                            req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                            req.query.status = (req.query.status) ? req.query.status : 0;
                            req.query.type = (req.query.type) ? req.query.type : 0;

                            var inputs = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.query.status),
                                req.st.db.escape(req.query.heMasterId),
                                req.st.db.escape(req.query.type),
                                req.st.db.escape(req.query.startPage || 1),
                                req.st.db.escape(req.query.limit || 20),
                                req.st.db.escape(JSON.stringify(req.body.heDepartmentId || [])),
                                req.st.db.escape(req.query.search || ""),
                                req.st.db.escape(JSON.stringify(req.body.webStatusFilter || [])),
                                req.st.db.escape(req.query.isWeb || 0),
                                req.st.db.escape(req.body.departmentTitle || ""),
                                req.st.db.escape(req.body.branchName || ""),
                                req.st.db.escape(req.body.jobCode || ""),
                                req.st.db.escape(req.body.jobTitle || ""),
                                req.st.db.escape(req.body.positions || 0),
                                req.st.db.escape(req.body.positionsFilled || 0),
                                req.st.db.escape(req.body.requirementTeam || ""),
                                req.st.db.escape(req.body.notes || ""),
                                req.st.db.escape(req.body.offeredCTC || 0),
                                req.st.db.escape(req.body.joiningDate || null),
                                req.st.db.escape(req.body.jobType || 0),
                                req.st.db.escape(req.body.creatorName || ""),
                                req.st.db.escape(req.body.createdDate || null)
                            ];

                            var procQuery = 'CALL wm_get_requirementView( ' + inputs.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, results) {
                                console.log(err);

                                if (!err && results && (results[0] || results[1])) {
                                    response.status = true;
                                    response.message = " Requirement View loaded sucessfully";
                                    response.error = null;
                                    var output = [];

                                    for (var i = 0; i < results[3].length; i++) {
                                        results[3][i].status = results[3] && results[3][i] && JSON.parse(results[3][i].status) ? JSON.parse(results[3][i].status) : [];
                                    }

                                    for (var i = 0; i < results[0].length; i++) {
                                        results[0][i].branchList = results[0][i].branchList && JSON.parse(results[0][i].branchList) ? JSON.parse(results[0][i].branchList) : [],
                                            results[0][i].contactList = results[0][i].contactList && JSON.parse(results[0][i].contactList) ? JSON.parse(results[0][i].contactList) : [],
                                            results[0][i].stageDetail = results[0][i].stageDetail && JSON.parse(results[0][i].stageDetail) && JSON.parse(results[0][i].stageDetail)[0].applicant != 0 && JSON.parse(results[0][i].stageDetail)[0].stageId != null ? JSON.parse(results[0][i].stageDetail) : [],
                                            results[0][i].followUpNotes = results[0][i].followUpNotes && JSON.parse(results[0][i].followUpNotes) ? JSON.parse(results[0][i].followUpNotes) : [],
                                            results[0][i].stageList = results[3] && results[3][0] ? results[3] : []
                                    }

                                    response.data = {
                                        requirementView: results[0] ? results[0] : [],
                                        requirementCount: (results[2] && results[2][0] && results[2][0].requirementCount) ? results[2][0].requirementCount : 0,
                                        stageList: results[3] && results[3][0] ? results[3] : []
                                    };

                                    // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    // zlib.gzip(buf, function (_, result) {
                                    //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                    // });

                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = " Requirement View is empty";
                                    response.error = null;
                                    response.data = {
                                        requirementView: [],
                                        stageList: (results && results[2] && results[2][0]) && results[2][0].stageList ? JSON.parse(results[2][0].stageList) : []
                                    };
                                    // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    // zlib.gzip(buf, function (_, result) {
                                    //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                    // });
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
                    }
                }
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

                var decryptBuf = '';
                if (tokenResult[0] && tokenResult[0].secretKey && tokenResult[0].secretKey != "") {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);

                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                        if (!validationFlag) {
                            response.error = error;
                            response.message = 'Please check the errors';
                            res.status(400).json(response);
                            console.log(response);
                        }
                        else {
                            req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
                            req.query.type = (req.query.type) ? req.query.type : 3;

                            var inputs = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.query.heMasterId),
                                req.st.db.escape(DBSecretKey),
                                req.st.db.escape(req.query.type),
                                req.st.db.escape(req.query.startPage || 0),
                                req.st.db.escape(req.query.limit || 0),
                                req.st.db.escape(req.query.search || ""),
                                req.st.db.escape(req.body.clientName || ""),
                                req.st.db.escape(req.body.notes || ""),
                                req.st.db.escape(req.body.status || ""),
                                req.st.db.escape(req.body.followUpNotes || ""),
                                req.st.db.escape(req.body.createdUserName || ""),
                                req.st.db.escape(req.body.createdDate || null),
                                req.st.db.escape(JSON.stringify(req.body.clientStatusId || []))
                            ];

                            var procQuery = 'CALL wm_get_clientView( ' + inputs.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, results) {
                                console.log(err);

                                if (!err && results && results[0]) {
                                    response.status = true;
                                    response.message = " Client View loaded sucessfully";
                                    response.error = null;
                                    for (var i = 0; i < results[0].length; i++) {
                                        results[0][i].stageDetail = results[0][i].stageDetail ? JSON.parse(results[0][i].stageDetail) : [],
                                            results[0][i].clientContacts = results[0][i] && JSON.parse(results[0][i].clientContacts) ? JSON.parse(results[0][i].clientContacts) : [];
                                        results[0][i].branchList = results[0][i] && JSON.parse(results[0][i].branchList) ? JSON.parse(results[0][i].branchList) : [];
                                        results[0][i].followUpNotes = results[0][i] && JSON.parse(results[0][i].followUpNotes) ? JSON.parse(results[0][i].followUpNotes) : [];

                                    }
                                    response.data = {
                                        clientView: results[0] ? results[0] : [],
                                        clientCount: results[1] && results[1][0] && results[1][0].clientCount ? results[1][0].clientCount : 0
                                    };
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
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

                    });

                }
                else {
                    response.message = "Session expired.! Please re-login";
                    res.status(401).json(response);
                    return;
                }

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

    var trackerTemplate = req.body.trackerTemplate;
    if (typeof (trackerTemplate) == "string") {
        trackerTemplate = JSON.parse(trackerTemplate);
    }
    if (!trackerTemplate) {
        trackerTemplate = {};
        trackerTags = [];
    }
    else {
        trackerTags = JSON.parse(trackerTemplate.trackerTags);
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
                    req.st.db.escape(JSON.stringify(clientContacts)),
                    req.st.db.escape((trackerTemplate.trackerTags))

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
                var procQuery;
                if (req.body.mailerType == 4)
                    procQuery = 'CALL wm_get_clientDetailsByTags( ' + inputs.join(',') + ')';
                else
                    procQuery = 'CALL wm_get_detailsByTags1( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);
                    console.log(result);
                    if (!err && result) {
                        var temp = mailBody;
                        if (req.body.mailerType == 4) {
                            for (var clientIndex = 0; clientIndex < clientContacts.length; clientIndex++) {
                                // for (var applicantIndex = 0; applicantIndex < idArray.length; applicantIndex++) {


                                //     for (var tagIndex = 0; tagIndex < tags.client.length; tagIndex++) {
                                //         mailBody = mailBody.replace('[client.' + tags.client[tagIndex].tagName + ']', result[2][applicantIndex][tags.client[tagIndex].tagName]);
                                //     }
                                // }
                                for (var tagIndex = 0; tagIndex < tags.clientContacts.length; tagIndex++) {
                                    mailBody = mailBody.replace('[contact.' + tags.clientContacts[tagIndex].tagName + ']', result[0][clientIndex][tags.clientContacts[tagIndex].tagName]);
                                    console.log('result=', result[0]);
                                    console.log('result[8][k]=', result[0][clientIndex]);
                                }

                                // if (tableTags.applicant.length > 0) {
                                //     var position = mailBody.indexOf('@table');
                                //     var tableContent = '';
                                //     mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                //     tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                //     console.log(tableContent, 'mailbody');
                                //     for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                //         tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px;">' + tableTags.applicant[tagCount].displayTagAs + "</th>";
                                //     }
                                //     tableContent += "</tr>";
                                //     for (var candidateCount = 0; candidateCount < result[5].length; candidateCount++) {
                                //         tableContent += "<tr>";
                                //         for (var tagCount = 0; tagCount < tableTags.applicant.length; tagCount++) {
                                //             tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + result[5][candidateCount][tableTags.applicant[tagCount].tagName] + "</td>";
                                //         }
                                //         tableContent += "</tr>";
                                //     }

                                //     tableContent += "</table>";
                                //     mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');

                                // }

                                mailbody_array.push(mailBody);
                                mailBody = temp;
                            }
                        }
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
                        if (result[1] && result[1][0]) {
                            for (var i = 0; i < result[1].length; i++) {

                                result[1][i].location = result[1][i].location ? JSON.parse(result[1][i].location) : [];
                            }
                        }

                        for (var i = 0; i < result[4].length; i++) {
                            result[4][i].followUpNotes = (result[4] && result[4][i]) ? JSON.parse(result[4][i].followUpNotes) : [];
                        }

                        result[0][0].managers = result[0][0] && JSON.parse(result[0][0].managers) ? JSON.parse(result[0][0].managers) : {};
                        result[0][0].department = result[0][0] && JSON.parse(result[0][0].department) ? JSON.parse(result[0][0].department) : {};
                        result[0][0].clientStatus = result[0][0] && JSON.parse(result[0][0].clientStatus) ? JSON.parse(result[0][0].clientStatus) : {};
                        result[0][0].clientCareerData = result[0] && result[0][0] && JSON.parse(result[0][0].clientCareerData) ? JSON.parse(result[0][0].clientCareerData) : {};


                        // contracts parsing
                        if (result[2] && result[2][0]) {
                            var contracts = (result[2] && result[2][0]) ? JSON.parse(result[2][0].contracts) : [];
                            if (contracts) {
                                for (var j = 0; j < contracts.length; j++) {
                                    contracts[j].managers = JSON.parse(contracts[j].managers);
                                }
                            }
                        }

                        // client contact parsing
                        result[3][0].contactList = (result && result[3] && result[3][0]) ? JSON.parse(result[3][0].contactList) : [];

                        if (result[5]) {
                            for (var k = 0; k < result[5].length; k++) {
                                result[5][k].attachment = result[5] && result[5][k] && result[5][k].attachment && JSON.parse(result[5][k].attachment) ? JSON.parse(result[5][k].attachment) : [];
                                result[5][k].bcc = result[5] && result[5][k] && JSON.parse(result[5][k].bcc) ? JSON.parse(result[5][k].bcc) : [];
                                result[5][k].cc = result[5] && result[5][k] && JSON.parse(result[5][k].cc) ? JSON.parse(result[5][k].cc) : [];
                            }
                        }

                        response.data = {
                            heDepartment: result[0][0],
                            businessLocation: result[1],
                            contracts: contracts,//(result[2] && result[2][0]) ? JSON.parse(result[2][0].contracts) : []
                            contactList: result[3][0].contactList,
                            followUpNotes: result[4] && result[4][0] ? result[4] : [],
                            mailHistory: result[5] && result[5][0] ? result[5] : []
                        };

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            heDepartment: {},
                            businessLocation: [],
                            contracts: [],
                            contactList: []
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

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the error';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                    var question = req.body.question;
                    if (typeof (question) == "string") {
                        question = JSON.parse(question);
                    }
                    if (!question) {
                        question = [];
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
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
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });

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
                            res2.questionType = result[1][i].questionType ? JSON.parse(result[1][i].questionType) : {};
                            output.push(res2);
                        }
                        response.data = {
                            assessmentId: result[0][0].assessmentId ? result[0][0].assessmentId : 0,
                            assessmentTitle: result[0][0].assessmentTitle ? result[0][0].assessmentTitle : "",
                            question: output ? output : []
                        };

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
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
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
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
    console.log('inside user manager');
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
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                    var accessRights = req.body.accessRights;
                    if (typeof (accessRights) == "string") {
                        accessRights = JSON.parse(accessRights);
                    }
                    if (!accessRights) {
                        accessRights = {};
                    }

                    var reportingTo = req.body.reportingTo;
                    if (typeof (reportingTo) == "string") {
                        reportingTo = JSON.parse(reportingTo);
                    }
                    if (!reportingTo) {
                        reportingTo = [];
                    }

                    var branch = req.body.branch;
                    if (typeof (branch) == "string") {
                        branch = JSON.parse(branch);
                    }
                    if (!branch) {
                        branch = {};
                    }

                    var department = req.body.department;
                    if (typeof (department) == "string" && department != "") {
                        department = JSON.parse(department);
                    }
                    if (!department || department == "") {
                        department = {};
                    }

                    var grade = req.body.grade;
                    if (typeof (grade) == "string") {
                        grade = JSON.parse(grade);
                    }
                    if (!grade) {
                        grade = {};
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {

                        req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;
                        req.query.apiKey = req.query.apiKey ? req.query.apiKey : 0;
                        req.body.userMasterId = req.body.userMasterId ? req.body.userMasterId : 0;
                        req.body.status = req.body.status ? req.body.status : false;
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
                        req.body.exitDate = req.body.exitDate ? req.body.exitDate : null;
                        req.body.password = req.body.password ? req.body.password : '';
                        var encryptPwd = req.st.hashPassword(req.body.password);
                        req.body.mailer = req.body.mailer ? req.body.mailer : 2;

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
                            req.st.db.escape(JSON.stringify(department)),
                            req.st.db.escape(req.body.location),
                            req.st.db.escape(JSON.stringify(grade)),
                            req.st.db.escape(req.body.workGroupId),
                            req.st.db.escape(req.body.RMId),
                            req.st.db.escape(req.body.exitDate),
                            req.st.db.escape(req.body.joiningDate),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(encryptPwd),
                            req.st.db.escape(req.body.mailer),
                            req.st.db.escape(JSON.stringify(branch)),
                            req.st.db.escape(req.body.EZEOneId)
                        ];
                        var procQuery = 'CALL save_Pace_User( ' + inputs.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(err);

                            if (!err && results && results[0] && results[0][0].message) {
                                response.status = true;
                                response.message = "User data saved sucessfully";
                                response.error = null;

                                results[1][0].jobTitle = (results[1][0].jobTitle && JSON.parse(results[1][0].jobTitle).jobTitleId) ? JSON.parse(results[1][0].jobTitle) : {};

                                results[1][0].userType = (results[1][0].userType && JSON.parse(results[1][0].userType).userTypeId) ? JSON.parse(results[1][0].userType) : {};

                                results[1][0].transferredTo = (results[1][0].transferredTo && JSON.parse(results[1][0].transferredTo).transferredToUserId) ? JSON.parse(results[1][0].transferredTo) : {};

                                results[1][0].reportingTo = results[1][0].reportingTo ? JSON.parse(results[1][0].reportingTo) : [];

                                results[1][0].accessRights = (results[1][0].accessRights && JSON.parse(results[1][0].accessRights).templateId) ? JSON.parse(results[1][0].accessRights) : {};

                                results[1][0].department = (results[1][0].department && JSON.parse(results[1][0].department).departmentId) ? JSON.parse(results[1][0].department) : {};

                                results[1][0].branch = (results[1][0].branch && JSON.parse(results[1][0].branch).branchId) ? JSON.parse(results[1][0].branch) : {};

                                results[1][0].grade = (results[1][0].grade && JSON.parse(results[1][0].grade).gradeId) ? JSON.parse(results[1][0].grade) : {};

                                response.data = {
                                    userDetail: results[1][0] ? results[1][0] : {}
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }

                            else if (!err && results && results[0] && results[0][0].error) {
                                response.status = false;
                                response.message = results[0][0].error;
                                response.error = results[0][0].error;
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
                            groupTypes: result[0]
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "No results found";
                        response.error = null;
                        response.data = {
                            groupTypes: []
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

                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));



                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;

                        var inputs = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.query.heMasterId),
                            req.st.db.escape(JSON.stringify(req.body.groupTypes || []))
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
                                    groupTypes: results[0]
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
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

                });


            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


masterCtrl.jobCodeGeneration = function (req, res, next) {
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_paceJobCode_generation( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "New Jobcode is generated ";
                        response.error = null;

                        response.data = result[0][0];
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }

                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while generating Jobcode";
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


masterCtrl.getportalRequirementReport = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    // if (!req.query.token) {
    //     error.token = 'Invalid token';
    //     validationFlag *= false;
    // }

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
        // req.st.validateToken(req.query.token, function (err, tokenResult) {
        //     if ((!err) && tokenResult) {
        req.query.isWeb = (req.query.isWeb) ? req.query.isWeb : 0;
        req.query.type = (req.query.type) ? req.query.type : 1;

        var inputs = [
            req.st.db.escape(req.query.token),
            req.st.db.escape(req.query.heMasterId),

            req.st.db.escape(req.query.type)

        ];
        var procQuery = 'CALL wm_get_requirementDataWiseReport( ' + inputs.join(',') + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, results) {
            console.log(err);

            if (!err && results && results[0] || results[1] || results[2] || results[3] || results[4]) {
                response.status = true;
                response.message = " Report loaded sucessfully";
                response.error = null;

                for (var i = 0; i < results[7].length; i++) {
                    results[7][i].anchor = results[7] && results[7][i] && JSON.parse(results[7][i].anchor) && JSON.parse(results[7][i].anchor).userMasterId ? JSON.parse(results[7][i].anchor) : {};
                    results[7][i].venue = results[7] && results[7][i] && JSON.parse(results[7][i].venue) && JSON.parse(results[7][i].venue).locationId ? JSON.parse(results[7][i].venue) : {};
                }

                response.data = {
                    industry: results[0] ? results[0] : [],
                    function: results[1] ? results[1] : [],
                    location: results[2] ? results[2] : [],
                    jobtype: results[3] ? results[3] : [],
                    clients: results[4] ? results[4] : [],
                    clientCount: results[5] && results[5][0] && results[5][0].clientCount ? results[5][0].clientCount : 0,
                    jobList: results[6] ? results[6] : [],
                    eventList: results[7] ? results[7] : []
                }
                res.status(200).json(response);
            }

            else {
                response.status = false;
                response.message = "Error while loading report";
                response.error = null;
                response.data = null;
                res.status(500).json(response);
            }

        });

        //     }
        //     else {
        //         res.status(401).json(response);
        //     }


        // });
    }
};


masterCtrl.jobCodeGenerationMobile = function (req, res, next) {
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
                req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

                var inputs = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)
                ];

                var procQuery = 'CALL wm_paceJobCode_generation( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "New Jobcode is generated ";
                        response.error = null;

                        response.data = result[0][0];
                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                        // });
                    }

                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while generating Jobcode";
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


masterCtrl.jobCodeValidation = function (req, res, next) {
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

    if (!req.query.jobCode) {
        error.jobCode = 'Invalid jobCode';
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
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.jobCode)
                ];

                var procQuery = 'CALL wm_get_validateRequirementJobCode( ' + inputs.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    console.log(err);

                    if (!err && result && result[0] && result[0][0] && result[0][0].isValid == 1) {
                        response.status = true;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else if (!err && result && result[0] && result[0][0] && result[0][0].isValid == 0) {
                        response.status = false;
                        response.message = result[0][0].message;
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "No result found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }

                    else {
                        response.status = false;
                        response.message = "Error while checking Jobcode";
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
