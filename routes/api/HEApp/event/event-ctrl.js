/**
 * Created by Jana1 on 01-10-2017.
 */
var eventCtrl = {};
var error = {};
var Notification_aws = require('../../../modules/notification/aws-sns-push.js');

var _Notification_aws = new Notification_aws();

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new AES_256_encryption();

var CONFIG = require('../../../../ezeone-config.json');
var DBSecretKey=CONFIG.DB.secretKey;

eventCtrl.getWhatMateBanners = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    req.query.token = req.query.token ? req.query.token : "";
    req.query.latitude = req.query.latitude ? req.query.latitude : 0;
    req.query.longitude = req.query.longitude ? req.query.longitude : 0;
    req.query.keyWords = req.query.keyWords ? req.query.keyWords : "";
    req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
    req.query.limit = (req.query.limit) ? (req.query.limit) : 100;
    var procParams = [
        req.st.db.escape(req.query.token),
        req.st.db.escape(req.query.latitude),
        req.st.db.escape(req.query.longitude),
        req.st.db.escape(req.query.keyWords),
        req.st.db.escape(req.query.pageNo),
        req.st.db.escape(req.query.limit)
    ];
    /**
     * Calling procedure to get form template
     * @type {string}
     */
    var procQuery = 'CALL wm_get_homePageData( ' + procParams.join(',') + ')';
    console.log(procQuery);
    req.db.query(procQuery, function (err, homePageData) {
        if (!err && homePageData) {
            var output = [];
            for (var i = 0; i < homePageData[0].length; i++) {
                var res1 = {};
                res1.topBannerId = homePageData[0][i].topBannerId;
                res1.title = homePageData[0][i].title;
                res1.wmId = homePageData[0][i].wmId;
                res1.landingPage = homePageData[0][i].landingPage;
                res1.type = homePageData[0][i].type;
                res1.groupId = homePageData[0][i].groupId;
                res1.banner = homePageData[0][i].banner ? (req.CONFIG.CONSTANT.GS_URL +
                    req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + homePageData[0][i].banner) : "";
                output.push(res1);
            }

            var WMoutput = [];
            if (homePageData[1]) {
                for (var j = 0; j < homePageData[1].length; j++) {
                    var res2 = {};
                    res2.wmId = homePageData[1][j].wmId;
                    res2.title = homePageData[1][j].title;
                    res2.landingPage = homePageData[1][j].landingPage;
                    res2.tileStyle = homePageData[1][j].tileStyle;
                    res2.type = homePageData[1][j].type;
                    res2.groupId = homePageData[1][j].groupId;
                    res2.banner = homePageData[1][j].banner ? (req.CONFIG.CONSTANT.GS_URL +
                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + homePageData[1][j].banner) : "";
                    WMoutput.push(res2);
                }
            }

            if (homePageData[2]) {
                for (var k = 0; k < homePageData[2].length; k++) {
                    var res3 = {};
                    res3.wmId = homePageData[2][k].wmId;
                    res3.title = homePageData[2][k].title;
                    res3.landingPage = homePageData[2][k].landingPage;
                    res3.tileStyle = homePageData[2][k].tileStyle;
                    res3.type = homePageData[2][k].type;
                    res3.groupId = homePageData[2][k].groupId;
                    res3.banner = homePageData[2][k].banner ? (req.CONFIG.CONSTANT.GS_URL +
                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + homePageData[2][k].banner) : "";
                    WMoutput.push(res3);
                }
            }
            if (homePageData[3]) {
                for (var l = 0; l < homePageData[3].length; l++) {
                    var res4 = {};
                    res4.wmId = homePageData[3][l].wmId;
                    res4.title = homePageData[3][l].title;
                    res4.landingPage = homePageData[3][l].landingPage;
                    res4.tileStyle = homePageData[3][l].tileStyle;
                    res4.type = homePageData[3][l].type;
                    res4.groupId = homePageData[3][l].groupId;
                    res4.banner = homePageData[3][l].banner ? (req.CONFIG.CONSTANT.GS_URL +
                        req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + homePageData[3][l].banner) : "";
                    WMoutput.push(res4);
                }
            }

            response.status = true;
            response.message = "Home page data loaded successfully";
            response.error = null;
            response.data = {
                homeBanners: output,
                WMList: WMoutput
            };
            res.status(200).json(response);

        }
        else if (!err) {
            response.status = true;
            response.message = "Home page data loaded successfully";
            response.error = null;
            response.data = {
                homeBanners: [],
                WMList: []
            };
            res.status(200).json(response);
        }
        else {
            response.status = false;
            response.message = "Error while getting home page data";
            response.error = null;
            response.data = null;
            res.status(500).json(response);
        }
    });

};

