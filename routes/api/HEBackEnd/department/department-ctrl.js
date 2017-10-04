/**
 * Created by Jana1 on 09-09-2017.
 */

var departmentCtrl = {};

departmentCtrl.saveDepartment = function(req,res,next){
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
                req.body.departmentId = (req.body.departmentId) ? req.body.departmentId : 0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.departmentId),
                    req.st.db.escape(req.body.title),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_department( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,departmentResult){
                    if(!err){
                        response.status = true;
                        response.message = "Department saved successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving department";
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

departmentCtrl.getDepartment = function(req,res,next){
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
                var procQuery = 'CALL HE_get_department( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,departmentResult){
                    if(!err && departmentResult && departmentResult[0] && departmentResult[0][0]){
                        response.status = true;
                        response.message = "Departments loaded successfully";
                        response.error = null;
                        response.data = {
                            departmentList : departmentResult[0]
                        };
                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Departments loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting departments";
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

departmentCtrl.deleteDepartment = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.departmentId) {
        error.departmentId = 'Invalid departmentId';
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
                    req.st.db.escape(req.query.departmentId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_department( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,departmentResult){

                    if(!err && departmentResult && departmentResult[0] && departmentResult[0][0]._error){
                        switch (departmentResult[0][0]._error) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "Department is in use";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }
                    else if (!err ){
                        response.status = true;
                        response.message = "Department deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting department";
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

module.exports = departmentCtrl;