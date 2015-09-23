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
    var hashCode = req.body.hash_code ? req.body.hash_code : '9b1feaee73615783ebf4c7cc9a028252';
    var to_email = 'dev.sandeep@hotmail.com';
    //var to_email = 'sgowrishankar26@gmail.com';
    //var to_email = 'aditya@gingerbite.com';


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
                    fs.readFile("gingerbite.html", "utf8", function (err, data) {
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
                responseMessage.error = {
                    message : 'Invalid Hash code'
                };
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


module.exports = Gingerbite;
