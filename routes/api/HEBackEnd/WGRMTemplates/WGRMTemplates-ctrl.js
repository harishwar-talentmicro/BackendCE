/**
 * Created by Jana1 on 16-01-2018.
 */
var WGRMTemplateCtrl = {};
var error = {};


WGRMTemplateCtrl.saveWGTemplate = function(req,res,next){
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
    if (!req.body.title) {
        error.title = 'Invalid Title';
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
                req.body.tId = (req.body.tId) ? req.body.tId : 0;
                req.body.title = (req.body.title) ? req.body.title : "";
                req.body.userType = (req.body.userType) ? req.body.userType : "";
                req.body.heMasterId = (req.body.heMasterId) ? req.body.heMasterId : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.body.userType),
                    req.st.db.escape(JSON.stringify(req.body.workGroup)),
                    req.st.db.escape(req.query.APIKey)


                ];

                var procQuery = 'CALL he_save_workGroup( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,workgroupresult){
                    console.log(err);

                    if(!err && workgroupresult && workgroupresult[0]){
                        response.status = true;
                        response.message = "workgroup Template saved successfully";
                        response.error = null;
                        response.data = {
                            workGroupId : workgroupresult[0][0].workGroupId
                        };

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving workgroup template";
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

WGRMTemplateCtrl.saveRMTemplate = function(req,res,next){
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
    if (!req.body.title) {
        error.title = 'Invalid Title';
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
                req.body.tId = (req.body.tId) ? req.body.tId : 0;
                req.body.title = (req.body.title) ? req.body.title : "";
                req.body.heMasterId = (req.body.heMasterId) ? req.body.heMasterId : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.tId),
                    req.st.db.escape(req.body.heMasterId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(JSON.stringify(req.body.approvers)),
                    req.st.db.escape(req.query.APIKey),

                ];

                var procQuery = 'CALL he_save_rmGroup( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,rmgroupresult){
                    console.log(err);

                    if(!err && rmgroupresult && rmgroupresult[0]){
                        response.status = true;
                        response.message = "RM group Template saved successfully";
                        response.error = null;
                        response.data = {
                            rmGroupId : rmgroupresult[0][0].rmGroupId
                        };

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving RM group template";
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

WGRMTemplateCtrl.getWGTemplate = function(req,res,next){
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
                req.query.heMasterId = (req.query.heMasterId) ? req.query.heMasterId : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.APIKey)

                ];

                var procQuery = 'CALL he_get_workGrouplist( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,workgroupresult){
                    console.log(err);

                    if(!err && workgroupresult && workgroupresult[0]){
                        response.status = true;
                        response.message = " workgroup Template loaded successfully";
                        response.error = null;
                        response.data = {
                            workGroupTitleList : workgroupresult[0]
                        };

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading workgroup template";
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

WGRMTemplateCtrl.getRMTemplate = function(req,res,next){
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
                req.query.heMasterId = (req.query.heMasterId) ? req.query.heMasterId : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.heMasterId),
                    req.st.db.escape(req.query.APIKey)

                ];

                var procQuery = 'CALL he_get_rmGrouplist( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,rmgroupresult){
                    console.log(err);

                    if(!err && rmgroupresult && rmgroupresult[0]){
                        response.status = true;
                        response.message = " rmgroup Template loaded successfully";
                        response.error = null;
                        response.data = {
                            rmGroupTitleList : rmgroupresult[0]
                        };

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading rmgroup template";
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

WGRMTemplateCtrl.getWGTemplatedetailes = function(req,res,next){
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
                req.query.workGroupId = (req.query.workGroupId) ? req.query.workGroupId : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.workGroupId),
                    req.st.db.escape(req.query.APIKey)

                ];

                var procQuery = 'CALL he_get_workGroupDetaile( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,workgroupresult){
                    console.log(err);

                    if(!err && workgroupresult && workgroupresult[0] && workgroupresult[0][0] && workgroupresult[1]){
                        response.status = true;
                        response.message = " Workgroup Template detailes loaded successfully";
                        response.error = null;
                        response.data = {
                            formId : workgroupresult[0][0].formId,
                            heFormId :workgroupresult[0][0].heFormId,
                            receivers:workgroupresult[1]

                        };

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading Workgroup template detailes";
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

WGRMTemplateCtrl.getRMTemplatedetailes = function(req,res,next){
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
                req.query.rmGroupId = (req.query.rmGroupId) ? req.query.rmGroupId : 0;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.query.rmGroupId),
                    req.st.db.escape(req.query.APIKey)

                ];

                var procQuery = 'CALL he_get_rmGroupDetaile( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,rmgroupresult){
                    console.log(err);

                    if(!err && rmgroupresult && rmgroupresult[0]){
                        response.status = true;
                        response.message = " RMgroup Template detailes loaded successfully";
                        response.error = null;
                        response.data = {
                            approvers:rmgroupresult[0]
                        };

                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while loading RMgroup template detailes";
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



module.exports = WGRMTemplateCtrl;
