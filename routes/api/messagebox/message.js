/**
 *  @author Bhavya Jain
 *  @since April 26,2016  04:46PM
 *  @title messagebox module
 *  @description Handles message functions
 */
"use strict";

var express = require('express');
var router = express.Router();
var moment = require('moment');
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
 *@param token <string> token of user
 *@param dateTime <datetime> dateTime from this time modified contact we will give
 *@param isWeb <int> isWeb is just a flaf for web 1 and for mobile 0
 * @discription : API to get messagebox contact list
 */
router.get('/list', function(req,res,next){
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
    var dateTime = moment(req.query.dateTime,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
    var groupId;
    var isWeb   = (req.query.isWeb ) ? (req.query.isWeb ) :0;
    if(req.query.dateTime){
        if(!dateTime){
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
                if (!err) {
                    if (tokenResult) {
                        var procParams = req.db.escape(req.query.token) + ',' + req.db.escape(dateTime);
                        var procQuery = 'CALL pGetGroupAndIndividuals_new(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                //console.log(results);
                                /**
                                 *if results are there then check for condition that its web or not
                                 * */
                                if (results && results[0] && results[0].length > 0) {
                                    var contactList  =[];
                                    /**
                                     *if request comes from web then call PGetUnreadMessageCountofGroup procedure to get unread count of messages
                                     * */
                                    if (isWeb == 1) {
                                        var unreadCountqueryParams = req.db.escape(req.query.token);
                                        var unreadCountQuery = 'CALL PGetUnreadMessageCountofGroup(' + unreadCountqueryParams + ')';
                                        //console.log(unreadCountQuery);
                                        req.db.query(unreadCountQuery, function (err, countResults) {
                                            if (countResults && countResults[0] && countResults[0].length > 0) {
                                                for (var i = 0; i < results[0].length; i++) {
                                                    /**
                                                     * assign all values of group id in a variable
                                                     * */
                                                    groupId = results[0][i].groupId;
                                                    for (var j = 0; j < countResults[0].length; j++) {
                                                        /**
                                                         * compare both group id getting from both proc if equal then push unreadcount to first results
                                                         * only in web condition
                                                         * */
                                                        if (groupId == countResults[0][j].groupID) {
                                                            //console.log(countResults[0][j].groupID,"countResults[0][j].groupID");
                                                            results[0][i].unreadCount = countResults[0][j].count;
                                                        }
                                                    }
                                                }
                                                //contactList.push(results[0]);
                                                console.log(results[0],"results[0]");
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Contact list loaded successfully';
                                                responseMessage.data = {
                                                    contactList:results[0]
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
                                        responseMessage.data = results[0];
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else{
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Contact list not available';
                                    responseMessage.data = [];
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Contact list not available';
                                responseMessage.data = [];
                                res.status(200).json(responseMessage);
                            }
                        });
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error : pGetGroupAndIndividuals_new ', err);
                        var errorDate = new Date();
                        console.log(errorDate.toTimeString() + ' ......... error ...........');

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
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param ezeone_Id <string> ezeid
 * @param gid <int> is group id(here requester is member)
 *
 * @discription : API to change admin of group
 */
router.post('/compose_message', function(req,res,next){

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
    var messageType = (req.body.messageType) ? parseInt(req.body.messageType) : 0;
    if(isNaN(messageType)){
        messageType = 0;
    }
    var priority  = (req.body.priority) ? parseInt(req.body.priority) : 1;
    if(isNaN(priority )){
        priority  = 1;
    }
    if (isNaN(parseInt(req.body.receiverGroupId))) {
        error.receiverGroupId = 'Invalid id of receiver Group id';
        validationFlag *= false;
    }
    var taskTargetDate = moment(req.body.taskTargetDate,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
    if(req.body.taskTargetDate){
        if(!taskTargetDate){
            error.taskTargetDate = 'Invalid taskTargetDate';
            validationFlag *= false;
        }
    }
    else{
        taskTargetDate = null;
    }
    var taskExpiryDate = moment(req.body.taskExpiryDate,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
    if(req.body.taskExpiryDate){
        if(!taskExpiryDate){
            error.taskExpiryDate = 'Invalid taskExpiryDate';
            validationFlag *= false;
        }
    }
    else{
        taskExpiryDate = null;
    }
    var explicitMemberGroupIdList = (req.body.explicitMemberGroupIdList) ? (req.body.explicitMemberGroupIdList) : '';
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            var message;
            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        if(messageType==0){
                            message = req.body.message;
                        }
                        else if(messageType==2){
                            var jsonDistanceObject = {
                                latitude: req.body.latitude,
                                longitude: req.body.longitude
                            }
                            var jsonDistanceObject = JSON.stringify(jsonDistanceObject);
                            message = jsonDistanceObject;
                            console.log(jsonDistanceObject);
                        }
                        else if(messageType==3){
                            var jsonAttachObject = {
                                attachmentLink: req.body.attachmentLink,
                                fileName: req.body.fileName,
                                mimeType: req.body.mimeType
                            }
                            var jsonAttachObject = JSON.stringify(jsonAttachObject);
                            message = jsonAttachObject;
                            console.log(jsonAttachObject);
                        }
                        var procParams = req.db.escape(req.body.token)+ ',' + req.db.escape(message)
                            + ',' + req.db.escape(messageType)+ ',' + req.db.escape(priority)+ ',' + req.db.escape(taskTargetDate)
                            + ',' + req.db.escape(taskExpiryDate)+ ',' + req.db.escape(req.body.receiverGroupId)
                            + ',' + req.db.escape(explicitMemberGroupIdList);
                        var procQuery = 'CALL p_v1_ComposeMessage(' + procParams + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results && results[0] && results[0][0] && results[0][0].messageId) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Message send successfully';
                                    responseMessage.data = results[0][0];
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in message sending';
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
                                console.log('Error : p_v1_ComposeMessage ', err);
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
                        console.log('Invalid token');
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
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error p_v1_ComposeMessage : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

module.exports = router;


