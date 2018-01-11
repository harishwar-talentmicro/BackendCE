/**
 * Created by Jana1 on 28-12-2017.
 */

var zoomCtrl = {};
var error = {};
var Notification_aws = require('../../modules/notification/aws-sns-push');

var _Notification_aws = new  Notification_aws();

var zlib = require('zlib');
var AES_256_encryption = require('../../encryption/encryption.js');
var encryption = new  AES_256_encryption();


zoomCtrl.saveZoomMeeting = function(req,res,next){
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
    if (!req.body.meetingId) {
        error.meetingId = 'Invalid meetingId';
        validationFlag *= false;
    }

    var memberList =req.body.memberList;
    if(typeof(memberList) == "string") {
        memberList = JSON.parse(memberList);
    }
    if(!memberList){
        error.itemList = 'Invalid memberList';
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
                    req.st.db.escape(req.body.meetingId),
                    req.st.db.escape(JSON.stringify(memberList))
                ];

                var procQuery = 'CALL HE_save_zoomMeeting( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, questionsData) {
                    if (!err) {
                        var messagePayload = {
                            message : questionsData[0][0].message,
                            meetingId : questionsData[0][0].meetingId,
                            title : questionsData[0][0].title,
                            type : 91
                        };
                        console.log("messagePayload",messagePayload);
                        if(questionsData[1] && questionsData[1][0].APNS_Id){
                            _Notification_aws.publish_IOS(questionsData[1][0].APNS_Id,messagePayload,0);
                        }
                        if(questionsData[2] && questionsData[2][0].GCM_Id){
                            _Notification_aws.publish_Android(questionsData[2][0].GCM_Id ,messagePayload);
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
            else {
                res.status(401).json(response);
            }
        });
    }
};

zoomCtrl.stopMeeting = function(req,res,next){
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
    if (!req.body.meetingId) {
        error.meetingId = 'Invalid meetingId';
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
                    req.st.db.escape(req.body.meetingId)
                ];

                var procQuery = 'CALL HE_stop_zoomMeeting( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, questionsData) {
                    if (!err) {
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
            else {
                res.status(401).json(response);
            }
        });
    }
};

zoomCtrl.getMeetingList = function(req,res,next){
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
    if (!req.query.status) {
        error.status = 'Invalid status';
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
                    req.st.db.escape(req.query.status)
                ];

                var procQuery = 'CALL HE_get_zoomMeeting( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery, function (err, questionsData) {
                    if (!err && questionsData && questionsData[0]) {
                        response.status = true;
                        response.message = "Meeting list loaded successfully.";
                        response.error = null;
                        response.data = {
                            meetingList : questionsData[0]
                        };
                        // res.status(200).json(response);
                        var buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
                            res.status(200).json(response);
                        });
                    }
                    else if (!err){
                        response.status = true;
                        response.message = "Meeting list loaded successfully.";
                        response.error = null;
                        response.data = {
                            meetingList : []
                        };
                         buf = new Buffer(JSON.stringify(response.data), 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            response.data = encryption.encrypt(result,tokenResult[0].secretKey).toString('base64');
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

module.exports = zoomCtrl;
