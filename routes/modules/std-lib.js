"use strict";

var FinalMessage = {
    Message: '',
    StatusCode: '',
    Result: ''
};
var FinalMsgJson = JSON.parse(JSON.stringify(FinalMessage));

function error(err, req, res, next) {
    // log it
    console.error(err.stack);
    console.log('Error Occurred Please try Again..');
    // respond with 500 "Internal Server Error".
    res.json(500,{ status : false, message : 'Internal Server Error', error : {server : 'Exception'}});
};


function StdLib(db){
    this.db = db;
};

/**
 *
 * @param ip
 * @param userAgent
 * @param ezeoneId
 * @param callBack function (err,token)
 */
StdLib.prototype.generateToken = function(ip,userAgent,ezeoneId,callBack){
    var _this = this;
    //console.log('generateToken');
    //var crypto = require("crypto");
    //var algo = "ecdsa-with-SHA1"
    //var rand = crypto.randomBytes(64).toString('hex');;
    //var token = crypto.createHmac(algo, rand)
    //    .update(Date.now().toString())
    //    .digest("hex");
    //return token;


    /////////////////////////////////////////////////////////////////////

    var deviceType = 1;
    var deviceMapping = {
        web : 1,
        android : 2,
        ios : 3,
        windowsPhone : 4,
        windowsApp :  5
    };

    var preUserAgents = {
        android : '$__EZEONE_|_2015_|_ANDROID_|_APP__$',
        ios : 'E-Z-E-O-N-E-!0s-APP-2015',
        windowsPhone : '|eZeOnE_wInDoWs_pHoNe_2O!5|',
        windowsApp : '$_wiNDowS_pcAPp_2015_$'
    };

    for(var agent in preUserAgents){
        if(preUserAgents.hasOwnProperty(agent) && preUserAgents[agent] === userAgent){
            deviceType = deviceMapping[agent];
            break;
        }
    }


    var tokenGenQueryParams = _this.db.escape(ip) + ',' + _this.db.escape(userAgent)
        + ',' + _this.db.escape(ezeoneId) + ',' + _this.db.escape(deviceType);
    var tokenGenQuery = 'CALL pGenerateTokenNew('+tokenGenQueryParams + ')';

    _this.db.query(tokenGenQuery,function(err,results){
       if(err){
           callBack(err,null);
       }
        else{
           if(results){
                if(results[0]){
                    if(results[0][0]){
                        if(results[0][0].token){
                            callBack(null,results[0][0].token);
                        }
                        else{
                            callBack(null,null);
                        }
                    }
                    else{
                        callBack(null,null);
                    }
                }
                else{
                    callBack(null,null);
                }
           }
           else{
               callBack(null,null);
           }
       }
    });


};

/**
 * List of groupTids and their respected EZEID(GroupName) from tmGroups table
 * @param masterIdList [Array]
 * @param groupMasterCallback [Callback Function]
 */
StdLib.prototype.getGroupMasterIdList = function(masterIdList,groupMasterCallback){
    var _this = this;
    if((typeof(groupMasterCallback)).toString() !== "function"){
        groupMasterCallback = function(error,res){
            console.log('No callback passed to getGroupMasterIdList');
            if(error){
                console.log('Error in getGroupMasterIdList');
                console.log(error);
            }
            else{
                console.log(res);
            }
        };
    }


    if(masterIdList){
        if(masterIdList.length){
            var query = "SELECT tid,GroupName FROM tmgroups WHERE GroupType = 1 AND  AdminID IN ("+
                _this.db.escape(masterIdList.join(',')) + ")";

            console.log(query);

            _this.db.query(query,function(err,results){
                if(err){
                    console.log('Error in getGroupMasterIdList');
                    console.log(err);
                    groupMasterCallback(err,null);
                }
                else{
                    groupMasterCallback(null,results);
                }
            });
        }
        else{
            console.log('No masterIdList passed to getGroupMasterIdList');
        }
    }
    else{
        console.log('No masterIdList passed to getGroupMasterIdList');
    }
};

StdLib.prototype.generateRandomHash = function(timeStamp){
    var crypto = require('crypto');
    var hash = crypto.createHash('sha1');
    if(!timeStamp){
        timeStamp = Date.now().toString();
    }
    hash.update(timeStamp.toString());
    return hash.digest('hex') + crypto.randomBytes(30).toString('hex');
}

