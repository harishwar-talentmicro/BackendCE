/**
 *  @author Bhavya Jain
 *  @since April 26,2016  04:46PM
 *  @title batch module
 *  @description Handles batch bill functions
 */
"use strict";
var express = require('express');
var router = express.Router();
var Mailer = require('../../../mail/mailer.js');
var mailerApi = new Mailer();
var Ajv = require('ajv');
var ajv = Ajv({allErrors: true});
var bcrypt = null;
var bcryptNodeJSFlag = false;
var moment = require('moment');

try{
    bcrypt = require('bcrypt-nodejs');
}
catch(ex){
    console.log('Bcrypt not found, falling back to bcrypt-nodejs');
    bcrypt = require('bcrypt-nodejs');
    bcryptNodeJSFlag = true;
}




/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to generate invoice and send in to each member of community
 */
router.post('/verify_password', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.body.password) {
        error.password = 'password is invalid';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {

            var procParams = req.db.escape(req.body.token);
            //console.log(encryptPassword,"password");
            var procQuery = 'CALL pcheck_password(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if(!err){
                    if (results && results[0] && results[0][0] && results[0][0].password &&
                    (bcrypt.compareSync(req.body.password,results[0][0].password))) {
                    console.log(results);
                    responseMessage.status = true;
                    responseMessage.error = null;
                    responseMessage.message = 'Password matched successfully';
                    responseMessage.data = [];
                    res.status(200).json(responseMessage);
                    }
                    else{
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'Password did not match';
                        responseMessage.data = null;
                        res.status(200).json(responseMessage);
                    }
                }

                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : pcheck_password ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');

                }
            });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error pcheck_password : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @param token<string> token of login user
 * @param smid<int> service master id
 * @discription : API to get batch
 */
router.get('/member_details', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    //var testDate = moment.utc().subtract('months', 1).format('YYYY-MM-DD HH:mm:ss');
    //console.log(testDate,"testDate");
    var validationFlag = true;
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.smid))){
        error.smid = 'Invalid service master id';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {

        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var ezeoneid = req.st.alterEzeoneId(req.query.ezeoneid);
                        var procParams = req.db.escape(req.query.smid)+ ',' + req.db.escape(ezeoneid);
                        var procQuery = 'CALL pget_community_member_details(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            if(results[0][0]&&results[0][0].memberId){
                                                console.log(results[0][0],"results[0][0]");
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Member details loaded successfully';
                                                responseMessage.data = results[0]
                                                res.status(200).json(responseMessage);
                                            }
                                            else{
                                                responseMessage.status = false;
                                                responseMessage.error = results[0][0].e;
                                                responseMessage.data = [];
                                                res.status(200).json(responseMessage);
                                            }

                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Member details not available';
                                            responseMessage.data = [];
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Member details not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Member details not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_community_member_details ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else {
                            responseMessage.message = 'Invalid token';
                            responseMessage.error = {
                                token: 'invalid token'
                            };
                            responseMessage.data = null;
                            res.status(401).json(responseMessage);
                            console.log('pget_community_member_details: Invalid token');
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : pget_community_member_details ', err);
                        var errorDate = new Date();
                        console.log(errorDate.toTimeString() + ' ......... error ...........');
                    }
                });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error pget_community_member_details : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});


/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param ezeid* <string> ezeoneid for which admin wants to save receipts
 * @param particulars <string> particulars is details of all bills
 * @param smid <int> smid is service master id
 * @param amount <decimal>
 *
 * @discription : API to create batch receipts
 */
router.post('/receipts', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var id = parseInt(req.body.smid);
    var validationFlag = true;
    var error = {};
    if (!req.body.ezeoneid) {
        error.ezeoneid = 'Invalid ezeoneid';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            var ezeoneid = req.st.alterEzeoneId(req.body.ezeoneid);
            var procParams = req.db.escape(ezeoneid) + ',' + req.db.escape(id)+ ',' + req.db.escape(req.body.particulars)
                + ',' + req.db.escape(req.body.amount);
            var procQuery = 'CALL psave_billing_receipts(' + procParams + ')';
            req.db.query(procQuery, function (err, batchResult) {
                if (!err) {
                    responseMessage.status = true;
                    responseMessage.error = null;
                    responseMessage.message = 'Receipt saved successfully';
                    responseMessage.data = {};
                    res.status(200).json(responseMessage);
                }
                else {
                    console.log('Receipt not saved');
                    console.log(err);
                    res.status(200).json(responseMessage);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error psave_billing_receipts :  ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @param token<string> token of login user
 * @param smid<int> service master id
 * @discription : API to get batch
 */
router.get('/receipts', function(req,res,next){
    var fromDate = (req.query.fromTime) ? (req.query.fromTime) : null;
    var endDate = (req.query.toTime) ? (req.query.toTime) : null;
    var pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
    var limit = (req.query.limit) ? (req.query.limit) : 10;
    var serviceMemberId = (req.query.serviceMemberId);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(serviceMemberId))){
        error.serviceMemberId = 'Invalid service member id';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {

        try {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = req.db.escape(serviceMemberId) + ',' + req.db.escape(fromDate)
                            + ',' + req.db.escape(endDate) + ',' + req.db.escape(pageNo) + ',' + req.db.escape(limit);
                        var procQuery = 'CALL pget_receipts(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            //console.log(results[1][0].totalCount,"results[1].totalCount");
                                            var outputData = {
                                                totalCount : results[1][0].totalCount,
                                                records : results[0],
                                                outstandingAmount : results[2][0].outstandingAmount
                                            }
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Receipt details loaded successfully';
                                            responseMessage.data = outputData
                                            res.status(200).json(responseMessage);

                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Receipt details not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Receipt details not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Receipt details not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pget_receipts ', err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('pget_receipts: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : pget_receipts ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error pget_receipts : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to get batch transactions
 */
router.get('/test_details', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };

    //var schema = {
    //        "smid": { "type": "integer" }
    //};
    //var validate = ajv.compile(schema);
    var validationFlag = true;
    var error = {};
    //var valid = validate(req.query.smid);
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            var procParams = req.db.escape(req.query.smid);
            var procQuery = 'CALL test_new1(' + procParams + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                if (!err) {
                    //console.log(results);
                    if (results) {
                        if (results[0]) {
                            if (results[0].length > 0) {
                                var schema1 = {
                                    "tid": { "type": "integer" },
                                    "expensetype": { "type" : "string" },
                                    "item_Tag": { "type" : "string",optional: true },
                                    "calcType": { "type" : "integer" },
                                    "resuls[1].typeId": { "type": "integer" },
                                    "type": { "type" : "string" },
                                    "area": { "type" : "integer" },
                                    "members": { "type" : "integer" }

                                };
                                ajv.validate(schema1,results[1]); // true
                                if (!valid) {
                                    responseMessage.error = validate.errors;
                                    responseMessage.message = 'Please check the errors';
                                    res.status(400).json(responseMessage);
                                    console.log(ajv.errors,"validate.errors");
                                }
                                else{
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'batch details loaded successfully';
                                    responseMessage.data = {
                                        expenseType : results[0],
                                        batchDetails : results[1]
                                    }
                                    res.status(200).json(responseMessage);
                                }



                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'batch details not available';
                                responseMessage.data = [];
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'batch details not available';
                            responseMessage.data = [];
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'batch details not available';
                        responseMessage.data = [];
                        res.status(200).json(responseMessage);
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : pget_batch_details ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');

                }
            });

        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error pget_batch_details : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

module.exports = router;