/**
 * @author Anjali Pandya
 * @description Controller for send notification to ezeoneId given by job raiser to call the user
 * @since August 9, 2016 3:00 PM IST
 */

var Notification = require('../../modules/notification/notification-master.js');
var notification = new Notification();
var moment = require('moment');

var JobRaiserCtrl = {};


JobRaiserCtrl.getCallNotification = function(req,res,next) {
    var response = {
        status: false,
        message: "",
        data: null,
        error: {}
    };
    var validationStatus = true;
    var error  = {};
    var token = '12345';

    if (!req.query.ezeoneId){
        error.ezeoneId = 'Invalid ezeone id';
        validationStatus *= false;
    }
    if(!validationStatus){
        response.S = false;
        response.M = 'Please check the errors below';
        response.E = error;
        response.D = null;
        res.status(400).json(response);
    }
    else {
        if (token == req.query.token){

            var queryParam = [req.st.db.escape(req.query.ezeoneId)];
            /**
             * calling procedure to get masterId and iphone id to send notification
             */
            var procQuery = 'CALL PGetMasterIDforEZEID('+ queryParam.join(',')+')';
            console.log('procQuery',procQuery);
            req.st.db.query(procQuery,function(err, result){
                if (!err && result && result[0] && result[0][0] && result[0][0].groupId){
                    console.log(result);
                    var receiverId = result[0][0].groupId;
                    var message = 'Call Notification';
                    var messageType = 101;

                    var iphoneId = (result[0][0].iphoneDeviceId) ? (result[0][0].iphoneDeviceId) : '';
                    var data = {
                        callingNumber: req.query.phoneNumber,
                        notificationDateTime : moment().format('YYYY-MM-DD HH:mm:ss')
                    };
                    /**
                     * sending notification to ezeoneId with contact number
                     * after receiving notification call will go to given contact number
                     */
                    notification.publish(receiverId,'','','',message,messageType,0,iphoneId,
                        0,0,0,0,1,null,'',0,0,null,'',data,null);


                    response.status = true;
                    response.message = "Notification sent successfully";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }
                else {
                    response.status = false;
                    response.message = "Invalid ezeone id";
                    response.error = null;
                    response.data = null;
                    res.status(200).json(response);
                }

            });
        }
        else {
            response.status = false;
            response.message = "Access denied";
            response.error = null;
            response.data = null;
            res.status(401).json(response);
        }
    }
};

JobRaiserCtrl.saveSettings = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }
    if (!req.body.atsUrl) {
        error.atsUrl = 'Invalid atsUrl';
        validationFlag *= false;
    }
    if (!req.body.userName) {
        error.userName = 'Invalid userName';
        validationFlag *= false;
    }
    if (!req.body.password) {
        error.password = 'Invalid password';
        validationFlag *= false;
    }
    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){
                if((!err) && tokenResult){

                    var procParams = [
                        req.st.db.escape(req.query.token),
                        req.st.db.escape(req.body.atsUrl),
                        req.st.db.escape(req.body.userName),
                        req.st.db.escape(req.body.password)
                    ];
                    /**
                     * Calling procedure to save deal
                     * @type {string}
                     */
                    var procQuery = 'CALL psave_jobraiser_settings( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        if(!err && result){
                            response.status = true;
                            response.message = "Settings saved successfully";
                            response.error = null;
                            response.data = {
                                atsUrl : req.body.atsUrl,
                                userName : req.body.userName,
                                password : req.body.password
                            };
                            res.status(200).json(response);
                        }
                        else{
                            response.status = false;
                            response.message = "Error while saving settings";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};

JobRaiserCtrl.getSettings = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};

    if (!req.query.token) {
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    if (!validationFlag){
        response.error = error;
        response.message = 'Please check the errors';
        res.status(400).json(response);
        console.log(response);
    }
    else {
        try {
            req.st.validateToken(req.query.token,function(err,tokenResult){
                if((!err) && tokenResult){

                    var procParams = [
                        req.st.db.escape(req.query.token)
                    ];
                    var procQuery = 'CALL  pget_jobraiser_settings( ' + procParams.join(',') + ')';
                    console.log(procQuery);
                    req.db.query(procQuery,function(err,result){
                        if(!err && result && result[0]){
                            response.status = true;
                            response.message = "Settings saved successfully";
                            response.error = null;
                            response.data = result[0][0];
                            res.status(200).json(response);
                        }
                        else{
                            response.status = false;
                            response.message = "Error while getting settings";
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
        catch (ex) {
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + '......... error .........');
            console.log(ex);
            console.log('Error: ' + ex);
        }
    }
};
module.exports = JobRaiserCtrl;