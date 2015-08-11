/**
 *  @author Gowri shankar
 *  @since Augest 11,2015  02:02PM
 *  @title Job module
 *  @description Handles Planner functions
 */
"use strict";

var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';

function alterEzeoneId(ezeoneId){
    var alteredEzeoneId = '';
    if(ezeoneId){
        if(ezeoneId.toString().substr(0,1) == '@'){
            alteredEzeoneId = ezeoneId;
        }
        else{
            alteredEzeoneId = '@' + ezeoneId.toString();
        }
    }
    return alteredEzeoneId;
}
var st = null;
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
    var _this = this;

    var token = req.query.token;
    var startTime = req.query.s_time;
    var endTime = req.query.e_time;

    var responseMessage = {
        status: false,
        error: null,
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =  st.db.escape(token) + ',' + st.db.escape(startTime)+ ',' + st.db.escape(endTime);
                        var query = 'CALL (' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0){
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Tasks loaded successfully';
                                            responseMessage.data = getResult[0][0];
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
            console.log('Error : FnGetAllTask ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = Planner;