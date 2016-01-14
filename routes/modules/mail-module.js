/**
 * Created by Gowrishankar on 19-08-2015.
 */

"use strict";

function error(err, req, res, next) {
    // log it
    console.error(err.stack);
    console.log('Error Occurred Please try Again..');
    // respond with 500 "Internal Server Error".
    res.json(500,{ status : false, message : 'Internal Server Error', error : {server : 'Exception'}});
};

var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';
var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');

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

var Mailer = require('./mailer-ejs.js');
var hussMailer = null;

var st = null;

function Mail(db,stdLib){

    if(stdLib){
        st = stdLib;
        hussMailer = new Mailer(db,stdLib);
    }
};


Mail.prototype.sendMail = function(req, res){
    var _this = this;
    console.log('coming....');
    try {
        res.setHeader('content-type', 'application/json');
        //user login
        var From = req.body.From;
        var To = req.body.To;
        var Subject = req.body.Subject;
        var Body = req.body.Body;

        if (From != null && To != null && Subject != null) {

            var fs = require('fs');

            var path = require('path');
            var file = path.join(__dirname,'../../mail/templates/SimpleMail.txt');

            fs.readFile(file, "utf8", function (err, data) {
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

        if (MailContent != null) {

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

Mail.prototype.fnMessageMail= function(messageContent, callBack) {
    var _this = this;

    console.log('-----MAIL MODULE-----');
    try {

        if (messageContent) {
            var responseMessage = {
                status: false
            };
            // token, locId, messageType, message, ezeid, toEzeid, itemsList
            var fs = require('fs');
            var i = 1,name,locId=0,verified, messageType = messageContent.messageType;
            if (messageType == 0) {
                console.log('-----SALES MAIL MODULE-----');
                var query1 = 'select EZEID,EZEIDVerifiedID as verifiedId,TID,IDTypeID as id from tmaster where EZEID=' + st.db.escape(messageContent.ezeid);
                //console.log(query1);

                st.db.query(query1, function (err, getResult) {
                    if (getResult) {
                        if (getResult[0]) {
                            if (getResult[0].id == 1) {
                                console.log('individual user of sales....');
                                if (getResult[0].verifiedId == 1) {
                                    verified = 'Not Verified';
                                    //console.log('FnSalesMail: not verified')
                                }
                                else {
                                    verified = 'Verified';
                                    //console.log('FnSalesMail: Verified');
                                }

                                var mail_query = 'Select EZEID,SalesMailID as salesEmail,CompanyName,FirstName as fn,ifnull(LastName,"") as ln from tmaster where EZEID=' +st.db.escape(messageContent.toEzeid);

                                //console.log(mail_query);

                                st.db.query(mail_query, function (err, get_result) {
                                    console.log(get_result);
                                    if (get_result) {
                                        if (get_result[0]) {
                                            if (get_result[0].salesEmail) {

                                                name = get_result[0].fn + ' ' + get_result[0].ln;
                                                //console.log(name);

                                                var mailContent = {
                                                    type : 'sales',
                                                    fullname : name,
                                                    email : get_result[0].salesEmail,
                                                    toEmail : get_result[0].salesEmail,
                                                    status : verified,
                                                    toEzeid: messageContent.toEzeid,
                                                    ezeid: getResult[0].EZEID,
                                                    message : messageContent.message

                                                };

                                                hussMailer.sendMail(mailContent, function (err, mailResult) {
                                                    //console.log('Mail Result.........');

                                                    if (mailResult) {

                                                        var post = {
                                                            MessageType: messageContent.messageType,
                                                            Priority: 3,
                                                            ToMailID: mailResult.to,
                                                            Subject: 'Sales Enquiry',
                                                            Body: mailResult.html,
                                                            SentStatus: 1
                                                        };

                                                        var mailboxQuery = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, mailboxResult) {
                                                            if (!err) {
                                                                console.log('FnMessageMail: MailContent saved Successfully....1');
                                                                responseMessage.status = true;
                                                                callBack(null, responseMessage);
                                                            }
                                                            else {
                                                                console.log('FnMessageMail: MailContent not Saved Successfully');
                                                                callBack(null, responseMessage);

                                                            }
                                                        });
                                                    }
                                                    else {
                                                        console.log('FnSendMail:error getting from mailResult');
                                                        callBack(null, responseMessage);
                                                    }
                                                });
                                            }
                                            else {
                                                console.log('FnSendMail: error getting from EmailID ');
                                                callBack(null, responseMessage);
                                            }
                                        }
                                        else {
                                            console.log('FnSendMail: error getting from EmailID ');
                                            callBack(null, responseMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnSendMail: error getting from EmailID ');
                                        callBack(null, responseMessage);
                                    }
                                });
                            }
                            else {
                                console.log('business user of sales....');
                                if (getResult[0].verifiedId == 1) {
                                    verified = 'Not Verified';
                                    console.log('FnSalesMail: not verified');
                                }
                                else {
                                    verified = 'Verified';
                                    console.log('FnSalesMail:verified');
                                }

                                name = getResult[0].fn + ' ' + getResult[0].ln;

                                var mail_query = 'Select EZEID,SalesMailID as salesEmail,CompanyName,FirstName as fn,ifnull(LastName,"") as ln from tmaster where EZEID=' +st.db.escape(messageContent.toEzeid);
                                st.db.query(mail_query, function (err, get_result) {
                                    console.log(mail_query);
                                    console.log(get_result);

                                    if (get_result) {
                                        if (get_result[0]) {
                                            if (get_result[0].salesEmail) {

                                                var mailContent = {
                                                    type : 'sales',
                                                    fullname : name,
                                                    email : get_result[0].salesEmail,
                                                    toEmail : get_result[0].salesEmail,
                                                    status : verified,
                                                    toEzeid: messageContent.toEzeid,
                                                    ezeid: getResult[0].EZEID,
                                                    message : messageContent.message

                                                };

                                                hussMailer.sendMail(mailContent, function (err, mailResult) {
                                                    //console.log('Mail Result.........');
                                                    //console.log(mailResult);
                                                    if (mailResult) {
                                                        var post = {
                                                            MessageType: messageContent.messageType,
                                                            Priority: 3,
                                                            ToMailID: mailResult.to,
                                                            Subject: mailResult.subject,
                                                            Body: mailResult.html,
                                                            SentStatus: 1
                                                        };
                                                        //console.log(post);
                                                        var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, mailboxResult) {
                                                            // Neat!
                                                            if (!err) {
                                                                console.log('FnMessageMail: Mail saved Successfully....1');
                                                                responseMessage.status = true;
                                                                callBack(null, responseMessage);

                                                            }
                                                            else {
                                                                console.log('FnMessageMail: Mail not Saved Successfully');
                                                                callBack(null, responseMessage);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        console.log('FnSendMail: error getting from mailResult ');
                                                        callBack(null, responseMessage);
                                                    }
                                                });
                                            }
                                            else {
                                                console.log('FnSendMail: error getting from EmailID ');
                                                callBack(null, responseMessage);
                                            }
                                        }
                                        else {
                                            console.log('FnSendMail: error getting from EmailID ');
                                            callBack(null, responseMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnSendMail: error getting from EmailID ');
                                        callBack(null, responseMessage);
                                    }
                                });
                            }
                        }
                        else {
                            console.log('FnSendMail: Error : User Details not found');
                            callBack(null, responseMessage);
                        }
                    }
                    else {
                        console.log('FnSendMail: Error : User Details not found');
                        callBack(null, responseMessage);
                    }
                });
            }
            /*else if (messageType == 2) {
             console.log('-----HOME DELIVERY MAIL MODULE-----');
             var path = require('path');
             var file = path.join(__dirname,'../../mail/templates/homedelivery.html');

             fs.readFile(file, "utf8", function (err, data) {
             var query1 = 'select EZEID,EZEIDVerifiedID as verifiedId,TID,IDTypeID as id from tmaster where EZEID=' + st.db.escape(EZEID);
             st.db.query(query1, function (err, getResult) {

             if (getResult[0].id == 1) {
             if (getResult[0].verifiedId == 1) {
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

             st.db.query(mail_query, function (err, get_result) {
             console.log(get_result);
             if (get_result) {
             var mailOptions = {
             from: 'noreply@ezeone.com',
             to: get_result[0].EMailID,
             subject: 'HomeDelivery from ' + ToEZEID,
             html: data // html body
             };
             //console.log(mailOptions);
             var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(ToEZEID);
             st.db.query(queryResult, function (err, result) {
             console.log(result);
             var post = {
             MessageType: messagetype,
             Priority: 3,
             ToMailID: mailOptions.to,
             Subject: mailOptions.subject,
             Body: mailOptions.html,
             SentbyMasterID: result[0].TID
             };

             var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
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
             if (getResult[0].verifiedId == 1) {
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
             st.db.query(mail_query, function (err, get_result) {

             if (get_result) {
             var mailOptions = {
             from: 'noreply@ezeone.com',
             to: get_result[0].MailID,
             subject: 'HomeDelivery from ' + ToEZEID,
             html: data // html body
             };
             //console.log(mailOptions);
             var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(ToEZEID);
             st.db.query(queryResult, function (err, result) {

             var post = {
             MessageType: messagetype,
             Priority: 3,
             ToMailID: mailOptions.to,
             Subject: mailOptions.subject,
             Body: mailOptions.html,
             SentbyMasterID: result[0].TID
             };
             //console.log(post);
             var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
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
             else if (messageType == 3) {
             console.log('-----SERVICE MAIL MODULE-----');
             var path = require('path');
             var file = path.join(__dirname,'../../mail/templates/ServiceMail.html');

             fs.readFile(file, "utf8", function (err, data) {
             var query1 = 'select EZEID,EZEIDVerifiedID as verifiedId,TID,IDTypeID as id from tmaster where EZEID=' + st.db.escape(EZEID);
             st.db.query(query1, function (err, getResult) {

             if (getResult[0].id == 1) {
             if (getResult[0].verifiedId == 1) {
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

             st.db.query(mail_query, function (err, get_result) {
             console.log(get_result);
             if (get_result) {
             var mailOptions = {
             from: 'noreply@ezeone.com',
             to: get_result[0].EMailID,
             subject: 'Service Request from ' + ToEZEID,
             html: data // html body
             };
             //console.log(mailOptions);
             var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(ToEZEID);
             st.db.query(queryResult, function (err, result) {
             console.log(result);
             var post = {
             MessageType: messagetype,
             Priority: 3,
             ToMailID: mailOptions.to,
             Subject: mailOptions.subject,
             Body: mailOptions.html,
             SentbyMasterID: result[0].TID
             };

             var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
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
             if (getResult[0].verifiedId == 1) {
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
             st.db.query(mail_query, function (err, get_result) {

             if (get_result) {
             var mailOptions = {
             from: 'noreply@ezeone.com',
             to: get_result[0].MailID,
             subject: 'Service Request from ' + ToEZEID,
             html: data // html body
             };
             //console.log(mailOptions);
             var queryResult = 'select TID from tmaster where EZEID=' + st.db.escape(ToEZEID);
             st.db.query(queryResult, function (err, result) {

             var post = {
             MessageType: messagetype,
             Priority: 3,
             ToMailID: mailOptions.to,
             Subject: mailOptions.subject,
             Body: mailOptions.html,
             SentbyMasterID: result[0].TID
             };
             //console.log(post);
             var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
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
             }*/
            else if (messageType == 4) {
                console.log('-----RESUME(CV) MAIL MODULE-----');
                var url='';
                var query = 'select TID from tlocations where EZEID=' + st.db.escape(messageContent.toEzeid);
                st.db.query(query, function (err, getResult) {
                    if (getResult[0]) {
                        locId = getResult[0].TID;
                        var query = st.db.escape(messageContent.token) + ',' + st.db.escape(locId) + ',' + st.db.escape(messageContent.messageType);
                        console.log('CALL PgetMailSendingDetails(' + query + ')');
                        st.db.query('CALL PgetMailSendingDetails(' + query + ')', function (err, resumeDetails) {
                            //console.log(resumeDetails);
                            if (!err) {
                                if (resumeDetails[0]) {
                                    if (resumeDetails[0][0]) {
                                        if (resumeDetails[0][0].ToMailID) {
                                            if (resumeDetails[0][0].DocPin) {
                                                url = 'https://www.ezeone.com/' + resumeDetails[0][0].EZEID + '.CV.' + resumeDetails[0][0].DocPin;
                                                //console.log(url);
                                            }
                                            else{
                                                url = 'https://www.ezeone.com/' + resumeDetails[0][0].EZEID + '.CV';
                                                //console.log(url);
                                            }

                                            name = resumeDetails[0][0].FirstName + ' ' + resumeDetails[0][0].LastName;
                                            var mailContent = {
                                                type: 'cv',
                                                fullname: name,
                                                email: resumeDetails[0][0].MailID,   // from mail id
                                                toEmail: resumeDetails[0][0].ToMailID,
                                                status: 'Not Verified',
                                                toEzeid: messageContent.toEzeid,
                                                ezeid: resumeDetails[0][0].EZEID,
                                                function : resumeDetails[0][0].Function,
                                                keyskills :resumeDetails[0][0].KeySkills,
                                                url: url,
                                                message: messageContent.message
                                            };

                                            //console.log(mailContent);

                                            hussMailer.sendMail(mailContent, function (err, mailResult) {
                                                //console.log('Mail Result.........');
                                                //console.log(mailResult);
                                                if (mailResult) {

                                                    var post = {
                                                        MessageType: messageContent.messageType,
                                                        Priority: 3,
                                                        ToMailID: mailResult.to,
                                                        Subject: mailResult.subject,
                                                        Body: mailResult.html,
                                                        SentStatus: 1
                                                    };

                                                    var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, mailboxResult) {
                                                        if (!err) {
                                                            console.log('FnMessageMail: Mail saved Successfully....5');
                                                            responseMessage.status = true;
                                                            callBack(null, responseMessage);
                                                        }
                                                        else {
                                                            console.log('FnMessageMail: Mail not Saved Successfully');
                                                            callBack(null, responseMessage);
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log('FnMessageMail: Mail Result not found');
                                                    callBack(null, responseMessage);
                                                }
                                            });
                                        }
                                        else {
                                            console.log('FnMessageMail: ToMailId not found');
                                            callBack(null, responseMessage);

                                        }
                                    }
                                    else {
                                        console.log('FnMessageMail: Resume Details not found');
                                        callBack(null, responseMessage);

                                    }
                                }
                                else {
                                    console.log('FnMessageMail: Resume Details not found');
                                    callBack(null, responseMessage);

                                }
                            }
                            else {
                                console.log('FnMessageMail: Resume Details not found : ' +err);
                                callBack(null, responseMessage);

                            }
                        });
                    }
                    else {
                        console.log('FnMessage:LocID is not found');
                        callBack(null, responseMessage);
                    }
                });
            }

            else
            {
                console.log('FnMessageMail: FunctionType is not matched');
                callBack(null, responseMessage);
            }
        }
        else {
            console.log('FnMessageMail: messageContent  is empty');
            callBack(null, responseMessage);
        }
    }


    catch (ex) {
        console.log('OTP FnMessageMail Catch error:' + ex.description);
        callBack(null, null);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

Mail.prototype.sendRegMail= function(mailContent, callBack) {
    var _this = this;

    console.log('-----REGISTERATION MAIL MODULE-----');
    try {

        if (mailContent) {
            var responseMessage = {
                status: false
            };
            var fs = require('fs');
            hussMailer.sendMail(mailContent, function (err, mailResult) {
                if (!err) {

                    if (mailResult) {
                        //console.log(mailResult);

                        var post = {
                            MessageType: 8,
                            Priority: 3,
                            ToMailID: mailResult.to,
                            Subject: mailResult.subject,
                            Body: mailResult.html,
                            SentStatus: 1
                        };

                        var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, mailboxResult) {

                            if (!err) {
                                console.log('FnMessageMail: Mail send Successfully');
                                responseMessage.status = true;
                                callBack(null, responseMessage);

                            }
                            else {
                                console.log('FnMessageMail: Mail not send');
                                callBack(null, responseMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSendMail: error getting from mailResult ');
                        callBack(null, responseMessage);
                    }
                }
            });
        }
    }
    catch (ex) {
        console.log('OTP FnMessageMail Catch error:' + ex.description);
        callBack(null, null);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * @todo FnBussinessMail
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description send business mail
 */
Mail.prototype.businessMail = function(req,res,next) {

    /**
     * checking input parameters are json or not
     * @param token (char(36))
     * @param subject (string)
     * @param recipients (array) // to email id
     * @param recipients_cc <array>
     * @param recipients_bcc <array>
     * @param body (string)
     */

    var isJson = req.is('json');

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    if(!isJson){
        error['isJson'] = 'Invalid Input ContentType';
        validateStatus *= false;
    }
    else {
        /**
         * storing and validating the input parameters
         */

        var token = req.body.token;
        var subject = req.body.subject;
        var recipients = req.body.recipients;
        var recipientsCc = req.body.recipients_cc;
        var recipientsBcc = req.body.recipients_bcc;
        var body = req.body.body;
        var sender;

        var util = require('util');
        util.isArray(recipients);
        console.log(util.isArray(recipients));


        if (!token) {
            error['token'] = 'token is Mandatory';
            validateStatus *= false;
        }
        if (!(util.isArray(recipients))) {
            error['recipients'] = 'recipients is array';
            validateStatus *= false;
        }
        if (!(util.isArray(recipientsCc))) {
            error['recipientsCc'] = 'recipients Cc is array';
            validateStatus *= false;
        }
        if (!(util.isArray(recipientsBcc))) {
            error['recipientsBcc'] = 'recipients Bcc is array';
            validateStatus *= false;
        }
        if (!body) {
            error['body'] = 'body is Mandatory';
            validateStatus *= false;
        }
    }

    if(!validateStatus) {
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token);
                        var query = 'CALL pcheckverifiedstatus(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, userstatusResult) {
                            console.log(userstatusResult);
                            if (!err) {
                                if (userstatusResult) {
                                    if (userstatusResult[0]) {
                                        if (userstatusResult[0][0]) {
                                            if (userstatusResult[0][0].verified == 2) {

                                                if(userstatusResult[0][0].CVMailID){
                                                    sender = userstatusResult[0][0].CVMailID;
                                                }
                                                else if(userstatusResult[0][0].AdminEmailID){
                                                    sender = userstatusResult[0][0].AdminEmailID;
                                                }
                                                else{
                                                    sender = 'noreply@ezeone.com';
                                                }

                                                var email = new sendgrid.Email();
                                                email.from = sender;
                                                email.setTos(recipients);
                                                email.setCcs(recipientsCc);
                                                email.setBccs(recipientsBcc);
                                                email.subject = subject;
                                                email.html = body;

                                                sendgrid.send(email, function (err, result) {
                                                    console.log(err);
                                                    if (!err) {
                                                        responseMessage.status = true;
                                                        responseMessage.message = 'Mail Send successfully';
                                                        responseMessage.data = {
                                                            subject: req.body.subject,
                                                            recipients: req.body.recipients,
                                                            recipientsCc: req.body.recipients_cc,
                                                            recipientsBcc: req.body.recipients_bcc,
                                                            body: req.body.body
                                                        };
                                                        res.status(200).json(responseMessage);
                                                        console.log('FnBussinessMail: Mail Send successfully');
                                                    }
                                                    else {
                                                        responseMessage.message = 'An error occured ! Please try again';
                                                        responseMessage.error = {
                                                            server: 'Sendgrid Server Error'
                                                        };
                                                        res.status(500).json(responseMessage);
                                                        console.log('FnBussinessMail: error in sending business mail  :' + err);
                                                    }
                                                });
                                            }
                                            else {
                                                responseMessage.message = 'Sorry! you cannot send because you are not verified';
                                                responseMessage.error = {
                                                    user_status: 'Not Verified'
                                                };
                                                responseMessage.data = null;
                                                res.status(403).json(responseMessage);
                                                console.log('FnBussinessMail: User not verified');
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'Sorry! you cannot send because you are not verified';
                                            responseMessage.error = {
                                                user_status: 'Not Verified'
                                            };
                                            responseMessage.data = null;
                                            res.status(403).json(responseMessage);
                                            console.log('FnBussinessMail: User not verified');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'Sorry! you cannot send because you are not verified';
                                        responseMessage.error = {
                                            user_status: 'Not Verified'
                                        };
                                        responseMessage.data = null;
                                        res.status(403).json(responseMessage);
                                        console.log('FnBussinessMail: User not verified');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Sorry! you cannot send because you are not verified';
                                    responseMessage.error = {
                                        user_status: 'Not Verified'
                                    };
                                    responseMessage.data = null;
                                    res.status(403).json(responseMessage);
                                    console.log('FnBussinessMail: User not verified');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnBussinessMail: error in checking user status  :' + err);
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
                        console.log('FnCreateService: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnBussinessMail:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnBussinessMail ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};
module.exports = Mail;