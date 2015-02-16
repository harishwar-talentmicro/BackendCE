var DbHelper = require('./../helpers/DatabaseHandler'),
db = DbHelper.getDBContext();

function error(err, req, res, next) {
    // log it
    console.error(err.stack);
    console.log('Error Happened Please try Again..');
    // respond with 500 "Internal Server Error".
    res.send(500, 'Error Happened');
};
//finding for which application the app is running ie whether cab or school


var FinalMessage = {
    Message: '',
    StatusCode: '',
    Result: ''
};
var FinalMsgJson = JSON.parse(JSON.stringify(FinalMessage));

//ezeid email id: 
var EZEIDEmail = 'noreply@ezeid.com';
//EzeId services will start from here
//method to generate the token
function FnGenerateToken() {
    try {
        var text = "";
        var possible = "1234567890abcdefghjklmnopqrstuvwxyz!@#$%";

        for (var i = 0; i < 10; i++) {

            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        key = 'hire@123';

        var cipher = crypto.createCipher(algorithm, key)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }
    catch (ex) {
        console.log('OTP generate error:' + ex.description);
        throw new Error(ex);
        return 'error'
    }
}

function FnRandomPassword() {
    try {
        var text = "";
        var possible = "1234567890abcdefghjklmnopqrstuvwxyz!@#$%";

        for (var i = 0; i < 7; i++) {

            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    catch (ex) {
        console.log('OTP generate error:' + ex.description);
        throw new Error(ex);
        return 'error'
    }
}

function FnEncryptPassword(Password) {
    try {
        //var text = "";
        var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        key = 'ezeid@123';

        var cipher = crypto.createCipher(algorithm, key)
        var crypted = cipher.update(Password, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }
    catch (ex) {
        console.log('OTP generate error:' + ex.description);
        throw new Error(ex);
        return 'error'
    }
}

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
        throw new Error(ex);
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
                            MessageContentResult = MessageContentResult[0];
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
                                        data = data.replace("[https://www.ezeid.com?ID=]", 'https://www.ezeid.com?ID=' + MessageContentResult[0].EZEID);
                                        // console.log('Body:' + data);
                                        // console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Sales Enquiry from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html };
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
                                } else if (MessageContent.MessageType == 2) {
                                    fs.readFile("HomeDelivery.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Message]", MessageContent.Message);
                                        data = data.replace("[https://www.ezeid.com?ID=]", 'https://www.ezeid.com?ID=' + MessageContentResult[0].EZEID);

                                        // console.log('Body:' + data);
                                        //  console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Home Delivery request from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html };
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
                                        data = data.replace("[https://www.ezeid.com?ID=]", 'https://www.ezeid.com?ID=' + MessageContentResult[0].EZEID);
                                        // console.log('Body:' + data);
                                        // console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Reservation Request from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html };
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
                                } else if (MessageContent.MessageType == 4) {
                                    fs.readFile("ServiceRequest.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Message]", MessageContent.Message);
                                        data = data.replace("[https://www.ezeid.com?ID=]", 'https://www.ezeid.com?ID=' + MessageContentResult[0].EZEID);
                                        // console.log('Body:' + data);
                                        //  console.log(MessageContentResult[0].ToMailID);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: MessageContentResult[0].ToMailID,
                                            subject: 'Service Request from ' + MessageContentResult[0].EZEID,
                                            html: data // html body
                                        };
                                        var post = { MessageType: MessageContent.MessageType, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html };
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
                                } else if (MessageContent.MessageType == 5) {
                                    fs.readFile("CV.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        //  console.log(MessageContentResult);
                                        data = data.replace("[IsVerified]", MessageContentResult[0].EZEIDVerifiedID);
                                        data = data.replace("[EZEID]", MessageContentResult[0].EZEID);
                                        data = data.replace("[Functions]", MessageContentResult[0].Function);
                                        data = data.replace("[Roles]", MessageContentResult[0].Role);
                                        data = data.replace("[Keyskills]", MessageContentResult[0].KeySkills);
                                        data = data.replace("[https://www.ezeid.com?ID=]", 'https://www.ezeid.com?ID=' + MessageContentResult[0].EZEID);
                                        if (MessageContentResult[0].DocPin = '') {
                                            data = data.replace(".[PIN]", MessageContentResult[0].DocPin);
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
                                        var post = { MessageType: MessageContent.MessageType, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html };
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
                                        var post = { MessageType: MessageContent.MessageType, ToMailID: MessageContentResult[0].ToMailID, Subject: mailOptions.subject, Body: mailOptions.html };
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
        throw new Error(ex);
        return 'error'
    }
};

//method to validate token
function FnValidateToken(Token, CallBack) {
    try {

        //below query to check token exists for the users or not.
        if (Token != null) {
            var Query = 'select Token from tmaster where Token=' + db.escape(Token);
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
        throw new Error(ex);
        return 'error'
    }
};

exports.FnToken = function (req, res) {
    try {
        FnValidateToken('70084b50d3c43822fbef', function (err, Result) {
            if (!err) {
                // console.log(Result);
                res.send(Result);
            }
            else {
                console.log(err);
                res.send(err);
            }
        });

    }
    catch (ex) {
        console.log('FnToken: OTP FnValidateToken error:' + ex.description);
        throw new Error(ex);
        return 'error'
    }
};

//method for login
exports.FnLogin = function (req, res) {
    try {
        //res.setHeader("Access-Control-Allow-Origin", "*");
        //res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        //res.setHeader('content-type', 'application/json');
        var UserName = req.body.UserName;
        var Password = req.body.Password;
        var RtnMessage = {
            Token: '',
            IsAuthenticate: false,
            FirstName: '',
            Type: 0,
            Icon: ''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (UserName != null && UserName != '' && Password != null && Password != '') {
            var EncryptPWD = FnEncryptPassword(Password);
            // console.log(EncryptPWD);
            var Query = 'select TID,FirstName,LastName,EZEID,IDTypeID,Token,Icon from tmaster where StatusID=1 and  EZEID=' + db.escape(UserName) + ' and Password=' + db.escape(EncryptPWD);
            db.query(Query, function (err, loginResult) {
                if (!err) {
                    if (loginResult.length > 0) {
                        // console.log('loginResult: ' + loginResult);
                        var Encrypt = FnGenerateToken();
                        //   console.log('Encrypt: ' + Encrypt);
                        // console.log('TID ' + loginResult[0].TID);
                        var Query = 'update tmaster set Token=' + db.escape(Encrypt) + ' where TID=' + db.escape(loginResult[0].TID);
                        db.query(Query, function (err, TokenResult) {
                            if (!err) {
                                //  console.log(TokenResult);

                                if (TokenResult.affectedRows > 0) {
                                    //res.setHeader('Cookie','Token='+Encrypt);
                                    res.cookie('Token', Encrypt, { maxAge: 900000, httpOnly: true });
                                    RtnMessage.Token = Encrypt;
                                    RtnMessage.IsAuthenticate = true;
                                    RtnMessage.FirstName = loginResult[0].FirstName;
                                    RtnMessage.Type = loginResult[0].IDTypeID;
                                    RtnMessage.Icon = loginResult[0].Icon;
                                    res.send(RtnMessage);

                                    console.log('FnLogin:tmaster: Login success');
                                }
                                else {

                                    res.send(RtnMessage);
                                    console.log('FnLogin:tmaster:Fail to generate Token');
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.send(RtnMessage);
                                console.log('FnLogin:tmaster:' + err);
                            }
                        });
                    }
                    else {

                        res.send(RtnMessage);
                        console.log('FnLogin:tmaster: Invalid login credentials');
                    }
                }
                else {
                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnLogin:tmaster:' + err);
                }
            });
        }
        else {
            if (UserName == null || UserName == '') {
                console.log('FnLogin: UserName is empty');
            }
            else if (Password == null || Password == '') {
                console.log('FnLogin: password is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnLogin error:' + ex.description);
        throw new Error(ex);
    }
};

//method for logout
exports.FnLogout = function (req, res) {
    try {
        //res.setHeader("Access-Control-Allow-Origin", "*");
        //res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        //res.setHeader('content-type', 'application/json');
        var Token = req.query.Token;

        var RtnMessage = {
            Token: '',
            IsAuthenticate: true,
            FirstName: '',
            Type: 0,
            Icon: ''
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && Token != '') {

            var Query = 'update tmaster set Token=' + db.escape('') + ' where Token=' + db.escape(Token);
            db.query(Query, function (err, TokenResult) {
                if (!err) {
                    RtnMessage.IsAuthenticate = false;
                    console.log('FnLogout: tmaster: Logout success');
                    res.clearCookie('Token');
                    res.send(RtnMessage);
                }
                else {
                    res.statusCode = 500;
                    console.log('FnLogout:tmaster:' + err);
                    res.send(RtnMessage);
                }
            });

        }
        else {
            if (Token == null || Token == '') {
                console.log('FnLogout: Token is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnLogout error:' + ex.description);
        throw new Error(ex);
    }
};

//method to change password
exports.FnChangePassword = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var TokenNo = req.body.Token;
        var OldPassword = req.body.OldPassword;
        var NewPassword = req.body.NewPassword;
        var RtnMessage = {
            IsChanged: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (OldPassword != null && OldPassword != '' && NewPassword != null && NewPassword != '' && TokenNo != null) {
            FnValidateToken(TokenNo, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var EncryptOldPWD = FnEncryptPassword(OldPassword);
                        var EncryptNewPWD = FnEncryptPassword(NewPassword);
                        var Query = db.escape(TokenNo) + ',' + db.escape(EncryptOldPWD) + ',' + db.escape(EncryptNewPWD);
                        db.query('CALL pChangePassword(' + Query + ')', function (err, ChangePasswordResult) {
                            if (!err) {
                                //console.log(ChangePasswordResult);
                                if (ChangePasswordResult != null) {
                                    if (ChangePasswordResult.affectedRows > 0) {
                                        RtnMessage.IsChanged = true;
                                        res.send(RtnMessage);
                                        console.log('FnChangePassword:pChangePassword: PASSSWORD CHANGED SUCCESSFULLY');
                                    }
                                    else {
                                        res.send(RtnMessage);
                                        console.log('FnChangePassword:pChangePassword: Password changed failed');
                                    }
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('FnChangePassword:pChangePassword: Password changed failed ');
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.send(RtnMessage);
                                console.log('FnChangePassword:pChangePassword:' + err);
                            }
                        });
                    } else {
                        res.statusCode = 401;
                        res.send(RtnMessage);
                        console.log('FnChangePassword:pChangePassword: Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnChangePassword:pChangePassword: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (OldPassword == null) {
                console.log('FnChangePassword: OldPassword is empty');
            }
            else if (NewPassword == null) {
                console.log('FnChangePassword: NewPassword is empty');
            }
            else if (TokenNo == null) {
                console.log('FnChangePassword: TokenNo is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnChangePassword error:' + ex.description);
        throw new Error(ex);
    }
};

//method for forget password. in this method we are resetting the password and sending to user via mail.
exports.FnForgetPassword = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var EZEID = req.body.EZEID;
        var RtnMessage = {
            IsChanged: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (EZEID != null) {
            var Password = FnRandomPassword();
            // console.log(Password);
            var EncryptPWD = FnEncryptPassword(Password);
            // console.log(EncryptPWD);
            var Query = 'Update tmaster set Password= ' + db.escape(EncryptPWD) + ' where EZEID=' + db.escape(EZEID);
            // console.log('FnForgotPassword: ' + Query);
            db.query(Query, function (err, ForgetPasswordResult) {
                if (!err) {
                    //console.log(InsertResult);
                    if (ForgetPasswordResult != null) {
                        if (ForgetPasswordResult.affectedRows > 0) {
                            RtnMessage.IsChanged = true;
                            var UserQuery = 'Select ifnull(a.FirstName,"") as FirstName,ifnull(a.LastName,"") as LastName,a.Password,ifnull(b.EMailID,"") as EMailID from tmaster a,tlocations b where b.SeqNo=0 and b.EZEID=a.EZEID and a.EZEID=' + db.escape(EZEID);
                            //  console.log(UserQuery);
                            db.query(UserQuery, function (err, UserResult) {
                                if (!err) {
                                    //  console.log(UserResult);

                                    var fs = require('fs');
                                    fs.readFile("ForgetPasswordTemplate.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[Firstname]", UserResult[0].FirstName);
                                        data = data.replace("[Lastname]", UserResult[0].LastName);
                                        data = data.replace("[Password]", Password);
                                        //console.log(UserResult[0].EMailID);
                                        //console.log('Body:' + data);
                                        var mailOptions = {
                                            from: EZEIDEmail,
                                            to: UserResult[0].EMailID,
                                            subject: 'Password reset request',
                                            html: data // html body
                                        };

                                        // send mail with defined transport object
                                        //message Type 7 - Forgot password mails service
                                        var post = { MessageType: 7, ToMailID: mailOptions.to, Subject: mailOptions.subject, Body: mailOptions.html };
                                        // console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnRegistration: Mail saved Successfully');
                                                res.send(RtnMessage);
                                            }
                                            else {
                                                console.log('FnRegistration: Mail not Saved Successfully' + err);
                                                res.send(RtnMessage);
                                            }
                                        });
                                    });

                                    console.log('FnForgetPassword:tmaster: Password reset successfully');
                                }
                                else {
                                    res.statusCode = 500;
                                    res.send(RtnMessage);
                                    console.log('FnForgetPassword: Email sending Fails: ' + err);
                                }
                            });

                        }
                        else {
                            res.send(RtnMessage);
                            console.log('FnForgetPassword:tmaster: Password reset  Failed');
                        }

                    }
                    else {
                        res.send(RtnMessage);
                        console.log('FnForgetPassword:tmaster: Password reset Failed');
                    }
                }
                else {
                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnForgetPassword:tmaster:' + err);
                }
            });

        }
        else {
            console.log('FnForgetPassword: EZEID is empty')
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnForgetPassword error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load category
exports.FnGetCategory = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var LangID = parseInt(req.query.LangID);
        if (LangID.toString() != 'NaN') {
            var Query = 'Select CategoryID, CategoryTitle from mcategory where LangID=' + db.escape(LangID);
            db.query(Query, function (err, CategoryResult) {
                if (!err) {
                    if (CategoryResult.length > 0) {
                        res.send(CategoryResult);
                        console.log('FnGetCategory: mcategory: Category sent successfully');
                    }
                    else {
                        res.send('null');
                        console.log('FnGetCategory: mcategory: No category found');
                    }
                }
                else {
                    res.send('null');
                    res.statusCode = 500;
                    console.log('FnGetCategory: mcategory: ' + err);
                }
            });
        }
        else {
            res.send('null');
            res.statusCode = 400;
            console.log('FnGetCategory: LangId is empty');
        }
    }
    catch (ex) {
        console.log('FnCategory error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load city based on  state
exports.FnGetCity = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var LangID = parseInt(req.query.LangID);
        var StateID = parseInt(req.query.StateID);
        if (LangID.toString() != 'NaN' && StateID.toString() != 'NaN') {
            var Query = 'Select  CityID, CityName from mcity where LangID=' + db.escape(LangID) + ' and StateID= ' + db.escape(StateID);
            db.query(Query, function (err, CityResult) {
                if (!err) {
                    if (CityResult.length > 0) {
                        res.send(CityResult);
                        console.log('FnGetCity: mcity: City sent successfully');
                    }
                    else {
                        res.send('null');
                        console.log('FnGetCity: mcity: No category found');
                    }
                }
                else {
                    res.send('null');
                    res.statusCode = 500;
                    console.log('FnGetCity: mcity: ' + err);
                }
            });
        }
        else {
            if (LangID.toString() == 'NaN') {
                console.log('FnGetCity: LangId is empty');
            }
            else if (StateID.toString() == 'NaN') {
                console.log('FnGetCity: StateID is empty');
            }
            res.statusCode = 400;
            res.send('null');
        }
    }
    catch (ex) {
        console.log('FnGetCity error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load country
exports.FnGetCountry = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'Select CountryID, CountryName, ISDCode from  mcountry where LangID=' + db.escape(LangID);
            db.query(Query, function (err, CountryResult) {
                if (!err) {
                    if (CountryResult.length > 0) {
                        res.send(CountryResult);
                        console.log('FnGetCountry: mcountry: Country sent successfully');
                    }
                    else {
                        res.send('null');
                        console.log('FnGetCountry: mcountry: No Country found');
                    }
                }
                else {
                    res.send('null');
                    res.statusCode = 500;
                    console.log('FnGetCountry: mcountry: ' + err);
                }
            });
        }
        else {
            res.send('null');
            res.statusCode = 400;
            console.log('FnGetCountry: LangId is empty');
        }
    }
    catch (ex) {
        console.log('FnGetCountry error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load state 
exports.FnGetState = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        var CountryID = parseInt(req.query.CountryID);

        if (CountryID.toString() != 'NaN' && LangID.toString() != 'NaN') {
            var Query = 'Select StateID, StateName  from mstate where LangID=' + db.escape(LangID) + ' and CountryID=' + db.escape(CountryID);
           // console.log(Query);
            db.query(Query, function (err, StateResult) {
                if (!err) {
                    if (StateResult.length > 0) {
                        var Query = 'Select ifnull(ISDCode,"") as ISDCode from  mcountry where CountryID=' + db.escape(CountryID);
                        db.query(Query, function (err, CountryResult) {
                            if (!err) {
                                if (CountryResult.length) {
                                   // console.log(CountryResult);
                                  //  console.log(CountryResult[0].ISDCode);
                                    res.setHeader('ISDCode', CountryResult[0].ISDCode);
                                    res.send(StateResult);
                                    console.log('FnGetState: mcountry: State sent successfully');
                                }
                                else {
                                    res.send('null');
                                    console.log('FnGetState: mcountry: No Country ISDCode found');
                                }
                            }
                            else {
                                res.send('null');
                                console.log('FnGetState: mcountry:  No Country ISDCode found: ' + err);
                            }
                        });

                    }
                    else {
                        res.send('null');
                        console.log('FnGetState: mstate: No state found');
                    }
                }
                else {
                    res.send('null');
                    res.statusCode = 500;
                    console.log('FnGetState: mstate:' + err);
                }
            });
        }
        else {
            if (LangID.toString() == 'NaN') {
                console.log('LangID is empty');
            }
            else if (CountryID.toString() == 'NaN') {
                console.log('CountryId is empty');
            }
            res.statusCode = 400;
            res.send('null');
        }
    }
    catch (ex) {
        console.log('FnGetState error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load functional role map
exports.FnGetFunctionRoleMap = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Query = 'select b.FunctionID,c.FunctionName,b.RoleID,a.RoleName from mroletype a, mfunctionrolemap b,mfunctiontype c where a.RoleID=b.RoleID and c.FunctionID=b.FunctionID'
        db.query(Query, function (err, FunctionRoleMapResult) {
            if (!err) {
                if (FunctionRoleMapResult.length > 0) {
                    res.send(FunctionRoleMapResult);
                    console.log('FnGetFunctionRoleMap: mfunctionrolemap: Function Rolemap sent successfully');
                }
                else {
                    res.send('null');
                    console.log('FnGetFunctionRoleMap: mfunctionrolemap: No function Rolemap found');
                }
            }
            else {

                res.send('null');
                res.statusCode = 500;
                console.log('FnGetFunctionRoleMap: mfunctionrolemap: ' + err);
            }
        });
    }
    catch (ex) {
        console.log('FnGetFunctionRoleMap error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load functions
exports.FnGetFunctions = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'select FunctionID, FunctionName  from mfunctiontype where LangID=' + db.escape(LangID);
            db.query(Query, function (err, FunctionRoleMapResult) {
                if (!err) {
                    if (FunctionRoleMapResult.length > 0) {
                        res.send(FunctionRoleMapResult);
                        console.log('FnGetFunctions: mfunctiontype: Functions sent successfully');
                    }
                    else {
                        res.send('null');
                        res.statusCode = 500;
                        console.log('FnGetFunctions: mfunctiontype: No function  found');
                    }
                }
                else {

                    res.send('null');
                    console.log('FnGetFunctions: mfunctiontype: ' + err);
                }
            });
        }
        else {
            console.log('FnGetFunctions: LangId is empty');
            res.statusCode = 400;
            res.send('null');
        }

    }
    catch (ex) {
        console.log('FnGetFunctions error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load Roles based on functions
exports.FnGetRoles = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        var FunctionID = req.query.FunctionID;

        if (LangID.toString != 'NaN' && FunctionID != null) {
            var Query = ' select  b.RoleID,b.FunctionID,c.FunctionName,a.RoleName from mroletype a, mfunctionrolemap b,mfunctiontype c where a.RoleID=b.RoleID and c.FunctionID=b.FunctionID and c.LangID=' + db.escape(LangID) + ' and b.FunctionID in (' + db.escape(FunctionID) + ')';
            db.query(Query, function (err, FunctionRoleMapResult) {
                if (!err) {
                    if (FunctionRoleMapResult.length > 0) {
                        res.send(FunctionRoleMapResult);
                        console.log('FnGetRoles: mfunctiontype: Functions sent successfully');
                    }
                    else {
                        res.send('null');
                        res.statusCode = 500;
                        console.log('FnGetRoles: mfunctiontype: No function  found');
                    }
                }
                else {

                    res.send('null');
                    console.log('FnGetRoles: mfunctiontype: ' + err);
                }
            });
        }
        else {
            if (LangID.toString() == 'NaN') {
                console.log('FnGetRoles: LangId is empty');
            }
            else if (FunctionID == null) {
                console.log('FnGetRoles: FunctionId is empty');
            }
            res.statusCode = 400;
            res.send('null');
        }

    }
    catch (ex) {
        console.log('FnGetFunctions error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load languages
exports.FnGetLanguage = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'Select LangID, LangName, SeqNo, Status from  mlang where LangID=' + db.escape(LangID);
            db.query(Query, function (err, LanguageResult) {
                if (!err) {
                    if (LanguageResult.length > 0) {
                        res.send(LanguageResult);
                        console.log('FnGetLanguage: mlang: Language sent successfully');
                    }
                    else {
                        res.send('null');
                        console.log('FnGetLanguage: mlang: No Language found');
                    }
                }
                else {
                    res.send('null');
                    res.statusCode = 500;
                    console.log('FnGetLanguage: mlang: ' + err);
                }
            });
        }
        else {
            res.send('null');
            res.statusCode = 400
            console.log('FnGetLanguage: LangId is empty');
        }

    }
    catch (ex) {
        console.log('FnGetLanguage error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load relation type 
exports.FnGetRelationType = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'Select RelationID, RelationshipTitle from mrelationtype where LangID=' + db.escape(LangID);
            db.query(Query, function (err, RelationTypeResult) {
                if (!err) {
                    if (RelationTypeResult.length > 0) {
                        res.send(RelationTypeResult);
                        console.log('FnGetRelationType: mrelationtype: Relation Type sent successfully');
                    }
                    else {
                        res.send('null');
                        res.statusCode = 500;
                        console.log('FnGetRelationType: mrelationtype: No Relation type found');
                    }
                }
                else {
                    res.send('null');
                    console.log('FnGetRelationType: mrelationtype:' + err);
                }
            });
        }
        else {
            res.send('null');
            res.statusCode = 400;
            console.log('FnGetRelationType: LangId is empty');
        }


    }
    catch (ex) {
        console.log('FnGetRelationType error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load role type 
exports.FnGetFunctionRoleMapping = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Query = 'Select RoleID,FunctionID from mfunctionrolemap';
        db.query(Query, function (err, RoleFunctionMappingResult) {
            if (!err) {
                if (RoleFunctionMappingResult.length > 0) {
                    res.send(RoleFunctionMappingResult);
                    console.log('FnGetRoleFunctionMapping: mfunctionrolemap: Function Role Map sent successfully');
                }
                else {
                    res.send('null');
                    console.log('FnGetRoleFunctionMapping: mfunctionrolemap: No Function Role Map found');
                }
            }
            else {
                res.send('null');
                res.statusCode = 500;
                console.log('FnGetRoleFunctionMapping: mfunctionrolemap:' + err);
            }
        });

    }
    catch (ex) {
        console.log('FnGetRoleFunctionMapping error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load role type 
exports.FnGetRoleType = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'Select RoleID, RoleName from mroletype where LangID=' + db.escape(LangID);
            db.query(Query, function (err, RoleTypeResult) {
                if (!err) {
                    if (RoleTypeResult.length > 0) {
                        res.send(RoleTypeResult);
                        console.log('FnGetRoleType: mroletype: Role Type sent successfully');
                    }
                    else {
                        res.send('null');
                        console.log('FnGetRoleType: mroletype: No Role Type found');
                    }
                }
                else {
                    res.send('null');
                    res.statusCode = 500;
                    console.log('FnGetRoleType: mroletype:' + err);
                }
            });
        }
        else {
            res.send('null');
            res.statusCode = 400;
            console.log('LangId is empty');
        }
    }
    catch (ex) {
        console.log('FnGetRoleType error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load Mtitle(Mr, Mrs)
exports.FnGetMTitle = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var LangID = parseInt(req.query.LangID);

        if (LangID.toString != 'NaN') {
            var Query = 'Select TitleID,Title from mtitle where LangID=' + db.escape(LangID);
            db.query(Query, function (err, MTitleResult) {
                if (!err) {
                    if (MTitleResult.length > 0) {
                        res.send(MTitleResult);
                        console.log('FnGetMTitle: mtitle: MTitle sent successfully');
                    }
                    else {
                        res.send('null');
                        console.log('FnGetMTitle: mtitle: No MTitle found');
                    }
                }
                else {
                    res.send('null');
                    res.statusCode = 500;
                    console.log('FnGetMTitle: mtitle: ' + err);
                }
            });
        }
        else {

            console.log('FnGetMTitle: LangId is empty');
            res.statusCode = 400;
            res.send('null');
        }
    }
    catch (ex) {
        console.log('FnGetMTitle error:' + ex.description);
        throw new Error(ex);
    }
};

//method to load proxmity
exports.FnGetProxmity = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'Select Title,MetersValue, MilesValue from mproximity where LangID=' + db.escape(LangID);
            db.query(Query, function (err, ProximityResult) {
                if (!err) {
                    if (ProximityResult.length > 0) {
                        res.send(ProximityResult);
                        console.log('FnGetProxmity: mproximity: proximity sent successfully');
                    }
                    else {
                        res.send('null');
                        console.log('FnGetProxmity: mproximity: No proximity found');
                    }
                }
                else {
                    res.send('null');
                    res.statusCode = 500;
                    console.log('FnGetProxmity: mroletype:' + err);
                }
            });
        }
        else {
            res.send('null');
            res.statusCode = 400;
            console.log('FnGetProxmity: LangId is empty');
        }
    }
    catch (ex) {
        console.log('FnGetProxmity error:' + ex.description);
        throw new Error(ex);
    }
};

//method to check ezeid exists or not 
exports.FnCheckEzeid = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var EZEID = req.query.EZEID;
        var RtnMessage = {
            IsIdAvailable: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (EZEID != null && EZEID != '') {
            var Query = 'Select EZEID from tmaster where EZEID=' + db.escape(EZEID);
            db.query(Query, function (err, EzediExitsResult) {
                if (!err) {
                    if (EzediExitsResult.length > 0) {
                        RtnMessage.IsIdAvailable = false;
                        res.send(RtnMessage);
                        console.log('FnCheckEzeid: tmaster: EzeId exists');
                    }
                    else {
                        RtnMessage.IsIdAvailable = true;
                        res.send(RtnMessage);
                        console.log('FnCheckEzeid: tmaster:  EzeId not available');
                    }
                }
                else {

                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnCheckEzeid: tmaster: ' + err);
                }
            });
        }
        else {

            res.statusCode = 400;
            res.send(RtnMessage);
            console.log('FnCheckEzeid: EZEID is empty');
        }
    }
    catch (ex) {
        console.log('FnCheckEzeid error:' + ex.description);
        throw new Error(ex);
    }
};

//getting the details of user
exports.FnGetUserDetails = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        if (Token != null && Token != '') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetEZEIDDetails(' + db.escape(Token) + ')', function (err, UserDetailsResult) {
                            if (!err) {
                                if (UserDetailsResult[0] != null) {
                                    if (UserDetailsResult[0].length > 0) {
                                        // console.log('FnGetUserDetails: Token: ' + Token);
                                        console.log('FnGetUserDetails : tmaster: User details sent successfully');
                                        res.send(UserDetailsResult[0]);
                                    }
                                    else {
                                        res.send('null');
                                        console.log('FnGetUserDetails : tmaster: No User details found');
                                    }
                                }
                                else {
                                    res.send('null');
                                    console.log('FnGetUserDetails : tmaster: No User details found');
                                }

                            }
                            else {
                                res.send('null');
                                res.statusCode = 500;
                                console.log('FnGetUserDetails : tmaster:' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnGetUserDetails: Invalid token');
                        res.statusCode = 401;
                        res.send('null');
                    }
                }
                else {
                    console.log('FnGetUserDetails: ' + err);
                    res.statusCode = 500;
                    res.send('null');
                }
            });
        }
        else {
            res.send('null');
            res.statusCode = 400;
            console.log('FnGetUserDetails :  token is empty');
        }
    }
    catch (ex) {
        console.log('FnGetUserDetails error:' + ex.description);
        throw new Error(ex);
    }
};

//getting the secondary location
exports.FnGetSecondaryLocation = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;

        if (Token != null && Token != '') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetSecondaryLocationDetails(' + db.escape(Token) + ')', function (err, SecondaryResult) {
                            if (!err) {
                                // console.log(UserDetailsResult);
                                if (SecondaryResult[0] != null) {
                                    if (SecondaryResult[0].length > 0) {
                                        // console.log('FnGetSecondaryLocation: Token: ' + Token);
                                        console.log('FnGetSecondaryLocation : tmaster: Secondary User details sent successfully');
                                        res.send(SecondaryResult[0]);
                                    }
                                    else {
                                        res.send('null');
                                        console.log('FnGetSecondaryLocation : tmaster: No secondary location available');
                                    }
                                }
                                else {
                                    res.send('null');
                                    console.log('FnGetSecondaryLocation : tmaster: No secondary location found');
                                }

                            }
                            else {
                                res.send('null');
                                res.statusCode = 500;
                                console.log('FnGetSecondaryLocation : tmaster:' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnGetSecondaryLocation: Invalid token');
                        res.statusCode = 401;
                        res.send('null');
                    }
                }
                else {
                    console.log('FnGetSecondaryLocation: ' + err);
                    res.statusCode = 500;
                    res.send('null');
                }
            });
        }
        else {
            res.send('null');
            res.statusCode = 400;
            console.log('FnGetSecondaryLocation :  token is empty');
        }
    }
    catch (ex) {
        console.log('FnGetSecondaryLocation error:' + ex.description);
        throw new Error(ex);
    }
};


