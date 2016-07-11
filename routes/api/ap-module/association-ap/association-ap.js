/**
 *  @author Anjali Pandya
 *  @since April 12,2016  10:19 AM
 *  @title Association area partner module
 *  @description Handles association functions for area partner app
 */
"use strict";

var express = require('express');
var router = express.Router();

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * q <string> q is query string entered by user
 * @discription : Search for the community in AP project by name or ezeoneId of community
 */
router.get('/', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    try {
        var procParams = st.db.escape(req.query.q);
        var procQuery = 'CALL pfind_community(' + procParams + ')';
        console.log(procQuery);
        req.db.query(procQuery, function (err, results) {
            if (!err) {
                console.log(results);
                if (results) {
                    if (results[0]) {
                        if (results[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = '';
                            responseMessage.data = {
                                communityList : results[0],
                                masterId : results[0],
                                serviceMasterId : results[0],
                                communityTitle : results[0]
                            }
                            res.status(200).json(responseMessage);
                        }
                        else {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Community details loaded successfully';
                            responseMessage.data = null;
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'Group keyword not available';
                        responseMessage.data = null;
                        res.status(200).json(responseMessage);
                    }
                }
                else {
                    responseMessage.status = false;
                    responseMessage.error = null;
                    responseMessage.message = 'Expense type not available';
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
                console.log('Error : pgetkeyword_group ', err);
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
        console.log('Error pgetkeyword_group : ', ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
});

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * serviceMasterId <int> serviceMasterId of community
 * ezeoneId <string> ezeoneId of Individual
 * @discription : Search for the member of commumity
 */
router.get('/', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.ezeoneid) {
        error.ezeoneid = 'Invalid ezeoneid';
        validationFlag *= false;
    }
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    try {
        var procParams = st.db.escape(req.query.q) + ',' + st.db.escape(req.query.q) + ',' + st.db.escape(req.query.q);
        //var procQuery = 'CALL pgetkeyword_group()';
        console.log(procQuery);
        req.db.query(procQuery, function (err, results) {
            if (!err) {
                console.log(results);
                if (results) {
                    if (results[0]) {
                        if (results[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = '';
                            responseMessage.data = {
                                communityList : results[0],
                                masterId : results[0],
                                serviceMasterId : results[0],
                                communityTitle : results[0]
                            }
                            res.status(200).json(responseMessage);
                        }
                        else {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Group keyword not available';
                            responseMessage.data = null;
                            res.status(200).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.status = false;
                        responseMessage.error = null;
                        responseMessage.message = 'Group keyword not available';
                        responseMessage.data = null;
                        res.status(200).json(responseMessage);
                    }
                }
                else {
                    responseMessage.status = false;
                    responseMessage.error = null;
                    responseMessage.message = 'Expense type not available';
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
                console.log('Error : pgetkeyword_group ', err);
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
        console.log('Error pgetkeyword_group : ', ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
});


module.exports = router;