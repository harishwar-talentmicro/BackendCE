/**
 * Created by Jana1 on 27-07-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var Notification_aws = require('../../../modules/notification/aws-sns-push');

var _Notification_aws = new Notification_aws();

var request = require('request');

var salesCtrl = {};
var error = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;
salesCtrl.getMasterData = function (req, res, next) {
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
        if (req.query.nkFlag == 1) {
            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId),
                req.st.db.escape(DBSecretKey)
            ];
            /**
             * Calling procedure to save form sales items
             */
            var procQuery = 'CALL HE_get_app_salesmaster( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, masterData) {
                if (!err && masterData[0] && masterData[0][0]) {
                    var output = [];
                    for (var i = 0; i < masterData[0].length; i++) {
                        var res1 = {};
                        res1.stageId = masterData[0][i].stageId;
                        res1.stageTitle = masterData[0][i].stageTitle;
                        res1.stageProgress = masterData[0][i].stageProgress;
                        res1.statusList = JSON.parse(masterData[0][i].statusList);
                        output.push(res1);
                    }

                    response.status = true;
                    response.message = "Data loaded successfully";
                    response.data = {
                        stageStatusList: output,
                        categoryList: masterData[1] && masterData[1][0] ? masterData[1] : [],
                        currencyList: masterData[2] ? masterData[2] : [],
                        memberList: masterData[3] ? masterData[3] : [],
                        salesType: masterData[4] ? masterData[4][0].salesDisplayFormat : 0,
                        currency: {
                            currencySymbol: (masterData[5] && masterData[5][0] && masterData[5][0].currencySymbol) ? masterData[5][0].currencySymbol : '',
                            currencyId: (masterData[5] && masterData[5][0] && masterData[5][0].currencyId) ? masterData[5][0].currencyId : 0
                        },
                        probability: masterData[6] ? masterData[6] : [],
                        enableValueField1: masterData[7] && masterData[7][0] && masterData[7][0].enableValueField1 ? masterData[7][0].enableValueField1 : 0,
                        enableValueField2: masterData[7] && masterData[7][0] && masterData[7][0].enableValueField2 ? masterData[7][0].enableValueField2 : 0,
                        valueFieldTitle1: masterData[7] && masterData[7][0] && masterData[7][0].valueFieldTitle1 ? masterData[7][0].valueFieldTitle1 : "",
                        valueFieldTitle2: masterData[7] && masterData[7][0] && masterData[7][0].valueFieldTitle2 ? masterData[7][0].valueFieldTitle2 : "",
                        isCompanyMandatory: masterData[7] && masterData[7][0] && masterData[7][0].isCompanyMandatory ? masterData[7][0].isCompanyMandatory : 0,
                        isTaskSchedules: masterData[7] && masterData[7][0] && masterData[7][0].isTaskSchedules ? masterData[7][0].isTaskSchedules : 0,
                        isExpenseClaim: masterData[7] && masterData[7][0] && masterData[7][0].isExpenseClaim ? masterData[7][0].isExpenseClaim : 0,
                        showForcastSection: masterData[7] && masterData[7][0] && masterData[7][0].showForcastSection ? masterData[7][0].showForcastSection : 0,
                        targetPeriod: masterData[7] && masterData[7][0] && masterData[7][0].targetPeriod ? masterData[7][0].targetPeriod : 0,
                        enableConsiderThisForForecast: masterData[7] && masterData[7][0] && masterData[7][0].enableConsiderThisForForecast ? masterData[7][0].enableConsiderThisForForecast : 0,
                        isSendProposal: masterData[7] && masterData[7][0] && masterData[7][0].isSendProposal ? masterData[7][0].isSendProposal : 0,
                        isTargetDate: masterData[7] && masterData[7][0] && masterData[7][0].isTargetDate ? masterData[7][0].isTargetDate : 0,
                        expenseList: masterData[8] ? masterData[8] : [],
                        templateList: masterData[9] ? masterData[9] : [],
                        isReportingManager: masterData[10][0] && masterData[10][0].isReportingManager ? masterData[10][0].isReportingManager : 0,
                        isCompanyMember: masterData[10][0] && masterData[10][0].isCompanyMember ? masterData[10][0].isCompanyMember : 0
                    };
                    response.error = null;
                    res.status(200).json(response);
                }
                else if (!err) {
                    response.status = true;
                    response.message = "No data found";
                    response.data = {
                        stageStatusList: [],
                        categoryList: [],
                        currencyList: [],
                        memberList: [],
                        templateList: []
                    };
                    response.error = null;
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "Error while getting data";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.groupId),
                        req.st.db.escape(DBSecretKey),
                        // req.st.db.escape(req.query.whatmateId)
                    ];
                    /**
                     * Calling procedure to save form sales items
                     */
                    var procQuery = 'CALL HE_get_app_salesmaster( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, masterData) {
                        if (!err && masterData[0] && masterData[0][0]) {
                            var output = [];
                            for (var i = 0; i < masterData[0].length; i++) {
                                var res1 = {};
                                res1.stageId = masterData[0][i].stageId;
                                res1.stageTitle = masterData[0][i].stageTitle;
                                res1.stageProgress = masterData[0][i].stageProgress;
                                res1.statusList = JSON.parse(masterData[0][i].statusList);
                                output.push(res1);
                            }

                            response.status = true;
                            response.message = "Data loaded successfully";
                            response.data = {
                                stageStatusList: output,
                                categoryList: masterData[1] && masterData[1][0] ? masterData[1] : [],
                                currencyList: masterData[2] ? masterData[2] : [],
                                memberList: masterData[3] ? masterData[3] : [],
                                salesType: masterData[4] ? masterData[4][0].salesDisplayFormat : 0,
                                currency: {
                                    currencySymbol: (masterData[5] && masterData[5][0] && masterData[5][0].currencySymbol) ? masterData[5][0].currencySymbol : '',
                                    currencyId: (masterData[5] && masterData[5][0] && masterData[5][0].currencyId) ? masterData[5][0].currencyId : 0
                                },
                                probability: masterData[6] ? masterData[6] : [],
                                enableValueField1: masterData[7] && masterData[7][0] && masterData[7][0].enableValueField1 ? masterData[7][0].enableValueField1 : 0,
                                enableValueField2: masterData[7] && masterData[7][0] && masterData[7][0].enableValueField2 ? masterData[7][0].enableValueField2 : 0,
                                valueFieldTitle1: masterData[7] && masterData[7][0] && masterData[7][0].valueFieldTitle1 ? masterData[7][0].valueFieldTitle1 : "",
                                valueFieldTitle2: masterData[7] && masterData[7][0] && masterData[7][0].valueFieldTitle2 ? masterData[7][0].valueFieldTitle2 : "",
                                isCompanyMandatory: masterData[7] && masterData[7][0] && masterData[7][0].isCompanyMandatory ? masterData[7][0].isCompanyMandatory : 0,
                                isTaskSchedules: masterData[7] && masterData[7][0] && masterData[7][0].isTaskSchedules ? masterData[7][0].isTaskSchedules : 0,
                                isExpenseClaim: masterData[7] && masterData[7][0] && masterData[7][0].isExpenseClaim ? masterData[7][0].isExpenseClaim : 0,
                                showForcastSection: masterData[7] && masterData[7][0] && masterData[7][0].showForcastSection ? masterData[7][0].showForcastSection : 0,
                                targetPeriod: masterData[7] && masterData[7][0] && masterData[7][0].targetPeriod ? masterData[7][0].targetPeriod : 0,
                                enableConsiderThisForForecast: masterData[7] && masterData[7][0] && masterData[7][0].enableConsiderThisForForecast ? masterData[7][0].enableConsiderThisForForecast : 0,
                                isSendProposal: masterData[7] && masterData[7][0] && masterData[7][0].isSendProposal ? masterData[7][0].isSendProposal : 0,
                                isTargetDate: masterData[7] && masterData[7][0] && masterData[7][0].isTargetDate ? masterData[7][0].isTargetDate : 0,
                                expenseList: masterData[8] ? masterData[8] : [],
                                templateList: masterData[9] ? masterData[9] : [],
                                isReportingManager: masterData[10][0] && masterData[10][0].isReportingManager ? masterData[10][0].isReportingManager : 0,
                                isCompanyMember: masterData[10][0] && masterData[10][0].isCompanyMember ? masterData[10][0].isCompanyMember : 0
                            };
                            response.error = null;
                            // res.status(200).json(response);

                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = {
                                stageStatusList: [],
                                categoryList: [],
                                currencyList: [],
                                memberList: [],
                                templateList: []
                            };
                            response.error = null;
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting data";
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

    }

};

