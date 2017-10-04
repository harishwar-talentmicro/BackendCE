/**
 * Created by vedha on 17-02-2017.
 */
var moment = require('moment');
var HEBackkendCtrl = {};

HEBackkendCtrl.saveAppSettings = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};


    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        console.log("Entered....");
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
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){

                if((!err) && tokenResult){

                    req.body.salesAllocationType = req.body.salesAllocationType  ? req.body.salesAllocationType  : 1;
                    req.body.supportAllocationType = req.body.supportAllocationType  ? req.body.supportAllocationType  : 1;
                    req.body.salesDisplayFormat  = req.body.salesDisplayFormat  ? req.body.salesDisplayFormat  : 1;
                    req.body.salesDefaultUser  = req.body.salesDefaultUser  ? req.body.salesDefaultUser  : 0;
                    req.body.supportDefaultUser  = req.body.supportDefaultUser  ? req.body.supportDefaultUser  : 0;
                    req.body.canUserJoin  = req.body.canUserJoin  ? req.body.canUserJoin  : 0;

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.paymentGateWay ? req.body.paymentGateWay : ''),
                        req.st.db.escape(req.body.attendence ? req.body.attendence : 1),
                        req.st.db.escape(req.body.salesAllocationType),
                        req.st.db.escape(req.body.supportAllocationType),
                        req.st.db.escape(req.body.salesDisplayFormat),
                        req.st.db.escape(req.body.salesDefaultUser),
                        req.st.db.escape(req.body.supportDefaultUser),
                        req.st.db.escape(req.query.APIKey),
                        req.st.db.escape(req.body.canUserJoin)
                    ];

                    var procQuery = 'CALL HE_Save_Appsettings( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        if(!err && result){
                            response.status = true;
                            response.message = "App settings saved successfully";
                            response.error = null;
                            response.data = {
                                HEMasterId : result[0][0].HEMasterId,
                                paymentGateWay : req.body.paymentGateWay ? req.body.paymentGateWay : '',
                                attendence : req.body.attendence ? req.body.attendence : 1,
                                salesAllocationType : req.body.salesAllocationType,
                                supportAllocationType : req.body.supportAllocationType,
                                salesDisplayFormat : req.body.salesDisplayFormat,
                                salesDefaultUser : req.body.salesDefaultUser,
                                supportDefaultUser : req.body.supportDefaultUser,
                                canUserJoin : req.body.canUserJoin
                            };
                            res.status(200).json(response);
                        }
                        else{
                            response.status = false;
                            response.message = "Error while saving settings";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

HEBackkendCtrl.updateAppSettings = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};


    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        console.log("Entered....");
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
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){


                if((!err) && tokenResult){

                    req.body.salesAllocationType = req.body.salesAllocationType  ? req.body.salesAllocationType  : 1;
                    req.body.supportAllocationType = req.body.supportAllocationType  ? req.body.supportAllocationType  : 1;
                    req.body.salesDisplayFormat  = req.body.salesDisplayFormat  ? req.body.salesDisplayFormat  : 1;
                    req.body.salesDefaultUser  = req.body.salesDefaultUser  ? req.body.salesDefaultUser  : 0;
                    req.body.supportDefaultUser  = req.body.supportDefaultUser  ? req.body.supportDefaultUser  : 0;
                    req.body.canUserJoin  = req.body.canUserJoin  ? req.body.canUserJoin  : 0;


                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.paymentGateWay ? req.body.paymentGateWay : ''),
                        req.st.db.escape(req.body.attendence ? req.body.attendence : 1),
                        req.st.db.escape(req.body.salesAllocationType),
                        req.st.db.escape(req.body.supportAllocationType),
                        req.st.db.escape(req.body.salesDisplayFormat),
                        req.st.db.escape(req.body.salesDefaultUser),
                        req.st.db.escape(req.body.supportDefaultUser),
                        req.st.db.escape(req.query.APIKey),
                        req.st.db.escape(req.body.canUserJoin)
                    ];

                    var procQuery = 'CALL HE_Save_Appsettings( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        console.log(err,"err");

                        if(!err && result){
                            response.status = true;
                            response.message = "App settings saved successfully";
                            response.error = null;
                            response.data = {
                                HEMasterId : result[0][0].HEMasterId,
                                paymentGateWay : req.body.paymentGateWay ? req.body.paymentGateWay : '',
                                attendence : req.body.attendence ? req.body.attendence : 1,
                                salesAllocationType : req.body.salesAllocationType,
                                supportAllocationType : req.body.supportAllocationType,
                                salesDisplayFormat : req.body.salesDisplayFormat,
                                salesDefaultUser : req.body.salesDefaultUser,
                                supportDefaultUser : req.body.supportDefaultUser,
                                canUserJoin : req.body.canUserJoin
                            };
                            res.status(200).json(response);
                        }
                        else{
                            response.status = false;
                            response.message = "Error while saving settings";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

HEBackkendCtrl.getAppSettings = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.query.APIKey)
    {
        console.log("Entered....");
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
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){
                if((!err) && tokenResult){
                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.APIKey)
                    ];

                    var procQuery = 'CALL  HE_Get_Appsettings( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        console.log(result) ;
                        if(!err && result && result[0]){
                            res.status(200).json({status: true,
                                message: "App settings loaded successfully",
                                error : null,
                                data: result[0][0]
                            });

                        }
                        else{
                            response.status = false;
                            response.message = "Error while getting app settings";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

module.exports = HEBackkendCtrl;