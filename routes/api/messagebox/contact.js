/**
 *  @author Bhavya Jain
 *  @since April 26,2016  04:46PM
 *  @title contact of message module
 *  @description Handles message functions
 */
"use strict";

var express = require('express');
var router = express.Router();
var moment = require('moment');


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 *
 * @discription : API to get serach contacts
 */
router.get('/query', function(req,res,next){
    var ezeTerm = req.query.q;
    var title = null;
    var pin = null;
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    /**
     * validation goes here for each param
     */
    if(!ezeTerm){
        error.q = 'EZEOne ID not found';
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
            /**
             * validating token for login user
             * */
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err && tokenResult) {
                    var ezeArr = ezeTerm.split('.');
                    title = ezeArr;
                    if (ezeArr.length > 1) {
                        title = ezeArr[0];

                        /**
                         * If user may have passed the pin
                         * and therefore validating pin using standard rules
                         */
                        if (!isNaN(parseInt(ezeArr[1])) && ezeArr[1].length > 2 && parseInt(ezeArr[1]) > 0 && parseInt(ezeArr[1]) < 1000) {
                            pin = parseInt(ezeArr[1]).toString();
                        }

                    }
                    var procParams = req.db.escape(title) + ',' + req.db.escape(pin) + ',' + req.db.escape(req.query.token);
                    var procQuery = 'CALL get_v1_messagebox_contact(' + procParams + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, results) {
                        if (!err) {
                            console.log(results);
                            if (results && results[0] && results[0].length > 0) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Message contacts loaded successfully';
                                responseMessage.data = {
                                    contactSuggestionList :results[0]
                                };
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Message contacts not available';
                                responseMessage.data = {
                                    contactSuggestionList :[]
                                };
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.error = {
                                server: 'Internal Server Error'
                            };
                            responseMessage.message = 'An error occurred !';
                            res.status(500).json(responseMessage);
                            console.log('Error : get_v1_messagebox_contact ', err);
                            var errorDate = new Date();
                            console.log(errorDate.toTimeString() + ' ......... error ...........');

                        }
                    });
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
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
            console.log('Error pGetGroupAndIndividuals_new : ', ex);
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
 *@param token <string> token of user
 *@param dateTime <datetime> dateTime from this time modified contact we will give
 *@param isWeb <int> isWeb is just a flaf for web 1 and for mobile 0
 * @discription : API to get messagebox contact list
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

    /**
     * validation goes here for each param
     * checking that datetime is in valid format or not
     * isweb is flag if its 1 then req comes from web and if 0 then its from mobile
     */

    var dateTime = moment(req.query.dateTime,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
    var momentObj = moment(dateTime,'YYYY-MM-DD').isValid();
    var groupId;
    var isWeb   = (req.query.isWeb ) ? (req.query.isWeb ) :0;
    if(req.query.dateTime){
        if(!momentObj){
            error.dateTime = 'Invalid date';
            validationFlag *= false;
        }
    }
    else{
        dateTime = null;
    }
    if (!req.query.token) {
        error.token = 'Invalid token';
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
            /**
             * validating token for login user
             * */

            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var procParams = req.db.escape(req.query.token) + ',' + req.db.escape(dateTime);
                    var procQuery = 'CALL pGetGroupAndIndividuals_new(' + procParams + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, contactResults) {
                        if (!err) {
                            //console.log(results);
                            /**
                             *if results are there then check for condition that its web or not
                             * */
                            if (contactResults && contactResults[0] && contactResults[0].length > 0) {
                                var contactList  =[];
                                /**
                                 *if request comes from web then call PGetUnreadMessageCountofGroup procedure
                                 * to get unread count of messages because mobile people will save this count in their local sqllite
                                 * */
                                if (isWeb == 1) {
                                    var unreadCountqueryParams = req.db.escape(req.query.token);
                                    var unreadCountQuery = 'CALL PGetUnreadMessageCountofGroup(' + unreadCountqueryParams + ')';
                                    //console.log(unreadCountQuery);
                                    req.db.query(unreadCountQuery, function (err, countResults) {
                                        if (countResults && countResults[0] && countResults[0].length > 0) {
                                            for (var i = 0; i < contactResults[0].length; i++) {
                                                /**
                                                 * assign all values of group id in a variable
                                                 * */
                                                groupId = contactResults[0][i].groupId;
                                                for (var j = 0; j < countResults[0].length; j++) {
                                                    /**
                                                     * compare both group id getting from both proc if equal then push unreadcount to first results
                                                     * only in web condition
                                                     * */
                                                    if (groupId == countResults[0][j].groupID) {
                                                        //console.log(countResults[0][j].groupID,"countResults[0][j].groupID");
                                                        contactResults[0][i].unreadCount = countResults[0][j].count;
                                                    }
                                                }
                                            }
                                            //contactList.push(results[0]);
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Contact list loaded successfully';
                                            responseMessage.data = {
                                                contactList:contactResults[0]
                                            };
                                            res.status(200).json(responseMessage);
                                        }
                                    });

                                }
                                else{
                                    /**
                                     * if req is not for web then simply give the result from first proc i.e contact list
                                     * */
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Contact list loaded successfully';
                                    responseMessage.data = {
                                        contactList:contactResults[0]
                                    };
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else{
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Contact list not available';
                                responseMessage.data = {
                                    contactList:[]
                                };
                                res.status(200).json(responseMessage);
                            }
                        }
                        else {
                            responseMessage.error = {
                                server: 'Internal Server Error'
                            };
                            responseMessage.message = 'An error occurred !';
                            res.status(500).json(responseMessage);
                            console.log('Error :', err);
                            var errorDate = new Date();
                            console.log(errorDate.toTimeString() + ' ......... error ...........');
                        }
                    });
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error :', err);
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
            console.log('Error pGetGroupAndIndividuals_new : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

module.exports = router;