salesCtrl.saveSalesRequest = function (req, res, next) {
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

                    // if (!req.body.requirement) {
                    //     error.requirement = 'Invalid requirement';
                    //     validationFlag *= false;
                    // }

                    var attachmentList = req.body.attachmentList;
                    if (typeof (attachmentList) == "string") {
                        attachmentList = JSON.parse(attachmentList);
                    }
                    if (!attachmentList) {
                        attachmentList = [];
                    }

                    var items = req.body.items;
                    if (typeof (items) == "string") {
                        items = JSON.parse(items);
                    }
                    if (!items) {
                        items = [];
                    }
                    var keywordList = req.body.keywordList;
                    if (typeof (keywordList) == "string") {
                        keywordList = JSON.parse(keywordList);
                    }
                    if (!keywordList) {
                        keywordList = [];
                    }

                    var senderGroupId;

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                        req.body.clientId = req.body.clientId ? req.body.clientId : 0;
                        req.body.categoryId = req.body.categoryId ? req.body.categoryId : 0;
                        req.body.status = req.body.status ? req.body.status : 1;
                        req.body.stage = req.body.stage ? req.body.stage : 1;
                        req.body.senderNotes = req.body.senderNotes ? req.body.senderNotes : "";
                        req.body.reason = req.body.reason ? req.body.reason : "";
                        req.body.currencyId = req.body.currencyId ? req.body.currencyId : 0;
                        req.body.receiverNotes = req.body.receiverNotes ? req.body.receiverNotes : "";
                        req.body.amount = req.body.amount ? req.body.amount : 0;
                        req.body.probability = req.body.probability ? req.body.probability : 0;
                        req.body.infoToSender = req.body.infoToSender ? req.body.infoToSender : '';
                        req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                        req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                        req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;
                        req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                        req.body.clientName = req.body.clientName ? req.body.clientName : "";
                        req.body.categoryTitle = req.body.categoryTitle ? req.body.categoryTitle : "";
                        req.body.stageTitle = req.body.stageTitle ? req.body.stageTitle : "";
                        req.body.statusTitle = req.body.statusTitle ? req.body.statusTitle : "";
                        req.body.currencyTitle = req.body.currencyTitle ? req.body.currencyTitle : "";
                        req.body.isInfoToSenderChanged = req.body.isInfoToSenderChanged ? req.body.isInfoToSenderChanged : 0;
                        req.body.clientISDMobile = req.body.clientISDMobile ? req.body.clientISDMobile : "";
                        req.body.clientMobile = req.body.clientMobile ? req.body.clientMobile : "";
                        req.body.clientEmail = req.body.clientEmail ? req.body.clientEmail : "";
                        req.body.clientCompany = req.body.clientCompany ? req.body.clientCompany : "";
                        req.body.clientJobTitle = req.body.clientJobTitle ? req.body.clientJobTitle : "";
                        req.body.discount = req.body.discount ? req.body.discount : 0;
                        req.body.itemCurrencyId = req.body.itemCurrencyId ? req.body.itemCurrencyId : 0;
                        req.body.itemCurrencySymbol = req.body.itemCurrencySymbol ? req.body.itemCurrencySymbol : 0;
                        req.body.isdPhone = req.body.isdPhone != undefined ? req.body.isdPhone : "";
                        req.body.phoneNo = req.body.phoneNo != undefined ? req.body.phoneNo : "";
                        req.body.lastName = req.body.lastName != undefined ? req.body.lastName : "";
                        req.body.notes = req.body.notes != undefined ? req.body.notes : "";
                        req.body.contactId = req.body.contactId != undefined ? req.body.contactId : 0;
                        req.body.targetDate = req.body.targetDate != undefined ? req.body.targetDate : null;
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                        if (req.body.phoneNo == "") {
                            req.body.isdPhone = "";
                        }

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.clientId),
                            req.st.db.escape(req.body.categoryId),
                            req.st.db.escape(req.body.requirement),
                            req.st.db.escape(req.body.senderNotes),
                            req.st.db.escape(req.body.stage),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.reason),
                            req.st.db.escape(req.body.receiverNotes),
                            req.st.db.escape(req.body.currencyId),
                            req.st.db.escape(req.body.amount),
                            req.st.db.escape(req.body.probability),
                            req.st.db.escape(req.body.infoToSender),
                            req.st.db.escape(JSON.stringify(attachmentList)),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(req.body.clientName),
                            req.st.db.escape(req.body.categoryTitle),
                            req.st.db.escape(req.body.stageTitle),
                            req.st.db.escape(req.body.statusTitle),
                            req.st.db.escape(req.body.currencyTitle),
                            req.st.db.escape(req.body.isInfoToSenderChanged),
                            req.st.db.escape(req.body.clientISDMobile),
                            req.st.db.escape(req.body.clientMobile),
                            req.st.db.escape(req.body.clientEmail),
                            req.st.db.escape(req.body.clientCompany),
                            req.st.db.escape(req.body.clientJobTitle),
                            req.st.db.escape(req.body.discount),
                            req.st.db.escape(JSON.stringify(items)),
                            req.st.db.escape(req.body.itemCurrencyId),
                            req.st.db.escape(req.body.itemCurrencySymbol),
                            req.st.db.escape(req.body.isdPhone),
                            req.st.db.escape(req.body.phoneNo),
                            req.st.db.escape(req.body.lastName),
                            req.st.db.escape(req.body.notes),
                            req.st.db.escape(req.body.contactId),
                            req.st.db.escape(req.body.targetDate),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.timestamp),
                            req.st.db.escape(req.body.createdTimeStamp)
                        ];
                        var salesFormId = 2000;
                        var keywordsParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(salesFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)
                        ];

                        /**
                         * Calling procedure for sales request
                         * @type {string}
                         */

                        var procQuery = 'CALL he_save_salesRequest_new( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(results);
                            if (!err && results && results[0]) {
                                senderGroupId = results[0][0].senderId;
                                // notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                                //     senderName: results[0][0].message
                                // });
                                //
                                // for (var i = 0; i < results[1].length; i++) {
                                //     if (notificationTemplaterRes.parsedTpl) {
                                //
                                //         var formDataJSON = JSON.parse(results[1][i].formDataJSON);
                                //
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
                                //                     transId: results[1][i].transId,
                                //                     formId: results[1][i].formId,
                                //                     currentStatus: results[1][i].currentStatus,
                                //                     currentTransId: results[1][i].currentTransId,
                                //                     parentId: results[1][i].parentId,
                                //                     accessUserType: results[1][i].accessUserType,
                                //                     heUserId: results[1][i].heUserId,
                                //                     formData: JSON.parse(results[1][i].formDataJSON)
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

                                if (results && results[2] && results[2][0] && results[2][0].receiverId) {
                                    if (notificationTemplaterRes.parsedTpl) {
                                        notification.publish(
                                            results[2][0].receiverId,
                                            (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                            (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                            results[0][0].senderId,
                                            notificationTemplaterRes.parsedTpl,
                                            41,
                                            0, (results[2][0].iphoneId) ? (results[2][0].iphoneId) : '',
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
                                                parentId: results[2][0].parentId,
                                                groupId: results[2][0].groupId,
                                                requirement: results[2][0].requirement,
                                                feedback: results[2][0].feedback,
                                                rating: results[2][0].rating,
                                                updatedDate: results[2][0].updatedDate,
                                                status: results[2][0].status
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

salesCtrl.assignToUser = function (req, res, next) {
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
                    var keywordList = req.body.keywordList;
                    if (typeof (keywordList) == "string") {
                        keywordList = JSON.parse(keywordList);
                    }
                    if (!keywordList) {
                        keywordList = [];
                    }

                    var senderGroupId;

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.assignedReason = req.body.assignedReason ? req.body.assignedReason : "";

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.memberId),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.assignedReason),
                            req.st.db.escape(DBSecretKey)
                        ];

                        var salesFormId = 2000;
                        var keywordsParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(salesFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)
                        ];
                        /**
                         * Calling procedure for sales request
                         * @type {string}
                         */

                        var procQuery = 'CALL he_assign_sales( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(results);
                            if (!err && results && results[0]) {
                                console.log("results[0].senderName", results[0][0].senderName);

                                senderGroupId = results[0][0].senderId;
                                // notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                                //     senderName: results[0][0].message
                                // });
                                //
                                // for (var i = 0; i < results[0].length; i++) {
                                //     if (notificationTemplaterRes.parsedTpl) {
                                //
                                //         var formDataJSON = JSON.parse(results[0][i].formDataJSON);
                                //
                                //         notification.publish(
                                //             results[0][i].receiverId,
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             results[0][0].senderId,
                                //             notificationTemplaterRes.parsedTpl,
                                //             31,
                                //             0, (results[0][i].iphoneId) ? (results[0][i].iphoneId) : '',
                                //             (results[0][i].GCM_Id) ? (results[0][i].GCM_Id) : '',
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
                                //                     messageId: results[0][i].messageId,
                                //                     message: results[0][i].message,
                                //                     messageLink: results[0][i].messageLink,
                                //                     createdDate: results[0][i].createdDate,
                                //                     messageType: results[0][i].messageType,
                                //                     messageStatus: results[0][i].messageStatus,
                                //                     priority: results[0][i].priority,
                                //                     senderName: results[0][i].senderName,
                                //                     senderId: results[0][i].senderId,
                                //                     receiverId: results[0][i].receiverId,
                                //                     groupId: results[0][i].senderId,
                                //                     groupType: 2,
                                //                     transId: results[0][i].transId,
                                //                     formId: results[0][i].formId,
                                //                     currentStatus: results[0][i].currentStatus,
                                //                     currentTransId: results[0][i].currentTransId,
                                //                     parentId: results[0][i].parentId,
                                //                     accessUserType: results[0][i].accessUserType,
                                //                     heUserId: results[0][i].heUserId,
                                //                     formData: JSON.parse(results[0][i].formDataJSON)
                                //
                                //                 }
                                //             },
                                //             null,
                                //             tokenResult[0].isWhatMate,
                                //             results[0][i].secretKey);
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
                                response.message = "Assigned successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err) {
                                response.status = true;
                                response.message = "Assigned successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while assigning to member";
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

salesCtrl.findHECustomer = function (req, res, next) {
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
                req.query.keyword = req.query.keyword ? req.query.keyword : "";
                req.query.isSupport = req.query.isSupport != undefined ? req.query.isSupport : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.keyword),
                    req.st.db.escape(req.query.isSupport),
                    req.st.db.escape(DBSecretKey)
                ];

                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_find_customer( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, userResult) {
                    if (!err && userResult && userResult[0] && userResult[0][0]) {
                        response.status = true;
                        response.message = "Client loaded successfully";
                        response.error = null;
                        var output = [];

                        for (var i = 0; i < userResult[0].length; i++) {
                            var res1 = {};
                            res1.clientId = userResult[0][i].clientId;
                            res1.contactId = userResult[0][i].contactId;
                            res1.name = userResult[0][i].name;
                            res1.isdMobile = userResult[0][i].isdMobile;
                            res1.mobile = userResult[0][i].mobile;
                            res1.emailId = userResult[0][i].emailId;
                            res1.companyName = userResult[0][i].companyName;
                            res1.jobTitle = userResult[0][i].jobTitle;
                            res1.isdPhone = userResult[0][i].isdPhone;
                            res1.phoneNo = userResult[0][i].phoneNo;
                            res1.lastName = userResult[0][i].lastName;
                            res1.notes = userResult[0][i].notes;
                            res1.updaterDetails = (userResult[0][i].updaterDetails) ? JSON.parse(userResult[0][i].updaterDetails) : null;
                            output.push(res1);
                        }
                        response.data = {
                            client: output
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No clients found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting client";
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

salesCtrl.saveSalesFeedback = function (req, res, next) {
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
        console.log(req.body);
        if (req.body.nkFlag == 1) {
            if (!req.body.parentId) {
                error.parentId = 'Invalid parentId';
                validationFlag *= false;
            }
            if (!req.body.formId) {
                error.formId = 'Invalid formId';
                validationFlag *= false;
            }

            if (!req.body.groupId) {
                error.groupId = 'Invalid groupId';
                validationFlag *= false;
            }

            if (!req.body.whatmateId) {
                error.whatmateId = 'Invalid whatmateId';
                validationFlag *= false;
            }

            var senderGroupId;

            if (!validationFlag) {
                response.error = error;
                response.message = 'Please check the errors';
                res.status(400).json(response);
                console.log(response);
            }
            else {
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.requirement),
                    req.st.db.escape(req.body.feedback),
                    req.st.db.escape(req.body.rating),
                    req.st.db.escape(req.body.formId),
                    req.st.db.escape(req.body.feedbackSign || ""),
                    req.st.db.escape(req.body.whatmateId),
                    req.st.db.escape(req.body.nkFlag || 0)
                ];

                /**
                 * Calling procedure for sales request
                 * @type {string}
                 */

                var procQuery = 'CALL he_save_Feedback( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(results);
                    if (!err && results && results[0]) {

                        var url = "http://23.236.49.140:3001/api/nk/ServiceEnquiryNotification";
                        var dbResponse = {
                            whatmateId: req.body.whatmateId,
                            parentId: req.body.parentId,
                            groupId: req.body.groupId,
                            feedback: req.body.feedback,
                            rating: req.body.rating,
                            notificationType: req.body.notificationType,
                            feedbackStatus: 1,
                            feedbackSign: req.body.feedbackSign
                        };

                        request({
                            url: url,
                            method: "POST",
                            json: true,   // <--Very important!!!
                            body: dbResponse
                        }, function (error, response, body) {
                            console.log(error);
                            if (!error && body) {
                                console.log('Notifcation saved and sent successfull for nearkart user');
                            }
                            else {
                                console.log('Error occured in Nearkart notification api');
                            }
                        });


                        response.status = true;
                        response.message = "Feedback saved successfully";
                        response.error = null;
                        response.data = results[0][0];
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving feedback";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        if (!req.body.parentId) {
                            error.parentId = 'Invalid parentId';
                            validationFlag *= false;
                        }
                        if (!req.body.formId) {
                            error.formId = 'Invalid formId';
                            validationFlag *= false;
                        }

                        if (!req.body.groupId) {
                            error.groupId = 'Invalid groupId';
                            validationFlag *= false;
                        }
                        var senderGroupId;

                        if (!validationFlag) {
                            response.error = error;
                            response.message = 'Please check the errors';
                            res.status(400).json(response);
                            console.log(response);
                        }
                        else {
                            var procParams = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.body.parentId),
                                req.st.db.escape(req.body.groupId),
                                req.st.db.escape(req.body.requirement),
                                req.st.db.escape(req.body.feedback),
                                req.st.db.escape(req.body.rating),
                                req.st.db.escape(req.body.formId),
                                req.st.db.escape(req.body.feedbackSign || ""),
                                req.st.db.escape(req.body.whatmateId || ""),
                                req.st.db.escape(req.body.nkFlag || 0)
                            ];

                            /**
                             * Calling procedure for sales request
                             * @type {string}
                             */

                            var procQuery = 'CALL he_save_Feedback( ' + procParams.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, results) {
                                console.log(results);
                                if (!err && results && results[0]) {
                                    response.status = true;
                                    response.message = "Feedback saved successfully";
                                    response.error = null;
                                    response.data = results[0][0];
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while saving feedback";
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
    }
};

salesCtrl.getSalesItems = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };

    var validationFlag = true;

    if (!req.query.isTallint) {
        if (!req.query.token) {
            error.token = 'Invalid token';
            validationFlag *= false;
        }

        if (!req.query.groupId) {
            error.groupId = 'Invalid groupId';
            validationFlag *= false;
        }
    }
    else {
        if (!req.query.heMasterId) {
            error.heMasterId = 'Invalid heMasterId';
            validationFlag *= false;
        }
    }

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        if (req.query.nkFlag == 1 || req.query.isTallint == 1) {
            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.groupId || 0),
                req.st.db.escape(req.query.keywords),
                req.st.db.escape(req.query.heMasterId || 0)
                // req.st.db.escape(req.query.whatmateId)
            ];
            /**
             * Calling procedure to save form sales items
             */
            var procQuery = 'CALL he_get_app_salesItems( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, salesItems) {
                if (!err && salesItems[0] && salesItems[0][0]) {
                    var output = [];
                    for (var i = 0; i < salesItems[0].length; i++) {
                        var res1 = {};
                        res1.description = salesItems[0][i].description;
                        res1.itemId = salesItems[0][i].itemId;
                        res1.itemCode = salesItems[0][i].itemCode;
                        res1.itemImage = (salesItems[0][i].itemImage) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + salesItems[0][i].itemImage) : "";
                        res1.itemName = salesItems[0][i].itemName;
                        res1.itemRate = salesItems[0][i].itemRate;
                        res1.maxQuantity = salesItems[0][i].maxQuantity;
                        res1.minQuantity = salesItems[0][i].minQuantity;
                        res1.notes = salesItems[0][i].notes;
                        res1.UOM = salesItems[0][i].UOM;
                        res1.UOMTitle = salesItems[0][i].UOMTitle;
                        res1.itemBanners = salesItems[0][i].itemBanners && JSON.parse(salesItems[0][i].itemBanners) ? JSON.parse(salesItems[0][i].itemBanners) : [];
                        output.push(res1);
                    }

                    response.status = true;
                    response.message = "Items loaded successfully";
                    response.data = {
                        salesItems: output
                    };
                    response.error = null;
                    res.status(200).json(response);

                }
                else if (!err) {
                    response.status = true;
                    response.message = "No items found";
                    response.data = {
                        salesItems: []
                    };
                    response.error = null;
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "Error while getting items";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }

        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    req.query.keywords = req.query.keywords ? req.query.keywords : "";

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.groupId),
                        req.st.db.escape(req.query.keywords),
                        req.st.db.escape(req.query.heMasterId || 0)
                    ];
                    /**
                     * Calling procedure to save form sales items
                     */
                    var procQuery = 'CALL he_get_app_salesItems( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, salesItems) {
                        if (!err && salesItems[0] && salesItems[0][0]) {
                            var output = [];
                            for (var i = 0; i < salesItems[0].length; i++) {
                                var res1 = {};
                                res1.description = salesItems[0][i].description;
                                res1.itemId = salesItems[0][i].itemId;
                                res1.itemCode = salesItems[0][i].itemCode;
                                res1.itemImage = (salesItems[0][i].itemImage) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + salesItems[0][i].itemImage) : "";
                                res1.itemName = salesItems[0][i].itemName;
                                res1.itemRate = salesItems[0][i].itemRate;
                                res1.maxQuantity = salesItems[0][i].maxQuantity;
                                res1.minQuantity = salesItems[0][i].minQuantity;
                                res1.notes = salesItems[0][i].notes;
                                res1.UOM = salesItems[0][i].UOM;
                                res1.UOMTitle = salesItems[0][i].UOMTitle;
                                res1.itemBanners = salesItems[0][i].itemBanners && JSON.parse(salesItems[0][i].itemBanners) ? JSON.parse(salesItems[0][i].itemBanners) : [];
                                output.push(res1);
                            }

                            response.status = true;
                            response.message = "Items loaded successfully";
                            response.data = {
                                salesItems: output
                            };
                            response.error = null;
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                        else if (!err) {
                            response.status = true;
                            response.message = "No items found";
                            response.data = {
                                salesItems: []
                            };
                            response.error = null;

                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting items";
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

    }

};

salesCtrl.getSalesTracker = function (req, res, next) {
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

        if (req.body.nkFlag == 1) {
            var stageStatusList = req.body.stageStatusList;
            if (typeof (stageStatusList) == "string") {
                stageStatusList = JSON.parse(stageStatusList);
            }
            if (!stageStatusList) {
                stageStatusList = {};
            }

            var probability = req.body.probability;
            if (typeof (probability) == "string") {
                probability = JSON.parse(probability);
            }
            if (!probability) {
                probability = {};
            }

            if (!req.body.whatmateId) {
                error.whatmateId = 'Invalid whatmateId';
                validationFlag *= false;
            }


            if (!validationFlag) {
                response.error = error;
                response.message = 'Please check the errors';
                res.status(400).json(response);
                console.log(response);
            }
            else {
                req.body.type = req.body.type ? req.body.type : 3;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;

                req.body.userId = req.body.userId ? req.body.userId : 0;
                req.body.timeline = req.body.timeline ? req.body.timeline : "";

                var procParams = [
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.whatmateId)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL nk_whatmate_salesTracker( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesItems) {
                    if (!err && salesItems && salesItems[0] && salesItems[0][0]) {

                        response.status = true;
                        response.message = "Sales tracker data loaded successfully";

                        for (var i = 0; i < salesItems[0].length; i++) {
                            salesItems[0][i].itemList = salesItems[0][i] && salesItems[0][i].itemList && JSON.parse(salesItems[0][i].itemList) ? JSON.parse(salesItems[0][i].itemList) : [];
                            salesItems[0][i].attachmentList = salesItems[0][i] && salesItems[0][i].attachmentList && JSON.parse(salesItems[0][i].attachmentList) ? JSON.parse(salesItems[0][i].attachmentList) : [];
                        }

                        response.data = {
                            transactionData: salesItems[0],
                            count: salesItems[1][0].count
                        };

                        response.error = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            chartData: [],
                            transactionData: [],
                            count: 0,
                            isSalesMember: 0,
                            isReportingManager: 0
                        };
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting sales tracker";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
            }
        }
        else {
            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                        var stageStatusList = req.body.stageStatusList;
                        if (typeof (stageStatusList) == "string") {
                            stageStatusList = JSON.parse(stageStatusList);
                        }
                        if (!stageStatusList) {
                            stageStatusList = {};
                        }

                        var probability = req.body.probability;
                        if (typeof (probability) == "string") {
                            probability = JSON.parse(probability);
                        }
                        if (!probability) {
                            probability = {};
                        }


                        if (!validationFlag) {
                            response.error = error;
                            response.message = 'Please check the errors';
                            res.status(400).json(response);
                            console.log(response);
                        }
                        else {
                            req.body.type = req.body.type ? req.body.type : 3;
                            req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                            req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                            var startPage = 0;

                            startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;

                            req.body.userId = req.body.userId ? req.body.userId : 0;
                            req.body.timeline = req.body.timeline ? req.body.timeline : "";

                            var procParams = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.query.groupId),
                                req.st.db.escape(req.body.type),
                                req.st.db.escape(startPage),
                                req.st.db.escape(req.query.limit),
                                req.st.db.escape(JSON.stringify(stageStatusList)),
                                req.st.db.escape(JSON.stringify(probability)),
                                req.st.db.escape(req.body.timeline),
                                req.st.db.escape(req.body.userId)

                            ];
                            /**
                             * Calling procedure to save form sales items
                             */
                            var procQuery = 'CALL HE_get_salesTracker1( ' + procParams.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, salesItems) {
                                if (!err && salesItems && salesItems[0]) {

                                    response.status = true;
                                    response.message = "Sales tracker data loaded successfully";

                                    for (var i = 0; i < salesItems[1].length; i++) {
                                        salesItems[1][i].itemList = salesItems[1][i] && salesItems[1][i].itemList && JSON.parse(salesItems[1][i].itemList) ? JSON.parse(salesItems[1][i].itemList) : [];
                                    }

                                    response.data = {
                                        chartData: salesItems[0],
                                        transactionData: salesItems[1],
                                        count: salesItems[2][0].count,
                                        isSalesMember: salesItems[3][0].isSalesMember,
                                        isReportingManager: salesItems[4][0] && salesItems[4][0].isReportingManager ? salesItems[4][0].isReportingManager : 0
                                    };

                                    response.error = null;

                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });

                                }
                                else if (!err) {
                                    response.status = true;
                                    response.message = "No data found";
                                    response.data = {
                                        chartData: [],
                                        transactionData: [],
                                        count: 0,
                                        isSalesMember: 0,
                                        isReportingManager: 0
                                    };
                                    response.error = null;

                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                    });
                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while getting sales tracker";
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
    }
};

