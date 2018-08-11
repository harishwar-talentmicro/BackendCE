/**
 * Created by Jana1 on 22-03-2017.
 */

var notification = null;
var moment = require('moment');

var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var sendMessageCtrl = {};
var error = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

// thread
const threads = require('threads');
const config = threads.config;
const spawn = threads.spawn;

// Set base paths to thread scripts
config.set({
    basepath: {
        node: '../routes',
        web: 'http://myserver.local/thread-scripts'
    }
});

const thread = spawn('worker.js');

var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();

var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;

sendMessageCtrl.sendMessage = function (req, res, next) {
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
                    var attachmentList = req.body.attachmentList;
                    if (typeof (attachmentList) == "string") {
                        attachmentList = JSON.parse(attachmentList);
                    }
                    if (!attachmentList) {
                        attachmentList = [];
                    }
                    // embededImages
                    var embededImages = req.body.embededImages;
                    if (typeof (embededImages) == "string") {
                        embededImages = JSON.parse(embededImages);
                    }
                    if (!embededImages) {
                        embededImages = [];
                    }

                    var userList = req.body.userList;
                    if (typeof (userList) == "string") {
                        userList = JSON.parse(userList);
                    }
                    if (!userList) {
                        userList = [];
                    }

                    var branchList = req.body.branchList;
                    if (typeof (branchList) == "string") {
                        branchList = JSON.parse(branchList);
                    }
                    if (!branchList) {
                        branchList = [];
                    }

                    var departmentList = req.body.departmentList;
                    if (typeof (departmentList) == "string") {
                        departmentList = JSON.parse(departmentList);
                    }
                    if (!departmentList) {
                        departmentList = [];
                    }

                    var gradeList = req.body.gradeList;
                    if (typeof (gradeList) == "string") {
                        gradeList = JSON.parse(gradeList);
                    }
                    if (!gradeList) {
                        gradeList = [];
                    }

                    var groupList = req.body.groupList;
                    if (typeof (groupList) == "string") {
                        groupList = JSON.parse(groupList);
                    }
                    if (!groupList) {
                        groupList = [];
                    }
                    var keywordList = req.body.keywordList;
                    if (typeof (keywordList) == "string") {
                        keywordList = JSON.parse(keywordList);
                    }
                    if (!keywordList) {
                        keywordList = [];
                    }

                    var senderGroupId;
                    var isweb;

                    if (!validationFlag) {
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
                        req.body.recordedVoiceUrl = req.body.recordedVoiceUrl ? req.body.recordedVoiceUrl : '';
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                        req.body.groupType = req.body.groupType ? req.body.groupType : 0;
                        req.body.memberCount = req.body.memberCount ? req.body.memberCount : 0;
                        req.body.title = req.body.title != undefined ? req.body.title : "";
                        req.body.announcementType = req.body.announcementType != undefined ? req.body.announcementType : 1;
                        req.body.lockType = req.body.lockType != undefined ? req.body.lockType : 1;
                        req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                        req.body.startDate = req.body.startDate != undefined ? req.body.startDate : null;
                        req.body.endDate = req.body.endDate != undefined ? req.body.endDate : null;
                        req.body.isDraft = req.body.isDraft != undefined ? req.body.isDraft : 0;
                        req.body.status = req.body.status != undefined ? req.body.status : 0;
                        req.body.approverNotes = req.body.approverNotes != undefined ? req.body.approverNotes : '';
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.message),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(JSON.stringify(attachmentList)),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(JSON.stringify(userList)),
                            req.st.db.escape(JSON.stringify(branchList)),
                            req.st.db.escape(JSON.stringify(departmentList)),
                            req.st.db.escape(JSON.stringify(gradeList)),
                            req.st.db.escape(JSON.stringify(groupList)),
                            req.st.db.escape(req.body.alarmType),
                            req.st.db.escape(JSON.stringify(embededImages)),
                            req.st.db.escape(req.body.groupType),
                            req.st.db.escape(req.body.memberCount),
                            req.st.db.escape(req.body.title),
                            req.st.db.escape(req.body.announcementType),
                            req.st.db.escape(req.body.lockType),
                            req.st.db.escape(req.body.startDate),
                            req.st.db.escape(req.body.endDate),
                            req.st.db.escape(req.body.isDraft),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.approverNotes),
                            req.st.db.escape(req.body.timestamp),
                            req.st.db.escape(req.body.createdTimeStamp) 

                        ];

                        var announcementFormId = 1033;
                        var keywordsParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(announcementFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_save_sendMessage( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(results);
                            if (!err && results && results[0]) {
                                senderGroupId = results[0][0].senderId;
                                response.status = true;
                                response.message = "Message sent successfully";
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
                                        transId: results[0][0].transId,
                                        formId: results[0][0].formId,
                                        currentStatus: results[0][0].currentStatus,
                                        currentTransId: results[0][0].currentTransId,
                                        localMessageId: req.body.localMessageId,
                                        parentId: results[0][0].parentId,
                                        accessUserType: results[0][0].accessUserType,
                                        heUserId: results[0][0].heUserId,
                                        formData: JSON.parse(results[0][0].formDataJSON)
                                    }
                                };
                                // res.status(200).json(response);
                                if (req.query.isweb == 0) {
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);

                                    });
                                }
                                else {
                                    res.status(200).json(response);
                                }
                                notifyMessages.getMessagesNeedToNotify();

                                // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                                //     senderName : results[0][0].message
                                // });
                                //
                                // for (var i = 0; i < results[1].length; i++ ) {
                                //     if (notificationTemplaterRes.parsedTpl) {
                                //         console.log(results[1][0].senderId , "results[1][0].senderIdresults[1][0].senderIdresults[1][0].senderId");
                                //         notification.publish(
                                //             results[1][i].receiverId,
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             results[1][0].senderId,
                                //             notificationTemplaterRes.parsedTpl,
                                //             31,
                                //             0,
                                //             (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
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
                                //                 },
                                //                 contactList : null
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
                            }
                            else {
                                response.status = false;
                                response.message = "Error while sending message";
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

sendMessageCtrl.getUserConfig = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var isweb;
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
                req.query.isweb = req.query.isweb ? req.query.isweb : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_Get_UserMsgMapDetails( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, configResult) {
                    if (!err && configResult) {
                        response.status = true;
                        response.message = "Configurations loaded successfully";
                        response.error = null;
                        response.data = {
                            branchList: configResult[0] ? configResult[0] : [],
                            departmentList: configResult[1] ? configResult[1] : [],
                            gradeList: configResult[2] ? configResult[2] : [],
                            groupList: configResult[3] ? configResult[3] : []
                        };
                        if (req.query.isweb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);

                            });
                        }
                        else {
                            res.status(200).json(response);

                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting configuration";
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

sendMessageCtrl.getMemberCount = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var isweb;
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

                    console.log("req.body.data", req.body.data);
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
                        var branchList = req.body.branchList != undefined ? req.body.branchList : [];
                        var departmentList = req.body.departmentList != undefined ? req.body.departmentList : [];
                        var gradeList = req.body.gradeList != undefined ? req.body.gradeList : [];
                        var groupList = req.body.groupList != undefined ? req.body.groupList : [];


                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(JSON.stringify(branchList)),
                            req.st.db.escape(JSON.stringify(departmentList)),
                            req.st.db.escape(JSON.stringify(gradeList)),
                            req.st.db.escape(JSON.stringify(groupList))
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL he_Get_sendMsgUserCount( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, configResult) {
                            if (!err && configResult) {
                                response.status = true;
                                response.message = "Member count loaded successfully .";
                                response.error = null;
                                response.data = {
                                    memberCount: configResult[0][0].count
                                };
                                res.status(200).json(response);

                                // var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                // zlib.gzip(buf, function (_, result) {
                                //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                                //     res.status(200).json(response);
                                // });
                            }
                            else {
                                response.status = false;
                                response.message = "Error while getting member count";
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

sendMessageCtrl.getMasterData = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;
    var isweb;
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
                req.query.HEMasterId = req.query.HEMasterId ? req.query.HEMasterId : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId)
                ];

                var procQuery = 'CALL He_get_MsgMasterData( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, masterResult) {
                    if (!err && masterResult) {
                        response.status = true;
                        response.message = "Master data loaded successfully .";
                        response.error = null;
                        response.data = {
                            branches: masterResult[0] ? (masterResult[0]) : [],
                            departments: masterResult[1] ? masterResult[1] : [],
                            grades: masterResult[2] ? masterResult[2] : [],
                            RMGroups: masterResult[3] ? masterResult[3] : []
                        };
                        // res.status(200).json(response);
                        // if (isweb==0) {
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                        // }
                        //  else {
                        //      res.status(200).json(response);
                        //  }

                    }
                    else if (!err) {
                        response.status = false;
                        response.message = "master data is null";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting master data";
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

sendMessageCtrl.searchusersData = function (req, res, next) {
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
    if (!req.query.keywords) {
        error.keywords = 'Invalid keyword';
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
                req.query.keywords = req.query.keywords ? req.query.keywords : '';


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(req.query.keywords)
                ];

                var procQuery = 'CALL He_get_UsersData( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, userResult) {
                    if (!err && userResult && userResult[0]) {
                        response.status = true;
                        response.message = "User data loaded successfully .";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < userResult[0].length; i++) {
                            var res2 = {};
                            res2.HEUserId = userResult[0][i].HEUserId;
                            res2.name = userResult[0][i].name;
                            res2.deptTitle = userResult[0][i].deptTitle;
                            res2.branches = userResult[0][i].branch ? JSON.parse(userResult[0][i].branch) : [];
                            res2.departments = userResult[0][i].department ? JSON.parse(userResult[0][i].department) : [];
                            res2.grades = userResult[0][i].grade ? JSON.parse(userResult[0][i].grade) : [];
                            res2.RMGroups = userResult[0][i].RMGroup ? JSON.parse(userResult[0][i].RMGroup) : [];
                            output.push(res2);
                        }

                        response.data = {
                            userData: output
                        };
                        //  res.status(200).json(response);
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "User data not found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting User data";
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

sendMessageCtrl.GetMsgMapUsersData = function (req, res, next) {
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
                req.query.keywords = req.query.keywords ? req.query.keywords : '';
                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.pageNo)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId),
                    req.st.db.escape(req.query.keywords),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit)
                ];

                var procQuery = 'CALL he_get_msgMap_userList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, userResult) {
                    if (!err && userResult && userResult[0]) {
                        response.status = true;
                        response.message = "User data loaded successfully .";
                        response.error = null;

                        var output = [];
                        for (var i = 0; i < userResult[0].length; i++) {
                            var res2 = {};
                            res2.HEUserId = userResult[0][i].HEUserId;
                            res2.isNormal = userResult[0][i].isNormal;
                            res2.isTaxSaving = userResult[0][i].isTaxSaving;
                            res2.name = userResult[0][i].name;
                            res2.branches = userResult[0][i].branch ? JSON.parse(userResult[0][i].branch) : [];
                            res2.departments = userResult[0][i].department ? JSON.parse(userResult[0][i].department) : [];
                            res2.grades = userResult[0][i].grade ? JSON.parse(userResult[0][i].grade) : [];
                            res2.RMGroups = userResult[0][i].RMGroup ? JSON.parse(userResult[0][i].RMGroup) : [];

                            output.push(res2);
                        }

                        response.data = {
                            userData: output,
                            count: userResult[1][0].count
                        };

                        // res.status(200).json(response);

                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "User data not found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting User data";
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

sendMessageCtrl.saveMsgMapUsersData = function (req, res, next) {
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
                    if (!req.body.HEMasterId) {
                        error.HEMasterId = 'Invalid HEMasterId';
                        validationFlag *= false;
                    }
                    if (!req.body.HEUserId) {
                        error.HEUserId = 'Invalid HEUserId';
                        validationFlag *= false;
                    }

                    var branches = req.body.branches;
                    if (typeof (branches) == "string") {
                        branches = JSON.parse(branches);
                    }
                    if (!branches) {
                        branches = [];
                    }

                    var departments = req.body.departments;
                    if (typeof (departments) == "string") {
                        departments = JSON.parse(departments);
                    }
                    if (!departments) {
                        departments = [];
                    }

                    var grades = req.body.grades;
                    if (typeof (grades) == "string") {
                        grades = JSON.parse(grades);
                    }
                    if (!grades) {
                        grades = [];
                    }

                    var RMGroups = req.body.RMGroups;
                    if (typeof (RMGroups) == "string") {
                        RMGroups = JSON.parse(RMGroups);
                    }
                    if (!RMGroups) {
                        RMGroups = [];
                    }


                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.query.keywords = req.query.keywords ? req.query.keywords : '';
                        req.query.isNormal = req.query.isNormal != undefined ? req.query.isNormal : 0;
                        req.query.isTaxSaving = req.query.isTaxSaving != undefined ? req.query.isTaxSaving : 0;


                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.HEMasterId),
                            req.st.db.escape(req.body.HEUserId),
                            req.st.db.escape(JSON.stringify(branches)),
                            req.st.db.escape(JSON.stringify(departments)),
                            req.st.db.escape(JSON.stringify(grades)),
                            req.st.db.escape(JSON.stringify(RMGroups)),
                            req.st.db.escape(req.body.isNormal),
                            req.st.db.escape(req.body.isTaxSaving)
                        ];

                        var procQuery = 'CALL he_save_msgMapDetails( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, userResult) {
                            if (!err) {
                                response.status = true;
                                response.message = "User data saved successfully .";
                                response.error = null;
                                response.data = null;

                                res.status(200).json(response);

                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving User data";
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

sendMessageCtrl.DeleteMsgMapUsersData = function (req, res, next) {
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
    if (!req.query.HEUserId) {
        error.HEUserId = 'Invalid HEUserId';
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
                    req.st.db.escape(req.query.HEUserId)
                ];

                var procQuery = 'CALL he_delete_msgmap( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, userResult) {
                    if (!err) {
                        response.status = true;
                        response.message = "User data deleted successfully .";
                        response.error = null;

                        response.data = null;

                        res.status(200).json(response);

                    }
                    else {
                        response.status = false;
                        response.message = "Error while deleting User data";
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

sendMessageCtrl.GetAnnouncementType = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var isweb;

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
                req.query.isweb = req.query.isweb ? req.query.isweb : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.groupId)
                ];

                var procQuery = 'CALL he_get_announcementType( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, userResult) {
                    if (!err && userResult && userResult[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully .";
                        response.error = null;

                        response.data = {
                            isNormal: (userResult[0] && userResult[0][0] && userResult[0][0].isNormal) ? userResult[0][0].isNormal : 0,
                            isTaxSaving: (userResult[0] && userResult[0][0] && userResult[0][0].isTaxSaving) ? userResult[0][0].isTaxSaving : 0,
                            fStartDate: (userResult[1] && userResult[1][0] && userResult[1][0].startDate) ? userResult[1][0].startDate : null,
                            fEndDate: (userResult[1] && userResult[1][0] && userResult[1][0].startDate) ? userResult[1][0].endDate : null
                        };

                        // res.status(200).json(response)
                        if (req.query.isweb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);

                        }

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting User data";
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

sendMessageCtrl.GetAnnouncementSummaryList = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var isweb;

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
                req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(req.query.type),
                    req.st.db.escape(req.query.groupId)
                ];

                var procQuery = 'CALL he_get_announcementList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, announcementResult) {
                    if (!err && announcementResult && announcementResult[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully .";
                        response.error = null;

                        var output = [];
                        for (var i = 0; i < announcementResult[0].length; i++) {
                            var res1 = {};
                            res1.parentId = announcementResult[0][i].parentId;
                            res1.transId = announcementResult[0][i].transId;
                            res1.isDraft = announcementResult[0][i].isDraft;
                            res1.senderName = announcementResult[0][i].senderName;
                            res1.title = announcementResult[0][i].title;
                            res1.message = announcementResult[0][i].message;
                            res1.createdDate = announcementResult[0][i].createdDate;
                            res1.total = announcementResult[0][i].read + announcementResult[0][i].unRead;
                            res1.read = announcementResult[0][i].read;
                            res1.unRead = announcementResult[0][i].unRead;
                            res1.isSender = announcementResult[0][i].isSender;
                            res1.announcementType = announcementResult[0][i].announcementType;
                            output.push(res1);
                        }
                        response.data = {
                            announcementList: output,
                            count: announcementResult[1][0].count,
                            isNormal: (announcementResult[2] && announcementResult[2][0] && announcementResult[2][0].isNormal) ? announcementResult[2][0].isNormal : 0,
                            isTaxSaving: (announcementResult[2] && announcementResult[2][0] && announcementResult[2][0].isTaxSaving) ? announcementResult[2][0].isTaxSaving : 0
                        };

                        // res.status(200).json(response)
                        if (req.query.isweb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting announcement data";
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

sendMessageCtrl.GetAnnouncementDetailedSummary = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var isweb;

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
                req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                req.query.status = req.query.status ? req.query.status : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.parentId),
                    req.st.db.escape(req.query.transId),
                    req.st.db.escape(req.query.status)
                ];

                var procQuery = 'CALL he_get_announcementDetailedSummary( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, announcementResult) {
                    if (!err && announcementResult && announcementResult[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully .";
                        response.error = null;
                        var output = [];
                        for (var i = 0; i < announcementResult[0].length; i++) {
                            var res1 = {};
                            res1.name = announcementResult[0][i].name;
                            res1.jobTitle = announcementResult[0][i].jobTitle;
                            res1.department = announcementResult[0][i].department;
                            res1.location = announcementResult[0][i].location;
                            res1.status = announcementResult[0][i].status;
                            res1.readDateTime = announcementResult[0][i].readDateTime;
                            res1.image = (announcementResult[0][i].imageUrl) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + announcementResult[0][i].imageUrl) : ""
                            output.push(res1);
                        }

                        response.data = {
                            userDetails: output
                        };

                        // res.status(200).json(response)
                        if (req.query.isweb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting user data";
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

sendMessageCtrl.saveAsDraft = function (req, res, next) {
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
                    var attachmentList = req.body.attachmentList;
                    if (typeof (attachmentList) == "string") {
                        attachmentList = JSON.parse(attachmentList);
                    }
                    if (!attachmentList) {
                        attachmentList = [];
                    }
                    // embededImages
                    var embededImages = req.body.embededImages;
                    if (typeof (embededImages) == "string") {
                        embededImages = JSON.parse(embededImages);
                    }
                    if (!embededImages) {
                        embededImages = [];
                    }

                    var userList = req.body.userList;
                    if (typeof (userList) == "string") {
                        userList = JSON.parse(userList);
                    }
                    if (!userList) {
                        userList = [];
                    }

                    var branchList = req.body.branchList;
                    if (typeof (branchList) == "string") {
                        branchList = JSON.parse(branchList);
                    }
                    if (!branchList) {
                        branchList = [];
                    }

                    var departmentList = req.body.departmentList;
                    if (typeof (departmentList) == "string") {
                        departmentList = JSON.parse(departmentList);
                    }
                    if (!departmentList) {
                        departmentList = [];
                    }

                    var gradeList = req.body.gradeList;
                    if (typeof (gradeList) == "string") {
                        gradeList = JSON.parse(gradeList);
                    }
                    if (!gradeList) {
                        gradeList = [];
                    }

                    var groupList = req.body.groupList;
                    if (typeof (groupList) == "string") {
                        groupList = JSON.parse(groupList);
                    }
                    if (!groupList) {
                        groupList = [];
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
                        req.body.message = req.body.message ? req.body.message : '';
                        req.body.notes = req.body.notes ? req.body.notes : '';
                        req.body.status = req.body.status ? req.body.status : 0;
                        req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                        req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                        req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                        req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                        req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                        req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;
                        req.body.recordedVoiceUrl = req.body.recordedVoiceUrl ? req.body.recordedVoiceUrl : '';
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                        req.body.groupType = req.body.groupType ? req.body.groupType : 0;
                        req.body.memberCount = req.body.memberCount ? req.body.memberCount : 0;
                        req.body.title = req.body.title != undefined ? req.body.title : "";
                        req.body.announcementType = req.body.announcementType != undefined ? req.body.announcementType : 1;
                        req.body.lockType = req.body.lockType != undefined ? req.body.lockType : 1;
                        req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                        req.body.startDate = req.body.startDate != undefined ? req.body.startDate : null;
                        req.body.endDate = req.body.endDate != undefined ? req.body.endDate : null;
                        req.body.isDraft = req.body.isDraft != undefined ? req.body.isDraft : 1;
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.message),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(JSON.stringify(attachmentList)),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(JSON.stringify(userList)),
                            req.st.db.escape(JSON.stringify(branchList)),
                            req.st.db.escape(JSON.stringify(departmentList)),
                            req.st.db.escape(JSON.stringify(gradeList)),
                            req.st.db.escape(JSON.stringify(groupList)),
                            req.st.db.escape(req.body.alarmType),
                            req.st.db.escape(JSON.stringify(embededImages)),
                            req.st.db.escape(req.body.groupType),
                            req.st.db.escape(req.body.memberCount),
                            req.st.db.escape(req.body.title),
                            req.st.db.escape(req.body.announcementType),
                            req.st.db.escape(req.body.lockType),
                            req.st.db.escape(req.body.startDate),
                            req.st.db.escape(req.body.endDate),
                            req.st.db.escape(req.body.isDraft),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.timestamp),
                            req.st.db.escape(req.body.createdTimeStamp) 
                        ];

                        var announcementFormId = 1033;
                        var keywordsParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(announcementFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_save_sendMessage( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {

                            if (!err) {
                                response.status = true;
                                response.message = "Message saved successfully";
                                response.error = null;
                                response.data = null;
                                // res.status(200).json(response);
                                res.status(200).json(response);

                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving message";
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

sendMessageCtrl.sendUnReadUsersAnnouncement = function (req, res, next) {
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
                    if (!req.body.parentId) {
                        error.parentId = 'Invalid parentId';
                        validationFlag *= false;
                    }
                    if (!req.body.transId) {
                        error.transId = 'Invalid transId';
                        validationFlag *= false;
                    }

                    var senderGroupId;
                    var isweb;

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.query.isweb = req.query.isweb ? req.query.isweb : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.transId)
                        ];

                        var procQuery = 'CALL he_save_notread_announcements( ' + procParams.join(',') + ')';
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
                                //         console.log(results[1][0].senderId , "results[1][0].senderIdresults[1][0].senderIdresults[1][0].senderId");
                                //         notification.publish(
                                //             results[1][i].receiverId,
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             results[1][0].senderId,
                                //             notificationTemplaterRes.parsedTpl,
                                //             31,
                                //             0,
                                //             (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
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
                                //                 },
                                //                 contactList : null
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
                                response.message = "Message sent successfully";
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
                                        transId: results[0][0].transId,
                                        formId: results[0][0].formId,
                                        currentStatus: results[0][0].currentStatus,
                                        currentTransId: results[0][0].currentTransId,
                                        localMessageId: req.body.localMessageId,
                                        parentId: results[0][0].parentId,
                                        accessUserType: results[0][0].accessUserType,
                                        heUserId: results[0][0].heUserId,
                                        formData: JSON.parse(results[0][0].formDataJSON)
                                    }
                                };
                                // res.status(200).json(response);
                                if (req.query.isweb == 0) {
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);

                                    });
                                }
                                else {
                                    res.status(200).json(response);
                                }


                            }
                            else {
                                response.status = false;
                                response.message = "Error while sending message";
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

sendMessageCtrl.GetAnnouncementDetail = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var isweb;

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
                req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                //req.query.status = req.query.status ? req.query.status : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.parentId),
                    req.st.db.escape(req.query.transId)
                ];

                var procQuery = 'CALL he_get_announcementdetail( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    if (!err && Result && Result[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully .";
                        response.error = null;
                        // var output = [];
                        // for(var i = 0; i < announcementResult[0].length; i++) {
                        //     var res1 = {};
                        //     res1.name = announcementResult[0][i].name;
                        //     res1.jobTitle = announcementResult[0][i].jobTitle;
                        //     res1.department = announcementResult[0][i].department;
                        //     res1.location = announcementResult[0][i].location;
                        //     res1.status = announcementResult[0][i].status;
                        //     res1.readDateTime = announcementResult[0][i].readDateTime;
                        //     res1.image = (announcementResult[0][i].imageUrl) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + announcementResult[0][i].imageUrl) : ""
                        //     output.push(res1);
                        // }
                        //
                        response.data = {
                            userDetails: (Result[0] && Result[0][0] && Result[0][0].formDataJSON) ? (JSON.parse(Result[0][0].formDataJSON)) : []
                        };

                        // res.status(200).json(response)
                        if (req.query.isweb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting user data";
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

sendMessageCtrl.sendMessageTest = function (req, res, next) {
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
    var attachmentList = req.body.attachmentList;
    if (typeof (attachmentList) == "string") {
        attachmentList = JSON.parse(attachmentList);
    }
    if (!attachmentList) {
        attachmentList = [];
    }
    // embededImages
    var embededImages = req.body.embededImages;
    if (typeof (embededImages) == "string") {
        embededImages = JSON.parse(embededImages);
    }
    if (!embededImages) {
        embededImages = [];
    }

    var userList = req.body.userList;
    if (typeof (userList) == "string") {
        userList = JSON.parse(userList);
    }
    if (!userList) {
        userList = [];
    }

    var branchList = req.body.branchList;
    if (typeof (branchList) == "string") {
        branchList = JSON.parse(branchList);
    }
    if (!branchList) {
        branchList = [];
    }

    var departmentList = req.body.departmentList;
    if (typeof (departmentList) == "string") {
        departmentList = JSON.parse(departmentList);
    }
    if (!departmentList) {
        departmentList = [];
    }

    var gradeList = req.body.gradeList;
    if (typeof (gradeList) == "string") {
        gradeList = JSON.parse(gradeList);
    }
    if (!gradeList) {
        gradeList = [];
    }

    var groupList = req.body.groupList;
    if (typeof (groupList) == "string") {
        groupList = JSON.parse(groupList);
    }
    if (!groupList) {
        groupList = [];
    }
    var keywordList = req.body.keywordList;
    if (typeof (keywordList) == "string") {
        keywordList = JSON.parse(keywordList);
    }
    if (!keywordList) {
        keywordList = [];
    }

    var senderGroupId;
    var isweb;

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

                    var attachmentList = req.body.attachmentList;
                    if (typeof (attachmentList) == "string") {
                        attachmentList = JSON.parse(attachmentList);
                    }
                    if (!attachmentList) {
                        attachmentList = [];
                    }
                    // embededImages
                    var embededImages = req.body.embededImages;
                    if (typeof (embededImages) == "string") {
                        embededImages = JSON.parse(embededImages);
                    }
                    if (!embededImages) {
                        embededImages = [];
                    }

                    var userList = req.body.userList;
                    if (typeof (userList) == "string") {
                        userList = JSON.parse(userList);
                    }
                    if (!userList) {
                        userList = [];
                    }

                    var branchList = req.body.branchList;
                    if (typeof (branchList) == "string") {
                        branchList = JSON.parse(branchList);
                    }
                    if (!branchList) {
                        branchList = [];
                    }

                    var departmentList = req.body.departmentList;
                    if (typeof (departmentList) == "string") {
                        departmentList = JSON.parse(departmentList);
                    }
                    if (!departmentList) {
                        departmentList = [];
                    }

                    var gradeList = req.body.gradeList;
                    if (typeof (gradeList) == "string") {
                        gradeList = JSON.parse(gradeList);
                    }
                    if (!gradeList) {
                        gradeList = [];
                    }

                    var groupList = req.body.groupList;
                    if (typeof (groupList) == "string") {
                        groupList = JSON.parse(groupList);
                    }
                    if (!groupList) {
                        groupList = [];
                    }
                    var keywordList = req.body.keywordList;
                    if (typeof (keywordList) == "string") {
                        keywordList = JSON.parse(keywordList);
                    }
                    if (!keywordList) {
                        keywordList = [];
                    }

                    var senderGroupId;
                    var isweb;

                    if (!validationFlag) {
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
                        req.body.recordedVoiceUrl = req.body.recordedVoiceUrl ? req.body.recordedVoiceUrl : '';
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                        req.body.groupType = req.body.groupType ? req.body.groupType : 0;
                        req.body.memberCount = req.body.memberCount ? req.body.memberCount : 0;
                        req.body.title = req.body.title != undefined ? req.body.title : "";
                        req.body.announcementType = req.body.announcementType != undefined ? req.body.announcementType : 1;
                        req.body.lockType = req.body.lockType != undefined ? req.body.lockType : 1;
                        req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                        req.body.startDate = req.body.startDate != undefined ? req.body.startDate : null;
                        req.body.endDate = req.body.endDate != undefined ? req.body.endDate : null;
                        req.body.isDraft = req.body.isDraft != undefined ? req.body.isDraft : 0;
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.message),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(JSON.stringify(attachmentList)),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(JSON.stringify(userList)),
                            req.st.db.escape(JSON.stringify(branchList)),
                            req.st.db.escape(JSON.stringify(departmentList)),
                            req.st.db.escape(JSON.stringify(gradeList)),
                            req.st.db.escape(JSON.stringify(groupList)),
                            req.st.db.escape(req.body.alarmType),
                            req.st.db.escape(JSON.stringify(embededImages)),
                            req.st.db.escape(req.body.groupType),
                            req.st.db.escape(req.body.memberCount),
                            req.st.db.escape(req.body.title),
                            req.st.db.escape(req.body.announcementType),
                            req.st.db.escape(req.body.lockType),
                            req.st.db.escape(req.body.startDate),
                            req.st.db.escape(req.body.endDate),
                            req.st.db.escape(req.body.isDraft),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.timestamp),
                            req.st.db.escape(req.body.createdTimeStamp) 
                        ];
                        var announcementFormId = 1033;
                        var keywordsParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(announcementFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)
                        ];

                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_save_sendMessage( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {

                            if (!err && results && results[0]) {
                                senderGroupId = results[0][0].senderId;
                                notificationTemplaterRes = notificationTemplater.parse('compose_message', {
                                    senderName: results[0][0].message
                                });
                                notifyMessages.getMessagesNeedToNotify();
                                // var numberOfThreads = Math.ceil(results[1].length /100);
                                // for (var i = 0; i < numberOfThreads ; i++) {
                                //     thread
                                //         .send({results:results[1],increment:i,limitValues:100})
                                //         .on('message', function(response) {
                                //             console.log('AAAAA');
                                //             thread.kill();
                                //         })
                                //         .on('error', function(error) {
                                //             console.log('Worker errored:', error);
                                //         })
                                //         .on('exit', function() {
                                //             console.log('Worker has been terminated.');
                                //         });
                                // }

                                response.status = true;
                                response.message = "Message sent successfully";
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
                                        transId: results[0][0].transId,
                                        formId: results[0][0].formId,
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
                                response.message = "Error while sending message";
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


sendMessageCtrl.processUpdate = function (req, res, next) {

    req.query.isWeb = req.query.isWeb ? req.query.isWeb : 0;

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
                if (req.query.isWeb == 0) {

                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        var attachmentList = req.body.attachmentList;
                        if (typeof (attachmentList) == "string") {
                            attachmentList = JSON.parse(attachmentList);
                        }
                        if (!attachmentList) {
                            attachmentList = [];
                        }

                        // embededImages
                        var embededImages = req.body.embededImages;
                        if (typeof (embededImages) == "string") {
                            embededImages = JSON.parse(embededImages);
                        }
                        if (!embededImages) {
                            embededImages = [];
                        }

                        var userList = req.body.userList;
                        if (typeof (userList) == "string") {
                            userList = JSON.parse(userList);
                        }
                        if (!userList) {
                            userList = [];
                        }

                        var branchList = req.body.branchList;
                        if (typeof (branchList) == "string") {
                            branchList = JSON.parse(branchList);
                        }
                        if (!branchList) {
                            branchList = [];
                        }

                        var departmentList = req.body.departmentList;
                        if (typeof (departmentList) == "string") {
                            departmentList = JSON.parse(departmentList);
                        }
                        if (!departmentList) {
                            departmentList = [];
                        }

                        var gradeList = req.body.gradeList;
                        if (typeof (gradeList) == "string") {
                            gradeList = JSON.parse(gradeList);
                        }
                        if (!gradeList) {
                            gradeList = [];
                        }

                        // var approverList = req.body.approverList;
                        // if (typeof (approverList) == "string") {
                        //     approverList = JSON.parse(approverList);
                        // }
                        // if (!approverList) {
                        //     approverList = [];
                        // }

                        var groupList = req.body.groupList;
                        if (typeof (groupList) == "string") {
                            groupList = JSON.parse(groupList);
                        }
                        if (!groupList) {
                            groupList = [];
                        }
                        var keywordList = req.body.keywordList;
                        if (typeof (keywordList) == "string") {
                            keywordList = JSON.parse(keywordList);
                        }
                        if (!keywordList) {
                            keywordList = [];
                        }

                        var senderGroupId;
                        var isweb;

                        if (!validationFlag) {
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
                            req.body.recordedVoiceUrl = req.body.recordedVoiceUrl ? req.body.recordedVoiceUrl : '';
                            req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                            req.body.groupType = req.body.groupType ? req.body.groupType : 0;
                            req.body.memberCount = req.body.memberCount ? req.body.memberCount : 0;
                            req.body.title = req.body.title != undefined ? req.body.title : "";
                            req.body.announcementType = req.body.announcementType != undefined ? req.body.announcementType : 1;
                            req.body.lockType = req.body.lockType != undefined ? req.body.lockType : 1;
                            req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                            req.body.startDate = req.body.startDate != undefined ? req.body.startDate : null;
                            req.body.endDate = req.body.endDate != undefined ? req.body.endDate : null;
                            req.body.isDraft = req.body.isDraft != undefined ? req.body.isDraft : 0;
                            req.body.status = req.body.status != undefined ? req.body.status : 0;
                            req.body.approverNotes = req.body.approverNotes != undefined ? req.body.approverNotes : '';
                            req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                            var procParams = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.body.parentId),
                                req.st.db.escape(req.body.message),
                                req.st.db.escape(req.body.groupId),
                                req.st.db.escape(req.body.learnMessageId),
                                req.st.db.escape(req.body.accessUserType),
                                req.st.db.escape(JSON.stringify(attachmentList)),
                                req.st.db.escape(req.body.changeLog),
                                req.st.db.escape(JSON.stringify(userList)),
                                req.st.db.escape(JSON.stringify(branchList)),
                                req.st.db.escape(JSON.stringify(departmentList)),
                                req.st.db.escape(JSON.stringify(gradeList)),
                                req.st.db.escape(JSON.stringify(groupList)),
                                req.st.db.escape(req.body.alarmType),
                                req.st.db.escape(JSON.stringify(embededImages)),
                                req.st.db.escape(req.body.groupType),
                                req.st.db.escape(req.body.memberCount),
                                req.st.db.escape(req.body.title),
                                req.st.db.escape(req.body.announcementType),
                                req.st.db.escape(req.body.lockType),
                                req.st.db.escape(req.body.startDate),
                                req.st.db.escape(req.body.endDate),
                                req.st.db.escape(req.body.isDraft),
                                req.st.db.escape(DBSecretKey),
                                req.st.db.escape(req.body.status),
                                req.st.db.escape(req.body.approverNotes),
                                req.st.db.escape(req.body.timestamp),
                                req.st.db.escape(req.body.createdTimeStamp)

                            ];

                            console.log("req.body", req.body);
                            console.log("req.body.groupId", req.body.groupId);


                            var processFormId = 1044;
                            var keywordsParams = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(processFormId),
                                req.st.db.escape(JSON.stringify(keywordList)),
                                req.st.db.escape(req.body.groupId)
                            ];
                            /**
                             * Calling procedure to save form template
                             * @type {string}
                             */
                            var procQuery = 'CALL HE_save_processUpdate( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, results) {
                                console.log(results);
                                console.log('err', err);
                                if (!err && results && results[0]) {
                                    senderGroupId = results[0][0].senderId;
                                    response.status = true;
                                    response.message = "Message sent successfully";
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
                                            transId: results[0][0].transId,
                                            formId: results[0][0].formId,
                                            currentStatus: results[0][0].currentStatus,
                                            currentTransId: results[0][0].currentTransId,
                                            localMessageId: req.body.localMessageId,
                                            parentId: results[0][0].parentId,
                                            accessUserType: results[0][0].accessUserType,
                                            heUserId: results[0][0].heUserId,
                                            formData: JSON.parse(results[0][0].formDataJSON)
                                        }
                                    };
                                    // res.status(200).json(response);
                                    if (req.query.isWeb == 0) {
                                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                        zlib.gzip(buf, function (_, result) {
                                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                            res.status(200).json(response);

                                        });
                                    }
                                    else {
                                        res.status(200).json(response);
                                    }
                                    notifyMessages.getMessagesNeedToNotify();

                                    // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                                    //     senderName : results[0][0].message
                                    // });
                                    //
                                    // for (var i = 0; i < results[1].length; i++ ) {
                                    //     if (notificationTemplaterRes.parsedTpl) {
                                    //         console.log(results[1][0].senderId , "results[1][0].senderIdresults[1][0].senderIdresults[1][0].senderId");
                                    //         notification.publish(
                                    //             results[1][i].receiverId,
                                    //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                    //             results[1][0].senderId,
                                    //             notificationTemplaterRes.parsedTpl,
                                    //             31,
                                    //             0,
                                    //             (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
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
                                    //                 },
                                    //                 contactList : null
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
                                }
                                else {
                                    response.status = false;
                                    response.message = "Error while sending message";
                                    response.error = null;
                                    response.data = null;
                                    res.status(500).json(response);
                                }
                            });
                        }
                    });
                }
                else {
                    // var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    // zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    //     req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    var attachmentList = req.body.attachmentList;
                    if (typeof (attachmentList) == "string") {
                        attachmentList = JSON.parse(attachmentList);
                    }
                    if (!attachmentList) {
                        attachmentList = [];
                    }
                    // embededImages
                    var embededImages = req.body.embededImages;
                    if (typeof (embededImages) == "string") {
                        embededImages = JSON.parse(embededImages);
                    }
                    if (!embededImages) {
                        embededImages = [];
                    }

                    var userList = req.body.userList;
                    if (typeof (userList) == "string") {
                        userList = JSON.parse(userList);
                    }
                    if (!userList) {
                        userList = [];
                    }

                    var branchList = req.body.branchList;
                    if (typeof (branchList) == "string") {
                        branchList = JSON.parse(branchList);
                    }
                    if (!branchList) {
                        branchList = [];
                    }

                    var departmentList = req.body.departmentList;
                    if (typeof (departmentList) == "string") {
                        departmentList = JSON.parse(departmentList);
                    }
                    if (!departmentList) {
                        departmentList = [];
                    }

                    var gradeList = req.body.gradeList;
                    if (typeof (gradeList) == "string") {
                        gradeList = JSON.parse(gradeList);
                    }
                    if (!gradeList) {
                        gradeList = [];
                    }

                    var groupList = req.body.groupList;
                    if (typeof (groupList) == "string") {
                        groupList = JSON.parse(groupList);
                    }
                    if (!groupList) {
                        groupList = [];
                    }
                    var keywordList = req.body.keywordList;
                    if (typeof (keywordList) == "string") {
                        keywordList = JSON.parse(keywordList);
                    }
                    if (!keywordList) {
                        keywordList = [];
                    }

                    var senderGroupId;
                    var isweb;

                    if (!validationFlag) {
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
                        req.body.recordedVoiceUrl = req.body.recordedVoiceUrl ? req.body.recordedVoiceUrl : '';
                        req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                        req.body.groupType = req.body.groupType ? req.body.groupType : 0;
                        req.body.memberCount = req.body.memberCount ? req.body.memberCount : 0;
                        req.body.title = req.body.title != undefined ? req.body.title : "";
                        req.body.announcementType = req.body.announcementType != undefined ? req.body.announcementType : 1;
                        req.body.lockType = req.body.lockType != undefined ? req.body.lockType : 1;
                        req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                        req.body.startDate = req.body.startDate != undefined ? req.body.startDate : null;
                        req.body.endDate = req.body.endDate != undefined ? req.body.endDate : null;
                        req.body.isDraft = req.body.isDraft != undefined ? req.body.isDraft : 0;
                        req.body.approvalStatus = req.body.approvalStatus != undefined ? req.body.approvalStatus : 0;
                        req.body.approverNotes = req.body.approverNotes != undefined ? req.body.approverNotes : '';
                        req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.parentId),
                            req.st.db.escape(req.body.message),
                            req.st.db.escape(req.body.groupId),
                            req.st.db.escape(req.body.learnMessageId),
                            req.st.db.escape(req.body.accessUserType),
                            req.st.db.escape(JSON.stringify(attachmentList)),
                            req.st.db.escape(req.body.changeLog),
                            req.st.db.escape(JSON.stringify(userList)),
                            req.st.db.escape(JSON.stringify(branchList)),
                            req.st.db.escape(JSON.stringify(departmentList)),
                            req.st.db.escape(JSON.stringify(gradeList)),
                            req.st.db.escape(JSON.stringify(groupList)),
                            req.st.db.escape(req.body.alarmType),
                            req.st.db.escape(JSON.stringify(embededImages)),
                            req.st.db.escape(req.body.groupType),
                            req.st.db.escape(req.body.memberCount),
                            req.st.db.escape(req.body.title),
                            req.st.db.escape(req.body.announcementType),
                            req.st.db.escape(req.body.lockType),
                            req.st.db.escape(req.body.startDate),
                            req.st.db.escape(req.body.endDate),
                            req.st.db.escape(req.body.isDraft),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.body.approvalStatus),
                            req.st.db.escape(req.body.approverNotes),
                            req.st.db.escape(req.body.timestamp),
                                req.st.db.escape(req.body.createdTimeStamp)

                        ];

                        console.log("normal req.body", req.body);
                        console.log("req.body.groupId", req.body.groupId);

                        var processFormId = 1044;
                        var keywordsParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(processFormId),
                            req.st.db.escape(JSON.stringify(keywordList)),
                            req.st.db.escape(req.body.groupId)
                        ];
                        /**
                         * Calling procedure to save form template
                         * @type {string}
                         */
                        var procQuery = 'CALL HE_save_processUpdate( ' + procParams.join(',') + ');CALL wm_update_formKeywords(' + keywordsParams.join(',') + ');';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, results) {
                            console.log(results);
                            console.log('err', err);
                            if (!err && results && results[0]) {
                                senderGroupId = results[0][0].senderId;
                                response.status = true;
                                response.message = "Process update sent successfully";
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
                                        transId: results[0][0].transId,
                                        formId: results[0][0].formId,
                                        currentStatus: results[0][0].currentStatus,
                                        currentTransId: results[0][0].currentTransId,
                                        localMessageId: req.body.localMessageId,
                                        parentId: results[0][0].parentId,
                                        accessUserType: results[0][0].accessUserType,
                                        heUserId: results[0][0].heUserId,
                                        formData: JSON.parse(results[0][0].formDataJSON)
                                    }
                                };
                                // res.status(200).json(response);
                                if (req.query.isWeb == 0) {
                                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                                    zlib.gzip(buf, function (_, result) {
                                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                        res.status(200).json(response);

                                    });
                                }
                                else {
                                    res.status(200).json(response);
                                }
                                notifyMessages.getMessagesNeedToNotify();

                                // notificationTemplaterRes = notificationTemplater.parse('compose_message',{
                                //     senderName : results[0][0].message
                                // });
                                //
                                // for (var i = 0; i < results[1].length; i++ ) {
                                //     if (notificationTemplaterRes.parsedTpl) {
                                //         console.log(results[1][0].senderId , "results[1][0].senderIdresults[1][0].senderIdresults[1][0].senderId");
                                //         notification.publish(
                                //             results[1][i].receiverId,
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             (results[0][0].groupName) ? (results[0][0].groupName) : '',
                                //             results[1][0].senderId,
                                //             notificationTemplaterRes.parsedTpl,
                                //             31,
                                //             0,
                                //             (results[1][i].iphoneId) ? (results[1][i].iphoneId) : '',
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
                                //                 },
                                //                 contactList : null
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
                            }
                            else {
                                response.status = false;
                                response.message = "Error while process update";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    }
                    // });
                }

            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


