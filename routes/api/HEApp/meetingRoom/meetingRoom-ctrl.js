/**
 * Created by Jana1 on 01-08-2017.
 */

var meetingRoomCtrl = {};
var error = {};

meetingRoomCtrl.getMeetingRooms = function(req,res,next){
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

    if (!req.query.groupId)
    {
        error.groupId = 'Invalid groupId';
        validationFlag *= false;
    }
    if (!req.query.startTime)
    {
        error.startTime = 'Invalid startTime';
        validationFlag *= false;
    }
    if (!req.query.endTime)
    {
        error.endTime = 'Invalid endTime';
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
                    req.st.db.escape(req.query.groupId),
                    req.st.db.escape(req.query.startTime),
                    req.st.db.escape(req.query.endTime)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_app_meetingRooms( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,meetingRoomResult){
                    if(!err && meetingRoomResult && meetingRoomResult[0] && meetingRoomResult[0][0].roomId){
                        response.status = true;
                        response.message = "Meeting rooms loaded successfully";
                        response.error = null;
                        var output = [];
                        for(var i = 0; i < meetingRoomResult[0].length; i++) {
                            var res1 = {};
                            res1.roomId = meetingRoomResult[0][i].roomId;
                            res1.title = meetingRoomResult[0][i].title;
                            res1.pax = meetingRoomResult[0][i].pax;
                            res1.bookedBy = meetingRoomResult[0][i].bookedBy;
                            res1.bookedFor = meetingRoomResult[0][i].bookedFor;
                            res1.createdDate = meetingRoomResult[0][i].createdDate;
                            res1.createdBy = meetingRoomResult[0][i].createdBy;
                            res1.createdUserId = meetingRoomResult[0][i].createdUserId;
                            res1.endTime = meetingRoomResult[0][i].endTime;
                            res1.isdPhone = meetingRoomResult[0][i].isdPhone;
                            res1.notes = meetingRoomResult[0][i].notes;
                            res1.phone = meetingRoomResult[0][i].phone;
                            res1.startTime = meetingRoomResult[0][i].startTime;
                            res1.status = meetingRoomResult[0][i].status;
                            res1.bookedByPhone = meetingRoomResult[0][i].bookedByPhone;
                            res1.image = (meetingRoomResult[0][i].image) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + meetingRoomResult[0][i].image) : ""
                            output.push(res1);
                        }
                        response.data = {
                            meetingRoomList : output
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Meeting rooms loaded successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting meeting rooms";
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

meetingRoomCtrl.getMasterData = function(req,res,next){
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
                    req.st.db.escape(req.query.groupId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_app_master_meetingRooms( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,meetingRoomResult){
                    if(!err && meetingRoomResult && meetingRoomResult[0] && meetingRoomResult[0][0]){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        response.data =  meetingRoomResult[0][0] ;
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Data loaded successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting Data loaded";
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

meetingRoomCtrl.bookMeetingRoom = function(req,res,next){
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

    if (!req.body.roomId) {
        error.roomId = 'Invalid roomId';
        validationFlag *= false;
    }
    var senderGroupId;

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        console.log(response);
        res.status(400).json(response);

    }
    else{
        req.st.validateToken(req.query.token,function(err,tokenResult){
            if((!err) && tokenResult){

                req.body.parentId = req.body.parentId ? req.body.parentId : 0;
                req.body.status = req.body.status ? req.body.status : 3;
                req.body.bookedBy = req.body.bookedBy ? req.body.bookedBy : '';
                req.body.bookedFor = req.body.bookedFor ? req.body.bookedFor : '';
                req.body.startTime = req.body.startTime ? req.body.startTime : null;
                req.body.endTime = req.body.endTime ? req.body.endTime : null;
                req.body.notes = req.body.notes ? req.body.notes : '';
                req.body.changeLog = req.body.changeLog ? req.body.changeLog : '';
                req.body.learnMessageId = req.body.learnMessageId ? req.body.learnMessageId : 0;
                req.body.accessUserType  = req.body.accessUserType  ? req.body.accessUserType  : 0;
                req.body.localMessageId = req.body.localMessageId ? req.body.localMessageId : 0;
                req.body.approverCount = req.body.approverCount ? req.body.approverCount : 0;
                req.body.receiverCount = req.body.receiverCount ? req.body.receiverCount : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.parentId),
                    req.st.db.escape(req.body.roomId),
                    req.st.db.escape(req.body.bookedBy),
                    req.st.db.escape(req.body.bookedFor),
                    req.st.db.escape(req.body.isdPhone),
                    req.st.db.escape(req.body.phone),
                    req.st.db.escape(req.body.startTime),
                    req.st.db.escape(req.body.endTime),
                    req.st.db.escape(req.body.notes),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.changeLog),
                    req.st.db.escape(req.body.groupId),
                    req.st.db.escape(req.body.learnMessageId),
                    req.st.db.escape(req.body.accessUserType)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_save_app_meetingRoom( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,results){
                    console.log(results);
                    if(!err && results && results[0] ){
                        response.status = true;
                        response.message = "Booking is successful";
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
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while booking";
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

module.exports = meetingRoomCtrl;