/**
 * Created by Gowrishankar on 23-09-2015
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



var st = null;

function Gingerbite(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};


/**
 * @todo FnSendMailGingerbite
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save alumni team profile
 */
Gingerbite.prototype.sendMailGingerbite = function(req,res,next) {

    var fs = require('fs');
    var _this = this;

    var firstName = req.body.f_name;
    var lastName = req.body.l_name;
    var emailId = req.body.email;
    var mobile = req.body.mobile;
    var address = req.body.address;
    var hashCode = req.body.hash_code ? req.body.hash_code : 'Z3NAZ21haWwuY29tZ2luZ2VyYml0ZTEyMw==';
    //var to_email = 'dev.sandeep@hotmail.com';
    var cc = 'sgowrishankar26@gmail.com';
    var to_email = 'aditya@gingerbite.com';


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    if(!firstName){
        error['firstName'] = 'Invalid firstName';
        validateStatus *= false;
    }
    if(!lastName){
        error['lastName'] = 'Invalid lastName';
        validateStatus *= false;
    }
    if(!emailId){
        error['emailId'] = 'Invalid emailId';
        validateStatus *= false;
    }
    if(!mobile){
        error['mobile'] = 'Invalid mobile';
        validateStatus *= false;
    }
    if(!address){
        error['mobile'] = 'Invalid address';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.status = false;
        responseMessage.message = 'Please check the errors below';
        responseMessage.error = error;
        responseMessage.data = null;
        res.status(400).json(responseMessage);
    }
    else{
        try {
            if(hashCode) {
                if (to_email) {
                    var code = emailId + 'gingerbite123';
                    var hash = new Buffer(code).toString('base64');
                    console.log(hash);
                    console.log(hashCode);

                    var path = require('path');
                    var file = path.join(__dirname,'../../mail/templates/gingerbite.html');

                    fs.readFile(file, "utf8", function (err, data) {
                        if (!err) {
                            if (data) {
                                data = data.replace("[FirstName]", firstName);
                                data = data.replace("[LastName]", lastName);
                                data = data.replace("[email]", emailId);
                                data = data.replace("[mobile]", mobile);
                                data = data.replace("[address]", address);

                                var mail = {
                                    from: 'site@gingerbite.com',
                                    to: to_email,
                                    subject: 'New chef request for gingerbite',
                                    html: data // html body
                                };

                                if (hash && hashCode) {
                                    if (hash == hashCode) {
                                        console.log('FnSendMailGingerbite: Hash code matched');

                                        var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                        var email = new sendgrid.Email();
                                        email.from = mail.from;
                                        email.to = mail.to;
                                        email.addCc(cc);
                                        email.subject = mail.subject;
                                        email.html = mail.html;

                                        sendgrid.send(email, function (err, result) {
                                            console.log(result);
                                            if (!err) {
                                                //console.log('Message sent');
                                                //var nodemailer = require('nodemailer');
                                                //var transporter = nodemailer.createTransport();
                                                //transporter.sendMail(mail, function (error, info) {
                                                //  if (!error) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Mail send successfully';
                                                responseMessage.data = {
                                                    firstName: firstName,
                                                    lastName: lastName,
                                                    email: emailId,
                                                    to_email:to_email,
                                                    cc: cc,
                                                    mobile: mobile,
                                                    address: address
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnSendMailGingerbite: Mail send Successfully');
                                                //console.log('Message sent');
                                            }
                                            else {
                                                responseMessage.error = {
                                                    message : 'Mail not send'
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnSendMailGingerbite: Mail not send : ' + error);
                                            }
                                        });
                                    }
                                    else {
                                        responseMessage.error = {
                                            message : 'Hash code not matched'
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnSendMailGingerbite: Hash code not matched');
                                    }
                                }
                                else {
                                    responseMessage.error = {
                                        message : 'Invalid Hash code'
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSendMailGingerbite: Invalid Hash code');
                                }
                            }
                            else {
                                responseMessage.error = {
                                    message : 'File is not read'
                                };
                                res.status(200).json(responseMessage);
                                console.log('FnSendMailGingerbite: File is not read:' + err);
                            }
                        }
                        else {
                            responseMessage.error = {
                                message : 'File is not read'
                            };
                            res.status(200).json(responseMessage);
                            console.log('FnSendMailGingerbite: File is not read:' + err);
                        }
                    });
                }
                else {
                    responseMessage.error = {
                        message : 'Invalid to_email'
                    };
                    res.status(200).json(responseMessage);
                    console.log('FnSendMailGingerbite: Invalid to_email');
                }
            }
            else {
                responseMessage.message = 'Invalid Hash code';
                res.status(200).json(responseMessage);
                console.log('FnSendMailGingerbite: Invalid Hash code');
            }
        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSendMailGingerbite:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @todo FnSendMailTechplasma
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save alumni team profile
 */
Gingerbite.prototype.sendMailTechplasma = function(req,res,next) {

    var fs = require('fs');
    var _this = this;

    var firstName = req.body.f_name;
    var lastName = req.body.l_name;
    var emailId = req.body.email;
    var mobile = req.body.mobile;
    var address = req.body.address;
    var hashCode = req.body.hash_code ? req.body.hash_code : '9b1feaee73615783ebf4c7cc9a028252';
    //var to_email = 'dev.sandeep@hotmail.com';
    //var to_email = 'sgowrishankar26@gmail.com';
    var to_email = 'sales@techplasma.com';


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    if(!firstName){
        error['firstName'] = 'Invalid firstName';
        validateStatus *= false;
    }
    if(!lastName){
        error['lastName'] = 'Invalid lastName';
        validateStatus *= false;
    }
    if(!emailId){
        error['emailId'] = 'Invalid emailId';
        validateStatus *= false;
    }
    if(!mobile){
        error['mobile'] = 'Invalid mobile';
        validateStatus *= false;
    }
    if(!address){
        error['mobile'] = 'Invalid address';
        validateStatus *= false;
    }


    if(!validateStatus){
        responseMessage.status = false;
        responseMessage.message = 'Please check the errors below';
        responseMessage.error = error;
        responseMessage.data = null;
        res.status(400).json(responseMessage);
    }
    else{
        try {
            if(hashCode) {
                if (to_email) {
                    var code = emailId + 'techplasma123';
                    var hash = new Buffer(code).toString('base64');
                    console.log(hash);
                    console.log(hashCode);

                    var path = require('path');
                    var file = path.join(__dirname,'../../mail/templates/techplasma.html');

                    fs.readFile(file, "utf8", function (err, data) {
                        if (!err) {
                            if (data) {
                                data = data.replace("[FirstName]", firstName);
                                data = data.replace("[LastName]", lastName);
                                data = data.replace("[email]", emailId);
                                data = data.replace("[mobile]", mobile);
                                data = data.replace("[address]", address);


                                var mail = {
                                    from: 'techplasma.com',
                                    to: to_email,
                                    subject: 'Sales request for techplasma solution',
                                    html: data // html body
                                };

                                if (hash && hashCode) {
                                    if (hash == hashCode) {
                                        console.log('FnSendMailTechplasma: Hash code matched');

                                        var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                        var email = new sendgrid.Email();
                                        email.from = mail.from;
                                        email.to = mail.to;
                                        email.subject = mail.subject;
                                        email.html = mail.html;

                                        sendgrid.send(email, function (err, result) {
                                            console.log(result);
                                            if (!err) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Mail send successfully';
                                                responseMessage.data = {
                                                    firstName: firstName,
                                                    lastName: lastName,
                                                    email: emailId,
                                                    mobile: mobile,
                                                    address: address
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnSendMailTechplasma: Mail send Successfully');
                                                //console.log('Message sent');
                                            }
                                            else {
                                                responseMessage.error = {
                                                    message : 'Mail not send'
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnSendMailTechplasma: Mail not send : ' + error);
                                            }
                                        });
                                    }
                                    else {
                                        responseMessage.error = {
                                            message : 'Hash code not matched'
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnSendMailTechplasma: Hash code not matched');
                                    }
                                }
                                else {
                                    responseMessage.error = {
                                        message : 'Invalid Hash code'
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSendMailTechplasma: Invalid Hash code');
                                }
                            }
                            else {
                                responseMessage.error = {
                                    message : 'File is not read'
                                };
                                res.status(200).json(responseMessage);
                                console.log('FnSendMailTechplasma: File is not read:' + err);
                            }
                        }
                        else {
                            responseMessage.error = {
                                message : 'File is not read'
                            };
                            res.status(200).json(responseMessage);
                            console.log('FnSendMailTechplasma: File is not read:' + err);
                        }
                    });
                }
                else {
                    responseMessage.error = {
                        message : 'Invalid to_email'
                    };
                    res.status(200).json(responseMessage);
                    console.log('FnSendMailTechplasma: Invalid to_email');
                }
            }
            else {
                responseMessage.error = {
                    message : 'Invalid Hash code'
                };
                res.status(200).json(responseMessage);
                console.log('FnSendMailTechplasma: Invalid Hash code');
            }
        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSendMailTechplasma:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};


/**
 * @todo FnSendMailFomadsFeedback
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save alumni team profile
 */
Gingerbite.prototype.sendFeedbackMailFomads = function(req,res,next) {

    var fs = require('fs');
    var _this = this;

    var name = req.body.name;
    var userEmail = req.body.email;
    var phone = req.body.phone;
    var address = req.body.address;
    var comment = req.body.comment;

    //var to_email = 'dev.sandeep@hotmail.com';
    //var to_email = 'sgowrishankar26@gmail.com';
    var toEmail = 'aditya@gingerbite.com';


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    if(!userEmail){
        error['firstName'] = 'Invalid firstName';
        validateStatus *= false;
    }
    var a = [];
    for(var i=0; i < 6; i++){
        var number = parseInt(req.body["a"+i]);
        if(isNaN(number) || number <= 0){
            error["a"+i] = "Question "+ i +" is not answered";
            validateStatus *= false;
        }
        a.push(number);
    }


    if(!validateStatus){
        responseMessage.status = false;
        responseMessage.message = 'Please check all the errors';
        responseMessage.error = error;
        responseMessage.data = null;
        res.status(400).json(responseMessage);
    }
    else{
        try {

                    var q = [
                        "Overall Rating",
                        "Quality of Food",
                        "Quantity of Food",
                        "Quantity of Packing and Delivery",
                        "Food Temperature at the tiem of Delivery",
                        "Our Food Pricing"
                    ];

                    var ipAddress = req.headers['x-forwarded-for'] ||
                        req.connection.remoteAddress ||
                        req.socket.remoteAddress ||
                        req.connection.socket.remoteAddress;

                    var path = require('path');
                    var file = path.join(__dirname,'../../mail/templates/fomads-feedback.html');

                    fs.readFile(file, "utf8", function (err, data) {
                        if (!err) {
                            if (data) {
                                data = data.replace("[[name]]", (name) ? name : userEmail);
                                data = data.replace("[[email]]", (userEmail) ? userEmail : '');
                                data = data.replace("[[phone]]", (phone) ? phone : '');
                                data = data.replace("[[address]]", (address) ? address : '');
                                data = data.replace("[[comment]]", (comment) ? comment : '');
                                data = data.replace("[[a0]]", (a[0]) ? a[0] : '');
                                data = data.replace("[[a1]]", (a[1]) ? a[1] : '');
                                data = data.replace("[[a2]]", (a[2]) ? a[2] : '');
                                data = data.replace("[[a3]]", (a[3]) ? a[3] : '');
                                data = data.replace("[[a4]]", (a[4]) ? a[4] : '');
                                data = data.replace("[[a5]]", (a[5]) ? a[5] : '');


                                data = data.replace("[[q0]]", q[0]);
                                data = data.replace("[[q1]]", q[1]);
                                data = data.replace("[[q2]]", q[2]);
                                data = data.replace("[[q3]]", q[3]);
                                data = data.replace("[[q4]]", q[4]);
                                data = data.replace("[[q5]]", q[5]);




                                var mail = {
                                    from: "gingerbite.com",
                                    to: toEmail,
                                    subject: 'Feedback from '+(name) ? name : email,
                                    html: data // html body
                                };


                                var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                var email = new sendgrid.Email();
                                email.from = mail.from;
                                email.to = mail.to;
                                email.subject = mail.subject;
                                email.html = mail.html;

                                var jsonData = {
                                    name : name,
                                    email : userEmail,
                                    phone : phone,
                                    address : address,
                                    comment : comment,
                                    ipAddress : ipAddress,
                                    q0 : q[0],
                                    a0 : a[0],
                                    q1 : q[1],
                                    a1 : a[1],
                                    q2 : q[2],
                                    a2 : a[2],
                                    q3 : q[3],
                                    a3 : a[3],
                                    q4 : q[4],
                                    a4 : a[4],
                                    q5 : q[5],
                                    a5 : a[5]
                                };
                                //try{
                                //            fs.appendFileSync('/var/log/fomads-feedback.log',JSON.stringify(jsonData) + "\n",{ encoding : 'utf-8'});
                                //}
                                //catch(ex){
                                //    console.log(ex);
                                //    console.log('Unable to write log to fomads feedback');
                                //}

                                sendgrid.send(email, function (err, result) {
                                    console.log(result);
                                    if (!err) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Feedback is submitted successfully';
                                        responseMessage.data = {
                                            name : name,
                                            email : userEmail,
                                            address : address,
                                            phone: phone,
                                            comment: comment
                                        };
                                        console.log('FnSendFeedbackMailFomads: Mail sent Successfully');
                                        res.status(200).json(responseMessage);
                                        //console.log('Message sent');
                                    }
                                    else {
                                        responseMessage.error = {
                                            message : 'Mail not send for fomads'
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnSendFeedbackMailFomads: Mail not send : ');
                                        console.log(error);
                                    }
                                });


                            }
                            else {
                                responseMessage.error = {
                                    message : 'File is not read'
                                };
                                res.status(200).json(responseMessage);
                                console.log('FnSendFeedbackMailFomads: File is not read:' + err);
                            }
                        }
                        else {
                            responseMessage.error = {
                                message : 'File is not read'
                            };
                            res.status(200).json(responseMessage);
                            console.log('FnSendFeedbackMailFomads: File is not read:' + err);
                        }
                    });

        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSendFeedbackMailFomads:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};



module.exports = Gingerbite;
