/**
 * Created by Jana1 on 19-04-2017.
 */


var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var travelClaimCtrl = {};
var error = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

var travelClaimReport = require('../travelClaim/travelClaimReport.js');
var htmlpdf = require('html-pdf');
var Mailer = require('../../../../mail/mailer.js');
var mailerApi = new Mailer();
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

travelClaimCtrl.saveTravelClaim = function(req,res,next){
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
                    
                    console.log(req.body);
                    // if (!req.body.travelRequestId) {
                    //     error.travelRequestId = 'Invalid travelRequestId';
                    //     validationFlag *= false;
                    // }
                
                    var expenseList =req.body.expenseList;
                    if(typeof(expenseList) == "string") {
                        expenseList = JSON.parse(expenseList);
                    }
                    if(!expenseList){
                        error.expenseList = 'Invalid expenseList';
                        validationFlag *= false;
                    }
                    var keywordList =req.body.keywordList;
                    if(typeof(keywordList) == "string") {
                        keywordList = JSON.parse(keywordList);
                    }
                    if(!keywordList){
                        keywordList = [];
                    }
                
                    var senderGroupId;
                    console.log(validationFlag, "validationFlag");
                
                    if (!validationFlag){
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                        req.body.status = req.body.status ? req.body.status : 1;
                        req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                        req.body.travelRequestId = req.body.travelRequestId ? req.body.travelRequestId : 0;  // removed from mandatory so as to merge expense claim and travel claim
                        req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                        req.body.travelRequestData  = req.body.travelRequestData  ? req.body.travelRequestData : '';
        
                        req.body.totalCurrencyId = req.body.totalCurrencyId ? req.body.totalCurrencyId : 0;
                        req.body.totalAmount = req.body.totalAmount ? req.body.totalAmount : 0;
                        req.body.totalPayableCurrencyId = req.body.totalPayableCurrencyId ? req.body.totalPayableCurrencyId : 0;
                        req.body.totalPayableAmount = req.body.totalPayableAmount ? req.body.totalPayableAmount : 0;
                        req.body.settlementPaid = (req.body.settlementPaid == undefined) ? 0 : req.body.settlementPaid;
                        req.body.advanceCurrencyId = req.body.advanceCurrencyId ? req.body.advanceCurrencyId : 0;
                        req.body.advanceAmount = req.body.advanceAmount ? req.body.advanceAmount : 0;
                        req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                        req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                        req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                        req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                        req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                        req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;

                        req.body.title = req.body.title ? req.body.title : ""; // for expense
                        req.body.amountSettled = req.body.amountSettled ? req.body.amountSettled : 0;
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                        var procParams = [  // for travel claim
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.travelRequestId),
                            req.st.db.escape(req.body.totalCurrencyId),
                            req.st.db.escape(req.body.totalAmount),
                            req.st.db.escape(req.body.totalPayableCurrencyId),
                            req.st.db.escape(req.body.totalPayableAmount),
                            req.st.db.escape(req.body.senderNotes),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.approverNotes),
                            req.st.db.escape(req.body.settlementPaid),   
                            req.st.db.escape(req.body.advanceCurrencyId),
                            req.st.db.escape(req.body.advanceAmount),
                            req.st.db.escape(req.body.receiverNotes),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(JSON.stringify(expenseList)),
                            req.st.db.escape(req.body.approverCount),
                            req.st.db.escape(req.body.receiverCount),
                            req.st.db.escape(req.body.travelRequestData),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.timestamp),
                            req.st.db.escape(req.body.createdTimeStamp),
                            req.st.db.escape(req.body.isExpenseClaim || 0),
                            req.st.db.escape(req.body.isResubmit || 0),
                            req.st.db.escape(req.body.resubmitNotes || "")
                   ];

                        var travelClaimFormId=1007;
                        var keywordsParams=[
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(travelClaimFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                            var procQuery = 'CALL HE_save_travelClaim_new_v1( ' + procParams.join(',') +');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                            console.log(procQuery);
                            req.db.query(procQuery,function(err,results){
                                // console.log(results);
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
                                    
                                    /*
                                    // pdf generation starts
                                    if(results[2] && results[2][0] && results[3] && results[4] ){
                                        var reportData = {
                                            expense : (results[2] && results[2][0]) ? results[2]:[],
                                            name : (results[3] && results[3][0]) ? results[3][0].name:"",
                                            employeeCode : (results[3] && results[3][0]) ? results[3][0].employeeCode: "",
                                            // starts : ( results[5] &&  results[5][0]) ? results[5][0].starts:"",
                                            // ends : ( results[5] &&  results[5][0]) ? results[5][0].ends:"",
                                            justification : (results[5] && results[5][0]) ? results[5][0].justification:"",
                                            total : (results[3] && results[3][0]) ? results[3][0].total:"INR",
                                            totalAmount : (results[3] && results[3][0]) ? results[3][0].totalAmount:0.0,
                                            advance : (results[3] && results[3][0]) ? results[3][0].advance:"INR",
                                            advanceAmount : (results[3] && results[3][0]) ? results[3][0].advanceAmount:0.0,
                                            totalPayable : (results[3] && results[3][0]) ? results[3][0].totalPayable:"INR",
                                            totalPayableAmount : (results[3] && results[3][0]) ? results[3][0].totalPayableAmount:0.0
                                        };
                                        
                                        if(req.body.travelRequestId!=0){
                                            reportData.starts=results[5][0].starts,
                                            reportData.ends=results[5][0].ends
                                        };
            
                                        req.data = JSON.parse(JSON.stringify(reportData));
            
                                        (0,travelClaimReport.expenseReport)(req, res);
            
                                        var options = { format: 'A4', width: '8in', height: '10.5in', border: '0', timeout: 30000, "zoomFactor": "1" };
            
                                        htmlpdf.create(res.data,options).toBuffer(function (err, buffer) {
                                            var attachmentObjectsList = [{
                                                filename: results[3][0].name + '.pdf',
                                                content: buffer
                                            }];
            
                                            for (var z = 0; z < results[4].length; z++ ) {
                                                mailerApi.sendMailNew('travelClaim', {
                                                    name : results[4][z].name,
                                                    senderName : results[3][0].name
                                                }, '', results[4][z].emailId, attachmentObjectsList);
                                            }
            
                                        });
            
            
                                    }
                                    */
                                    // pdf generation ends
                                    notifyMessages.getMessagesNeedToNotify();
                                    response.status = true;
                                    response.message = "Travel claim saved successfully";
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
                                    response.message = "Error while saving travel claim";
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

travelClaimCtrl.getTravelRequest = function(req,res,next){
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
            var procQuery = 'CALL HE_get_travelRequest( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,travelRequestResult){
                if(!err && travelRequestResult && travelRequestResult[0]){
                    response.status = true;
                    response.message = "Travel request loaded successfully";
                    response.error = null;
                    if(!err && travelRequestResult && travelRequestResult[1][0]){
                        response.data = {
                            travelRequestList : travelRequestResult[0],
                            defaultUserCurrency : {
                                currencyId : travelRequestResult[1] && travelRequestResult[1][0].currencyId ? travelRequestResult[1][0].currencyId : 0,
                                currencySymbol : travelRequestResult[1] && travelRequestResult[1][0].currencySymbol ? travelRequestResult[1][0].currencySymbol : "",
                                conversionRate : travelRequestResult[1] && travelRequestResult[1][0].conversionRate ? travelRequestResult[1][0].conversionRate : 0
                            },
                            currencyList : travelRequestResult[2],
                            enableExpConveyance : travelRequestResult[3][0].enableExpConveyance ? travelRequestResult[3][0].enableExpConveyance : 0,
                            enableRefNumber : travelRequestResult[3][0].enableRefNumber ? travelRequestResult[3][0].enableRefNumber : 0,
                            hideExpTime : travelRequestResult[3][0].hideExpTime ? travelRequestResult[3][0].hideExpTime : 0,
                            expenseDefaultSelection : travelRequestResult[3][0].expenseDefaultSelection ? travelRequestResult[3][0].expenseDefaultSelection : 0,
                            statusSegmentColor : travelRequestResult[4] && travelRequestResult[4][0]  && JSON.parse(travelRequestResult[4][0].statusSegmentColor) ? JSON.parse(travelRequestResult[4][0].statusSegmentColor) : []
                        }
                    }
                    else{
                        response.data = {
                            travelRequestList : travelRequestResult[0],
                            defaultUserCurrency : {
                                currencyId :  0,
                                currencySymbol : "",
                                conversionRate : 0
                            },
                            currencyList : travelRequestResult[2],
                            enableExpConveyance : travelRequestResult[3][0].enableExpConveyance ? travelRequestResult[3][0].enableExpConveyance : 0,
                            enableRefNumber : travelRequestResult[3][0].enableRefNumber ? travelRequestResult[3][0].enableRefNumber : 0,
                            hideExpTime : travelRequestResult[3][0].hideExpTime ? travelRequestResult[3][0].hideExpTime : 0,
                            expenseDefaultSelection : travelRequestResult[3][0].expenseDefaultSelection ? travelRequestResult[3][0].expenseDefaultSelection : 0,
                            statusSegmentColor : travelRequestResult[4] && travelRequestResult[4][0]  && JSON.parse(travelRequestResult[4][0].statusSegmentColor) ? JSON.parse(travelRequestResult[4][0].statusSegmentColor) : []
                        }
                    }

                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                    zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                    });

                }
                else if(!err){
                    response.status = true;
                    response.message = "Travel request loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting travel request";
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

module.exports = travelClaimCtrl;