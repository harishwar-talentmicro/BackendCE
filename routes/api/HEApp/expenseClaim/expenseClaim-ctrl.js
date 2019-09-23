/**
 * Created by Jana1 on 17-04-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var htmlpdf = require('html-pdf');
var expenseClaimReport = require('../expenseClaim/expenseClaimReport.js');
var Mailer = require('../../../../mail/mailer.js');
var mailerApi = new Mailer();
var expenseClaimCtrl = {};
var error = {};
var path = require('path');
var EZEIDEmail = 'noreply@talentmicro.com';

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;

expenseClaimCtrl.saveExpenseClaim = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.title) {
                        error.title = 'Invalid title';
                        validationFlag *= false;
                    }

                    if (!req.body.currencyId) {
                        error.currencyId = 'Invalid currencyId';
                        validationFlag *= false;
                    }

                    if (!req.body.amount) {
                        error.amount = 'Invalid amount';
                        validationFlag *= false;
                    }

                    var expenseList = req.body.expenseList;
                    if (typeof (expenseList) == "string") {
                        expenseList = JSON.parse(expenseList);
                    }
                    if (!expenseList) {
                        error.expenseList = 'Invalid expenseList';
                        validationFlag *= false;
                    }

                    var keywordList = req.body.keywordList;
                    if (typeof (keywordList) == "string") {
                        keywordList = JSON.parse(keywordList);
                    }
                    if (!keywordList) {
                        keywordList = [];
                    }

                    var senderGroupId;
                    console.log(validationFlag, "validationFlag");

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                        req.body.status = req.body.status ? req.body.status : 1;
                        req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : '';
                        req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                        req.body.amountSettled = req.body.amountSettled ? req.body.amountSettled : 0;
                        req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : '';
                        req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                        req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                        req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;
                        req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                        req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.title),
                            req.st.db.escape(req.body.currencyId),
                            req.st.db.escape(req.body.amount),
                            req.st.db.escape(req.body.senderNotes),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.approverNotes),
                            req.st.db.escape(req.body.amountSettled),
                            req.st.db.escape(req.body.receiverNotes),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(JSON.stringify(expenseList)),
                            req.st.db.escape(req.body.approverCount),
                            req.st.db.escape(req.body.receiverCount),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.timestamp),
                            req.st.db.escape(req.body.createdTimeStamp)

                        ];

                        var expenseFormId = 1005;
                        var keywordsParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(expenseFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)
                        ];

                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_save_expenseClaim_new( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(results);
                            if (!err && results && results[0]) {
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

                                // pdf generation starts
                                if (results[2] && results[2][0] && results[3] && results[4]) {
                                    console.log("results[2]", results[2]);
                                    var reportData = {
                                        expense: results[2],
                                        name: results[3][0].name,
                                        employeeCode: results[3][0].employeeCode,
                                        total: results[3][0].total,
                                        amount: results[3][0].amount
                                    };

                                    req.data = JSON.parse(JSON.stringify(reportData));
                                    (0, expenseClaimReport.expenseReport)(req, res);
                                    var options = { format: 'A4', width: '8in', height: '10.5in', border: '0', timeout: 30000, "zoomFactor": "1" };

                                    htmlpdf.create(res.data, options).toBuffer(function (err, buffer) {
                                        console.log('This is a buffer:', Buffer.isBuffer(buffer));
                                        var attachmentObjectsList = [{
                                            filename: results[3][0].name + '.pdf',
                                            content: buffer
                                        }];

                                        for (var z = 0; z < results[4].length; z++) {
                                            mailerApi.sendMailNew('expenseClaim', {
                                                name: results[4][z].name,
                                                senderName: results[3][0].name
                                            }, '', results[4][z].emailId, attachmentObjectsList);
                                        }

                                    });


                                }
                                // pdf generation ends

                                notifyMessages.getMessagesNeedToNotify();

                                response.status = true;
                                response.message = "Expense claim saved successfully";
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
                                        transId: results[0][0].transId,
                                        formId: results[0][0].formId,
                                        groupId: req.body.groupId,
                                        currentStatus: results[0][0].currentStatus,
                                        currentTransId: results[0][0].currentTransId,
                                        localMessageId: req.body.localMessageId,
                                        parentId: results[0][0].parentId,
                                        accessUserType: results[0][0].accessUserType,
                                        heUserId: results[0][0].heUserId,
                                        formData: JSON.parse(results[0][0].formDataJSON)
                                    }
                                };
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving expense claim";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

expenseClaimCtrl.getVaultData = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
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

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.keywords = req.query.keywords ? req.query.keywords : "";
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.keywords)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_expense_vaultdata( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(results);
                    if (!err && results && results[0]) {
                        var output = [];
                        for (var i = 0; i < results[0].length; i++) {
                            var res1 = {};

                            var items = (results[0][i] && results[0][i].items) ? JSON.parse(results[0][i].items) : [];
                            if (items.length > 0) {
                                res1.title = results[0][i].title;
                                res1.isFolder = results[0][i].isFolder;
                                res1.id = results[0][i].id;
                                var item = [];
                                for (var j = 0; j < items.length; j++) {
                                    var res2 = {};
                                    var itemDetails = (items[j].details) ? (items[j].details) : null;
                                    res2.expTypeId = items[j].expTypeId;
                                    res2.itemId = items[j].itemId;
                                    res2.expTypeTitle = items[j].expTypeTitle;
                                    res2.conversionRate = items[j].conversionRate;
                                    res2.attachmentList = (items[j].attachmentList) ? (items[j].attachmentList) : [];
                                    res2.amount = (itemDetails) ? itemDetails.amount : 0;
                                    res2.expDate = (itemDetails) ? itemDetails.billDate : null;
                                    res2.currencyId = (itemDetails) ? itemDetails.currencyId : 0;
                                    res2.particulars = (itemDetails) ? itemDetails.particulars : "";
                                    res2.currencyTitle = (itemDetails) ? itemDetails.currencyTitle : "";
                                    res2.notes = (itemDetails) ? itemDetails.notes : "";
                                    res2.categoryType = (itemDetails) ? itemDetails.categoryType : 1;
                                    item.push(res2);
                                }
                                res1.item = item;
                                output.push(res1);
                            }

                        }
                        for (var z = 0; z < results[1].length; z++) {
                            var res3 = {};
                            var vaultItems = (results[1][z].details) ? JSON.parse(results[1][z].details) : null;
                            res3.title = results[1][z].title;
                            res3.isFolder = results[1][z].isFolder;
                            res3.id = results[1][z].itemId;
                            var items = [
                                {
                                    expTypeId: results[1][z].expTypeId,
                                    itemId: results[1][z].itemId,
                                    expTypeTitle: results[1][z].expTypeTitle,
                                    attachmentList: (results[1][z].attachmentList) ? JSON.parse(results[1][z].attachmentList) : [],
                                    amount: (vaultItems) ? vaultItems.amount : 0,
                                    expDate: (vaultItems) ? vaultItems.billDate : null,
                                    currencyId: (vaultItems) ? vaultItems.currencyId : 0,
                                    particulars: (vaultItems) ? vaultItems.particulars : "",
                                    currencyTitle: (vaultItems) ? vaultItems.currencyTitle : "",
                                    conversionRate: results[1][z].conversionRate,
                                    notes: results[1][z].notes ? results[1][z].notes : "",
                                    categoryType: results[1][z].categoryType ? results[1][z].categoryType : 1
                                }
                            ];

                            //  items.push(res3);
                            res3.item = items;
                            output.push(res3);
                        }
                        response.status = true;
                        response.message = "Vault data loaded ";
                        response.error = null;
                        response.data = {
                            vaultData: output
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting vault data";
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

};

module.exports = expenseClaimCtrl;