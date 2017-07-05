/**
 * Created by vedha on 16-05-2017.
 */

var TITOCtrl = {};

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
};

module.exports = TITOCtrl;