/**
 * Created by vedha on 07-03-2017.
 */


var trackTemplateCtrl = {};
var error = {};

/**
 *
 * @param req
 * @param res
 * @param next
 */
trackTemplateCtrl.saveTrackTemplate = function(req,res,next){
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

    if (!req.body.trackTitle) {
        error.token = 'Invalid trackTitle';
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
                req.body.trackTemplateId = (req.body.trackTemplateId) ? req.body.trackTemplateId : 0;
                req.body.SUNStartHour = (req.body.SUNStartHour) ? req.body.SUNStartHour : null;
                req.body.SUNEndHour = (req.body.SUNEndHour) ? req.body.SUNEndHour : null;
                req.body.MONStartHour = (req.body.MONStartHour) ? req.body.MONStartHour : null;
                req.body.MONEndHour = (req.body.MONEndHour) ? req.body.MONEndHour : null;
                req.body.TUEStartHour = (req.body.TUEStartHour) ? req.body.TUEStartHour : null;
                req.body.TUEEndHour = (req.body.TUEEndHour) ? req.body.TUEEndHour : null;
                req.body.WEDStartHour = (req.body.WEDStartHour) ? req.body.WEDStartHour : null;
                req.body.WEDEndHour = (req.body.WEDEndHour) ? req.body.WEDEndHour : null;
                req.body.THUStartHour = (req.body.THUStartHour) ? req.body.THUStartHour : null;
                req.body.THUEndHour = (req.body.THUEndHour) ? req.body.THUEndHour : null;
                req.body.FRIStartHour = (req.body.FRIStartHour) ? req.body.FRIStartHour : null;
                req.body.FRIEndHour = (req.body.FRIEndHour) ? req.body.FRIEndHour : null;
                req.body.SATStartHour = (req.body.SATStartHour) ? req.body.SATStartHour : null;
                req.body.SATEndHour = (req.body.SATEndHour) ? req.body.SATEndHour : null;
                req.body.saturdayWorking = (req.body.saturdayWorking) ? req.body.saturdayWorking : 0;
                req.body.isAttendanceTracking = (req.body.isAttendanceTracking) ? req.body.isAttendanceTracking : 0;
                req.body.isLocationTracking = (req.body.isLocationTracking) ? req.body.isLocationTracking : 0;
                req.body.proximity = (req.body.proximity) ? req.body.proximity : 0;
                req.body.holidayTemplateId = (req.body.holidayTemplateId) ? req.body.holidayTemplateId : 0;
              //  req.body.toleranceTime = (req.body.toleranceTime) ? req.body.toleranceTime : 0;
                req.body.locationTrackingType = (req.body.locationTrackingType) ? req.body.locationTrackingType : 0;
                req.body.enableOT = (req.body.enableOT) ? req.body.enableOT : 0;
                req.body.considerAsOT = (req.body.considerAsOT) ? req.body.considerAsOT : 0;
                req.body.workingHours_per_day = (req.body.workingHours_per_day) ? req.body.workingHours_per_day : 0;
                req.body.calendarHours_per_day = (req.body.calendarHours_per_day) ? req.body.calendarHours_per_day : 0;
                req.body.address = (req.body.address) ? req.body.address : '';
                req.body.latitude = (req.body.latitude) ? req.body.latitude : 0;
                req.body.longitude = (req.body.longitude) ? req.body.longitude : 0;



                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.trackTemplateId),
                    req.st.db.escape(req.body.trackTitle),
                    req.st.db.escape(req.body.SUNStartHour),
                    req.st.db.escape(req.body.SUNEndHour),
                    req.st.db.escape(req.body.MONStartHour),
                    req.st.db.escape(req.body.MONEndHour),
                    req.st.db.escape(req.body.TUEStartHour),
                    req.st.db.escape(req.body.TUEEndHour),
                    req.st.db.escape(req.body.WEDStartHour),
                    req.st.db.escape(req.body.WEDEndHour),
                    req.st.db.escape(req.body.THUStartHour),
                    req.st.db.escape(req.body.THUEndHour),
                    req.st.db.escape(req.body.FRIStartHour),
                    req.st.db.escape(req.body.FRIEndHour),
                    req.st.db.escape(req.body.SATStartHour),
                    req.st.db.escape(req.body.SATEndHour),
                    req.st.db.escape(req.body.saturdayWorking),
                    req.st.db.escape(req.body.isAttendanceTracking),
                    req.st.db.escape(req.body.proximity),
                    req.st.db.escape(req.body.holidayTemplateId),
                    req.st.db.escape(req.body.isLocationTracking),
                 //   req.st.db.escape(req.body.toleranceTime),
                    req.st.db.escape(req.body.locationTrackingType),
                    req.st.db.escape(req.body.enableOT),
                    req.st.db.escape(req.body.considerAsOT),
                    req.st.db.escape(req.body.workingHours_per_day),
                    req.st.db.escape(req.body.calendarHours_per_day),
                    req.st.db.escape(req.body.address),
                    req.st.db.escape(req.body.latitude),
                    req.st.db.escape(req.body.longitude),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to save track template
                 * @type {string}
                 */
                var procQuery = 'CALL save_HETrackTemplates( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,trackTemplateResult){
                    console.log(err);

                    if(!err && trackTemplateResult && trackTemplateResult[0] && trackTemplateResult[0][0] && trackTemplateResult[0][0].trackTemplateId){
                        response.status = true;
                        response.message = "Track Template saved successfully";
                        response.error = null;
                        response.trackTemplateId = trackTemplateResult[0][0].trackTemplateId
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving track template";
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

trackTemplateCtrl.updateTrackTemplate = function(req,res,next){
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

    if (!req.body.trackTitle) {
        error.token = 'Invalid trackTitle';
        validationFlag *= false;
    }

    if (!req.body.trackTemplateId) {
        error.token = 'Invalid track templateId';
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
                req.body.SUNStartHour = (req.body.SUNStartHour) ? req.body.SUNStartHour : null;
                req.body.SUNEndHour = (req.body.SUNEndHour) ? req.body.SUNEndHour : null;
                req.body.MONStartHour = (req.body.MONStartHour) ? req.body.MONStartHour : null;
                req.body.MONEndHour = (req.body.MONEndHour) ? req.body.MONEndHour : null;
                req.body.TUEStartHour = (req.body.TUEStartHour) ? req.body.TUEStartHour : null;
                req.body.TUEEndHour = (req.body.TUEEndHour) ? req.body.TUEEndHour : null;
                req.body.WEDStartHour = (req.body.WEDStartHour) ? req.body.WEDStartHour : null;
                req.body.WEDEndHour = (req.body.WEDEndHour) ? req.body.WEDEndHour : null;
                req.body.THUStartHour = (req.body.THUStartHour) ? req.body.THUStartHour : null;
                req.body.THUEndHour = (req.body.THUEndHour) ? req.body.THUEndHour : null;
                req.body.FRIStartHour = (req.body.FRIStartHour) ? req.body.FRIStartHour : null;
                req.body.FRIEndHour = (req.body.FRIEndHour) ? req.body.FRIEndHour : null;
                req.body.SATStartHour = (req.body.SATStartHour) ? req.body.SATStartHour : null;
                req.body.SATEndHour = (req.body.SATEndHour) ? req.body.SATEndHour : null;
                req.body.saturdayWorking = (req.body.saturdayWorking) ? req.body.saturdayWorking : 0;
                req.body.isAttendanceTracking = (req.body.isAttendanceTracking) ? req.body.isAttendanceTracking : 0;
                req.body.isLocationTracking = (req.body.isLocationTracking) ? req.body.isLocationTracking : 0;
                req.body.proximity = (req.body.proximity) ? req.body.proximity : 0;
                req.body.holidayTemplateId = (req.body.holidayTemplateId) ? req.body.holidayTemplateId : 0;
              //  req.body.toleranceTime = (req.body.toleranceTime) ? req.body.toleranceTime : 0;

                req.body.locationTrackingType = (req.body.locationTrackingType) ? req.body.locationTrackingType : 0;
                req.body.enableOT = (req.body.enableOT) ? req.body.enableOT : 0;
                req.body.considerAsOT = (req.body.considerAsOT) ? req.body.considerAsOT : 0;
                req.body.workingHours_per_day = (req.body.workingHours_per_day) ? req.body.workingHours_per_day : 0;
                req.body.calendarHours_per_day = (req.body.calendarHours_per_day) ? req.body.calendarHours_per_day : 0;
                req.body.address = (req.body.address) ? req.body.address : '';
                req.body.latitude = (req.body.latitude) ? req.body.latitude : 0.0;
                req.body.longitude = (req.body.longitude) ? req.body.longitude : 0.0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.trackTemplateId),
                    req.st.db.escape(req.body.trackTitle),
                    req.st.db.escape(req.body.SUNStartHour),
                    req.st.db.escape(req.body.SUNEndHour),
                    req.st.db.escape(req.body.MONStartHour),
                    req.st.db.escape(req.body.MONEndHour),
                    req.st.db.escape(req.body.TUEStartHour),
                    req.st.db.escape(req.body.TUEEndHour),
                    req.st.db.escape(req.body.WEDStartHour),
                    req.st.db.escape(req.body.WEDEndHour),
                    req.st.db.escape(req.body.THUStartHour),
                    req.st.db.escape(req.body.THUEndHour),
                    req.st.db.escape(req.body.FRIStartHour),
                    req.st.db.escape(req.body.FRIEndHour),
                    req.st.db.escape(req.body.SATStartHour),
                    req.st.db.escape(req.body.SATEndHour),
                    req.st.db.escape(req.body.saturdayWorking),
                    req.st.db.escape(req.body.isAttendanceTracking),
                    req.st.db.escape(req.body.proximity),
                    req.st.db.escape(req.body.holidayTemplateId),
                    req.st.db.escape(req.body.isLocationTracking),
                 //   req.st.db.escape(req.body.toleranceTime),
                    req.st.db.escape(req.body.locationTrackingType),
                    req.st.db.escape(req.body.enableOT),
                    req.st.db.escape(req.body.considerAsOT),
                    req.st.db.escape(req.body.workingHours_per_day),
                    req.st.db.escape(req.body.calendarHours_per_day),
                    req.st.db.escape(req.body.address),
                    req.st.db.escape(req.body.latitude),
                    req.st.db.escape(req.body.longitude),
                    req.st.db.escape(req.query.APIKey)


                ];
                /**
                 * Calling procedure to save track template
                 * @type {string}
                 */
                var procQuery = 'CALL save_HETrackTemplates( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,trackTemplateResult){
                    console.log(err);

                    if(!err && trackTemplateResult && trackTemplateResult[0] && trackTemplateResult[0][0] && trackTemplateResult[0][0].trackTemplateId){
                        response.status = true;
                        response.message = "Track Template saved successfully";
                        response.error = null;
                        response.trackTemplateId = trackTemplateResult[0][0].trackTemplateId
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving track template";
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

trackTemplateCtrl.getTrackTemplate = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading track template",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.trackTemplateId) {
        error.token = 'Invalid trackTemplateId';
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
                    req.st.db.escape(req.query.trackTemplateId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get track template
                 * @type {string}
                 */
                var procQuery = 'CALL get_HETrackTemplateDetails( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,TrackTemplateResult){
                    if(!err && TrackTemplateResult && TrackTemplateResult[0] && TrackTemplateResult[0][0]){
                        response.status = true;
                        response.message = "Track template loaded successfully";
                        response.error = null;
                        response.data = TrackTemplateResult[0][0];
                        res.status(200).json(response);
                    }
                    else if(err){
                        response.status = false;
                        response.message = "Error while getting track template";
                        response.error = null;
                        response.data = null;
                        res.status(500).json(response);
                    }
                    else{
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                });
            }
            else{
                res.status(401).json(response);
            }
        });
    }
};