StdLib.prototype.validateToken = function(Token, CallBack){
    var _this = this;
    console.log('validateToken');

    try {

        //below query to check token exists for the users or not.
        if (Token != null && Token != '') {
            if(Token != 2){
                /**
                 * @info : Token is now queried from session table i.e. tloginout
                 */
                var Query = 'select masterid,token from tloginout where token=' + _this.db.escape(Token)+' AND status = 1';

               _this.db.query(Query, function (err, Result) {
                    if (!err) {
                        if(Result){
                            if (Result.length > 0) {
                                // console.log(Result);
                                console.log('FnValidateToken: Token found');
                                CallBack(null, Result[0]);
                            }
                            else {
                                CallBack(null, null);
                                console.log('FnValidateToken:No Token found');
                            }
                        }
                        else{
                            CallBack(null, null);
                            console.log('FnValidateToken:No Token found');
                        }

                    }
                    else {
                        CallBack(err, null);
                        console.log('FnValidateToken:' + err);

                    }
                });
            }
            else{
                CallBack(null, 'Pass');
            }
        }
        else {
            CallBack(null, null);
            console.log('FnValidateToken: Token is empty');
        }

    }
    catch (ex) {
        console.log('OTP FnValidateToken error:' + ex.description);

        return 'error'
    }
};

