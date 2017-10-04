/**
 * Created by Jana1 on 01-10-2017.
 */

var eventCtrl = {};
var error = {};

eventCtrl.getWhatMateBanners = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    req.query.token = req.query.token ? req.query.token : "";
    req.query.latitude = req.query.latitude ? req.query.latitude : 0;
    req.query.longitude = req.query.longitude ? req.query.longitude : 0;
    req.query.keyWords = req.query.keyWords ? req.query.keyWords : "";
    req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
    req.query.limit = (req.query.limit) ? (req.query.limit):100;
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
            req.db.query(procQuery,function(err,homePageData){
                if(!err && homePageData){
                    var output = [];
                    for(var i = 0; i < homePageData[0].length; i++) {
                        var res1 = {};
                        res1.topBannerId = homePageData[0][i].topBannerId;
                        res1.title = homePageData[0][i].title;
                        res1.wmId = homePageData[0][i].wmId;
                        res1.banner = homePageData[0][i].banner ? (req.CONFIG.CONSTANT.GS_URL +
                            req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + homePageData[0][i].banner) : "";
                        output.push(res1);
                    }

                    var WMoutput = [];
                    if (homePageData[1]){
                        for(var j = 0; j < homePageData[1].length; j++) {
                            var res2 = {};
                            res2.wmId = homePageData[1][j].wmId;
                            res2.title = homePageData[1][j].title;
                            res2.landingPage = homePageData[1][j].landingPage;
                            res2.banner = homePageData[1][j].banner ? (req.CONFIG.CONSTANT.GS_URL +
                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + homePageData[1][j].banner) : "";
                            WMoutput.push(res2);
                        }
                    }

                    if (homePageData[2]){
                        for(var k = 0; k < homePageData[2].length; k++) {
                            var res3 = {};
                            res3.wmId = homePageData[2][k].wmId;
                            res3.title = homePageData[2][k].title;
                            res3.landingPage = homePageData[2][k].landingPage;
                            res3.banner = homePageData[2][k].banner ? (req.CONFIG.CONSTANT.GS_URL +
                                req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + homePageData[2][k].banner) : "";
                            WMoutput.push(res3);
                        }
                    }

                    response.status = true;
                    response.message = "Home page data loaded successfully";
                    response.error = null;
                    response.data = {
                        homeBanners : output,
                        WMList : WMoutput
                    };
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Home page data loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting home page data";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });

};

eventCtrl.getWMHomeData = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
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
    var procQuery = 'CALL wm_get_homeEventData( ' + procParams.join(',') + ')';
    console.log(procQuery);
    req.db.query(procQuery,function(err,homePageData){
        if(!err && homePageData){
            var output = [];
            if (homePageData[0]){
                for(var i = 0; i < homePageData[0].length; i++) {
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
                    res1.isEventAdmin = (homePageData[2] && homePageData[2][0]) ? homePageData[2][0].isEventAdmin : 0;
                    res1.isModerator = (homePageData[2] && homePageData[2][0]) ? homePageData[2][0].isModerator : 0;
                    res1.isSpeaker = (homePageData[2] && homePageData[2][0]) ? homePageData[2][0].isSpeaker : 0;
                    res1.isUser = (homePageData[2] && homePageData[2][0]) ? homePageData[2][0].isUser : 0;
                    output.push(res1);
                }
            }

            var WMoutput = [];
            if (homePageData[1]){
                for(var j = 0; j < homePageData[1].length; j++) {
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
                eventData : output[0],
                sponserList : WMoutput
            };
            res.status(200).json(response);

        }
        else if(!err){
            response.status = true;
            response.message = "Home page data loaded successfully";
            response.error = null;
            response.data = null;
            res.status(200).json(response);
        }
        else{
            response.status = false;
            response.message = "Error while getting home page data";
            response.error = null;
            response.data = null;
            res.status(500).json(response);
        }
    });

};

eventCtrl.getWMEventAgenda = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    req.query.WMId = req.query.WMId ? req.query.WMId : 0;
    req.query.date = (req.query.date) ? req.query.date : null ;
    if(req.query.date == ''){
        req.query.date = null ;
    }

    var procParams = [
        req.st.db.escape(req.query.WMId),
        req.st.db.escape(req.query.date)
    ];
    /**
     * Calling procedure to get form template
     * @type {string}
     */

    var procQuery = 'CALL wm_get_eventAgenda( ' + procParams.join(',') + ')';
    console.log(procQuery);
    req.db.query(procQuery,function(err,agendaData){
        if(!err && agendaData && agendaData[0] && agendaData[0][0] ){
            var output = [];
            for(var i = 0; i < agendaData[0].length; i++) {
                var res1 = {};
                res1.description = agendaData[0][i].description;
                res1.duration = agendaData[0][i].duration;
                res1.sessionDate = agendaData[0][i].sessionDate;
                res1.title = agendaData[0][i].title;
                res1.venue = agendaData[0][i].venue;
                res1.sessionId = agendaData[0][i].sessionId;
                output.push(res1);
            }
            response.status = true;
            response.message = "Agenda data loaded successfully";
            response.error = null;
            response.data = {
                agendaData : output,
                eventDetails : {
                    startDateTime : agendaData[1][0].startDateTime,
                    endDateTime : agendaData[1][0].endDateTime
                }
            };
            res.status(200).json(response);

        }
        else if(!err){
            response.status = true;
            response.message = "Agenda data loaded successfully";
            response.error = null;
            response.data = null;
            res.status(200).json(response);
        }
        else{
            response.status = false;
            response.message = "Error while getting agenda data ";
            response.error = null;
            response.data = null;
            res.status(500).json(response);
        }
    });

};

eventCtrl.getWMEventSpeakers = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    req.query.WMId = req.query.WMId ? req.query.WMId : 0;

    var procParams = [
        req.st.db.escape(req.query.WMId)
    ];
    /**
     * Calling procedure to get form template
     * @type {string}
     */
    var procQuery = 'CALL wm_get_eventSpeakers( ' + procParams.join(',') + ')';
    console.log(procQuery);
    req.db.query(procQuery,function(err,speakersData){
        if(!err && speakersData && speakersData[0] && speakersData[0][0] ){
            var output = [];
            for(var i = 0; i < speakersData[0].length; i++) {
                var res1 = {};
                res1.jobTitle = speakersData[0][i].jobTitle;
                res1.name = speakersData[0][i].name;
                res1.companyName = speakersData[0][i].CompanyName;
                res1.picture = speakersData[0][i].banner ? (req.CONFIG.CONSTANT.GS_URL +
                    req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + speakersData[0][i].picture) : "";
                output.push(res1);
            }
            response.status = true;
            response.message = "speakers data loaded successfully";
            response.error = null;
            response.data = {
                speakerList : output
            };
            res.status(200).json(response);

        }
        else if(!err){
            response.status = true;
            response.message = "speakers data loaded successfully";
            response.error = null;
            response.data = null;
            res.status(200).json(response);
        }
        else{
            response.status = false;
            response.message = "Error while getting speakers data ";
            response.error = null;
            response.data = null;
            res.status(500).json(response);
        }
    });

};

