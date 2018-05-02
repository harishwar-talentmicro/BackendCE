/**
 * Created by vedha on 17-02-2017.
 */
var moment = require('moment');
var HEBackkendCtrl = {};
var appConfig = require('../../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

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
                    req.body.attachmentPlayCount  = req.body.attachmentPlayCount  ? req.body.attachmentPlayCount  : 0;

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
                        req.st.db.escape(req.body.canUserJoin),
                        req.st.db.escape(req.body.attachmentPlayCount)
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
                                canUserJoin : req.body.canUserJoin,
                                attachmentPlayCount : req.body.attachmentPlayCount
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
                    req.body.attachmentPlayCount  = req.body.attachmentPlayCount  ? req.body.attachmentPlayCount  : 0;


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
                        req.st.db.escape(req.body.canUserJoin),
                        req.st.db.escape(req.body.attachmentPlayCount)
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
                                canUserJoin : req.body.canUserJoin,
                                attachmentPlayCount : req.body.attachmentPlayCount
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
                        req.st.db.escape(req.query.APIKey),
                        req.st.db.escape(DBSecretKey)                                                                                
                    ];

                    var procQuery = 'CALL  HE_Get_Appsettings( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        console.log(result) ;
                        if(!err && result && result[0]){
                            var output = [];
                            if(result[1]){
                                for(var i = 0; i < result[1].length; i++) {
                                    var res1 = {};
                                    res1.attachmentId = result[1][i].attachmentId;
                                    res1.seqNo = result[1][i].seqNo;
                                    res1.attachment = result[1][i].attachment;
                                    // res1.attachment = (result[1][i].attachment) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + result[1][i].attachment) : "";
                                    output.push(res1);
                                }
                            }

                            res.status(200).json({status: true,
                                message: "App settings loaded successfully",
                                error : null,
                                data: {
                                    tid : result[0][0].tid,
                                    paymentGateWay : result[0][0].paymentGateWay,
                                    attendence : result[0][0].attendence,
                                    salesAllocationType : result[0][0].salesAllocationType,
                                    supportAllocationType : result[0][0].supportAllocationType,
                                    salesDisplayFormat : result[0][0].salesDisplayFormat,
                                    salesDefaultUser : result[0][0].salesDefaultUser,
                                    salesDefaultUserName : result[0][0].salesDefaultUserName,
                                    supportDefaultUser : result[0][0].supportDefaultUser,
                                    supportDefaultUserName : result[0][0].supportDefaultUserName,
                                    canUserJoin : result[0][0].canUserJoin,
                                    attachmentPlayCount : result[0][0].attachmentPlayCount,
                                    attachments : output
                                }
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

HEBackkendCtrl.saveAttachments = function(req, res, next){

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

                    req.body.attachmentId = req.body.attachmentId ? req.body.attachmentId : 0;
                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.query.APIKey),
                        req.st.db.escape(req.body.attachment),
                        req.st.db.escape(req.body.seqNo),
                        req.st.db.escape(req.body.attachmentId)
                    ];

                    var procQuery = 'CALL HE_Save_companyAttachments( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        if(!err && result && result[0] && result[0][0] ){
                            response.status = true;
                            response.message = "Attachments saved successfully";
                            response.error = null;
                            response.data = {
                                attachmentId : result[0][0].attachmentId,
                                attachment : (result[0][0].attachment) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + result[0][0].attachment) : "",
                                seqNo : result[0][0].seqNo
                            };
                            res.status(200).json(response);
                        }
                        else{
                            response.status = false;
                            response.message = "Error while saving attachments";
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

HEBackkendCtrl.deleteAttachments = function(req, res, next){

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
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }
    if (!req.query.attachmentId)
    {
        error.attachmentId = 'Invalid attachmentId';
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
                        req.st.db.escape(req.query.APIKey),
                        req.st.db.escape(req.query.attachmentId)
                    ];

                    var procQuery = 'CALL HE_delete_companyAttachments( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        if(!err  ){
                            response.status = true;
                            response.message = "Attachment deleted successfully";
                            response.error = null;
                            response.data = null;
                            res.status(200).json(response);
                        }
                        else{
                            response.status = false;
                            response.message = "Error while deleting attachments";
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