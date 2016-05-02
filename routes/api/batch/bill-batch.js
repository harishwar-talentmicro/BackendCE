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


try{
    bcrypt = require('bcrypt');
}
catch(ex){
    console.log('Bcrypt not found, falling back to bcrypt-nodejs');
    bcrypt = require('bcrypt-nodejs');
    bcryptNodeJSFlag = true;
}



function alterEzeoneId(ezeoneId){
    var alteredEzeoneId = '';
    if(ezeoneId){
        if(ezeoneId.toString().substr(0,1) == '@'){
            alteredEzeoneId = ezeoneId;
        }
        else{
            alteredEzeoneId = '@' + ezeoneId.toString();
        }
    }
    return alteredEzeoneId;
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
                if ((!err) && results && results[0] && results[0][0] && results[0][0].password &&
                    (bcrypt.compareSync(req.body.password,results[0][0].password))) {
                    console.log(results);
                    responseMessage.status = true;
                    responseMessage.error = null;
                    responseMessage.message = 'Password matched successfully';
                    responseMessage.data = [];
                    res.status(200).json(responseMessage);
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
                        var ezeoneid = alterEzeoneId(req.query.ezeoneid);
                        var procParams = req.db.escape(req.query.smid)+ ',' + req.db.escape(ezeoneid);
                        var procQuery = 'CALL pget_community_member_details(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Member details loaded successfully';
                                            responseMessage.data = results[0]
                                            res.status(200).json(responseMessage);
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