salesCtrl.getSalesSummary = function (req, res, next) {
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

    if (!req.query.HEMasterId) {
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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL HE_get_salesSummary( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesItems) {
                    if (!err && salesItems && salesItems[0]) {

                        response.status = true;
                        response.message = "Sales summary data loaded successfully";
                        response.data = {
                            probabilityData: salesItems[0],
                            timeLineData: (salesItems[1] && salesItems[1][0]) ? salesItems[1] : []
                        };

                        response.error = null;
                        // res.status(200).json(response);

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            chartData: [],
                            transactionData: [],
                            count: 0
                        };
                        response.error = null;

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting sales tracker";
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

salesCtrl.getSalesUserPerformanceByProbability = function (req, res, next) {
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

    if (!req.query.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
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
                req.query.type = req.query.type ? req.query.type : 1;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL he_get_salesUserByProbability( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesItems) {
                    if (!err && salesItems && salesItems[0]) {

                        response.status = true;
                        response.message = "Sales tracker data loaded successfully";
                        var output = [];
                        for (var i = 0; i < salesItems[0].length; i++) {
                            var res1 = {};
                            res1.name = salesItems[0][i].name;
                            res1.HEUserId = salesItems[0][i].HEUserId;
                            res1.probabilityData = salesItems[0][i].probabilityData ? JSON.parse(salesItems[0][i].probabilityData) : [];
                            output.push(res1);
                        }

                        response.data = {
                            transactionData: output,
                            count: salesItems[1][0].count,
                            probabilities: salesItems[2]
                        };

                        response.error = null;

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            chartData: [],
                            transactionData: [],
                            count: 0
                        };
                        response.error = null;

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting sales tracker";
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

salesCtrl.getSalesUserPerformanceByTimeLine = function (req, res, next) {
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

    if (!req.query.HEMasterId) {
        error.HEMasterId = 'Invalid HEMasterId';
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
                req.query.type = req.query.type ? req.query.type : 1;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit)
                ];
                /**
                 * Calling procedure to save form sales items
                 */
                var procQuery = 'CALL he_get_salesUserByTimeLine( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, salesItems) {
                    if (!err && salesItems && salesItems[0]) {

                        response.status = true;
                        response.message = "Sales tracker data loaded successfully";
                        var output = [];
                        for (var i = 0; i < salesItems[0].length; i++) {
                            var res1 = {};
                            res1.name = salesItems[0][i].name;
                            res1.HEUserId = salesItems[0][i].HEUserId;
                            res1.timeLineData = salesItems[0][i].timeLineData ? JSON.parse(salesItems[0][i].timeLineData) : [];
                            output.push(res1);
                        }

                        response.data = {
                            transactionData: output,
                            count: salesItems[1][0].count,
                            timeLineMaster: salesItems[2]
                        };

                        response.error = null;

                        // res.status(200).json(response);
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            chartData: [],
                            transactionData: [],
                            count: 0
                        };
                        response.error = null;
                        // res.status(200).json(response);

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting sales tracker";
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

salesCtrl.saveTaskForSalesSupport = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);
                    if (!req.body.title) {
                        error.title = 'Invalid title';
                        validationFlag *= false;
                    }

                    if (!req.body.taskType) {
                        error.taskType = 'Invalid taskType';
                        validationFlag *= false;
                    }

                    var validationFlag = true;
                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId || 0),
                            req.st.db.escape(req.body.title),
                            req.st.db.escape(req.body.description || ""),
                            req.st.db.escape(req.body.starts),
                            req.st.db.escape(req.body.durationHour || 0),
                            req.st.db.escape(req.body.durationMinute || 0),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.notes || ""),
                            req.st.db.escape(JSON.stringify(req.body.memberList || [])),
                            req.st.db.escape(JSON.stringify(req.body.attachmentList || [])),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.type || 1),
                            req.st.db.escape(req.body.latitude || 0),
                            req.st.db.escape(req.body.longitude || 0),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(JSON.stringify(req.body.expenseList || [])),
                            req.st.db.escape(req.body.taskType),
                            req.st.db.escape(req.body.changeLog || ""),
                            req.st.db.escape(req.body.isReminderEnabled || 0),
                            req.st.db.escape(req.body.reminder || 0),
                            req.st.db.escape(req.body.address || ""),
                            req.st.db.escape(req.body.meetingAddress || ""),
                            req.st.db.escape(req.body.meetingAddLatitude || 0),
                            req.st.db.escape(req.body.meetingAddLongitude || 0),
                            req.st.db.escape(req.body.distanceBetweenLocations || 0),
                            req.st.db.escape(req.body.isTravelAlert || 0),
                            req.st.db.escape(req.body.travelTime || 0)
                        ];

                        var procQuery = 'CALL he_save_taskForm_salesSupport( ' + procParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            if (!err && results && results[0] && results[0][0]) {
                                response.status = true;
                                response.message = "Task saved successfully";
                                response.error = null;
                                response.data = {
                                    taskDetails: results[0] && results[0][0] ? results[0][0] : null
                                };
                                // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                // zlib.gzip(buf, function (_, result) {
                                //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                                // });

                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving Task";
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


salesCtrl.getsalesupportCompanysearch = function (req, res, next) {

    var error = {};
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

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.keywords || ""),
                    req.st.db.escape(req.query.start || 0),
                    req.st.db.escape(req.query.limit || 0),
                    req.st.db.escape(req.query.isSupport || 0)
                ];

                var procQuery = 'CALL wm_get_saleSupport_companySearch( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    if (!err && result && result[0]) {

                        response.status = true;
                        response.message = "Company List data loaded successfully";

                        response.data = {
                            companyList: result[0],
                            count: result[1][0] && result[1][0].count ? result[1][0].count : 0

                        };

                        response.error = null;

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.data = {
                            companyList: [],
                            count: 0
                        };
                        response.error = null;
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting company List";
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


salesCtrl.getMemberListForSaleSupport = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);

                    if (!req.body.groupId) {
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

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.name || ''),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.starts || null),
                            req.st.db.escape(JSON.stringify(req.body.selectedUsers || [])),
                            req.st.db.escape(req.body.startPage || 1),
                            req.st.db.escape(req.body.limit || 50),
                            req.st.db.escape(req.body.isSupport || 0)  // 0 sale ,1-support
                        ];

                        var procQuery = 'CALL he_get_user_ForSaleSupport( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result && result[0] && result[0][0]) {

                                response.status = true;
                                response.message = "User List loaded successfully";
                                response.error = null;

                                for (var i = 0; i < result[0].length; i++) {
                                    result[0][i].schedules = result[0][i] && result[0][i].schedules ? JSON.parse(result[0][i].schedules) : []
                                }

                                response.data = {
                                    userList: result[0] ? result[0] : [],
                                    count: result[1][0] && result[1][0].count ? result[1][0].count : 0
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "No data found";
                                response.data = {
                                    userList: [],
                                    count: 0
                                };
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while getting user List";
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


salesCtrl.getMemberListForSaleSupportWithSelectedMembers = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);

                    if (!req.body.groupId) {
                        error.groupId = 'Invalid groupId';
                        validationFlag *= false;
                    }

                    if (typeof (req.body.selectedUsers) == 'string')
                        req.body.selectedUsers = req.body.selectedUsers ? JSON.parse(req.body.selectedUsers) : [];

                    if (!req.body.selectedUsers.length) {
                        error.selectedUsers = 'Invalid selectedUsers';
                        validationFlag *= false;
                    }
                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.name || ''),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.starts || null),
                            req.st.db.escape(JSON.stringify(req.body.selectedUsers || [])),
                            req.st.db.escape(req.body.startPage || 1),
                            req.st.db.escape(req.body.limit || 50),
                            req.st.db.escape(req.body.isSupport || 0)  // 0 sale ,1-support
                        ];

                        var procQuery = 'CALL he_get_user_ForSaleSupportWithSelectedMembers( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result && result[0] && result[0][0]) {

                                response.status = true;
                                response.message = "User List loaded successfully";
                                response.error = null;

                                for (var i = 0; i < result[0].length; i++) {
                                    result[0][i].schedules = result[0][i] && result[0][i].schedules ? JSON.parse(result[0][i].schedules) : []
                                }

                                response.data = {
                                    userList: result[0] ? result[0] : [],
                                    count: result[1][0] && result[1][0].count ? result[1][0].count : 0
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "No data found";
                                response.data = {
                                    userList: [],
                                    count: 0
                                };
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while getting user List";
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


salesCtrl.findClientContactsMember = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);

                    if (!req.body.groupId) {
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

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.keyword || ""),
                            req.st.db.escape(req.body.isSupport || 0),  // 0 sale ,1-support
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.startPage || 1),
                            req.st.db.escape(req.body.limit || 100)
                        ];

                        var procQuery = 'CALL HE_find_customer_saleSupport( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result && result[0] && result[0][0]) {

                                response.status = true;
                                response.message = "User List loaded successfully";
                                response.error = null;

                                for (var i = 0; i < result[0].length; i++) {
                                    result[0][i].companyDetails = result[0][i] && result[0][i].companyDetails && result[0][i].companyDetails != null ? JSON.parse(result[0][i].companyDetails) : null
                                }

                                response.data = {
                                    contactList: result[0] ? result[0] : [],
                                    count: result[1][0] && result[1][0].count ? result[1][0].count : 0
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "No data found";
                                response.data = {
                                    userList: [],
                                    count: 0
                                };
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while getting user List";
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

salesCtrl.taskTrackerSaleSupport = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);

                    if (!req.body.groupId) {
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

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.status || 0),
                            req.st.db.escape(req.body.startPage || 1),
                            req.st.db.escape(req.body.limit || 100),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.taskType || 0),  // 0 normal task ,1-sale,2-support,3-all
                            req.st.db.escape(req.body.referenceId || 0)
                        ];

                        var procQuery = 'CALL HE_get_scheduledTaskList_WithSaleSupportTasks( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result && result[0] && result[0][0]) {

                                response.status = true;
                                response.message = "Task List loaded successfully";
                                response.error = null;
                                response.data = {
                                    taskList: result[0] ? result[0] : [],
                                    count: result[1][0] && result[1][0].count ? result[1][0].count : 0
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "No data found";
                                response.data = {
                                    taskList: [],
                                    count: 0
                                };
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while getting task List";
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


salesCtrl.taskListSaleSupport = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);

                    if (!req.body.groupId) {
                        error.groupId = 'Invalid groupId';
                        validationFlag *= false;
                    }

                    if (!req.body.taskIdList.length) {
                        error.taskIdList = 'Invalid taskIdList';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(JSON.stringify(req.body.taskIdList || [])),
                            req.st.db.escape(req.body.referenceId || 0),
                            req.st.db.escape(DBSecretKey)
                        ];

                        var procQuery = 'CALL wm_get_saleSupport_taskList( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result && result[0] && result[0][0]) {

                                response.status = true;
                                response.message = "Task List loaded successfully";
                                response.error = null;

                                for (var i = 0; i < result[0].length; i++) {
                                    result[0][i].memberList = result[0][i] && JSON.parse(result[0][i].memberList) ? JSON.parse(result[0][i].memberList) : [];
                                    result[0][i].expenseList = result[0][i] && JSON.parse(result[0][i].expenseList) ? JSON.parse(result[0][i].expenseList) : [];

                                    for (var j = 0; j < result[0][i].expenseList.length; j++) {
                                        result[0][i].expenseList[j].attachmentList = result[0][i].expenseList[j] && JSON.parse(result[0][i].expenseList[j].attachmentList) ? JSON.parse(result[0][i].expenseList[j].attachmentList) : [];
                                    }

                                    result[0][i].attachmentList = result[0][i] && JSON.parse(result[0][i].attachmentList) ? JSON.parse(result[0][i].attachmentList) : [];
                                }

                                response.data = {
                                    taskList: result[0] ? result[0] : []
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "No data found";
                                response.data = {
                                    taskList: []
                                };
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while getting task List";
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

salesCtrl.saveSalesRequestWithTaskNew = function (req, res, next) {
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
        console.log(req.body);
        if (req.body.nkFlag == 1) {
            var keywordList = req.body.keywordList;
            if (typeof (keywordList) == "string") {
                keywordList = JSON.parse(keywordList);
            }
            if (!keywordList) {
                keywordList = [];
            }

            var attachmentList = req.body.attachmentList;
            if (typeof (attachmentList) == "string") {
                attachmentList = JSON.parse(attachmentList);
            }
            if (!attachmentList) {
                attachmentList = [];
            }

            var items = req.body.items;
            if (typeof (items) == "string") {
                items = JSON.parse(items);
            }
            if (!items) {
                items = [];
            }

            if (!req.body.groupId) {
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
                req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                if (req.body.phoneNo == "") {
                    req.body.isdPhone = "";
                }
                var taskDetails;
                return new Promise(function (resolve, reject) {
                    if (req.body.taskIdList && req.body.taskIdList.length > 0) {

                        var taskDetailsInput = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(JSON.stringify(req.body.taskIdList || [])),
                            req.st.db.escape(DBSecretKey)
                        ];
                        var taskDetailsInput = 'CALL wm_get_latest_taskDetails( ' + taskDetailsInput.join(',') + ')';
                        // console.log(taskDetailsInput);
                        req.db.query(taskDetailsInput, function (err, taskresults) {
                            console.log(err);
                            if (!err && taskresults && taskresults[0] && taskresults[0][0]) {

                                taskresults[0][0].memberList = taskresults[0][0] && JSON.parse(taskresults[0][0].memberList) ? JSON.parse(taskresults[0][0].memberList) : [];
                                taskresults[0][0].expenseList = taskresults[0][0] && JSON.parse(taskresults[0][0].expenseList) ? JSON.parse(taskresults[0][0].expenseList) : [];

                                for (var j = 0; j < taskresults[0][0].expenseList.length; j++) {
                                    taskresults[0][0].expenseList[j].attachmentList = taskresults[0][0].expenseList[j] && JSON.parse(taskresults[0][0].expenseList[j].attachmentList) ? JSON.parse(taskresults[0][0].expenseList[j].attachmentList) : [];
                                }

                                taskresults[0][0].attachmentList = taskresults[0][0] && JSON.parse(taskresults[0][0].attachmentList) ? JSON.parse(taskresults[0][0].attachmentList) : [];

                                taskDetails = taskresults[0][0];
                                console.log("promise in");
                                resolve(taskDetails);
                            }
                            else {
                                resolve('');
                            }
                        });
                    }
                    else {
                        console.log("promise out");
                        resolve('');
                    }
                }).then(function (resp) {
                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.parentId || 0),
                        req.st.db.escape(req.body.categoryId || 0),
                        req.st.db.escape(req.body.requirement || ""),
                        req.st.db.escape(req.body.senderNotes || ""),
                        req.st.db.escape(req.body.stage || 0),
                        req.st.db.escape(req.body.status || 0),
                        req.st.db.escape(req.body.reason || ""),
                        req.st.db.escape(req.body.receiverNotes || ""),
                        req.st.db.escape(req.body.currencyId || 0),
                        req.st.db.escape(req.body.amount || 0),
                        req.st.db.escape(req.body.probability || 0),
                        req.st.db.escape(req.body.infoToSender || ""),
                        req.st.db.escape(JSON.stringify(attachmentList || [])),
                        req.st.db.escape(req.body.changeLog || ""),
                        req.st.db.escape(req.body.groupId),
                        req.st.db.escape(req.body.learnMessageId || 0),
                        req.st.db.escape(req.body.accessUserType || 0),
                        req.st.db.escape(req.body.categoryTitle || ""),
                        req.st.db.escape(req.body.stageTitle || ""),
                        req.st.db.escape(req.body.statusTitle || ""),
                        req.st.db.escape(req.body.currencyTitle || ""),
                        req.st.db.escape(req.body.isInfoToSenderChanged || 0),
                        req.st.db.escape(req.body.discount || 0),
                        req.st.db.escape(JSON.stringify(items || [])),
                        req.st.db.escape(req.body.itemCurrencyId || 0),
                        req.st.db.escape(req.body.itemCurrencySymbol || ""),
                        req.st.db.escape(req.body.targetDate || null),
                        req.st.db.escape(DBSecretKey),
                        req.st.db.escape(req.body.timestamp || ""),
                        req.st.db.escape(req.body.createdTimeStamp || null),
                        req.st.db.escape(JSON.stringify(req.body.contactDetails || {})),
                        req.st.db.escape(JSON.stringify(req.body.taskIdList || [])),
                        req.st.db.escape(req.body.forcastValue || 0),
                        req.st.db.escape(JSON.stringify(taskDetails || null)),
                        req.st.db.escape(req.body.isReportingManager || 0),
                        req.st.db.escape(req.body.isTargetDate || 0),
                        req.st.db.escape(req.body.isConsider || 0),
                        req.st.db.escape(req.body.amount2 || 0),
                        req.st.db.escape(req.body.currencyId2 || 0),
                        req.st.db.escape(req.body.currencyTitle2 || ""),
                        req.st.db.escape(req.body.whatmateId || ""),
                        req.st.db.escape(req.body.nkFlag || 0)
                    ];

                    var salesFormId = 2000;
                    var keywordsParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(salesFormId),
                        req.st.db.escape(JSON.stringify(keywordList)),
                        req.st.db.escape(req.body.groupId)
                    ];

                    var procQuery = 'CALL he_save_salesRequest_WithTask_New( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, results) {
                        console.log(err);
                        // console.log("results",results);
                        if (!err && results && results[0] && results[0][0]) {

                            senderGroupId = results[0][0].senderId;

                            notifyMessages.getMessagesNeedToNotify();

                            console.log("results[2]", results[2]);

                            // reminder alert
                            if (results[2] && results[2][0]) {
                                for (var i = 0; i < results[2].length; i++) {
                                    if (results[2] && results[2][i]) {

                                        var messagePayload = {
                                            message: "",
                                            alarmType: 4,
                                            type: 301,
                                            data: {
                                                eventList: results[2][i] && results[2][i].eventList && JSON.parse(results[2][i].eventList) ? JSON.parse(results[2][i].eventList) : []
                                            }
                                            // {
                                            //     taskId: results[2][i] && results[2][i].taskId ? results[2][i].taskId : 0,
                                            //     title: results[2][i] && results[2][i].title ? results[2][i].title : "",
                                            //     description: results[2][i] && results[2][i].description ? results[2][i].description : "",
                                            //     reminderTime: results[2][i] && results[2][i].reminderTime ? results[2][i].reminderTime : 0,
                                            //     meetingStartDate: results[2][i] && results[2][i].meetingStartDate ? results[2][i].meetingStartDate : null,

                                            //     address: results[2][i] && results[2][i].address ? results[2][i].address : "",

                                            //     duration: results[2][i] && results[2][i].duration ? results[2][i].duration : 0,
                                            //     latitude: results[2][i] && results[2][i].latitude ? results[2][i].latitude : 0,
                                            //     longitude: results[2][i] && results[2][i].longitude ? results[2][i].longitude : 0,
                                            //     fromLatitude: results[2][i] && results[2][i].fromLatitude ? results[2][i].fromLatitude : 0,
                                            //     fromLongitude: results[2][i] && results[2][i].fromLongitude ? results[2][i].fromLongitude : 0,
                                            //     andEventId: results[2][i] && results[2][i].andEventId ? results[2][i].andEventId : '0',
                                            //     iosEventId : results[2][i] && results[2][i].iosEventId ? results[2][i].iosEventId : '0'
                                            // }
                                        }
                                        console.log('messagePayload', messagePayload);

                                        if (results && results[2] && results[2][i] && results[2][i].APNS_Id) {
                                            console.log('IOS notification');
                                            _Notification_aws.publish_IOS(results[2][i].APNS_Id, messagePayload, 0);

                                        }

                                        // if (results && results[2] && results[2][i] && results[2][i].creatorAPNS_Id) {
                                        //     _Notification_aws.publish_IOS(results[2][i].creatorAPNS_Id, messagePayload, 0);
                                        // }


                                        if (results && results[2] && results[2][i] && results[2][i].GCM_Id) {
                                            _Notification_aws.publish_Android(results[2][i].GCM_Id, messagePayload);
                                        }

                                        // if (results && results[2] && results[2][i] && results[2][i].creatorGCM_Id) {
                                        //     console.log("reminder for creator");
                                        //     console.log("messagePayload", messagePayload);
                                        //     _Notification_aws.publish_Android(results[2][i].creatorGCM_Id, messagePayload, 0);
                                        // }
                                    }
                                }
                            }


                            // travel alert
                            // console.log('results[3]',results[3]);
                            // if (results[3] && results[3][0]){
                            //     for(var i=0; i < results[3].length; i++){
                            //         if (results[3] && results[3][i] && results[3][i].isTravelAlert && results[3][i].reminderTime) {
                            //             var messagePayload = {
                            //                 message: "",
                            //                 alarmType: 4,
                            //                 type: 301,
                            //                 data: {
                            //                     taskId: results[3][i] && results[3][i].taskId ? results[3][i].taskId : 0,
                            //                     title: results[3][i] && results[3][i].title ? results[3][i].title : "",
                            //                     description: results[3][i] && results[3][i].description ? results[3][i].description : "",
                            //                     reminderTime: results[3][i] && results[3][i].reminderTime ? results[3][i].reminderTime : 0,
                            //                     meetingStartDate: results[3][i] && results[3][i].meetingStartDate ? results[3][i].meetingStartDate : null,

                            //                     address: results[3][i] && results[3][i].address ? results[3][i].address : "",

                            //                     duration: results[3][i] && results[3][i].duration ? results[3][i].duration : 0,
                            //                     latitude: results[3][i] && results[3][i].latitude ? results[3][i].latitude : 0,
                            //                     longitude: results[3][i] && results[3][i].longitude ? results[3][i].longitude : 0,
                            //                     fromLatitude: results[3][i] && results[3][i].fromLatitude ? results[3][i].fromLatitude : 0,
                            //                     fromLongitude: results[3][i] && results[3][i].fromLongitude ? results[3][i].fromLongitude : 0,
                            //                     andEventId: results[3][i] && results[3][i].andEventId ? results[3][i].andEventId : '0',
                            //                     iosEventId : results[3][i] && results[3][i].iosEventId ? results[3][i].iosEventId : '0'
                            //                 }
                            //             }

                            //             if (results && results[3] && results[3][i] && results[3][i].APNS_Id) {
                            //                 _Notification_aws.publish_IOS(results[3][i].APNS_Id, messagePayload, 0);
                            //             }

                            //             // if (results && results[3] && results[3][i] && results[3][i].creatorAPNS_Id) {
                            //             //     _Notification_aws.publish_IOS(results[3][i].creatorAPNS_Id, messagePayload, 0);
                            //             // }


                            //             if (results && results[3] && results[3][i] && results[3][i].GCM_Id) {
                            //                 _Notification_aws.publish_Android(results[3][i].GCM_Id, messagePayload);
                            //             }

                            //             // if (results && results[3] && results[3][i] && results[3][i].creatorGCM_Id) {
                            //             //     console.log("reminder for creator");
                            //             //     console.log("messagePayload", messagePayload);
                            //             //     _Notification_aws.publish_Android(results[3][i].creatorGCM_Id, messagePayload, 0);
                            //             // }
                            //         }
                            //     }    
                            // }

                            // old
                            // if (results[3] && results[3][0] && results[3][0].isTravelAlert && results[3][0].reminderTime) {
                            //     console.log('results[3][0]',results[3][0]);

                            //     var messagePayload = {
                            //         message: "",
                            //         alarmType: 4,
                            //         type: 301,
                            //         data: {
                            //             taskId: results[3][0] && results[3][0].taskId ? results[3][0].taskId : 0,
                            //             title: results[3][0] && results[3][0].title ? results[3][0].title : "",
                            //             description: results[3][0] && results[3][0].description ? results[3][0].description : "",
                            //             reminderTime: results[3][0] && results[3][0].reminderTime ? results[3][0].reminderTime : 0,
                            //             meetingStartDate: results[3][0] && results[3][0].meetingStartDate ? results[3][0].meetingStartDate : null,

                            //             address: results[3][0] && results[3][0].address ? results[3][0].address : "",

                            //             duration: results[3][0] && results[3][0].duration ? results[3][0].duration : 0,
                            //             latitude: results[3][0] && results[3][0].latitude ? results[3][0].latitude : 0,
                            //             longitude: results[3][0] && results[3][0].longitude ? results[3][0].longitude : 0,
                            //             fromLatitude: results[2][0] && results[2][0].fromLatitude ? results[2][0].fromLatitude : 0,
                            //             fromLongitude: results[2][0] && results[2][0].fromLongitude ? results[2][0].fromLongitude : 0
                            //         }
                            //     }

                            //     if (results && results[2] && results[2][0] && results[2][0].APNS_Id) {
                            //         _Notification_aws.publish_IOS(results[2][0].APNS_Id, messagePayload, 0);
                            //     }

                            //     if (results && results[2] && results[2][0] && results[2][0].creatorAPNS_Id) {
                            //         _Notification_aws.publish_IOS(results[2][0].creatorAPNS_Id, messagePayload, 0);
                            //     }


                            //     if (results && results[2] && results[2][0] && results[2][0].GCM_Id) {
                            //         _Notification_aws.publish_Android(results[2][0].GCM_Id, messagePayload);
                            //     }

                            //     if (results && results[2] && results[2][0] && results[2][0].creatorGCM_Id) {
                            //         console.log("reminder for creator");
                            //         console.log("messagePayload", messagePayload);
                            //         _Notification_aws.publish_Android(results[2][0].creatorGCM_Id, messagePayload, 0);
                            //     }
                            // }

                            response.status = true;
                            response.message = "Sales query submitted successfully";
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
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });

                        }
                        else if (!err) {
                            response.status = false;
                            response.message = "Failed to update sales query";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while saving sales query";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                });
            }
        }
        else {

            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        console.log(req.body);
                        // if (!req.body.requirement) {
                        //     error.requirement = 'Invalid requirement';
                        //     validationFlag *= false;
                        // }

                        var keywordList = req.body.keywordList;
                        if (typeof (keywordList) == "string") {
                            keywordList = JSON.parse(keywordList);
                        }
                        if (!keywordList) {
                            keywordList = [];
                        }

                        var attachmentList = req.body.attachmentList;
                        if (typeof (attachmentList) == "string") {
                            attachmentList = JSON.parse(attachmentList);
                        }
                        if (!attachmentList) {
                            attachmentList = [];
                        }

                        var items = req.body.items;
                        if (typeof (items) == "string") {
                            items = JSON.parse(items);
                        }
                        if (!items) {
                            items = [];
                        }

                        if (!req.body.groupId) {
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
                            req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                            if (req.body.phoneNo == "") {
                                req.body.isdPhone = "";
                            }
                            var taskDetails;
                            return new Promise(function (resolve, reject) {
                                if (req.body.taskIdList && req.body.taskIdList.length > 0) {

                                    var taskDetailsInput = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.body.groupId),
                                        req.st.db.escape(JSON.stringify(req.body.taskIdList || [])),
                                        req.st.db.escape(DBSecretKey)
                                    ];
                                    var taskDetailsInput = 'CALL wm_get_latest_taskDetails( ' + taskDetailsInput.join(',') + ')';
                                    // console.log(taskDetailsInput);
                                    req.db.query(taskDetailsInput, function (err, taskresults) {
                                        console.log(err);
                                        if (!err && taskresults && taskresults[0] && taskresults[0][0]) {

                                            taskresults[0][0].memberList = taskresults[0][0] && JSON.parse(taskresults[0][0].memberList) ? JSON.parse(taskresults[0][0].memberList) : [];
                                            taskresults[0][0].expenseList = taskresults[0][0] && JSON.parse(taskresults[0][0].expenseList) ? JSON.parse(taskresults[0][0].expenseList) : [];

                                            for (var j = 0; j < taskresults[0][0].expenseList.length; j++) {
                                                taskresults[0][0].expenseList[j].attachmentList = taskresults[0][0].expenseList[j] && JSON.parse(taskresults[0][0].expenseList[j].attachmentList) ? JSON.parse(taskresults[0][0].expenseList[j].attachmentList) : [];
                                            }

                                            taskresults[0][0].attachmentList = taskresults[0][0] && JSON.parse(taskresults[0][0].attachmentList) ? JSON.parse(taskresults[0][0].attachmentList) : [];

                                            taskDetails = taskresults[0][0];
                                            console.log("promise in");
                                            resolve(taskDetails);
                                        }
                                        else {
                                            resolve('');
                                        }
                                    });
                                }
                                else {
                                    console.log("promise out");
                                    resolve('');
                                }
                            }).then(function (resp) {
                                var procParams = [
                                    req.st.db.escape(req.query.token),
                                    req.st.db.escape(req.body.parentId || 0),
                                    req.st.db.escape(req.body.categoryId || 0),
                                    req.st.db.escape(req.body.requirement || ""),
                                    req.st.db.escape(req.body.senderNotes || ""),
                                    req.st.db.escape(req.body.stage || 0),
                                    req.st.db.escape(req.body.status || 0),
                                    req.st.db.escape(req.body.reason || ""),
                                    req.st.db.escape(req.body.receiverNotes || ""),
                                    req.st.db.escape(req.body.currencyId || 0),
                                    req.st.db.escape(req.body.amount || 0),
                                    req.st.db.escape(req.body.probability || 0),
                                    req.st.db.escape(req.body.infoToSender || ""),
                                    req.st.db.escape(JSON.stringify(attachmentList || [])),
                                    req.st.db.escape(req.body.changeLog || ""),
                                    req.st.db.escape(req.body.groupId),
                                    req.st.db.escape(req.body.learnMessageId || 0),
                                    req.st.db.escape(req.body.accessUserType || 0),
                                    req.st.db.escape(req.body.categoryTitle || ""),
                                    req.st.db.escape(req.body.stageTitle || ""),
                                    req.st.db.escape(req.body.statusTitle || ""),
                                    req.st.db.escape(req.body.currencyTitle || ""),
                                    req.st.db.escape(req.body.isInfoToSenderChanged || 0),
                                    req.st.db.escape(req.body.discount || 0),
                                    req.st.db.escape(JSON.stringify(items || [])),
                                    req.st.db.escape(req.body.itemCurrencyId || 0),
                                    req.st.db.escape(req.body.itemCurrencySymbol || ""),
                                    req.st.db.escape(req.body.targetDate || null),
                                    req.st.db.escape(DBSecretKey),
                                    req.st.db.escape(req.body.timestamp || ""),
                                    req.st.db.escape(req.body.createdTimeStamp || null),
                                    req.st.db.escape(JSON.stringify(req.body.contactDetails || {})),
                                    req.st.db.escape(JSON.stringify(req.body.taskIdList || [])),
                                    req.st.db.escape(req.body.forcastValue || 0),
                                    req.st.db.escape(JSON.stringify(taskDetails || null)),
                                    req.st.db.escape(req.body.isReportingManager || 0),
                                    req.st.db.escape(req.body.isTargetDate || 0),
                                    req.st.db.escape(req.body.isConsider || 0),
                                    req.st.db.escape(req.body.amount2 || 0),
                                    req.st.db.escape(req.body.currencyId2 || 0),
                                    req.st.db.escape(req.body.currencyTitle2 || ""),
                                    req.st.db.escape(req.body.whatmateId || ""),
                                    req.st.db.escape(req.body.nkFlag || 0)

                                ];

                                var salesFormId = 2000;
                                var keywordsParams = [
                                    req.st.db.escape(req.query.token),
                                    req.st.db.escape(salesFormId),
                                    req.st.db.escape(JSON.stringify(keywordList)),
                                    req.st.db.escape(req.body.groupId)
                                ];

                                var procQuery = 'CALL he_save_salesRequest_WithTask_New( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                                console.log(procQuery);
                                req.db.query(procQuery, function (err, results) {
                                    console.log(err);
                                    // console.log("results",results);
                                    if (!err && results && results[0] && results[0][0]) {

                                        senderGroupId = results[0][0].senderId;

                                        notifyMessages.getMessagesNeedToNotify();

                                        if (results && results[2] && results[2][0] && results[2][0].receiverId) {
                                            if (notificationTemplaterRes.parsedTpl) {
                                                notification.publish(
                                                    results[2][0].receiverId,
                                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                    results[0][0].senderId,
                                                    notificationTemplaterRes.parsedTpl,
                                                    41,
                                                    0, (results[2][0].iphoneId) ? (results[2][0].iphoneId) : '',
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
                                                        parentId: results[2][0].parentId,
                                                        groupId: results[2][0].groupId,
                                                        requirement: results[2][0].requirement,
                                                        feedback: results[2][0].feedback,
                                                        rating: results[2][0].rating,
                                                        updatedDate: results[2][0].updatedDate,
                                                        status: results[2][0].status
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

                                        console.log("results[2]", results[2]);

                                        // reminder alert
                                        if (results[2] && results[2][0]) {
                                            for (var i = 0; i < results[2].length; i++) {
                                                if (results[2] && results[2][i]) {

                                                    var messagePayload = {
                                                        message: "",
                                                        alarmType: 4,
                                                        type: 301,
                                                        data: {
                                                            eventList: results[2][i] && results[2][i].eventList && JSON.parse(results[2][i].eventList) ? JSON.parse(results[2][i].eventList) : []
                                                        }
                                                        // {
                                                        //     taskId: results[2][i] && results[2][i].taskId ? results[2][i].taskId : 0,
                                                        //     title: results[2][i] && results[2][i].title ? results[2][i].title : "",
                                                        //     description: results[2][i] && results[2][i].description ? results[2][i].description : "",
                                                        //     reminderTime: results[2][i] && results[2][i].reminderTime ? results[2][i].reminderTime : 0,
                                                        //     meetingStartDate: results[2][i] && results[2][i].meetingStartDate ? results[2][i].meetingStartDate : null,

                                                        //     address: results[2][i] && results[2][i].address ? results[2][i].address : "",

                                                        //     duration: results[2][i] && results[2][i].duration ? results[2][i].duration : 0,
                                                        //     latitude: results[2][i] && results[2][i].latitude ? results[2][i].latitude : 0,
                                                        //     longitude: results[2][i] && results[2][i].longitude ? results[2][i].longitude : 0,
                                                        //     fromLatitude: results[2][i] && results[2][i].fromLatitude ? results[2][i].fromLatitude : 0,
                                                        //     fromLongitude: results[2][i] && results[2][i].fromLongitude ? results[2][i].fromLongitude : 0,
                                                        //     andEventId: results[2][i] && results[2][i].andEventId ? results[2][i].andEventId : '0',
                                                        //     iosEventId : results[2][i] && results[2][i].iosEventId ? results[2][i].iosEventId : '0'
                                                        // }
                                                    }
                                                    console.log('messagePayload', messagePayload);

                                                    if (results && results[2] && results[2][i] && results[2][i].APNS_Id) {
                                                        console.log('IOS notification');
                                                        _Notification_aws.publish_IOS(results[2][i].APNS_Id, messagePayload, 0);

                                                    }

                                                    // if (results && results[2] && results[2][i] && results[2][i].creatorAPNS_Id) {
                                                    //     _Notification_aws.publish_IOS(results[2][i].creatorAPNS_Id, messagePayload, 0);
                                                    // }


                                                    if (results && results[2] && results[2][i] && results[2][i].GCM_Id) {
                                                        _Notification_aws.publish_Android(results[2][i].GCM_Id, messagePayload);
                                                    }

                                                    // if (results && results[2] && results[2][i] && results[2][i].creatorGCM_Id) {
                                                    //     console.log("reminder for creator");
                                                    //     console.log("messagePayload", messagePayload);
                                                    //     _Notification_aws.publish_Android(results[2][i].creatorGCM_Id, messagePayload, 0);
                                                    // }
                                                }
                                            }
                                        }


                                        // travel alert
                                        // console.log('results[3]',results[3]);
                                        // if (results[3] && results[3][0]){
                                        //     for(var i=0; i < results[3].length; i++){
                                        //         if (results[3] && results[3][i] && results[3][i].isTravelAlert && results[3][i].reminderTime) {
                                        //             var messagePayload = {
                                        //                 message: "",
                                        //                 alarmType: 4,
                                        //                 type: 301,
                                        //                 data: {
                                        //                     taskId: results[3][i] && results[3][i].taskId ? results[3][i].taskId : 0,
                                        //                     title: results[3][i] && results[3][i].title ? results[3][i].title : "",
                                        //                     description: results[3][i] && results[3][i].description ? results[3][i].description : "",
                                        //                     reminderTime: results[3][i] && results[3][i].reminderTime ? results[3][i].reminderTime : 0,
                                        //                     meetingStartDate: results[3][i] && results[3][i].meetingStartDate ? results[3][i].meetingStartDate : null,

                                        //                     address: results[3][i] && results[3][i].address ? results[3][i].address : "",

                                        //                     duration: results[3][i] && results[3][i].duration ? results[3][i].duration : 0,
                                        //                     latitude: results[3][i] && results[3][i].latitude ? results[3][i].latitude : 0,
                                        //                     longitude: results[3][i] && results[3][i].longitude ? results[3][i].longitude : 0,
                                        //                     fromLatitude: results[3][i] && results[3][i].fromLatitude ? results[3][i].fromLatitude : 0,
                                        //                     fromLongitude: results[3][i] && results[3][i].fromLongitude ? results[3][i].fromLongitude : 0,
                                        //                     andEventId: results[3][i] && results[3][i].andEventId ? results[3][i].andEventId : '0',
                                        //                     iosEventId : results[3][i] && results[3][i].iosEventId ? results[3][i].iosEventId : '0'
                                        //                 }
                                        //             }

                                        //             if (results && results[3] && results[3][i] && results[3][i].APNS_Id) {
                                        //                 _Notification_aws.publish_IOS(results[3][i].APNS_Id, messagePayload, 0);
                                        //             }

                                        //             // if (results && results[3] && results[3][i] && results[3][i].creatorAPNS_Id) {
                                        //             //     _Notification_aws.publish_IOS(results[3][i].creatorAPNS_Id, messagePayload, 0);
                                        //             // }


                                        //             if (results && results[3] && results[3][i] && results[3][i].GCM_Id) {
                                        //                 _Notification_aws.publish_Android(results[3][i].GCM_Id, messagePayload);
                                        //             }

                                        //             // if (results && results[3] && results[3][i] && results[3][i].creatorGCM_Id) {
                                        //             //     console.log("reminder for creator");
                                        //             //     console.log("messagePayload", messagePayload);
                                        //             //     _Notification_aws.publish_Android(results[3][i].creatorGCM_Id, messagePayload, 0);
                                        //             // }
                                        //         }
                                        //     }    
                                        // }

                                        // old
                                        // if (results[3] && results[3][0] && results[3][0].isTravelAlert && results[3][0].reminderTime) {
                                        //     console.log('results[3][0]',results[3][0]);

                                        //     var messagePayload = {
                                        //         message: "",
                                        //         alarmType: 4,
                                        //         type: 301,
                                        //         data: {
                                        //             taskId: results[3][0] && results[3][0].taskId ? results[3][0].taskId : 0,
                                        //             title: results[3][0] && results[3][0].title ? results[3][0].title : "",
                                        //             description: results[3][0] && results[3][0].description ? results[3][0].description : "",
                                        //             reminderTime: results[3][0] && results[3][0].reminderTime ? results[3][0].reminderTime : 0,
                                        //             meetingStartDate: results[3][0] && results[3][0].meetingStartDate ? results[3][0].meetingStartDate : null,

                                        //             address: results[3][0] && results[3][0].address ? results[3][0].address : "",

                                        //             duration: results[3][0] && results[3][0].duration ? results[3][0].duration : 0,
                                        //             latitude: results[3][0] && results[3][0].latitude ? results[3][0].latitude : 0,
                                        //             longitude: results[3][0] && results[3][0].longitude ? results[3][0].longitude : 0,
                                        //             fromLatitude: results[2][0] && results[2][0].fromLatitude ? results[2][0].fromLatitude : 0,
                                        //             fromLongitude: results[2][0] && results[2][0].fromLongitude ? results[2][0].fromLongitude : 0
                                        //         }
                                        //     }

                                        //     if (results && results[2] && results[2][0] && results[2][0].APNS_Id) {
                                        //         _Notification_aws.publish_IOS(results[2][0].APNS_Id, messagePayload, 0);
                                        //     }

                                        //     if (results && results[2] && results[2][0] && results[2][0].creatorAPNS_Id) {
                                        //         _Notification_aws.publish_IOS(results[2][0].creatorAPNS_Id, messagePayload, 0);
                                        //     }


                                        //     if (results && results[2] && results[2][0] && results[2][0].GCM_Id) {
                                        //         _Notification_aws.publish_Android(results[2][0].GCM_Id, messagePayload);
                                        //     }

                                        //     if (results && results[2] && results[2][0] && results[2][0].creatorGCM_Id) {
                                        //         console.log("reminder for creator");
                                        //         console.log("messagePayload", messagePayload);
                                        //         _Notification_aws.publish_Android(results[2][0].creatorGCM_Id, messagePayload, 0);
                                        //     }
                                        // }

                                        response.status = true;
                                        response.message = "Sales query submitted successfully";
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
                                    else if (!err) {
                                        response.status = false;
                                        response.message = "Failed to update sales query";
                                        response.error = null;
                                        response.data = null;
                                        res.status(200).json(response);
                                    }
                                    else {
                                        response.status = false;
                                        response.message = "Error while saving sales query";
                                        response.error = null;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                });
                            });
                        }
                    });
                }
                else {
                    res.status(401).json(response);
                }
            });
        }
    }
};


