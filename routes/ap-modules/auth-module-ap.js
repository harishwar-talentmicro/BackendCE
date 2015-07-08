/**
 *  @author Gowri Shankar
 *  @since July o6,2015 12:24 AM IST
 *  @title Auth module
 *  @description Handles functions related to authentication module
 *
 */
"use strict";

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

function Auth_AP(db,stdLib){
    this.db = db;
    if(stdLib){
        this.stdLib = stdLib;
    }
};

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
        //throw new Error(ex);
        return 'error'
    }
}


/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Auth_AP.prototype.loginAP = function(req,res,next){
    /**
     * @todo FnLoginAP
     */
    var _this = this;
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
            var encryptPassword= FnEncryptPassword(Password);
            var Query = 'select TID, FullName,APMasterID from tapuser where APLoginID=' + _this.db.escape(UserName) + ' and APPassword=' + _this.db.escape(encryptPassword);
            _this.db.query(Query, function (err, loginResult) {
                if (!err) {
                    if (loginResult.length > 0) {
                        var Encrypt = _this.stdLib.generateToken();
                        var Query = 'update tapuser set Token=' + _this.db.escape(Encrypt) + ' where TID=' + _this.db.escape(loginResult[0].TID);
                        _this.db.query(Query, function (err, TokenResult) {
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

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Auth_AP.prototype.logoutAP = function(req,res,next){
    /**
     * @todo FnLogoutAP
     */
    var _this = this;
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
        var Query = 'update tapuser set Token=' + _this.db.escape('') + ' where Token=' + _this.db.escape(Token);
        _this.db.query(Query, function (err, TokenResult) {
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

}
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Auth_AP.prototype.forgetPasswordAP = function(req,res,next){
    /**
     * @todo FnForgetPasswordAP
     */
    var _this = this;
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
        var EncryptPWD = FnEncryptPassword(Password);
        var Query = 'Update tapuser set APPassword= ' + _this.db.escape(EncryptPWD) + ' where APLoginID=' + _this.db.escape(LoginID);
        // console.log('FnForgotPassword: ' + Query);
        _this.db.query(Query, function (err, ForgetPasswordResult) {
            if (!err) {
                //console.log(InsertResult);
                if (ForgetPasswordResult) {
                    if (ForgetPasswordResult.affectedRows > 0) {
                        RtnMessage.IsChanged = true;
                        var UserQuery = 'Select ifnull(Fullname,"") as Fullname,APPassword,ifnull(EMailID,"") as EMailID from tapuser where APLoginID=' + _this.db.escape(LoginID);
                        //  console.log(UserQuery);
                        _this.db.query(UserQuery, function (err, UserResult) {
                            if (!err) {
                                //  console.log(UserResult);

                                var fs = require('fs');
                                fs.readFile("ForgetPasswordTemplate.txt", "utf8", function (err, data) {
                                    if (err) throw err;
                                    data = data.replace("[Firstname]", UserResult[0].Fullname);
                                    data = data.replace("[Lastname]", "");
                                    data = data.replace("[Password]", Password);

                                    var mailOptions = {
                                        from: 'noreply@ezeid.com',
                                        to: UserResult[0].EMailID,
                                        subject: 'Password reset request',
                                        html: data // html body
                                    };

                                    // send mail with defined transport object
                                    //message Type 7 - Forgot password mails service
                                    var post = { MessageType: 7, ToMailID: mailOptions.to, Subject: mailOptions.subject, Body: mailOptions.html };
                                    // console.log(post);
                                    var query = _this.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
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

}
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Auth_AP.prototype.changePasswordAP = function(req,res,next){
    /**
     * @todo FnChangePasswordAP
     */
    var _this = this;
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
            _this.stdLib.validateTokenAp(TokenNo, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var EncryptOldPWD = FnEncryptPassword(OldPassword);
                        var EncryptNewPWD = FnEncryptPassword(NewPassword);
                        var Query = _this.db.escape(TokenNo) + ',' + _this.db.escape(EncryptOldPWD) + ',' + _this.db.escape(EncryptNewPWD);
                        _this.db.query('CALL pChangePasswordAP(' + Query + ')', function (err, ChangePasswordResult) {
                            if (!err) {
                                //console.log(ChangePasswordResult);
                                if (ChangePasswordResult) {
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
                        res.statusCode=401;
                    }
                } else {
                    res.send(RtnMessage);
                    console.log('FnChangePassword:pChangePassword: Error in validating token:  ' + err);
                    res.statusCode=500;
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

    }
};

module.exports = Auth_AP;