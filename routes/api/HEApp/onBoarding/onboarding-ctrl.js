
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');
var uuid = require('node-uuid');


var notifyMessages = require('../../../../routes/api/messagebox/notifyMessages.js');
var notifyMessages = new notifyMessages();
var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var appConfig = require('../../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;

var onboardingctrl = {};
var error = {};


onboardingctrl.onBoardingDynamicForm = function (req, res, next) {
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
                    req.st.db.escape(req.query.heMasterId),

                ];

                var procQuery = 'CALL wm_get_DynamicOnBoardingDetails( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0][0]) {

                        response.status = true;
                        response.message = "OnBoarding fields loaded successfully";
                        response.error = null;

                        var output = {};
                        for (var i = 0; i < results[7].length; i++) {
                            output[results[7][i].queryTitle] = results[7][i].queryTypeList ? JSON.parse(results[7][i].queryTypeList) : []
                        }

                        response.data = {
                            formId :results[0][0].formId,
                            totalScreenWidth:results[0][0].totalScreenWidth,
                            sectionList : (results[0] && results[0][0]) ? JSON.parse(results[0][0].dynamicFormFields):[],
                           
                           

                            masterData:{
                                jobType : results[1] ? results[1] :[],
                                currency :results[2] ? results[2] :[],
                                scale : results[3] ? results[3] :[],
                                duration : results[4] ? results[4] :[],
                                designation : results[5] ? results[5] :[],
                                radioName  : results[6] ? results[6]:[],
                                sampleSegment :output,
                                gender : results[9] ? results[9]:[],
                                document : results[10] ? results[10]:[]
                            }
                            
                        }
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data =null;

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

onboardingctrl.onBoardingDynamicMaster = function (req, res, next) {
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
                    req.st.db.escape(req.query.heMasterId),

                ];

                var procQuery = 'CALL wm_get_DynamicOnBoardingMaster( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0][0]) {

                        response.status = true;
                        response.message = "OnBoarding fields loaded successfully";
                        response.error = null;

                        var output = {};
                        for (var i = 0; i < results[7].length; i++) {
                            output[results[7][i].queryTitle] = results[7][i].queryTypeList ? JSON.parse(results[7][i].queryTypeList) : []
                        }

                        response.data = {
                            sectionList : (results[0] && results[10][0]) ? JSON.parse(results[10][0].dynamicFormFields):[],
                            
                            masterData:{

                                jobType : results[0] ? results[0] :[],
                                currency :results[1] ? results[1] :[],
                                scale : results[2] ? results[2] :[],
                                duration : results[3] ? results[3] :[],
                                designation : results[4] ? results[4] :[],
                                sectionTypeList : results[5] ? results[5] :[],
                                radioName : results[6] ? results[6]:[],
                                sampleSegment :output,
                                selectTypeList : results[8] ? results[8]:[],
                                controlTypeList : results[9] ? results[9]:[],
                                gender : results[12] ? results[12]:[],
                                document : results[13] ? results[13]:[]
                            },
                            dropdownName:results[11] ? results[11]:[],
                        }
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data =null;

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

onboardingctrl.onBoardingDynamicConfig = function (req, res, next) {
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
    var feilds = req.body.dynamicFields;
    if (typeof (feilds) == "string") {
        feilds = JSON.parse(feilds);
    }
    if (!feilds) {
        feilds = [];
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
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(JSON.stringify(feilds))
                ];

                var procQuery = 'CALL wm_save_DynamicOnBoardingConfig( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err ) {

                        response.status = true;
                        response.message = "OnBoarding fields saved successfully";
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


onboardingctrl.saveOnBoarding = function (req, res, next) {

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

                    var decryptBuf = encryption.decrypt1((req.body.data), tokenResult[0].secretKey);
                    zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                        req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                        var userDetails = req.body.userDetails;
                        if (typeof (userDetails) == "string") {
                            userDetails = JSON.parse(userDetails);
                        }
                        if (!userDetails) {
                            userDetails = {};
                        }

                        // embededImages
                        

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
                            req.body.status = req.body.status ? req.body.status : 1;
                            req.body.approverNotes = req.body.approverNotes ? req.body.approverNotes : '';
                            req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                            req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                            req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                            req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                            req.body.accessUserType = req.body.accessUserType ? req.body.accessUserType : 0;
                            req.body.recordedVoiceUrl = req.body.recordedVoiceUrl ? req.body.recordedVoiceUrl : '';
                            req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;
                            req.body.groupType = req.body.groupType ? req.body.groupType : 0;
                            // req.body.memberCount = req.body.memberCount ? req.body.memberCount : 0;
                            // req.body.title = req.body.title != undefined ? req.body.title : "";
                            // req.body.announcementType = req.body.announcementType != undefined ? req.body.announcementType : 1;
                            // req.body.lockType = req.body.lockType != undefined ? req.body.lockType : 1;
                            // req.query.isweb = req.query.isweb ? req.query.isweb : 0;
                            // req.body.startDate = req.body.startDate != undefined ? req.body.startDate : null;
                            // req.body.endDate = req.body.endDate != undefined ? req.body.endDate : null;
                            // req.body.isDraft = req.body.isDraft != undefined ? req.body.isDraft : 0;
                            // req.body.status = req.body.status != undefined ? req.body.status : 0;
                            req.body.approverNotes = req.body.approverNotes != undefined ? req.body.approverNotes : '';
                            req.body.timestamp = req.body.timestamp ? req.body.timestamp : '';
                            req.body.reqAppId = req.body.reqAppId ? req.body.reqAppId : 0;
                            req.body.heMasterId = req.body.heMasterId ? req.body.heMasterId : 0;
                            req.body.totalScreenWidth = req.body.totalScreenWidth ? req.body.totalScreenWidth : 0;
                            req.body.userId = req.body.userId ? req.body.userId : 0;
                            req.body.masterData = req.body.masterData ? req.body.masterData : [];
                            

                            var procParams = [
                                req.st.db.escape(req.query.token),
                                req.st.db.escape(req.body.parentId),
                               
                                req.st.db.escape(JSON.stringify(userDetails)),
                                req.st.db.escape(req.body.status),
                                req.st.db.escape(req.body.approverNotes),
                                req.st.db.escape(req.body.receiverNotes),
                                req.st.db.escape(req.body.changeLog),
                                req.st.db.escape(req.body.groupId),
                                req.st.db.escape(req.body.accessUserType),
                                req.st.db.escape(req.body.approverCount),
                                req.st.db.escape(req.body.receiverCount),
                               req.st.db.escape(DBSecretKey),
                                req.st.db.escape(req.body.timestamp),
                                req.st.db.escape(req.body.createdTimeStamp),
                                req.st.db.escape(req.body.reqAppId),
                                req.st.db.escape(req.body.heMasterId),
                                req.st.db.escape(req.body.totalScreenWidth),
                                req.st.db.escape(req.body.userId),
                                req.st.db.escape(JSON.stringify(req.body.masterData))
                                

                                

                            
                            ];

                            
                            /**
                             * Calling procedure to save form template
                             * @type {string}
                             */
                            var procQuery = 'CALL HE_save_dynamicOnboarding_new( ' + procParams.join(',') + ')';
                            console.log(procQuery);
                            req.db.query(procQuery, function (err, results) {
                                console.log(results);
                                console.log('err', err);
                                if (!err && results && results[0]) {
                                    senderGroupId = results[0][0].senderId;
                                    response.status = true;
                                    response.message = "onboarding submitted successfully";
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
                res.status(401).json(response);
            }
        });
    }
};


onboardingctrl.onBoardingTracker = function (req, res, next) {
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
                    req.st.db.escape(req.query.status),
                    req.st.db.escape(req.query.heMasterId)
                    
                    

                ];

                var procQuery = 'CALL wm_get_onboardingTracker( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, results) {
                    console.log(err);
                    if (!err && results && results[0][0]) {

                        response.status = true;
                        response.message = "OnBoarding tracker loaded successfully";
                        response.error = null;

                        for (var i = 0; i < results[0].length; i++) {
                            results[0][i].formdata = results[0][i].formdata ? JSON.parse(results[0][i].formdata) : {}
                        }

                        response.data = {
                            data:results[0]
                        }
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "No result found";
                        response.error = null;
                        response.data =null;
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

module.exports = onboardingctrl;