exports.FnRegistration = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var IDTypeID = req.body.IDTypeID;
        var EZEID = req.body.EZEID;
        var Password = req.body.Password;
        var FirstName = req.body.FirstName;
        var LastName = req.body.LastName;
        var CompanyName = req.body.CompanyName;
        var JobTitle = req.body.JobTitle;
        //var CategoryID = req.body.CategoryID;
        //if (CategoryID == null || CategoryID == '') {
        //    CategoryID = 0;
        //}
        var FunctionID = req.body.FunctionID;
        if (FunctionID == null || FunctionID == '') {
            FunctionID = 0;
        }
        var RoleID = req.body.RoleID;
        if (RoleID == null || RoleID == '') {
            RoleID = 0;
        }
        var LanguageID = req.body.LanguageID;
        if (LanguageID == null || LanguageID == '') {
            LanguageID = 0;
        }
        var NameTitleID = req.body.NameTitleID;

        var Latitude = req.body.Latitude;
        if (Latitude == null || Latitude == '') {
            Latitude = 0.0;
        }
        var Longitude = req.body.Longitude;
        if (Longitude == null || Longitude == '') {
            Longitude = 0.0;
        }
        var Altitude = req.body.Altitude;
        if (Altitude == null || Altitude == '') {
            Altitude = 0;
        }
        var AddressLine1 = req.body.AddressLine1;
        var AddressLine2 = req.body.AddressLine2;
        var Area = req.body.Area;
        var Citytitle = req.body.CityTitle;
        var StateID = req.body.StateID;
        var CountryID = req.body.CountryID;
        var PostalCode = req.body.PostalCode;
        var PIN = req.body.PIN;

        var PhoneNumber = req.body.PhoneNumber;
        var MobileNumber = req.body.MobileNumber;
        var EMailID = req.body.EMailID;
        var LaptopSLNO = req.body.LaptopSLNO;
        var VehicleNumber = req.body.VehicleNumber;
        var Picture = req.body.Picture;
        var PictureFileName = req.body.PictureFileName;
        var WebSite = req.body.Website;
        var AboutCompany = req.body.AboutCompany;
        //  var Keywords = req.body.Keywords;
        var StatusID = 1;
        var TokenNo = req.body.Token;
        //Operation I means insert operation and U means update operation
        var Operation = "I";
        if (TokenNo != '' && TokenNo != null) {
            Operation = "U";
        }
        var Icon = req.body.Icon;
        var IconFileName = req.body.IconFileName;
        var ISDPhoneNumber = req.body.ISDPhoneNumber;
        var ISDMobileNumber = req.body.ISDMobileNumber;

        //below lines from parkingstatus to cvmailId is commented bcoz of phase 1
        var ParkingStatus = parseInt(req.body.ParkingStatus);
        var OpenStatus = parseInt(req.body.OpenStatus);
        var WorkingHours = req.body.WorkingHours;
        var SalesEnquiryMailID = req.body.SalesEnquiryMailID;
        var HomeDeliveryMailID = req.body.HomeDeliveryMailID;
        var ReservationMailID = req.body.ReservationMailID;
        var SupportMailID = req.body.SupportMailID;
        var CVMailID = req.body.CVMailID;
        //below parameter is for button enable disable.
        var SalesEnquiryButton = req.body.SalesEnquiryButton;
        var HomeDeliveryButton = req.body.HomeDeliveryButton;
        var ReservationButton = req.body.ReservationButton;
        var SupportButton = req.body.SupportButton;
        var CVButton = req.body.CVButton;
        var Gender = parseInt(req.body.Gender);
        var DOB = req.body.DOB;

        if (ParkingStatus.toString() == 'NaN') {
            ParkingStatus = 1;
        }
        if (OpenStatus.toString() == 'NaN') {
            OpenStatus = 1;
        }
        if (PIN == '') {
            PIN = null;
        }
      //  console.log('PIN: ' + PIN);
        var RtnMessage = {
            Token: '',
            IsAuthenticate: false,
            FirstName: '',
            Type: 0,
            Icon: ''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (IDTypeID != null && EZEID != null && FirstName != null && AddressLine1 != null && Citytitle != null && StateID != null && CountryID != null && PostalCode != null && MobileNumber != null && Gender.toString() != 'NaN') {
            if (LastName == null) {
                LastName = '';
            }
            if (StateID == null || StateID == '') {
                StateID = 0;
            }
            if (CountryID == null || CountryID == '') {
                CountryID = 0;
            }

            if (Operation == 'I') {
                TokenNo = FnGenerateToken();
            }
            var EncryptPWD = '';
            if (Password != null) {
                EncryptPWD = FnEncryptPassword(Password);
            }
            var DOBDate = null;

            if (DOB != null && DOB != '') {
                // datechange = new Date(new Date(TaskDateTime).toUTCString());
                DOBDate = new Date(DOB);
                // console.log(TaskDate);
            }
            //console.log('FnRegistration: Token: ' + TokenNo);
            var InsertQuery = db.escape(IDTypeID) + ',' + db.escape(EZEID) + ',' + db.escape(EncryptPWD) + ',' + db.escape(FirstName) + ',' +
                  db.escape(LastName) + ',' + db.escape(CompanyName) + ',' + db.escape(JobTitle) + ',' + db.escape(FunctionID) + ',' +
                  db.escape(RoleID) + ',' + db.escape(LanguageID) + ',' + db.escape(NameTitleID) + ',' +
                  db.escape(TokenNo) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' + db.escape(Altitude) + ',' +
                  db.escape(AddressLine1) + ',' + db.escape(AddressLine2) + ',' + db.escape(Citytitle) + ',' + db.escape(StateID) + ',' + db.escape(CountryID) + ',' +
                  db.escape(PostalCode) + ',' + db.escape(PIN) + ',' + db.escape(PhoneNumber) + ',' + db.escape(MobileNumber) + ',' + db.escape(EMailID) + ',' +
                   db.escape(LaptopSLNO) + ',' + db.escape(VehicleNumber) + ',' + db.escape(Picture) + ',' + db.escape(PictureFileName) + ',' + db.escape(WebSite) + ',' + db.escape(Operation) + ',' + db.escape(AboutCompany) + ',' + db.escape(StatusID) + ',' + db.escape(Icon) + ',' + db.escape(IconFileName) + ',' +
           db.escape(ParkingStatus) + ',' + db.escape(OpenStatus) + ',' + db.escape(WorkingHours) + ',' + db.escape(SalesEnquiryMailID) + ',' + db.escape(HomeDeliveryMailID) + ',' + db.escape(ReservationMailID) + ',' + db.escape(SupportMailID) + ',' + db.escape(CVMailID) + ',' + db.escape(ISDPhoneNumber) + ',' + db.escape(ISDMobileNumber) + ',' +
           db.escape(SalesEnquiryButton) + ',' + db.escape(HomeDeliveryButton) + ',' + db.escape(ReservationButton) + ',' + db.escape(SupportButton) + ',' + db.escape(CVButton) + ',' + db.escape(Gender) + ',' + db.escape(DOBDate);
          //  console.log(InsertQuery);
            db.query('CALL pSaveEZEIDData(' + InsertQuery + ')', function (err, InsertResult) {
                if (!err) {
                    // console.log('InsertResult: ' + InsertResult);
                    if (InsertResult != null) {
                      //  console.log(InsertResult);
                        if (InsertResult.affectedRows > 0) {
                            RtnMessage.FirstName = FirstName;
                            RtnMessage.IsAuthenticate = true;
                            RtnMessage.Token = TokenNo;
                            RtnMessage.Type = IDTypeID;
                            RtnMessage.Icon = Icon;
                            if (Operation == 'I') {
                                console.log('FnRegistration:tmaster: Registration success');
                                //res.send(RtnMessage);
                                if (EMailID != '' || EMailID != null) {
                                    var fs = require('fs');
                                    fs.readFile("RegTemplate.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[Firstname]", FirstName);
                                        data = data.replace("[Lastname]", LastName);
                                        data = data.replace("[EZEID]", EZEID);
                                        // console.log('Body:' + data);
                                        var mailOptions = {
                                            from: 'noreply@ezeid.com',
                                            to: EMailID,
                                            subject: 'Welcome to EZEID',
                                            html: data // html body
                                        };
                                        //console.log('Mail Option:' + mailOptions);
                                        // send mail with defined transport object
                                        var post = { MessageType: 8, ToMailID: mailOptions.to, Subject: mailOptions.subject, Body: mailOptions.html };
                                        // console.log(post);
                                        var query = db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                            // Neat!
                                            if (!err) {
                                                console.log('FnRegistration: Mail saved Successfully');
                                                res.send(RtnMessage);
                                            }
                                            else {
                                                console.log('FnRegistration: Mail not Saved Successfully' + err);
                                                res.send(RtnMessage);
                                            }
                                        });
                                    });
                                }
                                else {
                                    console.log('FnRegistration: tmaster: registration success but email is empty so mail not sent');
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnRegistration: tmaster: Update operation success');
                                console.log(RtnMessage);
                                res.send(RtnMessage);
                            }
                        }
                        else {
                            console.log(RtnMessage);
                            res.send(RtnMessage);
                            console.log('FnRegistration:tmaster: Registration Failed');
                        }

                    }
                    else {
                        console.log(RtnMessage);
                        res.send(RtnMessage);
                        console.log('FnRegistration:tmaster: Registration Failed');
                    }
                }
                else {
                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnRegistration:tmaster:' + err);
                }
            });
        }
        else {
            if (IDTypeID == null) {
                console.log('FnRegistration: IDTypeID is empty');
            } else if (EZEID == null) {
                console.log('FnRegistration: EZEID is empty');
            } else if (FirstName == null) {
                console.log('FnRegistration: FirstName is empty');
            } else if (AddressLine1 == null) {
                console.log('FnRegistration: AddressLine1 is empty');
            } else if (Citytitle == null) {
                console.log('FnRegistration: CityTitle is empty');
            } else if (StateID == null) {
                console.log('FnRegistration: StateID is empty');
            } else if (CountryID == null) {
                console.log('FnRegistration: CountryID is empty');
            } else if (PostalCode == null) {
                console.log('FnRegistration: PostalCode is empty');
            } else if (MobileNumber == null) {
                console.log('FnRegistration: MobileNumber is empty');
            }
            else if (Gender.toString() == 'NaN') {
                console.log('FnRegistration: Gender is empty')
            }
            res.statusCode = 400;
            res.send(RtnMessage);
            console.log('FnRegistration:tmaster: Manditatory field empty');
        }
    }
    catch (ex) {
        console.log('FnRegistration error:' + ex.description);
        throw new Error(ex);
    }
};

