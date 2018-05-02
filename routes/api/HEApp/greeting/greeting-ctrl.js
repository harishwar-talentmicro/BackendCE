/**
 * Created by vedha on 15-06-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var greetingCtrl = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

greetingCtrl.sendGreeting = function(req,res,next){
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
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    var groupList =req.body.groupList;
                    if(typeof(groupList) == "string") {
                        groupList = JSON.parse(groupList);
                    }
                    if(!groupList){
                        groupList = [];
                    }
                
                    var memberList =req.body.memberList;
                    if(typeof(memberList) == "string") {
                        memberList = JSON.parse(memberList);
                    }
                    if(!memberList){
                        memberList = [];
                    }
                
                    var senderGroupId;
                
                    if (!validationFlag){
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                        req.body.message = req.body.message ? req.body.message : '';
                        req.body.notes = req.body.notes ? req.body.notes : '';
                        req.body.status = req.body.status ? req.body.status : 0;
                        req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                        req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                        req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                        req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                        req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                        req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;
                        req.body.greetingImage = req.body.greetingImage ? req.body.greetingImage : '';
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
        
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.message),
                            req.st.db.escape(req.body.notes),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.approverNotes),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(JSON.stringify(memberList)),
                            req.st.db.escape(JSON.stringify(groupList)),
                            req.st.db.escape(req.body.approverCount),
                            req.st.db.escape(req.body.greetingImage),
                            req.st.db.escape(req.body.receiverCount),
                            req.st.db.escape(DBSecretKey)                                                                                                            
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
        
                        var procQuery = 'CALL HE_save_greeting( ' + procParams.join(',') + ')';
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
                                        console.log(results[1][0].senderId , "results[1][0].senderIdresults[1][0].senderIdresults[1][0].senderId");
                                        notification.publish(
                                            results[1][i].receiverId,
                                            (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                            (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                            results[1][0].senderId,
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
                                                },
                                                contactList : null
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
                                response.message = "Greeting sent successfully";
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
                                        groupId: req.body.groupId,
                                        receiverId: results[0][0].receiverId,
                                        transId : results[0][0].transId,
                                        formId : results[0][0].formId,
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
                                response.message = "Error while sending greeting";
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

module.exports = greetingCtrl;