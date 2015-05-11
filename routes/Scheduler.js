
var schedule = require('node-schedule');
var DbHelper = require('./../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();
var sendgrid  = require('sendgrid')('ezeid', 'Ezeid2015');



Date.prototype.getUTCTime = function () {
    return new Date(
      this.getUTCFullYear(),
      this.getUTCMonth(),
      this.getUTCDate(),
      this.getUTCHours(),
      this.getUTCMinutes(),
      this.getUTCSeconds()
    ).getTime();
}

function utcToLocal(utc) {
    // Create a local date from the UTC string
    var t = new Date(Number(utc));

    // Get the offset in ms
    var offset = t.getTimezoneOffset() * 60000;

    // Subtract from the UTC time to get local
    t.setTime(t.getTime() - offset);

    // do whatever

    return t;
}


var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 1);

var MessageScheduler = schedule.scheduleJob(rule, function () {
    try {
        var query = 'select * from tMailbox where sentstatus = 0 order by Priority';
        db.query(query, function (err, MessageResult) {
            if (!err) {
                if (MessageResult.length > 0) {
                    for (var i = 0; i < MessageResult.length; i++) {
                        console.log("Message result length: ")
                        //console.log(MessageResult.length);
                        var RegData = MessageResult[i];
                       // console.log('Attachment: ');
                       // console.log(RegData.Attachment);
                        var mailOptions = {
                            from: 'noreply@ezeid.com',
                            to: RegData.ToMailID,
                            subject: RegData.Subject,
                            html: RegData.Body, // html body
                            files: ((RegData.Attachment != null) ? RegData.Attachment:''),
                            filename: ((RegData.AttachmentFileName != null) ? RegData.AttachmentFileName:''),
                            replyTo: ((RegData.replyTo != null) ? RegData.replyTo : '')
                        };
                        var qry = 'update tMailbox set sentStatus = 1 where TID = ' + RegData.TID;
                        db.query(qry, function (err, UpdateResult) {
                            if (!err) {
                                //console.log(UpdateResult);
                                if (UpdateResult != null) {
                                    console.log('scheduleJob: update happened');
                                    FnSendMailEzeid(mailOptions, function (err, Result) {
                                        if (!err) {
                                            if (Result != null) {
                                                console.log('scheduleJob: Mail Sent Successfully');
                                                //var moment = require('moment');
                                            }
                                            else {
                                                console.log('scheduleJob: Mail not Sent Successfully');
                                                var qryfailed = 'update tMailbox set sentStatus = 2 where TID = ' + RegData.TID;
                                                db.query(qryfailed, function(err,UpdateFailedResult){
                                                    if(!err){
                                                        console.log('scheduleJob: Sent failed update operation successfully');
                                                    }
                                                    else
                                                    {
                                                        console.log('scheduleJob: Sent failed update operation failed');
                                                    }
                                                });
                                            }
                                        }
                                        else {
                                            console.log('scheduleJob:Error in sending mails' + err);
                                        }
                                    });
                                }
                                else {
                                    console.log('scheduleJob: Update not happened');
                                }
                            }
                            else {
                                console.log('MessageScheduler: error in update' + err);
                            }
                        });
                    }
                }
                else {
                    console.log('scheduleJob: No user for sending mails');
                }
            }
            else {
                console.log('scheduleJob: Error in getting primary data for sending mails.' + err);
            }
        });
    }
    catch (ex) {
        throw new Error(ex);
    }


});

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
            var request = require('request');
            /* var BodyData = {
             api_user: 'ezeid',
             api_key: 'Ezeid2015',
             to: MailContent.to,
             toname: '',
             subject: MailContent.subject,
             html: MailContent.html,
             from: 'noreply@ezeid.com'
             };*/
            var BodyData = {
                to: MailContent.to,
                toname: '',
                subject: MailContent.subject,
                html: MailContent.html,
                from: 'noreply@ezeid.com',
                replyto: MailContent.replyTo
            };

            if (MailContent.files != '') {
                var bufferData = new Buffer(MailContent.files, 'base64');
                BodyData.files = [{
                    filename: MailContent.filename,
                    content: bufferData
                }]
            }
           
            sendgrid.send(BodyData, function(err, body) {
                if(!err){
                    // var msg = JSON.parse(body);
                    //console.log(msg.message);
                    if(body.message == 'success'){
                        console.log('FnSendMailEzeid: Mail sent');
                        RtnResponse.IsSent = true;
                        CallBack(null, RtnResponse);
                    }
                    else
                    {
                        console.log('FnSendMailEzeid: Mail not sent');
                        CallBack(null, null);
                    }
                }
                else{
                    console.log('FnSendMailEzeid: sending mail error ' + err);
                    CallBack(null, null);
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
        throw new Error(ex);
        return 'error'
    }
};
