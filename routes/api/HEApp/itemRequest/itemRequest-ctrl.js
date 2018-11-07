/**
 * Created by Jana1 on 20-04-2017.
 */


var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var itemRequestCtrl = {};
var error = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

itemRequestCtrl.saveStationaryRequest = function(req,res,next){
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    var itemList =req.body.itemList;
                    if(typeof(itemList) == "string") {
                        itemList = JSON.parse(itemList);
                    }
                    if(!itemList){
                        error.itemList = 'Invalid itemList';
                        validationFlag *= false;
                    }
                    var keywordList =req.body.keywordList;
                        if(typeof(keywordList) == "string") {
                            keywordList = JSON.parse(keywordList);
                        }
                        if(!keywordList){
                            keywordList = [];
                        }

                        var attachmentList =req.body.attachmentList;
                        if(typeof(attachmentList) == "string") {
                            attachmentList = JSON.parse(attachmentList);
                        }
                        if(!attachmentList){
                            attachmentList = [];
                        }

                    var senderGroupId;
                
                    if (!validationFlag){
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                    }
                    else{
                        req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                        req.body.status = req.body.status ? req.body.status : 1;
                        req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                        req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                        req.body.itemDelivered = req.body.itemDelivered ? req.body.itemDelivered : 0;
                        req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                        req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                        req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                        req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                        req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                        req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';
        
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.deliveryLocation),
                            req.st.db.escape(req.body.senderNotes),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.approverNotes),
                            req.st.db.escape(req.body.itemDelivered),
                            req.st.db.escape(req.body.receiverNotes),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(JSON.stringify(itemList)),
                            req.st.db.escape(req.body.approverCount),
                            req.st.db.escape(req.body.receiverCount),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.timestamp),
                            req.st.db.escape(req.body.createdTimeStamp),
                            req.st.db.escape(JSON.stringify(attachmentList))
                        ];
                        
                        var stationaryFormId=1008;
                        var keywordsParams=[
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(stationaryFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)  
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_save_stationaryRequest_new( ' + procParams.join(',') + '); CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery,function(err,results){
                            console.log(results);
                            if(!err && results && results[0] ){
                                senderGroupId = results[0][0].senderId;
                                // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                                //     senderName : results[0][0].message
                                // });
                                //
                                // for (var i = 0; i < results[1].length; i++ ) {
                                //     if (notificationTemplaterRes.parsedTpl) {
                                //         notification.publish(
                                //             results[1][i].receiverId,
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             results[0][0].senderId,
                                //             notificationTemplaterRes.parsedTpl,
                                //             31,
                                //             0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                //             (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                //             0,
                                //             0,
                                //             0,
                                //             0,
                                //             1,
                                //             moment().format("YYYY-MM-DD HH:mm:ss"),
                                //             '',
                                //             0,
                                //             0,
                                //             null,
                                //             '',
                                //             /** Data object property to be sent with notification **/
                                //             {
                                //                 messageList: {
                                //                     messageId: results[1][i].messageId,
                                //                     message: results[1][i].message,
                                //                     messageLink: results[1][i].messageLink,
                                //                     createdDate: results[1][i].createdDate,
                                //                     messageType: results[1][i].messageType,
                                //                     messageStatus: results[1][i].messageStatus,
                                //                     priority: results[1][i].priority,
                                //                     senderName: results[1][i].senderName,
                                //                     senderId: results[1][i].senderId,
                                //                     receiverId: results[1][i].receiverId,
                                //                     groupId: results[1][i].senderId,
                                //                     groupType: 2,
                                //                     transId : results[1][i].transId,
                                //                     formId : results[1][i].formId,
                                //                     currentStatus : results[1][i].currentStatus,
                                //                     currentTransId : results[1][i].currentTransId,
                                //                     parentId : results[1][i].parentId,
                                //                     accessUserType : results[1][i].accessUserType,
                                //                     heUserId : results[1][i].heUserId,
                                //                     formData : JSON.parse(results[1][i].formDataJSON)
                                //
                                //                 }
                                //             },
                                //             null,
                                //             tokenResult[0].isWhatMate,
                                //             results[1][i].secretKey);
                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                //     }
                                //     else {
                                //         console.log('Error in parsing notification compose_message template - ',
                                //             notificationTemplaterRes.error);
                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                //     }
                                // }
                                notifyMessages.getMessagesNeedToNotify();
                                response.status = true;
                                response.message = "Stationary request saved successfully";
                                response.error = null;
                                response.data = {
                                    messageList: {
                                        messageId: results[0][0].messageId,
                                        message: results[0][0].message,
                                        messageLink: results[0][0].messageLink,
                                        createdDate: results[0][0].createdDate,
                                        messageType: results[0][0].messageType,
                                        messageStatus: results[0][0].messageStatus,
                                        priority: results[0][0].priority,
                                        senderName: results[0][0].senderName,
                                        senderId: results[0][0].senderId,
                                        receiverId: results[0][0].receiverId,
                                        transId : results[0][0].transId,
                                        formId : results[0][0].formId,
                                        groupId: req.body.groupId,
                                        currentStatus : results[0][0].currentStatus,
                                        currentTransId : results[0][0].currentTransId,
                                        localMessageId : req.body.localMessageId,
                                        parentId : results[0][0].parentId,
                                        accessUserType : results[0][0].accessUserType,
                                        heUserId : results[0][0].heUserId,
                                        formData : JSON.parse(results[0][0].formDataJSON)
                                    }
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else{
                                response.status = false;
                                response.message = "Error while saving Stationary request";
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

itemRequestCtrl.savePantryRequest = function(req,res,next){
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    var itemList =req.body.itemList;
                    if(typeof(itemList) == "string") {
                        itemList = JSON.parse(itemList);
                    }
                    if(!itemList){
                        error.itemList = 'Invalid itemList';
                        validationFlag *= false;
                    }
                    var keywordList =req.body.keywordList;
                        if(typeof(keywordList) == "string") {
                            keywordList = JSON.parse(keywordList);
                        }
                        if(!keywordList){
                            keywordList = [];
                        }

                        var attachmentList =req.body.attachmentList;
                        if(typeof(attachmentList) == "string") {
                            attachmentList = JSON.parse(attachmentList);
                        }
                        if(!attachmentList){
                            attachmentList = [];
                        }

                    var senderGroupId;
                
                    if (!validationFlag){
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                    }
                    else {
                        req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                        req.body.status = req.body.status ? req.body.status : 1;
                        req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                        req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                        req.body.itemDelivered = req.body.itemDelivered ? req.body.itemDelivered : 0;
                        req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                        req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                        req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                        req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                        req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                        req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';
        
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.deliveryLocation),
                            req.st.db.escape(req.body.senderNotes),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.approverNotes),
                            req.st.db.escape(req.body.itemDelivered),
                            req.st.db.escape(req.body.receiverNotes),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(JSON.stringify(itemList)),
                            req.st.db.escape(req.body.approverCount),
                            req.st.db.escape(req.body.receiverCount),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.timestamp),
                            req.st.db.escape(req.body.createdTimeStamp),
                            req.st.db.escape(JSON.stringify(attachmentList))
                        ];

                        var pantryFormId=1009;
                        var keywordsParams=[
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(pantryFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)  
                        ];

                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_save_pantryRequest_new( ' + procParams.join(',') + '); CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery,function(err,results){
                            console.log(results);
                            if(!err && results && results[0] ){
                                senderGroupId = results[0][0].senderId;
                                // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                                //     senderName : results[0][0].message
                                // });
                                //
                                // for (var i = 0; i < results[1].length; i++ ) {
                                //     if (notificationTemplaterRes.parsedTpl) {
                                //         notification.publish(
                                //             results[1][i].receiverId,
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             results[0][0].senderId,
                                //             notificationTemplaterRes.parsedTpl,
                                //             31,
                                //             0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                //             (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                //             0,
                                //             0,
                                //             0,
                                //             0,
                                //             1,
                                //             moment().format("YYYY-MM-DD HH:mm:ss"),
                                //             '',
                                //             0,
                                //             0,
                                //             null,
                                //             '',
                                //             /** Data object property to be sent with notification **/
                                //             {
                                //                 messageList: {
                                //                     messageId: results[1][i].messageId,
                                //                     message: results[1][i].message,
                                //                     messageLink: results[1][i].messageLink,
                                //                     createdDate: results[1][i].createdDate,
                                //                     messageType: results[1][i].messageType,
                                //                     messageStatus: results[1][i].messageStatus,
                                //                     priority: results[1][i].priority,
                                //                     senderName: results[1][i].senderName,
                                //                     senderId: results[1][i].senderId,
                                //                     receiverId: results[1][i].receiverId,
                                //                     groupId: results[1][i].senderId,
                                //                     groupType: 2,
                                //                     transId : results[1][i].transId,
                                //                     formId : results[1][i].formId,
                                //                     currentStatus : results[1][i].currentStatus,
                                //                     currentTransId : results[1][i].currentTransId,
                                //                     parentId : results[1][i].parentId,
                                //                     accessUserType : results[1][i].accessUserType,
                                //                     heUserId : results[1][i].heUserId,
                                //                     formData : JSON.parse(results[1][i].formDataJSON)
                                //
                                //                 }
                                //             },
                                //             null,
                                //             tokenResult[0].isWhatMate,
                                //             results[1][i].secretKey);
                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                //     }
                                //     else {
                                //         console.log('Error in parsing notification compose_message template - ',
                                //             notificationTemplaterRes.error);
                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                //     }
                                // }
                                notifyMessages.getMessagesNeedToNotify();
                                response.status = true;
                                response.message = "Pantry request saved successfully";
                                response.error = null;
                                response.data = {
                                    messageList: {
                                        messageId: results[0][0].messageId,
                                        message: results[0][0].message,
                                        messageLink: results[0][0].messageLink,
                                        createdDate: results[0][0].createdDate,
                                        messageType: results[0][0].messageType,
                                        messageStatus: results[0][0].messageStatus,
                                        priority: results[0][0].priority,
                                        senderName: results[0][0].senderName,
                                        senderId: results[0][0].senderId,
                                        receiverId: results[0][0].receiverId,
                                        transId : results[0][0].transId,
                                        formId : results[0][0].formId,
                                        groupId: req.body.groupId,
                                        currentStatus : results[0][0].currentStatus,
                                        currentTransId : results[0][0].currentTransId,
                                        localMessageId : req.body.localMessageId,
                                        parentId : results[0][0].parentId,
                                        accessUserType : results[0][0].accessUserType,
                                        heUserId : results[0][0].heUserId,
                                        formData : JSON.parse(results[0][0].formDataJSON)
                                    }
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else{
                                response.status = false;
                                response.message = "Error while saving pantry request";
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

itemRequestCtrl.saveAssetRequest = function(req,res,next){
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    var itemList =req.body.itemList;
                    if(typeof(itemList) == "string") {
                        itemList = JSON.parse(itemList);
                    }
                    if(!itemList){
                        error.itemList = 'Invalid itemList';
                        validationFlag *= false;
                    }
                    var attachmentList =req.body.attachmentList;
                    if(typeof(attachmentList) == "string") {
                        attachmentList = JSON.parse(attachmentList);
                    }
                    if(!attachmentList){
                        attachmentList = [];
                    }
                    var keywordList =req.body.keywordList;
                        if(typeof(keywordList) == "string") {
                            keywordList = JSON.parse(keywordList);
                        }
                        if(!keywordList){
                            keywordList = [];
                        }

                    var senderGroupId;
                
                    if (!validationFlag){
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                    }
                    else {
                        console.log(req.body.assetPriority,"req.body.assetPriority");
                        req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                        req.body.status = req.body.status ? req.body.status : 1;
                        req.body.assetPriority = (req.body.assetPriority == undefined) ? 1 : req.body.assetPriority;
                        console.log(req.body.assetPriority,"req.body.assetPriority");
        
                        req.body.assetRequiredDate = req.body.assetRequiredDate ? req.body.assetRequiredDate : null;
                        req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                        req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                        req.body.itemDelivered = req.body.itemDelivered ? req.body.itemDelivered : 0;
                        req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                        req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                        req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                        req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                        req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                        req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';
        
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.assetPriority),
                            req.st.db.escape(req.body.assetRequiredDate),
                            req.st.db.escape(req.body.senderNotes),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.approverNotes),
                            req.st.db.escape(req.body.itemDelivered),
                            req.st.db.escape(req.body.receiverNotes),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(JSON.stringify(itemList)),
                            req.st.db.escape(req.body.approverCount),
                            req.st.db.escape(req.body.receiverCount),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.timestamp),
                            req.st.db.escape(req.body.createdTimeStamp),
                            req.st.db.escape(JSON.stringify(attachmentList))
            ];

                        var assestFormId=1018;
                        var keywordsParams=[
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(assestFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)  
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_save_assetRequest_new( ' + procParams.join(',') + '); CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery,function(err,results){
                            console.log(results);
                            if(!err && results && results[0] ){
                                senderGroupId = results[0][0].senderId;
                                // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                                //     senderName : results[0][0].message
                                // });
                                //
                                // for (var i = 0; i < results[1].length; i++ ) {
                                //     if (notificationTemplaterRes.parsedTpl) {
                                //         notification.publish(
                                //             results[1][i].receiverId,
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             results[0][0].senderId,
                                //             notificationTemplaterRes.parsedTpl,
                                //             31,
                                //             0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                //             (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                //             0,
                                //             0,
                                //             0,
                                //             0,
                                //             1,
                                //             moment().format("YYYY-MM-DD HH:mm:ss"),
                                //             '',
                                //             0,
                                //             0,
                                //             null,
                                //             '',
                                //             /** Data object property to be sent with notification **/
                                //             {
                                //                 messageList: {
                                //                     messageId: results[1][i].messageId,
                                //                     message: results[1][i].message,
                                //                     messageLink: results[1][i].messageLink,
                                //                     createdDate: results[1][i].createdDate,
                                //                     messageType: results[1][i].messageType,
                                //                     messageStatus: results[1][i].messageStatus,
                                //                     priority: results[1][i].priority,
                                //                     senderName: results[1][i].senderName,
                                //                     senderId: results[1][i].senderId,
                                //                     receiverId: results[1][i].receiverId,
                                //                     groupId: results[1][i].senderId,
                                //                     groupType: 2,
                                //                     transId : results[1][i].transId,
                                //                     formId : results[1][i].formId,
                                //                     currentStatus : results[1][i].currentStatus,
                                //                     currentTransId : results[1][i].currentTransId,
                                //                     parentId : results[1][i].parentId,
                                //                     accessUserType : results[1][i].accessUserType,
                                //                     heUserId : results[1][i].heUserId,
                                //                     formData : JSON.parse(results[1][i].formDataJSON)
                                //
                                //                 }
                                //             },
                                //             null,tokenResult[0].isWhatMate,
                                //             results[1][i].secretKey);
                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                //     }
                                //     else {
                                //         console.log('Error in parsing notification compose_message template - ',
                                //             notificationTemplaterRes.error);
                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                //     }
                                // }
                                notifyMessages.getMessagesNeedToNotify();
                                response.status = true;
                                response.message = "Asset request saved successfully";
                                response.error = null;
                                response.data = {
                                    messageList: {
                                        messageId: results[0][0].messageId,
                                        message: results[0][0].message,
                                        messageLink: results[0][0].messageLink,
                                        createdDate: results[0][0].createdDate,
                                        messageType: results[0][0].messageType,
                                        messageStatus: results[0][0].messageStatus,
                                        priority: results[0][0].priority,
                                        senderName: results[0][0].senderName,
                                        senderId: results[0][0].senderId,
                                        receiverId: results[0][0].receiverId,
                                        transId : results[0][0].transId,
                                        formId : results[0][0].formId,
                                        groupId: req.body.groupId,
                                        currentStatus : results[0][0].currentStatus,
                                        currentTransId : results[0][0].currentTransId,
                                        localMessageId : req.body.localMessageId,
                                        parentId : results[0][0].parentId,
                                        accessUserType : results[0][0].accessUserType,
                                        heUserId : results[0][0].heUserId,
                                        formData : JSON.parse(results[0][0].formDataJSON)
                                    }
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else{
                                response.status = false;
                                response.message = "Error while saving asset request";
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

itemRequestCtrl.saveDocRequestToHR = function(req,res,next){
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

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.docTypeId) {
                        error.docTypeId = 'Invalid docTypeId';
                        validationFlag *= false;
                    }
                    var attachmentList =req.body.attachmentList;
                    if(typeof(attachmentList) == "string") {
                        attachmentList = JSON.parse(attachmentList);
                    }
                    if(!attachmentList){
                        attachmentList = [];
                    }
                    var keywordList =req.body.keywordList;
                        if(typeof(keywordList) == "string") {
                            keywordList = JSON.parse(keywordList);
                        }
                        if(!keywordList){
                            keywordList = [];
                        }
                        
                    var senderGroupId;
                
                    if (!validationFlag){
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                    }
                    else {
                        req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                        req.body.docPriority = req.body.docPriority ? req.body.docPriority : 0;
                        req.body.docRequiredDate = req.body.docRequiredDate ? req.body.docRequiredDate : null;
                        req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                        req.body.delivered = req.body.delivered ? req.body.delivered : 0;
                        req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                        req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                        req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                        req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                        req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                        req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                        req.body.status = req.body.status ? req.body.status : 1;
                        req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';
        
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.docTypeId),
                            req.st.db.escape(req.body.docPriority),
                            req.st.db.escape(req.body.docRequiredDate),
                            req.st.db.escape(req.body.senderNotes),
                            req.st.db.escape(req.body.delivered),
                            req.st.db.escape(req.body.receiverNotes),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(req.body.approverCount),
                            req.st.db.escape(req.body.receiverCount),
                            req.st.db.escape(JSON.stringify(attachmentList)),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.approverNotes),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.timestamp),
                            req.st.db.escape(req.body.createdTimeStamp)
                        ];

                        var docrequestFormId=1022;
                        var keywordsParams=[
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(docrequestFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)  
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_save_docRequestToHR_new( ' + procParams.join(',') + '); CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery,function(err,results){
                            if(!err && results && results[0] ){
                                senderGroupId = results[0][0].senderId;
                                // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                                //     senderName : results[0][0].message
                                // });
                                //
                                // for (var i = 0; i < results[1].length; i++ ) {
                                //     if (notificationTemplaterRes.parsedTpl) {
                                //         notification.publish(
                                //             results[1][i].receiverId,
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             results[0][0].senderId,
                                //             notificationTemplaterRes.parsedTpl,
                                //             31,
                                //             0, (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
                                //             (results[1][i].GCM_Id) ? (results[1][i].GCM_Id) : '',
                                //             0,
                                //             0,
                                //             0,
                                //             0,
                                //             1,
                                //             moment().format("YYYY-MM-DD HH:mm:ss"),
                                //             '',
                                //             0,
                                //             0,
                                //             null,
                                //             '',
                                //             /** Data object property to be sent with notification **/
                                //             {
                                //                 messageList: {
                                //                     messageId: results[1][i].messageId,
                                //                     message: results[1][i].message,
                                //                     messageLink: results[1][i].messageLink,
                                //                     createdDate: results[1][i].createdDate,
                                //                     messageType: results[1][i].messageType,
                                //                     messageStatus: results[1][i].messageStatus,
                                //                     priority: results[1][i].priority,
                                //                     senderName: results[1][i].senderName,
                                //                     senderId: results[1][i].senderId,
                                //                     receiverId: results[1][i].receiverId,
                                //                     groupId: results[1][i].senderId,
                                //                     groupType: 2,
                                //                     transId : results[1][i].transId,
                                //                     formId : results[1][i].formId,
                                //                     currentStatus : results[1][i].currentStatus,
                                //                     currentTransId : results[1][i].currentTransId,
                                //                     parentId : results[1][i].parentId,
                                //                     accessUserType : results[1][i].accessUserType,
                                //                     heUserId : results[1][i].heUserId,
                                //                     formData : JSON.parse(results[1][i].formDataJSON)
                                //
                                //                 }
                                //             },
                                //             null,tokenResult[0].isWhatMate,
                                //             results[1][i].secretKey);
                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                //     }
                                //     else {
                                //         console.log('Error in parsing notification compose_message template - ',
                                //             notificationTemplaterRes.error);
                                //         console.log('postNotification : notification for compose_message is sent successfully');
                                //     }
                                // }
                                notifyMessages.getMessagesNeedToNotify();
                                response.status = true;
                                response.message = "Document request from HR saved successfully";
                                response.error = null;
                                response.data = {
                                    messageList: {
                                        messageId: results[0][0].messageId,
                                        message: results[0][0].message,
                                        messageLink: results[0][0].messageLink,
                                        createdDate: results[0][0].createdDate,
                                        messageType: results[0][0].messageType,
                                        messageStatus: results[0][0].messageStatus,
                                        priority: results[0][0].priority,
                                        senderName: results[0][0].senderName,
                                        senderId: results[0][0].senderId,
                                        receiverId: results[0][0].receiverId,
                                        transId : results[0][0].transId,
                                        formId : results[0][0].formId,
                                        groupId: req.body.groupId,
                                        currentStatus : results[0][0].currentStatus,
                                        currentTransId : results[0][0].currentTransId,
                                        localMessageId : req.body.localMessageId,
                                        parentId : results[0][0].parentId,
                                        accessUserType : results[0][0].accessUserType,
                                        heUserId : results[0][0].heUserId,
                                        formData : JSON.parse(results[0][0].formDataJSON)
                                    }
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else{
                                response.status = false;
                                response.message = "Error while saving document request to HR";
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

module.exports = itemRequestCtrl;