salesCtrl.saleSupportMailerTemplateList = function (req, res, next) {

    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                //     console.log(req.body);

                if (!req.query.groupId) {
                    error.groupId = 'Invalid groupId';
                    validationFlag *= false;
                }
                if (!req.query.taskType) {
                    error.taskType = 'Invalid taskType';
                    validationFlag *= false;
                }
                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.groupId),
                        req.st.db.escape(req.query.taskType)
                    ];

                    var procQuery = 'CALL wm_get_salesMailTemplates( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0] && result[0][0]) {

                            response.status = true;
                            response.message = "Templates loaded successfully";
                            response.error = null;
                            response.data = {
                                templateList: result[0] ? result[0] : []
                            };

                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = {
                                templateList: []
                            };
                            response.error = null;
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting template List";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


salesCtrl.saleSupportMailerPreview = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);

                    if (!req.body.groupId) {
                        error.groupId = 'Invalid groupId';
                        validationFlag *= false;
                    }

                    if (!req.body.parentId) {
                        error.parentId = 'Invalid parentId';
                        validationFlag *= false;
                    }

                    if (!req.body.templateId) {
                        error.templateId = 'Invalid templateId';
                        validationFlag *= false;
                    }
                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.templateId),
                            req.st.db.escape(req.body.isSupport || 0),
                            req.st.db.escape(DBSecretKey)
                        ];

                        var procQuery = 'CALL wm_get_salesProposalMailer( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result && result[0] && result[0][0]) {

                                var subject = result[0][0] && result[0][0].subject ? result[0][0].subject : "(no-subject)";
                                var mailBody = result[0][0] && result[0][0].mailBody ? result[0][0].mailBody : "";
                                var cc = result[0][0] && result[0][0].cc ? result[0][0].cc : [];
                                var bcc = result[0][0] && result[0][0].bcc ? result[0][0].bcc : [];
                                var templateId = result[0][0] && result[0][0].templateId ? result[0][0].templateId : 0;
                                var tags = result[0][0] && result[0][0].tags && JSON.parse(result[0][0].tags) ? JSON.parse(result[0][0].tags) : [];
                                var tableTags = result[0][0] && result[0][0].tableTags && JSON.parse(result[0][0].tableTags) ? JSON.parse(result[0][0].tableTags) : [];
                                var attachmentName = result[0][0] && result[0][0].attachmentName ? result[0][0].attachmentName : "";
                                var toEmailId = result[1][0] && result[1][0].contactEmailId ? result[1][0].contactEmailId : "";
                                var fromEmailId = result[1][0] && result[1][0].fromEmailId ? result[1][0].fromEmailId : "";

                                var isAttachment = result[0][0] && result[0][0].isAttachment ? result[0][0].isAttachment : 0;
                                var itemList = result[1] && result[1][0] && JSON.parse(result[1][0].itemList) ? JSON.parse(result[1][0].itemList) : [];

                                function escapeRegExp(string) {
                                    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                                }

                                function replaceAll(mailStrBody, tagTerm, replaceFromResult) {
                                    return mailStrBody.replace(new RegExp(escapeRegExp(tagTerm), 'g'), replaceFromResult);
                                }

                                if (result[1] && result[1][0]) {
                                    for (tagIndex = 0; tagIndex < tags.length; tagIndex++) {
                                        if ((result[1][0][tags[tagIndex].tagName] && result[1][0][tags[tagIndex].tagName] != null && result[1][0][tags[tagIndex].tagName] != "") || result[1][0][tags[tagIndex].tagName] >= -1) {
                                            mailBody = replaceAll(mailBody, '[' + tags[tagIndex].tagName + ']', result[1][0][tags[tagIndex].tagName]);
                                            subject = replaceAll(subject, '[' + tags[tagIndex].tagName + ']', result[1][0][tags[tagIndex].tagName]);
                                        }
                                    }
                                }

                                if (tableTags.length > 0 && itemList.length > 0) {
                                    var position = mailBody.indexOf('@table');
                                    var tableContent = '';
                                    mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                    tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                    // console.log(tableContent, 'mailbody');
                                    for (var tagCount = 0; tagCount < tableTags.length; tagCount++) {
                                        tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px; background:#c18e5963;">' + tableTags[tagCount].displayTagAs + "</th>";
                                    }
                                    tableContent += "</tr>";
                                    for (var itemCount = 0; itemCount < itemList.length; itemCount++) {
                                        tableContent += "<tr>";
                                        for (var tagCount = 0; tagCount < tableTags.length; tagCount++) {
                                            if (itemList[itemCount][tableTags[tagCount].tagName] && itemList[itemCount][tableTags[tagCount].tagName] != "" && itemList[itemCount][tableTags[tagCount].tagName] != null) {
                                                tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + itemList[itemCount][tableTags[tagCount].tagName] + "</td>";
                                            }
                                        }
                                        tableContent += "</tr>";
                                    }

                                    tableContent += "</table>";
                                    mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');
                                }


                                response.status = true;
                                response.message = "Mail Preview loaded successfully";
                                response.error = null;
                                response.data = {
                                    mailBody: mailBody ? mailBody : "",
                                    subject: subject ? subject : [],
                                    fromEmailId: fromEmailId ? fromEmailId : "",
                                    cc: cc ? cc : [],
                                    bcc: bcc ? bcc : [],
                                    toEmailId: toEmailId ? toEmailId : ""
                                    // results: result
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "No data found";
                                response.data = {
                                    mailBody: ""
                                };
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while loading mail preview";
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


salesCtrl.saleSupportMailerSendMail = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);

                    if (!req.body.groupId) {
                        error.groupId = 'Invalid groupId';
                        validationFlag *= false;
                    }

                    if (!req.body.parentId) {
                        error.parentId = 'Invalid parentId';
                        validationFlag *= false;
                    }

                    if (!req.body.templateId) {
                        error.templateId = 'Invalid templateId';
                        validationFlag *= false;
                    }

                    // if (!req.body.fromEmailId) {
                    //     error.fromEmailId = 'Invalid fromEmailId';
                    //     validationFlag *= false;
                    // }

                    if (!req.body.toEmailId || !req.body.toEmailId.length) {
                        error.toEmailId = 'Invalid toEmailId';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.templateId),
                            req.st.db.escape(req.body.isSupport || 0),
                            req.st.db.escape(DBSecretKey)
                        ];

                        var procQuery = 'CALL wm_get_salesProposalMailer( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result && result[0] && result[0][0]) {

                                var subject = result[0][0] && result[0][0].subject ? result[0][0].subject : "(no-subject)";
                                var mailBody = result[0][0] && result[0][0].mailBody ? result[0][0].mailBody : "";
                                var cc = req.body.cc ? req.body.cc : [];
                                var bcc = req.body.bcc ? req.body.bcc : [];
                                var tags = result[0][0] && result[0][0].tags && JSON.parse(result[0][0].tags) ? JSON.parse(result[0][0].tags) : [];
                                var tableTags = result[0][0] && result[0][0].tableTags && JSON.parse(result[0][0].tableTags) ? JSON.parse(result[0][0].tableTags) : []; var attachmentName = result[0][0] && result[0][0].attachmentName ? result[0][0].attachmentName : "";
                                var toEmailId = req.body.toEmailId;
                                var fromEmailId = result[1] && result[1][0] && result[1][0].fromEmailId ? result[1][0].fromEmailId : "";
                                var isAttachment = result[0][0] && result[0][0].isAttachment ? result[0][0].isAttachment : 0;
                                var itemList = result[1] && result[1][0] && JSON.parse(result[1][0].itemList) ? JSON.parse(result[1][0].itemList) : [];

                                function escapeRegExp(string) {
                                    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                                }

                                function replaceAll(mailStrBody, tagTerm, replaceFromResult) {
                                    return mailStrBody.replace(new RegExp(escapeRegExp(tagTerm), 'g'), replaceFromResult);
                                }


                                if (result[1] && result[1][0]) {
                                    for (tagIndex = 0; tagIndex < tags.length; tagIndex++) {

                                        if ((result[1][0][tags[tagIndex].tagName] && result[1][0][tags[tagIndex].tagName] != null && result[1][0][tags[tagIndex].tagName] != "") || result[1][0][tags[tagIndex].tagName] >= -1) {
                                            mailBody = replaceAll(mailBody, '[' + tags[tagIndex].tagName + ']', result[1][0][tags[tagIndex].tagName]);
                                            subject = replaceAll(subject, '[' + tags[tagIndex].tagName + ']', result[1][0][tags[tagIndex].tagName]);
                                        }
                                    }
                                }


                                if (tableTags.length > 0 && itemList.length > 0) {
                                    var position = mailBody.indexOf('@table');
                                    var tableContent = '';
                                    mailBody = mailBody.replace(/@table(.*)\:@table/g, '');
                                    tableContent += '<br><table style="border: 1px solid #ddd;min-width:50%;max-width: 100%;margin-bottom: 20px;border-spacing: 0;border-collapse: collapse;"><tr>'
                                    console.log(tableContent, 'mailbody');
                                    for (var tagCount = 0; tagCount < tableTags.length; tagCount++) {
                                        tableContent += '<th style="border-top: 0;border-bottom-width: 2px;border: 1px solid #ddd;vertical-align: bottom;text-align: left;padding: 8px;line-height: 1.42857143;font-family: Verdana,sans-serif;font-size: 15px; background:#c18e5963;">' + tableTags[tagCount].displayTagAs + "</th>";
                                    }
                                    tableContent += "</tr>";
                                    for (var itemCount = 0; itemCount < itemList.length; itemCount++) {
                                        tableContent += "<tr>";
                                        for (var tagCount = 0; tagCount < tableTags.length; tagCount++) {
                                            if (itemList[itemCount][tableTags[tagCount].tagName] && itemList[itemCount][tableTags[tagCount].tagName] != null) {
                                                tableContent += '<td style="border: 1px solid #ddd;padding: 8px;line-height: 1.42857143;vertical-align: top;border-top: 1px solid #ddd;">' + itemList[itemCount][tableTags[tagCount].tagName] + "</td>";
                                            }
                                        }
                                        tableContent += "</tr>";
                                    }

                                    tableContent += "</table>";
                                    mailBody = [mailBody.slice(0, position), tableContent, mailBody.slice(position)].join('');
                                }


                                var mailOptions = {
                                    from: fromEmailId,
                                    to: toEmailId,
                                    subject: subject,
                                    html: mailBody,
                                    cc: cc,
                                    bcc: bcc
                                };

                                var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                var email = new sendgrid.Email();
                                email.from = mailOptions.from;
                                email.to = mailOptions.to;
                                email.subject = mailOptions.subject;
                                email.mbody = mailOptions.html;
                                email.cc = mailOptions.cc;
                                email.bcc = mailOptions.bcc;
                                email.html = mailOptions.html;

                                sendgrid.send(email, function (err, result) {
                                    if (!err) {
                                        console.log("Mail sent", result);
                                        response.status = true;
                                        response.message = "Mail Sent successfully";
                                        response.error = null;
                                        response.data = null;
                                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                        // zlib.gzip(buf, function (_, result) {
                                        //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                        // });
                                    }
                                    else {

                                        if (!fromEmailId || fromEmailId == "")
                                            response.message = "Invalid From MailID";
                                        else
                                            response.message = "Mail could not be sent";

                                        response.status = false;
                                        response.error = null;
                                        response.data = null;
                                        // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                        // zlib.gzip(buf, function (_, result) {
                                        //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);
                                        // });
                                    }
                                });


                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "No data found";
                                response.data = {
                                    mailBody: ""
                                };
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while loading mail preview";
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


