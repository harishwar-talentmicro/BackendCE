/**
 * Created by Jana1 on 06-04-2017.
 */


var LoginCtrl = {};
var error = {};

LoginCtrl.login = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.EZEOneId)
    {
        error.token = 'Invalid EZEOneId';
        validationFlag *= false;
    }
    if (!req.query.password)
    {
        error.token = 'Invalid password';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateHEToken(req.query.token,req.query.EZEOneId,req.query.password,function(err,tokenResult){
        if((!err) && tokenResult){
            console.log(tokenResult[0].heUserId, "heuserId") ;

            var procParams = [
                req.st.db.escape(tokenResult[0].heUserId)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_formList( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,formList){
                console.log(err);
                if(!err && formList && formList[0] && formList[0][0]){
                    response.status = true;
                    response.message = "Form list loaded successfully";
                    response.error = null;
                    response.data = formList[0];
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting formlist";
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


LoginCtrl.getHelloEZEUsers = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.EZEOneId)
    {
        error.token = 'Invalid EZEOneId';
        validationFlag *= false;
    }
    if (!req.query.password)
    {
        error.token = 'Invalid password';
        validationFlag *= false;
    }
    if (!req.query.userFormMapId)
    {
        error.userFormMapId = 'Invalid userFormMapId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    req.st.validateHEToken(req.query.token,req.query.EZEOneId,req.query.password,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.userFormMapId)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_accessUsersList( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,userList){
                console.log(err);
                if(!err && userList && userList[0]){
                    response.status = true;
                    response.message = "Access user list loaded successfully";
                    response.error = null;
                    response.data = userList[0];
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting user list";
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

LoginCtrl.getTasks = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid credentials",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.query.EZEOneId)
    {
        error.token = 'Invalid EZEOneId';
        validationFlag *= false;
    }
    if (!req.query.password)
    {
        error.token = 'Invalid password';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }

    req.st.validateHEToken(req.query.token,req.query.EZEOneId,req.query.password,function(err,tokenResult){
        if((!err) && tokenResult){

            req.query.HEUserList = req.query.HEUserList ? req.query.HEUserList : '';
            req.query.status = req.query.status ? req.query.status : 0;
            req.query.startDate = req.query.startDate ? req.query.startDate : null;
            req.query.endDate = req.query.endDate ? req.query.endDate : null;
            req.query.pageNo = (req.query.pageNo) ? (req.query.pageNo):1;
            req.query.limit = (req.query.limit) ? (req.query.limit):100;
            req.query.userFormMapId = (req.query.userFormMapId) ? (req.query.userFormMapId):0;

            var procParams = [
                req.st.db.escape(req.query.HEUserList),
                req.st.db.escape(req.query.status),
                req.st.db.escape(req.query.startDate),
                req.st.db.escape(req.query.endDate),
                req.st.db.escape(tokenResult[0].HEMasterId),
                req.st.db.escape(req.query.pageNo),
                req.st.db.escape(req.query.limit),
                req.st.db.escape(req.query.userFormMapId)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_taskList( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,taskList){
                console.log(err);
                if(!err && taskList && taskList[0]){
                    response.status = true;
                    response.message = "Task list loaded successfully";
                    response.error = null;
                    response.data = taskList[0];
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting task list";
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

module.exports = LoginCtrl;