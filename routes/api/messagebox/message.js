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
var gm = require('gm').subClass({ imageMagick: true });
var uuid = require('node-uuid');

var fs = require('fs');


/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param messageType <int> (0-text,1-task,2-location,3-attachemnt)
 * @param priority <int> (0-Low, 1-Normal(Default), 2-High)
 *  @param receiverGroupId*
 *  @param taskTargetDate<datetime>
 *  @param taskExpiryDate<datetime>
 *  @param explicitMemberGroupIdList<text>(how many user A want to send messages to multiple users)
 *  @param message<text>(text message otheriwse it will null)
 *  @description : API to compose message
 */

router.post('/', function(req,res,next){
    /**
     * validation goes here
     */
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};
    /**
     * checking whether token is exist or not,if not then error
     **/
    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    /**
     * checking messageType,priority is number or not,if not then error and set by default value
     **/
    req.body.messageType= (req.body.messageType) ? parseInt(req.body.messageType) : 0;
    if(isNaN(req.body.messageType)){
        error.messageType = 'Invalid messagetype';
        validationFlag *= false;
    }
    req.body.priority  = (req.body.priority) ? parseInt(req.body.priority) : 1;
    if(isNaN(req.body.priority)){
        error.priority  = 'Invalid priority';
        validationFlag *= false;
    }
    /**
     * checking receiverGroupId type is integer or not
     **/
    if (isNaN(parseInt(req.body.receiverGroupId))) {
        error.receiverGroupId = 'Invalid id of receiver Group id';
        validationFlag *= false;
    }
    /**
     * checking taskTargetDate,taskExpiryDate type is datetime or not,if it exist and not in correct format
     * then error else send null to db
     **/

    if(req.body.taskTargetDate){
        if(moment(req.body.taskTargetDate,'YYYY-MM-DD HH:mm:ss').isValid()){
            req.body.taskTargetDate = moment(req.body.taskTargetDate,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
        }
    }
    else{
        req.body.taskTargetDate = null;
    }
    if(req.body.taskExpiryDate){
        if(moment(req.body.taskExpiryDate,'YYYY-MM-DD HH:mm:ss').isValid()){
            req.body.taskExpiryDate = moment(req.body.taskExpiryDate,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
        }
    }
    else{
        req.body.taskExpiryDate = null;
    }
    /**
     * checking explicitMemberGroupIdList is getting from front end or not if no then send empty string
     **/
    var explicitMemberGroupIdList = (req.body.explicitMemberGroupIdList) ? (req.body.explicitMemberGroupIdList) : '';
    if (!validationFlag) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            /**
             * declaring one variable
             * */
            var message;
            var attachmentObject = '';
            /**
             * validating token for login user
             * */

            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err && tokenResult) {
                    /**
                     * call pautojoin_before_Composing to join to group or indidual automatically so that without sending request also
                     * user can message to anyone
                     * */
                    var autoJoinQueryParams = [
                        req.db.escape(req.body.token) ,
                        req.db.escape(req.body.receiverGroupId)
                    ];
                    var autoJoinQuery = 'CALL pautojoin_before_Composing(' + autoJoinQueryParams.join(',') + ')';
                    //console.log(autoJoinQuery);
                    req.db.query(autoJoinQuery, function (err, autoJoinResults) {
                        /**
                         * if not error from db then perform further conditions
                         * */
                        if (!err) {
                            /**
                             * checking that grouptype(group) and groupRelationStatus is pending then user cant message
                             * */
                            //console.log(autoJoinResults,"autoJoinResults");
                            if(autoJoinResults[0][0].groupType == 0 && autoJoinResults[0][0].groupRelationStatus == 0){
                                responseMessage.status = false;
                                responseMessage.error = null;
                                responseMessage.message = 'Your group join request is at pending state';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }
                            else{
                                /**
                                 * check that messageType is 0(text) then set message which we are getting from front end and set text message
                                 * into above declared variable name message
                                 * */

                                if (req.body.messageType == 0) {
                                    message = req.body.message;
                                }
                                /**`1``````````````````````````````````````````````````````
                                 *
                                 * y
                                 * check that messageType is 2(location) then prepare json object of  latitude and longitude  which we are
                                 * getting from front end into above declared variable name message
                                 * */
                                else if (req.body.messageType == 2) {
                                    var jsonDistanceObject = {
                                        latitude: req.body.latitude,
                                        longitude: req.body.longitude,
                                        text: (req.body.message) ? (req.body.message) : ''
                                    }
                                    var jsonDistanceObject = JSON.stringify(jsonDistanceObject);
                                    message = jsonDistanceObject;
                                    //console.log(jsonDistanceObject);
                                }
                                /**
                                 * check that messageType is 3(attachment) then prepare json object of attachmentLink,fileName and mimeType which we are
                                 * getting from front end into above declared variable name message
                                 * */
                                else if (req.body.messageType == 3) {
                                    var jsonAttachObject = {
                                        thumbnailLink:  "tn_" + req.body.attachmentLink,
                                        attachmentLink: req.body.attachmentLink,
                                        fileName: req.body.fileName,
                                        mimeType: req.body.mimeType,
                                        text: (req.body.message) ? (req.body.message) : ''
                                    }
                                    var jsonAttachObject = JSON.stringify(jsonAttachObject);
                                    message = jsonAttachObject;
                                    //console.log(jsonAttachObject);
                                }
                                /**
                                 * call p_v1_ComposeMessage to compose message to anyone(group or individual)
                                 * */
                                var procParams = [
                                    req.db.escape(req.body.token) ,
                                    req.db.escape(message) ,
                                    req.db.escape(req.body.messageType) ,
                                    req.db.escape(req.body.priority) ,
                                    req.db.escape(req.body.taskTargetDate) ,
                                    req.db.escape(req.body.taskExpiryDate) ,
                                    req.db.escape(req.body.receiverGroupId) ,
                                    req.db.escape(explicitMemberGroupIdList) ,
                                    req.db.escape(autoJoinResults[0][0].groupRelationStatus) ,
                                    req.db.escape(autoJoinResults[0][0].luUser)
                                ];
                                var procQuery = 'CALL p_v1_ComposeMessage(' + procParams.join(',') + ')';
                                //console.log(procQuery);
                                req.db.query(procQuery, function (err, results) {
                                    if (!err) {
                                        console.log(results);
                                        /**
                                         * if not getting any error from db and proc called successfully then send response with status true
                                         * */
                                        if (results) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message send successfully';
                                            switch (results[0][0].messageType) {
                                                case 3:
                                                    attachmentObject = results[0][0].message;
                                                    attachmentObject = JSON.parse(attachmentObject);
                                                    attachmentObject.attachmentLink = req.CONFIG.CONSTANT.GS_URL +
                                                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attachmentObject.attachmentLink;
                                                    attachmentObject.thumbnailLink = req.CONFIG.CONSTANT.GS_URL +
                                                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' +attachmentObject.thumbnailLink;
                                                    attachmentObject.fileName = attachmentObject.fileName;
                                                    attachmentObject.mimeType = attachmentObject.mimeType;
                                                    attachmentObject.text = attachmentObject.text;
                                                    console.log(attachmentObject,"attachmentObject");
                                                    results[0][0].message = attachmentObject;
                                            }
                                            responseMessage.data = results[0];

                                            res.status(200).json(responseMessage);
                                        }
                                        /**
                                         * if getting no affected rows then send response with status false and gove error message
                                         * */
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in message sending';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    /**
                                     * if getting any error from db and proc called unsuccessfully then send response with status false
                                     * */
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

                        }
                        else{
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
            console.log('Error p_v1_ComposeMessage : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

router.post('/test', function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
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
                        console.log(req.files,"files");
                        if (req.files) {
                            var deleteTempFile = function(){
                                fs.unlink('../bin/'+req.files.pr.path);
                                console.log("Image Path is deleted from server");
                            };
                            var readStream = fs.createReadStream(req.files.pr.path);
                            var resizedReadStream = gm(req.files['pr'].path).resize(100,100).autoOrient().quality(0).stream(req.files.pr.extension);
                            var uniqueFileName = uuid.v4() + ((req.files.pr.extension) ? ('.' + req.files.pr.extension) : 'jpg');
                            var tnUniqueFileName = "tn_" + uniqueFileName;
                            console.log(uniqueFileName);
                            req.st.uploadDocumentToCloud(uniqueFileName, readStream, function (err) {
                                if (!err) {
                                    deleteTempFile();
                                    req.st.uploadDocumentToCloud(tnUniqueFileName, resizedReadStream, function (err) {
                                        if (!err) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Image and thumbnail uploaded successfully';
                                            responseMessage.data = {
                                                pic: uniqueFileName,
                                                thumnail : tnUniqueFileName
                                            };
                                            deleteTempFile();
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Error in uploading thumbnail';
                                            responseMessage.data = null;
                                            deleteTempFile();
                                            res.status(500).json(responseMessage);
                                        }
                                    });
                                }
                                else {
                                    responseMessage.status = false;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Error in uploading image';
                                    responseMessage.data = null;
                                    deleteTempFile();
                                    res.status(500).json(responseMessage);
                                }
                            });
                        }
                        else{
                            responseMessage.status = false;
                            responseMessage.error = null;
                            responseMessage.message = 'Invalid input data';
                            responseMessage.data = null;
                            res.status(500).json(responseMessage);
                        }
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('hrisSaveHRMimg: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : hrisSaveHRMimg ', err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error hrisSaveHRMimg :  ',ex);
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
 * @param token* <string> token of login user
 * @param groupId* <int> is group id
 * @param tGrouptype <int> is group type
 * @param pageNo <int> is page no
 * @param limit <int> limit till that we will give results
 * @discription : API to change admin of group
 */
router.get('/', function(req,res,next){
    var pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
    var limit = (req.query.limit) ? (req.query.limit):10;
    if(req.query.timestamp){
        if(moment(req.query.timestamp,'YYYY-MM-DD HH:mm:ss').isValid()){
            req.query.timestamp = moment(req.query.timestamp,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
        }
    }
    else{
        req.query.timestamp = null;
    }
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(parseInt(req.query.groupId)) || (req.query.groupId) < 0 ) {
        error.groupId = 'Invalid group id';
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
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    var message;
                    if (tokenResult) {
                        var procParams = [
                            req.db.escape(req.query.groupId) ,
                            req.db.escape(req.query.token) ,
                            req.db.escape(pageNo), req.db.escape(limit) ,
                            req.db.escape(req.query.timestamp)
                        ];
                        var procQuery = 'CALL p_v1_LoadMessagesofGroup(' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                //console.log(results,"results");
                                if (results && results[0] && results[0].length>0) {
                                    for(var messageCounter = 0;messageCounter < results[0].length;messageCounter++){
                                        if(results[0][messageCounter].messageType==0){
                                            message = results[0][messageCounter].message;
                                        }
                                        else if(results[0][messageCounter].messageType==3){
                                            message = results[0][messageCounter].message;
                                            messageObj = JSON.parse(message);
                                            messageObj.attachmentLink = req.CONFIG.CONSTANT.GS_URL +
                                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + messageObj.attachmentLink;
                                            messageObj.thumbnailLink =  req.CONFIG.CONSTANT.GS_URL +
                                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' +messageObj.thumbnailLink;

                                            messageObj.fileName = messageObj.fileName;
                                            messageObj.mimeType = messageObj.mimeType;
                                            messageObj.text = messageObj.text;
                                            results[0][messageCounter].message = messageObj;
                                            //console.log(results[0][messageCounter].message ,"testmessage");
                                        }
                                    }
                                    //console.log(results[0],"results[0]");
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Messages of group loaded successfully';
                                    responseMessage.totalCount = results[1][0].count;
                                    responseMessage.data = {
                                        messageList : results[0]
                                    };
                                    res.status(200).json(responseMessage);
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Messages of group not available';
                                    responseMessage.data = {
                                        messageList : []
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
                                console.log('Error : p_v1_LoadMessagesofGroup ', err);
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
                    var messageObj;
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
            console.log('Error p_v1_LoadMessagesofGroup : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

module.exports = router;