//method for quick registration
exports.FnQuickRegistration = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var EZEID = req.body.EZEID;
        var MobileNumber = req.body.MobileNumber;
        var EMailID = req.body.EMailID;
        var FirstName = req.body.FirstName;
        var LastName = req.body.LastName;
        var Password = req.body.Password;

        var RtnMessage = {
            Token: '',
            IsAuthenticate: false,
            FirstName: '',
            Type: 1,
            Icon: ''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (EZEID != null && MobileNumber != null && EMailID != null && FirstName != null && LastName != null && Password != null) {
            var Encrypt = FnGenerateToken();
            // var EncryptPWD = FnEncryptPassword(Password);
            var InsertQuery = db.escape(EZEID) + ',' + db.escape(MobileNumber) + ',' + db.escape(EMailID) + ',' + db.escape(FirstName) + ',' + db.escape(LastName) + ',' + db.escape(Password) + ',' + db.escape(Encrypt);
            db.query('CALL pSaveQuickEZEIDData(' + InsertQuery + ')', function (err, InsertResult) {
                if (!err) {
                    if (InsertResult != null) {
                        RtnMessage.Token = Encrypt;
                        RtnMessage.IsAuthenticate = true;
                        RtnMessage.FirstName = FirstName;
                        console.log('FnQuickRegistration: Successfully done');
                        if (EMailID != null || EMailID != '') {
                            var fs = require('fs');
                            fs.readFile("RegTemplate.txt", "utf8", function (err, data) {
                                if (err) throw err;
                                data = data.replace("[Firstname]", FirstName);
                                data = data.replace("[Lastname]", LastName);
                                data = data.replace("[EZEID]", EZEID);
                                //console.log('Body:' + data);
                                var mailOptions = {
                                    from: 'noreply@ezeid.com',
                                    to: EMailID,
                                    subject: 'Welcome to Ezeid',
                                    html: data // html body
                                };
                                FnSendMailEzeid(mailOptions, function (err, Result) {
                                    if (!err) {
                                        if (Result != null) {
                                            console.log('FnQuickRegistration: Mail Sent Successfully');
                                            res.send(RtnMessage);
                                        }
                                        else {
                                            console.log('FnQuickRegistration: Mail not Sent Successfully');
                                            res.send(RtnMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnQuickRegistration:Error in sending mails' + err);
                                        res.send(RtnMessage);
                                    }
                                });

                            });

                        }
                        else {
                            res.send(RtnMessage);
                            console.log('FnQuickRegistration: resgistration success but email is empty');
                        }

                    }
                    else {
                        res.send(RtnMessage);
                        console.log('FnQuickRegistration: resgistration failed');
                    }
                }
                else {
                    res.send(RtnMessage);
                    res.statusCode = 500;
                    console.log('FnQuickRegistration: mcity: ' + err);
                }
            });
        }
        else {
            if (EZEID == null) {
                console.log('FnQuickRegistration: EZEID is empty');
            }
            else if (MobileNumber == null) {
                console.log('FnQuickRegistration: MobileNumber is empty');
            }
            else if (EMailID == null) {
                console.log('FnQuickRegistration: EMailID is empty');
            }
            else if (FirstName == null) {
                console.log('FnQuickRegistration: FirstName is empty');
            }
            else if (LastName == null) {
                console.log('FnQuickRegistration: LastName is empty');
            }
            else if (Password == null) {
                console.log('FnQuickRegistration: Password is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnQuickRegistration error:' + ex.description);
        throw new Error(ex);
    }
};

//method for adding secondary locations

exports.FnAddLocation = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = parseInt(req.body.TID);
        var Token = req.body.Token;
        var LocTitle = req.body.LocTitle;
        var Latitude = parseFloat(req.body.Latitude);
        var Longitude = parseFloat(req.body.Longitude);
        var Altitude = req.body.Altitude;
        var AddressLine1 = req.body.AddressLine1;
        var AddressLine2 = req.body.AddressLine2;
        var CityName = req.body.CityTitle;
        var StateID = parseInt(req.body.StateID);
        var CountryID = parseInt(req.body.CountryID);
        var PostalCode = req.body.PostalCode;
        var PIN = req.body.PIN;
        var PhoneNumber = req.body.PhoneNumber;
        var MobileNumber = req.body.MobileNumber;
        var EMailID = req.body.EMailID;
        var LaptopSLNO = req.body.LaptopSLNO;
        var VehicleNumber = req.body.VehicleNumber;
        var Picture = req.body.Picture;
        var PictureFileName = req.body.PictureFileName;
        var Website = req.body.Website;
        var ISDPhoneNumber = req.body.ISDPhoneNumber;
        var ISDMobileNumber = req.body.ISDMobileNumber;

        //below line of code is commented for phase 1
        var ParkingStatus = parseInt(req.body.ParkingStatus);
        var OpenStatus = parseInt(req.body.OpenStatus);
        var WorkingHours = req.body.WorkingHours;
        var SalesEnquiryMailID = req.body.SalesEnquiryMailID;
        var HomeDeliveryMailID = req.body.HomeDeliveryMailID;
        var ReservationMailID = req.body.ReservationMailID;
        var SupportMailID = req.body.SupportMailID;
        var CVMailID = req.body.CVMailID;
        var SalesEnquiryButton = req.body.SalesEnquiryButton;
        var HomeDeliveryButton = req.body.HomeDeliveryButton;
        var ReservationButton = req.body.ReservationButton;
        var SupportButton = req.body.SupportButton;
        var CVButton = req.body.CVButton;
        if (ParkingStatus.toString() == 'NaN') {
            ParkingStatus = 0;
        }
        if (OpenStatus.toString() == 'NaN') {
            OpenStatus = 0;
        }

        if (PIN == '') {
            PIN = null;
        }

        if (TID.toString() != 'NaN' && Token != null && CityName != null && StateID.toString() != 'NaN' && CountryID.toString() != 'NaN' && LocTitle != null && AddressLine1 != null && Longitude.toString() != 'NaN' && Latitude.toString() != 'NaN') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var InsertQuery = db.escape(TID) + ',' + db.escape(Token) + ',' + db.escape(LocTitle) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' + db.escape(Altitude) + ',' +
                                        db.escape(AddressLine1) + ',' + db.escape(AddressLine2) + ',' + db.escape(CityName) + ',' + db.escape(StateID) + ',' + db.escape(CountryID) + ',' +
                                        db.escape(PostalCode) + ',' + db.escape(PIN) + ',' + db.escape(PhoneNumber) + ',' + db.escape(MobileNumber) + ',' + db.escape(EMailID) + ',' + db.escape(LaptopSLNO) + ',' +
                                        db.escape(VehicleNumber) + ',' + db.escape(Picture) + ',' + db.escape(PictureFileName) + ',' + db.escape(Website) + ',' + db.escape(ParkingStatus) + ',' + db.escape(OpenStatus) + ',' +
                                        db.escape(WorkingHours) + ',' + db.escape(SalesEnquiryMailID) + ',' + db.escape(HomeDeliveryMailID) + ',' + db.escape(ReservationMailID) + ',' + db.escape(SupportMailID) + ',' + db.escape(CVMailID) + ',' + db.escape(ISDPhoneNumber) + ',' + db.escape(ISDMobileNumber) + ',' +
                                       db.escape(SalesEnquiryButton) + ',' + db.escape(HomeDeliveryButton) + ',' + db.escape(ReservationButton) + ',' + db.escape(SupportButton) + ',' + db.escape(CVButton);
                      //  console.log('InsertQuery:' + InsertQuery);
                        db.query('CALL pInsertLocationData(' + InsertQuery + ')', function (err, InsertResult) {
                            if (!err) {
                                if (InsertResult != null) {
                                    if (InsertResult.affectedRows > 0) {
                                        //res.send(InsertResult);
                                        // console.log(InsertResult);
                                        console.log('Addlocation: Location added successfully');
                                        var selectqry = 'Select tlocations.TID,MasterID,EZEID,LocTitle,Latitude,Longitude,Altitude,AddressLine1,AddressLine2,Area,StateID,CountryID,PostalCode,PIN,EMailID,EMailVerifiedID,PhoneNumber,MobileNumber, LaptopSLNO,VehicleNumber,CreatedDate,LUDate,Website,SeqNo,Picture,PictureFileName,locSetting.ParkingStatus,locSetting.OpenStatus,locSetting.WorkingHours,locSetting.SalesEnquiryMailID,locSetting.HomeDeliveryMailID,locSetting.ReservationMailID,locSetting.SupportMailID,locSetting.CVMailID,ifnull((Select CityName from mcity where CityID=tlocations.CityID),"") as CityTitle from tlocations left outer join tlcoationsettings  locSetting on locSetting.LocID= tlocations.TID';
                                        if (TID == 0) {
                                            selectqry = selectqry + ' order by tlocations.TID desc limit 1';
                                        }
                                        else {
                                            selectqry = selectqry + ' where tlocations.TID=' + db.escape(TID);
                                        }
                                        //  console.log('AddLocaiton: selectqry: ' + selectqry);
                                        db.query(selectqry, function (err, SelectResult) {
                                            if (!err) {
                                                //console.log('AddLocaiton: SelectResult: ' + SelectResult);
                                                console.log('Addlocation: Sending location details ' + TID);
                                                res.send(SelectResult);
                                            }
                                            else {
                                                res.statusCode = 500;
                                                res.send([]);
                                                console.log('FnAddLocation: select qry failed' + err);
                                            }
                                        })
                                    }
                                    else {
                                        res.send([]);
                                        console.log('FnAddLocation: No affected rows');
                                    }
                                }
                                else {
                                    res.send([]);
                                    console.log('FnAddLocation: resgistration failed');
                                }
                            }
                            else {
                                res.send([]);
                                res.statusCode = 500;
                                console.log('FnAddLocation: mcity: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnAddLocation: Invalid token');
                        res.statusCode = 401;
                        res.send('null');
                    }
                }
                else {
                    console.log('FnAddLocation: ' + err);
                    res.statusCode = 500;
                    res.send('null');
                }
            });
        }
        else {
            if (TID.toString() == 'NaN') {
                console.log('FnAddLocation: TID is empty');
            }
            else if (Token == null) {
                console.log('FnAddLocation: Token is empty');
            }
            else if (LocTitle == null) {
                console.log('FnAddLocation: LocTitle is empty');
            }
            else if (Latitude.toString() == 'NaN') {
                console.log('FnAddLocation: Latitude is empty');
            }
            else if (Longitude.toString() == 'NaN') {
                console.log('FnAddLocation: Longitude is empty');
            }
            else if (AddressLine1 == null) {
                console.log('FnAddLocation: AddressLine1 is empty');
            }
            else if (CityName == null) {
                console.log('FnAddLocation: CityName is empty');
            }
            else if (StateID.toString() == 'NaN') {
                console.log('FnAddLocation: StateID   is empty');
            }
            else if (CountryID.toString() == 'NaN') {
                console.log('FnAddLocation: CountryID   is empty');
            }
           
            res.statusCode = 400;
            res.send([]);
        }
    }
    catch (ex) {
        console.log('FnAddLocation error:' + ex.description);
        throw new Error(ex);
    }
};

