/**
 * Created by vedha on 24-12-2017.
 */

var generalRequestCtrl = {};

generalRequestCtrl.saveGeneralRequest = function(req,res,next){
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

    if (!req.body.title)
    {
        error.token = 'Invalid title';
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
                req.body.generalRequestId = (req.body.generalRequestId) ? req.body.generalRequestId : 0;
                req.body.isBudget = (req.body.isBudget) ? req.body.isBudget : 0;
                req.body.budgetLabel = req.body.budgetLabel != undefined ? req.body.budgetLabel : "Budget";

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.generalRequestId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.isBudget),
                    req.st.db.escape(req.body.budgetLabel)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_GeneralRequestTypes( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,generalRequestResult){
                    if(!err){
                        response.status = true;
                        response.message = "General request type saved successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving general request type";
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

generalRequestCtrl.getGeneralRequest = function(req,res,next){
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
                var procQuery = 'CALL HE_get_GeneralRequestTypes( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,gradeResult){
                    if(!err && gradeResult && gradeResult[0] && gradeResult[0][0]){
                        response.status = true;
                        response.message = "General request types loaded successfully";
                        response.error = null;
                        response.data = {
                            generalRequest : gradeResult[0]
                        };
                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "No data found";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting general request types";
                        response.error = null;
                        response.data = {
                            generalRequest : []
                        };
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

generalRequestCtrl.deleteGeneralRequest = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;

    if (!req.query.generalRequestId) {
        error.generalRequestId = 'Invalid generalRequestId';
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
                    req.st.db.escape(req.query.generalRequestId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_GeneralRequestTypes( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,generalRequestResult){

                    if(!err && generalRequestResult && generalRequestResult[0] && generalRequestResult[0][0]._error){
                        switch (generalRequestResult[0][0]._error) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "General Request is in use";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }
                    else if (!err ){
                        response.status = true;
                        response.message = "General request type deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting grade general request type";
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

module.exports = generalRequestCtrl;