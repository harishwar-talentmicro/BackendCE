var express = require('express');
var router = express.Router();
var moment = require('moment');
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var employeeSurveyCtrl = {};

employeeSurveyCtrl.getSurveyList = function (req, res, next) {
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
               

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    
                ];
                /**
                 * Calling procedure to My self and my team leave apllications
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_surveyTemplate( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                  
                    if (!err && results && results[0] && results[0][0]) {
                        response.status = true;
                        response.message = "Survey list loaded successfully";
                        response.error = null;


                        for(var i=0; i<results[0].length; i++){
                            if(typeof(results[0][i].questionDetails)=='string'){
                                results[0][i].questionDetails = JSON.parse(results[0][i].questionDetails);
                            }
                            
                            for(var j=0; j< results[0][i].questionDetails.length; j++){
                                if(typeof(results[0][i].questionDetails[j].options)=='string'){
                                    results[0][i].questionDetails[j].options = JSON.parse(results[0][i].questionDetails[j].options); 
                                }
                            }
                        }

                        response.data = {
                            surveyList: results[0],
                            
                        };
                        // res.status(200).json(response);
                        buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                       });
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No task requests found";
                        response.error = null;
                        response.data = {
                            surveyList: []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                         });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting task requests";
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


module.exports = employeeSurveyCtrl;