/**
 * Created by vedha on 06-03-2017.
 */


var formTemplateCtrl = {};
var error = {};

/**
 *
 * @param req
 * @param res
 * @param next
 */
formTemplateCtrl.saveFormTemplate = function(req,res,next){
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

    if (!req.body.formType) {
        error.token = 'Invalid formType';
        validationFlag *= false;
    }
    if (!req.body.formTitle) {
        error.token = 'Invalid formTitle';
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
                req.body.formTemplateId = (req.body.formTemplateId) ? req.body.formTemplateId : 0;
                req.body.status = (req.body.status) ? req.body.status : 0;
                req.body.employee = (req.body.employee) ? req.body.employee : 0;
                req.body.alumni = (req.body.alumni) ? req.body.alumni : 0;
                req.body.public = (req.body.public) ? req.body.public : 0;
                req.body.customer = (req.body.customer) ? req.body.customer : 0;
                req.body.vendor = (req.body.vendor) ? req.body.vendor : 0;
                req.body.timeOut = (req.body.timeOut) ? req.body.timeOut : 0;
                req.body.approversCount = (req.body.approversCount) ? req.body.approversCount : 0;
                req.body.approvalType = (req.body.approvalType) ? req.body.approvalType : 0;
                req.body.layoutJSON = (req.body.layoutJSON) ? req.body.layoutJSON : null ;
                req.body.receiverAllocation = (req.body.receiverAllocation) ? req.body.receiverAllocation : 0 ;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.formTemplateId),
                    req.st.db.escape(req.body.formType),
                    req.st.db.escape(req.body.formTitle),
                    req.st.db.escape(req.body.timeOut),
                    req.st.db.escape(req.body.employee),
                    req.st.db.escape(req.body.alumni),
                    req.st.db.escape(req.body.public),
                    req.st.db.escape(req.body.customer),
                    req.st.db.escape(req.body.vendor),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.layoutJSON),
                    req.st.db.escape(req.body.approversCount),
                    req.st.db.escape(req.body.approvalType),
                    req.st.db.escape(req.body.receiverAllocation),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL save_HEformTemplates( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,formTemplateResult){
                    console.log(err);

                    if(!err && formTemplateResult && formTemplateResult[0] && formTemplateResult[0][0] && formTemplateResult[0][0].formTemplateId){
                        response.status = true;
                        response.message = "Form Template saved successfully";
                        response.error = null;
                        response.formTemplateId = formTemplateResult[0][0].formTemplateId
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving form template";
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

formTemplateCtrl.updateFormTemplate = function(req,res,next){
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

    if (!req.body.formType) {
        error.token = 'Invalid formType';
        validationFlag *= false;
    }
    if (!req.body.formTitle) {
        error.token = 'Invalid formTitle';
        validationFlag *= false;
    }

    if (!req.body.formTemplateId) {
        error.token = 'Invalid formTemplateId';
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
                req.body.formTemplateId = (req.body.formTemplateId) ? req.body.formTemplateId : 0;
                req.body.status = (req.body.status) ? req.body.status : 0;
                req.body.employee = (req.body.employee) ? req.body.employee : 0;
                req.body.alumni = (req.body.alumni) ? req.body.alumni : 0;
                req.body.public = (req.body.public) ? req.body.public : 0;
                req.body.customer = (req.body.customer) ? req.body.customer : 0;
                req.body.vendor = (req.body.vendor) ? req.body.vendor : 0;
                req.body.timeOut = (req.body.timeOut) ? req.body.timeOut : 0;
                req.body.approversCount = (req.body.approversCount) ? req.body.approversCount : 0;
                req.body.approvalType = (req.body.approvalType) ? req.body.approvalType : 0;
                req.body.layoutJSON = (req.body.layoutJSON) ? req.body.layoutJSON : null;
                req.body.receiverAllocation = (req.body.receiverAllocation) ? req.body.receiverAllocation : 0 ;


                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.formTemplateId),
                    req.st.db.escape(req.body.formType),
                    req.st.db.escape(req.body.formTitle),
                    req.st.db.escape(req.body.timeOut),
                    req.st.db.escape(req.body.employee),
                    req.st.db.escape(req.body.alumni),
                    req.st.db.escape(req.body.public),
                    req.st.db.escape(req.body.customer),
                    req.st.db.escape(req.body.vendor),
                    req.st.db.escape(req.body.status),
                    req.st.db.escape(req.body.layoutJSON),
                    req.st.db.escape(req.body.approversCount),
                    req.st.db.escape(req.body.approvalType),
                    req.st.db.escape(req.body.receiverAllocation),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL save_HEformTemplates( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,formTemplateResult){
                    if(!err && formTemplateResult && formTemplateResult[0] && formTemplateResult[0][0] && formTemplateResult[0][0].formTemplateId){
                        response.status = true;
                        response.message = "Form Template saved successfully";
                        response.error = null;
                        response.formTemplateId = formTemplateResult[0][0].formTemplateId
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving form template";
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

formTemplateCtrl.getFormTemplate = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading deal",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.formTemplateId) {
        error.token = 'Invalid formTemplateId';
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
                    req.st.db.escape(req.query.formTemplateId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL get_HEFormTemplateDetails( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,formTemplateResult){
                    if(!err && formTemplateResult && formTemplateResult[0] && formTemplateResult[0][0]){
                        response.status = true;
                        response.message = "Form template loaded successfully";
                        response.error = null;
                        response.data = formTemplateResult[0][0];
                        res.status(200).json(response);

                    }
                    else if(err){
                        response.status = false;
                        response.message = "Error while getting form template";
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

formTemplateCtrl.getFormTemplateList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading deal",
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
                var procQuery = 'CALL get_HEFormTemplateList( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,formTemplateResult){
                    if(!err && formTemplateResult && formTemplateResult[0] && formTemplateResult[0][0]){
                        response.status = true;
                        response.message = "Form template loaded successfully";
                        response.error = null;
                        response.data = {
                            formTemplateList : formTemplateResult[0]
                        };
                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Form template loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting form template";
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

formTemplateCtrl.deleteFormTemplate = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting form template",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.formTemplateId) {
        error.token = 'Invalid formTemplateId';
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
                    req.st.db.escape(req.query.formTemplateId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL delete_HE_FormTemplateDetails( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,formTemplateResult){
                    if(!err){
                        response.status = true;
                        response.message = "Form template deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);

                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting form template";
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

module.exports = formTemplateCtrl;