eventCtrl.getWMHomeData = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    req.query.WMId = req.query.WMId ? req.query.WMId : 0;

    var procParams = [
        req.st.db.escape(req.query.token),
        req.st.db.escape(req.query.WMId)
    ];
    /**
     * Calling procedure to get form template
     * @type {string}
     */
    req.st.validateToken(req.query.token, function (err, tokenResult) {
        if ((!err) && tokenResult) {
            var procQuery = 'CALL wm_get_homeEventData( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, homePageData) {
                if (!err && homePageData) {
                    var output = [];
                    if (homePageData[0]) {
                        for (var i = 0; i < homePageData[0].length; i++) {
                            var res1 = {};
                            res1.eventId = homePageData[0][i].eventId;
                            res1.eventTitle = homePageData[0][i].eventTitle;
                            res1.aboutEvent = homePageData[0][i].aboutEvent;
                            res1.startDateTime = homePageData[0][i].startDateTime;
                            res1.endDateTime = homePageData[0][i].endDateTime;
                            res1.latitude = homePageData[0][i].latitude;
                            res1.longitude = homePageData[0][i].longitude;
                            res1.address = homePageData[0][i].address;
                            res1.enquiryEmailId = homePageData[0][i].enquiryEmailId;
                            res1.sponsorshipEmailId = homePageData[0][i].sponsorshipEmailId;
                            res1.selfCheckInCode = homePageData[0][i].selfCheckInCode;
                            res1.videoDescription = homePageData[0][i].videoDescription;
                            res1.videoURL = homePageData[0][i].videoURL;
                            res1.positiveButton = homePageData[0][i].positiveButton;
                            res1.negativeButton = homePageData[0][i].negativeButton;
                            res1.selfCheckinLabel = homePageData[0][i].selfCheckinLabel;
                            res1.selfCheckinType = homePageData[0][i].selfCheckinType;
                            res1.isEventAdmin = (homePageData[2] && homePageData[2][0]) ? homePageData[2][0].isEventAdmin : 0;
                            res1.isModerator = (homePageData[2] && homePageData[2][0]) ? homePageData[2][0].isModerator : 0;
                            res1.isSpeaker = (homePageData[2] && homePageData[2][0]) ? homePageData[2][0].isSpeaker : 0;
                            res1.isUser = (homePageData[2] && homePageData[2][0]) ? homePageData[2][0].isUser : 0;
                            res1.status = (homePageData[2] && homePageData[2][0]) ? homePageData[2][0].status : 0;
                            output.push(res1);
                        }
                    }

                    var WMoutput = [];
                    if (homePageData[1]) {
                        for (var j = 0; j < homePageData[1].length; j++) {
                            var res2 = {};
                            res2.title = homePageData[1][j].title;
                            res2.name = homePageData[1][j].name;
                            res2.webSite = homePageData[1][j].webSite;
                            res2.banner = homePageData[1][j].banner ? (req.CONFIG.CONSTANT.GS_URL +
                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + homePageData[1][j].banner) : "";
                            WMoutput.push(res2);
                        }
                    }
                    response.status = true;
                    response.message = "Home page data loaded successfully";
                    response.error = null;
                    response.data = {
                        message: (homePageData[3] && homePageData[3][0]) ? homePageData[3][0].message : "",
                        eventData: output[0],
                        sponserList: WMoutput
                    };

                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                    zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                    });
                }
                else if (!err) {
                    response.status = true;
                    response.message = "Home page data loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "Error while getting home page data";
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

};

eventCtrl.getWMEventAgenda = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    req.query.WMId = req.query.WMId ? req.query.WMId : 0;
    req.query.date = (req.query.date) ? req.query.date : null;
    if (req.query.date == '') {
        req.query.date = null;
    }

    var procParams = [
        req.st.db.escape(req.query.token),
        req.st.db.escape(req.query.WMId),
        req.st.db.escape(req.query.date)
    ];
    /**
     * Calling procedure to get form template
     * @type {string}
     */
    req.st.validateToken(req.query.token, function (err, tokenResult) {
        if ((!err) && tokenResult) {
            var procQuery = 'CALL wm_get_eventAgenda( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, agendaData) {
                if (!err && agendaData && agendaData[0] && agendaData[0][0]) {
                    var output = [];
                    for (var i = 0; i < agendaData[0].length; i++) {
                        var res1 = {};
                        res1.description = agendaData[0][i].description;
                        res1.duration = agendaData[0][i].duration;
                        res1.sessionDate = agendaData[0][i].sessionDate;
                        res1.title = agendaData[0][i].title;
                        res1.venue = agendaData[0][i].venue;
                        res1.sessionId = agendaData[0][i].sessionId;
                        res1.feedback = (agendaData[0][i].feedback) ? JSON.parse(agendaData[0][i].feedback) : null;
                        output.push(res1);
                    }
                    response.status = true;
                    response.message = "Agenda data loaded successfully";
                    response.error = null;
                    response.data = {
                        agendaData: output,
                        eventDetails: {
                            startDateTime: agendaData[1][0].startDateTime,
                            endDateTime: agendaData[1][0].endDateTime,
                            eventId: agendaData[1][0].eventId,
                            status: agendaData[1][0].status,
                            dateDiff: agendaData[1][0].dateDiff
                        }
                    };
                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                    zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                    });

                }
                else if (!err) {
                    response.status = true;
                    response.message = "Agenda data loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "Error while getting agenda data ";
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

};

eventCtrl.getWMEventSpeakers = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    req.query.WMId = req.query.WMId ? req.query.WMId : 0;

    var procParams = [
        req.st.db.escape(req.query.WMId),
        req.st.db.escape(DBSecretKey)
    ];
    /**
     * Calling procedure to get form template
     * @type {string}
     */
    req.st.validateToken(req.query.token, function (err, tokenResult) {
        if ((!err) && tokenResult) {
            var procQuery = 'CALL wm_get_eventSpeakers( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, speakersData) {
                if (!err && speakersData && speakersData[0] && speakersData[0][0]) {
                    var output = [];
                    for (var i = 0; i < speakersData[0].length; i++) {
                        var res1 = {};
                        res1.jobTitle = speakersData[0][i].jobTitle;
                        res1.name = speakersData[0][i].name;
                        res1.companyName = speakersData[0][i].CompanyName;
                        res1.userMasterId = speakersData[0][i].userMasterId;
                        res1.picture = speakersData[0][i].picture ? (req.CONFIG.CONSTANT.GS_URL +
                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + speakersData[0][i].picture) : "";
                        output.push(res1);
                    }
                    response.status = true;
                    response.message = "speakers data loaded successfully";
                    response.error = null;
                    response.data = {
                        speakerList: output
                    };
                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                    zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                    });

                }
                else if (!err) {
                    response.status = true;
                    response.message = "speakers data loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "Error while getting speakers data ";
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

};

eventCtrl.getWMEventModerator = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    req.query.WMId = req.query.WMId ? req.query.WMId : 0;
    req.st.validateToken(req.query.token, function (err, tokenResult) {
        if ((!err) && tokenResult) {
            var procParams = [
                req.st.db.escape(req.query.WMId),
                req.st.db.escape(DBSecretKey)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL wm_get_eventModerator( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery, function (err, moderatorData) {
                if (!err && moderatorData && moderatorData[0] && moderatorData[0][0]) {
                    var output = [];
                    for (var i = 0; i < moderatorData[0].length; i++) {
                        var res1 = {};
                        res1.jobTitle = moderatorData[0][i].jobTitle;
                        res1.name = moderatorData[0][i].name;
                        res1.companyName = moderatorData[0][i].CompanyName;
                        res1.picture = moderatorData[0][i].banner ? (req.CONFIG.CONSTANT.GS_URL +
                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + moderatorData[0][i].picture) : "";
                        output.push(res1);
                    }
                    response.status = true;
                    response.message = "Moderator data loaded successfully";
                    response.error = null;
                    response.data = {
                        speakerList: output
                    };

                    var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                    zlib.gzip(buf, function (_, result) {
                        response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                        res.status(200).json(response);
                    });

                }
                else if (!err) {
                    response.status = true;
                    response.message = "Moderator data loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "Error while getting moderator data ";
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

};

eventCtrl.getWMEventQuestions = function (req, res, next) {
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
    if (!req.query.sessionId) {
        error.sessionId = 'Invalid sessionId';
        validationFlag *= false;
    }

    if (!req.query.eventId) {
        error.eventId = 'Invalid eventId';
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
                    req.st.db.escape(req.query.sessionId),
                    req.st.db.escape(req.query.eventId),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_get_event_questions( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, questionsData) {
                    if (!err && questionsData && questionsData[0] && questionsData[0][0]) {
                        var output = [];
                        for (var i = 0; i < questionsData[0].length; i++) {
                            var res1 = {};
                            res1.questionId = questionsData[0][i].questionId;
                            res1.question = questionsData[0][i].question;
                            res1.createdDate = questionsData[0][i].createdDate;
                            res1.name = questionsData[0][i].name;
                            res1.status = questionsData[0][i].status;
                            res1.replyStatus = questionsData[0][i].replyStatus;
                            res1.answer = (questionsData[0] && questionsData[0][i] && questionsData[0][i].answer) ? JSON.parse(questionsData[0][i].answer) : [];
                            output.push(res1);
                        }
                        response.status = true;
                        response.message = "Questions loaded successfully";
                        response.error = null;
                        response.data = {
                            isEventAdmin: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].isEventAdmin : 0,
                            isModerator: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].isModerator : 0,
                            isSpeaker: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].isSpeaker : 0,
                            isUser: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].isUser : 0,
                            userStatus: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].userStatus : 0,
                            questionLimit: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].questionLimit : 0,
                            askedQuestionCount: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].askedQuestionCount : 0,
                            questions: output
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Questions loaded successfully";
                        response.error = null;
                        response.data = {
                            isEventAdmin: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].isEventAdmin : 0,
                            isModerator: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].isModerator : 0,
                            isSpeaker: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].isSpeaker : 0,
                            isUser: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].isUser : 0,
                            userStatus: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].userStatus : 0,
                            questionLimit: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].questionLimit : 0,
                            askedQuestionCount: (questionsData && questionsData[1] && questionsData[1][0]) ? questionsData[1][0].askedQuestionCount : 0,
                            questions: []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting questions ";
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

eventCtrl.saveEventQuestions = function (req, res, next) {
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

                    if (!req.body.sessionId) {
                        error.sessionId = 'Invalid sessionId';
                        validationFlag *= false;
                    }
                
                    if (!req.body.eventId) {
                        error.eventId = 'Invalid eventId';
                        validationFlag *= false;
                    }
                    if (!req.body.question) {
                        error.question = 'Invalid question';
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
                            req.st.db.escape(req.body.eventId),
                            req.st.db.escape(req.body.sessionId),
                            req.st.db.escape(req.body.question)
                        ];
        
                        var procQuery = 'CALL wm_save_session_question( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, questionsData) {
                            if (!err && questionsData && questionsData[0] && questionsData[0][0] && questionsData[0][0].message) {
                                response.status = false;
                                response.message = "Access denied";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err) {
                                var messagePayload = {
                                    message: questionsData[0][0].question,
                                    type: 71,
                                    alarmType: 4
                                };
        
                                if (questionsData[1][0].APNS_Id) {
                                    _Notification_aws.publish_IOS(questionsData[1][0].APNS_Id, messagePayload, 0);
                                }
                                if (questionsData[2][0].GCM_Id) {
                                    _Notification_aws.publish_Android(questionsData[2][0].GCM_Id, messagePayload);
                                }
        
                                response.status = true;
                                response.message = "Question saved successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving questions ";
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

eventCtrl.saveEventAnswer = function (req, res, next) {
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
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                   
                    if (!req.body.questionId) {
                        error.questionId = 'Invalid questionId';
                        validationFlag *= false;
                    }
                
                    if (!req.body.eventId) {
                        error.eventId = 'Invalid eventId';
                        validationFlag *= false;
                    }
                    if (!req.body.answer) {
                        error.answer = 'Invalid answer';
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
                            req.st.db.escape(req.body.eventId),
                            req.st.db.escape(req.body.questionId),
                            req.st.db.escape(req.body.answer)
                        ];
        
                        var procQuery = 'CALL wm_save_session_answer( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, answerData) {
                            if (!err && answerData && answerData[0] && answerData[0][0] && answerData[0][0].message) {
                                response.status = false;
                                response.message = "Access denied";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err) {
                                response.status = true;
                                response.message = "Answer saved successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving answer ";
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

eventCtrl.changeQuestionStatus = function (req, res, next) {
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
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                });
                if (!req.body.questionId) {
                    error.questionId = 'Invalid questionId';
                    validationFlag *= false;
                }
            
                if (!req.body.eventId) {
                    error.eventId = 'Invalid eventId';
                    validationFlag *= false;
                }
                if (!req.body.status) {
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
                    req.body.notes = req.body.notes ? req.body.notes : "";
                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.eventId),
                        req.st.db.escape(req.body.questionId),
                        req.st.db.escape(req.body.status),
                        req.st.db.escape(req.body.notes)
                    ];
    
                    var procQuery = 'CALL wm_save_question_changeStatus( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, questionData) {
                        if (!err && questionData && questionData[0] && questionData[0][0] && questionData[0][0].message) {
                            response.status = false;
                            response.message = "Access denied";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }
                        else if (!err) {
                            if (questionData && questionData[0] && questionData[0][0]) {
                                var messagePayload = {
                                    message: (questionData[0][0].question) ? questionData[0][0].question : "",
                                    type: 71,
                                    alarmType: 4
                                };
    
                                if (questionData[1] && questionData[1][0] && questionData[1][0].APNS_Id) {
                                    _Notification_aws.publish_IOS(questionData[1][0].APNS_Id, messagePayload, 0);
                                }
                                if (questionData[2] && questionData[2][0] && questionData[2][0].GCM_Id) {
                                    _Notification_aws.publish_Android(questionData[2][0].GCM_Id, messagePayload);
                                }
                            }
                            response.status = true;
                            response.message = "Status changed successfully";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while saving status";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }
            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

eventCtrl.getWMEventUsers = function (req, res, next) {
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

    if (!req.query.WMId) {
        error.WMId = 'Invalid WMId';
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
                req.query.status = (req.query.status != undefined) ? req.query.status : "0,1,2,3";

                req.query.isSpeaker = (req.query.isSpeaker != undefined) ? req.query.isSpeaker : 1;
                req.query.isUser = (req.query.isUser != undefined) ? req.query.isUser : 1;
                req.query.isModerator = (req.query.isModerator != undefined) ? req.query.isModerator : 1;
                req.query.isEventAdmin = (req.query.isEventAdmin != undefined) ? req.query.isEventAdmin : 1;

                if ((req.query.isSpeaker == 0 && req.query.isUser == 0 && req.query.isModerator == 0 && req.query.isEventAdmin == 0) || req.query.status == "") {
                    response.status = true;
                    response.message = "No users found";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else {
                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.WMId),
                        req.st.db.escape(req.query.keywords),
                        req.st.db.escape(req.query.isSpeaker),
                        req.st.db.escape(req.query.isUser),
                        req.st.db.escape(req.query.isModerator),
                        req.st.db.escape(req.query.isEventAdmin),
                        req.st.db.escape(req.query.status),
                        req.st.db.escape(DBSecretKey)
                    ];

                    var procQuery = 'CALL wm_get_app_event_users( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery, function (err, userData) {
                        if (!err && userData && userData[0] && userData[0][0]) {
                            var output = [];
                            for (var i = 0; i < userData[0].length; i++) {
                                var res1 = {};
                                res1.eventUserId = userData[0][i].eventUserId;
                                res1.isEventAdmin = userData[0][i].isEventAdmin;
                                res1.isModerator = userData[0][i].isModerator;
                                res1.isSpeaker = userData[0][i].isSpeaker;
                                res1.isUser = userData[0][i].isUser;
                                res1.status = userData[0][i].status;
                                res1.displayName = userData[0][i].displayName;
                                res1.userMasterId = userData[0][i].userMasterId;
                                res1.statusHistory = (userData[0] && userData[0][i] && userData[0][i].statusHistory) ? JSON.parse(userData[0][i].statusHistory) : [];
                                output.push(res1);
                            }
                            response.status = true;
                            response.message = "Users loaded successfully";
                            response.error = null;
                            response.data = {
                                eventId: userData[1][0].eventId,
                                userList: output
                            };
                            var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                                res.status(200).json(response);
                            });

                        }
                        else if (!err) {
                            response.status = true;
                            response.message = "No users found";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }
                        else {
                            response.status = false;
                            response.message = "Error while getting users ";
                            response.error = null;
                            response.data = null;
                            res.status(500).json(response);
                        }
                    });
                }

            }
            else {
                res.status(401).json(response);
            }
        });
    }
};