StdLib.prototype.validateTokenAp = function(Token, CallBack){
    var _this = this;
    console.log('validateToken AP');
    try {

        //below query to check token exists for the users or not.
        if (Token != null) {
            var Query = 'select Token from tapuser where Token=' +_this.db.escape(Token);
            //var Query = 'select Token from tmaster';
            //70084b50d3c43822fbef
           _this.db.query(Query, function (err, Result) {
                if (!err) {
                    if (Result.length > 0) {
                        // console.log(Result);
                        console.log('FnValidateToken: Token found');
                        CallBack(null, Result[0]);
                    }
                    else {
                        CallBack(null, null);
                        console.log('FnValidateToken:No Token found');
                    }
                }
                else {
                    CallBack(err, null);
                    console.log('FnValidateToken:' + err);

                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnValidateToken: Token is empty');
        }

    }
    catch (ex) {
        console.log('OTP FnValidateToken error:' + ex.description);

        return 'error'
    }
};

StdLib.prototype.sendMail = function(req, res){
    var _this = this;

        try {
            res.setHeader('content-type', 'application/json');
            //user login
            var From = req.body.From;
            var To = req.body.To;
            var Subject = req.body.Subject;
            var Body = req.body.Body;

            if (From != null && To != null && Subject != null) {

                var fs = require('fs');
                fs.readFile("SimpleMail.txt", "utf8", function (err, data) {
                    if (err) throw err;
                    data = data.replace("[Body]", Body);
                    //console.log('Body:' + data);
                    var mailOptions = {
                        from: From,
                        to: To,
                        subject: Subject,
                        html: data // html body
                    };
                    //console.log('Mail Option:' + mailOptions);
                    // send mail with defined transport object
                    //transporter.sendMail(mailOptions, function (error, info) {
                    //    if (error) {
                    //        console.log(error);
                    //        res.json(null);
                    //    } else {
                    //        console.log('Message sent: ' + info.response);
                    //        FinalMsgJson.Message = 'Mail send';
                    //        FinalMsgJson.StatusCode = 200;
                    //        FinalMsgJson.Result = 'Pass';
                    //        res.send(FinalMsgJson);
                    //    }
                    //});
                    FnSendMailEzeid(mailOptions, function (err, Result) {
                        if (!err) {
                            if (Result != null) {
                                console.log('FnSendMail: Mail Sent Successfully');
                                res.send(RtnMessage);
                            }
                            else {
                                console.log('FnSendMail: Mail not Sent Successfully');
                                res.json(null);
                            }
                        }
                        else {
                            console.log('FnSendMail: Error in sending mails' + err);
                            res.json(null);
                        }
                    });


                });
            }
            else {

                if (From == null) {
                    FinalMsgJson.Message = 'FnSendMail: From is empty';
                    console.log('FnSendMail: From is empty');
                }
                else if (To == null) {
                    FinalMsgJson.Message = 'FnSendMail : To is empty';
                    console.log('FnSendMail: To is empty');
                }
                else if (Subject == null) {
                    FinalMsgJson.Message = 'FnSendMail: Subject is empty';
                    console.log('FnSendMail: Subject is empty');
                }
                else if (Body == null) {
                    FinalMsgJson.Message = 'FnSendMail: Body is empty';
                    console.log('FnSendMail: Body is empty');
                }
                else if (Token == null) {
                    FinalMsgJson.Message = 'FnSendMail: Token is empty';
                    console.log('FnSendMail: Token is empty');
                }

                res.statusCode = 400;
                FinalMsgJson.StatusCode = res.statusCode;
                res.send(FinalMsgJson);
            }
        }

        catch (ex) {
            console.log('Logoin error:' + ex.description);

        }

    };

function FnSendMailEzeid(MailContent, CallBack) {
    var _this = this;
    try {

        //below query to check token exists for the users or not.
        if (MailContent != null) {
            //var Query = 'select Token from tmaster';
            //70084b50d3c43822fbef
            var RtnResponse = {
                IsSent: false
            };
            var RtnResponse = JSON.parse(JSON.stringify(RtnResponse));
            var nodemailer = require('nodemailer');
            var smtpTransport = require('nodemailer-smtp-transport');
            var transporter = nodemailer.createTransport(smtpTransport({
                host: 'mail.name.com',
                port: 25,
                auth: {
                    user: 'noreply@ezeid.com',
                    pass: 'Ezeid2015'
                }
            }));
            transporter.sendMail(MailContent, function (error, info) {
                if (error) {
                    console.log('FnSendMailEzeid: sending mail error ' + error);
                    CallBack(null, null);
                }
                else {
                    console.log('FnSendMailEzeid: Message sent: ' + info.response);
                    RtnResponse.IsSent = true;
                    CallBack(null, RtnResponse);
                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnSendMailEzeid: Token is empty');
        }

    }
    catch (ex) {
        console.log('OTP FnSendMailEzeid error:' + ex.description);

        return 'error'
    }
};

StdLib.prototype.fnMessageMail= function(MessageContent, CallBack) {
    var _this = this;
    try {
        //below query to check token exists for the users or not.
        if (MessageContent) {
            var RtnMessage = {
                IsSuccessfull: false
            };
            console.log(' this is MessageContent body............');
            console.log(MessageContent);

            //    token
            //    LocID
            //    messageType
            //    message
            //    ezeid
            //    toEzeid

            var fs = require('fs');
            var i = 1,verified, masterId, LocID, email, verifiedID, salesEmail;
            if (MessageContent.messageType == 1) {
                fs.readFile("SalesEnquiry_receiver.html", "utf8", function (err, data) {
                    var query1 = 'select EZEID,FirstName,LastName,EZEIDVerifiedID,TID,IDTypeID as id from tmaster where EZEID=' + _this.db.escape(MessageContent.ezeid);
                    _this.db.query(query1, function (err, getResult) {
                        if (getResult) {
                            if (getResult[0]) {
                                if (getResult[0].id == 1) {
                                    if (getResult[0].EZEIDVerifiedID == 1) {
                                        verified = 'Not Verified';
                                        console.log('FnSalesMail: not verified')
                                    }
                                    else {
                                        verified = 'Verified';
                                        console.log('FnSalesMail: not verified');
                                    }

                                    data = data.replace("[IsVerified]", verified);
                                    data = data.replace("[FirstName]", getResult[0].FirstName);
                                    data = data.replace("[LastName]", getResult[0].LastName);
                                    data = data.replace("[EZEOneID]", MessageContent.toEzeid);
                                    data = data.replace("[EZEID]", getResult[0].EZEID);
                                    data = data.replace("[EZEID1]", getResult[0].EZEID);
                                    data = data.replace("[Message]", MessageContent.message);

                                    var mail_query = 'Select EZEID,ifnull(EMailID,"") as EMailID from tlocations where MasterID=' + getResult[0].TID;

                                    _this.db.query(mail_query, function (err, get_result) {
                                        console.log(get_result);
                                        if (get_result) {
                                            if (get_result[0]) {
                                                if(get_result[0].EMailID){
                                                    email = get_result[0].EMailID;
                                                }
                                                else
                                                {
                                                    email = '';
                                                }
                                                var mailOptions = {
                                                    from: 'noreply@ezeone.com',
                                                    to: email,
                                                    subject: 'Sales Enquiry',
                                                    html: data // html body
                                                };
                                                console.log(mailOptions);
                                                var queryResult = 'select TID from tmaster where EZEID=' + _this.db.escape(MessageContent.toEzeid);
                                                _this.db.query(queryResult, function (err, result) {
                                                    var post = {
                                                        MessageType: 1,
                                                        Priority: 3,
                                                        ToMailID: mailOptions.to,
                                                        Subject: mailOptions.subject,
                                                        Body: mailOptions.html,
                                                        SentbyMasterID: result[0].TID
                                                    };

                                                    var mailboxQuery = _this.db.query('INSERT INTO tMailbox SET ?', post, function (err, mailResult) {
                                                        // Neat!
                                                        console.log(err);
                                                        if (!err) {
                                                            console.log('FnMessageMail: Mail saved Successfully....1');
                                                            CallBack(null, RtnMessage);
                                                        }
                                                        else {
                                                            console.log('FnMessageMail: Mail not Saved Successfully');
                                                            CallBack(null, null);

                                                        }
                                                    });
                                                });
                                            }
                                            else {
                                                console.log('FnSendMail:getting error from EmailID ');
                                                CallBack(null, null);
                                            }
                                        }
                                        else {
                                            console.log('FnSendMail:getting error from EmailID ');
                                            CallBack(null, null);
                                        }
                                    });
                                }
                                else {
                                    if (getResult[0].EZEIDVerifiedID == 1) {
                                        verified = 'Not Verified';
                                        console.log('FnSalesMail: not verified');
                                    }
                                    else {
                                        verified = 'Verified';
                                        console.log('FnSalesMail:verified');
                                    }
                                    data = data.replace("[IsVerified]", verified);
                                    data = data.replace("[FirstName]", getResult[0].FirstName);
                                    data = data.replace("[LastName]", getResult[0].LastName);
                                    data = data.replace("[EZEOneID]", MessageContent.toEzeid);
                                    data = data.replace("[EZEID]", getResult[0].EZEID);
                                    data = data.replace("[EZEID1]", getResult[0].EZEID);
                                    data = data.replace("[Message]", MessageContent.message);

                                    var mail_query = 'Select EZEID,ifnull(SalesMailID," ") as SalesMailID from tmaster where TID=' + getResult[0].TID;
                                    console.log(mail_query);
                                    _this.db.query(mail_query, function (err, get_result) {

                                        if (get_result) {
                                            if (get_result[0]) {
                                                if(get_result[0].EMailID){
                                                    salesEmail = get_result[0].EMailID;
                                                }
                                                else
                                                {
                                                    salesEmail = '';
                                                }
                                                var mailOptions = {
                                                    from: 'noreply@ezeone.com',
                                                    to: salesEmail,
                                                    subject: 'Sales Enquiry',
                                                    html: data // html body
                                                };
                                                console.log(mailOptions.to);
                                                var queryResult = 'select TID from tmaster where EZEID=' + _this.db.escape(MessageContent.toEzeid);
                                                _this.db.query(queryResult, function (err, result) {

                                                    var post = {
                                                        MessageType: messagetype,
                                                        Priority: 3,
                                                        ToMailID: mailOptions.to,
                                                        Subject: mailOptions.subject,
                                                        Body: mailOptions.html,
                                                        SentbyMasterID: result[0].TID
                                                    };
                                                    //console.log(post);
                                                    var query = _this.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                        // Neat!
                                                        if (!err) {
                                                            console.log('FnMessageMail: Mail saved Successfully....1');
                                                            CallBack(null, RtnMessage);

                                                        }
                                                        else {
                                                            console.log('FnMessageMail: Mail not Saved Successfully');
                                                            CallBack(null, null);
                                                        }
                                                    });
                                                });
                                            }
                                            else {
                                                console.log('FnSendMail:getting error from EmailID ');
                                                CallBack(null, null);
                                            }
                                        }
                                        else {
                                            console.log('FnSendMail:getting error from EmailID ');
                                            CallBack(null, null);
                                        }
                                    });
                                }
                            }
                            else {
                                console.log('FnSendMail:getting error from result');
                                CallBack(null, null);
                            }
                        }
                        else {
                            console.log('FnSendMail:getting error from results ');
                            CallBack(null, null);
                        }
                    });
                });
            }
            else if (MessageContent.messagetype == 3) {
                fs.readFile("homedelivery.html", "utf8", function (err, data) {
                    var query1 = 'select EZEID,EZEIDVerifiedID,TID,IDTypeID as id from tmaster where EZEID=' + _this.db.escape(EZEID);
                    _this.db.query(query1, function (err, getResult) {

                        if (getResult[0].id == 1) {
                            if (getResult[0].EZEIDVerifiedID == 1) {
                                verified = 'Not Verified';
                            }
                            else {
                                verified = 'Verified';
                            }

                            data = data.replace("[IsVerified]", verified);
                            data = data.replace("[EZEOneID]", getResult[0].EZEID);
                            data = data.replace("[EZEID]", getResult[0].EZEID);
                            data = data.replace("[Message]", MessageText);

                            var mail_query = 'Select EZEID,ifnull(EMailID,"") as EMailID from tlocations where MasterID=' + getResult[0].TID;

                            _this.db.query(mail_query, function (err, get_result) {
                                console.log(get_result);
                                if (get_result) {
                                    var mailOptions = {
                                        from: 'noreply@ezeone.com',
                                        to: get_result[0].EMailID,
                                        subject: 'HomeDelivery from ' + ToEZEID,
                                        html: data // html body
                                    };
                                    //console.log(mailOptions);
                                    var queryResult = 'select TID from tmaster where EZEID=' + _this.db.escape(ToEZEID);
                                    _this.db.query(queryResult, function (err, result) {
                                        console.log(result);
                                        var post = {
                                            MessageType: messagetype,
                                            Priority: 3,
                                            ToMailID: mailOptions.to,
                                            Subject: mailOptions.subject,
                                            Body: mailOptions.html,
                                            SentbyMasterID: result[0].TID
                                        };

                                        var query = _this.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: Home Delivery Mail saved Successfully....1');
                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');

                                            }
                                        });
                                    });
                                }
                                else {
                                    console.log('FnSendMail:getting error from EmailID ');
                                }
                            });
                        }
                        else {
                            if (getResult[0].EZEIDVerifiedID == 1) {
                                verified = 'Not Verified';
                            }
                            else {
                                verified = 'Verified';
                            }
                            data = data.replace("[IsVerified]", verified);
                            data = data.replace("[EZEOneID]", getResult[0].EZEID);
                            data = data.replace("[EZEID]", getResult[0].EZEID);
                            data = data.replace("[Message]", MessageText);

                            var mail_query = 'Select EZEID,ifnull(HomeDeliveryMailID," ") as MailID from tmaster where TID=' + getResult[0].TID;
                            console.log(mail_query);
                            _this.db.query(mail_query, function (err, get_result) {

                                if (get_result) {
                                    var mailOptions = {
                                        from: 'noreply@ezeone.com',
                                        to: get_result[0].MailID,
                                        subject: 'HomeDelivery from ' + ToEZEID,
                                        html: data // html body
                                    };
                                    //console.log(mailOptions);
                                    var queryResult = 'select TID from tmaster where EZEID=' + _this.db.escape(ToEZEID);
                                    _this.db.query(queryResult, function (err, result) {

                                        var post = {
                                            MessageType: messagetype,
                                            Priority: 3,
                                            ToMailID: mailOptions.to,
                                            Subject: mailOptions.subject,
                                            Body: mailOptions.html,
                                            SentbyMasterID: result[0].TID
                                        };
                                        //console.log(post);
                                        var query = _this.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: HomeDelivery Mail saved Successfully....1');

                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');

                                            }
                                        });
                                    });
                                }
                                else {
                                    console.log('FnSendMail:getting error from EmailID ');
                                }
                            });
                        }
                    });
                });
            }
            else if (MessageContent.messagetype == 4) {
                fs.readFile("ServiceMail.html", "utf8", function (err, data) {
                    var query1 = 'select EZEID,EZEIDVerifiedID,TID,IDTypeID as id from tmaster where EZEID=' + _this.db.escape(EZEID);
                    _this.db.query(query1, function (err, getResult) {

                        if (getResult[0].id == 1) {
                            if (getResult[0].EZEIDVerifiedID == 1) {
                                verified = 'Not Verified';
                            }
                            else {
                                verified = 'Verified';
                            }

                            data = data.replace("[IsVerified]", verified);
                            data = data.replace("[EZEOneID]", getResult[0].EZEID);
                            data = data.replace("[EZEID]", getResult[0].EZEID);
                            data = data.replace("[Message]", MessageText);

                            var mail_query = 'Select EZEID,ifnull(EMailID,"") as EMailID from tlocations where MasterID=' + getResult[0].TID;

                            _this.db.query(mail_query, function (err, get_result) {
                                console.log(get_result);
                                if (get_result) {
                                    var mailOptions = {
                                        from: 'noreply@ezeone.com',
                                        to: get_result[0].EMailID,
                                        subject: 'Service Request from ' + ToEZEID,
                                        html: data // html body
                                    };
                                    //console.log(mailOptions);
                                    var queryResult = 'select TID from tmaster where EZEID=' + _this.db.escape(ToEZEID);
                                    _this.db.query(queryResult, function (err, result) {
                                        console.log(result);
                                        var post = {
                                            MessageType: messagetype,
                                            Priority: 3,
                                            ToMailID: mailOptions.to,
                                            Subject: mailOptions.subject,
                                            Body: mailOptions.html,
                                            SentbyMasterID: result[0].TID
                                        };

                                        var query = _this.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: Service Mail saved Successfully....1');
                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');

                                            }
                                        });
                                    });
                                }
                                else {
                                    console.log('FnSendMail:getting error from EmailID ');
                                }
                            });
                        }
                        else {
                            if (getResult[0].EZEIDVerifiedID == 1) {
                                verified = 'Not Verified';
                            }
                            else {
                                verified = 'Verified';
                            }
                            data = data.replace("[IsVerified]", verified);
                            data = data.replace("[EZEOneID]", getResult[0].EZEID);
                            data = data.replace("[EZEID]", getResult[0].EZEID);
                            data = data.replace("[Message]", MessageText);

                            var mail_query = 'Select EZEID,ifnull(ServiceMailID," ") as MailID from tmaster where TID=' + getResult[0].TID;
                            console.log(mail_query);
                            _this.db.query(mail_query, function (err, get_result) {

                                if (get_result) {
                                    var mailOptions = {
                                        from: 'noreply@ezeone.com',
                                        to: get_result[0].MailID,
                                        subject: 'Service Request from ' + ToEZEID,
                                        html: data // html body
                                    };
                                    //console.log(mailOptions);
                                    var queryResult = 'select TID from tmaster where EZEID=' + _this.db.escape(ToEZEID);
                                    _this.db.query(queryResult, function (err, result) {

                                        var post = {
                                            MessageType: messagetype,
                                            Priority: 3,
                                            ToMailID: mailOptions.to,
                                            Subject: mailOptions.subject,
                                            Body: mailOptions.html,
                                            SentbyMasterID: result[0].TID
                                        };
                                        //console.log(post);
                                        var query = _this.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: Mail saved Successfully....1');

                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');

                                            }
                                        });
                                    });
                                }
                                else {
                                    console.log('FnSendMail:getting error from EmailID ');
                                }
                            });
                        }
                    });
                });
            }
            else if (MessageContent.messageType == 5) {
                var query = 'select TID from tlocations where EZEID=' + _this.db.escape(MessageContent.toEzeid);
                _this.db.query(query, function (err, getResult) {
                    if (getResult[0]) {
                        LocID = getResult[0].TID;
                        var query = _this.db.escape(MessageContent.token) + ',' + _this.db.escape(LocID) + ',' + _this.db.escape(MessageContent.messageType);
                        console.log('CALL PgetMailSendingDetails(' + query + ')');
                        _this.db.query('CALL PgetMailSendingDetails(' + query + ')', function (err, MessageContentResult) {
                            console.log('--------------------------');
                            console.log(MessageContentResult);
                            console.log('--------------------------');
                            if (!err) {
                                if (MessageContentResult[0] != null) {
                                    if (MessageContentResult[0].length > 0) {

                                        if (MessageContentResult[0].ToMailID != '') {

                                            fs.readFile("cv.html", "utf8", function (err, data) {
                                                if (err) throw err;
                                                data = data.replace("[IsVerified]", 'Not Verified');
                                                data = data.replace("[EZEOneID]", MessageContentResult[0][0].EZEID);
                                                data = data.replace("[EZEID]", MessageContentResult[0][0].EZEID);
                                                data = data.replace("[Functions]", MessageContentResult[0][0].Function);
                                                data = data.replace("[Keyskills]", MessageContentResult[0][0].KeySkills);
                                                data = data.replace("[https://www.ezeone.com/]", 'https://www.ezeone.com/' + MessageContentResult[0].EZEID);

                                                if (MessageContentResult[0][0].DocPin == '') {
                                                    data = data.replace("[PIN]", MessageContentResult[0][0].DocPin);
                                                }
                                                else {
                                                    data = data.replace("[PIN]", MessageContentResult[0][0].DocPin);
                                                }
                                                // console.log(MessageContentResult[0].ToMailID);
                                                // console.log('Body:' + data);
                                                var mailOptions = {
                                                    from: 'noreply@ezeone.com',
                                                    to: MessageContentResult[0][0].ToMailID,
                                                    subject: 'Resume Request',
                                                    html: data // html body
                                                };
                                                console.log('mailOption...................1');
                                                var post = {
                                                    MessageType: MessageContent.messageType,
                                                    Priority: 3,
                                                    ToMailID: mailOptions.to,
                                                    Subject: mailOptions.subject,
                                                    Body: mailOptions.html,
                                                    SentbyMasterID: MessageContentResult[0][0].TID
                                                };
                                                var query = _this.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                    // Neat!
                                                    if (!err) {
                                                        console.log('FnMessageMail: Mail saved Successfully....5');
                                                        CallBack(null, RtnMessage);

                                                    }
                                                    else {
                                                        console.log('FnMessageMail: Mail not Saved Successfully');
                                                        CallBack(null, null);
                                                    }
                                                });
                                            });
                                            /*                                            var nextMessage = function () {
                                             fs.readFile("cv_sender.html", "utf8", function (err, data1) {
                                             if (err) throw err;
                                             data1 = data1.replace("[IsVerified]", 'Not Verified');
                                             data1 = data1.replace("[FirstName]", MessageContentResult[0][0].FirstName);
                                             data1 = data1.replace("[LastName]", MessageContentResult[0][0].LastName);
                                             data1 = data1.replace("[CompanyName]", MessageContentResult[0][0].CompanyName);
                                             data1 = data1.replace("[EZEID]", MessageContentResult[0][0].EZEID);
                                             data1 = data1.replace("[https://www.ezeone.com/]", 'https://www.ezeone.com/' + MessageContentResult[0].EZEID);

                                             if (MessageContentResult[0][0].DocPin == '') {
                                             data1 = data1.replace("[PIN]", MessageContentResult[0][0].DocPin);
                                             }
                                             else {
                                             data1 = data1.replace("[PIN]", MessageContentResult[0][0].DocPin);
                                             }
                                             // console.log(MessageContentResult[0].ToMailID);
                                             // console.log('Body:' + data);
                                             var mailOptions = {
                                             from: 'noreply@ezeid.com',
                                             to: MessageContentResult[0][0].MailID,
                                             subject: 'CV Request',
                                             html: data1 // html body
                                             };
                                             console.log('mailOption...................2');
                                             var post = {
                                             MessageType: MessageContent.messageType,
                                             Priority: 3,
                                             ToMailID: MessageContentResult[0][0].MailID,
                                             Subject: mailOptions.subject,
                                             Body: mailOptions.html,
                                             SentbyMasterID: MessageContentResult[0][0].TID
                                             };
                                             var query = _this.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                             // Neat!
                                             if (!err) {
                                             console.log('FnMessageMail: Mail saved Successfully....6');
                                             CallBack(null, RtnMessage);


                                             }
                                             else {
                                             console.log('FnMessageMail: Mail not Saved Successfully');
                                             CallBack(null, null);

                                             }
                                             });
                                             });
                                             };*/
                                        }
                                        else {
                                            console.log('FnMessageMail: Mail  is empty');
                                        }
                                    }
                                    else {
                                        console.log('FnMessageMail: MessageContent  is empty');

                                    }
                                }
                                else {
                                    console.log('FnMessageMail: MessageContent  is empty');

                                }
                            }
                            else {
                                console.log('FnMessageMail: error');

                            }
                        });
                    }
                    else {
                        console.log('FnMessage:Result is empty');
                    }
                });
            }
        }
        else {
            console.log('FnMessageMail: MessageContent  is empty');
            CallBack(null, null);
        }
    }


    catch (ex) {
        console.log('OTP FnMessageMail Catch error:' + ex.description);
        CallBack(null, null);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

module.exports = StdLib;