salesCtrl.salesTargetvsPerformance = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);

                    if (!req.body.heMasterId) {
                        error.heMasterId = 'Invalid heMasterId';
                        validationFlag *= false;
                    }
                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.heMasterId),
                            req.st.db.escape(req.body.fromDate || null),
                            req.st.db.escape(req.body.toDate || null),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.type || 1)
                        ];

                        var procQuery = 'CALL wm_get_SalesTargetPerformance( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            console.log(err);
                            if (!err && result) {

                                response.status = true;
                                response.message = "Report loaded successfully";
                                response.error = null;

                                // for (var i = 0; i < result[0].length; i++) {
                                //     result[0][i].targetList = result[0][i] && JSON.parse(result[0][i].targetList) ? JSON.parse(result[0][i].targetList) : [];
                                // }

                                response.data = {
                                    salesMemberList: result[0] ? result[0] : [],
                                    fromDate: result[1][0] && result[1][0].fromDate ? result[1][0].fromDate : null,
                                    toDate: result[1][0] && result[1][0].toDate ? result[1][0].toDate : null
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "No data found";
                                response.data = {
                                    salesMemberList: [],
                                    fromDate: null,
                                    toDate: null
                                };
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while getting report";
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


salesCtrl.mailTemplateMasterData = function (req, res, next) {

    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                //     console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }
                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.query.editFlag || 0),
                        req.st.db.escape(req.query.isSendProposal || 0)
                    ];

                    var procQuery = 'CALL wm_get_salesSupportMailTemplateMaster( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0] && result[0][0]) {

                            response.status = true;
                            response.message = "Master Data loaded successfully";
                            response.error = null;
                            response.data = {
                                mailTypes: result[0] ? result[0] : [],
                                templateList: result[1] ? result[1] : [],
                                tagList: {
                                    sales: result[2] ? result[2] : []
                                },
                                isSendProposal: result[3] && result[3][0] && result[3][0].isSendProposal ? result[3][0].isSendProposal : 0
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = {
                                mailTypes: [],
                                templateList: [],
                                tagList: []
                            };
                            response.error = null;
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting data";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};


salesCtrl.SaveMailTemplateSalesSupport = function (req, res, next) {

    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                //     console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }

                if (!req.body.templateName) {
                    error.templateName = 'Invalid templateName';
                    validationFlag *= false;
                }

                if (!req.body.type) {
                    error.type = 'Invalid type';
                    validationFlag *= false;
                }

                if (!req.body.subject) {
                    error.subject = 'Invalid subject';
                    validationFlag *= false;
                }

                if (!req.body.mailBody) {
                    error.mailBody = 'Invalid mailBody';
                    validationFlag *= false;
                }


                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.body.templateId || 0),
                        req.st.db.escape(req.body.templateName),
                        req.st.db.escape(req.body.type),
                        req.st.db.escape(JSON.stringify(req.body.cc || [])),
                        req.st.db.escape(JSON.stringify(req.body.bcc || [])),
                        req.st.db.escape(req.body.subject),
                        req.st.db.escape(req.body.mailBody),
                        req.st.db.escape(JSON.stringify(req.body.tags || [])),
                        req.st.db.escape(JSON.stringify(req.body.tableTags || []))

                    ];

                    var procQuery = 'CALL wm_save_salesSupportmailTemplate( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0] && result[0][0]) {

                            response.status = true;
                            response.message = "Template saved successfully";
                            response.error = null;
                            response.data = {
                                templateList: result[0] ? result[0] : []
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = {
                                templateList: []
                            };
                            response.error = null;
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting data";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

salesCtrl.salesSupportExpenseList = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);

                    if (!req.body.groupId) {
                        error.groupId = 'Invalid groupId';
                        validationFlag *= false;
                    }

                    if (!req.body.parentId) {
                        error.parentId = 'Invalid parentId';
                        validationFlag *= false;
                    }

                    if (!req.body.taskType) {
                        error.taskType = 'Invalid taskType';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.taskType),
                            req.st.db.escape(DBSecretKey)
                        ];

                        var procQuery = 'CALL wm_get_expenseTrackerSalesSupport( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result && result[0] && result[0][0]) {

                                response.status = true;
                                response.message = "Expense list loaded successfully";
                                response.error = null;

                                for (var i = 0; i < result[0].length; i++) {
                                    result[0][i].attachmentList = result[0] && result[0][i] && JSON.parse(result[0][i].attachmentList) ? JSON.parse(result[0][i].attachmentList) : [];
                                }

                                response.data = {
                                    expenseList: result[0] ? result[0] : []
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "No data found";
                                response.data = {
                                    expenseList: []
                                };
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while getting expense list";
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


salesCtrl.deleteSaleSupportTemplate = function (req, res, next) {

    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                //     console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }

                if (!req.query.templateId) {
                    error.templateId = 'Invalid templateId';
                    validationFlag *= false;
                }


                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.query.templateId)
                    ];

                    var procQuery = 'CALL wm_delete_salesSupportDeleteTemplate( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0] && result[0][0]) {

                            response.status = true;
                            response.message = "Template deleted successfully";
                            response.error = null;

                            response.data = {
                                templateList: result[0] ? result[0] : []
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "Templates deleted.Templates does not exist";
                            response.data = {
                                templateList: []
                            };
                            // response.error = null;
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error Occured";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};



salesCtrl.saveSupportRequestNew = function (req, res, next) {
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
        console.log(req.body);
        if (req.body.nkFlag == 1) {
            var keywordList = req.body.keywordList;
            if (typeof (keywordList) == "string") {
                keywordList = JSON.parse(keywordList);
            }
            if (!keywordList) {
                keywordList = [];
            }

            var attachmentList = req.body.attachmentList;
            if (typeof (attachmentList) == "string") {
                attachmentList = JSON.parse(attachmentList);
            }
            if (!attachmentList) {
                attachmentList = [];
            }

            if (!req.body.groupId) {
                error.groupId = 'Invalid groupId';
                validationFlag *= false;
            }

            if (!req.body.whatmateId) {
                error.whatmateId = 'Invalid whatmateId';
                validationFlag *= false;
            }

            if (!validationFlag) {
                response.error = error;
                response.message = 'Please check the errors';
                res.status(400).json(response);
                console.log(response);
            }
            else {
                req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                var taskDetails;
                return new Promise(function (resolve, reject) {
                    if (req.body.taskIdList && req.body.taskIdList.length > 0) {

                        var taskDetailsInput = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(JSON.stringify(req.body.taskIdList || [])),
                            req.st.db.escape(DBSecretKey)
                        ];
                        var taskDetailsInput = 'CALL wm_get_latest_taskDetails( ' + taskDetailsInput.join(',') + ')';
                        req.db.query(taskDetailsInput, function (err, taskresults) {
                            console.log(err);
                            if (!err && taskresults && taskresults[0] && taskresults[0][0]) {

                                taskresults[0][0].memberList = taskresults[0][0] && JSON.parse(taskresults[0][0].memberList) ? JSON.parse(taskresults[0][0].memberList) : [];
                                taskresults[0][0].expenseList = taskresults[0][0] && JSON.parse(taskresults[0][0].expenseList) ? JSON.parse(taskresults[0][0].expenseList) : [];

                                for (var j = 0; j < taskresults[0][0].expenseList.length; j++) {
                                    taskresults[0][0].expenseList[j].attachmentList = taskresults[0][0].expenseList[j] && JSON.parse(taskresults[0][0].expenseList[j].attachmentList) ? JSON.parse(taskresults[0][0].expenseList[j].attachmentList) : [];
                                }

                                taskresults[0][0].attachmentList = taskresults[0][0] && JSON.parse(taskresults[0][0].attachmentList) ? JSON.parse(taskresults[0][0].attachmentList) : [];

                                taskDetails = taskresults[0][0];
                                console.log("promise in");
                                resolve(taskDetails);
                            }
                            else {
                                resolve('');
                            }
                        });
                    }
                    else {
                        console.log("promise out");
                        resolve('');
                    }
                }).then(function (resp) {
                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.parentId || 0),
                        req.st.db.escape(req.body.categoryId || 0),
                        req.st.db.escape(req.body.description),
                        req.st.db.escape(req.body.priority),
                        req.st.db.escape(req.body.senderNotes || ""),
                        req.st.db.escape(req.body.status || 3),
                        req.st.db.escape(req.body.receiverNotes || ""),
                        req.st.db.escape(req.body.infoToSender || ""),
                        req.st.db.escape(JSON.stringify(attachmentList || [])),
                        req.st.db.escape(req.body.changeLog || ""),
                        req.st.db.escape(req.body.groupId),
                        req.st.db.escape(req.body.learnMessageId || 0),
                        req.st.db.escape(req.body.accessUserType || 0),
                        req.st.db.escape(req.body.categoryTitle || ""),
                        req.st.db.escape(req.body.isInfoToSenderChanged || 0),
                        req.st.db.escape(DBSecretKey),
                        req.st.db.escape(req.body.timestamp),
                        req.st.db.escape(req.body.createdTimeStamp),
                        req.st.db.escape(JSON.stringify(req.body.contactDetails || {})),
                        req.st.db.escape(JSON.stringify(req.body.taskIdList || [])),
                        req.st.db.escape(JSON.stringify(taskDetails || null)),
                        req.st.db.escape(req.body.isReportingManager || 0),
                        req.st.db.escape(req.body.whatmateId || ""),
                        req.st.db.escape(req.body.nkFlag || 0)
                    ];

                    var salesFormId = 2000;
                    var keywordsParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(salesFormId),
                        req.st.db.escape(JSON.stringify(keywordList)),
                        req.st.db.escape(req.body.groupId)
                    ];

                    var procQuery = 'CALL he_save_supportRequestWithTask_new( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, results) {
                        console.log(err);
                        if (!err && results && results[0] && results[0][0]) {
                            // senderGroupId = results[0][0].senderId;

                            notifyMessages.getMessagesNeedToNotify();

                            // if (results && results[2] && results[2][0] && results[2][0].receiverId) {
                            //     if (notificationTemplaterRes.parsedTpl) {
                            //         notification.publish(
                            //             results[2][0].receiverId,
                            //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                            //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                            //             results[0][0].senderId,
                            //             notificationTemplaterRes.parsedTpl,
                            //             41,
                            //             0, (results[2][0].iphoneId) ? (results[2][0].iphoneId) : '',
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
                            //                 parentId: results[2][0].parentId,
                            //                 groupId: results[2][0].groupId,
                            //                 requirement: results[2][0].requirement,
                            //                 feedback: results[2][0].feedback,
                            //                 rating: results[2][0].rating,
                            //                 updatedDate: results[2][0].updatedDate,
                            //                 status: results[2][0].status
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

                            response.status = true;
                            response.message = "Support query submitted successfully";
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
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while saving support query";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                });
            }
        }
        else {

            req.st.validateToken(req.query.token, function (err, tokenResult) {
                if ((!err) && tokenResult) {
                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                        var keywordList = req.body.keywordList;
                        if (typeof (keywordList) == "string") {
                            keywordList = JSON.parse(keywordList);
                        }
                        if (!keywordList) {
                            keywordList = [];
                        }

                        var attachmentList = req.body.attachmentList;
                        if (typeof (attachmentList) == "string") {
                            attachmentList = JSON.parse(attachmentList);
                        }
                        if (!attachmentList) {
                            attachmentList = [];
                        }

                        if (!req.body.groupId) {
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
                            req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                            var taskDetails;
                            return new Promise(function (resolve, reject) {
                                if (req.body.taskIdList && req.body.taskIdList.length > 0) {

                                    var taskDetailsInput = [
                                        req.st.db.escape(req.query.token),
                                        req.st.db.escape(req.body.groupId),
                                        req.st.db.escape(JSON.stringify(req.body.taskIdList || [])),
                                        req.st.db.escape(DBSecretKey)
                                    ];
                                    var taskDetailsInput = 'CALL wm_get_latest_taskDetails( ' + taskDetailsInput.join(',') + ')';
                                    req.db.query(taskDetailsInput, function (err, taskresults) {
                                        console.log(err);
                                        if (!err && taskresults && taskresults[0] && taskresults[0][0]) {

                                            taskresults[0][0].memberList = taskresults[0][0] && JSON.parse(taskresults[0][0].memberList) ? JSON.parse(taskresults[0][0].memberList) : [];
                                            taskresults[0][0].expenseList = taskresults[0][0] && JSON.parse(taskresults[0][0].expenseList) ? JSON.parse(taskresults[0][0].expenseList) : [];

                                            for (var j = 0; j < taskresults[0][0].expenseList.length; j++) {
                                                taskresults[0][0].expenseList[j].attachmentList = taskresults[0][0].expenseList[j] && JSON.parse(taskresults[0][0].expenseList[j].attachmentList) ? JSON.parse(taskresults[0][0].expenseList[j].attachmentList) : [];
                                            }

                                            taskresults[0][0].attachmentList = taskresults[0][0] && JSON.parse(taskresults[0][0].attachmentList) ? JSON.parse(taskresults[0][0].attachmentList) : [];

                                            taskDetails = taskresults[0][0];
                                            console.log("promise in");
                                            resolve(taskDetails);
                                        }
                                        else {
                                            resolve('');
                                        }
                                    });
                                }
                                else {
                                    console.log("promise out");
                                    resolve('');
                                }
                            }).then(function (resp) {
                                var procParams = [
                                    req.st.db.escape(req.query.token),
                                    req.st.db.escape(req.body.parentId || 0),
                                    req.st.db.escape(req.body.categoryId || 0),
                                    req.st.db.escape(req.body.description),
                                    req.st.db.escape(req.body.priority),
                                    req.st.db.escape(req.body.senderNotes || ""),
                                    req.st.db.escape(req.body.status || 3),
                                    req.st.db.escape(req.body.receiverNotes || ""),
                                    req.st.db.escape(req.body.infoToSender || ""),
                                    req.st.db.escape(JSON.stringify(attachmentList || [])),
                                    req.st.db.escape(req.body.changeLog || ""),
                                    req.st.db.escape(req.body.groupId),
                                    req.st.db.escape(req.body.learnMessageId || 0),
                                    req.st.db.escape(req.body.accessUserType || 0),
                                    req.st.db.escape(req.body.categoryTitle || ""),
                                    req.st.db.escape(req.body.isInfoToSenderChanged || 0),
                                    req.st.db.escape(DBSecretKey),
                                    req.st.db.escape(req.body.timestamp),
                                    req.st.db.escape(req.body.createdTimeStamp),
                                    req.st.db.escape(JSON.stringify(req.body.contactDetails || {})),
                                    req.st.db.escape(JSON.stringify(req.body.taskIdList || [])),
                                    req.st.db.escape(JSON.stringify(taskDetails || null)),
                                    req.st.db.escape(req.body.isReportingManager || 0),
                                    req.st.db.escape(req.body.whatmateId || ""),
                                    req.st.db.escape(req.body.nkFlag || 0)
                                ];

                                var salesFormId = 2000;
                                var keywordsParams = [
                                    req.st.db.escape(req.query.token),
                                    req.st.db.escape(salesFormId),
                                    req.st.db.escape(JSON.stringify(keywordList)),
                                    req.st.db.escape(req.body.groupId)
                                ];

                                var procQuery = 'CALL he_save_supportRequestWithTask_new( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                                console.log(procQuery);
                                req.db.query(procQuery, function (err, results) {
                                    console.log(err);
                                    if (!err && results && results[0] && results[0][0]) {
                                        senderGroupId = results[0][0].senderId;

                                        notifyMessages.getMessagesNeedToNotify();


                                        if (req.body.status == 8) {
                                            console.log("If resolved then send notification for nearkart");
                                            var url = "http://23.236.49.140:3001/api/nk/ServiceEnquiryNotification";
                                            var dbResponse = {
                                                whatmateId: results[0][0].whatmateId,
                                                parentId: results[0][0].parentId,
                                                groupId: req.body.groupId,
                                                feedback: "",
                                                rating: 0,
                                                notificationType: 3,
                                                feedbackStatus: 0
                                            };

                                            request({
                                                url: url,
                                                method: "POST",
                                                json: true,   // <--Very important!!!
                                                body: dbResponse
                                            }, function (error, response, body) {
                                                console.log("error", error);
                                                if (!error && body) {
                                                    console.log('Notifcation saved and sent successfull for nearkart user');
                                                }
                                                else {
                                                    console.log('Error occured in Nearkart notification api');
                                                }
                                            });
                                        }


                                        if (results && results[2] && results[2][0] && results[2][0].receiverId) {
                                            if (notificationTemplaterRes.parsedTpl) {
                                                notification.publish(
                                                    results[2][0].receiverId,
                                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                    (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                                    results[0][0].senderId,
                                                    notificationTemplaterRes.parsedTpl,
                                                    41,
                                                    0, (results[2][0].iphoneId) ? (results[2][0].iphoneId) : '',
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
                                                        parentId: results[2][0].parentId,
                                                        groupId: results[2][0].groupId,
                                                        requirement: results[2][0].requirement,
                                                        feedback: results[2][0].feedback,
                                                        rating: results[2][0].rating,
                                                        updatedDate: results[2][0].updatedDate,
                                                        status: results[2][0].status
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
                                        response.message = "Support query submitted successfully";
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
                                        response.message = "Error while saving support query";
                                        response.error = null;
                                        response.data = null;
                                        res.status(500).json(response);
                                    }
                                });
                            });
                        }
                    });
                }
                else {
                    res.status(401).json(response);
                }
            });
        }
    }
};


salesCtrl.expensetrackerAll = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);

                    if (!req.body.groupId) {
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

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.taskType || 0),
                            req.st.db.escape(req.body.status || 0),
                            req.st.db.escape(req.body.expenseFromDate || null),
                            req.st.db.escape(req.body.expenseToDate || null),
                            req.st.db.escape(req.body.startPage || 0),
                            req.st.db.escape(req.body.limit || 0),
                            req.st.db.escape(DBSecretKey)
                        ];

                        var procQuery = 'CALL wm_get_expenseTrackerAll( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result && result[0] && result[0][0]) {

                                response.status = true;
                                response.message = "Expense list loaded successfully";
                                response.error = null;

                                for (var i = 0; i < result[0].length; i++) {
                                    result[0][i].attachmentList = result[0] && result[0][i] && JSON.parse(result[0][i].attachmentList) ? JSON.parse(result[0][i].attachmentList) : [];
                                }

                                response.data = {
                                    expenseList: result[0] ? result[0] : [],
                                    count: result[1][0] && result[1][0].count ? result[1][0].count : 0
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "No data found";
                                response.data = {
                                    expenseList: [],
                                    count: 0
                                };
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while getting expense list";
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

salesCtrl.saveSalesTaxTemplate = function (req, res, next) {

    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                //     console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }

                if (!req.body.templateName) {
                    error.templateName = 'Invalid templateName';
                    validationFlag *= false;
                }

                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.body.templateId || 0),
                        req.st.db.escape(req.body.templateName),
                        req.st.db.escape(JSON.stringify(req.body.taxCodes || [])),
                        req.st.db.escape(req.body.status || 0)
                    ];

                    var procQuery = 'CALL wm_save_salesTaxTemplate( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0] && result[0][0]) {

                            response.status = true;
                            response.message = "Tax templates saved successfully";
                            response.error = null;

                            for (var i = 0; i < result[0].length; i++) {
                                result[0][i].taxCodes = result[0] && result[0][i] && JSON.parse(result[0][i].taxCodes) ? JSON.parse(result[0][i].taxCodes) : [];
                            }

                            response.data = {
                                taxTemplateList: result[0] ? result[0] : []
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = {
                                expenseList: [],
                                count: 0
                            };
                            response.error = null;
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while saving tax template";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }

};

