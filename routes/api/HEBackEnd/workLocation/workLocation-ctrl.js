/**
 * Created by Jana1 on 10-03-2017.
 */

var workLocationCtrl = {};
var error = {};

workLocationCtrl.saveWorkLocation = function(req,res,next){
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
                req.body.latitude = (req.body.latitude) ? req.body.latitude : null;
                req.body.workLocationId = (req.body.workLocationId) ? req.body.workLocationId : 0;
                req.body.longitude = (req.body.longitude) ? req.body.longitude : null;
                req.body.address = (req.body.address) ? req.body.address : '';
                req.body.currencyId = (req.body.currencyId) ? req.body.currencyId : 0;
                req.body.defaultStartTime = (req.body.defaultStartTime) ? req.body.defaultStartTime : null;
                req.body.slotDuration = (req.body.slotDuration) ? req.body.slotDuration : 0;
                req.body.isSlotDuration = (req.body.isSlotDuration) ? req.body.isSlotDuration : 0;
                req.body.canUserViewBooking = (req.body.canUserViewBooking) ? req.body.canUserViewBooking : 0;
                req.body.isdPhone = (req.body.isdPhone) ? req.body.isdPhone : '';
                req.body.phone = (req.body.phone) ? req.body.phone : '';
                req.body.parking = (req.body.parking) ? req.body.parking : 0;
                req.body.parkingText = (req.body.parkingText) ? req.body.parkingText : '';
                req.body.workingHours = (req.body.workingHours) ? req.body.workingHours : '';

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.workLocationId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.latitude),
                    req.st.db.escape(req.body.longitude),
                    req.st.db.escape(req.body.address),
                    req.st.db.escape(req.body.currencyId),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.defaultStartTime),
                    req.st.db.escape(req.body.slotDuration),
                    req.st.db.escape(req.body.isSlotDuration),
                    req.st.db.escape(req.body.canUserViewBooking),
                    req.st.db.escape(req.body.isdPhone),
                    req.st.db.escape(req.body.phone),
                    req.st.db.escape(req.body.parking),
                    req.st.db.escape(req.body.parkingText),
                    req.st.db.escape(req.body.workingHours)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL save_HE_worklocation( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,worklocationResult){
                    console.log(err);

                    if(!err){
                        response.status = true;
                        response.message = "Work location saved successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving work location";
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

workLocationCtrl.updateWorkLocation = function(req,res,next){
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
    if (!req.body.workLocationId) {
        error.token = 'Invalid workLocationId';
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
                req.body.latitude = (req.body.latitude) ? req.body.latitude : null;
                req.body.workLocationId = (req.body.workLocationId) ? req.body.workLocationId : 0;
                req.body.longitude = (req.body.longitude) ? req.body.longitude : null;
                req.body.address = (req.body.address) ? req.body.address : '';
                req.body.currencyId = (req.body.currencyId) ? req.body.currencyId : 0;
                req.body.defaultStartTime = (req.body.defaultStartTime) ? req.body.defaultStartTime : null;
                req.body.slotDuration = (req.body.slotDuration) ? req.body.slotDuration : 0;
                req.body.isSlotDuration = (req.body.isSlotDuration) ? req.body.isSlotDuration : 0;
                req.body.canUserViewBooking = (req.body.canUserViewBooking) ? req.body.canUserViewBooking : 0;
                req.body.isdPhone = (req.body.isdPhone) ? req.body.isdPhone : '';
                req.body.phone = (req.body.phone) ? req.body.phone : '';
                req.body.parking = (req.body.parking) ? req.body.parking : 0;
                req.body.parkingText = (req.body.parkingText) ? req.body.parkingText : '';
                req.body.workingHours = (req.body.workingHours) ? req.body.workingHours : '';

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.workLocationId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.latitude),
                    req.st.db.escape(req.body.longitude),
                    req.st.db.escape(req.body.address),
                    req.st.db.escape(req.body.currencyId),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.defaultStartTime),
                    req.st.db.escape(req.body.slotDuration),
                    req.st.db.escape(req.body.isSlotDuration),
                    req.st.db.escape(req.body.canUserViewBooking),
                    req.st.db.escape(req.body.isdPhone),
                    req.st.db.escape(req.body.phone),
                    req.st.db.escape(req.body.parking),
                    req.st.db.escape(req.body.parkingText),
                    req.st.db.escape(req.body.workingHours)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL save_HE_worklocation( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,worklocationResult){
                    console.log(err);

                    if(!err){
                        response.status = true;
                        response.message = "Work location saved successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving work location";
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

workLocationCtrl.getWorkLocationDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading work location",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.workLocationId) {
        error.token = 'Invalid workLocationId';
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
                    req.st.db.escape(req.query.workLocationId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL get_HEWorkLocationDetails( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,workLocationResult){
                    if(!err && workLocationResult && workLocationResult[0] && workLocationResult[0][0]){
                        response.status = true;
                        response.message = "Work location loaded successfully";
                        response.error = null;
                        response.data = workLocationResult[0][0];
                        res.status(200).json(response);

                    }
                    else if(err){
                        response.status = false;
                        response.message = "Error while getting work location";
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

workLocationCtrl.getWorkLocationList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading work location",
        data : null,
        error : null
    };
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
                var procQuery = 'CALL get_HEWorkLocationList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,workLocationResult){
                    console.log(workLocationResult) ;
                    if(!err && workLocationResult && workLocationResult[0] && workLocationResult[0][0]){
                        response.status = true;
                        response.message = "Work location loaded successfully";
                        response.error = null;
                        response.data = {
                            workLocationList : workLocationResult[0]
                        }
                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Work location loaded successfully";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting work location";
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

workLocationCtrl.deleteWorkLocation = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting work location",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.workLocationId) {
        error.token = 'Invalid workLocationId';
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
                    req.st.db.escape(req.query.workLocationId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL delete_HE_WorkLocationTemplate( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,formTemplateResult){
                    if (formTemplateResult && formTemplateResult[0] && formTemplateResult[0][0]._error)
                    {
                        switch (formTemplateResult[0][0]._error) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "Work location is assigned to user so you can't delete.";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Work location deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting work location";
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

module.exports = workLocationCtrl;