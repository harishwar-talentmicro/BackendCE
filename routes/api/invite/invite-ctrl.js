/**
 * Created by vedha on 01-02-2017.
 */
var moment = require('moment');
var inviteCtrl = {};
var request = require('request');
inviteCtrl.invite = function(req, res, next){

    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    var validationFlag = true;
    var error = {};
    var mobileList = '';
    var indiaMobileList = '';
    var nepalMobileList = '';

    var mobile = req.body.contactList;
    if(typeof(mobile) == "string") {
        mobile = JSON.parse(mobile);
    }
    if(!mobile){
        mobile = [];
    }

    var mobileCount = 0;
    var mobileData = mobile[mobileCount];


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
                    var sendInvitation = function(){
                        if(mobileList != "")
                        {
                            mobileList = mobileList.substr(0,mobileList.length - 1);
                            console.log(mobileList,"mobileList");
                            //  sms integration for international (except nepal)
                            request({
                                url: 'https://aikonsms.co.in/control/smsapi.php',
                                qs: {
                                    user_name : 'janardana@hirecraft.com',
                                    password : 'Ezeid2015',
                                    sender_id : 'WtMate',
                                    service : 'INTSMS',
                                    mobile_no: mobileList,
                                    message: " " + tokenResult[0].fullName + " requested you to join EZEOne network. Click on the following link based on your mobile phone type to download App.  Sign-up as new user and enjoy using EZEOne. " +
                                    "\n\n" +
                                    "For Android:  https://www.ezeone.com/EZEONE.android " +
                                    "\n\n" +
                                    "For iOS: https://www.ezeone.com/EZEONE.ios " +
                                    "\n\n" +
                                    "Hope you will enjoy using EZEOne." +
                                    "\n\n" +
                                    "EZEOne Team",
                                    method : 'send_intsms'
                                },
                                method: 'GET'

                            }, function (error, response, body) {
                                if (error) {
                                    console.log(error);
                                    res.json({ status : false, auth: false, message: 'Something went wrong' });
                                }
                                else {
                                    console.log("Message sent successfully");
                                    console.log("Messege body is :" + body);
                                }

                            });

                        }

                        if(indiaMobileList != "")
                        {
                            indiaMobileList = indiaMobileList.substr(0,indiaMobileList.length - 1);
                            console.log(indiaMobileList,"indiaMobileList");
                            //  sms integration for india
                            request({
                                url: 'https://aikonsms.co.in/control/smsapi.php',
                                qs: {
                                    user_name : 'janardana@hirecraft.com',
                                    password : 'Ezeid2015',
                                    sender_id : 'EZEONE',
                                    service : 'TRANS',
                                    mobile_no: indiaMobileList,
                                    message: " " + tokenResult[0].fullName + " requested you to join EZEOne network. Click on the following link based on your mobile phone type to download App.  Sign-up as new user and enjoy using EZEOne. " +
                                    "\n\n" +
                                    "For Android:  https://www.ezeone.com/EZEONE.android " +
                                    "\n\n" +
                                    "For iOS: https://www.ezeone.com/EZEONE.ios " +
                                    "\n\n" +
                                    "Hope you will enjoy using EZEOne." +
                                    "\n\n" +
                                    "EZEOne Team",
                                    method : 'send_sms'
                                },
                                method: 'GET'

                            }, function (error, response, body) {
                                if (error) {
                                    console.log(error);
                                    res.json({ status : false, auth: false, message: 'Something went wrong' });
                                }
                                else {
                                    console.log("Message sent successfully");
                                    console.log("Messege body is :" + body);
                                }

                            });

                        }

                        if(nepalMobileList != "")
                        {
                            /*  SMS integration for nepal */
                            nepalMobileList = nepalMobileList.substr(0,nepalMobileList.length - 1);
                            console.log(nepalMobileList,"nepalMobileList");
                            request({
                                url: 'http://beta.thesmscentral.com/api/v3/sms?',
                                qs: {
                                    token : 'TIGh7m1bBxtBf90T393QJyvoLUEati2FfXF',
                                    to : nepalMobileList,
                                    message: " " + tokenResult[0].fullName + " requested you to join EZEOne network. Click on the following link based on your mobile phone type to download App.  Sign-up as new user and enjoy using EZEOne. " +
                                    "\n\n" +
                                    "For Android:  https://www.ezeone.com/EZEONE.android " +
                                    "\n\n" +
                                    "For iOS: https://www.ezeone.com/EZEONE.ios " +
                                    "\n\n" +
                                    "Hope you will enjoy using EZEOne." +
                                    "\n\n" +
                                    "EZEOne Team",
                                    sender: 'Techingen'
                                },
                                method: 'GET'

                            }, function (error, response, body) {
                                if (error) {
                                    console.log(error);
                                    res.json({ status : false, auth: false, message: 'Something went wrong' });
                                }
                                else {
                                    console.log("Message sent successfully");
                                    console.log("Messege body is :" + body);

                                }

                            });
                        }

                        res.json({ status : true, auth: false, message: 'Invited successfully..',data : null});
                    };

                    var inviteMobile = function(mobileData){

                        var queryParams = req.st.db.escape(mobileData.mobile) + ',' + req.st.db.escape(mobileData.isdMobile) ;
                        var locationInsertQuery = 'CALL invite(' + queryParams + ')';
                        console.log('locationInsertQuery',locationInsertQuery);
                        req.db.query(locationInsertQuery, function (err, results) {
                            if (results) {
                                if (results[0]) {
                                    if (results[0][0]) {
                                        mobileCount +=1;
                                        if(results[0][0].isdMobile == "+977"){
                                            nepalMobileList += results[0][0].mobile + ',';
                                        }
                                        else if(results[0][0].isdMobile == "+91" || results[0][0].isdMobile == "91")
                                        {
                                            indiaMobileList += results[0][0].mobile + ',';
                                        }
                                        else if(results[0][0].isdMobile != "")
                                        {
                                            mobileList += "00" + results[0][0].isdMobile.replace("+","") + results[0][0].mobile + ',';
                                        }

                                        if(mobileCount < mobile.length){
                                            inviteMobile(mobile[mobileCount]);
                                        }
                                        else{
                                            sendInvitation();
                                        }
                                    }
                                    else {
                                        console.log('Invite:results no found');
                                        mobileCount +=1;
                                        if(mobileCount < mobile.length) {
                                            inviteMobile(mobile[mobileCount]);
                                        }
                                        else
                                        {
                                            sendInvitation();
                                        }
                                    }
                                }
                                else {
                                    console.log('FnSaveJobLocation:results no found');
                                    mobileCount +=1;
                                    if(mobileCount < mobile.length) {
                                        inviteMobile(mobile[mobileCount]);
                                    }
                                    else{
                                        sendInvitation();
                                    }
                                }
                            }
                            else {
                                console.log('FnSaveJobLocation:results no found');
                                mobileCount +=1;
                                if(mobileCount < mobile.length) {
                                    inviteMobile(mobile[mobileCount]);
                                }
                                else{
                                    sendInvitation();
                                }
                            }
                        });
                    };
                    //calling function at first time
                    if (mobile) {
                        if (mobile.length > 0) {
                            inviteMobile(mobileData);
                        }
                    }
                    else{
                        res.status(401).json(response);
                    }

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

module.exports = inviteCtrl;