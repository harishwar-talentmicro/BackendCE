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


module.exports = HEMasterCtrl;