/**
 * Created by Jana1 on 31-08-2017.
 */

var companyCtrl = {};
var error = {};


var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

companyCtrl.searchComapny = function(req,res,next){
    var response = {
        status : false,
        message : "Error while searching company",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                req.query.keywords = req.query.keywords ? req.query.keywords : "";
                req.query.userType = req.query.userType ? req.query.userType : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.userType),
                    req.st.db.escape(req.query.keywords),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_checkMember( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,companyResult){
                    if(!err && companyResult && companyResult[0] && companyResult[0][0]){
                        var output = [];
                        for(var i = 0; i < companyResult[0].length; i++) {
                            var res1 = {};
                            res1.HEUserId = companyResult[0][i].HEUserId;
                            res1.HEMasterId = companyResult[0][i].HEMasterId;
                            res1.departmentId = companyResult[0][i].departmentId;
                            res1.departmentTitle = companyResult[0][i].departmentTitle;
                            res1.departments = companyResult[0][i].departments ? JSON.parse(companyResult[0][i].departments) : [];
                            res1.gradeId = companyResult[0][i].gradeId;
                            res1.gradeTitle = companyResult[0][i].gradeTitle;
                            res1.grades = companyResult[0][i].grades ? JSON.parse(companyResult[0][i].grades) : [];
                            res1.locationId = companyResult[0][i].locationId;
                            res1.locationTitle = companyResult[0][i].locationTitle;
                            res1.locations = companyResult[0][i].locations ? JSON.parse(companyResult[0][i].locations) : [];
                            res1.type = companyResult[0][i].type;
                            res1.code = companyResult[0][i].code;
                            res1.notes = companyResult[0][i].notes;
                            res1.displayName = companyResult[0][i].displayName;
                            output.push(res1);
                        }

                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            company : output
                        };

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = {
                            company : []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }


};

companyCtrl.joinComapny = function(req,res,next){
    var response = {
        status : false,
        message : "Error while searching company",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.WMId) {
                        error.WMId = 'Invalid WMId';
                        validationFlag *= false;
                    }
                
                    if (!validationFlag){
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.HEUserId = req.body.HEUserId ? req.body.HEUserId : 0;
                        req.body.notes = req.body.notes ? req.body.notes : '';
                        req.body.code = req.body.code ? req.body.code : '';
        
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.HEUserId),
                            req.st.db.escape(req.body.WMId),
                            req.st.db.escape(req.body.userType),
                            req.st.db.escape(req.body.code),
                            req.st.db.escape(req.body.departmentId),
                            req.st.db.escape(req.body.gradeId),
                            req.st.db.escape(req.body.locationId),
                            req.st.db.escape(req.body.notes)
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL he_join_company( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery,function(err,companyResult){
                            if(!err && companyResult && companyResult[0] && companyResult[0][0]){
                                switch (companyResult[0][0].message) {
                                    case '1' :
                                        response.status = false;
                                        response.message = "Invalid combination of inputs.Try again...";
                                        response.error = null;
                                        res.status(200).json(response);
                                        break ;
                                    case '2' :
                                        response.status = true;
                                        response.message = "Joining successful";
                                        response.error = null;
                                        res.status(200).json(response);
                                        break ;
                                    case '3' :
                                        response.status = true;
                                        response.message = "Request submitted for activation";
                                        response.error = null;
                                        res.status(200).json(response);
                                        break ;
                                    case '4' :
                                        response.status = false;
                                        response.message = "Joining access denied";
                                        response.error = null;
                                        res.status(200).json(response);
                                        break ;
                                    case '5' :
                                        response.status = false;
                                        response.message = "You are already associate with this company";
                                        response.error = null;
                                        res.status(200).json(response);
                                        break ;
                                }
                            }
                            else if(!err){
                                response.status = true;
                                response.message = "No data found";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else{
                                response.status = false;
                                response.message = "Error while getting data";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};

companyCtrl.getComapnyMasters = function(req,res,next){
    var response = {
        status : false,
        message : "Error while searching company",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.WMId) {
        error.WMId = 'Invalid WMId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.WMId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_companyMasters( ' + procParams.join(',') + ')';
                console.log(procQuery);


                req.db.query(procQuery,function(err,companyMasters){
                    if(!err && companyMasters ){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data = {
                            departments : (companyMasters[0]) ? companyMasters[0] : [],
                            grades : (companyMasters[1]) ? companyMasters[1] : [],
                            locations : (companyMasters[2]) ? companyMasters[2] : []
                        };

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = {
                            departments : [],
                            grades : [],
                            locations : []
                        };

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }


};

companyCtrl.getSocialMediaLinks = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    var error = {};


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){
                if((!err) && tokenResult){


            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.heMasterId)
            ];

            var procQuery = 'CALL wm_get_socialMediaDetails(' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,Result){
                if(!err && Result && Result[0] && Result[0][0]){
                    response.status = true;
                    response.message = "Icons loaded successfully";
                    response.error = null;
                    response.data = {
                        socialMediaList : Result[0] ? Result[0] :[]
                    };
                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                    zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                     });
                }
                else{
                    response.status = false;
                    response.message = "Error while loading data ";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);

        }
    });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};


companyCtrl.getuserProfileDetails = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    var error = {};


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){
                if((!err) && tokenResult){


            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.heMasterId),
                req.st.db.escape(req.query.groupId),
            ];

            var procQuery = 'CALL wm_get_profileDataDetails(' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,Result){
                if(!err && Result && Result[0] && Result[0][0]){
                    response.status = true;
                    response.message = "userData loaded successfully";
                    response.error = null;
                    var leaveTypes = JSON.parse(Result[1][0].leaveJSON);
                    for(var i=0; i<Result[0].length; i++){
                        if(typeof(Result[0][i].leaveDetails)=='string'){
                            Result[0][i].leaveDetails = JSON.parse(Result[0][i].leaveDetails);
                        }
                    }
                    response.data = {
                        profileDetails : Result[0] ? Result[0] :[],
                        leaveTypes : JSON.parse(leaveTypes["leaveTypes"]),
                        totalLeaves : leaveTypes["totalLeaves"]
                    };
                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                    zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                     });
                }
                else{
                    response.status = false;
                    response.message = "Error while loading userData ";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);

        }
    });
        }
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};



module.exports = companyCtrl;