//method for delete location
exports.FnDeleteLocation = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.body.Token;
        var TID = parseInt(req.body.TID);
        var RtnMessage = {
            IsDeleted: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (token != null && token != '' && TID.toString() != 'NaN') {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = 'DELETE FROM tlocations where TID=' + db.escape(TID);
                      //  console.log('FnDeleteLocation: DeleteQuery : ' + query);
                        db.query(query, function (err, DeleteResult) {
                            if (!err) {
                                console.log('DeleteQuery: ' + DeleteResult);
                                if (DeleteResult.affectedRows > 0) {
                                    RtnMessage.IsDeleted = true;
                                    res.send(RtnMessage);
                                }
                                else {
                                    console.log('FnDeleteLocation: deleting item is not avaiable');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnDeleteLocation: ' + err);
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteLocation: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteLocation: ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (token == null || token == '') {
                console.log('FnDeleteLocation: token is empty');
            }
            if (TID.toString() == 'NaN') {
                console.log('FnDeleteLocation: TID is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnDeleteLocation error:' + ex.description);
        throw new Error(ex);
    }
};

//method to send mails
exports.FnSendMail = function (req, res) {
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
                //        res.send('null');
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
                            res.send('null');
                        }
                    }
                    else {
                        console.log('FnSendMail: Error in sending mails' + err);
                        res.send('null');
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
        throw new Error(ex);
    }

};

//method to get access history of users
exports.FnGetAccessHistory = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.TokenNo;
        var Page = parseInt(req.query.Page);

        if (Token != null && Page.toString() != 'NaN' && Page.toString() != '0') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var ToPage = 25 * Page;
                        var FromPage = ToPage - 24;

                        if (FromPage <= 1) {
                            FromPage = 0;
                        }

                        db.query('CALL pAccessHistory(' + db.escape(Token) + ',' + db.escape(FromPage) + ',' + db.escape(ToPage) + ')', function (err, AccessHistoryResult) {
                            if (!err) {
                                //    console.log(AccessHistoryResult);
                                if (AccessHistoryResult[0] != null) {
                                    if (AccessHistoryResult[0].length > 0) {
                                        res.send(AccessHistoryResult[0]);
                                        console.log('FnGetAccessHistory: History sent successfully');
                                    }
                                    else {
                                        console.log('FnGetAccessHistory: History not available');
                                        res.send('null');
                                    }

                                }
                                else {
                                    console.log('FnGetAccessHistory: No History available');
                                    res.send('null');
                                }
                            }
                            else {
                                res.send('null');
                                console.log('FnGetAccessHistory: Error in sending documents: ' + err);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        console.log('FnGetAccessHistory: Invalid Token');
                        res.send('null');
                    }
                }
                else {
                    res.statusCode = 500;
                    console.log('FnGetAccessHistory: Token error: ' + err);
                    res.send('null');
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnGetAccessHistory: Token is empty');
            }
            else if (Page.toString() != 'NaN') {
                console.log('FnGetAccessHistory: Type is empty');
            }
            res.statusCode = 400;
            res.send('null');
        }

    }
    catch (ex) {
        console.log('FnGetAccessHistory error:' + ex.description);
        throw new Error(ex);
    }
};

//method to save messages 
exports.FnSaveMessage = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.TokenNo;
        var ToMasterID = parseInt(req.body.ToMasterID);
        var MessageType = req.body.MessageType;
        var Message = req.body.Message;
        var Status = 0;
        var TaskDateTime = req.body.TaskDateTime;
        var Notes = req.body.Notes;
        var LocID = req.body.LocID;

        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null && ToMasterID.toString() != 'NaN' && LocID != null) {
                        var TaskDate = null;
                        if (TaskDateTime != null) {
                            // datechange = new Date(new Date(TaskDateTime).toUTCString());
                            TaskDate = new Date(TaskDateTime);
                            console.log(TaskDate);
                        }
                        // console.log(datechange);
                        var query = db.escape(Token) + ',' + db.escape(MessageType) + ',' + db.escape(Message) + ',' + db.escape(Status) + ',' + db.escape(TaskDate) + ',' + db.escape(ToMasterID) + ',' + db.escape(Notes) + ',' + db.escape(LocID);
                       // console.log(query);
                        db.query('CALL pSaveMessages(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                //console.log(InsertResult);
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    console.log('FnSaveMessage: Messages Saved successfully');
                                    //console.log(RtnMessage);

                                    var MessageContent = {
                                        Token: Token,
                                        LocID: LocID,
                                        MessageType: MessageType,
                                        Message: Message,
                                        TaskDateTime: TaskDateTime
                                    };
                                    //console.log(MessageContent);
                                    FnMessageMail(MessageContent, function (err, Result) {
                                        if (!err) {
                                            if (Result != null) {
                                                console.log('FnSaveMessage: Mail Sent Successfully');
                                                res.send(RtnMessage);
                                            }
                                            else {
                                                console.log('FnSaveMessage: Mail not Sent Successfully');
                                                res.send(RtnMessage);
                                            }
                                        }
                                        else {
                                            console.log('FnSaveMessage:Error in sending mails' + err);
                                            res.send(RtnMessage);
                                        }
                                    });

                                }
                                else {
                                    console.log('FnSaveMessage: Messages not inserted');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                res.send(RtnMessage);
                                console.log('FnSaveMessage: Error in saving Messages : ' + err);
                            }
                        });
                    }
                    else {
                        if (ToMasterID.toString() == 'NaN') {
                            console.log('FnSaveMessage: ToMasterID is empty');
                            res.statusCode = 400;
                        } else if (LocID == null) {
                            console.log('FnSaveMessage: LocID is empty');
                            res.statusCode = 400;
                        }
                        else {
                            console.log('FnSaveMessage: Invalid Token');
                            res.statusCode = 401;
                        }
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveMessage: Token error: ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });

        }
        else {
            console.log('FnSaveMessage: Token is empty');
            res.statusCode = 400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveMessage error:' + ex.description);
        throw new Error(ex);
    }
};

//method to get messages
exports.FnGetMessages = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.TokenNo;
        var Page = parseInt(req.query.Page);
        var Status = req.query.Status;
        var MessageType = req.query.MessageType;
        //console.log(req.query);
        if (Token != null && Page.toString() != 'NaN' && Page.toString() != '0') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var ToPage = 25 * Page;
                        var FromPage = ToPage - 24;

                        if (FromPage <= 1) {
                            FromPage = 0;
                        }
                      //  console.log('From Page: ' + FromPage);
                        //console.log('To Page: ' + ToPage);
                        db.query('CALL pGetMessages(' + db.escape(Token) + ',' + db.escape(FromPage) + ',' + db.escape(ToPage) + ',' + db.escape(Status) + ',' + db.escape(MessageType) + ')', function (err, MessagesResult) {
                            if (!err) {
                                //  console.log(MessagesResult);
                                if (MessagesResult != null) {
                                    if (MessagesResult[0].length > 0) {
                                        res.send(MessagesResult[0]);
                                        console.log('FnGetMessages: Messages sent successfully');
                                    }
                                    else {
                                        console.log('FnGetMessages: No Messages available');
                                        res.send('null');
                                    }

                                }
                                else {
                                    console.log('FnGetMessages: No Messages available');
                                    res.send('null');
                                }
                            }
                            else {
                                res.statusCode = 500;
                                console.log('FnGetMessages: Error in sending Messages: ' + err);
                                res.send('null');
                            }
                        });
                    }
                    else {
                        console.log('FnGetMessages: Invalid Token');
                        res.statusCode = 401;
                        res.send('null');
                    }
                }
                else {
                    res.statusCode = 500;
                    console.log('FnGetMessages: Token error: ' + err);
                    res.send('null');
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetMessages: Token is empty');
            } else if (Page.toString() == 'NaN') {
                console.log('FnGetMessages: Page is empty');
            }
            else if (Page.toString() == '0') {
                console.log('FnGetMessages: Sending page 0');
            }
            res.statusCode = 400;
            res.send('null');
        }
    }
    catch (ex) {
        console.log('FnGetMessages error:' + ex.description);
        throw new Error(ex);
    }
};

