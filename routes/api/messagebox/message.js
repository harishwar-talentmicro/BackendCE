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
var thumbnailConfig = require('../../../thumbnail-config.json');
var notification = null;
var NotificationTemplater = require('../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var zlib = require('zlib');
var AES_256_encryption = require('../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

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
     * checking messageType,priority is number or not,if not then error and set by default value
     **/
    req.body.messageType= (req.body.messageType) ? parseInt(req.body.messageType) : 0;
    if(isNaN(req.body.messageType)){
        error.messageType = 'Invalid messagetype';
        validationFlag *= false;
    }
    req.body.localMessageId= (req.body.localMessageId) ? parseInt(req.body.localMessageId) : 0;
    if(isNaN(req.body.localMessageId)){
        error.localMessageId = 'Invalid local message id';
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
            var senderGroupId;
            var message;
            var attachmentObject = '';
            /**
             * validating token for login user
             * */
            req.body.thumbnailLink = (req.body.thumbnailLink) ? req.body.thumbnailLink : req.st.getThumbnailLinkFromMime();
            req.st.validateToken(req.body.token, function (err, tokenResult) {
                if (!err && tokenResult) {
                    /**
                     * call pautojoin_before_Composing to join to group or individual automatically so that without sending request also
                     * user can message to anyone
                     * */
                    var autoJoinQueryParams = [
                        req.db.escape(req.body.token) ,
                        req.db.escape(req.body.receiverGroupId)
                    ];
                    var autoJoinQuery = 'CALL pautojoin_before_Composing(' + autoJoinQueryParams.join(',') + ')';
                    console.log(autoJoinQuery,"autoJoinQuery");
                    req.db.query(autoJoinQuery, function (err, autoJoinResults) {
                        console.log(autoJoinResults,"autoJoinResults");
                        /**
                         * if not error from db then perform further conditions
                         * */
                        if (!err) {
                            /**
                             * checking that grouptype(group) and groupRelationStatus is pending then user cant message
                             * So that user can't message in such group where he is not a member
                             **/
                             if(autoJoinResults && autoJoinResults[0] && autoJoinResults[0][0] &&
                                autoJoinResults[0][0].groupType == 0 && autoJoinResults[0][0].groupRelationStatus == 0){
                                     responseMessage.status = true;
                                     responseMessage.error = null;
                                     responseMessage.message = 'Your request for joining the group is pending';
                                     responseMessage.data = null;
                                     res.status(200).json(responseMessage);
                                     /**
                                      * Send Notification to the admin of the group to accept the request of this user
                                      * who want to join this group
                                      */

                                     var notificationTemplaterRes = notificationTemplater.parse('join_group',{
                                         groupName : autoJoinResults[0][0].groupName,
                                         fullName : tokenResult[0].fullName
                                     });
                                     if(notificationTemplaterRes.parsedTpl){
                                         notification.publish(
                                             autoJoinResults[0][0].adminGroupId,
                                             autoJoinResults[0][0].groupName,
                                             autoJoinResults[0][0].groupName,
                                             autoJoinResults[0][0].senderId,
                                             notificationTemplaterRes.parsedTpl,
                                             38,
                                             0,
                                             autoJoinResults[0][0].iphoneId,
                                             autoJoinResults[0][0].GCM_Id,
                                             0,
                                             0,
                                             0,
                                             0,
                                             1,
                                             moment().format("YYYY-MM-DD HH:mm:ss"),
                                             '',
                                             0,
                                             0,null,null,null,null,tokenResult[0].isWhatMate);
                                         console.log('postNotification : notification for join_group is sent successfully');
                                     }
                                     else{
                                         console.log('Error in parsing notification join_group template - ',
                                             notificationTemplaterRes.error);
                                         console.log('postNotification : notification for join_group is sent successfully');
                                     }

                            }
                            else{
                                /**
                                 * check that messageType is 0(text) then set message which we are getting from front end and set text message
                                 * into above declared variable name message
                                 * */

                                switch(req.body.messageType) {
                                    case 0 :
                                        message = req.body.message;
                                        break;

                                    case 2 :
                                        var jsonDistanceObject = {
                                            latitude: req.body.latitude,
                                            longitude: req.body.longitude,
                                            text: (req.body.message) ? (req.body.message) : '',
                                            attachmentLink: req.st.getOnlyAttachmentName(req.body.attachmentLink),
                                            thumbnailLink:  req.st.getOnlyAttachmentName(req.body.thumbnailLink),
                                            fileName: req.body.fileName,
                                            mimeType: req.body.mimeType
                                        };
                                        message = JSON.stringify(jsonDistanceObject);
                                        break;

                                    case 3 :
                                        var jsonAttachObject = {
                                            thumbnailLink:  req.st.getOnlyAttachmentName(req.body.thumbnailLink),
                                            attachmentLink: req.st.getOnlyAttachmentName(req.body.attachmentLink),
                                            fileName: req.body.fileName,
                                            mimeType: req.body.mimeType,
                                            text: (req.body.message) ? (req.body.message) : ''
                                        };

                                        message = JSON.stringify(jsonAttachObject);

                                        break;

                                    default :
                                        message = "";
                                        break;


                                }
                                /**
                                 * call p_v1_ComposeMessage to compose message to anyone(group or individual)
                                 * */
                                req.body.expiryDate = req.body.expiryDate != undefined ? req.body.expiryDate : "2099-11-11 23:59";
                                var procParams = [
                                    req.db.escape(req.body.token) ,
                                    req.db.escape(message) ,
                                    req.db.escape(req.body.messageType) ,
                                    req.db.escape(req.body.priority) ,
                                    req.db.escape(req.body.taskTargetDate) ,
                                    req.db.escape(req.body.expiryDate) ,
                                    req.db.escape(req.body.receiverGroupId) ,
                                    req.db.escape(explicitMemberGroupIdList) ,
                                    req.db.escape(autoJoinResults[0][0].groupRelationStatus) ,
                                    req.db.escape(autoJoinResults[0][0].luUser)
                                ];
                                 var contactParams = [
                                     req.db.escape(req.st.alterEzeoneId(tokenResult[0].ezeoneId)) ,
                                     req.db.escape(tokenResult[0].pin) ,
                                     req.db.escape(req.body.receiverGroupId)
                                     ];

                                var procQuery = 'CALL p_v1_ComposeMessage(' + procParams.join(', ') + ');CALL get_v1_contact(' + contactParams.join(', ') + ');';
                               console.log(procQuery);
                                req.db.query(procQuery, function (err, results) {
                                    //console.log(results[3][0],"results[3][0]");
                                    if (!err) {
                                        /**
                                         * if not getting any error from db and proc called successfully then send response with status true
                                         **/
                                        console.log(results,"results");
                                        if (results && results[0] && results[0].length > 0 && results[0][0].messageId) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Message send successfully';
                                            //switch (results[0][0].messageType) {
                                            switch (req.body.messageType) {
                                                case 3:

                                                    /**
                                                     * @TODO Write a function in stdlib which see that attachment link is having bucket url or not if not having then add it otherwise remove and add it from EZEOne standard configuration
                                                     */
                                                    attachmentObject = JSON.parse(results[0][0].message);
                                                    attachmentObject.attachmentLink = (attachmentObject.attachmentLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attachmentObject.attachmentLink) : '';
                                                    attachmentObject.thumbnailLink = (attachmentObject.thumbnailLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' +attachmentObject.thumbnailLink) : '';

                                                    console.log(attachmentObject,"attachmentObject");
                                                    results[0][0].message = attachmentObject;
                                                    break;
                                                case 2:
                                                    attachmentObject = JSON.parse(results[0][0].message);
                                                    attachmentObject.attachmentLink = (attachmentObject.attachmentLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                    req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attachmentObject.attachmentLink) : '';
                                                    attachmentObject.thumbnailLink = (attachmentObject.thumbnailLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                    req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' +attachmentObject.thumbnailLink) : '';
                                                    results[0][0].message = attachmentObject;
                                                    break;
                                                default:

                                                    break;
                                            }
                                            responseMessage.data = {
                                                messageId : results[0][0].messageId,
                                                message : results[0][0].message,
                                                createdDate : results[0][0].createdDate,
                                                messageType : req.body.messageType,
                                                messageStatus : results[0][0].messageStatus,
                                                priority : results[0][0].priority,
                                                senderName : results[0][0].senderName,
                                                senderId : results[0][0].senderId,
                                                localMessageId : req.body.localMessageId
                                            };

                                            res.status(200).json(responseMessage);
                                            /**notification send to user to whome message is sending*/
                                            if(results[1] && results[1].length > 0){

                                                if(results[0][0].groupType == 0){
                                                    senderGroupId = results[0][0].groupId;
                                                    var notificationTemplaterRes = notificationTemplater.parse('compose_message_group',{
                                                        senderName : results[0][0].senderName,
                                                        groupName : results[1][0].groupName
                                                    });
                                                }
                                                else{
                                                    senderGroupId = results[0][0].senderId;
                                                    notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                                                        senderName : results[0][0].senderName
                                                    });
                                                }

                                                /**
                                                 * Condtion should be like this in restricted reply case
                                                 * (Already handled by vedha on DB side)
                                                 *
                                                 * When any other user is messaging in the restricted reply group
                                                 * then notification and message should only go to admin and not to other persons
                                                 * of that group
                                                 *
                                                 * If admin is messaging in restricted reply group then notification should go to all
                                                 * the members if explicitMemberIdList is empty
                                                 *
                                                 */

                                                for (var i = 0; i < results[1].length; i++ ) {
                                                    /**
                                                     * if relation not exist then send all sender details to receiver
                                                     * */
                                                    if(autoJoinResults[0][0].groupuserid == 0){
                                                        console.log(autoJoinResults[0][0].groupuserid,"groupuserid");
                                                        console.log((results[1][i].GCM_Id),"GCM_Id");
                                                        if(notificationTemplaterRes.parsedTpl){
                                                            notification.publish(
                                                                results[1][i].receiverGroupId,
                                                                (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                                (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                                results[0][0].senderId,
                                                                notificationTemplaterRes.parsedTpl,
                                                                31,
                                                                0,
                                                                (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                                                (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                                                0,
                                                                0,
                                                                0,
                                                                0,
                                                                1,
                                                                moment().format("YYYY-MM-DD HH:mm:ss"),
                                                                '',
                                                                0,
                                                                0,
                                                                null,
                                                                '',
                                                                /** Data object property to be sent with notification **/
                                                                {
                                                                    isRelationExist : 0,
                                                                    messageList : {
                                                                        messageId : results[0][0].messageId,
                                                                        message : results[0][0].message,
                                                                        createdDate : results[0][0].createdDate,
                                                                        messageType : req.body.messageType,
                                                                        messageStatus : results[0][0].messageStatus,
                                                                        priority : results[0][0].priority,
                                                                        senderName : results[0][0].senderName,
                                                                        senderId : results[0][0].senderId,
                                                                        receiverId : results[1][i].receiverGroupId,
                                                                        groupType : results[0][0].groupType,
                                                                        groupId : senderGroupId
                                                                    },
                                                                    contactList : {
                                                                        groupId :senderGroupId,
                                                                        adminEzeId : results[3][0].adminEzeId,
                                                                        adminId : results[3][0].adminId,
                                                                        groupName : results[3][0].groupName,
                                                                        groupStatus : results[3][0].groupStatus,
                                                                        isAdmin : results[3][0].isAdminNew,
                                                                        areMembersVisible : results[3][0].areMembersVisible,
                                                                        isReplyRestricted : results[3][0].isReplyRestricted,
                                                                        groupRelationStatus : results[3][0].groupRelationStatus,
                                                                        luDate : results[3][0].luDate,
                                                                        isRequester : results[3][0].isRequester,
                                                                        unreadCount : results[3][0].unreadCount,
                                                                        luUser : results[3][0].luUser,
                                                                        aboutGroup : results[3][0].aboutGroup,
                                                                        memberCount : results[3][0].memberCount,
                                                                        autoJoin : results[3][0].autoJoin,
                                                                        groupType : results[0][0].groupType
                                                                    }
                                                                },
                                                                null,tokenResult[0].isWhatMate);
                                                            console.log('postNotification : notification for compose_message is sent successfully');
                                                        }
                                                        else{
                                                            console.log('Error in parsing notification compose_message template - ',
                                                                notificationTemplaterRes.error);
                                                            console.log('postNotification : notification for compose_message is sent successfully');
                                                        }
                                                    }
                                                    else{
                                                        console.log(autoJoinResults[0][0].groupuserid,"groupuserid2");
                                                        console.log((results[1][i].iphoneId),"iphoneId");
                                                        if(notificationTemplaterRes.parsedTpl){
                                                            notification.publish(
                                                                results[1][i].receiverGroupId,
                                                                (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                                (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                                results[0][0].senderId,
                                                                notificationTemplaterRes.parsedTpl,
                                                                31,
                                                                0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                                                (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                                                0,
                                                                0,
                                                                0,
                                                                0,
                                                                1,
                                                                moment().format("YYYY-MM-DD HH:mm:ss"),
                                                                '',
                                                                0,
                                                                0,
                                                                null,
                                                                '',
                                                                /** Data object property to be sent with notification **/
                                                                {
                                                                    isRelationExist : 1,
                                                                    messageList:{
                                                                        messageId : results[0][0].messageId,
                                                                        message : results[0][0].message,
                                                                        createdDate : results[0][0].createdDate,
                                                                        messageType : req.body.messageType,
                                                                        messageStatus : results[0][0].messageStatus,
                                                                        priority : req.body.priority,
                                                                        senderName : results[0][0].senderName,
                                                                        senderId : results[0][0].senderId,
                                                                        receiverId : results[1][i].receiverGroupId,
                                                                        groupId : senderGroupId,
                                                                        groupType : results[0][0].groupType
                                                                    },
                                                                    contactList : {
                                                                        groupId :senderGroupId,
                                                                        adminEzeId : results[3][0].adminEzeId,
                                                                        adminId : results[3][0].adminId,
                                                                        groupName : results[3][0].groupName,
                                                                        groupStatus : results[3][0].groupStatus,
                                                                        isAdmin : results[3][0].isAdminNew,
                                                                        areMembersVisible : results[3][0].areMembersVisible,
                                                                        isReplyRestricted : results[3][0].isReplyRestricted,
                                                                        groupRelationStatus : results[3][0].groupRelationStatus,
                                                                        luDate : results[3][0].luDate,
                                                                        isRequester : results[3][0].isRequester,
                                                                        unreadCount : results[3][0].unreadCount,
                                                                        luUser : results[3][0].luUser,
                                                                        aboutGroup : results[3][0].aboutGroup,
                                                                        memberCount : results[3][0].memberCount,
                                                                        autoJoin : results[3][0].autoJoin,
                                                                        groupType : results[0][0].groupType
                                                                    }
                                                                },
                                                                null,tokenResult[0].isWhatMate,
                                                                results[1][i].secretKey);
                                                            console.log('postNotification : notification for compose_message is sent successfully');
                                                        }
                                                        else{
                                                            console.log('Error in parsing notification compose_message template - ',
                                                                notificationTemplaterRes.error);
                                                            console.log('postNotification : notification for compose_message is sent successfully');
                                                        }
                                                    }

                                                }
                                            }

                                        }
                                        /**
                                         * if getting no affected rows then send response with status false and gove error message
                                         * */
                                        else {
                                            responseMessage.status = false;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Something went wrong while sending message ! Please try again';
                                            responseMessage.data = null;
                                            res.status(400).json(responseMessage);
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
            console.log('Error p_v1_ComposeMessage : ', ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
});

/**
 * saveAttachment API for message
 * @method POST
 * @service-param token <string>
 * @serivce-param attachmentFile <binaryFileObject>
 *
 * @resp Google cloud storage link of attachment file with thumbnail if it is an image
 */
router.post('/attachment',function(req,res,next){

    var responseMessage = {
        status : false,
        message : "",
        error : {},
        data : null
    };

    /**
     * Validating token
     */
    req.st.validateToken(req.query.token,function(err,tokeResult){
        if(!err){
            if(tokeResult && req.files &&  req.files.attachmentFile){


                var attachmentFileName = req.st.libs.uuid.v4() +
                    ((req.files.attachmentFile.extension) ? ('.' + req.files.attachmentFile.extension) : '');

                /**
                 * Checking MIME type and based on it only prepare a thumbnail link
                 * If MIME type is other than image (parsable formats eg. JPG,PNG) than thumbnail will be picked from
                 * the available list otherwise it will be generated
                 */

                console.log('req.files.attachmentFile',req.files.attachmentFile);
                if(thumbnailConfig.imageMimeList.indexOf(req.files.attachmentFile.mimetype) != -1){

                    /**
                     * Create a thumbnail here and upload originalFile as well as thumbnail to google cloud
                     */


                    req.st.uploadDocumentToCloud = req.st.libs.Promise.promisify(req.st.uploadDocumentToCloud);

                    var uploadTaskList = [
                        req.st.uploadDocumentToCloud(attachmentFileName,req.st.libs.fs.createReadStream(req.files.attachmentFile.path)),
                        req.st.uploadDocumentToCloud('tn_'+attachmentFileName,gm(req.files.attachmentFile.path).resize(15,15).autoOrient().quality(0).stream(req.files.attachmentFile.extension))
                    ];



                    req.st.libs.Promise.all(uploadTaskList).then(function() {
                        responseMessage.status = true;
                        responseMessage.data = {
                            attachmentLink : req.CONFIG.CONSTANT.GS_URL +
                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attachmentFileName,
                            fileName : req.files.attachmentFile.originalname,
                            mimeType : req.files.attachmentFile.mimetype,
                            thumbnailLink : req.CONFIG.CONSTANT.GS_URL +
                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + 'tn_'+attachmentFileName
                        };
                        responseMessage.message = "File uploaded successfully";
                        responseMessage.error = null;
                        res.status(200).json(responseMessage);
                    },function(){
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'An error occurred !';
                        res.status(500).json(responseMessage);
                        console.log('Error :', err);
                        var errorDate = new Date();
                        console.log(errorDate.toTimeString() + ' ......... error ...........');
                    });


                    //req.st.uploadDocumentToCloud(attachmentFileName,gm(req.files.attachmentFile.path).resize(15,15).autoOrient().quality(0).stream(req.files.attachmentFile.extension),function(err){
                    //    if(!err){
                    //        responseMessage.error = {
                    //            server: 'Internal Server Error'
                    //        };
                    //        responseMessage.message = 'An error occurred !';
                    //        res.status(500).json(responseMessage);
                    //        console.log('Error :', err);
                    //        var errorDate = new Date();
                    //        console.log(errorDate.toTimeString() + ' ......... error ...........');
                    //    }
                    //});

                }
                else {

                    //req.files.attachmentFile.mimetype
                    //req.files.attachmentFile.originalname

                    req.st.uploadDocumentToCloud(attachmentFileName, req.st.libs.fs.createReadStream(req.files.attachmentFile.path), function (err) {
                        if (err) {
                            responseMessage.error = {
                                server: 'Internal Server Error'
                            };
                            responseMessage.message = 'An error occurred !';
                            res.status(500).json(responseMessage);
                            console.log('Error :', err);
                            var errorDate = new Date();
                            console.log(errorDate.toTimeString() + ' ......... error ...........');
                        }
                        else{
                            responseMessage.status = true;
                            responseMessage.data = {
                                attachmentLink : req.CONFIG.CONSTANT.GS_URL +
                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attachmentFileName,
                                fileName : req.files.attachmentFile.originalname,
                                mimeType : req.files.attachmentFile.mimetype,
                                thumbnailLink : req.st.getThumbnailLinkFromMime(req.files.attachmentFile.mimetype)
                            };
                            responseMessage.message = "File uploaded successfully";
                            responseMessage.error = null;
                            res.status(200).json(responseMessage);
                        }
                    });
                }
            }
            else{
                responseMessage.error = {
                    token: 'Invalid token'
                };
                responseMessage.message = 'Please login to continue';
                res.status(401).json(responseMessage);
                console.log('Error :', err);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
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
    /**
     * pageNo and limit is for pagination
     * flag: if flag is 0 then latest message will come according to pagination
     * and if not 0 then older messages will come
     * */
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};
    req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
    req.query.limit = (req.query.limit) ? (req.query.limit):100;
    req.query.flag = (req.query.flag) ? (req.query.flag):0;

    if(req.query.lastSyncTimeStamp){
        if(moment(req.query.lastSyncTimeStamp,'YYYY-MM-DD HH:mm:ss').isValid()){
            req.query.lastSyncTimeStamp = moment(req.query.lastSyncTimeStamp,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
        }
        else{
            error.lastSyncTimeStamp = 'Invalid timeStamp';
            validationFlag *= false;
        }
    }
    else{
        req.query.lastSyncTimeStamp = null;

    }

    if(req.query.currentTimeStamp){
        if(moment(req.query.currentTimeStamp,'YYYY-MM-DD HH:mm:ss').isValid()){
            req.query.currentTimeStamp = moment(req.query.currentTimeStamp,'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
        }
        else{
            error.currentTimeStamp = 'Invalid timeStamp';
            validationFlag *= false;
        }
    }
    else{
        error.currentTimeStamp = 'Invalid timeStamp';
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
                            req.db.escape(req.query.pageNo), req.db.escape(req.query.limit) ,
                            req.db.escape( req.query.lastSyncTimeStamp),
                            req.db.escape(req.query.currentTimeStamp)
                        ];
                        var procQuery = 'CALL p_v1_LoadMessagesofGroup(' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err) {
                                //console.log(results,"results");
                                if (results && results[0] && results[0].length > 0) {
                                    var messageObj;
                                    for(var messageCounter = 0;messageCounter < results[0].length;messageCounter++){
                                        switch (results[0][messageCounter].messageType) {
                                            case 0:
                                                message = results[0][messageCounter].message;
                                                break;

                                            case 2 :
                                                message = results[0][messageCounter].message;
                                                messageObj = JSON.parse(message);
                                                messageObj.attachmentLink = (messageObj.attachmentLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + req.st.getOnlyAttachmentName(messageObj.attachmentLink)) : '';
                                                messageObj.thumbnailLink = (messageObj.thumbnailLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + req.st.getOnlyAttachmentName(messageObj.thumbnailLink)) : '';
                                                results[0][messageCounter].message = messageObj;
                                                break;
                                            case 3:
                                                message = results[0][messageCounter].message;
                                                console.log("-----------------------------------------------------------");
                                                console.log(message);
                                                console.log("-----------------------------------------------------------");
                                                messageObj = JSON.parse(message);

                                                messageObj.attachmentLink = (messageObj.attachmentLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + req.st.getOnlyAttachmentName(messageObj.attachmentLink)) : '';
                                                messageObj.thumbnailLink = (messageObj.thumbnailLink) ? (req.CONFIG.CONSTANT.GS_URL +
                                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + req.st.getOnlyAttachmentName(messageObj.thumbnailLink)) : '';
                                                results[0][messageCounter].message = messageObj;
                                                break;

                                            default:
                                                break;
                                        }

                                    }
                                    //console.log(results[0],"results[0]");
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Messages of group loaded successfully';
                                    responseMessage.totalCount = (results[1] && results[1][0] && results[1][0].count) ? results[1][0].count : 0;
                                    var output =[];
                                    for (var i = 0; i < results[0].length; i++ ) {
                                        output.push({
                                            messageId: results[0][i].messageId,
                                            message: results[0][i].message,
                                            messageLink: results[0][i].messageLink,
                                            createdDate: results[0][i].createdDate,
                                            messageType: results[0][i].messageType,
                                            messageStatus: results[0][i].messageStatus,
                                            priority: results[0][i].priority,
                                            senderName: results[0][i].senderName,
                                            senderId: results[0][i].senderId,
                                            receiverId: results[0][i].receiverId,
                                            expiryDate: results[0][i].expiryDate,
                                            transId : results[0][i].transId ? results[0][i].transId : 0,
                                            formId : results[0][i].formId ? results[0][i].formId : 0,
                                            currentStatus : results[0][i].currentStatus ? results[0][i].currentStatus : 0,
                                            currentTransId : results[0][i].currentTransId ? results[0][i].currentTransId : 0,
                                            parentId : results[0][i].parentId ? results[0][i].parentId : 0,
                                            accessUserType : results[0][i].accessUserType ? results[0][i].accessUserType : 0,
                                            heUserId : results[0][i].heUserId ? results[0][i].heUserId : 0,
                                            formData : results[0][i].formDataJSON ? JSON.parse(results[0][i].formDataJSON) : null
                                        });
                                    }

                                    // console.log("results[5][0].GCM_Id",results[5][0].GCM_Id);
                                    responseMessage.data = {
                                        messageList : output,
                                        deleteMessageIdList : [],
                                        feedback : (results[2]) ? results[2] : [],
                                        APNSId : (results[3] && results[3][0]) ? JSON.parse(results[3][0].APNS_Id) : [],
                                        GCMId : (results[4] && results[4][0]) ? JSON.parse(results[4][0].GCM_Id) : []
                                        // supportFeedback : (results[4]) ? results[4] : []
                                    };

                                    // console.log('deleteMessageIdList',results[2]);
                                    var buf = new Buffer(JSON.stringify(responseMessage.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        responseMessage.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(responseMessage);
                                    });

                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.totalCount = 0;
                                    responseMessage.message = 'Messages of group not available';
                                    // console.log("results[5][0].GCM_Id",results[5][0].GCM_Id);
                                    responseMessage.data = {
                                        messageList : [],
                                        deleteMessageIdList : [],
                                        APNSId : (results[3] && results[3][0]) ? JSON.parse(results[3][0].APNS_Id) : [],
                                        GCMId : (results[4] && results[4][0]) ? JSON.parse(results[4][0].GCM_Id) : []
                                    };
                                    var buf = new Buffer(JSON.stringify(responseMessage.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        responseMessage.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(responseMessage);
                                    });
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

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @param token* <string> token of login user
 * @param messageIdList <JSON Array of integers>
 * @discription : API to delete message which can be multipe or single
 */
router.post('/delete', function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};
    /**
     * validating that input p
     * */
    if(req.is('json')){
        var messageIdList = req.body.messageIdList;
        console.log(req.body,"req.body");
        if(!messageIdList){
            error.messageIdList = 'Invalid message Id';
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
                req.st.validateToken(req.body.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var comDeleteMessageQuery = "";
                            for (var i = 0; i < messageIdList.length; i++) {
                                var procParams = [
                                    req.db.escape(req.body.token) ,
                                    req.db.escape(messageIdList[i].messageId)
                                ];
                                var procQuery = 'CALL p_v1_deletemessage(' + procParams.join(',') + ');';
                                comDeleteMessageQuery += procQuery;
                                console.log(comDeleteMessageQuery);
                                console.log(procQuery);
                            }
                            req.db.query(comDeleteMessageQuery, function (err, deleteMessageResults) {
                                if (!err) {
                                    //console.log(results,"results");
                                    if (deleteMessageResults && deleteMessageResults[0] && deleteMessageResults[0].length > 0) {
                                        var outputArray=[];
                                        //id = insertResult[0][0] ? insertResult[0][0].id : 0;
                                        for(var j=0; j < deleteMessageResults.length/2; j++) {
                                            var result = {};
                                            var count = (j) ? 2 * j : 0;
                                            result.messageId = messageIdList[j].messageId;
                                            if (deleteMessageResults[count][0]._e == 'DELETED') {
                                                result.status = true;
                                            }
                                            else {
                                                result.status = false;
                                            }

                                            outputArray.push(result);
                                        }


                                        var notificationTemplaterRes = notificationTemplater.parse('message_deleted', {
                                            groupName: tokenResult[0].ezeoneId
                                        });
                                        console.log(notificationTemplaterRes.parsedTpl, "notificationTemplaterRes.parsedTpl");
                                        if (notificationTemplaterRes.parsedTpl) {
                                            notification.publish(
                                                tokenResult[0].groupId,
                                                '',
                                                tokenResult[0].ezeoneId,
                                                tokenResult[0].groupId,
                                                notificationTemplaterRes.parsedTpl,
                                                39,
                                                0, '',
                                                0,
                                                0,
                                                0,
                                                0,
                                                1,
                                                moment().format("YYYY-MM-DD HH:mm:ss"),
                                                '',
                                                0,
                                                0,
                                                null,
                                                '',
                                                /** Data object property to be sent with notification **/
                                                {
                                                    deleteMessageIdList: outputArray
                                                },
                                                null,tokenResult[0].isWhatMate);
                                            console.log('postNotification : notification for delete messages sent successfully');


                                        }



                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Message is deleted successfully';
                                        responseMessage.data = {
                                            messageIdList : outputArray
                                        };
                                        res.status(200).json(responseMessage);
                                    }
                                    else {
                                        responseMessage.status = false;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Message is not deleted';
                                        responseMessage.data = {
                                            messageIdList : []
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
                                    console.log('Error : p_v1_deletemessage ', err);
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
                console.log('Error delete_message : ', ex);
                var errorDate = new Date();
                console.log(errorDate.toTimeString() + ' ......... error ...........');
            }
        }
    }
    else{
        responseMessage.error = "Accepted content type is json only";
        res.status(400).json(responseMessage);
    }
});

router.post('/delete/all', function(req,res,next){
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

    if (!req.query.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }

    if (!validationFlag){
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
                    req.st.db.escape(req.query.groupId)
                ];

                var procQuery = 'CALL p_v1_delete_allmessages( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, messageData) {
                    if (!err && messageData && messageData[0] && messageData[0][0] && messageData[0][0].error ) {
                        switch (messageData[0][0].error) {
                            case 'ACCESS_DENIED' :
                                response.status = false;
                                response.message = "Access denied";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                            case 'MESSAGE_SENT' :
                                response.status = false;
                                response.message = "Message can't be deleted.";
                                response.error = null;
                                res.status(200).json(response);
                                break ;

                            default:
                                break;
                        }

                    }
                    else if (!err ) {
                        response.status = true;
                        response.message = "Messages deleted successfully";
                        response.error = null;
                        response.data = {
                            groupId : messageData[0][0].groupId
                        } ;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while deleting messages ";
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
});

module.exports = router;