sendMessageCtrl.GetProcessUpdateSummaryList = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var isweb;

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
                req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
                req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
                var startPage = 0;

                startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;
                req.query.type = (req.query.type) ? (req.query.type) : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(startPage),
                    req.st.db.escape(req.query.limit),
                    req.st.db.escape(req.query.type),
                    req.st.db.escape(req.query.groupId)
                ];

                var procQuery = 'CALL he_get_processtrackerList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, processResult) {
                    if (!err && processResult && processResult[0]) {
                        response.status = true;
                        response.message = "Process data loaded successfully .";
                        response.error = null;

                        for (var i = 0; i < processResult[0].length; i++) {
                            processResult[0].total = processResult[0][i].read + processResult[0][i].unRead;
                        }
                        response.data = {
                            processList: processResult[0],
                            count: processResult[1][0].count,
                            isNormal: (processResult[2] && processResult[2][0] && processResult[2][0].isNormal) ? processResult[2][0].isNormal : 0
                            // isTaxSaving: (announcementResult[2] && announcementResult[2][0] && announcementResult[2][0].isTaxSaving) ? announcementResult[2][0].isTaxSaving : 0
                        };

                        // res.status(200).json(response)
                        if (req.query.isweb == 0) {
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });
                        }
                        else {
                            res.status(200).json(response);
                        }
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = {};
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting process update data";
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