//method to update status of messages
exports.FnUpdateMessageStatus = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.body.TokenNo;
        var Status = parseInt(req.body.Status);
        var TID = parseInt(req.body.TID);
        var Notes = req.body.Notes;
        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Notes == null)
            Notes = '';
        if (token != null && token != '' && Status.toString() != 'NaN' && TID.toString() != 'NaN') {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        //var query = 'update tmessages set Status=' + db.escape(Status) + ' where TID=' + db.escape(TID);
                        var query = 'update tmessages set Status=' + db.escape(Status) + ', Notes=' + db.escape(Notes) + ' where TID=' + db.escape(TID);
                        // console.log('Update query : ' + query);
                        db.query(query, function (err, UpdateResult) {
                            if (!err) {
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (UpdateResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateMessageStatus: Message status update successfully');
                                }
                                else {
                                    console.log('FnUpdateMessageStatus: Update item is not avaiable');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnUpdateMessageStatus: ' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateMessageStatus: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    res.statusCode = 500;
                    console.log('FnUpdateMessageStatus: : ' + err);
                    res.send(RtnMessage);

                }
            });

        }
        else {
            if (token == null || token == '') {
                console.log('FnUpdateMessageStatus: token is empty');
            }
            else if (Status.toString() == 'NaN') {
                console.log('FnUpdateMessageStatus: Status is empty');
            }
            else if (TID.toString() != 'NaN') {
                console.log('FnUpdateMessageStatus: TID is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);

        }
    }
    catch (ex) {
        console.log('FnUpdateMessageStatus:  error:' + ex.description);
        throw new Error(ex);
    }
};

//method to udpate primary location picture
exports.FnUpdateProfilePicture = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.TokenNo;
        var Picture = req.body.Picture;
        var PictureFileName = req.body.PictureFileName;
        //console.log('FnUpdateProfilePicture');
        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        //if (Picture == null)
        //    Picture = '';
        //if (PictureFileName == null)
        //    PictureFileName = '';
        if (Token != null && Picture != null && PictureFileName != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('select TID from tmaster where Token=' + db.escape(Token), function (err, UserResult) {
                            if (!err) {
                                //console.log(UserResult);
                                if (UserResult != null) {
                                    if (UserResult.length > 0) {
                                        var query = 'Update tlocations set Picture = ' + db.escape(Picture) + ',' + 'PictureFileName= ' + db.escape(PictureFileName) + ' where SeqNo=0 and MasterID=' + db.escape(UserResult[0].TID);
                                        // console.log(query);
                                        db.query(query, function (err, PicResult) {
                                            if (!err) {
                                                //console.log(PicResult);
                                                if (PicResult.affectedRows > 0) {
                                                    RtnMessage.IsSuccessfull = true;
                                                    res.send(RtnMessage);
                                                    console.log('FnUpdateProfilePicture: Picture updated successfully');
                                                }
                                                else {
                                                    console.log('FnUpdateProfilePicture: No picture avaiable');
                                                    res.send(RtnMessage);
                                                }

                                            }
                                            else {
                                                console.log('FnUpdateProfilePicture: No document available: ' + err);
                                                res.send(RtnMessage);
                                            }
                                        });
                                    }
                                    else {
                                        console.log('FnUpdateProfilePicture: No user available');
                                        res.send(RtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnUpdateProfilePicture: No user avaiable');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                res.send(RtnMessage);
                                res.statusCode = 500;
                                console.log('FnUpdateProfilePicture: Error in sending documents: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateProfilePicture: Invalid Token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnUpdateProfilePicture: Token error: ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnUpdateProfilePicture: Token is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnUpdateProfilePicture error:' + ex.description);
        throw new Error(ex);
    }
};

//need to change in server
exports.FnSaveCVInfo = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        // In tFunctionID Int,In tRoleID Int, In tKeySkills varchar(250), In tCVDoc longtext, In tCVDocFile varchar(250), In iStatus int, In tPin varchar(15), In tToken varchar(15)

        var FunctionID = req.body.FunctionID;
        var RoleID = req.body.RoleID;
        var KeySkills = req.body.KeySkills;
        //  var CVDoc = req.body.CVDoc;
        // var CVDocFile = req.body.CVDocFile;
        var Status = parseInt(req.body.Status);
        var Pin = req.body.Pin;
        var Token = req.body.TokenNo;

        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        // console.log(datechange);
                        //var fileName = '';
                        //if (CVDocFile != null) {
                        //    fileName = CVDocFile.split('.').pop();
                        //}
                        if (Pin == '') {
                            Pin = null;
                        }

                        var query = db.escape(FunctionID) + ',' + db.escape(RoleID) + ',' + db.escape(KeySkills) + ',' + db.escape(Status) + ',' + db.escape(Pin) + ',' + db.escape(Token);
                        //console.log(query);
                        db.query('CALL pSaveCVInfo(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                RtnMessage.IsSuccessfull = true;
                                console.log('FnSaveCVInfo: CV Info Saved successfully');
                                res.send(RtnMessage);
                            }
                            else {
                                res.send(RtnMessage);
                                res.statusCode = 500;
                                console.log('FnSaveCVInfo: Error in saving CV Info  : ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveCVInfo: Invalid Token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveCVInfo: Token error: ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });

        }
        else {
            console.log('FnSaveCVInfo: Token is empty');
            res.statusCode = 400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveCVInfo error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetCVInfo = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.TokenNo;

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pgetCVInfo(' + db.escape(Token) + ')', function (err, MessagesResult) {
                            if (!err) {
                                //  console.log(MessagesResult);
                                if (MessagesResult[0] != null) {
                                    if (MessagesResult[0].length > 0) {
                                        res.send(MessagesResult[0]);
                                        console.log('FnGetCVInfo: CV Info sent successfully');
                                    }
                                    else {
                                        console.log('FnGetCVInfo: No CV Info  available');
                                        res.send('null');
                                    }
                                }
                                else {
                                    console.log('FnGetCVInfo: No CV Info  available');
                                    res.send('null');
                                }
                            }
                            else {
                                console.log('FnGetCVInfo: Error in sending Messages: ' + err);
                                res.statusCode = 500;
                                res.send('null');
                            }
                        });
                    }
                    else {
                        console.log('FnGetCVInfo: Invalid Token');
                        res.statusCode = 401;
                        res.send('null');
                    }
                }
                else {
                    console.log('FnGetCVInfo: Token error: ' + err);
                    res.statusCode = 500;
                    res.send('null');
                }
            });
        }
        else {

            console.log('FnGetCVInfo: Token is empty');
            res.statusCode = 400;
            res.send('null');
        }
    }
    catch (ex) {
        console.log('FnGetCVInfo error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnUpdateDocPin = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.body.TokenNo;
        var tPin = parseInt(req.body.Pin);
        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (token != null && token != '' && tPin.toString() != 'NaN') {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(token) + ',' + db.escape(tPin);
                        db.query('CALL pUpdateDocPIN(' + query + ')', function (err, UpdateResult) {
                            if (!err) {
                              //  console.log(UpdateResult);
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (UpdateResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateDocPin:  Doc Pin updates successfully');
                                }
                                else {
                                    console.log('FnUpdateDocPin:  Doc Pin  is not updated');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnUpdateDocPin: ' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnUpdateDocPin: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnUpdateDocPin: : ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }
        else {
            if (token == null || token == '') {
                console.log('FnUpdateDocPin: token is empty');
            }
            else if (tPin.toString() == 'NaN') {
                console.log('FnUpdateDocPin: PIN is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);

        }
    }
    catch (ex) {
        console.log('FnUpdateMessageStatus:  error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetDocPin = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.query.TokenNo;
        if (token != null) {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetDocPIN(' + db.escape(token) + ')', function (err, BussinessListingResult) {
                            if (!err) {
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (BussinessListingResult[0] != null) {
                                    if (BussinessListingResult[0].length > 0) {
                                        res.send(BussinessListingResult[0]);
                                        console.log('FnGetDocPin: Bussiness Pin sent successfully');
                                    }
                                    else {
                                        console.log('FnGetDocPin: Bussiness Pin is not avaiable');
                                        res.send('null');
                                    }
                                }
                                else {
                                    console.log('FnGetDocPin: Bussiness listing is not avaiable');
                                    res.send('null');
                                }
                            }
                            else {
                                console.log('FnGetDocPin: ' + err);
                                res.statusCode = 500;
                                res.send('null');
                            }
                        });
                    }
                    else {
                        console.log('FnGetDocPin: Invalid token');
                        res.statusCode = 401;
                        res.send('null');
                    }
                }
                else {
                    console.log('FnGetDocPin: : ' + err);
                    res.statusCode = 500;
                    res.send('null');
                }
            });
        }
        else {
            console.log('FnGetDocPin: token is empty');
            res.statusCode = 400;
            res.send('null');

        }
    }
    catch (ex) {
        console.log('FnGetDocPin:  error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnCheckCV = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.Token;
        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var qry = 'select TID from tmaster where Token=' + db.escape(Token);
                        db.query(qry, function (err, TokenTitleResult) {
                            if (!err) {
                                if (TokenTitleResult != null) {
                                    if (TokenTitleResult.length > 0) {
                                        var TID = TokenTitleResult[0].TID;
                                        var Query = 'Select CVDoc from tcv where MasterID=' + db.escape(TID);
                                        db.query(Query, function (err, TCVResult) {
                                            if (!err) {
                                                if (TCVResult.length > 0) {
                                                    if (TCVResult[0].CVDoc != null && TCVResult[0].CVDoc != '') {
                                                        RtnMessage.IsSuccessfull = true;
                                                        res.send(RtnMessage);
                                                        console.log('FnCheckCV: tcv: CV is available');
                                                    }
                                                    else {
                                                        res.send(RtnMessage);
                                                        console.log('FnCheckCV: tcv: CV is not available');
                                                    }
                                                }
                                                else {
                                                    res.send(RtnMessage);
                                                    console.log('FnCheckCV: mtitle: cv is not avaiable');
                                                }
                                            }
                                            else {
                                                res.statusCode = 500;
                                                res.send(RtnMessage);
                                                console.log('FnCheckCV: tcv: ' + err);
                                            }
                                        });
                                    }
                                    else {
                                        res.send(RtnMessage);
                                        console.log('FnCheckCV: No user informations')
                                    }
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('FncheckCV: No user information')
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.send(RtnMessage);
                                console.log('FnCheckCV:Error in Getting userdetails: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnCheckCV:Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnCheckCV: Error in checking token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            console.log('FnCheckCV: LangId is empty');
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnCheckCV error:' + ex.description);
        throw new Error(ex);
    }
};
//method to save documents
exports.FnSaveDoc = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.body.TokenNo;
        var tRefNo = req.body.RefNo;
        var tRefExpiryDate = req.body.RefExpiryDate;
        var tRefType = parseInt(req.body.RefType);

        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null && tRefType.toString() != 'NaN') {
                        if (tRefExpiryDate != null) {
                            tRefExpiryDate = new Date(tRefExpiryDate);
                            //console.log(tRefExpiryDate);
                        }
                        var query = db.escape(Token) + ',' + db.escape(tRefNo) + ',' + db.escape(tRefExpiryDate) + ',' + db.escape(tRefType);
                        //console.log('FnSaveDoc: Inserting data: ' + query);
                        db.query('CALL pSaveDocs(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                //console.log(InsertResult);
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    console.log('Document Saved successfully');
                                    res.send(RtnMessage);
                                }
                                else {
                                    console.log('FnSaveDocs: Document not inserted');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.send(RtnMessage);
                                console.log('FnSaveDoc: Error in saving documents: ' + err);
                            }
                        });
                    }
                    else {
                        if (tRefType.toString() == 'NaN') {
                            console.log('FnSaveDoc: tRefType');
                            res.statusCode = 400;
                        }
                        else {
                            console.log('FnSaveDoc: Invalid Token');
                            res.statusCode = 401;
                        }
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveDoc: Token error: ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });

        }
        else {
            console.log('FnSaveDoc: Token is empty');
            res.statusCode = 400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        console.log('FnSaveDoc error:' + ex.description);
        throw new Error(ex);
    }
};

//method to get documents
exports.FnGetDoc = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.TokenNo;
        var Type = parseInt(req.query.Type);

        if (Token != null && Type.toString() != 'NaN' && Type.toString() != '0') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetDocs(' + db.escape(Token) + ',' + db.escape(Type) + ')', function (err, DocumentResult) {
                            if (!err) {
                                //console.log(DocumentResult);
                                if (DocumentResult[0] != null) {
                                    if (DocumentResult[0].length > 0) {
                                        res.send(DocumentResult[0]);
                                        console.log('FnGetDoc: Document sent successfully');
                                    }
                                    else {
                                        console.log('FnGetDoc: No document available');
                                        res.send('null');
                                    }

                                }
                                else {
                                    console.log('FnGetDoc: No document available');
                                    res.send('null');
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.send('null');
                                console.log('FnGetDoc: Error in sending documents: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnGetDoc: Invalid Token');
                        res.statusCode = 401;
                        res.send('null');
                    }
                }
                else {
                    console.log('FnGetDoc: Token error: ' + err);
                    res.statusCode = 500;
                    res.send('null');
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnGetDoc: Token is empty');
            }
            else if (Type.toString() != 'NaN' || Type.toString() == '0') {
                console.log('FnGetDoc: Type is empty');
            }
            res.statusCode = 400;
            res.send('null');
        }

    }
    catch (ex) {
        console.log('FnGetDoc error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnUpdateBussinessListing = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.body.TokenNo;
        var CategoryID = parseInt(req.body.CategoryID);
        var Keywords = req.body.Keywords;
        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (token != null && token != '' && CategoryID.toString() != 'NaN' && Keywords != null) {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        //  var fileName = BrochureDocFile.split('.').pop();
                        var query = db.escape(token) + ',' + db.escape(Keywords) + ',' + db.escape(CategoryID);
                        //console.log(query);
                        db.query('CALL pUpdateBusinesslist(' + query + ')', function (err, UpdateResult) {
                            if (!err) {
                                //console.log(UpdateResult);
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (UpdateResult.affectedRows > 0) {
                                    RtnMessage.IsUpdated = true;
                                    res.send(RtnMessage);
                                    console.log('FnUpdateBussinessListing: Bussiness listing update successfully');
                                }
                                else {
                                    console.log('FnUpdateBussinessListing: Bussiness listing is not avaiable');
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnUpdateBussinessListing: ' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        console.log('FnUpdateBussinessListing: Invalid token');
                        res.send(RtnMessage);
                    }
                }
                else {
                    res.statusCode = 500;
                    console.log('FnUpdateBussinessListing: : ' + err);
                    res.send(RtnMessage);

                }
            });

        }
        else {
            if (token == null || token == '') {
                console.log('FnUpdateBussinessListing: token is empty');
            }
            else if (CategoryID.toString() == 'NaN') {
                console.log('FnUpdateMessageStatus: CategoryID is empty');
            }
            else if (Keywords == null) {
                console.log('FnUpdateMessageStatus: Keywords is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);

        }
    }
    catch (ex) {
        console.log('FnUpdateMessageStatus:  error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetBussinessListing = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.query.TokenNo;
        if (token != null) {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetBusinesslist(' + db.escape(token) + ')', function (err, BussinessListingResult) {
                            if (!err) {
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (BussinessListingResult[0] != null) {
                                    if (BussinessListingResult[0].length > 0) {
                                        res.send(BussinessListingResult[0]);
                                        console.log('FnGetBussinessListing: Bussiness listing sent successfully');
                                    }
                                    else {
                                        console.log('FnGetBussinessListing: Bussiness listing is not avaiable');
                                        res.send('null');
                                    }
                                }
                                else {
                                    console.log('FnGetBussinessListing: Bussiness listing is not avaiable');
                                    res.send('null');
                                }
                            }
                            else {
                                console.log('FnGetBussinessListing: ' + err);
                                res.statusCode = 500;
                                res.send('null');
                            }
                        });
                    }
                    else {
                        console.log('FnGetBussinessListing: Invalid token');
                        res.statusCode = 401;
                        res.send('null');
                    }
                }
                else {
                    console.log('FnGetBussinessListing: : ' + err);
                    res.statusCode = 500;
                    res.send('null');
                }
            });
        }
        else {
            console.log('FnGetBussinessListing: token is empty');
            res.statusCode = 400;
            res.send('null');

        }
    }
    catch (ex) {
        console.log('FnGetBussinessListing:  error:' + ex.description);
        throw new Error(ex);
    }
};

var fs = require("fs");
exports.FnUploadDocument = function (req, res) {
    try {
        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        // console.log(req.files);
        // console.log(req.body);
        var Token = req.body.TokenNo;
        var CntType = req.files.file.mimetype;
        var RefFileName = req.files.file.path;
        //var RefFileName = req.body.Filename;
        var tRefType = req.body.RefType;
        //console.log(req.body);

        FnValidateToken(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    if (req && req.files) {
                        if (CntType != null && RefFileName != null && tRefType != null && Token != null) {

                            var fileName = '';
                            if (RefFileName != null) {
                                fileName = RefFileName.split('.').pop();
                            }
                            //console.log(Token);
                            fs.readFile(RefFileName, function (err, original_data) {
                                var query = db.escape(Token) + ',' + db.escape(original_data) + ',' + db.escape(fileName) + ',' + db.escape(tRefType) + ',' + db.escape(CntType);
                                //console.log(query);
                                db.query('CALL pSaveDocsFile(' + query + ')', function (err, InsertResult) {
                                    if (!err) {
                                        //    console.log(InsertResult);
                                        if (InsertResult.affectedRows > 0) {
                                            RtnMessage.IsSuccessfull = true;
                                            console.log('FnUploadDocument: Document Saved successfully');
                                            res.send(RtnMessage);
                                        }
                                        else {
                                            console.log('FnUploadDocument: Document not inserted');
                                            res.send(RtnMessage);
                                        }
                                    }
                                    else {
                                        res.statusCode = 500;
                                        res.send(RtnMessage);
                                        console.log('FnUploadDocument: Error in saving documents:' + err);
                                    }
                                });
                            });
                        }
                        else {
                            res.send(RtnMessage);
                            console.log('FnUploadDocument: Mandatory field are available');
                        }
                    }
                    else {
                        res.send(RtnMessage);
                        console.log('FnUploadDocument: Mandatory field are available');
                    }
                }
                else {
                    res.statusCode = 401;
                    res.send(RtnMessage);
                    console.log('FnUploadDocument: Invalid Token');
                }
            }
            else {
                res.statusCode = 500;
                res.send(RtnMessage);
                console.log('FnUploadDocument: Error in validating token: ' + err);
            }
        });
    }
    catch (ex) {
        console.log('FnGetDocument error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetDocument = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.TokenNo;
        var Type = parseInt(req.query.RefType);
        if (Token != null && Type.toString() != 'NaN' && Type.toString() != '0') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = db.escape(Token) + ',' + db.escape(Type);
                        //console.log(query);
                        db.query('CALL  pGetDocsFile(' + query + ')', function (err, DocumentResult) {
                            if (!err) {
                                if (DocumentResult[0] != null) {
                                    if (DocumentResult[0].length > 0) {
                                        DocumentResult = DocumentResult[0];
                                        //console.log(DocumentResult)
                                        var docs = DocumentResult[0];
                                        //console.log(docs.ContentType);
                                        //console.log(docs.Filename);
                                        // console.log(docs.IDDocBlob);
                                        res.setHeader('Content-Type', docs.ContentType);
                                        res.setHeader('Content-Disposition', 'attachment; filename=' + docs.Filename);
                                        res.setHeader('Cache-Control', 'public, max-age=0');
                                        res.writeHead('200', { 'Content-Type': docs.ContentType });
                                        //console.log(docs.Docs);
                                        res.end(docs.Docs, 'base64');
                                        console.log('FnGetDocument: Document sent successfully-1');
                                    }
                                    else {
                                        console.log('FnGetDocument: No document available');
                                        res.send('null');
                                    }

                                }
                                else {
                                    console.log('FnGetDocument: No document available');
                                    res.send('null');
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.send('null');
                                console.log('FnGetDocument: Error in sending documents: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnGetDocument: Invalid Token');
                        res.statusCode = 401;
                        res.send('null');
                    }
                }
                else {
                    console.log('FnGetDocument: Token error: ' + err);
                    res.statusCode = 500;
                    res.send('null');
                }
            });

        }
        else {
            if (Token == null) {
                console.log('FnGetDocument: Token is empty');
            }
            else if (Type.toString() != 'NaN' || Type.toString() == '0') {
                console.log('FnGetDocument: Type is empty');
            }
            res.statusCode = 400;
            res.send('null');
        }

    }
    catch (ex) {
        console.log('FnGetDocument error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetSearchDocuments = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var find = req.query.Keywords;
        var token = req.query.Token;
        //console.log(token);
        if (token != null && find != null && token != '' && find != '') {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        var EZEID, Pin = null;
                        var DocType = '';
                        var FindArray = find.split('.');

                        //console.log('findarray: ' + FindArray.length);
                        if (FindArray.length > 0) {
                            EZEID = FindArray[0];
                            //checking the fisrt condition
                            if (FindArray.length > 1) {
                                if (FindArray[1] != '') {
                                    if (FindArray[1].toUpperCase() == 'ID') {
                                        //console.log('ID');
                                        DocType = 'ID';
                                    }
                                    else if (FindArray[1].toUpperCase() == 'DL') {
                                        //console.log('DL');
                                        DocType = 'DL';
                                    }
                                    else if (FindArray[1].toUpperCase() == 'PP') {
                                        //console.log('PP');
                                        DocType = 'PP';
                                    }
                                    else if (FindArray[1].toUpperCase() == 'BR') {
                                        //console.log('BR');
                                        DocType = 'BR';
                                    }
                                    else if (FindArray[1].toUpperCase() == 'CV') {
                                        //console.log('CV');
                                        DocType = 'CV';
                                    }
                                    else if (FindArray[1].toUpperCase() == 'D1') {
                                        //console.log('D1');
                                        DocType = 'D1';
                                    }
                                    else if (FindArray[1].toUpperCase() == 'D2') {
                                        //console.log('D2');
                                        DocType = 'D2';
                                    }
                                    else {
                                        Pin = FindArray[1];
                                    }
                                    //checking the second condition
                                    if (typeof FindArray[2] != 'undefined') {
                                        Pin = FindArray[2];
                                    }
                                    //checking the final condition
                                }
                            }
                        }
                        var SearchQuery = db.escape(EZEID) + ',' + db.escape(Pin) + ',' + db.escape(DocType);
                        //console.log('SearchQuery: ' + SearchQuery);
                        db.query('CALL  PGetSearchDocuments(' + SearchQuery + ')', function (err, SearchResult) {
                            // db.query(searchQuery, function (err, SearchResult) {
                            if (!err) {
                                if (SearchResult[0] != null) {
                                    if (SearchResult[0].length > 0) {
                                        SearchResult = SearchResult[0];
                                        //console.log(DocumentResult)
                                        var docs = SearchResult[0];
                                        res.setHeader('Content-Type', docs.ContentType);
                                        res.setHeader('Content-Disposition', 'attachment; filename=' + docs.Filename);
                                        //res.setHeader('Cache-Control', 'public, max-age=86400000');
                                        res.setHeader('Cache-Control', 'public, max-age=0');
                                        res.writeHead('200', { 'Content-Type': docs.ContentType });
                                        res.end(docs.Docs, 'base64');
                                        console.log('FnGetSearchDocuments: tmaster: Search result sent successfully');
                                    }
                                    else {
                                        res.send('null');
                                        console.log('FnGetSearchDocuments: tmaster: no search found');
                                    }
                                }
                                else {
                                    res.send('null');
                                    console.log('FnGetSearchDocuments: tmaster: no search found');
                                }

                            }
                            else {
                                res.statusCode = 500;
                                res.send('null');
                                console.log('FnGetSearchDocuments: tmaster: ' + err);
                            }
                        });


                    }
                    else {
                        console.log('FnGetSearchDocuments: Invalid token');
                        res.statusCode = 401;
                        res.send('null');
                    }
                }
                else {
                    console.log('FnGetSearchDocuments: ' + err);
                    res.statusCode = 500;
                    res.send('null');
                }
            });
        }
        else {
            if (token == null) {
                console.log('FnGetSearchDocuments: token is empty');
            }
            else if (find == null) {
                console.log('FnGetSearchDocuments: find is empty');
            }
            res.statusCode = 400;
            res.send('null');

        }
    }
    catch (ex) {
        console.log('FnGetSearchDocuments error:' + ex.description);
        throw new Error(ex);
    }
};

