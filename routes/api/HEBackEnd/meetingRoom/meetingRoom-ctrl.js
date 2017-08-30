/**
 * Created by Jana1 on 01-08-2017.
 */


var meetingRoomCtrl = {};
var error = {};

meetingRoomCtrl.saveMeetingRoom = function(req,res,next){
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
    if (!req.body.title)
    {
        error.title = 'Invalid title';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
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

                req.body.roomId = req.body.roomId ? req.body.roomId : 0;
                req.body.image = req.body.image ? req.body.image : "";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.roomId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.pax),
                    req.st.db.escape(req.body.image),
                    req.st.db.escape(req.body.workLocationId)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_meetingRooms( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,meetingRoomResult){
                    if(!err && meetingRoomResult && meetingRoomResult[0] && meetingRoomResult[0][0].roomId){
                        response.status = true;
                        response.message = "Meeting room saved successfully";
                        response.error = null;
                        response.data = {
                          roomId : meetingRoomResult[0][0].roomId,
                          title : req.body.title,
                          pax : req.body.pax,
                          workLocationId : req.body.workLocationId,
                          image : (req.body.image) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + req.body.image) : ""
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Meeting room saved successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving meeting room";
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

meetingRoomCtrl.getMeetingRoomList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading currency",
        data : null,
        error : null
    };

    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
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
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL he_get_meetingRoom( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,meetingRoomResult){
                    if(!err && meetingRoomResult && meetingRoomResult[0] && meetingRoomResult[0][0]){
                        response.status = true;
                        response.message = "Meeting room list loaded successfully";
                        response.error = null;
                        var output = [];
                        for(var i = 0; i < meetingRoomResult[0].length; i++) {
                            var res1 = {};
                            res1.roomId = meetingRoomResult[0][i].roomId;
                            res1.title = meetingRoomResult[0][i].title;
                            res1.pax = meetingRoomResult[0][i].pax;
                            res1.workLocationId = meetingRoomResult[0][i].workLocationId;
                            res1.image = (meetingRoomResult[0][i].image) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + meetingRoomResult[0][i].image) : ""
                            output.push(res1);
                        }
                        response.data = output;
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
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

module.exports = meetingRoomCtrl;