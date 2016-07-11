/**
 * Created by Gowrishankar on 05-10-2015
 */

"use strict";

function error(err, req, res, next) {
    // log it
    console.error(err.stack);
    console.log('Error Occurred Please try Again..');
    // respond with 500 "Internal Server Error".
    res.json(500,{ status : false, message : 'Internal Server Error', error : {server : 'Exception'}});
};



var st = null;

function TaskManager(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};


/**
 * @todo FnSaveTaskManager
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @server_param
 * @description save tasks
 */
TaskManager.prototype.saveTaskManager = function(req,res,next) {

    var token = req.body.token;
    var id = parseInt(req.body.id);            // task id
    var status = parseInt(req.body.s);
    var transactionId = (isNaN(parseInt(req.body.tx))) ? 0 :  parseInt(req.body.tx) ;   // Transaction id
    var c_particulars = req.body.cp;           // Conveyance Particulars <string>
    var c_amount = req.body.ca;             // Conveyance Amount <float>
    var userIDs = (req.body.au) ? (req.body.au) : '';              // Additional User IDs (Comma separted MasterIDs of users) <string>
    var taskDate = req.body.ts;            // Task Date and Time (YYYY-MM-DD HH:mm:ss)
    var ownerId = (isNaN(parseInt(req.body.ow))) ?  0 : parseInt(req.body.ow) ;   // Owner ID (Master ID of the task owner)
    var nextActionId = (isNaN(parseInt(req.body.nxid))) ? 0 : parseInt(req.body.nxid);
    var taskParticulars = (req.body.tp) ? req.body.tp  : ''; // Task particulars
    var tid,cd;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!id){
        id = 0;
    }
    if(isNaN(parseInt(id))){
        error['tid'] = 'Invalid id';
        validateStatus *= false;
    }

    if(isNaN(parseInt(status))){
        error['status'] = 'Invalid status';
        validateStatus *= false;
    }
    if(isNaN(parseInt(nextActionId))){
        error['nextActionId'] = 'Invalid nextActionId';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.status = false;
        responseMessage.message = 'Please check the errors below';
        responseMessage.error = error;
        responseMessage.data = null;
        res.status(400).json(responseMessage);
    }
    else{
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        console.log(transactionId,"transactionId");
                        console.log(req.body.tx,"transactionIdtest");
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(id)+ ',' + st.db.escape(transactionId)
                            + ',' + st.db.escape(status) + ',' + st.db.escape(c_particulars) + ',' + st.db.escape(c_amount)
                            + ',' + st.db.escape(userIDs) + ',' + st.db.escape(taskDate)+ ',' + st.db.escape(ownerId)
                            + ',' + st.db.escape(nextActionId) + ',' + st.db.escape(taskParticulars); // New parameter added

                        var query = 'CALL psavetask(' + queryParams + ')';

                        console.log(query);

                        st.db.query(query, function (err, insertresult) {
                            console.log(insertresult);
                            if (!err) {
                                if (insertresult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'TaskManager saved successfully';
                                    if (insertresult[0]) {
                                        if (insertresult[0][0]) {
                                            tid = insertresult[0][0].id;
                                            cd=insertresult[0][0].cd;
                                        }
                                        else {
                                            tid = id;
                                            cd='';
                                        }
                                    }
                                    else {
                                        tid = id;
                                        cd='';
                                    }

                                    responseMessage.data = {
                                        id : tid,
                                        s  : parseInt(req.body.s),
                                        tx : parseInt(req.body.tx),
                                        cp : req.body.cp,
                                        tp : req.body.tp, // Added task particulars
                                        ca : req.body.ca,
                                        au : req.body.au,
                                        ts : req.body.ts,
                                        cd : cd,
                                        ow : parseInt(req.body.ow),
                                        nxid : parseInt(req.body.nxid)
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveTaskManager: TaskManager saved successfully');
                                }
                                else {
                                    responseMessage.message = 'No save TaskManager';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveTaskManager:No save TaskManager');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                res.status(500).json(responseMessage);
                                console.log('FnSaveTaskManager: error in saving TaskManager:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveTaskManager: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveTaskManager:Error in processing Token' + err);
                }
            });
        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveTaskManager:error ' + ex);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};


/**
 * @todo FnGetTasks
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get tasks
 */
TaskManager.prototype.getTasks = function(req,res,next){

    var token = req.query.token;
    var startDate = req.query.st;
    var endDate = req.query.et;
    /**
     * Function Type : 0 - Sales and 4 : Recruitment
     */
    var functionType = (parseInt(req.query.fn_type) == 4) ? req.query.fn_type : 0;
    var tid = (!isNaN(parseInt(req.query.t_id))) ? (parseInt(req.query.t_id)) : 0;  // transaction id

    var responseMessage = {
        status: false,
        data: null,
        message: '',
        error: {}
    };

    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }

    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(startDate)+ ',' + st.db.escape(endDate) + ',' +
                            st.db.escape(token)+ ',' + st.db.escape(functionType)+ ',' + st.db.escape(tid);
                        var query = 'CALL pGetTasks(' + queryParams + ')';
                        console.log(query);

                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if(getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.data = getResult[0];
                                            responseMessage.message = 'Tasks loaded successfully';
                                            responseMessage.error = null;
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetTasks: Tasks loaded successfully');
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.data = getResult[0];
                                            responseMessage.message = 'Tasks loaded successfully';
                                            responseMessage.error = null;
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetTasks: Tasks not present');
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.data = [];
                                        responseMessage.message = 'Tasks loaded successfully';
                                        responseMessage.error = null;
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetTasks: Tasks not present');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Tasks not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetTasks: Tasks not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetTasks: error in getting Client List :' + err);
                            }

                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetTasks: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetTasks:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetTasks ' + ex);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @type : GET
 * @param req
 * @param res
 * @param next
 * @description get salary template details
 * @accepts json
 * @param token <string> token of login user
 * @param taskid <string> task id
 *
 */
TaskManager.prototype.taskDetails = function(req,res,next){
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validationFlag = true;
    var error = {};
    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (isNaN(req.query.taskid) || (req.query.taskid <= 0)){
        error.taskid = 'Invalid task id ';
        validationFlag *= false;
    }
    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else {
        try {
            st.validateToken(req.query.token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var procParams = st.db.escape(req.query.taskid);
                        var procQuery = 'CALL pgettaskdetails(' + procParams + ')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, results) {
                            if (!err) {
                                console.log(results);
                                if (results) {
                                    if (results[0]) {
                                        if (results[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Task details loaded successfully';
                                            responseMessage.data = {
                                                td : results[0]
                                            };
                                            res.status(200).json(responseMessage);
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Task details are not available';
                                            responseMessage.data = null;
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Task details are not available';
                                        responseMessage.data = null;
                                        res.status(200).json(responseMessage);
                                    }

                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Task details are not available';
                                    responseMessage.data = null;
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                responseMessage.message = 'An error occurred !';
                                res.status(500).json(responseMessage);
                                console.log('Error : pgettaskdetails ',err);
                                var errorDate = new Date();
                                console.log(errorDate.toTimeString() + ' ......... error ...........');

                            }
                        });
                    }
                    else{
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('taskDetails: Invalid token');
                    }
                }
                else{
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'An error occurred !';
                    res.status(500).json(responseMessage);
                    console.log('Error : taskDetails ',err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            });
        }
        catch(ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error taskDetails :  ',ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }

};

module.exports = TaskManager;