//method for keyword and ezeid search
exports.FnSearchByKeywords = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var type = req.body.SearchType;
        var find = req.body.Keywords;
        var token = req.body.Token;
        var CategoryID = req.body.SCategory;
        var Proximity = parseInt(req.body.Proximity);
        var Latitude = parseFloat(req.body.Latitude);
        var Longitude = parseFloat(req.body.Longitude);
        var ParkingStatus = req.body.ParkingStatus;
        var OpenCloseStatus = req.body.OpenStatus;
        //console.log(token);
        if (token != null && token != '') {
            FnValidateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        if (type == "1") {
                            if (find != null && find != '' && CategoryID != null) {
                                var LocSeqNo = 0;
                                var EZEID, Pin = null;
                                var DocType = '';
                                var FindArray = find.split('.');
                                var SearchType = 0;
                                //console.log('findarray: ' + FindArray.length);
                                if (FindArray.length > 0) {
                                    EZEID = FindArray[0];
                                    //checking the fisrt condition
                                    if (FindArray.length > 1) {
                                        if (FindArray[1] != '') {
                                            if (FindArray[1].charAt(0).toUpperCase() == 'L') {
                                                LocSeqNo = FindArray[1].toString().substring(1, FindArray[1].length);
                                            }
                                            else if (FindArray[1].toUpperCase() == 'ID') {
                                                //console.log('ID');
                                                SearchType = 2;
                                                DocType = 'ID';
                                            }
                                            else if (FindArray[1].toUpperCase() == 'DL') {
                                                //console.log('DL');
                                                SearchType = 2;
                                                DocType = 'DL';
                                            }
                                            else if (FindArray[1].toUpperCase() == 'PP') {
                                                //console.log('PP');
                                                SearchType = 2;
                                                DocType = 'PP';
                                            }
                                            else if (FindArray[1].toUpperCase() == 'BR') {
                                                //console.log('BR');
                                                SearchType = 2;
                                                DocType = 'BR';
                                            }
                                            else if (FindArray[1].toUpperCase() == 'CV') {
                                                //console.log('CV');
                                                SearchType = 2;
                                                DocType = 'CV';
                                            }
                                            else if (FindArray[1].toUpperCase() == 'D1') {
                                                //console.log('D1');
                                                SearchType = 2;
                                                DocType = 'D1';
                                            }
                                            else if (FindArray[1].toUpperCase() == 'D2') {
                                                //console.log('D2');
                                                SearchType = 2;
                                                DocType = 'D2';
                                            }
                                            else {
                                                LocSeqNo = 0;
                                                Pin = FindArray[1];
                                            }
                                            //checking the second condition
                                            if (typeof FindArray[2] != 'undefined') {
                                                Pin = FindArray[2];
                                            }
                                            //checking the final condition
                                        }
                                    }
                                }
                                var SearchQuery = db.escape('') + ',' + db.escape(CategoryID) + ',' + db.escape(0) + ',' + db.escape(0.00) + ',' + db.escape(0.00) + ',' + db.escape(EZEID) + ',' + db.escape(LocSeqNo) + ',' + db.escape(Pin) + ',' + db.escape(SearchType) + ',' + db.escape(DocType) + ',' + db.escape("0") + ',' + db.escape("0");
                                //console.log('SearchQuery: ' + SearchQuery);
                                db.query('CALL pSearchResult(' + SearchQuery + ')', function (err, SearchResult) {
                                    // db.query(searchQuery, function (err, SearchResult) {
                                    if (!err) {
                                        if (SearchResult[0] != null) {
                                            if (SearchResult[0].length > 0) {
                                                res.send(SearchResult[0]);
                                                console.log('FnSearchByKeywords: tmaster: Search result sent successfully');
                                            }
                                            else {
                                                res.send('null');
                                                console.log('FnSearchByKeywords: tmaster: no search found');
                                            }
                                        }
                                        else {
                                            res.send('null');
                                            console.log('FnSearchByKeywords: tmaster: no search found');
                                        }

                                    }
                                    else {
                                        res.statusCode = 500;
                                        res.send('null');
                                        console.log('FnSearchByKeywords: tmaster: ' + err);
                                    }
                                });

                            }
                            else {
                                if (find == null || find == '') {
                                    console.log('FnSearchByKeywords: keyword is empty');
                                }
                                else if (CategoryID == null || CategoryID == '') {
                                    console.log('FnSearchByKeywords: CategoryID is empty');
                                }
                                res.statusCode = 400;
                                res.send('null');
                            }
                        }
                        else if (type == "2") {
                            if (ParkingStatus == 0) {
                                ParkingStatus = "1,2,3";
                            }
                            if (OpenCloseStatus == 0) {
                                OpenCloseStatus = "1,2";
                            }
                            if (find != null && find != '' && Proximity.toString() != 'NaN' && Latitude.toString() != 'NaN' && Longitude.toString() != 'NaN' && CategoryID != null) {

                                var InsertQuery = db.escape(find) + ',' + db.escape(CategoryID) + ',' + db.escape(Proximity) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' + db.escape('') + ',' + db.escape(0) + ',' + db.escape(0) + ',' + db.escape(1) + ',' + db.escape('') + ',' + db.escape(ParkingStatus) + ',' + db.escape(OpenCloseStatus);
                                //console.log('SearchQuery: ' + InsertQuery);
                                db.query('CALL pSearchResult(' + InsertQuery + ')', function (err, SearchResult) {
                                    if (!err) {
                                        //console.log(SearchResult);
                                        if (SearchResult[0] != null) {
                                            if (SearchResult[0].length > 0) {
                                                res.send(SearchResult[0]);
                                                console.log('FnSearchByKeywords:  tmaster:Search Found');
                                            }
                                            else {
                                                if (Proximity != 0) {
                                                    var InsertProximityQuery = db.escape(find) + ',' + db.escape(CategoryID) + ',' + db.escape(0) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' + db.escape('') + ',' + db.escape(0) + ',' + db.escape(0) + ',' + db.escape(1) + ',' + db.escape('') + ',' + db.escape(ParkingStatus) + ',' + db.escape(OpenCloseStatus);;
                                                    console.log('SearchQuery without Proximity: ' + InsertProximityQuery);
                                                    db.query('CALL pSearchResult(' + InsertProximityQuery + ')', function (err, SearchProximityResult) {
                                                        if (!err) {
                                                            //console.log(SearchProximityResult);
                                                            if (SearchProximityResult[0] != null) {
                                                                if (SearchProximityResult[0].length > 0) {
                                                                    res.send(SearchProximityResult[0]);
                                                                    console.log('FnSearchByKeywords:pSearchResult:With Proxmity:  tmaster:Search Found');
                                                                }
                                                                else {
                                                                    res.send('null');
                                                                    console.log('FnSearchByKeywords: pSearchResult: no search found without proximity');
                                                                }
                                                            }
                                                            else {
                                                                res.send('null');
                                                                console.log('FnSearchByKeywords: pSearchResult: no search found without proximity');
                                                            }
                                                        }
                                                        else {
                                                            res.statusCode = 500;
                                                            res.send('null');
                                                            console.log('FnSearchByKeywords: pSearchResult: no search found without proximity');
                                                        }
                                                    });
                                                }
                                                else {
                                                    res.send('null');
                                                    console.log('FnSearchByKeywords: tmaster: no search found');
                                                }
                                            }
                                        }
                                        else {
                                            res.send('null');
                                            console.log('FnSearchByKeywords:  tmaster: no search found');
                                        }

                                    }
                                    else {
                                        res.statusCode = 500;
                                        res.send('null');
                                        console.log('FnSearchByKeywords:  tmaster: ' + err);
                                    }
                                });
                            }
                            else {
                                if (find == null || find == '') {
                                    console.log('FnSearchByKeywords: keyword is empty');
                                }
                                else if (CategoryID == null || CategoryID == '') {
                                    console.log('FnSearchByKeywords: CategoryID is empty');
                                }
                                else if (Proximity == 'NaN') {
                                    console.log('FnSearchByKeywords: Proximity is empty');
                                }
                                else if (Latitude == 'NaN') {
                                    console.log('FnSearchByKeywords: Proximity is empty');
                                }
                                else if (Longitude == 'NaN') {
                                    console.log('FnSearchByKeywords: Proximity is empty');
                                }
                                res.statusCode = 400;
                                res.send('null');
                            }
                        }
                        else {
                            console.log('FnSearchByKeywords: Invalid Search type');
                            res.statusCode = 400;
                            res.send('null');
                        }
                    }
                    else {
                        res.statusCode = 401;
                        console.log('FnSearchByKeywords: Invalid token');
                        res.send('null');
                    }
                }
                else {
                    console.log('FnSearchByKeywords: ' + err);
                    res.statusCode = 500;
                    res.send('null');
                }
            });
        }
        else {
            res.statusCode = 400;
            res.send('null');
            console.log('FnSearchByKeywords: token is empty');
        }
    }
    catch (ex) {
        console.log('FnSearchByKeywords error:' + ex.description);
        throw new Error(ex);
    }
};

//method to get search result users details
exports.FnGetSearchInformation = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var TID = parseInt(req.query.TID);

        if (Token != null && Token != '' && TID.toString() != 'NaN') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var SearchParameter = db.escape(TID) + ',' + db.escape(Token);
                        // console.log('Search Information: ' +SearchParameter);
                        db.query('CALL pSearchInformation(' + SearchParameter + ')', function (err, UserInfoResult) {
                            // db.query(searchQuery, function (err, SearchResult) {
                            if (!err) {
                                // console.log(UserInfoResult);
                                if (UserInfoResult[0].length > 0) {
                                    res.send(UserInfoResult[0]);
                                    console.log('FnSearchEzeid: tmaster: Search result sent successfully');
                                }
                                else {
                                    res.send('null');
                                    console.log('FnSearchEzeid: tmaster: no search found');
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.send('null');
                                console.log('FnSearchEzeid: tmaster: ' + err);
                            }
                        });

                    }
                    else {
                        console.log('FnGetSearchInformation: Invalid token');
                        res.statusCode = 401;
                        res.send('null');
                    }
                }
                else {
                    console.log('FnGetSearchInformation: Token error: ' + err);
                    res.statusCode = 500;
                    res.send('null');

                }
            });

        }
        else {
            res.statusCode = 400;
            res.send('null');
            console.log('FnGetUserDetails :  token is empty');
        }
    }
    catch (ex) {
        console.log('FnGetUserDetails error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnUpdatePwdEncryption = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        db.query('select TID,Firstname,Password from tmaster where password is not null ', function (err, UserResult) {
            if (!err) {
                //  console.log(InsertResult);
                if (UserResult.length > 0) {
                    //var EncryptPWD;
                    for (var i = 0; i < UserResult.length; i++) {
                        var RegData = UserResult[i];
                        //console.log('user details');
                        //console.log(RegData);
                        //console.log(RegData.Password);
                        var EncryptPWD = null;
                        if (typeof RegData.Password != 'undefined' && RegData.Password != '' && RegData.Password != null) {
                            EncryptPWD = FnEncryptPassword(RegData.Password);
                           // console.log(EncryptPWD);
                            var query = 'update tmaster set password= ' + db.escape(EncryptPWD) + ' where TID =' + db.escape(RegData.TID);
                            //console.log(query);
                            db.query(query, function (err, UpdateResult) {
                                if (!err) {
                                    console.log('update happened');
                                }
                                else {
                                    console.log('Update not happened');
                                }
                            });
                        }



                        //db.query(query, function (err, UpdateResult) {
                        //    if (!err) {
                        //        console.log('update happened');
                        //    }
                        //    else {
                        //        console.log('Update not happened');
                        //    }
                        //});

                        //  res.send(RegData);
                    }
                    res.send(UserResult);
                }
                else {
                    //console.log(RtnMessage);
                    res.send(RtnMessage);
                    console.log('FnUpdateUserProfileAP:tmaster: User Profile update Failed');
                }
            }
            else {
                res.statusCode = 500;
                res.send(RtnMessage);
                console.log('FnUpdateUserProfileAP:tmaster:' + err);
            }
        });
    }
    catch (ex) {
        console.log('FnUpdateUserProfileAP error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetLoginCheck = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        RtnMessage = {
            IsAvailable: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null && Token != '') {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        RtnMessage.IsAvailable = true;
                        res.send(RtnMessage);
                        console.log('FnGetLoginCheck: Valid Login');
                    }
                    else {
                        console.log('FnGetLoginCheck: Invalid token');
                        // res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnGetLoginCheck: Token error: ' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }
        else {
            res.statusCode = 400;
            res.send(RtnMessage);
            console.log('FnGetLoginCheck :  token is empty');
        }
    }
    catch (ex) {
        console.log('FnGetUserDetails error:' + ex.description);
        throw new Error(ex);
    }
};
//EZEIDAP Parts

//app part

