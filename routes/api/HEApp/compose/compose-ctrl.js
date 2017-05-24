/**
 * Created by Jana1 on 15-03-2017.
 */

var notification = null;
var moment = require('moment');
var NotificationTemplater = require('../../../lib/NotificationTemplater.js');
var notificationTemplater = new NotificationTemplater();
var Notification = require('../../../modules/notification/notification-master.js');
var notification = new Notification();
var fs = require('fs');

var composeCtrl = {};

composeCtrl.sendMessage = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };
    var validationFlag = true;
    if (!req.body.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!req.body.message) {
        error.token = 'Invalid message';
        validationFlag *= false;
    }
    if (!req.body.receiverGroupId) {
        error.token = 'Invalid receiverGroupId';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    req.st.validateToken(req.body.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.body.token),
                req.st.db.escape(req.body.message),
                req.st.db.escape(req.body.receiverGroupId)
            ];
            /**
             * Calling procedure to save form template
             * @type {string}
             */
            var procQuery = 'CALL HE_send_message( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,results){
                console.log(results);
                if(!err){

                    response.status = true;
                    response.message = "Message send successfully";
                    response.error = null;
                    response.data = {
                        messageList : results[0]
                    };
                    res.status(200).json(response);

                    // if(results[0][0]._error == "-1")
                    // {
                    //     response.status = false;
                    //     response.message = "Sorry no form is matched";
                    //     response.error = null;
                    //     response.data = "-1" ;
                    //     res.status(200).json(response);
                    // }
                    // else if (results[0][0]._error == "0")
                    // {
                    //     response.status = true;
                    //     response.message = "form is matched";
                    //     response.error = null;
                    //     response.data = results[0];
                    //     res.status(200).json(response);
                    // }

                }
                else{
                    response.status = false;
                    response.message = "Error while searching form";
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


module.exports = composeCtrl;