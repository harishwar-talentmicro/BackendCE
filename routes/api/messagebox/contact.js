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
var notification = null;
var NotificationTemplater = require('../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../modules/notification/notification-master.js');
var notification = new Notification();

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
                    var procParams = [
                        req.db.escape(title) ,
                        req.db.escape(pin) ,
                        req.db.escape(req.query.token)
                    ];
                    var procQuery = 'CALL get_v1_messagebox_contact(' + procParams.join(',') + ')';
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
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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

    var groupId;
    var isWeb   = (req.query.isWeb ) ? (req.query.isWeb ) :0;
    if(req.query.dateTime){
        if(moment(req.query.dateTime,'YYYY-MM-DD HH:mm:ss').isValid()){
            req.query.dateTime = moment(req.query.dateTime,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
        }
    }
    else{
        req.query.dateTime = null;
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
                    var procParams = [
                        req.db.escape(req.query.token) ,
                        req.db.escape(req.query.dateTime)
                    ];
                    var procQuery = 'CALL pGetGroupAndIndividuals_new(' + procParams.join(',') + ')';
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
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param groupId* <int> group id(Group Id of an individual user or a group where the operation has to be done)
 * @param status* <int> is group id
 * @param userGroupId* <int> (Group Id of a user on whom operation is done)
 *
 * @discription : API to change status of contacts
 */
router.put('/status', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    /**
     * validation goes here for each param
     */

    var validationFlag = true;
    var error = {};
    req.body.groupId  = parseInt(req.body.groupId);   // groupid of receiver
    req.body.status  = parseInt(req.body.status);      // Status 0 : Pending, 1: Accepted, 2 : Rejected, 3 : Leaved, 4 : Removed
    req.body.userGroupId  = parseInt(req.body.userGroupId);

    /**
     * validating for token as token,groupId,userGroupId and status
     * */
    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if(isNaN(req.body.groupId)){
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }
    if(isNaN(req.body.userGroupId)){
        error.userGroupId = 'Invalid userGroupId';
        validationFlag *= false;
    }
    if(isNaN(req.body.status)){
        error.status = 'Invalid status';
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
             * validation for token of login user
             * */
            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err && tokenResult) {

                        var queryParams = [
                            req.db.escape(req.body.token) ,
                            req.db.escape(req.body.groupId) ,
                            req.db.escape(req.body.status) ,
                            req.db.escape(req.body.userGroupId)
                        ];
                        /**
                         * call p_v1_UpdateUserStatus to change the status like accept/reject/block
                         * */
                        var query = 'CALL p_v1_UpdateUserStatus(' + queryParams.join(',') + ')';
                        console.log(query);
                        req.db.query(query, function (err, updateResult) {
                            if (!err) {
                                /**
                                 * if proc executed successfully then give response true
                                 * */

                                if (updateResult
                                    && updateResult[0]
                                    && updateResult[0].length>0
                                    && updateResult[0][0].userGroupId) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'User status updated successfully';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                    console.log('FnUpdateUserStatus: User status updated successfully');

                                    if(updateResult[0][0].status = 1){
                                        var notificationTemplaterRes = notificationTemplater.parse('accept_request',{
                                            adminName : updateResult[0][0].adminName,
                                            groupName : updateResult[0][0].groupName
                                        });
                                        console.log(notificationTemplaterRes,"notificationTemplaterRes");
                                        if(notificationTemplaterRes.parsedTpl){
                                            notification.publish(
                                                updateResult[0][0].userGroupId,
                                                updateResult[0][0].groupName,
                                                updateResult[0][0].groupName,
                                                updateResult[0][0].senderId,
                                                notificationTemplaterRes.parsedTpl,
                                                36,
                                                0, 0,
                                                0,
                                                0,
                                                0,
                                                0,
                                                1,
                                                moment().format("YYYY-MM-DD HH:mm:ss"),
                                                '',
                                                0,
                                                0);
                                            console.log('postNotification : notification for accept_request is sent successfully');
                                        }
                                        else{
                                            console.log('Error in parsing notification accept_request template - ',
                                                notificationTemplaterRes.error);
                                            console.log('postNotification : notification for accept_request is sent successfully');
                                        }
                                    }

                                }
                                /**
                                 * if proc executed unsuccessfully then give response false
                                 * */
                                else {
                                    var qMsg = {server: 'Internal Server Error'};
                                    switch (updateResult[0][0]._e) {
                                        case 'ACCESS DENIED' :
                                            qMsg = {_e: 'ACCESS DENIED'};
                                            break;
                                        default:
                                            break;
                                    }
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = qMsg;
                                    responseMessage.data = {};
                                    res.status(200).json(responseMessage);
                                }
                            }
                            /**
                             * while executing proc if error comes then give error
                             * */
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('p_v1_UpdateUserStatus: error in updating user status :' + err);
                            }
                        });
                }
                else {
                    responseMessage.error = {
                        server: 'Invalid Token'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(401).json(responseMessage);
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
            console.log('Error : p_v1_UpdateUserStatus ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

module.exports = router;