salesCtrl.getSalesTaxTemplate = function (req, res, next) {

    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                //     console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }

                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId)
                    ];

                    var procQuery = 'CALL wm_sales_get_taxTemplates( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0] || result[1]) {

                            response.status = true;
                            response.message = "Tax templates loaded successfully";
                            response.error = null;

                            if (result[1].length) {
                                for (var i = 0; i < result[1].length; i++) {
                                    result[1][i].taxCodes = result[0] && result[1][i] && JSON.parse(result[1][i].taxCodes) ? JSON.parse(result[1][i].taxCodes) : [];
                                }
                            }

                            response.data = {
                                masterTaxCodes: result[0] ? result[0] : [],
                                taxTemplateList: result[1] ? result[1] : []
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = {
                                taxTemplateList: [],
                                masterTaxCodes: []
                            };
                            response.error = null;
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while loading tax template";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


salesCtrl.updateExpenseSS = function (req, res, next) {

    var error = {};
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
                    console.log(req.body);

                    if (!req.body.groupId) {
                        error.groupId = 'Invalid groupId';
                        validationFlag *= false;
                    }

                    if (!req.body.expenseIds.length) {
                        error.expenseIds = 'Invalid expenseIds';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.status || 0),
                            req.st.db.escape(JSON.stringify(req.body.expenseIds || []))
                        ];

                        var procQuery = 'CALL wm_update_expenseAllTypes( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, result) {
                            if (!err && result && result[0] && result[0][0]) {

                                response.status = true;
                                response.message = "Expense updated successfully";
                                response.error = null;

                                response.data = {
                                    expenseStatus: result[0] ? result[0] : []
                                };

                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }

                            else if (!err) {
                                response.status = true;
                                response.message = "No data found";
                                response.data = {
                                    expenseStatus: []
                                };
                                response.error = null;
                                var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                zlib.gzip(buf, function (_, result) {
                                    response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                    res.status(200).json(response);
                                });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while updating expense";
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

salesCtrl.salesTargetVsPerformanceSummary = function (req, res, next) {
    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                //     console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }

                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.body.targetMonthFrom),
                        req.st.db.escape(req.body.targetMonthTo),
                        req.st.db.escape(req.body.type || 3),
                        req.st.db.escape(req.body.exportAll || 0),
                        req.st.db.escape(JSON.stringify(req.body.selectedUsers || [])),
                        req.st.db.escape(req.query.startPage || 0),
                        req.st.db.escape(req.query.limit || 0),
                        req.st.db.escape(DBSecretKey)
                    ];

                    var procQuery = 'CALL wm_sales_targetvsPerformanceSummary( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "Sales summary loaded successfully";
                            response.error = null;

                            for (var i = 0; i < result[0].length; i++) {
                                result[0][i].targetList = result[0][i] && JSON.parse(result[0][i].targetList) ? JSON.parse(result[0][i].targetList) : [];
                            }

                            response.data = {
                                salesSummary: result[0] ? result[0] : [],
                                count: result[1] && result[1][0] && result[1][0].count ? result[1][0].count : 0
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = {
                                salesSummary: [],
                                count: 0
                            };
                            response.error = null;
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while loading sales summary";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

salesCtrl.salesSummaryDetailedView = function (req, res, next) {
    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                //     console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }

                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.body.targetMonthFrom),
                        req.st.db.escape(req.body.targetMonthTo),
                        req.st.db.escape(req.body.type || 3),
                        req.st.db.escape(req.body.exportAll || 0),
                        req.st.db.escape(JSON.stringify(req.body.selectedUsers || [])),
                        req.st.db.escape(req.query.startPage || 0),
                        req.st.db.escape(req.query.limit || 0),
                        req.st.db.escape(DBSecretKey)
                    ];

                    var procQuery = 'CALL wm_sales_targetvsPerformanceDetailedView( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "Sales detailed view loaded successfully";
                            response.error = null;

                            for (var i = 0; i < result[0].length; i++) {
                                result[0][i].targetList = result[0][i] && JSON.parse(result[0][i].targetList) ? JSON.parse(result[0][i].targetList) : [];
                            }

                            response.data = {
                                salesDetailedView: result[0] ? result[0] : [],
                                count: result[1] && result[1][0] && result[1][0].count ? result[1][0].count : 0
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = {
                                salesDetailedView: [],
                                count: 0
                            };
                            response.error = null;
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while loading sales detailed view";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

salesCtrl.monthlySalesView = function (req, res, next) {
    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                //     console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }

                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.body.targetMonthFrom),
                        req.st.db.escape(req.body.targetMonthTo),
                        req.st.db.escape(req.body.type || 3),
                        req.st.db.escape(req.body.exportAll || 0),
                        req.st.db.escape(JSON.stringify(req.body.selectedUsers || [])),
                        req.st.db.escape(req.query.startPage || 0),
                        req.st.db.escape(req.query.limit || 0),
                        req.st.db.escape(DBSecretKey)
                    ];

                    var procQuery = 'CALL wm_sales_monthlyWiseSalesView( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "Sales members monthly loaded successfully";
                            response.error = null;

                            response.data = {
                                salesMemberList: result[0] ? result[0] : [],
                                count: result[1] && result[1][0] && result[1][0].count ? result[1][0].count : 0
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = {
                                salesMemberList: [],
                                count: 0
                            };
                            response.error = null;
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while loading sales data";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

salesCtrl.updatedUsersMonthlySalesTarget = function (req, res, next) {
    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }

                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(JSON.stringify(req.body.salesMembers || [])),
                        req.st.db.escape(DBSecretKey)
                    ];

                    var procQuery = 'CALL wm_update_salesTargetForSaleMembers( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "Sales target updated successfully";
                            response.error = null;

                            response.data = {
                                salesMemberList: result[1] ? result[1] : [],
                                count: result[2] && result[2][0] && result[2][0].count ? result[2][0].count : 0
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = null;
                            response.error = {
                                salesMemberList: [],
                                count: 0
                            };
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while updating sales data";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


salesCtrl.saveSalesConfiguration = function (req, res, next) {
    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }

                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.body.enableValueField1 || 0),
                        req.st.db.escape(req.body.enableValueField2 || 0),
                        req.st.db.escape(req.body.valueFieldTitle1 || ""),
                        req.st.db.escape(req.body.valueFieldTitle2 || ""),
                        req.st.db.escape(req.body.isCompanyMandatoryInSales || 0),
                        req.st.db.escape(req.body.isCompanyMandatoryInSupport || 0),
                        req.st.db.escape(req.body.isTaskSchedules || 0),
                        req.st.db.escape(req.body.isExpenseClaim || 0),
                        req.st.db.escape(req.body.showForcastSection || 0),
                        req.st.db.escape(req.body.targetPeriod || 0),
                        req.st.db.escape(DBSecretKey),
                        req.st.db.escape(req.body.enableConsiderThisForForecast || 0),
                        req.st.db.escape(req.body.isTargetDate || 0)
                    ];

                    var procQuery = 'CALL wm_save_sales_configurationNew( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "Sales configuration saved successfully";
                            response.error = null;

                            response.data = {
                                configurationDetails: result[0][0] ? result[0][0] : null
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = null;
                            response.error = {
                                configurationDetails: null
                            };
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while saving sales configuration";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

salesCtrl.savesalesFinanicalYears = function (req, res, next) {
    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }

                if (!req.body.startYear || req.body.startYear == null) {
                    error.startYear = 'Invalid start year';
                    validationFlag *= false;
                }

                if (!req.body.endYear || req.body.endYear == null) {
                    error.endYear = 'Invalid end year';
                    validationFlag *= false;
                }

                if (req.body.startDay >= 31 || req.body.endDay >= 31) {
                    error.startDay = 'Out of range value for start or end day';
                    validationFlag *= false;
                }

                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.body.startYear || null),
                        req.st.db.escape(req.body.endYear || null),
                        req.st.db.escape(req.body.startDay || 1),
                        req.st.db.escape(req.body.endDay || 28),
                        req.st.db.escape(DBSecretKey),
                        req.st.db.escape(req.body.status || 0),
                        req.st.db.escape(req.body.fyId || 0)
                    ];

                    var procQuery = 'CALL wm_save_salesCompanyFinanicalYear( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "Sales finanical year saved successfully";
                            response.error = null;

                            response.data = {
                                salesYearDetails: result[0] ? result[0] : [],
                                startDay: result[0][0] && result[0][0].startDay ? result[0][0].startDay : 0,
                                endDay: result[0][0] && result[0][0].endDay ? result[0][0].endDay : 0
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = null;
                            response.error = {
                                salesYearDetails: null,
                                startDay: 0,
                                endDay: 0
                            };
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while saving sales finanical year data";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


salesCtrl.getSalesCOnfigurationDetails = function (req, res, next) {
    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }

                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(DBSecretKey)
                    ];

                    var procQuery = 'CALL wm_get_salesConfigurationDetails( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "Sales data loaded successfully";
                            response.error = null;

                            response.data = {
                                salesYearDetails: result[0] ? result[0] : [],
                                startDay: result[0][0] && result[0][0].startDay ? result[0][0].startDay : 0,
                                endDay: result[0][0] && result[0][0].endDay ? result[0][0].endDay : 0,
                                configurationDetails: result[1] && result[1][0] ? result[1][0] : null

                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = null;
                            response.error = {
                                salesYearDetails: [],
                                startDay: 0,
                                endDay: 0,
                                configurationDetails: null
                            };
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Error while loading sales data";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


salesCtrl.salesSupportMeetingDistanceReport = function (req, res, next) {
    var error = {};
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
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                console.log(req.body);

                if (!req.query.heMasterId) {
                    error.heMasterId = 'Invalid heMasterId';
                    validationFlag *= false;
                }


                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.heMasterId),
                        req.st.db.escape(req.body.fromDate || null),
                        req.st.db.escape(req.body.toDate || null),
                        req.st.db.escape(req.body.type || 0),
                        req.st.db.escape(req.body.exportAll || 0),
                        req.st.db.escape(JSON.stringify(req.body.selectedUsers || [])),
                        req.st.db.escape(req.body.startPage || 0),
                        req.st.db.escape(req.body.limit || 0),
                        req.st.db.escape(DBSecretKey),
                        req.st.db.escape(req.body.taskType || 1)  // 1- sales,2-support
                    ];

                    var procQuery = 'CALL wm_get_salesSupportDistanceReport( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);
                        if (!err && result && result[0]) {

                            response.status = true;
                            response.message = "Data loaded successfully";
                            response.error = null;

                            response.data = {
                                meetingDistanceReport: result[0] ? result[0] : [],
                                count: result[1][0] && result[1][0].count ? result[1][0].count : 0
                            };

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = null;
                            response.error = {
                                meetingDistanceReport: [],
                                count: 0
                            };
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Something went wrong!";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

salesCtrl.updateEventsReminder = function (req, res, next) {
    var error = {};
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

    if (!req.body.taskId) {
        error.taskId = 'Invalid taskId';
        validationFlag *= false;
    }

    // if (!req.body.eventList.length) {
    //     error.eventList = 'Invalid eventList';
    //     validationFlag *= false;
    // }


    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                console.log(req.body);

                // if (!req.query.heMasterId) {
                //     error.heMasterId = 'Invalid heMasterId';
                //     validationFlag *= false;
                // }


                if (!validationFlag) {
                    response.error = error;
                    response.message = 'Please check the errors';
                    res.status(400).json(response);
                    console.log(response);
                }
                else {

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.taskId),
                        req.st.db.escape(JSON.stringify(req.body.eventList || [])),
                        req.st.db.escape(req.body.isAndroid || 0)
                    ];

                    var procQuery = 'CALL wm_update_reminderNotifiedSS( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, result) {
                        console.log(err);
                        if (!err && result) {

                            if (result && result[0] && result[0][0]) {
                                var messagePayload = {
                                    message: "",
                                    alarmType: 4,
                                    type: 302,
                                    data: {
                                        eventList: result[0][0] && result[0][0].eventList && JSON.parse(result[0][0].eventList) ? JSON.parse(result[0][0].eventList) : []
                                    }
                                }

                                if (result && result[0] && result[0][0] && result[0][0].APNS_Id) {
                                    _Notification_aws.publish_IOS(result[0][0].APNS_Id, messagePayload, 0);
                                }

                                if (result && result[0] && result[0][0] && result[0][0].GCM_Id) {
                                    _Notification_aws.publish_Android(result[0][0].GCM_Id, messagePayload);
                                }
                            }



                            response.status = true;
                            response.message = "event updated successfully";
                            response.error = null;
                            response.data = null;

                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }

                        else if (!err) {
                            response.status = true;
                            response.message = "No data found";
                            response.data = null;
                            response.error = null;
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Something went wrong!";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

//for Hirecraft
salesCtrl.salesEnqueryIntegration = function (req, res, next) {
    var error = {};
    var response = {
        status: false,
        message: "Something went wrong",
        data: null,
        error: null
    };

    var validationFlag = true;

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {

        // req.st.validateToken(req.query.token, function (err, tokenResult) {
        //     if ((!err) && tokenResult) {
        // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
        // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
        //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
        console.log(req.body);

        var validationFlag = true;

        if (!req.body.defaultWMId) {
            error.defaultWMId = 'Invalid defaultWMId';
            validationFlag *= false;
        }

        if (!req.body.heMasterId) {
            error.heMasterId = 'Invalid heMasterId';
            validationFlag *= false;
        }

        if (!validationFlag) {
            response.error = error;
            response.message = 'Please check the errors';
            res.status(400).json(response);
            console.log(response);
        }
        else {

            // raise sales request here
            req.body.whatmateId = req.body.defaultWMId;
            req.body.nkFlag = req.body.isTallint || 1;
            req.body.contactDetails = {
                firstName: req.body.name || "",
                emailId: req.body.emailId || "",
                mobileNumber: req.body.mobileNumber || "",
                companyName: req.body.companyName || ""
            };

            var keywordList = req.body.keywordList;
            if (typeof (keywordList) == "string") {
                keywordList = JSON.parse(keywordList);
            }
            if (!keywordList) {
                keywordList = [];
            }

            var attachmentList = req.body.attachmentList;
            if (typeof (attachmentList) == "string") {
                attachmentList = JSON.parse(attachmentList);
            }
            if (!attachmentList) {
                attachmentList = [];
            }

            var items = req.body.items;
            if (typeof (items) == "string") {
                items = JSON.parse(items);
            }
            if (!items) {
                items = [];
            }

            if (items.length) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i] && !items[i].quantity) {
                        items[i]['quantity'] = 1;
                    }
                }
            }
            var taskDetails;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.parentId || 0),
                req.st.db.escape(req.body.categoryId || 0),
                req.st.db.escape(req.body.requirement || ""),
                req.st.db.escape(req.body.senderNotes || req.body.message || ""),
                req.st.db.escape(req.body.stage || 0),
                req.st.db.escape(req.body.status || 0),
                req.st.db.escape(req.body.reason || ""),
                req.st.db.escape(req.body.receiverNotes || ""),
                req.st.db.escape(req.body.currencyId || 0),
                req.st.db.escape(req.body.amount || 0),
                req.st.db.escape(req.body.probability || 0),
                req.st.db.escape(req.body.infoToSender || ""),
                req.st.db.escape(JSON.stringify(attachmentList || [])),
                req.st.db.escape(req.body.changeLog || ""),
                req.st.db.escape(req.body.groupId),
                req.st.db.escape(req.body.learnMessageId || 0),
                req.st.db.escape(req.body.accessUserType || 0),
                req.st.db.escape(req.body.categoryTitle || ""),
                req.st.db.escape(req.body.stageTitle || ""),
                req.st.db.escape(req.body.statusTitle || ""),
                req.st.db.escape(req.body.currencyTitle || ""),
                req.st.db.escape(req.body.isInfoToSenderChanged || 0),
                req.st.db.escape(req.body.discount || 0),
                req.st.db.escape(JSON.stringify(items || [])),
                req.st.db.escape(req.body.itemCurrencyId || 0),
                req.st.db.escape(req.body.itemCurrencySymbol || ""),
                req.st.db.escape(req.body.targetDate || null),
                req.st.db.escape(DBSecretKey),
                req.st.db.escape(req.body.timestamp || ""),
                req.st.db.escape(req.body.createdTimeStamp || null),
                req.st.db.escape(JSON.stringify(req.body.contactDetails || {})),
                req.st.db.escape(JSON.stringify(req.body.taskIdList || [])),
                req.st.db.escape(req.body.forcastValue || 0),
                req.st.db.escape(JSON.stringify(taskDetails || null)),
                req.st.db.escape(req.body.isReportingManager || 0),
                req.st.db.escape(req.body.isTargetDate || 0),
                req.st.db.escape(req.body.isConsider || 0),
                req.st.db.escape(req.body.amount2 || 0),
                req.st.db.escape(req.body.currencyId2 || 0),
                req.st.db.escape(req.body.currencyTitle2 || ""),
                req.st.db.escape(req.body.whatmateId || ""),
                req.st.db.escape(req.body.nkFlag || 0)
            ];

            var salesFormId = 2000;
            var keywordsParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(salesFormId),
                req.st.db.escape(JSON.stringify(keywordList)),
                req.st.db.escape(req.body.groupId)
            ];

            var procQuery = 'CALL he_save_salesRequest_WithTask_New_hirecraftIntegration( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
            console.log(procQuery);
            req.db.query(procQuery, function (err, results) {
                console.log(err);
                if (!err && results && results[0] && results[0][0]) {
                    console.log("Sales request raised");
                    notifyMessages.getMessagesNeedToNotify();
                }
            });
            // sales query end

            var procParams = [
                req.st.db.escape(req.body.defaultWMId),
                req.st.db.escape(req.body.name || ''),
                req.st.db.escape(req.body.emailId || ''),
                req.st.db.escape(req.body.mobileNumber || ""),
                req.st.db.escape(req.body.message || ""),
                req.st.db.escape(req.body.heMasterId || 0),
                req.st.db.escape(DBSecretKey)
                // req.st.db.escape(req.body.subject || ""),
                // req.st.db.escape(req.body.mailBody || "")
            ];

            var procQuery = 'CALL wm_save_HirecraftSalesEnquiry( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, result) {
                if (!err) {
                    var mailSent = 0;
                    var obj = {};
                    return new Promise(function (resolve, reject) {
                        try {
                            if (req.body.emailId && req.body.emailId != "" && req.body.mailBody && req.body.mailBody != "") {
                                if (result && result.length && result[result.length - 2] && result[result.length - 2][0] && result[result.length - 2][0].toEmailId) {
                                    var toEmailId = [];
                                    for (var i = 0; i < result[result.length - 2].length; i++) {
                                        toEmailId.push(result[result.length - 2][i].toEmailId);
                                    }

                                    var mailOptions = {
                                        from: req.body.emailId,
                                        to: toEmailId,
                                        subject: req.body.subject,
                                        html: req.body.mailBody
                                        // cc: cc,
                                        // bcc: bcc
                                    };

                                    var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                    var email = new sendgrid.Email();
                                    email.from = mailOptions.from;
                                    email.to = mailOptions.to;
                                    email.subject = mailOptions.subject;
                                    // email.cc = mailOptions.cc;
                                    // email.bcc = mailOptions.bcc;
                                    email.html = mailOptions.html;

                                    sendgrid.send(email, function (err, result) {
                                        console.log(err);
                                        if (!err) {
                                            mailSent = 1;
                                            console.log('Mail sent success');
                                            obj.message = 'Mail sent success';
                                            obj.mailSent = 1;
                                            resolve(obj);
                                        } else {
                                            console.log('Failed to send mail');
                                            obj.message = 'Failed to send mail';
                                            obj.mailSent = 0;
                                            resolve(obj);
                                        }
                                    })
                                } else {
                                    console.log("Receipient emailId not present");
                                    obj.message = 'Receipient emailId not present';
                                    obj.mailSent = 0;
                                    resolve(obj);
                                }
                            } else {
                                console.log('Mailbody empty');
                                obj.message = 'Mailbody empty';
                                obj.mailSent = 0;
                                resolve(obj);
                            }
                        } catch (ex) {
                            console.log(ex);
                            obj.message = 'Something went wrong';
                            obj.mailSent = 0;
                            resolve(obj);
                        }
                    }).then(function (resp) {
                        if (!err && result && result[0] && result[0][0]) {

                            notifyMessages.getMessagesNeedToNotify();

                            response.status = true;
                            response.message = "Sales query notified success";
                            response.error = null;
                            response.data = obj
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else if (!err) {
                            response.status = true;
                            response.message = "Failed to nofity query";
                            response.data = null;
                            response.error = null;
                            // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            // zlib.gzip(buf, function (_, result) {
                            //     response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                            // });
                        }
                        else {
                            response.status = false;
                            response.message = "Something went wrong";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    })
                } else {
                    response.status = false;
                    response.message = "Something went wrong";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        // });
        //     }
        //     else {
        //         res.status(401).json(response);
        //     }
        // });
    }
};


module.exports = salesCtrl;
