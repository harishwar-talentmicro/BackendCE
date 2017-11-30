/**
 * Created by vedha on 30-11-2017.
 */


var travelModeCtrl = {};
var error = {};

travelModeCtrl.saveTravelMode = function(req,res,next){
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

    if (!req.body.travelMode)
    {
        error.travelMode = 'Invalid travelMode';
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
                req.body.travelModeId = req.body.travelModeId != undefined ? req.body.travelModeId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.travelModeId),
                    req.st.db.escape(req.body.travelMode),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to save travel modes like taxi , bus , air
                 * @type {string}
                 */
                var procQuery = 'CALL he_save_traveMode( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,leaveTypeResult){
                    if(!err && leaveTypeResult && leaveTypeResult[0] && leaveTypeResult[0][0] && leaveTypeResult[0][0].travelModeId ){
                        response.status = true;
                        response.message = "Travel mode saved successfully";
                        response.error = null;
                        response.data = {
                            travelModeId :  leaveTypeResult[0][0].travelModeId,
                            travelMode :  req.body.travelMode
                        };
                        res.status(200).json(response);
                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Access denied";
                        response.error = null;
                        response.data = null ;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving travel mode";
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

travelModeCtrl.getTravelMode = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
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
                var procQuery = 'CALL he_get_traveMode( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,traveModeResult){
                    if(!err && traveModeResult && traveModeResult[0] && traveModeResult[0][0]){
                        response.status = true;
                        response.message = "Travel modes loaded successfully";
                        response.error = null;
                        response.data = {
                            traveModeResult : traveModeResult[0]
                        };
                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No travel mode data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting travel mode";
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


travelModeCtrl.deleteTravelMode = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.travelModeId) {
        error.travelModeId = 'Invalid travelModeId';
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
                    req.st.db.escape(req.query.travelModeId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_travelMode( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,travelModeResult){

                    if(!err && travelModeResult && travelModeResult[0] && travelModeResult[0][0]._error){
                        switch (travelModeResult[0][0]._error) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "Travel mode is in use";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }
                    else if (!err ){
                        response.status = true;
                        response.message = "Travel mode deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting travel mode";
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

module.exports = travelModeCtrl;