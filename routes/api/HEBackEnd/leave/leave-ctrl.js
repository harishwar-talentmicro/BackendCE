/**
 * Created by Jana1 on 25-04-2017.
 */

var leaveCtrl = {};
var error = {};

leaveCtrl.saveLeaveTypes = function(req,res,next){
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
    if (!req.body.shortCode)
    {
        error.shortCode = 'Invalid shortCode';
        validationFlag *= false;
    }

    if (!req.body.leaveTitle)
    {
        error.leaveTitle = 'Invalid leaveTitle';
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
                req.body.leaveDescription = (req.body.leaveDescription) ? req.body.leaveDescription : '';
                req.body.leaveTypeId = (req.body.leaveTypeId) ? req.body.leaveTypeId : 0;
                req.body.backdatePeriod = (req.body.backdatePeriod != undefined) ? req.body.backdatePeriod : 0;
                req.body.leaveLimit = (req.body.leaveLimit != undefined) ? req.body.leaveLimit : 2;

                req.body.resetType = (req.body.resetType != undefined) ? req.body.resetType : 0;
                req.body.lastResetDate = (req.body.lastResetDate != undefined) ? req.body.lastResetDate : null;
                req.body.resetDuration = (req.body.resetDuration != undefined) ? req.body.resetDuration : 0;
                req.body.resetFrequency = (req.body.resetFrequency != undefined) ? req.body.resetFrequency : 0;
                req.body.initialValue = (req.body.initialValue != undefined) ? req.body.initialValue : 0;
                req.body.incrementValue = (req.body.incrementValue != undefined) ? req.body.incrementValue : 0;
                req.body.lastIncrementDate = (req.body.lastIncrementDate != undefined) ? req.body.lastIncrementDate : null;
                req.body.incrementDuration = (req.body.incrementDuration != undefined) ? req.body.incrementDuration : 0;
                req.body.incrementFrequency = (req.body.incrementFrequency != undefined) ? req.body.incrementFrequency : 0;
                req.body.nextResetDate = (req.body.nextResetDate != undefined) ? req.body.nextResetDate : null;
                req.body.nextIncrementDate = (req.body.nextIncrementDate != undefined) ? req.body.nextIncrementDate : null;
                req.body.calculationType= req.body.calculationType ? req.body.calculationType:0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.leaveTypeId),
                    req.st.db.escape(req.body.shortCode),
                    req.st.db.escape(req.body.leaveTitle),
                    req.st.db.escape(req.body.leaveDescription),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.backdatePeriod),
                    req.st.db.escape(req.body.leaveLimit),
                    req.st.db.escape(req.body.resetType),
                    req.st.db.escape(req.body.lastResetDate),
                    req.st.db.escape(req.body.resetDuration),
                    req.st.db.escape(req.body.resetFrequency),
                    req.st.db.escape(req.body.initialValue),
                    req.st.db.escape(req.body.incrementValue),
                    req.st.db.escape(req.body.lastIncrementDate),
                    req.st.db.escape(req.body.incrementDuration),
                    req.st.db.escape(req.body.incrementFrequency),
                    req.st.db.escape(req.body.calculationType)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_leaveTypes( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,leaveTypeResult){
                    if(!err){
                        response.status = true;
                        response.message = "Leave type saved successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving leave type";
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

leaveCtrl.updateLeaveTypes = function(req,res,next){
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
    if (!req.body.leaveTypeId)
    {
        error.leaveTypeId = 'Invalid leaveTypeId';
        validationFlag *= false;
    }

    if (!req.body.shortCode)
    {
        error.shortCode = 'Invalid shortCode';
        validationFlag *= false;
    }

    if (!req.body.leaveTitle)
    {
        error.leaveTitle = 'Invalid leaveTitle';
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
                req.body.leaveDescription = (req.body.leaveDescription) ? req.body.leaveDescription : '';
                req.body.backdatePeriod = (req.body.backdatePeriod != undefined) ? req.body.backdatePeriod : 0;
                req.body.leaveLimit = (req.body.leaveLimit != undefined) ? req.body.leaveLimit : 2;

                req.body.resetType = (req.body.resetType != undefined) ? req.body.resetType : 0;
                req.body.lastResetDate = (req.body.lastResetDate != undefined) ? req.body.lastResetDate : null;
                req.body.resetDuration = (req.body.resetDuration != undefined) ? req.body.resetDuration : 0;
                req.body.resetFrequency = (req.body.resetFrequency != undefined) ? req.body.resetFrequency : 0;
                req.body.initialValue = (req.body.initialValue != undefined) ? req.body.initialValue : 0;
                req.body.incrementValue = (req.body.incrementValue != undefined) ? req.body.incrementValue : 0;
                req.body.lastIncrementDate = (req.body.lastIncrementDate != undefined) ? req.body.lastIncrementDate : null;
                req.body.incrementDuration = (req.body.incrementDuration != undefined) ? req.body.incrementDuration : 0;
                req.body.incrementFrequency = (req.body.incrementFrequency != undefined) ? req.body.incrementFrequency : 0;
                // req.body.nextResetDate = (req.body.nextResetDate != undefined) ? req.body.nextResetDate : null;
                // req.body.nextIncrementDate = (req.body.nextIncrementDate != undefined) ? req.body.nextIncrementDate : null;
                req.body.calculationType= req.body.calculationType ? req.body.calculationType:0;

                var procParams = [
                    req.st.db.escape(req.query.token),
                    req.st.db.escape(req.body.leaveTypeId),
                    req.st.db.escape(req.body.shortCode),
                    req.st.db.escape(req.body.leaveTitle),
                    req.st.db.escape(req.body.leaveDescription),
                    req.st.db.escape(req.query.APIKey),
                    req.st.db.escape(req.body.backdatePeriod),
                    req.st.db.escape(req.body.leaveLimit),
                    req.st.db.escape(req.body.resetType),
                    req.st.db.escape(req.body.lastResetDate),
                    req.st.db.escape(req.body.resetDuration),
                    req.st.db.escape(req.body.resetFrequency),
                    req.st.db.escape(req.body.initialValue),
                    req.st.db.escape(req.body.incrementValue),
                    req.st.db.escape(req.body.lastIncrementDate),
                    req.st.db.escape(req.body.incrementDuration),
                    req.st.db.escape(req.body.incrementFrequency),
                    req.st.db.escape(req.body.calculationType)

                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_leaveTypes( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,leaveTypeResult){
                    if(!err){
                        response.status = true;
                        response.message = "Leave type saved successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving leave type";
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

leaveCtrl.getLeaveTypes = function(req,res,next){
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
                var procQuery = 'CALL HE_get_leaveType( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,leaveTypeResult){
                    if(!err && leaveTypeResult && leaveTypeResult[0] && leaveTypeResult[0][0]){
                        response.status = true;
                        response.message = "Leave type loaded successfully";
                        response.error = null;
                        response.data = {
                            leaveTypeList : leaveTypeResult[0]
                        };
                        res.status(200).json(response);

                    }
                    else if(!err){
                        response.status = true;
                        response.message = "Leave type loaded successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while getting Leave type";
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

leaveCtrl.deleteLeaveTypes = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.query.leaveTypeId) {
        error.leaveTypeId = 'Invalid leaveTypeId';
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
                    req.st.db.escape(req.query.leaveTypeId),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to get form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_delete_leaveType( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,leaveTypeResult){

                    if(!err && leaveTypeResult && leaveTypeResult[0] && leaveTypeResult[0][0]._error){
                        switch (leaveTypeResult[0][0]._error) {
                            case 'IN_USE' :
                                response.status = false;
                                response.message = "Leave type is in use";
                                response.error = null;
                                res.status(200).json(response);
                                break ;
                        }
                    }
                    else if (!err ){
                        response.status = true;
                        response.message = "Leave type deleted successfully";
                        response.error = null;
                        response.data = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while deleting leave type";
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

leaveCtrl.saveLeaveBalance = function(req,res,next){
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

    if (!req.body.HEUsersId) {
        error.HEUsersId = 'Invalid HEUsersId';
        validationFlag *= false;
    }
    if (!req.query.APIKey)
    {
        error.APIKey = 'Invalid APIKey';
        validationFlag *= false;
    }

    var leaveTypes =req.body.leaveTypes;
    if(typeof(leaveTypes) == "string") {
        leaveTypes = JSON.parse(leaveTypes);
    }
    if(!leaveTypes){
        error.leaveTypes = 'Invalid leaveTypes';
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
                    req.st.db.escape(req.body.HEUsersId),
                    req.st.db.escape(JSON.stringify(leaveTypes)),
                    req.st.db.escape(req.query.APIKey)
                ];
                /**
                 * Calling procedure to save form template
                 * @type {string}
                 */
                var procQuery = 'CALL HE_save_leaveBalance( ' + procParams.join(',') + ')';
                console.log(procQuery);
                req.db.query(procQuery,function(err,leaveBalanceResult){
                    if(!err){
                        response.status = true;
                        response.message = "Leave balance saved successfully";
                        response.error = null;
                        res.status(200).json(response);
                    }
                    else{
                        response.status = false;
                        response.message = "Error while saving leave balance";
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

leaveCtrl.getLeaveBalance = function(req,res,next){
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
    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            req.query.limit = (req.query.limit) ? (req.query.limit) : 25;
            req.query.startPage = (req.query.startPage) ? (req.query.startPage) : 1;
            req.query.employeeCode = (req.query.employeeCode) ? (req.query.employeeCode) : '';
            req.query.name = (req.query.name) ? (req.query.name) : '';
            req.query.dateFrom = (req.query.dateFrom) ? (req.query.dateFrom) : null;
            req.query.dateTo = (req.query.dateTo) ? (req.query.dateTo) : null;
            var startPage = 0;

            startPage = ((((parseInt(req.query.startPage)) * req.query.limit) + 1) - req.query.limit) - 1;

            var procParams = [
                req.st.db.escape(req.query.token),
                req.st.db.escape(req.query.employeeCode),
                req.st.db.escape(req.query.name),
                req.st.db.escape(startPage),
                req.st.db.escape(req.query.limit),
                req.st.db.escape(req.query.dateFrom),
                req.st.db.escape(req.query.dateTo),
                req.st.db.escape(req.query.APIKey)
            ];
            /**
             * Calling procedure to get form template
             * @type {string}
             */
            var procQuery = 'CALL HE_get_employer_leaveBalance( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,leaveTypeResult){
                if(!err && leaveTypeResult && leaveTypeResult[0] && leaveTypeResult[0][0]){
                    response.status = true;
                    response.message = "Leave balance loaded successfully";
                    response.error = null;
                    var outputArray=[];
                    for (var i = 0; i < leaveTypeResult[0].length; i++ ) {
                        var result = {};
                        result.HEUserId = leaveTypeResult[0][i].HEUserId,
                        result.name = leaveTypeResult[0][i].name,
                        result.employeeCode = leaveTypeResult[0][i].employeeCode,
                        result.updatedDate = leaveTypeResult[0][i].updatedDate,
                        result.leaveTypes = JSON.parse(leaveTypeResult[0][i].leaveTypes)
                        outputArray.push(result);
                    }

                    response.data = {
                        count : leaveTypeResult[1][0].count,
                        userList : outputArray
                    };
                    res.status(200).json(response);

                }
                else if(!err){
                    response.status = true;
                    response.message = "Leave balance loaded successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else{
                    response.status = false;
                    response.message = "Error while getting Leave balance";
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

module.exports = leaveCtrl;