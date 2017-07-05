/**
 * Created by Jana1 on 08-03-2017.
 */

var HEMasterCtrl = {};
HEMasterCtrl.getFormTypeList = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading deal",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){
            req.query.lngId =(req.query.lngId) ? req.query.lngId : 1 ;
            var procParams = [
                req.st.db.escape(req.query.lngId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL get_HEForm_list( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formTypeResult){
                if(!err && formTypeResult && formTypeResult[0] && formTypeResult[0][0]){
                    response.status = true;
                    response.message = "Form type loaded successfully";
                    response.error = null;
                    response.data = {
                        formTypeList : formTypeResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(err){
                    response.status = false;
                    response.message = "Error while getting form type list";
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
};

HEMasterCtrl.saveWorkGroup = function(req,res,next){
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
    if (!req.body.groupName)
    {
        error.groupName = 'Invalid groupName';
        validationFlag *= false;
    }

    if (!validationFlag){

        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            req.body.groupCode = (req.body.groupCode) ? req.body.groupCode : '';

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.groupName),
                req.st.db.escape(req.body.groupCode),
                req.st.db.escape(req.body.groupType)
            ];
            /**
             * Calling procedure to save work group
             * @type {string}
             */

            var procQuery = 'CALL HE_Save_workGroups( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,workGroupResult){
                console.log(err);
                if(!err && workGroupResult && workGroupResult[0] && workGroupResult[0][0]._error){
                    switch (workGroupResult[0][0]._error) {
                        case 'ALREADY_EXISTS' :
                            response.status = false;
                            response.message = "Work group already exists";
                            response.error = null;
                            res.status(200).json(response);
                            break ;

                        default:
                            break;
                    }

                }
                if(!err){
                    response.status = true;
                    response.message = "Work group saved successfully";
                    response.error = null;
                    response.workGroupId = workGroupResult[0][0].workGroupId;
                    res.status(200).json(response);
                }
                else{
                    console.log(err,"err");
                    response.status = false;
                    response.message = "Error while Work group";
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

HEMasterCtrl.getWorkGroup = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_workGroups( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,workGroupResult){
                if(!err && workGroupResult && workGroupResult[0] && workGroupResult[0][0]){
                    response.status = true;
                    response.message = "Work group loaded successfully";
                    response.error = null;
                    response.data = {
                        workGroupList : workGroupResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Work group loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting work group";
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

HEMasterCtrl.saveFormGroup = function(req,res,next){
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
    if (!req.body.templateName)
    {
        error.templateName = 'Invalid templateName';
        validationFlag *= false;
    }

    if (!req.body.templateCode)
    {
        error.templateCode = 'Invalid templateCode';
        validationFlag *= false;
    }

    var formList =req.body.formList;
    if(typeof(formList) == "string") {
        formList = JSON.parse(formList);
    }
    if(!formList){
        error.formList = 'Invalid formList';
        validationFlag *= false;
    }

    if (!validationFlag){

        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            req.body.templateId = (req.body.templateId) ? req.body.templateId : 0;
            req.body.userType = (req.body.userType) ? req.body.userType : 0;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.body.templateId),
                req.st.db.escape(req.body.templateName),
                req.st.db.escape(req.body.templateCode),
                req.st.db.escape(req.body.userType),
                req.st.db.escape(JSON.stringify(formList))
            ];
            /**
             * Calling procedure to save work group
             * @type {string}
             */

            var procQuery = 'CALL HE_save_formGroup( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formGroupResult){
                if(!err && formGroupResult && formGroupResult[0] && formGroupResult[0][0]._error){
                    switch (formGroupResult[0][0]._error) {
                        case 'ALREADY_EXISTS' :
                            response.status = false;
                            response.message = "Duplicate template name or code ";
                            response.error = null;
                            res.status(200).json(response);
                            break ;

                        default:
                            break;
                    }

                }
                if(!err){
                    response.status = true;
                    response.message = "Form template saved successfully";
                    response.error = null;
                    res.status(200).json(response);
                }
                else{
                    console.log(err,"err");
                    response.status = false;
                    response.message = "Error while form template";
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

HEMasterCtrl.getFormGroupList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_Get_formGroup_List( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formGroupResult){
                if(!err && formGroupResult && formGroupResult[0] && formGroupResult[0][0]){
                    response.status = true;
                    response.message = "Form template loaded successfully";
                    response.error = null;
                    response.data = {
                        formTemplateList : formGroupResult[0]
                    }
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
};

HEMasterCtrl.getFormGroupDetails = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.formGroupId) {
        error.formGroupId = 'Invalid formGroupId';
        validationFlag *= false;
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
                req.st.db.escape(req.query.formGroupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_Get_formGroup_details( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formGroupResult){
                if(!err && formGroupResult && formGroupResult[0] && formGroupResult[0][0]){
                    response.status = true;
                    response.message = "Form template details loaded successfully";
                    response.error = null;
                    response.data = {
                        formTemplateDetails : formGroupResult[0],
                        formList : formGroupResult[1]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Form template details loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting form template details";
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

/* List of form need to select */
HEMasterCtrl.getFormsNeedToSelect = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            req.query.formGroupId = (req.query.formGroupId) ? req.query.formGroupId : 0;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.formGroupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_formsNeedToSelect( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formResult){
                if(!err && formResult && formResult[0] && formResult[0][0]){
                    response.status = true;
                    response.message = "Form list loaded successfully";
                    response.error = null;
                    response.data = {
                        formList : formResult[0]
                    }
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Form list loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting form list ";
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

/*
 To get approverGroupList and receiverGroupList
*/
HEMasterCtrl.getFormWorkList = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;


    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){


            var procParams = [
                req.st.db.escape(req.query.token)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_form_workGroups( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formResult){
                if(!err && formResult && formResult[0] && formResult[0][0]){
                    response.status = true;
                    response.message = "Group list loaded successfully";
                    response.error = null;
                    response.data = {
                        approverGroupList : formResult[0],
                        receiverGroupList : formResult[1]
                    };
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Group list loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting Group list ";
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

HEMasterCtrl.deleteWorkGroup = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting work group",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.workGroupId) {
        error.workGroupId = 'Invalid workGroupId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }
    console.log(req.query.token,"req.query.token");

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.workGroupId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL he_delete_workgroup( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,workGroupResult){

                if(!err && workGroupResult && workGroupResult[0] && workGroupResult[0][0]._error){
                    switch (workGroupResult[0][0]._error) {
                        case 'IN_USE' :
                            response.status = false;
                            response.message = "work group is in use";
                            response.error = null;
                            res.status(200).json(response);
                            break ;
                    }
                }
                else if (!err ){
                    response.status = true;
                    response.message = "work group deleted successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while deleting work group";
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

HEMasterCtrl.deleteFormGroup = function(req,res,next){
    var response = {
        status : false,
        message : "Error while deleting form template",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.templateId) {
        error.templateId = 'Invalid templateId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
    }

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.templateId)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL he_delete_formTemplategroup( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,workGroupResult){

                if(!err && workGroupResult && workGroupResult[0] && workGroupResult[0][0]._error){
                    switch (workGroupResult[0][0]._error) {
                        case 'IN_USE' :
                            response.status = false;
                            response.message = "Form template is in use";
                            response.error = null;
                            res.status(200).json(response);
                            break ;
                    }
                }
                else if (!err ){
                    response.status = true;
                    response.message = "Form template deleted successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while deleting form template";
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

module.exports = HEMasterCtrl;