eventCtrl.changeUserStatus = function (req, res, next) {
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
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));

                    if (!req.body.eventId) {
                        error.eventId = 'Invalid eventId';
                        validationFlag *= false;
                    }
                    if (!req.body.eventUserId) {
                        error.eventUserId = 'Invalid eventUserId';
                        validationFlag *= false;
                    }
                    if (!req.body.status) {
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
                        req.body.notes = req.body.notes ? req.body.notes : "";

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.eventUserId),
                            req.st.db.escape(req.body.eventId),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.notes)
                        ];
        
                        var procQuery = 'CALL wm_save_eventUser_status( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, userData) {
                            if (!err && userData && userData[0] && userData[0][0] && userData[0][0].message) {
                                response.status = false;
                                response.message = "Access denied";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err) {
                                response.status = true;
                                response.message = "User status updated successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while updating user status";
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

eventCtrl.saveEventMessage = function (req, res, next) {
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
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.eventId) {
                        error.eventId = 'Invalid eventId';
                        validationFlag *= false;
                    }
                    if (!req.body.message) {
                        error.message = 'Invalid message';
                        validationFlag *= false;
                    }
                
                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.messageId = req.body.messageId ? req.body.messageId : 0;
                        req.body.users = req.body.users ? req.body.users.toString() : "";
                        req.body.userCount = req.body.userCount ? req.body.userCount : 0;
        
                        req.body.isSpeaker = req.body.isSpeaker ? req.body.isSpeaker : 0;
                        req.body.isUser = req.body.isUser ? req.body.isUser : 0;
                        req.body.isModerator = req.body.isModerator ? req.body.isModerator : 0;
                        req.body.isEventAdmin = req.body.isEventAdmin ? req.body.isEventAdmin : 0;
                        req.body.isSelectAll = req.body.isSelectAll ? req.body.isSelectAll : 0;
                        req.body.alarmType = req.body.alarmType ? req.body.alarmType : 1;
                        req.body.status = req.body.status ? req.body.status : "";
        
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.eventId),
                            req.st.db.escape(req.body.message),
                            req.st.db.escape(req.body.users),
                            req.st.db.escape(req.body.userCount),
                            req.st.db.escape(req.body.messageId),
                            req.st.db.escape(req.body.isSpeaker),
                            req.st.db.escape(req.body.isUser),
                            req.st.db.escape(req.body.isModerator),
                            req.st.db.escape(req.body.isEventAdmin),
                            req.st.db.escape(req.body.status),
                            req.st.db.escape(req.body.isSelectAll),
                            req.st.db.escape(req.body.alarmType)
                        ];
        
                        var procQuery = 'CALL wm_save_event_message( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, messageData) {
                            if (!err && messageData && messageData[0] && messageData[0][0] && messageData[0][0].error) {
                                response.status = false;
                                response.message = "Access denied";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err && messageData && messageData[0] && messageData[0][0]) {
                                response.status = true;
                                response.message = "Message saved successfully";
                                response.error = null;
                                response.data = {
                                    messageId: messageData[0][0].messageId,
                                    message: messageData[0][0].message,
                                    userCount: messageData[0][0].userCount
                                };
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while saving message ";
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

eventCtrl.getEventMessage = function (req, res, next) {
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

    if (!req.query.eventId) {
        error.eventId = 'Invalid eventId';
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
                    req.st.db.escape(req.query.eventId)
                ];

                var procQuery = 'CALL wm_get_event_message( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, messageData) {
                    if (!err && messageData && messageData[0] && messageData[0][0] && messageData[0][0].error) {
                        response.status = false;
                        response.message = "Access denied";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Messages loaded successfully";
                        response.error = null;
                        response.data = {
                            messageList: (messageData && messageData[0] && messageData[0][0]) ? messageData[0] : []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading messages ";
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

eventCtrl.sendEventMessage = function (req, res, next) {
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
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.eventId) {
                        error.eventId = 'Invalid eventId';
                        validationFlag *= false;
                    }
                    if (!req.body.messageId) {
                        error.messageId = 'Invalid messageId';
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
                            req.st.db.escape(req.body.eventId),
                            req.st.db.escape(req.body.messageId)
                        ];
        
                        var procQuery = 'CALL wm_send_event_message( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, sendMessageData) {
                            if (!err && sendMessageData && sendMessageData[0] && sendMessageData[0][0] && sendMessageData[0][0].error) {
                                response.status = false;
                                response.message = "Access denied";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err && sendMessageData && sendMessageData[0]) {
                                console.log("sendMessageData[2][0].alarmType", sendMessageData[2][0].alarmType);
                                var alarmType = (sendMessageData && sendMessageData[2] && sendMessageData[2][0]) ? sendMessageData[2][0].alarmType : 1;
                                var messagePayload = {
                                    message: (sendMessageData && sendMessageData[0] && sendMessageData[0][0]) ? sendMessageData[0][0].message : "",
                                    type: 72,
                                    eventTitle: (sendMessageData && sendMessageData[2] && sendMessageData[2][0]) ? sendMessageData[2][0].eventTitle : "",
                                    alarmType: alarmType
                                };
        
                                if (sendMessageData && sendMessageData[0] && sendMessageData[0][0] && sendMessageData[0][0].APNS_Id) {
                                    _Notification_aws.publish_IOS(sendMessageData[0][0].APNS_Id, messagePayload, 0);
                                }
                                if (sendMessageData && sendMessageData[1] && sendMessageData[1][0] && sendMessageData[1][0].GCM_Id) {
                                    _Notification_aws.publish_Android(sendMessageData[1][0].GCM_Id, messagePayload);
                                }
                                response.status = true;
                                response.message = "Message sent successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while sending message ";
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

eventCtrl.getEventMessageLog = function (req, res, next) {
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

    if (!req.query.eventId) {
        error.eventId = 'Invalid eventId';
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
                    req.st.db.escape(req.query.eventId),
                    req.st.db.escape(DBSecretKey)
                ];

                var procQuery = 'CALL wm_get_event_messageLog( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, messageData) {
                    if (!err && messageData && messageData[0] && messageData[0][0] && messageData[0][0].error) {
                        response.status = false;
                        response.message = "Access denied";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Messages loaded successfully";
                        response.error = null;
                        response.data = {
                            messageLogList: (messageData && messageData[0] && messageData[0][0]) ? messageData[0] : []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else {
                        response.status = false;
                        response.message = "Error while loading messages ";
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

eventCtrl.deleteEventMessage = function (req, res, next) {
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

    if (!req.query.eventId) {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }

    if (!req.query.messageId) {
        error.messageId = 'Invalid messageId';
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
                    req.st.db.escape(req.query.eventId),
                    req.st.db.escape(req.query.messageId)
                ];

                var procQuery = 'CALL wm_delete_event_message( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, messageData) {
                    if (!err && messageData && messageData[0] && messageData[0][0] && messageData[0][0].error) {
                        switch (messageData[0][0].error) {
                            case 'ACCESS_DENIED':
                                response.status = false;
                                response.message = "Access denied";
                                response.error = null;
                                res.status(200).json(response);
                                break;
                            case 'MESSAGE_SENT':
                                response.status = false;
                                response.message = "Message can't be deleted.";
                                response.error = null;
                                res.status(200).json(response);
                                break;

                            default:
                                break;
                        }

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Message deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while deleting messages ";
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

eventCtrl.saveSessionFeedback = function (req, res, next) {
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
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.eventId) {
                        error.eventId = 'Invalid eventId';
                        validationFlag *= false;
                    }
                
                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.rating = req.body.rating ? req.body.rating : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.eventId),
                            req.st.db.escape(req.body.sessionId),
                            req.st.db.escape(req.body.rating),
                            req.st.db.escape(req.body.feedback)
                        ];
        
                        var procQuery = 'CALL wm_save_session_feedback( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, feedbackData) {
                            if (!err && feedbackData && feedbackData[0] && feedbackData[0][0] && feedbackData[0][0].error) {
                                response.status = false;
                                response.message = "Access denied";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err) {
                                response.status = true;
                                response.message = "Feedback submitted successfully";
                                response.error = null;
                                response.data = {
                                    rating: (feedbackData[0] && feedbackData[0][0] && feedbackData[0][0].rating) ? feedbackData[0][0].rating : 0,
                                    feedback: (feedbackData[0] && feedbackData[0][0] && feedbackData[0][0].feedback) ? feedbackData[0][0].feedback : "",
                                    createdDate: (feedbackData[0] && feedbackData[0][0] && feedbackData[0][0].createdDate) ? feedbackData[0][0].createdDate : ""
                                };
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while giving feedback ";
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

eventCtrl.getJoinSearch = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
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
        req.st.validateToken(req.query.token, function (err, tokenResult) {
            if ((!err) && tokenResult) {

                req.query.token = req.query.token ? req.query.token : "";
                req.query.latitude = req.query.latitude ? req.query.latitude : 0;
                req.query.longitude = req.query.longitude ? req.query.longitude : 0;
                req.query.keyWords = req.query.keyWords ? req.query.keyWords : "";
                req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo) : 1;
                req.query.limit = (req.query.limit) ? (req.query.limit) : 100;
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.latitude),
                    req.st.db.escape(req.query.longitude),
                    req.st.db.escape(req.query.keyWords),
                    req.st.db.escape(req.query.pageNo),
                    req.st.db.escape(req.query.limit)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_joinSearch( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, homePageData) {
                    if (!err && homePageData) {

                        var WMoutput = [];
                        if (homePageData[0]) {
                            for (var j = 0; j < homePageData[0].length; j++) {
                                var res2 = {};
                                res2.wmId = homePageData[0][j].wmId;
                                res2.title = homePageData[0][j].title;
                                res2.landingPage = homePageData[0][j].landingPage;
                                res2.type = homePageData[0][j].type;
                                res2.tileStyle = homePageData[0][j].tileStyle;
                                res2.banner = homePageData[0][j].banner ? (req.CONFIG.CONSTANT.GS_URL +
                                    req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + homePageData[0][j].banner) : "";
                                WMoutput.push(res2);
                            }
                        }

                        var output = [];
                        if (homePageData[1]) {
                            for (var k = 0; k < homePageData[1].length; k++) {
                                var res3 = {};
                                res3.wmId = homePageData[1][k].wmId;
                                res3.title = homePageData[1][k].title;
                                res3.landingPage = homePageData[1][k].landingPage;
                                res3.type = homePageData[1][k].type;
                                res3.tileStyle = homePageData[1][k].tileStyle;
                                res3.banner = homePageData[1][k].banner ? (req.CONFIG.CONSTANT.GS_URL +
                                    req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + homePageData[1][k].banner) : "";
                                output.push(res3);
                            }
                        }

                        response.status = true;
                        response.message = "Home page data loaded successfully";
                        response.error = null;
                        response.data = {
                            joinedList: WMoutput,
                            WMList: output
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Home page data loaded successfully";
                        response.error = null;
                        response.data = {
                            joinedList: [],
                            WMList: []
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting home page data";
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

eventCtrl.getStatusOfWMList = function (req, res, next) {
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

    if (!req.query.WMId) {
        error.WMId = 'Invalid WMId';
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
                    req.st.db.escape(req.query.WMId),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */

                var procQuery = 'CALL wm_get_statusOfWMList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, homePageData) {
                    if (!err && homePageData && homePageData[0] && homePageData[0][0]) {

                        if (homePageData[0][0].trackTemplateDetails) {
                            for (var i = 0; i < homePageData[0].length; i++) {
                                homePageData[0][i].trackTemplateDetails = (homePageData[0][i].trackTemplateDetails) ? JSON.parse(homePageData[0][i].trackTemplateDetails) : [];
                            }
                        }

                        response.status = true;
                        response.message = "Details loaded successfully";
                        response.error = null;
                        response.data = {
                            details: homePageData[0][0]
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Details loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting details";
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

eventCtrl.joinEvent = function (req, res, next) {
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
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.WMId) {
                        error.WMId = 'Invalid WMId';
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
                            req.st.db.escape(req.body.WMId)
                        ];
                        /**
                         * Calling procedure to get form template
                         * @type {string}
                         */
                        var procQuery = 'CALL wm_join_event( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, eventData) {
                            if (!err && eventData && eventData[0] && eventData[0][0] && eventData[0][0].eventUserId) {
                                response.status = true;
                                response.message = "Joined successfully";
                                response.error = null;
                                response.data = {
                                    eventUserId: eventData[0][0].eventUserId
                                };
                                res.status(200).json(response);
        
                            }
                            else if (!err && eventData && eventData[0] && eventData[0][0] && eventData[0][0].error) {
                                response.status = true;
                                response.message = "Already joined";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err) {
                                response.status = true;
                                response.message = "Not joined";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while joining event";
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

eventCtrl.changeUserStatus = function (req, res, next) {
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

    if (!req.body.eventId) {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }
    if (!req.body.eventUserId) {
        error.eventUserId = 'Invalid eventUserId';
        validationFlag *= false;
    }
    if (!req.body.status) {
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
                req.body.notes = req.body.notes ? req.body.notes : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.eventUserId),
                    req.st.db.escape(req.body.eventId),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.notes)
                ];

                var procQuery = 'CALL wm_save_eventUser_status( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, userData) {
                    if (!err && userData && userData[0] && userData[0][0] && userData[0][0].message) {
                        response.status = false;
                        response.message = "Access denied";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else if (!err && userData && userData[0] && userData[0][0]) {
                        var message = "";
                        if (req.body.status == 1) {
                            message = "Congratulations. Now you are Checked-IN";
                        }
                        else if (req.body.status == 2) {
                            message = "You are Checked-OUT. Thank you for your participation.";
                        }
                        else if (req.body.status == 3) {
                            message = "You are dropped from this event. Thank you for your participation.";
                        }
                        else if (req.body.status == 0) {
                            message = "You are registered with this event.";
                        }

                        var messagePayload = {
                            message: message,
                            type: 74,
                            eventTitle: (userData && userData[2] && userData[2][0]) ? userData[2][0].eventTitle : "",
                            alarmType: 0
                        };

                        if (userData && userData[0] && userData[0][0] && userData[0][0].APNS_Id) {
                            _Notification_aws.publish_IOS(userData[0][0].APNS_Id, messagePayload, 0);
                        }
                        if (userData && userData[1] && userData[1][0] && userData[1][0].GCM_Id) {
                            _Notification_aws.publish_Android(userData[1][0].GCM_Id, messagePayload);
                        }

                        response.status = true;
                        response.message = "User status updated successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while updating user status";
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

eventCtrl.selfCheckIn = function (req, res, next) {
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
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.eventId) {
                        error.eventId = 'Invalid eventId';
                        validationFlag *= false;
                    }
                    if (!req.body.selfCheckInCode) {
                        error.selfCheckInCode = 'Invalid selfCheckInCode';
                        validationFlag *= false;
                    }
                
                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.notes = req.body.notes ? req.body.notes : "";

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.eventId),
                            req.st.db.escape(req.body.selfCheckInCode)
                        ];
        
                        var procQuery = 'CALL wm_save_event_selfCheckin( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, userData) {
                            if (!err && userData && userData[0] && userData[0][0] && userData[0][0].error) {
                                response.status = false;
                                response.message = "Invalid Check-IN Code. Try again..";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err) {
                                response.status = true;
                                response.message = "Check-IN successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while checkIN";
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

eventCtrl.getWMEventSpeakerDetails = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.userMasterId) {
        error.userMasterId = 'Invalid userMasterId';
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
                    req.st.db.escape(req.query.userMasterId),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL wm_get_eventSpeaker_details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, speakersData) {
                    if (!err && speakersData && speakersData[0] && speakersData[0][0]) {

                        response.status = true;
                        response.message = "speakers data loaded successfully";
                        response.error = null;
                        response.data = {
                            jobTitle: speakersData[0][0].jobTitle,
                            name: speakersData[0][0].name,
                            companyName: speakersData[0][0].CompanyName,
                            userMasterId: speakersData[0][0].userMasterId,
                            about: speakersData[0][0].about,
                            picture: speakersData[0][0].picture ? (req.CONFIG.CONSTANT.GS_URL +
                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + speakersData[0][0].picture) : ""
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "speakers data loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting speakers data ";
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

eventCtrl.getWMEventAgendaDetails = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.eventId) {
        error.eventId = 'Invalid eventId';
        validationFlag *= false;
    }
    if (!req.query.sessionId) {
        error.sessionId = 'Invalid sessionId';
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
                    req.st.db.escape(req.query.eventId),
                    req.st.db.escape(req.query.sessionId),
                    req.st.db.escape(DBSecretKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */

                var procQuery = 'CALL wm_get_eventAgenda_details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, agendaData) {
                    if (!err && agendaData && agendaData[0] && agendaData[0][0]) {
                        var output = [];
                        for (var i = 0; i < agendaData[2].length; i++) {
                            var res1 = {};
                            res1.jobTitle = agendaData[2][i].jobTitle;
                            res1.name = agendaData[2][i].name;
                            res1.companyName = agendaData[2][i].companyName;
                            res1.userMasterId = agendaData[2][i].userMasterId;
                            res1.picture = agendaData[2][i].picture ? (req.CONFIG.CONSTANT.GS_URL +
                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + agendaData[2][i].picture) : "";
                            output.push(res1);
                        }
                        response.status = true;
                        response.message = "Agenda details loaded successfully";
                        response.error = null;
                        response.data = {
                            status: agendaData[0][0].status,
                            agendaData: agendaData[1][0],
                            feedback: agendaData[3][0],
                            speakerList: output
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Agenda details loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting agenda data ";
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

eventCtrl.saveFeedbackMessage = function (req, res, next) {
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
                var decryptBuf = encryption.decrypt1((req.body.data),tokenResult[0].secretKey);
                zlib.unzip(decryptBuf, function (_, resultDecrypt) {
                    req.body = JSON.parse(resultDecrypt.toString('utf-8'));
                    if (!req.body.eventId) {
                        error.eventId = 'Invalid eventId';
                        validationFlag *= false;
                    }
                    if (!req.body.title) {
                        error.title = 'Invalid title';
                        validationFlag *= false;
                    }
                    if (!req.body.message) {
                        error.message = 'Invalid message';
                        validationFlag *= false;
                    }
                
                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.sendNotification = (req.body.sendNotification != undefined) ? req.body.sendNotification : 0;

                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.eventId),
                            req.st.db.escape(req.body.title),
                            req.st.db.escape(req.body.message),
                            req.st.db.escape(req.body.sendNotification)
                        ];
        
                        var procQuery = 'CALL wm_save_event_notification_message( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, messageData) {
                            if (!err && messageData && messageData[0] && messageData[0][0] && messageData[0][0].error) {
                                response.status = false;
                                response.message = "Access denied.";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err && messageData && messageData[0] && messageData[0][0] && messageData[0][0].title) {
                                if (req.body.sendNotification == 1) {
                                    var messagePayload = {
                                        title: messageData[0][0].title,
                                        message: messageData[0][0].message,
                                        eventTitle: messageData[0][0].eventTitle,
                                        type: 73,
                                        alarmType: 1,
                                        eventId: req.body.eventId
                                    };
        
                                    if (messageData[1][0].APNS_Id) {
                                        _Notification_aws.publish_IOS(messageData[1][0].APNS_Id, messagePayload, 0);
                                    }
                                    if (messageData[2][0].GCM_Id) {
                                        _Notification_aws.publish_Android(messageData[2][0].GCM_Id, messagePayload);
                                    }
                                }
                                response.status = true;
                                response.message = "Notification message saved successfully.";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err) {
                                response.status = true;
                                response.message = "Notification message saved successfully.";
                                response.error = null;
                                response.data = null;
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

eventCtrl.getFeedbackMessage = function (req, res, next) {
    var response = {
        status: false,
        message: "Invalid token",
        data: null,
        error: null
    };
    var validationFlag = true;

    if (!req.query.eventId) {
        error.eventId = 'Invalid eventId';
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
                    req.st.db.escape(req.query.eventId)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */

                var procQuery = 'CALL wm_get_event_feedbackMessage( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, feedbackData) {
                    if (!err && feedbackData && feedbackData[0] && feedbackData[0][0]) {
                        response.status = true;
                        response.message = "Event feedback data loaded successfully";
                        response.error = null;
                        response.data = {
                            title: feedbackData[0][0].title,
                            message: feedbackData[0][0].message,
                            userCount: feedbackData[0][0].userCount
                        };
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result, tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Event feedback data loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else {
                        response.status = false;
                        response.message = "Error while getting feedback data ";
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

eventCtrl.updateReplyStatus = function (req, res, next) {
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
                    if (!req.body.eventId) {
                        error.eventId = 'Invalid eventId';
                        validationFlag *= false;
                    }
                    if (!req.body.questionId) {
                        error.questionId = 'Invalid questionId';
                        validationFlag *= false;
                    }
                    if (req.body.replyStatus == undefined) {
                        error.replyStatus = 'Invalid replyStatus';
                        validationFlag *= false;
                    }

                    if (!validationFlag) {
                        response.error = error;
                        response.message = 'Please check the errors';
                        res.status(400).json(response);
                        console.log(response);
                    }
                    else {
                        req.body.isModerator = (req.body.isModerator != undefined) ? req.body.isModerator : 0;
                        req.body.isSpeaker = (req.body.isSpeaker != undefined) ? req.body.isSpeaker : 0;
                        var procParams = [
                            req.st.db.escape(req.query.token),
                            req.st.db.escape(req.body.eventId),
                            req.st.db.escape(req.body.questionId),
                            req.st.db.escape(req.body.replyStatus),
                            req.st.db.escape(req.body.isSpeaker),
                            req.st.db.escape(req.body.isModerator)
                        ];

                        var procQuery = 'CALL wm_save_event_question_replyStatus( ' + procParams.join(',') + ')';
                        console.log(procQuery);
                        req.db.query(procQuery, function (err, userData) {
                            if (!err && userData && userData[0] && userData[0][0] && userData[0][0].message) {
                                response.status = false;
                                response.message = "Access denied";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else if (!err && userData && userData[0] && userData[0][0]) {

                                var messagePayload = {
                                    message: "Replied to question",
                                    type: 75,
                                    alarmType: 4
                                };

                                if (userData && userData[0] && userData[0][0] && userData[0][0].APNS_Id) {
                                    _Notification_aws.publish_IOS(userData[0][0].APNS_Id, messagePayload, 0);
                                }
                                if (userData && userData[1] && userData[1][0] && userData[1][0].GCM_Id) {
                                    _Notification_aws.publish_Android(userData[1][0].GCM_Id, messagePayload);
                                }

                                response.status = true;
                                response.message = "Replied successfully";
                                response.error = null;
                                response.data = null;
                                res.status(200).json(response);
                            }
                            else {
                                response.status = false;
                                response.message = "Error while replaying to question";
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

module.exports = eventCtrl;
