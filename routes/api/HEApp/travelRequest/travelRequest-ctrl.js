/**
 * Created by Jana1 on 18-04-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var travelRequestCtrl = {};
var error = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

travelRequestCtrl.saveTravelRequest = function(req,res,next){
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

    if (!req.body.starts) {
        error.starts = 'Invalid starts';
        validationFlag *= false;
    }

    if (!req.body.ends) {
        error.ends = 'Invalid ends';
        validationFlag *= false;
    }

    var attachmentList =req.body.attachmentList;
    if(typeof(attachmentList) == "string") {
        attachmentList = JSON.parse(attachmentList);
    }
    if(!attachmentList){
        attachmentList = [] ;
    }

    var travelRequests = req.body.travelRequests;
    if(typeof(travelRequests) == "string") {
        travelRequests = JSON.parse(travelRequests);
    }
    if(!travelRequests){
        travelRequests = [] ;
    }

    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.status = req.body.status ? req.body.status : 1;
                req.body.justification = req.body.justification ? req.body.justification : '';
                req.body.issuedAdvanceCurrencyId = req.body.issuedAdvanceCurrencyId ? req.body.issuedAdvanceCurrencyId : 0;
                req.body.issuedAdvanceAmount = req.body.issuedAdvanceAmount ? req.body.issuedAdvanceAmount : 0;

                req.body.requiredAdvanceCurrencyId = req.body.requiredAdvanceCurrencyId ? req.body.requiredAdvanceCurrencyId : 0;
                req.body.requiredAdvanceAmount = req.body.requiredAdvanceAmount ? req.body.requiredAdvanceAmount : 0.00;

                req.body.travelDeskMessage = req.body.travelDeskMessage ? req.body.travelDeskMessage : '';
                req.body.isAdvanceAmountIssued = req.body.isAdvanceAmountIssued ? req.body.isAdvanceAmountIssued : 0;
                req.body.isAdvanceAmountRequired = req.body.isAdvanceAmountRequired ? req.body.isAdvanceAmountRequired : 0.00;
                req.body.markAttendence = req.body.markAttendence ? req.body.markAttendence : 0;
                req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                req.body.travelRequestType = req.body.travelRequestType ? req.body.travelRequestType : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.starts),
                    req.st.db.escape(req.body.ends),
                    req.st.db.escape(req.body.justification),
                    req.st.db.escape(req.body.requiredAdvanceCurrencyId),
                    req.st.db.escape(req.body.requiredAdvanceAmount),
                    req.st.db.escape(req.body.travelDeskMessage),
                    req.st.db.escape(req.body.markAttendence),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.approverNotes),
                    req.st.db.escape(req.body.receiverNotes),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType),
                    req.st.db.escape(req.body.issuedAdvanceCurrencyId),
                    req.st.db.escape(req.body.issuedAdvanceAmount),
                    req.st.db.escape(req.body.isAdvanceAmountIssued),
                    req.st.db.escape(JSON.stringify(attachmentList)),
                    req.st.db.escape(req.body.approverCount),
                    req.st.db.escape(req.body.receiverCount),
                    req.st.db.escape(req.body.isAdvanceAmountRequired),
                    req.st.db.escape(JSON.stringify(travelRequests)),
                    req.st.db.escape(req.body.travelRequestType)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_travelRequest_new( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err && results && results[0] ){
                        senderGroupId = results[0][0].senderId;
                        notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                            senderName : results[0][0].message
                        });

                        for (var i = 0; i < results[1].length; i++ ) {
                            if (notificationTemplaterRes.parsedTpl) {
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
                                    null,tokenResult[0].isWhatMate,
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
                        response.message = "Travel request saved successfully";
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
                        response.message = "Error while saving travel request";
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

travelRequestCtrl.masterData = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_master_travelRequest( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,currencyMaster){
                if(!err && currencyMaster ){
                    response.status = true;
                    response.message = "Master data loaded successfully";
                    response.error = null;
                    response.data = {
                        currencyList : (currencyMaster && currencyMaster[0]) ? currencyMaster[0] : [],
                        defaultUserCurrency : {
                            currencyId : (currencyMaster && currencyMaster[1] && currencyMaster[1][0] && currencyMaster[1][0].currencyId) ? currencyMaster[1][0].currencyId : 0,
                            currencySymbol : (currencyMaster && currencyMaster[1] && currencyMaster[1][0] && currencyMaster[1][0].currencySymbol) ? currencyMaster[1][0].currencySymbol : "",
                            conversionRate : (currencyMaster && currencyMaster[1] && currencyMaster[1][0] && currencyMaster[1][0].conversionRate) ? currencyMaster[1][0].conversionRate : 0
                        },
                        travelMode : (currencyMaster && currencyMaster[2] ) ? currencyMaster[2] : [],
                        locations : (currencyMaster && currencyMaster[3] ) ? currencyMaster[3] : []
                    };


                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                    zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                    });

                }
                else if(!err){
                    response.status = true;
                    response.message = "No data found";
                    response.error = null;
                    response.data = {
                        currencyList : [],
                        defaultUserCurrency : {
                            currencyId : 0,
                            currencySymbol : "",
                            conversionRate : 0
                        },
                        travelMode : [],
                        locations : []
                    };
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting data";
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
};

module.exports = travelRequestCtrl;