trackTemplateCtrl.getTrackTemplateList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading track template",
        data : null,
        error : null
    };
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    var validationFlag = true;

    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
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
                var procQuery = 'CALL get_HETrackTemplateList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,trackTemplateResult){
                    if(!err && trackTemplateResult && trackTemplateResult[0] && trackTemplateResult[0][0]){
                        response.status = true;
                        response.message = "Track template loaded successfully";
                        response.error = null;
                        response.data = {
                            trackTemplateList : trackTemplateResult[0]
                        };
                        res.status(200).json(response);

                    }
                    else if(!err) {
                        response.status = true;
                        response.message = "Track template loaded successfully";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting track template";
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

trackTemplateCtrl.deleteTrackTemplate = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting track template",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.trackTemplateId) {
        error.token = 'Invalid trackTemplateId';
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
                    req.st.db.escape(req.query.trackTemplateId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL delete_HE_trackTemplate( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,formTemplateResult){
                    if (formTemplateResult && formTemplateResult[0] && formTemplateResult[0][0]._error)
                    {
                        switch (formTemplateResult[0][0]._error) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "Trak template is assigned to user so you can't delete.";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }


                    if(!err){
                        response.status = true;
                        response.message = "Track template deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting track template";
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

module.exports = trackTemplateCtrl;