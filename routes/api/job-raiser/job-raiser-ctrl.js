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
module.exports = JobRaiserCtrl;