sendMessageCtrl.GetProcessUpdateDetail = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var isweb;

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.transId) {
        error.transId = 'Invalid transId';
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
                req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                //req.query.status = req.query.status ? req.query.status : 0;
                req.query.parentId = req.query.parentId ? req.query.parentId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.parentId),
                    req.st.db.escape(req.query.transId)
                ];

                var procQuery = 'CALL he_get_processUpdatedetail( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    if (!err && Result && Result[0]) {
                        response.status = true;
                        response.message = "Data loaded successfully .";
                        response.error = null;

                        response.data = {
                            userDetails: (Result[0] && Result[0][0] && Result[0][0].formDataJSON) ? (JSON.parse(Result[0][0].formDataJSON)) : []
                        };
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
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
                res.status(401).json(response);
            }
        });
    }
};


sendMessageCtrl.getBulkEmployeeAnnouncementTitle = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var isweb;

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.heMasterId) {
        error.heMasterId = 'Invalid heMasterId';
        validationFlag *= false;
    }

    if (!req.body.announcementBatchTitle) {
        error.announcementBatchTitle = 'Invalid announcementBatchTitle';
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
                req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                //req.query.status = req.query.status ? req.query.status : 0;
                req.body.isDraft = req.body.isDraft ? req.body.isDraft : 1;
                req.body.announcementBatchTitleId = req.body.announcementBatchTitleId ? req.body.announcementBatchTitleId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.body.announcementBatchTitleId),
                    req.st.db.escape(req.body.announcementBatchTitle),
                    req.st.db.escape(req.body.isDraft),
                    req.st.db.escape(JSON.stringify(req.body.announcementFormData) || JSON.stringify([]))

                ];

                var procQuery = 'CALL wm_save_bulkEmployeeAnnouncementBatchTitle( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, Result) {
                    if (!err && Result && Result[0] && Result[0][0]) {
                        response.status = true;
                        response.message = "Employee Announcement details saved successfully .";
                        response.error = null;

                        Result[0][0].announcementFormData = (Result[0][0] && Result[0][0].announcementFormData) ? JSON.parse(Result[0][0].announcementFormData) : {};

                        response.data = Result[0][0];
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving data";
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


sendMessageCtrl.getBulkEmployeeAnnouncementTitles = function (req, res, next) {
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
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId)

                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_bulkEmployeeAnnouncementTitle( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, result) {
                    if (!err && result && result[0] && result[0][0]) {
                        response.status = true;
                        response.message = "Employee Announcement importer list loaded successfully";
                        response.error = null;

                        for (var i = 0; i < result[0].length; i++) {
                            result[0][i].announcementFormData = (result[0][i] && result[0][i].announcementFormData) ? JSON.parse(result[0][i].announcementFormData) : {}
                        }

                        response.announcementBatchList = (result[0] && result[0][0]) ? result[0] : [];
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading list";
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


module.exports = sendMessageCtrl;
