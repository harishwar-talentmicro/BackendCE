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

StdLib.prototype.generateToken = function(){
    var crypto = require("crypto");
    var algo = "ecdsa-with-SHA1"
    var rand = crypto.randomBytes(64).toString('hex');;
    var token = crypto.createHmac(algo, rand)
        .update(Date.now().toString())
        .digest("hex");
    return token;
};

StdLib.prototype.validateToken = function(Token, CallBack){
    try {

        //below query to check token exists for the users or not.
        if (Token != null && Token != '') {
            if(Token != 2){
                var Query = 'select TID,Token from tmaster where Token=' + db.escape(Token);
                //var Query = 'select Token from tmaster';
                //70084b50d3c43822fbef
                db.query(Query, function (err, Result) {
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
    try {

        //below query to check token exists for the users or not.
        if (Token != null) {
            var Query = 'select Token from tapuser where Token=' + db.escape(Token);
            //var Query = 'select Token from tmaster';
            //70084b50d3c43822fbef
            db.query(Query, function (err, Result) {
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

function FnMessageMail(MessageContent, CallBack) {
    try {

        //below query to check token exists for the users or not.
        if (MessageContent != null) {
            var RtnMessage = {
                IsSuccessfull: false
            };
            console.log(' this is MessageContent body............');
            console.log(MessageContent);
            var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
            var fs = require('fs');
            var MessageType = null;
            //  console.log(MessageContent.MessageType);

            if (MessageContent.MessageType == 0) {
                MessageType = 1;
            } else if (MessageContent.MessageType == 6) {
                MessageType = 3;
            } else {
                MessageType = MessageContent.MessageType;
            }
            var query = db.escape(MessageContent.Token) + ',' + db.escape(MessageContent.LocID) + ',' + db.escape(MessageType);

            //  console.log(query);//console.log('FnSaveMessage: Inserting data: ' + query);
            db.query('CALL PgetMailSendingDetails(' + query + ')', function (err, MessageContentResult) {
                if (!err) {
                    if (MessageContentResult[0] != null) {
                        if (MessageContentResult[0].length > 0) {

                            if (MessageContentResult[0].ToMailID != '') {
                                /* if (MessageContent.MessageType == 0) {
                                 fs.readFile("Individual.txt", "utf8", function (err, data) {
                                 if (err) throw err;
                                 // console.log(MessageContentResult);
                                 data = data.replace('[IsVerified]', MessageContentResult[0].EZEIDVerifiedID);
                                 data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                 data = data.replace("[Message]", MessageContent.Message);
                                 data = data.replace("[https://www.ezeid.com?ID=]", 'https://www.ezeid.com?ID=' + MessageContentResult[0].EZEID);
                                 // console.log('Body:' + data);
                                 //  console.log(MessageContentResult[0].ToMailID);
                                 var TomailOptions = {
                                 from: 'noreply@ezeid.com',
                                 to: MessageContentResult[0].ToMailID,
                                 subject: 'Message from ' + MessageContentResult[0].EZEID,
                                 html: data // html body
                                 };
                                 //console.log(TomailOptions);
                                 var post = { MessageType: db.escape(MessageContent.MessageType), ToMailID: MessageContentResult[0].ToMailID, Subject: TomailOptions.subject, Body: TomailOptions.html };
                                 //  console.log(post);
                                 var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                 // Neat!
                                 if (!err) {
                                 console.log('FnMessageMail: Mail saved Successfully');
                                 CallBack(null, RtnMessage);
                                 }
                                 else {
                                 console.log('FnMessageMail: mail not saved Successfully: ' + err);
                                 CallBack(null, null);
                                 }
                                 });
                                 });
                                 }
                                 else */
                                if (MessageContent.MessageType == 1) {
                                    fs.readFile("SalesEnquiry.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Message]", MessageContent.Message);
                                        data = data.replace("[https://www.ezeid.com/]", 'https://www.ezeid.com/' + MessageContentResult[0].EZEID);
                                        // console.log('Body:' + data);
                                        // console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Sales Enquiry from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType, Priority: 3,ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                        // console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
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
                                } else if (MessageContent.MessageType == 2) {
                                    fs.readFile("HomeDelivery.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Message]", MessageContent.Message);
                                        data = data.replace("[https://www.ezeid.com/]", 'https://www.ezeid.com/' + MessageContentResult[0].EZEID);

                                        // console.log('Body:' + data);
                                        //  console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Home Delivery request from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType,Priority: 3, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                        // console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: Mail saved Successfully....2');
                                                CallBack(null, RtnMessage);
                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');
                                                CallBack(null, null);
                                            }
                                        });
                                    });
                                } else if (MessageContent.MessageType == 3) {
                                    fs.readFile("Reservation.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Message]", MessageContent.Message);
                                        var moment = require('moment');
                                        // console.log(moment(dateconvert).format('DD-MMM-YYYY HH:MM a'));
                                        if (MessageContent.TaskDateTime != null || MessageContent.TaskDateTime == null) {
                                            MessageContent.TaskDateTime = moment(new Date(MessageContent.TaskDateTime)).format('DD-MMM-YYYY HH:MM a');
                                        }
                                        else {
                                            MessageContent.TaskDateTime = '';
                                        }
                                        //  console.log(moment(new Date(MessageContent.TaskDateTime)).format('DD-MMM-YYYY HH:MM a'));
                                        data = data.replace("[ActionDate]", MessageContent.TaskDateTime);
                                        data = data.replace("[https://www.ezeid.com/]", 'https://www.ezeid.com/' + MessageContentResult[0].EZEID);
                                        // console.log('Body:' + data);
                                        // console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Reservation Request from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType, Priority: 3,ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                        // console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: Mail saved Successfully.....3');
                                                CallBack(null, RtnMessage);
                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');
                                                CallBack(null, null);
                                            }
                                        });
                                    });
                                } else if (MessageContent.MessageType == 4) {
                                    fs.readFile("ServiceRequest.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Message]", MessageContent.Message);
                                        data = data.replace("[https://www.ezeid.com/]", 'https://www.ezeid.com/' + MessageContentResult[0].EZEID);
                                        // console.log('Body:' + data);
                                        //  console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Service Request from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType,Priority: 3, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                        // console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnMessageMail: Mail saved Successfully.....4');
                                                CallBack(null, RtnMessage);
                                            }
                                            else {
                                                console.log('FnMessageMail: Mail not Saved Successfully');
                                                CallBack(null, null);
                                            }
                                        });
                                    });
                                } else if (MessageContent.MessageType == 5) {
                                    fs.readFile("CV.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        console.log('--------------------------');
                                        console.log(MessageContentResult);
                                        console.log('--------------------------');
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Functions]", MessageContentResult[0].Function);
                                        data = data.replace("[Roles]", MessageContentResult[0].Role);
                                        data = data.replace("[Keyskills]", MessageContentResult[0].KeySkills);
                                        data = data.replace("[https://www.ezeid.com/]", 'https://www.ezeid.com/' + MessageContentResult[0].EZEID);

                                        if (MessageContentResult[0].DocPin == '') {
                                            data = data.replace("[PIN]", MessageContentResult[0].DocPin);
                                        }
                                        else {
                                            data = data.replace("[PIN]", MessageContentResult[0].DocPin);
                                        }
                                        // console.log(MessageContentResult[0].ToMailID);
                                        // console.log('Body:' + data);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Application for a Suitable Employment',
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType,Priority: 3, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                        console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
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
                                }
                                /*else if (MessageContent.MessageType == 6) {
                                 fs.readFile("Appointment.txt", "utf8", function (err, data) {
                                 if (err) throw err;
                                 var moment = require('moment');
                                 if (MessageContent.TaskDateTime != null) {
                                 MessageContent.TaskDateTime = moment(new Date(MessageContent.TaskDateTime)).format('DD-MMM-YYYY HH:MM a');
                                 }
                                 else {
                                 MessageContent.TaskDateTime = '';
                                 }
                                 data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                 data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                 data = data.replace("[Message]", MessageContent.Message);
                                 var moment = require('moment');
                                 // console.log(moment(dateconvert).format('DD-MMM-YYYY HH:MM a'));

                                 data = data.replace("[ActionDate]", MessageContent.TaskDateTime);
                                 data = data.replace("[https://www.ezeid.com?ID=]", 'https://www.ezeid.com?ID=' + MessageContentResult[0].EZEID);
                                 // console.log('Body:' + data);
                                 // console.log(MessageContentResult[0].ToMailID);
                                 var mailOptions = {
                                 from: 'noreply@ezeid.com',
                                 to: MessageContentResult[0].ToMailID,
                                 subject: 'Appointment Request from  ' + MessageContentResult[0].EZEID,
                                 html: data // html body
                                 };
                                 var post = { MessageType: MessageContent.MessageType,Priority: 3, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: MessageContent.TID };
                                 // console.log(post);
                                 var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                 // Neat!
                                 if (!err) {
                                 console.log('FnMessageMail: Mail saved Successfully');
                                 CallBack(null, RtnMessage);
                                 }
                                 else {
                                 console.log('FnMessageMail: Mail not Saved Successfully');
                                 CallBack(null, null);
                                 }
                                 });
                                 });
                                 }*/
                            }
                            else {
                                console.log('FnMessageMail: Email  is empty');
                                CallBack(null, null);
                            }
                        }
                        else {
                            console.log('FnMessageMail: Messages not inserted');
                            CallBack(null, null);
                        }
                    }
                    else {
                        console.log('FnMessageMail: Messages not inserted');
                        CallBack(null, null);
                    }
                }
                else {
                    CallBack(null, null);
                    console.log('FnMessageMail: Error in saving Messages : ' + err);
                }
            });
        }
        else {
            CallBack(null, null);
            console.log('FnMessageMail: Token is empty');
        }

    }
    catch (ex) {
        console.log('OTP FnMessageMail error:' + ex.description);

        return 'error'
    }
};

module.exports = StdLib;