function FnValidateTokenAP(Token, CallBack) {
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
        throw new Error(ex);
        return 'error'
    }
};

exports.FnLoginAP = function (req, res) {
    try {
        //res.setHeader("Access-Control-Allow-Origin", "*");
        //res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        //res.setHeader('content-type', 'application/json');
        var UserName = req.body.UserName;
        var Password = req.body.Password;
        var RtnMessage = {
            Token: '',
            IsAuthenticate: false,
            FullName: '',
            APID: 0
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (UserName != null && UserName != '' && Password != null && Password != '') {
            var EncryptPassword= FnEncryptPassword(Password);
            console.log(EncryptPassword);
            var Query = 'select TID, FullName,APMasterID from tapuser where APLoginID=' + db.escape(UserName) + ' and APPassword=' + db.escape(EncryptPassword);
            db.query(Query, function (err, loginResult) {
                if (!err) {
                    if (loginResult.length > 0) {
                        var Encrypt = FnGenerateToken();
                        var Query = 'update tapuser set Token=' + db.escape(Encrypt) + ' where TID=' + db.escape(loginResult[0].TID);
                        db.query(Query, function (err, TokenResult) {
                            if (!err) {
                                if (TokenResult.affectedRows > 0) {
                                    RtnMessage.Token = Encrypt;
                                    RtnMessage.IsAuthenticate = true;
                                    RtnMessage.FullName = loginResult[0].FullName;
                                    RtnMessage.TID = loginResult[0].TID;
                                    RtnMessage.APID = loginResult[0].APMasterID;
                                    res.send(RtnMessage);
                                    console.log('FnLoginAP:tmaster: Login success');
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('FnLoginAP:tmaster:Fail to generate Token');
                                }
                            }
                            else {

                                res.send(RtnMessage);
                                console.log('FnLoginAP:tmaster:' + err);
                            }
                        });
                    }
                    else {

                        res.send(RtnMessage);
                        console.log('FnLoginAP:tmaster: Invalid login credentials');
                    }
                }
                else {

                    res.send(RtnMessage);
                    console.log('FnLoginAP:tmaster:' + err);
                }
            });
        }
        else {
            if (UserName == null || UserName == '') {
                console.log('FnLoginAP: UserName is empty');
            }
            else if (Password == null || Password == '') {
                console.log('FnLoginAP: password is empty');
            }
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnLogin error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnLogoutAP = function (req, res) {
    try {
        //res.setHeader("Access-Control-Allow-Origin", "*");
        //res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        //res.setHeader('content-type', 'application/json');
        var Token = req.query.Token;

        var RtnMessage = {
            Token: '',
            IsAuthenticate: true,
            FirstName: ''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && Token != '') {
            var Query = 'update tapuser set Token=' + db.escape('') + ' where Token=' + db.escape(Token);
            db.query(Query, function (err, TokenResult) {
                if (!err) {
                    RtnMessage.Token = '';
                    RtnMessage.IsAuthenticate = false;
                    res.send(RtnMessage);
                    console.log('FnLogoutAP: tmaster: Logout success');
                }
                else {
                    res.send(RtnMessage);
                    console.log('FnLogoutAP:tmaster:' + err);
                }
            });
        }
        else {
            if (Token == null || Token == '') {
                console.log('FnLogoutAP: Token is empty');
            }
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnLogoutAP error:' + ex.description);
        throw new Error(ex);
    }
};

//getting the details of user
exports.FnGetUserDetailsAP = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var EZEID = req.query.EZEID;
        if (EZEID != null && EZEID != '') {
            //  var Query = 'Select  b.TID as LocationID,IDTypeID,a.EZEID,EZEIDVerifiedID,EZEIDVerifiedByID,StatusID,FirstName,LastName,ifnull(CompanyName,"") as CompanyName,CategoryID,FunctionID,RoleID,ifnull(JobTitle,"") as JobTitle,NameTitleID,AboutCompany,LanguageID,Keywords,LocTitle,Latitude,Longitude,Altitude,AddressLine1,AddressLine2,CityID,StateID,CountryID,PostalCode,b.PIN,EMailID,EMailVerifiedID,PhoneNumber,MobileNumber,LaptopSLNO,VehicleNumber,Website,SeqNo,Picture,PictureFileName,ifnull((Select CityName from mcity where CityID=b.CityID and LangID=a.LanguageID),"") as CityTitle,ifnull((Select CountryName from mcountry where CountryID=b.CountryID and LangID=a.LanguageID),"") as CountryTitle,ifnull((Select StateName from mstate where StateID=b.StateID and LangID=a.LanguageID),"") as StateTitle,ifnull((Select CategoryTitle from mcategory where CategoryID=a.CategoryID and LangID=a.LanguageID),"") as CategoryTitle from tlocations b,tmaster a where b.EZEID=a.EZEID and b.SeqNo=0 and Token=' + db.escape(Token) + ';';
            var Query = 'Select a.TID as MasterID, b.TID as LocationID,IDTypeID,a.EZEID,ifnull(EZEIDVerifiedID,0) as EZEIDVerifiedID,ifnull(EZEIDVerifiedByID,0) EZEIDVerifiedByID,ifnull(StatusID,0) as StatusID,FirstName,ifnull(LastName,"") as LastName,ifnull(CompanyName,"") as CompanyName,ifnull(CategoryID,0) as CategoryID,ifnull(FunctionID,0) as FunctionID,ifnull(RoleID,0) as RoleID,ifnull(JobTitle,"") as JobTitle,ifnull(NameTitleID,0) as NameTitleID,ifnull(AboutCompany,"") as AboutCompany,ifnull(LanguageID,1) as LanguageID,ifnull(Keywords,"") as Keywords,ifnull(LocTitle,"") as LocTitle,Latitude,Longitude,Altitude,ifnull(AddressLine1,"") as AddressLine1,ifnull(AddressLine2,"") as AddressLine2,CityID,StateID,CountryID,ifnull(PostalCode,"") as PostalCode,b.PIN,ifnull(EMailID,"") as EMailID,ifnull(EMailVerifiedID,"") as EMailVerifiedID,ifnull(PhoneNumber,"") as PhoneNumber, ifnull(MobileNumber,"") as MobileNumber,ifnull(LaptopSLNO,"") as LaptopSLNO,ifnull(VehicleNumber,"") as VehicleNumber,ifnull(Website,"") as Website,ifnull(Picture,"") as Picture,ifnull(PictureFileName,"") as PictureFileName ,ifnull((Select CityName from mcity where CityID=b.CityID and LangID=a.LanguageID),"") as CityTitle,ifnull((Select CountryName from mcountry where CountryID=b.CountryID and LangID=a.LanguageID),"") as CountryTitle,ifnull((Select StateName from mstate where StateID=b.StateID and LangID=a.LanguageID),"") as StateTitle,ifnull(d.ParkingStatus,1) as ParkingStatus,ifnull(d.OpenStatus,1) as OpenStatus,ifnull(d.WorkingHours,"") as WorkingHours,ifnull(d.SalesEnquiryButton,1) as SalesEnquiryButton ,ifnull(d.SalesEnquiryMailID,"") as SalesEnquiryMailID,ifnull(d.HomeDeliveryButton,1) as HomeDeliveryButton,ifnull(d.HomeDeliveryMailID,"") as HomeDeliveryMailID,ifnull(d.ReservationButton,1) as ReservationButton,ifnull(d.ReservationMailID,"") as ReservationMailID,ifnull(d.SupportButton,1) as SupportButton,ifnull(d.SupportMailID,"") as SupportMailID,ifnull(d.CVButton,1) as CVButton,ifnull(d.CVMailID,"") as CVMailID,ifnull((Select CategoryTitle from mcategory where CategoryID=a.CategoryID and LangID=a.LanguageID),"") as CategoryTitle, ifnull(a.Icon,"") as Icon, ifnull(a.IconFileName,"") as IconFileName  from tlocations b left outer Join tlcoationsettings d On b.TID=d.LocID,tmaster a left outer Join tDocs c On a.TID=c.MasterID where b.EZEID=a.EZEID and b.SeqNo=0  and a.EZEID= ' + db.escape(EZEID);

            //below query commented for phase1
            //var Query0 = 'Select a.TID as MasterID, b.TID as LocationID,IDTypeID,a.EZEID,EZEIDVerifiedID,EZEIDVerifiedByID,StatusID,FirstName,LastName,ifnull(CompanyName,"") as CompanyName,CategoryID,FunctionID,RoleID,ifnull(JobTitle,"") as JobTitle,NameTitleID,AboutCompany,LanguageID,Keywords,LocTitle,Latitude,Longitude,Altitude,AddressLine1,AddressLine2,CityID,StateID,CountryID,PostalCode,b.PIN,EMailID,EMailVerifiedID,PhoneNumber,MobileNumber,LaptopSLNO,VehicleNumber,Website,SeqNo,Picture,PictureFileName ,ifnull((Select CityName from mcity where CityID=b.CityID and LangID=a.LanguageID),"") as CityTitle,c.IDNo,c.IDExpiryDate,c.PPNo,c.PPIssuedDate,c.PPExpiryDate,(CASE WHEN c.IDDoc IS NOT NULL THEN 1 ELSE 0 END) as IDDoc,ifnull(c.IDDocFile,"") as IDDocFile,(CASE WHEN c.PPDoc IS NOT NULL THEN 1 ELSE 0 END) as PPDoc,ifnull(c.PPDocFile,"") as PPDocFile,(CASE WHEN c.CVDoc IS NOT NULL THEN 1 ELSE 0 END) as CVDoc,ifnull(c.CVDocFile,"") as CVDocFile,(CASE WHEN c.BrochureDoc IS NOT NULL THEN 1 ELSE 0 END) as BrochureDoc,ifnull(c.BrochureDocFile,"") as BrochureDocFile,(CASE WHEN c.D1Doc IS NOT NULL THEN 1 ELSE 0 END) as D1Doc,ifnull(c.D1DocFile,"") as D1DocFile,(CASE WHEN c.D2Doc IS NOT NULL THEN 1 ELSE 0 END) as D2Doc,ifnull(c.D2DocFile,"") as D2DocFile,ifnull((Select CountryName from mcountry where CountryID=b.CountryID and LangID=a.LanguageID),"") as CountryTitle,ifnull((Select StateName from mstate where StateID=b.StateID and LangID=a.LanguageID),"") as StateTitle,ifnull(d.ParkingStatus,1) as ParkingStatus,ifnull(d.OpenStatus,1) as OpenStatus,d.WorkingHours,ifnull(d.SalesEnquiryButton,1) as SalesEnquiryButton ,d.SalesEnquiryMailID,ifnull(d.HomeDeliveryButton,1) as HomeDeliveryButton,HomeDeliveryMailID,ifnull(d.ReservationButton,1) as ReservationButton,d.ReservationMailID,ifnull(d.SupportButton,1) as SupportButton,d.SupportMailID,ifnull(d.CVButton,1) as CVButton,d.CVMailID,ifnull((Select CategoryTitle from mcategory where CategoryID=a.CategoryID and LangID=a.LanguageID),"") as CategoryTitle from tlocations b left outer Join tlcoationsettings d On b.TID=d.LocID,tmaster a left outer Join tDocs c On a.TID=c.MasterID where b.EZEID=a.EZEID and b.SeqNo=0 and Token=' + db.escape(Token) + ';';
            //var Query2 = 'Select a.TID as MasterID, b.TID as LocationID,IDTypeID,a.EZEID,EZEIDVerifiedID,EZEIDVerifiedByID,StatusID,FirstName,LastName,CompanyName,CategoryID,FunctionID,RoleID,JobTitle,NameTitleID,AboutCompany,LanguageID,Keywords,LocTitle,Latitude,Longitude,Altitude,AddressLine1,AddressLine2,CityID,StateID,CountryID,PostalCode,b.PIN,EMailID,EMailVerifiedID,PhoneNumber,MobileNumber,LaptopSLNO,VehicleNumber,Website,SeqNo,Picture,PictureFileName ,ifnull((Select CityName from mcity where CityID=b.CityID and LangID=a.LanguageID),"") as CityTitle,c.IDNo,c.IDExpiryDate,c.PPNo,c.PPIssuedDate,c.PPExpiryDate,(CASE WHEN c.IDDoc IS NOT NULL THEN 1 ELSE 0 END) as IDDoc,(CASE WHEN c.PPDoc IS NOT NULL THEN 1 ELSE 0 END) as PPDoc,(CASE WHEN c.CVDoc IS NOT NULL THEN 1 ELSE 0 END) as CVDoc,(CASE WHEN c.BrochureDoc IS NOT NULL THEN 1 ELSE 0 END) as BrochureDoc,(CASE WHEN c.D1Doc IS NOT NULL THEN 1 ELSE 0 END) as D1Doc,(CASE WHEN c.D2Doc IS NOT NULL THEN 1 ELSE 0 END) as D2Doc,ifnull((Select CountryName from mcountry where CountryID=b.CountryID and LangID=a.LanguageID),"") as CountryTitle,ifnull((Select StateName from mstate where StateID=b.StateID and LangID=a.LanguageID),"") as StateTitle,ifnull(d.ParkingStatus,1) as ParkingStatus,ifnull(d.OpenStatus,1) as OpenStatus,d.WorkingHours,ifnull(d.SalesEnquiryButton,1) as SalesEnquiryButton,d.SalesEnquiryMailID,ifnull(d.HomeDeliveryButton,1) as HomeDeliveryButton,HomeDeliveryMailID,ifnull(d.ReservationButton,1) as ReservationButton,d.ReservationMailID,ifnull(d.SupportButton,1) as SupportButton,d.SupportMailID,ifnull(d.CVButton,1) as CVButton,d.CVMailID from tlocations b left outer Join tlcoationsettings d On b.TID=d.LocID,tmaster a left outer Join tDocs c On a.TID=c.MasterID where b.EZEID=a.EZEID and b.SeqNo<>0 and Token=' + db.escape(Token);

            db.query(Query, function (err, UserDetailsResult) {
                if (!err) {
                    if (UserDetailsResult != null) {
                        if (UserDetailsResult.length > 0) {
                            //console.log('FnGetUserDetails: Token: ' + Token);
                            console.log('FnGetUserDetailsAP : tmaster: User details sent successfully');
                            res.send(UserDetailsResult);
                        }
                        else {
                            res.send('null');
                            console.log('FnGetUserDetailsAP : tmaster: No User details found');
                        }
                    }
                    else {
                        res.send('null');
                        console.log('FnGetUserDetailsAP : tmaster: No User details found');
                    }

                }
                else {
                    res.send('null');
                    console.log('FnGetUserDetailsAP : tmaster:' + err);
                }
            });
        }
        else {
            res.send('null');
            console.log('FnGetUserDetailsAP :  EZEID is empty');
        }
    }
    catch (ex) {
        console.log('FnGetUserDetails error:' + ex.description);
        throw new Error(ex);
    }
};

//method to udpate user profile based on ezeid
exports.FnUpdateUserProfileAP = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var EZEID = req.body.EZEID;
        var EZEIDVerifiedID = req.body.EZEIDVerifiedID;
        var TID = parseInt(req.body.TID);
        var CategoryID = req.body.CategoryID;
        if (CategoryID == null || CategoryID == '') {
            CategoryID = 0;
        }
        var Latitude = req.body.Latitude;
        if (Latitude == null || Latitude == '') {
            Latitude = 0.0;
        }
        var Longitude = req.body.Longitude;
        if (Longitude == null || Longitude == '') {
            Longitude = 0.0;
        }

        var Keywords = req.body.Keywords;
        var Picture = req.body.Picture;
        var PictureFileName = req.body.PictureFileName;
        var Icon = req.body.Icon;
        var IconFileName = req.body.IconFileName;
        var BrochureDoc = req.body.BrochureDoc;
        var BrochureDocFile = req.body.BrochureDocFile;

        var RtnMessage = {
            IsSuccessful: false,
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (EZEID != null && TID.toString() != 'NaN') {
            var InsertQuery = db.escape(CategoryID) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' +
                   db.escape(EZEIDVerifiedID) + ',' + db.escape(TID) + ',' + db.escape(Keywords) + ',' + db.escape(Picture) + ',' + db.escape(PictureFileName) + ',' +
                   db.escape(Icon) + ',' + db.escape(IconFileName) + ',' + db.escape(EZEID) + ',' +
                   db.escape(BrochureDoc) + ',' + db.escape(BrochureDocFile);
            console.log('InsertQuery: ' + InsertQuery);
            db.query('CALL pUpdateUserProfileAP(' + InsertQuery + ')', function (err, InsertResult) {
                if (!err) {
                    console.log(InsertResult);
                    if (InsertResult != null) {
                        if (InsertResult.affectedRows > 0) {
                            RtnMessage.IsSuccessful = true;
                            res.send(RtnMessage);
                            console.log('FnUpdateUserProfileAP: User Profile update successfully');
                        }
                        else {
                            res.send(RtnMessage);
                            console.log('FnUpdateUserProfileAP:tmaster: User Profile update Failed');
                        }
                    }
                    else {
                        //console.log(RtnMessage);
                        res.send(RtnMessage);
                        console.log('FnUpdateUserProfileAP:tmaster: User Profile update Failed');
                    }
                }
                else {

                    res.send(RtnMessage);
                    console.log('FnUpdateUserProfileAP:tmaster:' + err);
                }
            });
        }
        else {

            res.send(RtnMessage);
            console.log('FnUpdateUserProfileAP:tmaster: Manditatory field empty');
        }
    }
    catch (ex) {
        console.log('FnUpdateUserProfileAP error:' + ex.description);
        throw new Error(ex);
    }
};

//method to change password
exports.FnChangePasswordAP = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var TokenNo = req.body.Token;
        var OldPassword = req.body.OldPassword;
        var NewPassword = req.body.NewPassword;
        var RtnMessage = {
            IsChanged: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (OldPassword != null && OldPassword != '' && NewPassword != null && NewPassword != '' && TokenNo != null) {
            FnValidateTokenAP(TokenNo, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        //var EncryptOldPWD = FnEncryptPassword(OldPassword);
                        //var EncryptNewPWD = FnEncryptPassword(NewPassword);
                        var Query = db.escape(TokenNo) + ',' + db.escape(OldPassword) + ',' + db.escape(NewPassword);
                        db.query('CALL pChangePasswordAP(' + Query + ')', function (err, ChangePasswordResult) {
                            if (!err) {
                                //console.log(ChangePasswordResult);
                                if (ChangePasswordResult != null) {
                                    if (ChangePasswordResult.affectedRows > 0) {
                                        RtnMessage.IsChanged = true;
                                        res.send(RtnMessage);
                                        console.log('FnChangePassword:pChangePassword: PASSSWORD CHANGED SUCCESSFULLY');
                                    }
                                    else {
                                        res.send(RtnMessage);
                                        console.log('FnChangePassword:pChangePassword: Password changed failed');
                                    }
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('FnChangePassword:pChangePassword: Password changed failed ');
                                }
                            }
                            else {
                                res.send(RtnMessage);
                                console.log('FnChangePassword:pChangePassword:' + err);
                            }
                        });
                    } else {
                        res.send(RtnMessage);
                        console.log('FnChangePassword:pChangePassword: Invalid Token');
                    }
                } else {
                    res.send(RtnMessage);
                    console.log('FnChangePassword:pChangePassword: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (OldPassword == null) {
                console.log('FnChangePassword: OldPassword is empty');
            }
            else if (NewPassword == null) {
                console.log('FnChangePassword: NewPassword is empty');
            }
            else if (TokenNo == null) {
                console.log('FnChangePassword: TokenNo is empty');
            }
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnChangePassword error:' + ex.description);
        throw new Error(ex);
    }
};

//method for forget password. in this method we are resetting the password and sending to user via mail.
exports.FnForgetPasswordAP = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LoginID = req.body.LoginID;
        var RtnMessage = {
            IsChanged: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (LoginID != null) {
            var Password = FnRandomPassword();
            //  var EncryptPWD = FnEncryptPassword(Password);
            var Query = 'Update tapuser set APPassword= ' + db.escape(Password) + ' where APLoginID=' + db.escape(LoginID);
            // console.log('FnForgotPassword: ' + Query);
            db.query(Query, function (err, ForgetPasswordResult) {
                if (!err) {
                    //console.log(InsertResult);
                    if (ForgetPasswordResult != null) {
                        if (ForgetPasswordResult.affectedRows > 0) {
                            RtnMessage.IsChanged = true;
                            var UserQuery = 'Select ifnull(Fullname,"") as Fullname,APPassword,ifnull(EMailID,"") as EMailID from tapuser where APLoginID=' + db.escape(LoginID);
                            //  console.log(UserQuery);
                            db.query(UserQuery, function (err, UserResult) {
                                if (!err) {
                                    //  console.log(UserResult);

                                    var fs = require('fs');
                                    fs.readFile("ForgetPasswordTemplate.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[Firstname]", UserResult[0].Fullname);
                                        data = data.replace("[Lastname]", "");
                                        data = data.replace("[Password]", UserResult[0].APPassword);

                                        //console.log('Body:' + data);
                                        var mailOptions = {
                                            from: EZEIDEmail,
                                            to: UserResult[0].EMailID,
                                            subject: 'Password reset request',
                                            html: data // html body
                                        };
                                        console.log(mailOptions);
                                        // send mail with defined transport object
                                        FnSendMailEzeid(mailOptions, function (err, Result) {
                                            if (!err) {
                                                if (Result != null) {
                                                    console.log('FnForgetPassword: Mail Sent Successfully');
                                                    res.send(RtnMessage);
                                                }
                                                else {
                                                    console.log('FnForgetPassword: Mail not Sent Successfully');
                                                    res.send(RtnMessage);
                                                }
                                            }
                                            else {
                                                console.log('FnForgetPassword:Error in sending mails' + err);
                                                res.send(RtnMessage);
                                            }
                                        });
                                    });

                                    console.log('FnForgetPassword:tmaster: Password reset successfully');
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('FnForgetPassword: Email sending Fails: ' + err);
                                }
                            });

                        }
                        else {
                            res.send(RtnMessage);
                            console.log('FnForgetPassword:tmaster: Password reset  Failed');
                        }

                    }
                    else {
                        res.send(RtnMessage);
                        console.log('FnForgetPassword:tmaster: Password reset Failed');
                    }
                }
                else {

                    res.send(RtnMessage);
                    console.log('FnForgetPassword:tmaster:' + err);
                }
            });

        }
        else {
            console.log('FnForgetPasswordAP: EZEID is empty')
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        console.log('FnForgetPasswordAP error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetEZEIDDetailsAP = function (req, res) {
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;
        var EZEID = req.query.EZEID;
        if (Token != null && EZEID != null) {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        db.query('CALL pGetEZEIDDetailsForAP(' + db.escape(EZEID) + ')', function (err, UserDetailsResult) {
                            if (!err) {
                                if (UserDetailsResult != null) {
                                    if (UserDetailsResult[0].length > 0) {
                                        //console.log('FnGetUserDetails: Token: ' + Token);
                                        console.log('FnGetEZEIDDetailsAP : tmaster: User details sent successfully');
                                        res.send(UserDetailsResult[0]);
                                    }
                                    else {
                                        res.send('null');
                                        console.log('FnGetEZEIDDetailsAP : tmaster: No User details found');
                                    }
                                }
                                else {
                                    res.send('null');
                                    console.log('FnGetEZEIDDetailsAP : tmaster: No User details found');
                                }

                            }
                            else {
                                res.send('null');
                                console.log('FnGetEZEIDDetailsAP : tmaster:' + err);
                            }
                        });
                    } else {
                        res.send(RtnMessage);
                        console.log('FnGetEZEIDDetailsAP: Invalid Token');
                    }
                } else {
                    res.send(RtnMessage);
                    console.log('FnGetEZEIDDetailsAP: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetEZEIDDetailsAP: Token is empty');
            }
            else if (EZEID == null) {
                console.log('FnGetEZEIDDetailsAP: EZEID is empty');
            }
            res.send('null');

        }



    }
    catch (ex) {
        console.log('FnGetEZEIDDetailsAP error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnSaveAPEZEID = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Purpose = parseInt(req.body.Purpose);
        var Type = parseInt(req.body.Type);
        var Preffereduser = req.body.Preffereduser;
        var AreaSize = req.body.AreaSize;
        var AreaUOM = req.body.AreaUOM;
        var Rate = req.body.Rate;
        var Amount = req.body.Amount;
        var SpaceQty = req.body.SpaceQty;
        var SpaceType = req.body.SpaceType;
        var FunishedType = req.body.FunishedType;
        var Description = req.body.Description;
        var Preferences = req.body.Preferences;
        var Rating = req.body.Rating;
        var EZEID = req.body.EZEID;
        var Latitude = req.body.Latitude;
        if (Latitude == null || Latitude == '') {
            Latitude = 0.0;
        }
        var Longitude = req.body.Longitude;
        if (Longitude == null || Longitude == '') {
            Longitude = 0.0;
        }
        var Status = req.body.Status;
        var Reason = req.body.Reason;
        var AvailableDate = req.body.AvailableDate;
        var Token = req.body.Token;
        var APID = req.body.APID;
        var TID = req.body.TID;
        var RtnMessage = {
            TID: 0
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        var tAvailableDate = null;
        if (AvailableDate != null) {
            // datechange = new Date(new Date(TaskDateTime).toUTCString());
            tAvailableDate = new Date(AvailableDate);
            // console.log(TaskDate);
        }
        FnValidateTokenAP(Token, function (err, Result) {
            if (!err) {
                if (Result != null) {
                    //console.log('FnRegistration: Token: ' + TokenNo);
                    var InsertQuery = db.escape(Type) + ',' + db.escape(Preffereduser) + ',' + db.escape(AreaSize) + ',' + db.escape(AreaUOM) + ',' +
                          db.escape(Rate) + ',' + db.escape(Amount) + ',' + db.escape(SpaceQty) + ',' + db.escape(SpaceType) + ',' + db.escape(FunishedType) + ',' +
                          db.escape(Description) + ',' + db.escape(Preferences) + ',' + db.escape(Rating) + ',' +
                          db.escape(EZEID) + ',' + db.escape(Status) + ',' +
                          db.escape(Reason) + ',' + db.escape(tAvailableDate) + ',' + db.escape(Token) + ',' + db.escape(APID) + ',' + db.escape(Latitude) + ',' + db.escape(Longitude) + ',' + db.escape(TID) + ',' + db.escape(Purpose);
                    console.log(InsertQuery);
                    db.query('CALL psaveRealEstateData(' + InsertQuery + ')', function (err, InsertResult) {
                        if (!err) {
                            console.log(InsertResult);
                            if (InsertResult != null) {
                                if (InsertResult[0].length > 0) {
                                    var insert = InsertResult[0];
                                    RtnMessage.TID = insert[0].TID;
                                    res.send(RtnMessage);
                                    console.log('psaveRealEstateData: psaveRealEstateData: Data saved successfully');
                                }
                                else {
                                    res.send(RtnMessage);
                                    console.log('psaveRealEstateData:psaveRealEstateData: Data Saving Failed');
                                }
                            }
                            else {
                                console.log(RtnMessage);
                                res.send(RtnMessage);
                                console.log('psaveRealEstateData:psaveRealEstateData: Data Saving Failed');
                            }
                        }
                        else {
                            res.send(RtnMessage);
                            console.log('psaveRealEstateData:psaveRealEstateData:' + err);
                        }
                    });
                }
                else {
                    console.log('psaveRealEstateData: Invalid Token')
                    res.send(RtnMessage);
                }
            }
            else {
                console.log('psaveRealEstateData: Error in processing Token' + err);
                res.send(RtnMessage);
            }
        });

        //res.send(RtnMessage);
        //console.log('FnRegistration:tmaster: Manditatory field empty');

    }
    catch (ex) {
        console.log('psaveRealEstateData error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnSaveAPEZEIDPicture = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var PicNo = parseInt(req.body.PicNo);
        var Picture = req.body.Picture;
        var TID = parseInt(req.body.TID);
        var Token = req.body.Token;

        var RtnMessage = {
            TID: 0
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Picture != null && Picture != '' && PicNo.toString() != 'NaN' && TID.toString() != 'NaN') {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var InsertQuery = db.escape(TID) + ',' + db.escape(Picture) + ',' + db.escape(PicNo);
                        console.log(InsertQuery);
                        db.query('CALL psaveRealEstatePicture(' + InsertQuery + ')', function (err, InsertResult) {
                            if (!err) {
                                console.log(InsertResult);
                                if (InsertResult != null) {
                                    var insert = InsertResult[0];
                                    RtnMessage.TID = insert[0].TID;
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                }
                                else {
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnSaveAPEZEIDPicture:tmaster: Registration Failed');
                                }
                            }
                            else {

                                res.send(RtnMessage);
                                console.log('FnSaveAPEZEIDPicture:tmaster:' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveAPEZEIDPicture: Invalid Token')
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveAPEZEIDPicture: Error in processing Token' + err);
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Picture != null || Picture != '') {
                console.log('FnSaveAPEZEIDPicture: Picture is empty');
            }
            else if (PicNo.toString() == 'NaN') {
                console.log('FnSaveAPEZEIDPicture: PicNo is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnSaveAPEZEIDPicture: TID is empty');
            }
            res.send(RtnMessage);
        }


        //res.send(RtnMessage);
        //console.log('FnRegistration:tmaster: Manditatory field empty');

    }
    catch (ex) {
        console.log('FnSaveAPEZEIDPicture error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetAPEZEID = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = parseInt(res.query.TID);
        var Token = res.query.Token;

        if (Token != null && TID.toString() != 'NaN') {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetRealEstateData(' + db.escape(TID) + ')', function (err, RealStateResult) {
                            if (!err) {
                                console.log(RealStateResult);
                                if (RealStateResult != null) {
                                    if (RealStateResult[0].length > 0) {
                                        res.send(RealStateResult[0]);
                                        console.log('FnGetAPEZEID: Realstate Data sent successfully');
                                    }
                                    else {
                                        res.send('null');
                                        console.log('FnGetAPEZEID:pGetRealEstateData: No real state data found');
                                    }

                                }
                                else {
                                    res.send('null');
                                    console.log('FnGetAPEZEID:pGetRealEstateData: No real state data found');
                                }
                            }
                            else {

                                res.send('null');
                                console.log('FnGetAPEZEID:pGetRealEstateData:' + err);
                            }
                        });

                    } else {
                        res.send('null');
                        console.log('FnGetAPEZEID: Invalid Token');
                    }
                } else {
                    res.send('null');
                    console.log('FnGetAPEZEID: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetAPEZEID: Token is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnGetAPEZEID: TID is empty');
            }
            res.send('null');

        }

    }
    catch (ex) {
        console.log('FnRegistration error:' + ex.description);
        throw new Error(ex);
    }
};

exports.FnGetAPEZEIDPicture = function (req, res) {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var TID = parseInt(res.query.TID);
        var PicNo = parseInt(res.query.PicNo);
        var Token = res.query.Token;
        if (Token != null && TID.toString() != 'NaN' && PicNo.toString() != 'NaN') {
            FnValidateTokenAP(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        db.query('CALL pGetRealEstatePicture(' + db.escape(TID) + ',' + db.escape(PicNo) + ')', function (err, PictuerResult) {
                            if (!err) {
                                console.log(PictuerResult);
                                if (PictuerResult != null) {
                                    if (PictuerResult[0].length > 0) {
                                        res.send(PictuerResult[0]);
                                        console.log('FnGetAPEZEIDPicture: Realstate Data sent successfully');
                                    }
                                    else {
                                        res.send('null');
                                        console.log('FnGetAPEZEIDPicture:pGetRealEstateData: No real state data found');
                                    }
                                }
                                else {
                                    res.send('null');
                                    console.log('FnGetAPEZEIDPicture:pGetRealEstateData: No real state data found');
                                }
                            }
                            else {

                                res.send('null');
                                console.log('FnGetAPEZEIDPicture:pGetRealEstateData:' + err);
                            }
                        });

                    } else {
                        res.send('null');
                        console.log('FnGetAPEZEIDPicture: Invalid Token');
                    }
                } else {
                    res.send('null');
                    console.log('FnGetAPEZEIDPicture: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnGetAPEZEIDPicture: Token is empty');
            }
            else if (TID.toString() == 'NaN') {
                console.log('FnGetAPEZEIDPicture: TID is empty');
            }
            res.send('null');
        }
    }
    catch (ex) {
        console.log('FnGetAPEZEIDPicture error:' + ex.description);
        throw new Error(ex);
    }
};