/**
 * Created by Jana1 on 28-12-2017.
 */

var zoomCtrl = {};
var error = {};
var Notification_aws = require('../../modules/notification/aws-sns-push');

var _Notification_aws = new Notification_aws();

var zlib = require('zlib');
var AES_256_encryption = require('../../encryption/encryption.js');
var encryption = new AES_256_encryption();
var appConfig = require('../../../ezeone-config.json');
var DBSecretKey = appConfig.DB.secretKey;

const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const VoiceGrant = AccessToken.VoiceGrant;

// Used when generating any kind of tokens
// const accountSid = appConfig.DB.accountSid;  //'ACcf64b25bcacbac0b6f77b28770852ec9';//'AC3765f2ec587b6b5b893566f1393a00f4';
const authToken = appConfig.DB.authToken || 'ff62486827ce8b68c70c1b8f7cef9748';   //'3abf04f536ede7f6964919936a35e614';  //'b36eba6376b5939cebe146f06d33ec57';//
const FromNumber = appConfig.DB.FromNumber || '+16012286363';

// used to get access token video
const twilioAccountSid = 'AC62cf5e4f884a28b6ad9e2da511d24f4d';//'ACcf64b25bcacbac0b6f77b28770852ec9';
const twilioApiKey = 'SK6e0a385cf5886a5370593777e3a954c0';//'SK325bcee2fd8a349792f9772907f0bfe8';
const twilioApiSecret = 'zhayNVpQhutvttQm1pozOioabkJYr1hR';// old 'oMrS8ymAimGGiIFIz80LhNrbQoSIWoUu'; 


// Used specifically for creating Voice tokens
const voiceTwilioApiKey = 'SK0a4ce4a1dfc4ef8524d2914cb098834a';
const voiceTwilioApiSecret = 'DXmncoPKS8qK9BAUPIGeQBz2Gc5qrFUc';
const outgoingApplicationSid = 'AP233f4b7677eb5ceef55de1d13dfcfead';
const pushCredSid = 'CRdc3174026058367980aa0b6031336e94';
var identity = 'user';
const VoiceResponse = require('twilio').twiml.VoiceResponse;

