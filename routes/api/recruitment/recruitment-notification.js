var express = require('express');
var router = express.Router();
var Notification = require('../../modules/notification/notification-master.js');

/**
 * Method : GET
 * @param req
 * @param req
 * @param res
 * @param next
 * @discription : API to get notification details for recruitment
 * @param token* <string> token of login user
 * @param cvid <int> cv id
 *
 */
var notification = new Notification();
 router.get('/notify',function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };
    var validationFlag = true;
    var error = {};

    if(!req.query.token){
        error.token = 'Invalid token';
        validationFlag *= false;
    }

    req.query.cvid = (req.query.cvid) ? parseInt(req.query.cvid) : 0;

    if(isNaN(req.query.cvid) || req.query.cvid < 1){
        req.query.cvid = 0;
    }

    if(!validationFlag){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
        console.log(responseMessage);
    }
    else{
        try {
            if (req.query.token) {
                req.st.validateToken(req.query.token, function (err, tokenResult) {
                    if (!err) {
                        if (tokenResult) {
                            var notiQueryParams = req.db.escape(req.query.token) + ',' + req.db.escape(req.query.cvid);
                            var notiQuery = 'CALL get_cv_notifiy_details(' + notiQueryParams + ')';
                            console.log("notiQuery",notiQuery);
                                req.db.query(notiQuery, function (err, results) {
                                    if (!err) {
                                        console.log(results);
                                        if (results) {
                                            if (results[0]) {
                                                if (results[0].length > 0) {
                                                    var receiverId = results[0][0].gid;
                                                    var groupId = results[0][0].gid;
                                                    // dummy data to testing purpose
                                                    var senderTitle = '';
                                                    var groupTitle = '@sgowri2';
                                                    var messageText = 'xyz';
                                                    var senderTitle = '@sgowri2';
                                                    var iphoneId = '';
                                                    var data = {
                                                        mobile_no : results[0][0].mobile_no
                                                    };
                                                    var operationType = 0;
                                                    /**
                                                     * messageType 18 is when recruitment done
                                                     */
                                                    var messageType = 18;
                                                    responseMessage.status = true;
                                                    responseMessage.data = results[0];
                                                    responseMessage.error = null;
                                                    responseMessage.message = ' notify result loaded successfully';
                                                    res.status(200).json(responseMessage);
                                                    //var message = '';
                                                    var issos = false;
                                                    console.log(receiverId,senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId,data);
                                                    notification.publish(receiverId,senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId,data);
                                                }
                                                else {
                                                    responseMessage.message = 'No data available';
                                                    responseMessage.status = true;
                                                    res.json(responseMessage);
                                                }
                                            }
                                            else {
                                                responseMessage.message = 'No data available';
                                                res.json(responseMessage);
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'No data available';
                                            res.json(responseMessage);
                                        }

                                    }
                                    else {
                                        responseMessage.data = null;
                                        responseMessage.message = 'Error in getting notify result';
                                        console.log('get_cv_notifiy_details: Error in getting notify result' + err);
                                        res.status(500).json(responseMessage);
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
                        }
                    }
                    else {
                        responseMessage.error = {
                            server: 'Internal Server Error'
                        };
                        responseMessage.message = 'Error in validating Token';
                        res.status(500).json(responseMessage);
                    }
                });
            }

            else {
                if (!req.query.token) {
                    responseMessage.message = 'Invalid Token';
                    responseMessage.error = {
                        Token : 'Invalid Token'
                    };

                }

                res.status(401).json(responseMessage);
            }
        }
        catch (ex) {
            responseMessage.error = {};
            responseMessage.message = 'An error occured !';
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
});

module.exports = router;