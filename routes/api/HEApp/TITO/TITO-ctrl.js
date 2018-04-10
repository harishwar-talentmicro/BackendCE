/**
 * Created by vedha on 16-05-2017.
 */

var TITOCtrl = {};

var zlib = require('zlib');
var AES_256_encryption = require('../../../encryption/encryption.js');
var encryption = new  AES_256_encryption();

TITOCtrl.saveAttendence = function(req,res,next){
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

    var attendenceList =req.body.attendenceList;
    if(typeof(attendenceList) == "string") {
        attendenceList = JSON.parse(attendenceList);
    }
    if(!attendenceList){
        attendenceList = [];
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(attendenceList))
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_TITO( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,TITOResult){
                    if(!err){
                        response.status = true;
                        response.message = "Attendence list saved successfully";
                        response.error = null;
                        response.data = {
                            maxAttendanceId : (req.body.maxAttendanceId) ? req.body.maxAttendanceId : 0
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving attendence list" ;
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

TITOCtrl.saveLocationTracking = function(req,res,next){
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

    var trackList =req.body.trackList;
    if(typeof(trackList) == "string") {
        trackList = JSON.parse(trackList);
    }
    if(!trackList){
        trackList = [];
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(JSON.stringify(trackList))
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_locationTracking( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,TITOResult){
                    if(!err){
                        response.status = true;
                        response.message = "Location tracking saved successfully";
                        response.error = null;
                        response.data = {
                            maxTrackId : (req.body.maxTrackId) ? req.body.maxTrackId : 0
                        };
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving location tracking" ;
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

TITOCtrl.getAttendanceRegister = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;


    if (!req.query.token)
    {
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
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.date),
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.HEUserId)
                ];

                var procQuery = 'CALL he_get_attendance_new( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,attendanceList){
                    if(!err && attendanceList && attendanceList[0]){

                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        var attendance = JSON.parse("[" + attendanceList[0][0].attendanceData + "]");
                        var output = [];
                        for(var i = 0; i < attendance.length; i++) {
                            var res1 = {};
                            res1.day = attendance[i].day;
                            res1.date = attendance[i].date;
                            res1.totalHours = attendance[i].totalHours;
                            res1.attendance = attendance[i].attendance;
                            res1.timeInOutList = JSON.parse(attendance[i].timeInOutList);
                            output.push(res1);
                        }

                        response.data = {
                            attendanceList : output
                        };
                        // res.status(200).json(response);

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
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data list";
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

TITOCtrl.getAttendanceRegisterDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.token)
    {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.date)
    {
        error.date = 'Invalid date';
        validationFlag *= false;
    }
    if (!req.query.groupId)
    {
        error.groupId = 'Invalid groupId';
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
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.date),
                    req.st.db.escape(req.query.groupId)
                ];

                var procQuery = 'CALL he_get_attendanceRegister_Details( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,attendanceRegister){
                    console.log(err);
                    if(!err && attendanceRegister){
                        response.status = true;
                        response.message = "attendance register loaded successfully";
                        response.error = null;
                        response.data = {
                            TITO : attendanceRegister[0] ? attendanceRegister[0] : [],
                            attendanceRequest : attendanceRegister[1] ? attendanceRegister[1] : [],
                            leaveRequest : attendanceRegister[2] ? attendanceRegister[2] : []
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
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting data list";
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

TITOCtrl.getMyTeamMembers = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;


    if (!req.query.token)
    {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.HEMasterId)
    {
        error.HEMasterId = 'Invalid HEMasterId';
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
                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.HEMasterId)
                ];

                var procQuery = 'CALL he_get_TeamMembers( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,memberList){
                    if(!err && memberList && memberList[0]){
                        response.status = true;
                        response.message = "Users loaded successfully";
                        response.error = null;
                        response.data = {
                            usersList : memberList[0]
                        };
                        // .status(200).json(response);

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
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting users list";
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

module.exports = TITOCtrl;