zoomCtrl.saveZoomMeeting = function (req, res, next) {
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
                    console.log(typeof (req.body.data));
                    if (req.body.meetingId == undefined) {
                        error.meetingId = 'Invalid meetingId';
                        validationFlag *= false;
                    }

                    var memberList = req.body.memberList;
                    if (typeof (memberList) == "string") {
                        memberList = JSON.parse(memberList);
                    }
                    if (!memberList) {
                        error.itemList = 'Invalid memberList';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.duration = req.body.duration != undefined ? req.body.duration : 0;
                        req.body.isReminderEnabled = req.body.isReminderEnabled != undefined ? req.body.isReminderEnabled : 0;
                        req.body.reminderDate = req.body.reminderDate != undefined ? req.body.reminderDate : null;
                        req.body.callType = req.body.callType != undefined ? req.body.callType : 0;
                        req.body.callMethod = req.body.callMethod != undefined ? req.body.callMethod : 0;
                        req.body.callDateTime = req.body.callDateTime != undefined ? req.body.callDateTime : null;
                        req.query.isDialer = req.query.isDialer ? req.query.isDialer : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.meetingId),
                            req.st.db.escape(JSON.stringify(memberList)),
                            req.st.db.escape(req.body.duration),
                            req.st.db.escape(req.body.isReminderEnabled),
                            req.st.db.escape(req.body.reminderDate),
                            req.st.db.escape(req.body.callType),
                            req.st.db.escape(req.body.callMethod),
                            req.st.db.escape(req.body.callDateTime),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.query.isDialer)
                        ];

                        var procQuery = 'CALL HE_save_zoomMeeting( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, questionsData) {
                            if (!err) {
                                var messagePayload = {
                                    message: questionsData[0][0].message,
                                    meetingId: questionsData[0][0].meetingId,
                                    title: questionsData[0][0].title,
                                    startDate: questionsData[0][0].startDate,
                                    members: questionsData[0][0].members,
                                    type: 91
                                };

                                if (questionsData[1] && questionsData[1][0].APNS_Id) {
                                    _Notification_aws.publish_IOS(questionsData[1][0].APNS_Id, messagePayload, 0);
                                }
                                if (questionsData[2] && questionsData[2][0].GCM_Id) {
                                    _Notification_aws.publish_Android(questionsData[2][0].GCM_Id, messagePayload);
                                }
                                if (questionsData[3] && questionsData[3][0].dialerAPNS_Id) {
                                    _Notification_aws.publish_dialer_IOS(questionsData[3][0].dialerAPNS_Id, messagePayload, 0);
                                }
                                if (questionsData[4] && questionsData[4][0].dialerGCM_Id) {
                                    _Notification_aws.publish_dialer_Android(questionsData[4][0].dialerGCM_Id, messagePayload);
                                }

                                response.status = true;
                                response.message = "Meeting request raised successfully.";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving ";
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

zoomCtrl.stopMeeting = function (req, res, next) {
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
                    if (!req.body.meetingId) {
                        error.meetingId = 'Invalid meetingId';
                        validationFlag *= false;
                    }


                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {

                        req.query.isDialer = req.query.isDialer ? req.query.isDialer : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.meetingId),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.query.isDialer)
                        ];

                        var procQuery = 'CALL HE_stop_zoomMeeting( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, questionsData) {
                            if (!err) {
                                var messagePayload = {
                                    message: questionsData[0][0].message,
                                    meetingId: req.body.meetingId,
                                    type: 92
                                };

                                if (questionsData[1] && questionsData[1][0].APNS_Id) {
                                    _Notification_aws.publish_IOS(questionsData[1][0].APNS_Id, messagePayload, 0);
                                }
                                if (questionsData[2] && questionsData[2][0].GCM_Id) {
                                    _Notification_aws.publish_Android(questionsData[2][0].GCM_Id, messagePayload);
                                }
                                if (questionsData[3] && questionsData[3][0].dialerAPNS_Id) {
                                    _Notification_aws.publish_dialer_IOS(questionsData[3][0].dialerAPNS_Id, messagePayload, 0);
                                }
                                if (questionsData[4] && questionsData[4][0].dialerGCM_Id) {
                                    _Notification_aws.publish_dialer_Android(questionsData[4][0].dialerGCM_Id, messagePayload);
                                }

                                response.status = true;
                                response.message = "Meeting stopped successfully.";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving ";
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

zoomCtrl.getMeetingList = function (req, res, next) {
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
    if (!req.query.status) {
        error.status = 'Invalid status';
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
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL HE_get_zoomMeeting( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, questionsData) {
                    if (!err && questionsData && questionsData[0]) {
                        response.status = true;
                        response.message = "Meeting list loaded successfully.";
                        response.error = null;
                        response.data = {
                            meetingList: questionsData[0]
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
                        response.message = "Meeting list loaded successfully.";
                        response.error = null;
                        response.data = {
                            meetingList: []
                        };
                        buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving ";
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

zoomCtrl.getAccessTokenVideo = function (req, res, next) {
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

    req.query.isDialer = req.query.isDialer ? req.query.isDialer : 0;

    if (!validationFlag) {
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {
                req.query.meetingId = (req.query.meetingId != undefined || req.query.meetingId != null) ? req.query.meetingId : "";
                // Create Video Grant
                identity = tokenResult[0].ezeoneId;
                var videoGrant = new VideoGrant();
                if (req.query.meetingId == "") {
                    videoGrant = new VideoGrant({
                        room: tokenResult[0].groupId
                    });
                    req.query.meetingId = tokenResult[0].groupId;
                }
                else {
                    videoGrant = new VideoGrant({
                        room: req.query.meetingId
                    });
                }

                // Create an access token which we will sign and return to the client,
                // containing the grant we just created
                const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);
                token.addGrant(videoGrant);
                token.identity = identity;

                if (token.toJwt()) {
                    response.status = true;
                    response.message = "Access token generated";
                    response.error = null;
                    console.log("access token ",token.toJwt());
                    response.data = {
                        accessToken: token.toJwt(),
                        meetingId: req.query.meetingId
                    };
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "Error while saving ";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

zoomCtrl.getAccessTokenVoice = function (req, res, next) {
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

                identity = tokenResult[0].ezeoneId;
                identity = identity.replace("@", "");
                // Create a "grant" which enables a client to use Voice as a given user
                const voiceGrant = new VoiceGrant({
                    outgoingApplicationSid: outgoingApplicationSid,
                    pushCredentialSid: pushCredSid
                });

                // Create an access token which we will sign and return to the client,
                // containing the grant we just created
                const token = new AccessToken(twilioAccountSid, voiceTwilioApiKey, voiceTwilioApiSecret);
                token.addGrant(voiceGrant);
                token.identity = identity;

                if (token.toJwt()) {
                    response.status = true;
                    response.message = "Access token generated";
                    response.error = null;
                    response.data = {
                        accessToken: token.toJwt()
                    };
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "Error while saving ";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

zoomCtrl.makeCall = function (req, res, next) {
    // The recipient of the call, a phone number or a client
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

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        var to = null;
                        to = req.body.to;
                        to = to.replace("@", "");

                        var sendercallerId = tokenResult[0].ezeoneId;
                        sendercallerId = sendercallerId.replace("@", "");

                        var voiceResponse = new VoiceResponse();

                        const dial = voiceResponse.dial({ callerId: sendercallerId });
                        dial.client(to);

                        // response.status = true;
                        // response.message = "Call generated successfully.";
                        // response.error = null;
                        // response.data = {
                        //     voiceResponse : voiceResponse.toString(),
                        //     callerId : tokenResult[0].ezeoneId,
                        //     to : req.body.to
                        // };
                        // res.status(200).json(response);
                        res.setHeader('Content-Type', "application/xml");
                        res.send(voiceResponse.toString());

                        // console.log('Response:' + voiceResponse.toString());
                        // return response.send(voiceResponse.toString());
                    }
                });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

zoomCtrl.stopMeetingForSingleUser = function (req, res, next) {
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
                    if (!req.body.meetingId) {
                        error.meetingId = 'Invalid meetingId';
                        validationFlag *= false;
                    }
                    if (!req.body.ezeoneId) {
                        error.ezeoneId = 'Invalid ezeoneId';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {

                        req.query.isDialer = req.query.isDialer ? req.query.isDialer : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.meetingId),
                            req.st.db.escape(req.body.ezeoneId),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.query.isDialer)
                        ];

                        var procQuery = 'CALL HE_stop_zoomMeeting_user( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, questionsData) {
                            if (!err) {
                                var messagePayload = {
                                    message: questionsData[0][0].message,
                                    meetingId: req.body.meetingId,
                                    type: 92
                                };

                                if (questionsData[1] && questionsData[1][0].APNS_Id) {
                                    _Notification_aws.publish_IOS(questionsData[1][0].APNS_Id, messagePayload, 0);
                                }
                                if (questionsData[2] && questionsData[2][0].GCM_Id) {
                                    _Notification_aws.publish_Android(questionsData[2][0].GCM_Id, messagePayload);
                                }
                                if (questionsData[3] && questionsData[3][0].dialerAPNS_Id) {
                                    _Notification_aws.publish_dialer_IOS(questionsData[3][0].dialerAPNS_Id, messagePayload, 0);
                                }
                                if (questionsData[4] && questionsData[4][0].dialerGCM_Id) {
                                    _Notification_aws.publish_dialer_Android(questionsData[4][0].dialerGCM_Id, messagePayload);
                                }

                                response.status = true;
                                response.message = "Meeting stopped successfully.";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving ";
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

zoomCtrl.getLatestMeetingOfUser = function (req, res, next) {
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

                req.query.isDialer = req.query.isDialer ? req.query.isDialer : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.query.isDialer)
                ];

                var procQuery = 'CALL he_get_latestMeeting( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, meetingData) {
                    if (!err && meetingData && meetingData[0]) {
                        response.status = true;
                        response.message = "Meeting data loaded successfully.";
                        response.error = null;
                        response.data = {
                            message: meetingData[0][0].message,
                            meetingId: meetingData[0][0].meetingId,
                            title: meetingData[0][0].title,
                            startDate: meetingData[0][0].startDate,
                            members: meetingData[0][0].members
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
                        response.message = "No meetings found.";
                        response.error = null;
                        response.data = null;

                        res.status(200).json(response);
                        // buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        // zlib.gzip(buf, function (_, result) {
                        //     response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                        //     res.status(200).json(response);
                        // });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting data ";
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


zoomCtrl.paceSaveZoomMeeting = function (req, res, next) {
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
    if (req.body.meetingId == undefined) {
        error.meetingId = 'Invalid meetingId';
        validationFlag *= false;
    }

    var memberList = req.body.memberList;
    if (typeof (memberList) == "string") {
        memberList = JSON.parse(memberList);
    }
    if (!memberList) {
        error.itemList = 'Invalid memberList';
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

                req.body.duration = req.body.duration != undefined ? req.body.duration : 0;
                req.body.isReminderEnabled = req.body.isReminderEnabled != undefined ? req.body.isReminderEnabled : 0;
                req.body.reminderDate = req.body.reminderDate != undefined ? req.body.reminderDate : null;
                req.body.callType = req.body.callType != undefined ? req.body.callType : 0;
                req.body.callMethod = req.body.callMethod != undefined ? req.body.callMethod : 0;
                req.body.callDateTime = req.body.callDateTime != undefined ? req.body.callDateTime : null;
                req.query.isDialer = req.query.isDialer ? req.query.isDialer : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.meetingId),
                    req.st.db.escape(JSON.stringify(memberList)),
                    req.st.db.escape(req.body.duration),
                    req.st.db.escape(req.body.isReminderEnabled),
                    req.st.db.escape(req.body.reminderDate),
                    req.st.db.escape(req.body.callType),
                    req.st.db.escape(req.body.callMethod),
                    req.st.db.escape(req.body.callDateTime),
                    req.st.db.escape(DBSecretKey),
                    req.st.db.escape(req.query.isDialer)
                ];

                var procQuery = 'CALL HE_save_zoomMeeting( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, questionsData) {
                    if (!err) {
                        var messagePayload = {
                            message: questionsData[0][0].message,
                            meetingId: questionsData[0][0].meetingId,
                            title: questionsData[0][0].title,
                            startDate: questionsData[0][0].startDate,
                            members: questionsData[0][0].members,
                            type: 91
                        };

                        if (questionsData[1] && questionsData[1][0].APNS_Id) {
                            _Notification_aws.publish_IOS(questionsData[1][0].APNS_Id, messagePayload, 0);
                        }
                        if (questionsData[2] && questionsData[2][0].GCM_Id) {
                            _Notification_aws.publish_Android(questionsData[2][0].GCM_Id, messagePayload);
                        }
                        if (questionsData[3] && questionsData[3][0].dialerAPNS_Id) {
                            _Notification_aws.publish_dialer_IOS(questionsData[3][0].dialerAPNS_Id, messagePayload, 0);
                        }
                        if (questionsData[4] && questionsData[4][0].dialerGCM_Id) {
                            _Notification_aws.publish_dialer_Android(questionsData[4][0].dialerGCM_Id, messagePayload);
                        }

                        response.status = true;
                        response.message = "Meeting request raised successfully.";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while saving ";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                });
                // }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};


zoomCtrl.paceStopMeeting = function (req, res, next) {
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
    if (!req.body.meetingId) {
        error.meetingId = 'Invalid meetingId';
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

                        req.query.isDialer = req.query.isDialer ? req.query.isDialer : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.meetingId),
                            req.st.db.escape(DBSecretKey),
                            req.st.db.escape(req.query.isDialer)
                        ];

                        var procQuery = 'CALL HE_stop_zoomMeeting( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, questionsData) {
                            if (!err) {
                                var messagePayload = {
                                    message: questionsData[0][0].message,
                                    meetingId: req.body.meetingId,
                                    type: 92
                                };

                                if (questionsData[1] && questionsData[1][0].APNS_Id) {
                                    _Notification_aws.publish_IOS(questionsData[1][0].APNS_Id, messagePayload, 0);
                                }
                                if (questionsData[2] && questionsData[2][0].GCM_Id) {
                                    _Notification_aws.publish_Android(questionsData[2][0].GCM_Id, messagePayload);
                                }
                                if (questionsData[3] && questionsData[3][0].dialerAPNS_Id) {
                                    _Notification_aws.publish_dialer_IOS(questionsData[3][0].dialerAPNS_Id, messagePayload, 0);
                                }
                                if (questionsData[4] && questionsData[4][0].dialerGCM_Id) {
                                    _Notification_aws.publish_dialer_Android(questionsData[4][0].dialerGCM_Id, messagePayload);
                                }

                                response.status = true;
                                response.message = "Meeting stopped successfully.";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving ";
                                response.error = null;
                                response.data = null;
                                res.status(500).json(response);
                            }
                        });
                    // }
                // });
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

module.exports = zoomCtrl;