eventCtrl.getWMEventModerator = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    req.query.WMId = req.query.WMId ? req.query.WMId : 0;

    var procParams = [
        req.st.db.escape(req.query.WMId)
    ];
    /**
     * Calling procedure to get form template
     * @type {string}
     */
    var procQuery = 'CALL wm_get_eventModerator( ' + procParams.join(',') + ')';
    console.log(procQuery);
    req.db.query(procQuery,function(err,moderatorData){
        if(!err && moderatorData && moderatorData[0] && moderatorData[0][0] ){
            var output = [];
            for(var i = 0; i < moderatorData[0].length; i++) {
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
                speakerList : output
            };
            res.status(200).json(response);

        }
        else if(!err){
            response.status = true;
            response.message = "Moderator data loaded successfully";
            response.error = null;
            response.data = null;
            res.status(200).json(response);
        }
        else{
            response.status = false;
            response.message = "Error while getting moderator data ";
            response.error = null;
            response.data = null;
            res.status(500).json(response);
        }
    });

};

eventCtrl.getWMEventQuestions = function(req,res,next){
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
    if (!req.query.sessionId) {
        error.sessionId = 'Invalid sessionId';
        validationFlag *= false;
    }

    if (!req.query.WMId) {
        error.WMId = 'Invalid WMId';
        validationFlag *= false;
    }

    if (!validationFlag){
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
                    req.st.db.escape(req.query.WMId)
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
                            res1.answer = (questionsData[0] && questionsData[0][i] && questionsData[0][i].answer) ? JSON.parse(questionsData[0][i].answer) : [];
                            output.push(res1);
                        }
                        response.status = true;
                        response.message = "Questions loaded successfully";
                        response.error = null;
                        response.data = {
                            questions: output
                        };
                        res.status(200).json(response);

                    }
                    else if (!err) {
                        response.status = true;
                        response.message = "Questions loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
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

module.exports = eventCtrl;