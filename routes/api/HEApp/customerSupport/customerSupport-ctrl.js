/**
 * Created by Jana1 on 31-07-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var supportCtrl = {};
var error = {};
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

supportCtrl.saveSupportRequest = function(req,res,next){
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

    if (!req.body.description) {
        error.description = 'Invalid description';
        validationFlag *= false;
    }

    var attachmentList =req.body.attachmentList;
    if(typeof(attachmentList) == "string") {
        attachmentList = JSON.parse(attachmentList);
    }
    if(!attachmentList){
        attachmentList = [] ;
    }
    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.clientId = req.body.clientId ? req.body.clientId : 0;
                req.body.categoryId = req.body.categoryId ? req.body.categoryId : 0;
                req.body.status = req.body.status ? req.body.status : 3;
                req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : "";
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : "";
                req.body.infoToSender = req.body.infoToSender ? req.body.infoToSender : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.clientName = req.body.clientName ? req.body.clientName : "";
                req.body.categoryTitle = req.body.categoryTitle ? req.body.categoryTitle : "";
                req.body.isInfoToSenderChanged = req.body.isInfoToSenderChanged ? req.body.isInfoToSenderChanged : 0;
                req.body.clientISDMobile = req.body.clientISDMobile ? req.body.clientISDMobile : "";
                req.body.clientMobile = req.body.clientMobile ? req.body.clientMobile : "";
                req.body.clientEmail = req.body.clientEmail ? req.body.clientEmail : "";
                req.body.clientCompany = req.body.clientCompany ? req.body.clientCompany : "";
                req.body.clientJobTitle = req.body.clientJobTitle ? req.body.clientJobTitle : "";
                req.body.priority = req.body.priority ? req.body.priority : 0;
                req.body.isdPhone  = req.body.isdPhone != undefined  ? req.body.isdPhone  : "";
                req.body.phoneNo  = req.body.phoneNo != undefined  ? req.body.phoneNo  : "";
                req.body.lastName  = req.body.lastName != undefined  ? req.body.lastName  : "";
                req.body.notes  = req.body.notes != undefined  ? req.body.notes  : "";
                req.body.contactId  = req.body.contactId != undefined  ? req.body.contactId  : 0;

                if(req.body.phoneNo == ""){
                    req.body.isdPhone = "";
                }

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.clientId),
                    req.st.db.escape(req.body.categoryId),
                    req.st.db.escape(req.body.description),
                    req.st.db.escape(req.body.priority),
                    req.st.db.escape(req.body.senderNotes),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.infoToSender),
                    req.st.db.escape(JSON.stringify(attachmentList)),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.clientName),
                    req.st.db.escape(req.body.categoryTitle),
                    req.st.db.escape(req.body.isInfoToSenderChanged),
                    req.st.db.escape(req.body.clientISDMobile),
                    req.st.db.escape(req.body.clientMobile),
                    req.st.db.escape(req.body.clientEmail),
                    req.st.db.escape(req.body.clientCompany),
                    req.st.db.escape(req.body.clientJobTitle),
                    req.st.db.escape(req.body.isdPhone),
                    req.st.db.escape(req.body.phoneNo),
                    req.st.db.escape(req.body.lastName),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.contactId)
                ];

                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_save_supportRequest_new( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err && results && results[0] ){
                        senderGroupId = results[0][0].senderId;
                        notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                            senderName : results[0][0].senderName
                        });

                        for (var i = 0; i < results[1].length; i++ ) {
                            if (notificationTemplaterRes.parsedTpl) {

                                var formDataJSON = JSON.parse(results[1][i].formDataJSON) ;

                                notification.publish(
                                    results[1][i].receiverId,
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
                                        messageList: {
                                            messageId: results[1][i].messageId,
                                            message: results[1][i].message,
                                            messageLink: results[1][i].messageLink,
                                            createdDate: results[1][i].createdDate,
                                            messageType: results[1][i].messageType,
                                            messageStatus: results[1][i].messageStatus,
                                            priority: results[1][i].priority,
                                            senderName: results[1][i].senderName,
                                            senderId: results[1][i].senderId,
                                            receiverId: results[1][i].receiverId,
                                            groupId: results[1][i].senderId,
                                            groupType: 2,
                                            transId : results[1][i].transId,
                                            formId : results[1][i].formId,
                                            currentStatus : results[1][i].currentStatus,
                                            currentTransId : results[1][i].currentTransId,
                                            parentId : results[1][i].parentId,
                                            accessUserType : results[1][i].accessUserType,
                                            heUserId : results[1][i].heUserId,
                                            formData : JSON.parse(results[1][i].formDataJSON)
                                        }
                                    },
                                    null,
                                    tokenResult[0].isWhatMate,
                                    results[1][i].secretKey);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                            else {
                                console.log('Error in parsing notification compose_message template - ',
                                    notificationTemplaterRes.error);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                        }

                        response.status = true;
                        response.message = "Support request saved successfully";
                        response.error = null;
                        var formDataJSON1 = JSON.parse(results[0][0].formDataJSON) ;
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
                                // formData : {
                                //     stage : formDataJSON1.stage,
                                //     amount : formDataJSON1.amount,
                                //     reason : formDataJSON1.reason,
                                //     status : formDataJSON1.status,
                                //     transId : formDataJSON1.transId,
                                //     clientId : formDataJSON1.clientId,
                                //     parentId : formDataJSON1.parentId,
                                //     changeLog : formDataJSON1.changeLog,
                                //     formTitle : formDataJSON1.formTitle,
                                //     categoryId : formDataJSON1.categoryId,
                                //     clientName : formDataJSON1.clientName,
                                //     currencyId : formDataJSON1.currencyId,
                                //     stageTitle : formDataJSON1.stageTitle,
                                //     probability : formDataJSON1.probability,
                                //     requirement : formDataJSON1.requirement,
                                //     senderNotes : formDataJSON1.senderNotes,
                                //     statusTitle : formDataJSON1.statusTitle,
                                //     infoToSender : formDataJSON1.infoToSender,
                                //     approverCount : formDataJSON1.approverCount,
                                //     assignHistory :  (formDataJSON1.assignHistory) ? JSON.parse(formDataJSON1.assignHistory) : null,
                                //     categoryTitle : formDataJSON1.categoryTitle,
                                //     currencyTitle : formDataJSON1.currencyTitle,
                                //     receiverCount : formDataJSON1.receiverCount,
                                //     receiverNotes : formDataJSON1.receiverNotes,
                                //     statusHistory : (formDataJSON1.statusHistory) ? JSON.parse(formDataJSON1.statusHistory) : null,
                                //     accessUserType : formDataJSON1.accessUserType,
                                //     attachmentList : (formDataJSON1.attachmentList) ? JSON.parse(formDataJSON1.attachmentList) : null
                                // }
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
                        response.message = "Error while saving support request";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }

};

supportCtrl.assignToUser = function(req,res,next){
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

    if (!req.body.memberId) {
        error.memberId = 'Invalid memberId';
        validationFlag *= false;
    }

    if (!req.body.groupId) {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }
    if (!req.body.parentId) {
        error.parentId = 'Invalid parentId';
        validationFlag *= false;
    }

    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.assignedReason = req.body.assignedReason ? req.body.assignedReason : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.memberId),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.assignedReason)
                ];
                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_assign_supportRequest( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err && results && results[0] ){
                        console.log("results[0].senderName",results[0][0].senderName);

                        senderGroupId = results[0][0].senderId;
                        notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                            senderName : results[0][0].senderName
                        });

                        for (var i = 0; i < results[0].length; i++ ) {
                            if (notificationTemplaterRes.parsedTpl) {

                                var formDataJSON = JSON.parse(results[0][i].formDataJSON) ;

                                notification.publish(
                                    results[0][i].receiverId,
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    results[0][0].senderId,
                                    notificationTemplaterRes.parsedTpl,
                                    31,
                                    0, (results[0][i].iphoneId) ? (results[0][i].iphoneId) : '',
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
                                        messageList: {
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
                                            groupId: results[0][i].senderId,
                                            groupType: 2,
                                            transId : results[0][i].transId,
                                            formId : results[0][i].formId,
                                            currentStatus : results[0][i].currentStatus,
                                            currentTransId : results[0][i].currentTransId,
                                            parentId : results[0][i].parentId,
                                            accessUserType : results[0][i].accessUserType,
                                            heUserId : results[0][i].heUserId,
                                            formData : JSON.parse(results[0][i].formDataJSON)

                                        }
                                    },
                                    null,
                                    tokenResult[0].isWhatMate,
                                    results[1][i].secretKey);

                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                            else {
                                console.log('Error in parsing notification compose_message template - ',
                                    notificationTemplaterRes.error);
                                console.log('postNotification : notification for compose_message is sent successfully');
                            }
                        }

                        response.status = true;
                        response.message = "Assigned successfully";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else if(!err)
                    {
                        response.status = true;
                        response.message = "Assigned successfully";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while assigning to member";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};


supportCtrl.getSupportTracker = function(req,res,next){
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
    if (!req.query.type) {
        error.type = 'Invalid type';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.type),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit)
                ];
                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL HE_get_supportTracker( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err && results && results[0] ){
                        response.status = true;
                        response.message = "support Tracker loaded successfully";
                        response.error = null;
                        response.data = {
                            chartData:results[0],
                            TransactionData:results[1],
                            count:results[2][0].count
                        } ;
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if(!err)
                    {
                        response.status = true;
                        response.message = "support Tracker loaded successfully";
                        response.error = null;
                        response.data = {
                            chartData : [],
                            transactionData : [],
                            count : 0
                        };

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading support Tracker";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};


module.exports = supportCtrl;