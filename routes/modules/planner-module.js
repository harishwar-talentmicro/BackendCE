/**
 *  @author Gowri shankar
 *  @since Augest 11,2015  02:02PM
 *  @title Job module
 *  @description Handles Planner functions
 */
"use strict";


var st = null;
var appConfig = require('../../ezeone-config.json');
var DBSecretKey=appConfig.DB.secretKey;

function Planner(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};

/**
 * @todo FnGetAllTask
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @service-param token <varchar>
 * @service-param s_time <DateTime> YYYY-MM-DD HH:mm:ss
 * @service-param e_time <DateTime> YYYY-MM-DD HH:mm:ss
 * @description api code for get all tasks based on timestamp
 */
Planner.prototype.getAllTask = function(req,res,next){

    var token = req.query.token;
    var startTime = req.query.s_time;    // YYYY-MM-DD HH:mm:ss
    var endTime = req.query.e_time;      // YYYY-MM-DD HH:mm:ss

    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams =  st.db.escape(token) + ',' + st.db.escape(startTime)+ ',' + st.db.escape(endTime);
                        var taskQuery = 'CALL pLoadTasks(' + queryParams + ')';
                        console.log(taskQuery);

                        st.db.query(taskQuery, function (err, taskResult) {
                            //console.log(taskResult);
                            if (!err) {
                                if (taskResult) {
                                    if (taskResult[0]) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Tasks loaded successfully';
                                            responseMessage.data = {
                                                s_time : req.query.s_time,
                                                e_time : req.query.e_time,
                                                tasks : taskResult[0]
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetAllTask: Tasks loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Tasks not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAllTask:Tasks not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Tasks not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetAllTask:Tasks not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetAllTask: error in getting Message attachement:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetAllTask: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetAllTask:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetAllTask ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetTrans
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @service-param token <varchar>
 * @service-param tid <int> tid of transaction id
 * @description api code for get transaction based on tid
 */
Planner.prototype.getTrans = function(req,res,next){

    var token = req.query.token;
    var tid = parseInt(req.query.tid);


    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(tid)+','+st.db.escape(DBSecretKey);
                        var query = 'CALL pGetMessagesDetails(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Transaction loaded successfully';
                                            responseMessage.data = getResult[0][0];
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetTrans: Transaction loaded successfully');
                                        }
                                        else {
                                            responseMessage.message = 'Transaction not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetTrans:Transaction not loaded');
                                        }

                                    }
                                    else {
                                        responseMessage.message = 'Transaction not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetTrans:Transaction not loaded');
                                    }

                                }
                                else {
                                    responseMessage.message = 'Transaction not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetTrans:Transaction not loaded');
                                }

                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetTrans: error in getting Transaction:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetTrans: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetTrans:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnGetTrans ' + ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

module.exports = Planner;