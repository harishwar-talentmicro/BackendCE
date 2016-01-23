/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title User module
 *  @description Handles master user level functions as follows
 *  1. Registration (Updating user and primary location also done with this call only)
 *  2. Login
 *  3. Logout
 *  4. Company Profile fetching and saving
 *  5. Weblinks fetching, saving and deleting
 *  6. Password change
 *  7. Country, State and City List Fetching
 *
 */

var fs = require('fs');
var path = require('path');

var EZEIDEmail = 'noreply@ezeone.com';
var moment = require('moment');

var appConfig = require('../../ezeone-config.json');



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
function FnEncryptPassword(Password) {
    try {
        console.log('encrypt...........');
        //var text = "";
        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            key = 'ezeid@123';

        var cipher = crypto.createCipher(algorithm, key);
        var crypted = cipher.update(Password, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('OTP generate error:' + ex.description);

        return 'error'
    }
}
var bcrypt = null;

try{
    bcrypt = require('bcrypt');
}
catch(ex){
    console.log('Bcrypt not found, falling back to bcrypt-nodejs');
    bcrypt = require('bcrypt-nodejs');
}

/**
 * Hashes the password for saving into database
 * @param password
 * @returns {*}
 */
function hashPassword(password){
    if(!password){
        return null;
    }
    try{
        var hash = bcrypt.hashSync(password, 12);
        return hash;
    }
    catch(ex){
        console.log(ex);
    }
}

/**
 * Compare the password and the hash for authenticating purposes
 * @param password
 * @param hash
 * @returns {*}
 */
function comparePassword(password,hash){
    if(!password){
        return false;
    }
    if(!hash){
        return false;
    }
    return bcrypt.compareSync(password,hash);
}


/** Now password cannot be decrypted, So this function is useless******/
function FnDecrypt(EncryptPassword){
    try {
        var crypto = require('crypto'),
            algorithm = 'aes-256-ctr',
            password = 'ezeid@123';
        var decipher = crypto.createDecipher(algorithm,password);
        var dec = decipher.update(EncryptPassword,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }
    catch(ex){
        console.log('FnDecrypterror:' + ex.description);

        return 'error'
    }
}

var st = null;

function User(db,stdLib){

    if(stdLib){
        st = stdLib;
    }
};


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getLoginDetails = function(req,res,next){
    /**
     * @todo FnGetLoginDetails
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        st.db.query('CALL pLoginDetails(' + st.db.escape(Token) + ')', function (err, loginDetails) {
                            if (!err) {
                                if (loginDetails) {
                                    if (loginDetails[0]) {
                                        if (loginDetails[0].length > 0) {
                                            console.log('FnGetLoginDetails: Login details loaded successfully');
                                            res.send(loginDetails[0]);
                                        }
                                        else {
                                            console.log('FnGetLoginDetails:Login details not found');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetLoginDetails:Login details not found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetLoginDetails:Login details not found');
                                    res.json(null);
                                }

                            }
                            else {
                                console.log('FnGetLoginDetails: error in getting Login details' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetLoginDetails: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetLoginDetails: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!Token) {
                console.log('FnGetLoginDetails: Token is empty');
            }
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetLoginDetails error:' + ex.description);
        console.log(ex);
        //throw new Error(ex);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getCountry = function(req,res,next){

    /**
     * @todo FnGetCountry
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var langId = (!isNaN(parseInt(req.query.LangID))) ? (parseInt(req.query.LangID)) : 0;
        if (langId) {
            var query = 'Select CountryID, CountryName, ISDCode from  mcountry where LangID=' + st.db.escape(langId);
            st.db.query(query, function (err, countryResult) {
                if (!err) {
                    if (countryResult) {
                        if (countryResult.length > 0) {
                            res.send(countryResult);
                            console.log('FnGetCountry: Country sent successfully');
                        }
                        else {
                            res.json(null);
                            console.log('FnGetCountry: Country not found');
                        }
                    }
                    else {
                        res.json(null);
                        console.log('FnGetCountry: Country not found');
                    }
                }
                else {
                    res.json(null);
                    res.statusCode = 500;
                    console.log('FnGetCountry:' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetCountry: LangId is empty');
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetCountry error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getState = function(req,res,next){
    /**
     * @todo FnGetState
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        var CountryID = parseInt(req.query.CountryID);

        if (CountryID.toString() != 'NaN' && LangID.toString() != 'NaN') {
            var Query = 'Select StateID, StateName  from mstate where LangID=' + st.db.escape(LangID) + ' and CountryID=' + st.db.escape(CountryID);
            // console.log(Query);
            st.db.query(Query, function (err, StateResult) {
                if (!err) {
                    if(StateResult) {
                        if (StateResult.length > 0) {
                            var Query = 'Select ifnull(ISDCode,"") as ISDCode from  mcountry where CountryID=' + st.db.escape(CountryID);
                            st.db.query(Query, function (err, CountryResult) {
                                if (!err) {
                                    if(CountryResult) {
                                        if (CountryResult.length  > 0) {
                                            res.setHeader('ISDCode', CountryResult[0].ISDCode);
                                            res.send(StateResult);
                                            console.log('FnGetState: mcountry: State sent successfully');
                                        }
                                        else {
                                            res.json(null);
                                            console.log('FnGetState: mcountry: No Country ISDCode found');
                                        }
                                    }
                                    else {
                                        res.json(null);
                                        console.log('FnGetState: mcountry: No Country ISDCode found');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetState: mcountry:  No Country ISDCode found: ' + err);
                                }
                            });

                        }
                        else {
                            res.json(null);
                            console.log('FnGetState: mstate: No state found');
                        }
                    }
                    else {
                        res.json(null);
                        console.log('FnGetState: mstate: No state found');
                    }
                }
                else {
                    res.json(null);
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
            res.json(null);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetState error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getCity = function(req,res,next){
    /**
     * @todo FnGetCity
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var LangID = parseInt(req.query.LangID);
        var StateID = parseInt(req.query.StateID);
        if (LangID.toString() != 'NaN' && StateID.toString() != 'NaN') {
            var Query = 'Select  CityID, CityName from mcity where LangID=' + st.db.escape(LangID) + ' and StateID= ' + st.db.escape(StateID);
            st.db.query(Query, function (err, CityResult) {
                if (!err) {
                    if(CityResult) {
                        if (CityResult.length > 0) {
                            res.send(CityResult);
                            console.log('FnGetCity: mcity: City sent successfully');
                        }
                        else {
                            res.json(null);
                            console.log('FnGetCity: mcity: No category found');
                        }
                    }
                    else {
                        res.json(null);
                        console.log('FnGetCity: mcity: No category found');
                    }
                }
                else {
                    res.json(null);
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
            res.json(null);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetCity error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getUserDetails = function(req,res,next){
    /**
     * @todo FnGetUserDetails
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                console.log(err);
                //console.log(Result);
                if (!err) {
                    if (tokenResult) {
                        st.db.query('CALL pGetEZEIDDetails(' + st.db.escape(Token) + ')', function (err, UserDetailsResult) {
                            if (!err) {
                                console.log('UserDetailsResult',UserDetailsResult);
                                if (UserDetailsResult[0]) {
                                    if (UserDetailsResult[0].length > 0) {
                                        UserDetailsResult[0][0].Picture = (UserDetailsResult[0][0].Picture) ?
                                            (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + UserDetailsResult[0][0].Picture) : '';
                                        console.log('FnGetUserDetails : tmaster: User details sent successfully');
                                        res.send(UserDetailsResult[0]);
                                    }
                                    else {
                                        res.json(null);
                                        console.log('FnGetUserDetails : tmaster: No User details found');
                                    }
                                }
                                else {
                                    res.json(null);
                                    console.log('FnGetUserDetails : tmaster: No User details found');
                                }

                            }
                            else {
                                res.json(null);
                                res.statusCode = 500;
                                console.log('FnGetUserDetails : tmaster:' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnGetUserDetails: Invalid token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetUserDetails: ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetUserDetails :  token is empty');
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetUserDetails error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.checkEzeid = function(req,res,next){
    /**
     * @todo FnCheckEzeid
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var EZEID = alterEzeoneId(req.query.EZEID);
        var RtnMessage = {
            IsIdAvailable: false
        };
        RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (EZEID) {
            var Query = 'Select EZEID from tmaster where EZEID=' + st.db.escape(EZEID);
            //var Query = 'CALL pcheckEzeid(' + st.db.escape(EZEID) + ')';
            st.db.query(Query, function (err, EzeidExitsResult) {
                console.log(EzeidExitsResult);
                if (!err) {
                    if(EzeidExitsResult) {
                        if (EzeidExitsResult.length > 0) {
                            RtnMessage.IsIdAvailable = false;
                            res.send(RtnMessage);
                            console.log('FnCheckEzeid: tmaster: EzeId exists');
                        }
                        else {
                            RtnMessage.IsIdAvailable = true;
                            res.send(RtnMessage);
                            console.log('FnCheckEzeid: tmaster:  EzeId available');
                        }
                    }
                    else {
                        RtnMessage.IsIdAvailable = true;
                        res.send(RtnMessage);
                        console.log('FnCheckEzeid: tmaster:  EzeId available');
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
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnCheckEzeid error:' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.changePassword = function(req,res,next){
    /**
     * @todo FnChangePassword
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
        if (OldPassword && NewPassword && TokenNo ) {
            st.validateToken(TokenNo, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var oldPassQueryParams = st.db.escape(TokenNo);
                        var oldPassQuery = 'CALL pgetoldpassword('+oldPassQueryParams+')';
                        console.log(oldPassQuery);
                        st.db.query(oldPassQuery,function(err,oldPassResult){
                            if(err){
                                console.log('Error : FnChangePassword - During old password retrieval; Procedure: pgetoldpassword');
                                console.log(err);
                                res.status(400).json(RtnMessage);
                            }
                            else{

                                if(oldPassResult){
                                    if(oldPassResult[0]){
                                        if(oldPassResult[0][0]){
                                            if(oldPassResult[0][0].Password){
                                                if(comparePassword(OldPassword,oldPassResult[0][0].Password)){
                                                    var ip = req.headers['x-forwarded-for'] ||
                                                        req.connection.remoteAddress ||
                                                        req.socket.remoteAddress ||
                                                        req.connection.socket.remoteAddress;
                                                    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';

                                                    var newPassword = hashPassword(NewPassword);

                                                    var passChangeQueryParams = st.db.escape(TokenNo) + st.db.escape(oldPassResult[0][0].Password)+ ','+
                                                        st.db.escape(newPassword) + ',' + st.db.escape(ip) +',' + st.db.escape(userAgent);

                                                    var passChangeQuery = 'CALL pChangePassword('+passChangeQueryParams + ')';
                                                    console.log(passChangeQuery);


                                                    st.db.query(passChangeQuery,function(err,passChangeResult){
                                                        if(err){
                                                            console.log('Error FnChangePassword :  procedure pChangePassword');
                                                            console.log(err);
                                                            res.status(400).json(RtnMessage);
                                                        }
                                                        else{
                                                            if(passChangeResult){
                                                                console.log(passChangeResult);
                                                                RtnMessage.IsChanged = true;
                                                                res.status(200).json(RtnMessage);
                                                            }
                                                            else{
                                                                res.status(200).status(RtnMessage);
                                                            }
                                                        }
                                                    });
                                                }
                                                else{
                                                    res.status(200).json(RtnMessage);
                                                }
                                            }
                                            else{
                                                res.status(401).json(RtnMessage);
                                            }
                                        }
                                        else{
                                            res.status(401).json(RtnMessage);
                                        }
                                    }
                                    else{
                                        res.status(401).json(RtnMessage);
                                    }
                                }
                                else{
                                    res.status(401).json(RtnMessage);
                                }
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
            if (!OldPassword) {
                console.log('FnChangePassword: OldPassword is empty');
            }
            else if (!NewPassword) {
                console.log('FnChangePassword: NewPassword is empty');
            }
            else if (!TokenNo) {
                console.log('FnChangePassword: TokenNo is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnChangePassword error:' + ex.description);
        res.status(400).json(RtnMessage);

    }
};

User.prototype.forgetPassword = function(req,res,next){
    /**
     * @todo FnForgetPassword
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var EZEID = alterEzeoneId(req.body.EZEID);

        var resetCode = st.generateRandomHash(Date.now().toString());

        var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';
        var ip =  req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        var RtnMessage = {
            IsChanged: false,
            mailSend : false
        };
        RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (EZEID != null) {
            var resetQueryParams = st.db.escape(EZEID) + ',' + st.db.escape(resetCode) +
                ',' + st.db.escape(userAgent) + ',' + st.db.escape(ip);
            var resetQuery = 'CALL pResetpassword('+resetQueryParams+')';

            st.db.query(resetQuery, function (err, ForgetPasswordResult) {
                if (!err) {
                    //console.log(InsertResult);
                    if (ForgetPasswordResult) {
                        if (ForgetPasswordResult.affectedRows > 0) {
                            RtnMessage.IsChanged = true;
                            var UserQuery = 'Select TID, ifnull(FirstName,"") as FirstName,ifnull(LastName,"") as LastName,' +
                                'ifnull(AdminEMailID,"") as EMailID from tmaster where EZEID=' + st.db.escape(EZEID);
                            //console.log(UserQuery);
                            st.db.query(UserQuery, function (err, UserResult) {
                                if (!err) {
                                    if(UserResult){
                                        if(UserResult[0]) {
                                            if (UserResult[0].EMailID) {
                                                UserResult[0].FirstName = (UserResult[0].FirstName) ? UserResult[0].FirstName : 'Anonymous';
                                                UserResult[0].LastName = (UserResult[0].LastName) ? UserResult[0].LastName : ' ';
                                                var fs = require('fs');
                                                var path = require('path');
                                                var file = path.join(__dirname, '../../mail/templates/password_reset_req.html');

                                                fs.readFile(file, "utf8", function (err, data) {

                                                    if (!err) {
                                                        var passwordResetLink = req.CONFIG.SCHEME + "://" + req.CONFIG.DOMAIN + "/" +
                                                            req.CONFIG.PASS_RESET_PAGE_LINK + "/" + EZEID + "/" + resetCode
                                                        data = data.replace("[Firstname]", UserResult[0].FirstName);
                                                        data = data.replace("[Lastname]", UserResult[0].LastName);
                                                        data = data.replace("[reset link]", passwordResetLink);
                                                        data = data.replace("[resetlink]", passwordResetLink);

                                                        //console.log(UserResult);
                                                        //console.log('Body:' + data);
                                                        var mailOptions = {
                                                            from: EZEIDEmail,
                                                            to: UserResult[0].EMailID,
                                                            subject: 'EZEOne : Password reset request',
                                                            html: data // html body
                                                        };

                                                        // send mail with defined transport object
                                                        //message Type 7 - Forgot password mails service
                                                        var sendgrid = require('sendgrid')('ezeid', 'Ezeid2015');
                                                        var email = new sendgrid.Email();
                                                        email.from = mailOptions.from;
                                                        email.to = mailOptions.to;
                                                        email.subject = mailOptions.subject;
                                                        email.html = mailOptions.html;

                                                        sendgrid.send(email, function (err, result) {
                                                            console.log(result);
                                                            if (!err) {
                                                                if (result.message == 'success') {
                                                                    var post = {
                                                                        MessageType: 7,
                                                                        Priority: 1,
                                                                        ToMailID: mailOptions.to,
                                                                        Subject: mailOptions.subject,
                                                                        Body: mailOptions.html,
                                                                        SentbyMasterID: UserResult[0].TID,
                                                                        SentStatus: 1
                                                                    };
                                                                    //console.log(post);
                                                                    var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                                        // Neat!
                                                                        if (!err) {
                                                                            console.log('FnForgetPassword: Mail saved Successfully');
                                                                            RtnMessage.IsChanged = true;
                                                                            RtnMessage.mailSend = true;
                                                                            res.send(RtnMessage);
                                                                        }
                                                                        else {
                                                                            console.log('FnForgetPassword: Mail not Saved Successfully' + err);
                                                                            res.send(RtnMessage);
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    console.log('FnForgetPassword: Mail not Saved Successfully' + err);
                                                                    res.send(RtnMessage);
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnForgetPassword: Mail not Saved Successfully' + err);
                                                                res.send(RtnMessage);
                                                            }
                                                        });
                                                    }
                                                    else{
                                                        console.log('FnForgetPassword: readfile '+err);
                                                    }
                                                });

                                            }
                                            else {
                                                console.log('FnForgetPassword: mail not sended Missing destination email');
                                                res.send(RtnMessage);
                                            }
                                            console.log('FnForgetPassword: Password reset successfully');
                                        }
                                        else{
                                            RtnMessage.IsChanged = false;
                                            res.send(RtnMessage);
                                        }
                                    }
                                    else{
                                        RtnMessage.IsChanged = false;
                                        res.send(RtnMessage);
                                    }
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
                            console.log('FnForgetPassword: Password reset  Failed');
                        }

                    }
                    else {
                        res.send(RtnMessage);
                        console.log('FnForgetPassword: Password reset Failed');
                    }
                }
                else {
                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnForgetPassword:' + err);
                }
            });

        }
        else {
            console.log('FnForgetPassword: EZEID is empty');
            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log(ex);
        console.log('FnForgetPassword error:' + ex.description);
    }
};


/**
 * Verifies the forget password reset link received by the user for its validity
 * and after validation only it shows the fields to reset the password
 * @param req
 * @param res
 * @param next
 *
 *
 * @METHOD : POST
 * @service-param : reset_code <string>
 * @service-param : ezeone_id <string>
 *
 * @url : /pass_reset_code
 */
User.prototype.verifyResetPasswordLink = function(req,res,next){

    var status = true;
    var error = {};
    var respMsg = {
        status : false,
        message : 'Link is invalid or expired',
        data : null,
        error : null
    };

    if(!req.body.reset_code){
        error['reset_code'] = 'Reset code is invalid';
        status *= false;
    }

    if(!req.body.ezeone_id){
        error['ezeone_id'] = 'EZEOne ID is invalid';
        status *= false;
    }

    if(status){
        try{
            req.body.ezeone_id = alterEzeoneId(req.body.ezeone_id);
            var timestamp = moment(new Date()).format('YYYY-MM-DD HH:mm:ss').toString();

            var verifyQueryParams = st.db.escape(req.body.ezeone_id) + ','+ st.db.escape(req.body.reset_code);
            var verifyQuery = 'CALL pverifyresetcode('+verifyQueryParams+')';

            st.db.query(verifyQuery,function(err,verifyRes){
                if(err){
                    console.log('Error in verifyQuery : FnVerifyResetPasswordLink ');
                    console.log(err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                    respMsg.error = {server : 'Internal Server Error'};
                    respMsg.message = 'An error occurred ! Please try again';
                    res.status(400).json(respMsg);
                }
                else{
                    if(verifyRes){
                        if(verifyRes[0]){
                            if(verifyRes[0][0]){
                                if(verifyRes[0][0].tid){
                                    respMsg.status = true;
                                    respMsg.data = {
                                        tid : verifyRes[0][0].tid,
                                        reset_otp : ''
                                    };
                                    respMsg.message = 'Reset code is valid ! Proceed to reset password';
                                    respMsg.error = null;
                                    res.status(200).json(respMsg);
                                }
                                else{
                                    res.status(200).json(respMsg);
                                }
                            }
                            else{
                                res.status(200).json(respMsg);
                            }
                        }
                        else{
                            res.status(200).json(respMsg);
                        }
                    }
                    else{
                        res.status(200).json(respMsg);
                    }
                }

            });
        }
        catch(ex){
            console.log('Error : FnVerifyResetPasswordLink ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            respMsg.error = {server : 'Internal Server Error'};
            respMsg.message = 'An error occurred ! Please try again';
            res.status(400).json(respMsg);
        }
    }
    else{
        respMsg.error = error;
        respMsg.message = 'Please check all the errors';
        res.status(400).json(respMsg);
    }


}


/**
 * @todo FnVerifySecretCode
 * @param req
 * @param res
 * @param next
 *
 *
 * @METHOD : POST
 * @service-param : secret_code <string>
 * @service-param : ezeone_id <varchar>
 * @service-param : new_password <varchar>
 *
 * @url : /verify_secret_code
 */
User.prototype.verifySecretCode = function(req,res,next) {

    var status = true;
    var error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (!req.body.secret_code) {
        error['secret_code'] = 'secret_code is invalid';
        status *= false;
    }

    if (!req.body.ezeone_id) {
        error['ezeone_id'] = 'EZEOne ID is invalid';
        status *= false;
    }
    if (!req.body.new_password) {
        error['new_password'] = 'new_password is invalid';
        status *= false;
    }

    if (status) {
        try {
            req.body.ezeone_id = alterEzeoneId(req.body.ezeone_id);
            var queryParams = st.db.escape(req.body.secret_code) + ',' + st.db.escape(req.body.ezeone_id) + ',' + st.db.escape(req.body.new_password);
            var verifyQuery = 'CALL pverifySecretcode(' + queryParams + ')';

            st.db.query(verifyQuery, function (err, verifyRes) {
                if (err) {
                    console.log('Error in verifyQuery : FnVerifySecretCode ');
                    console.log(err);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                    respMsg.error = {server: 'Internal Server Error'};
                    respMsg.message = 'An error occurred ! Please try again';
                    res.status(400).json(respMsg);
                }
                else {
                    console.log(verifyRes[0][0].Error);
                    if (verifyRes) {
                        if (verifyRes[0]) {
                            if (verifyRes[0].length > 0) {
                                respMsg.message = verifyRes[0][0].Error;
                                res.status(200).json(respMsg);
                            }
                            else {
                                if (verifyRes[0][0]) {
                                    respMsg.status = true;
                                    respMsg.data = {
                                        secret_code: req.body.secret_code,
                                        ezeone_id: req.body.ezeone_id,
                                        new_password: req.body.new_password
                                    };
                                    respMsg.message = 'secret code is saved successfully';
                                    respMsg.error = null;
                                    res.status(200).json(respMsg);
                                }
                            }
                        }
                        else {
                            res.status(200).json(respMsg);
                        }
                    }
                    else {
                        res.status(200).json(respMsg);
                    }
                }
            });
        }
        catch (ex) {
            console.log('Error : FnVerifySecretCode ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            respMsg.error = {server: 'Internal Server Error'};
            respMsg.message = 'An error occurred ! Please try again';
            res.status(400).json(respMsg);
        }
    }
    else {
        respMsg.error = error;
        respMsg.message = 'Please check all the errors';
        res.status(400).json(respMsg);
    }
};


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.decryptPassword = function(req,res,next){
    /**
     * @todo FnDecryptPassword
     */
    var _this = this;
    try {
//res.setHeader("Access-Control-Allow-Origin", "*");
//res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

        var password = req.query.Password;

        var RtnMessage = {
            Password : ''
        };
        RtnMessage.Password = FnDecrypt(password);
        console.log(RtnMessage.Password);
        res.send(RtnMessage);


    }
    catch(ex){
        console.log('FnDecrypterror:' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        return 'error'
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
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('OTP generate error:' + ex.description);

        return 'error'
    }
}


/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getCompanyProfile = function(req,res,next){
    /**
     * @todo FnGetCompanyProfile
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var TID = req.query.TID;
        // console.log(req.query);
        var RtnMessage = {
            Result: [],
            Message: ''
        };
        if ( Token != null){
            TID = 0;
        }
        else{
            TID = TID;
            Token = 0;
        }
        if(Token != null && TID != null ){
            //console.log('CALL pGetTagLine(' + st.db.escape(TID)+ ',' + st.db.escape(Token) + ')');
            st.db.query('CALL pGetTagLine(' + st.db.escape(TID)+ ',' + st.db.escape(Token) + ')', function (err, taglineResult) {
                if (!err) {
                    if(taglineResult) {
                        if (taglineResult[0]) {
                            if (taglineResult[0].length > 0) {
                                RtnMessage.Result = taglineResult[0];
                                RtnMessage.Message = 'About Company Profile sent successfully';
                                console.log('FnGetCompanyProfile: Company Profile  Send successfully');
                                res.send(RtnMessage);
                            }
                            else {
                                RtnMessage.Message = 'No Company Profile  found';
                                console.log('FnGetCompanyProfile: No Company Profile    found');
                                res.send(RtnMessage);
                            }
                        }
                        else {
                            RtnMessage.Message = 'No Company Profile found';
                            console.log('FnGetCompanyProfile: No Company Profile found');
                            res.send(RtnMessage);
                        }
                    }
                    else {
                        RtnMessage.Message = 'No Company Profile found';
                        console.log('FnGetCompanyProfile: No Company Profile found');
                        res.send(RtnMessage);
                    }
                }
                else {
                    RtnMessage.Message = 'error in getting Company Profile ';
                    console.log('FnGetCompanyProfile: error in getting Company Profile' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });

        }
        else {
            if (TID == null) {
                console.log('FnGetCompanyProfile: TID is empty');
                RtnMessage.Message = 'TID is empty';
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetCompanyProfile error:' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.saveCompanyProfile = function(req,res,next){
    /**
     * @todo FnSaveCompanyProfile
     */
    var _this = this;
    try{

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var CompanyProfile = req.body.CompanyProfile;

        var RtnMessage = {
            IsSuccessfull : false,
            Message: ''
        };

        if(Token && CompanyProfile){
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var query = st.db.escape(Token)+ ',' + st.db.escape(CompanyProfile);
                        st.db.query('CALL pSaveTagLine(' + query + ')', function (err, companyResult) {
                            if (!err) {
                                if(companyResult) {
                                    if (companyResult.affectedRows > 0) {
                                        RtnMessage.IsSuccessfull = true;
                                        RtnMessage.Message = 'Inserted successfully';
                                        res.send(RtnMessage);
                                        console.log('FnSaveCompanyProfile:Inserted sucessfully..');
                                    }
                                    else {
                                        RtnMessage.Message = 'Not inserted';
                                        console.log('FnSaveCompanyProfile:No Inserted sucessfully..');
                                        res.send(RtnMessage);
                                    }
                                }
                                else{
                                    RtnMessage.Message = 'Not inserted';
                                    console.log('FnSaveCompanyProfile:No Inserted sucessfully..');
                                    res.send(RtnMessage);
                                }
                            }
                            else
                            {
                                RtnMessage.Message = 'Error in saving...';
                                console.log('FnSaveCompanyProfile:Error in getting insert group members..'+ err);
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        RtnMessage.Message = 'Invalid Token';
                        res.send(RtnMessage);
                        console.log('FnSaveCompanyProfile:Invalid Token');
                    }
                } else {
                    res.statusCode = 500;
                    res.send(RtnMessage);
                    console.log('FnSaveCompanyProfile:Error in validating token:  ' + err);
                }
            });
        }
        else{
            if(!Token){
                console.log('FnSaveAboutCompany:Token is empty');
                RtnMessage.Message = 'Token is empty';
            }
            else if(!CompanyProfile){
                console.log('FnSaveCompanyProfile:Company Profile is empty');
                RtnMessage.Message = 'Company Profile is emtpy';
            }

            res.statusCode = 400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnSaveCompanyProfile: Error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getWebLink = function(req,res,next){
    /**
     * @todo FnGetWebLink
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        //console.log('CALL pGetWebLink(' + st.db.escape(Token) + ')');
                        st.db.query('CALL pGetWebLink(' + st.db.escape(Token) + ')', function (err, GetResult) {
                            //console.log(GetResult);
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0]) {
                                        if(GetResult[0].length >0){
                                            console.log('FnGetWebLink: Web Links Send successfully');
                                            res.send(GetResult[0]);
                                        }
                                        else {

                                            console.log('FnGetWebLink:No Web Links found');
                                            res.json(null);
                                        }

                                    }
                                    else {

                                        console.log('FnGetWebLink:No Web Links found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetWebLink:No Web Links found');
                                    res.json(null);
                                }

                            }
                            else {

                                console.log('FnGetWebLink: error in getting Web Links' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnGetWebLink: Invalid Token');
                    }
                } else {

                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnGetWebLink: Error in validating token:  ' + err);
                }
            });
        }
        else {
            console.log('FnGetWebLink: Token is empty');
            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetWebLink error:' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.saveWebLink = function(req,res,next){
    /**
     * @todo FnSaveWebLink
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.body.Token;
        var URL = req.body.URL;
        var URLNo = req.body.URLNo;

        var RtnMessage = {
            IsSuccessfull: false,
            Message:''
        };
        var URLNumber = '';
        if(URLNo > 0 && URLNo < 100)
            URLNumber = URLNo;
        else
            RtnMessage.Message = 'Please Enter a URLNumber 1 t0 99';

        if (Token != null && URL && URLNumber) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        //console.log(Token,URL,URLNumber);
                        var query = st.db.escape(Token) + ',' + st.db.escape(URL) + ',' + st.db.escape(URLNumber) ;
                        st.db.query('CALL pSaveWebLinks(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if(InsertResult) {
                                    if (InsertResult.affectedRows > 0) {
                                        RtnMessage.IsSuccessfull = true;
                                        RtnMessage.Message = 'Save Successfully';
                                        res.send(RtnMessage);
                                        console.log('FnSaveWebLink: Web links save successfully');
                                    }
                                    else {
                                        console.log('FnSaveWebLink:No save Web links');
                                        RtnMessage.Message = 'URLNo is already exists';
                                        res.send(RtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveWebLink:No save Web links');
                                    RtnMessage.Message = 'URLNo is already exists';
                                    res.send(RtnMessage);
                                }
                            }

                            else {
                                console.log('FnSaveWebLink: error in saving Web links' + err);
                                RtnMessage.Message ='Error in saving' ;
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnSaveWebLink: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnSaveWebLink:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);

                }
            });

        }

        else {
            if(!Token) {
                console.log('FnSaveWebLink: Token is empty');
            }
            else if(!URL) {
                console.log('FnSaveWebLink: URL is empty');
            }
            else if (!URLNumber) {
                console.log('FnSaveWebLink: URLNumber is empty');
            }

            res.statusCode=400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnSaveWebLink:error ' + ex.description);

    }
};

/**
 * Method : DELETE
 * @param req
 * @param res
 * @param next
 */
User.prototype.deleteWebLink = function(req,res,next){
    /**
     * @todo FnDeleteWebLink
     */
    var _this = this;
    try{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        var TID = req.query.TID;
        var RtnMessage = {
            IsSuccessfull: false,
            Message:''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token !=null && TID != null) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        //console.log('CALL pDeleteWorkinghours(' + st.db.escape(TID) + ')');
                        st.db.query('CALL pDeleteWebLink(' + st.db.escape(TID) + ')', function (err, deleteResult) {
                            if (!err){
                                if(deleteResult) {
                                    if (deleteResult.affectedRows > 0) {
                                        RtnMessage.IsSuccessfull = true;
                                        RtnMessage.Message = 'Delete Successfully';
                                        res.send(RtnMessage);
                                        console.log('FnDeleteWebLink: Web Links delete successfully');
                                    }
                                    else {
                                        console.log('FnDeleteWebLink:No delete Web Links');
                                        RtnMessage.Message = 'No Deleted';
                                        res.send(RtnMessage);
                                    }
                                }
                                else {
                                    console.log('FnDeleteWebLink:No delete Web Links');
                                    RtnMessage.Message = 'No Deleted';
                                    res.send(RtnMessage);
                                }
                            }
                            else {
                                console.log('FnDeleteWebLink: error in deleting Web Links' + err);
                                res.statusCode = 500;
                                res.send(RtnMessage);
                            }
                        });
                    }
                    else {
                        console.log('FnDeleteWebLink: Invalid token');
                        res.statusCode = 401;
                        res.send(RtnMessage);
                    }
                }
                else {
                    console.log('FnDeleteWebLink:Error in processing Token' + err);
                    res.statusCode = 500;
                    res.send(RtnMessage);
                }
            });
        }
        else {
            if (Token == null) {
                console.log('FnDeleteWebLink: Token is empty');
            }
            else if (TID == null) {
                console.log('FnDeleteWebLink: TID is empty');
            }
            res.statusCode=400;
            res.send(RtnMessage);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnDeleteWebLink:error ' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getEzeidDetails = function(req,res,next){
    /**
     * @todo FnEZEIDPrimaryDetails
     */
    var _this = this;
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.Token;
        var EZEID = alterEzeoneId(req.query.EZEID);
        //console.log(req.query);
        if (Token && EZEID != null ) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var LocSeqNo = 0;
                        var FindArray =EZEID.split('.');
                        if (FindArray.length > 0) {
                            EZEID = FindArray[0];
                            //console.log(EZEID);
                            if (FindArray.length > 1) {
                                if (FindArray[1] != '') {
                                    if (FindArray[1].charAt(0).toUpperCase() == 'L') {
                                        LocSeqNo = FindArray[1].toString().substring(1, FindArray[1].length);
                                    }
                                    else {
                                        LocSeqNo = 0;
                                    }
                                }
                            }
                        }
                        st.db.query('CALL pEZEIDPrimaryDetails(' + st.db.escape(EZEID) + ',' + st.db.escape(LocSeqNo) + ')', function (err, GetResult) {
                            if (!err) {
                                if(GetResult) {
                                    if (GetResult[0]) {
                                        if (GetResult[0].length > 0) {
                                            console.log('FnEZEIDPrimaryDetails: EZEID Primary deatils Send successfully');
                                            res.send(GetResult[0]);
                                        }
                                        else {
                                            console.log('FnEZEIDPrimaryDetails:No EZEID Primary deatils found');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnEZEIDPrimaryDetails:No EZEID Primary deatils found');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnEZEIDPrimaryDetails:No EZEID Primary deatils found');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnEZEIDPrimaryDetails: error in getting EZEID Primary deatils' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        res.statusCode = 401;
                        res.json(null);
                        console.log('FnEZEIDPrimaryDetails: Invalid Token');
                    }
                }
                else
                {
                    res.statusCode = 500;
                    res.json(null);
                    console.log('FnEZEIDPrimaryDetails: Error in validating token:  ' + err);
                }
            });
        }
        else {
            if (!Token)
            {
                console.log('FnEZEIDPrimaryDetails: Token is empty');
            }
            else if (EZEID == null)
            {
                console.log('FnEZEIDPrimaryDetails: EZEID is empty');
            }

            res.statusCode=400;
            res.json(null);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnEZEIDDetails error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getResume = function(req,res,next){
    /**
     * @todo FnGetCVInfo
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var id = parseInt(req.query.id);
        //var ownerId = req.query.owner_id;   // id=masterid when ownerid=0 and id=jobid when ownerid!=0

        var responseMessage = {
            status: false,
            data: null,
            skillMatrix : [],
            job_location : [],
            line_of_career : [],
            education : [],
            error:{},
            message:''
        };

        if (id) {
            var queryParams = st.db.escape(id);
            var query = 'CALL pgetCVInfo(' + st.db.escape(id) + ')';
            console.log(query);
            st.db.query(query, function (err, MessagesResult) {
                if (!err) {
                    if(MessagesResult) {
                        if (MessagesResult[0]) {
                            if (MessagesResult[0][0]) {
                                MessagesResult[0][0].CVDocpath = (MessagesResult[0][0].CVDocpath) ?
                                    (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + MessagesResult[0][0].CVDocpath) : '';
                            }
                            responseMessage.status = true;
                            responseMessage.data = MessagesResult[0];
                            responseMessage.skillMatrix = MessagesResult[1];
                            responseMessage.job_location = MessagesResult[2];
                            responseMessage.line_of_career = MessagesResult[3];
                            responseMessage.education = MessagesResult[4];
                            responseMessage.error = null;
                            responseMessage.message = 'Cv info send successfully';
                            res.status(200).json(responseMessage);
                            console.log('FnGetCVInfo: CV Info sent successfully');
                        }
                        else {
                            console.log('FnGetCVInfo: No CV Info  available');
                            responseMessage.message = 'Cv info not send successfully';
                            res.json(responseMessage);
                        }
                    }
                    else {
                        console.log('FnGetCVInfo: No CV Info  available');
                        responseMessage.message = 'Cv info not send successfully';
                        res.json(responseMessage);
                    }
                }
                else {
                    console.log('FnGetCVInfo: Error in sending Messages: ' + err);
                    responseMessage.message = 'Error in sending CV info';
                    res.status(500).json(responseMessage);
                }
            });
        }
        else {

            console.log('FnGetCVInfo: id is empty');
            responseMessage.message = 'id is empty';
            res.status(400).json(responseMessage);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetCVInfo error:' + ex.description);

        res.status(400).json(responseMessage);
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.saveResume = function(req,res,next){
    /**
     * @todo FnSaveCVInfo
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        // In tFunctionID Int,In tRoleID Int, In tKeySkills varchar(250), In tCVDoc longtext, In tCVDocFile varchar(250), In iStatus int, In tPin varchar(15), In tToken varchar(15)
        var gender = (!isNaN(parseInt(req.body.gender))) ? parseInt(req.body.gender) : 3;
        var ids = req.body.skillsTid;
        var FunctionID = req.body.FunctionID;
        var KeySkills = req.body.KeySkills;
        var Status = parseInt(req.body.Status);
        var Pin = req.body.Pin;
        var Token = req.body.TokenNo;
        var skillMatrix1 = req.body.skillMatrix;
        skillMatrix1= JSON.parse(JSON.stringify(skillMatrix1));
        var skillMatrix = [];
        var allowedParam = [
            'tid',
            'active_status',
            'exp',
            'expertiseLevel',
            'skillname'
        ];
        var resultvalue = '';
        var location_id = '';

        /**
         * 7 New parameters added
         */
        var salary = req.body.salary;  // Float (Decimal)
        var noticePeriod = req.body.notice_period; // Integer, in days
        var experience = req.body.experience ? req.body.experience : 0; //
        var currentEmployeer = req.body.current_employeer ? req.body.current_employeer : '';
        var currentJobTitle = req.body.current_job_title ? req.body.current_job_title : '';
        var jobType = req.body.job_type;
        var locationsList = req.body.job_location;
        var categoryID = req.body.category_id ? req.body.category_id : 0;
        //var instituteID = req.body.institute_id ? req.body.institute_id : 0;
        //var institueTitle = req.body.institute_title ? req.body.institute_title : '';
        var expectedSalary = (parseFloat(req.body.exp_salary) !== NaN) ? parseFloat(req.body.exp_salary) : 0.00;
        var firstName = req.body.fn;
        var lastName = req.body.ln;
        var email = req.body.eid;
        var mobile = req.body.mn;
        var tid = req.body.tid;
        var salarytype = req.body.salary_type ? req.body.salary_type : 0;
        var expectedSalarytype = req.body.exp_salary_type ? req.body.exp_salary_type : 0;

        var locMatrix = req.body.locMatrix;
        locMatrix= JSON.parse(JSON.stringify(locMatrix));
        var educations = req.body.educations;
        educations= JSON.parse(JSON.stringify(educations));

        var resumeFilePath = (req.body.resume_path) ? req.body.resume_path : '';

        resumeFilePath = resumeFilePath.replace(req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/','');

        if(typeof(locationsList) == "string"){
            locationsList = JSON.parse(locationsList);
        }


        if(!locationsList){
            locationsList = [];
        }


        salary = (parseFloat(salary) !== NaN && salary > 0) ? parseFloat(salary) : 0;
        noticePeriod = (parseInt(noticePeriod) !== NaN && parseInt(noticePeriod) > 0) ? parseInt(noticePeriod) : 0;


        var RtnMessage = {
            IsSuccessfull: false,
            id : ''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {


                        /** Added by Indrajeet to upload files to google cloud server
                         *
                         */

                        if (Pin == '') {
                            Pin = null;
                        }

                        var locCount = 0;
                        var locationDetails = locationsList[locCount];


                        var saveResumeDetails = function(){
                            location_id = location_id.substr(0,location_id.length - 1);
                            var queryParams = st.db.escape(FunctionID) + ',' + st.db.escape(Status) + ',' + st.db.escape(Pin)
                                + ',' + st.db.escape(Token) + ',' + st.db.escape(ids)+ ','+ st.db.escape(salary) + ',' + st.db.escape(noticePeriod)
                                + ',' + st.db.escape(experience) + ','+ st.db.escape(currentEmployeer) + ',' + st.db.escape(currentJobTitle)
                                + ',' + st.db.escape(jobType) + ','+ st.db.escape(location_id) + ',' + st.db.escape(categoryID)
                                +',' + st.db.escape(expectedSalary)+ ','+ st.db.escape(firstName)+ ','+ st.db.escape(lastName)
                                +',' + st.db.escape(email)+',' + st.db.escape(mobile)+',' + st.db.escape(tid)+',' + st.db.escape(salarytype)
                                +',' + st.db.escape(expectedSalarytype) + ',' + st.db.escape(resumeFilePath)+',' + st.db.escape(gender);
                            var query = 'CALL pSaveCVInfo(' + queryParams + ')';
                            //console.log(query);
                            st.db.query(query, function (err, InsertResult) {
                                console.log(InsertResult);
                                if (!err) {
                                    if (InsertResult[0]) {
                                        var async = require('async');
                                        var count = skillMatrix1.length;

                                        //console.log(count);
                                        async.each(skillMatrix1, function iterator(skillDetails, callback) {

                                            count = count - 1;
                                            var tid = skillDetails.tid;
                                            var skills = {
                                                skillname: skillDetails.skillname,
                                                expertiseLevel: skillDetails.expertiseLevel,
                                                exp: skillDetails.exp,
                                                active_status: skillDetails.active_status,
                                                cvid: InsertResult[0][0].ID,
                                                tid: skillDetails.tid,
                                                fid: skillDetails.fid,
                                                type: skillDetails.type
                                            };
                                            FnSaveSkills(skills, function (err, Result) {
                                                if (!err) {
                                                    if (Result) {
                                                        resultvalue = Result.SkillID;
                                                        var SkillItems = {
                                                            skillID: resultvalue,
                                                            expertlevel: skills.expertiseLevel,
                                                            expyrs: skills.exp,
                                                            skillstatusid: skills.active_status,
                                                            cvid: skills.cvid
                                                        };

                                                        if (parseInt(skills.tid) != 0) {

                                                            var queryParams = st.db.escape(skills.tid) + ',' + st.db.escape(SkillItems.skillID)
                                                                + ',' + st.db.escape(SkillItems.expertlevel) + ',' + st.db.escape(SkillItems.expyrs)
                                                                + ',' + st.db.escape(SkillItems.skillstatusid) + ',' + st.db.escape(SkillItems.cvid)
                                                                + ',' + st.db.escape(skills.fid) + ',' + st.db.escape(skills.type);

                                                            var query = 'CALL pSaveCVSkills(' + queryParams + ')';
                                                            st.db.query(query, function (err, result) {
                                                                if (!err) {
                                                                    if (result) {
                                                                        if (result.affectedRows > 0) {
                                                                            console.log('FnupdateSkill: skillMatrix1: skill matrix Updated successfully');
                                                                        }
                                                                        else {
                                                                            console.log('FnupdateSkill: skillMatrix1: skill matrix not updated');
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('FnupdateSkill:  skillMatrix1:skill matrix not updated')
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('FnupdateSkill: skillMatrix1:error in saving  skill matrix:' + err);
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            var queryParams = st.db.escape(skills.tid) + ',' + st.db.escape(SkillItems.skillID)
                                                                + ',' + st.db.escape(SkillItems.expertlevel) + ',' + st.db.escape(SkillItems.expyrs)
                                                                + ',' + st.db.escape(SkillItems.skillstatusid) + ',' + st.db.escape(SkillItems.cvid)
                                                                + ',' + st.db.escape(skills.fid) + ',' + st.db.escape(skills.type);

                                                            var query = 'CALL pSaveCVSkills(' + queryParams + ')';
                                                            st.db.query(query, function (err, result) {
                                                                if (!err) {
                                                                    if (result) {
                                                                        if (result.affectedRows > 0) {
                                                                            console.log('FnSaveCv: skillMatrix1:skill matrix saved successfully');
                                                                        }
                                                                        else {
                                                                            console.log('FnSaveCv: skillMatrix1:skill matrix not saved');
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('FnSaveCv:skillMatrix1: skill matrix not saved');
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('FnSaveCv: skillMatrix1:error in saving skill matrix' + err);
                                                                }
                                                            });

                                                        }
                                                    }
                                                    else {
                                                        console.log('FnSaveMessage:skillMatrix1: Mail not Sent Successfully');
                                                        //res.send(RtnMessage);
                                                    }
                                                }
                                                else {
                                                    console.log('FnSaveMessage:skillMatrix1:Error in sending mails' + err);
                                                    //res.send(RtnMessage);
                                                }
                                            });
                                        });

                                        //line of career skill matrix
                                        if (locMatrix.length) {
                                            for(var k=0; k < locMatrix.length; k++){
                                                //async.each(locMatrix, function iterator(locDetails, callback) {

                                                console.log('----LOC Matrix----');
                                                count = count - 1;
                                                var locSkills = {
                                                    expertiseLevel: locMatrix[k].expertiseLevel,
                                                    exp: locMatrix[k].exp,
                                                    cvid: InsertResult[0][0].ID,
                                                    fid: locMatrix[k].fid,
                                                    careerId: locMatrix[k].career_id,
                                                    locUid: locMatrix[k].loc_uid

                                                };


                                                var queryParams = st.db.escape(locSkills.fid)+ ',' + st.db.escape(locSkills.careerId)
                                                    + ',' + st.db.escape(locSkills.expertiseLevel)+ ',' + st.db.escape(locSkills.exp)
                                                    + ',' + st.db.escape(locSkills.cvid)+ ',' + st.db.escape(locSkills.locUid);


                                                var query = 'CALL psavecvLOC(' + queryParams + ')';
                                                console.log(query);
                                                st.db.query(query, function (err, result) {
                                                    if (!err) {
                                                        if (result) {
                                                            if (result.affectedRows > 0) {
                                                                console.log('FnupdateSkill: locMatrix:skill matrix Updated successfully');
                                                            }
                                                            else {
                                                                console.log('FnupdateSkill: locMatrix: skill matrix not updated');
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnupdateSkill:  locMatrix:skill matrix not updated')
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnupdateSkill: locMatrix:error in saving  skill matrix:' + err);
                                                    }
                                                });
                                            }
                                        }

                                        //educations
                                        if (educations.length) {
                                            for(var j=0; j < educations.length; j++){
                                                //async.each(educations, function iterator(eduDetails, callback) {

                                                var educationData = {

                                                    cvid: InsertResult[0][0].ID,
                                                    eduId: educations[j].edu_id,
                                                    spcId: educations[j].spc_id,
                                                    score: educations[j].score,
                                                    yearofpassing: educations[j].yp,
                                                    level: educations[j].expertiseLevel, // 0-ug, 1-pg
                                                    instituteId : educations[j].institute_id
                                                };

                                                var queryParams = st.db.escape(educationData.cvid) + ',' + st.db.escape(educationData.eduId)
                                                    + ',' + st.db.escape(educationData.spcId) + ',' + st.db.escape(educationData.score)
                                                    + ',' + st.db.escape(educationData.yearofpassing) + ',' + st.db.escape(educationData.level)
                                                    + ',' + st.db.escape(educationData.instituteId);

                                                var query = 'CALL psavecveducation(' + queryParams + ')';
                                                console.log(query);
                                                st.db.query(query, function (err, result) {
                                                    if (!err) {
                                                        if (result) {
                                                            if (result.affectedRows > 0) {
                                                                console.log('FnupdateSkill: educations:skill matrix Updated successfully');
                                                            }
                                                            else {
                                                                console.log('FnupdateSkill:educations:  skill matrix not updated');
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnupdateSkill: educations: skill matrix not updated')
                                                        }
                                                    }
                                                    else {
                                                        console.log('FnupdateSkill: educations: error in saving  skill matrix:' + err);
                                                    }
                                                });

                                            }
                                        }
                                    }

                                    RtnMessage.IsSuccessfull = true;
                                    RtnMessage.id = InsertResult[0][0].ID;
                                    console.log('FnSaveCVInfo: CV Info Saved successfully');
                                    res.send(RtnMessage);

                                }
                                else {
                                    res.send(RtnMessage);
                                    res.statusCode = 500;
                                    console.log('FnSaveCVInfo: CVinfo not saved');
                                }
                            });
                        };

                        var insertLocations = function(locationDetails){
                            var list = {
                                locationTitle: locationDetails.location_title,
                                lat: locationDetails.latitude,
                                lng: locationDetails.longitude,
                                country: locationDetails.country,
                                mapType : locationDetails.maptype
                            };
                            var queryParams = st.db.escape(list.locationTitle) + ',' + st.db.escape(list.lat)
                                + ',' + st.db.escape(list.lng) + ',' + st.db.escape(list.country)+ ',' + st.db.escape(list.mapType);

                            var query = 'CALL psavejoblocation(' + queryParams + ')';
                            console.log(query);

                            st.db.query(query, function (err, results) {

                                if(err){
                                    console.log('Error in saving psavejoblocation');
                                    console.log(err);
                                }
                                else{
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0][0]) {

                                                //console.log(results[0][0].id);
                                                location_id += results[0][0].id + ',';
                                                locCount +=1;
                                                if(locCount < locationsList.length){
                                                    insertLocations(locationsList[locCount]);
                                                }
                                                else{
                                                    saveResumeDetails();
                                                }
                                            }
                                            else {
                                                console.log('FnSaveJobLocation:results no found');
                                                res.status(200).json(RtnMessage);
                                            }
                                        }
                                        else {
                                            console.log('FnSaveJobLocation:results no found');
                                            res.status(200).json(RtnMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnSaveJobLocation:results no found');
                                        res.status(200).json(RtnMessage);
                                    }
                                }

                            });
                        };

                        if(locationsList){
                            if(locationsList.length > 0){
                                insertLocations(locationDetails);
                            }
                            else{
                                location_id = '';
                                saveResumeDetails();

                            }
                        }

                        else{
                            location_id = '';
                            saveResumeDetails();
                        }
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
        var errorDate = new Date();
        console.log(ex);
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnSaveCVInfo error:' + ex.description);

    }
};

function FnSaveSkills(skill, CallBack) {
    var _this = this;
    try {

        //below query to check token exists for the users or not.
        if (skill != null) {
            //var Query = 'select Token from tmaster';
            //70084b50d3c43822fbe
            var RtnResponse = {
                SkillID: 0
            };
            RtnResponse = JSON.parse(JSON.stringify((RtnResponse)));

            st.db.query('Select SkillID from mskill where SkillTitle = ' + st.db.escape(skill.skillname) + ' and type='+st.db.escape(skill.type)+ ' and functionid='+st.db.escape(skill.fid), function (err, SkillResult) {
                if ((!err)) {
                    if (SkillResult[0]) {

                        RtnResponse.SkillID = SkillResult[0].SkillID;

                        CallBack(null, RtnResponse);
                    }
                    else {
                        st.db.query('insert into mskill (SkillTitle,type,functionid) values (' + st.db.escape(skill.skillname) + ',' + st.db.escape(skill.type) + ',' + st.db.escape(skill.fid) + ')', function (err, skillInsertResult) {
                            if (!err) {
                                if(skillInsertResult) {
                                    if (skillInsertResult.affectedRows > 0) {
                                        st.db.query('select SkillID from mskill where SkillTitle like ' + st.db.escape(skill.skillname) + ' and type=' + st.db.escape(skill.type), function (err, SkillMaxResult) {
                                            if (!err) {
                                                if(SkillMaxResult) {
                                                    if (SkillMaxResult[0]) {
                                                        //console.log('New Skill');
                                                        RtnResponse.SkillID = SkillMaxResult[0].SkillID;
                                                        CallBack(null, RtnResponse);
                                                    }
                                                    else {
                                                        CallBack(null, null);
                                                    }
                                                }
                                                else {
                                                    CallBack(null, null);
                                                }
                                            }
                                            else {
                                                CallBack(null, null);
                                            }
                                        });
                                    }
                                    else {
                                        CallBack(null, null);
                                    }
                                }
                                else {
                                    CallBack(null, null);
                                }
                            }
                            else {
                                CallBack(null, null);
                            }
                        });
                    }
                }
                else {
                    CallBack(null, null);
                }
            });
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('OTP FnSendMailEzeid error:' + ex.description);

        return 'error'
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getSkills = function(req,res,next){
    /**
     * @todo FnPGetSkills
     */
    var _this = this;

    var functionId = req.query.fid ? req.query.fid : 0;
    var type = req.query.type;  //0-core,1-soft
    var responseMsg = {
        status : false,
        data : [],
        message : 'Unable to load skills ! Please try again',
        error : {
            server : 'An internal server error'
        }
    };

    try{
        var query = 'CALL PGetSkills(' + st.db.escape(functionId) + ',' + st.db.escape(type) + ')';
        st.db.query(query,function(err,result){
            // console.log(result);
            if(err){
                console.log('Error : FnPGetSkills ');
                res.status(400).json(responseMsg);
            }
            else{
                responseMsg.status = true;
                responseMsg.message = 'Skills loaded successfully';
                responseMsg.error = null;
                responseMsg.data = result[0];

                res.status(200).json(responseMsg);
            }
        });
    }

    catch(ex){
        res.status(500).json(responseMsg);
        console.log('Error : FnPGetSkills '+ ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getDocPin = function(req,res,next) {
    /**
     * @todo FnGetDocPin
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.query.TokenNo;
        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        st.db.query('CALL pGetDocPIN(' + st.db.escape(token) + ')', function (err, BussinessListingResult) {
                            if (!err) {
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if(BussinessListingResult) {
                                    if (BussinessListingResult[0]) {
                                        if (BussinessListingResult[0].length > 0) {
                                            res.send(BussinessListingResult[0]);
                                            console.log('FnGetDocPin: Bussiness Pin sent successfully');
                                        }
                                        else {
                                            console.log('FnGetDocPin: Bussiness Pin is not avaiable');
                                            res.json(null);
                                        }
                                    }
                                    else {
                                        console.log('FnGetDocPin: Bussiness listing is not avaiable');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetDocPin: Bussiness listing is not avaiable');
                                    res.json(null);
                                }
                            }
                            else {
                                console.log('FnGetDocPin: ' + err);
                                res.statusCode = 500;
                                res.json(null);
                            }
                        });
                    }
                    else {
                        console.log('FnGetDocPin: Invalid token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetDocPin: : ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });
        }
        else {
            console.log('FnGetDocPin: token is empty');
            res.statusCode = 400;
            res.json(null);

        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetDocPin:  error:' + ex.description);
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getDoc = function(req,res,next) {
    /**
     * @todo FnGetDoc
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.TokenNo;
        var Type = parseInt(req.query.Type);

        if (Token && !isNaN(Type) && Type.toString() != '0') {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        st.db.query('CALL pGetDocs(' + st.db.escape(Token) + ',' + st.db.escape(Type) + ')', function (err, DocumentResult) {
                            if (!err) {
                                //console.log(DocumentResult);
                                if(DocumentResult) {
                                    if (DocumentResult[0]) {
                                        if (DocumentResult[0].length > 0) {
                                            res.send(DocumentResult[0]);
                                            console.log('FnGetDoc: Document sent successfully');
                                        }
                                        else {
                                            console.log('FnGetDoc: No document available');
                                            res.json(null);
                                        }

                                    }
                                    else {
                                        console.log('FnGetDoc: No document available');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetDoc: No document available');
                                    res.json(null);
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.json(null);
                                console.log('FnGetDoc: Error in sending documents: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnGetDoc: Invalid Token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetDoc: Token error: ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });

        }
        else {
            if (!Token) {
                console.log('FnGetDoc: Token is empty');
            }
            else if (!Type) {
                console.log('FnGetDoc: Type is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetDoc error:' + ex.description);

    }
};
/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getDocument = function(req,res,next) {
    /**
     * @todo FnGetDocument
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var Token = req.query.TokenNo;
        var Type = parseInt(req.query.RefType);
        var cvid = req.query.cvid ? parseInt(req.query.cvid) : 0;
        if (Token && !isNaN(Type) && Type.toString() != '0') {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var query = st.db.escape(Token) + ',' + st.db.escape(Type)+ ',' + st.db.escape(cvid);
                        //console.log(query);
                        st.db.query('CALL  pGetDocsFile(' + query + ')', function (err, DocumentResult) {
                            if (!err) {
                                if(DocumentResult) {
                                    if (DocumentResult[0]) {
                                        if (DocumentResult[0].length > 0) {
                                            DocumentResult = DocumentResult[0];
                                            var docs = DocumentResult[0];
                                            // console.log(docs);
                                            res.setHeader('Content-Type', docs.ContentType);
                                            res.setHeader('Content-Disposition', 'attachment; filename=' + docs.Filename);
                                            res.setHeader('Cache-Control', 'public, max-age=0');
                                            res.writeHead('200', {'Content-Type': docs.ContentType});
                                            //console.log(docs.Docs);
                                            res.end(docs.Docs, 'base64');
                                            console.log('FnGetDocument: Document sent successfully-1');
                                        }
                                        else {
                                            console.log('FnGetDocument: No document available');
                                            res.json(null);
                                        }

                                    }
                                    else {
                                        console.log('FnGetDocument: No document available');
                                        res.json(null);
                                    }
                                }
                                else {
                                    console.log('FnGetDocument: No document available');
                                    res.json(null);
                                }
                            }
                            else {
                                res.statusCode = 500;
                                res.json(null);
                                console.log('FnGetDocument: Error in sending documents: ' + err);
                            }
                        });
                    }
                    else {
                        console.log('FnGetDocument: Invalid Token');
                        res.statusCode = 401;
                        res.json(null);
                    }
                }
                else {
                    console.log('FnGetDocument: Token error: ' + err);
                    res.statusCode = 500;
                    res.json(null);
                }
            });

        }
        else {
            if (!Token) {
                console.log('FnGetDocument: Token is empty');
            }
            else if (!Type) {
                console.log('FnGetDocument: Type is empty');
            }
            res.statusCode = 400;
            res.json(null);
        }

    }
    catch (ex) {
        console.log('FnGetDocument error:' + ex.description);
        var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
    }
};
/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.updateDocPin = function(req,res,next) {
    /**
     * @todo FnUpdateDocPin
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var token = req.body.TokenNo;
        var tPin = req.body.Pin;
        var RtnMessage = {
            IsUpdated: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (tPin == '') {
            tPin = null;
        }
        if (token) {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var query = st.db.escape(token) + ',' + st.db.escape(tPin);
                        st.db.query('CALL pUpdateDocPIN(' + query + ')', function (err, UpdateResult) {
                            if (!err) {
                                //  console.log(UpdateResult);
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if(UpdateResult) {
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
            if (!token) {
                console.log('FnUpdateDocPin: token is empty');
            }

            res.statusCode = 400;
            res.send(RtnMessage);

        }
    }
    catch (ex) {
        console.log('FnUpdateDocPin:  error:' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.saveDoc = function(req,res,next) {
    /**
     * @todo FnSaveDoc
     */
    var _this = this;
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

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult && !isNaN(tRefType)) {
                        if (tRefExpiryDate != null) {
                            tRefExpiryDate = new Date(tRefExpiryDate);
                            //console.log(tRefExpiryDate);
                        }
                        var query = st.db.escape(Token) + ',' + st.db.escape(tRefNo) + ',' + st.db.escape(tRefExpiryDate) + ',' + st.db.escape(tRefType);
                        //console.log('FnSaveDoc: Inserting data: ' + query);
                        st.db.query('CALL pSaveDocs(' + query + ')', function (err, InsertResult) {
                            if (!err) {
                                //console.log(InsertResult);
                                if(InsertResult) {
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
                        if (!tRefType) {
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
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getFunctions = function(req,res,next) {
    /**
     * @todo FnGetFunctions
     */
    var _this = this;
    var type = (!isNaN(parseInt(req.query.type))) ?  parseInt(req.query.type) : 0;

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


        var query = 'Call pgetfunctiontype (' + st.db.escape(type) + ')';

        st.db.query(query, function (err, FunctionRoleMapResult) {
            if (!err) {
                if(FunctionRoleMapResult) {
                    if (FunctionRoleMapResult.length > 0) {
                        res.send(FunctionRoleMapResult[0]);
                        console.log('FnGetFunctions: mfunctiontype: Functions sent successfully');
                    }
                    else {
                        res.json(null);
                        res.statusCode = 500;
                        console.log('FnGetFunctions: mfunctiontype: No function  found');
                    }
                }
                else {
                    res.json(null);
                    res.statusCode = 500;
                    console.log('FnGetFunctions: mfunctiontype: No function  found');
                }
            }
            else {

                res.json(null);
                console.log('FnGetFunctions: mfunctiontype: ' + err);
            }
        });

    }
    catch (ex) {
        console.log('FnGetFunctions error:' + ex.description);

    }
};

var fs = require("fs");
/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.uploadDoc = function(req,res,next) {
    /**
     * @todo FnUploadDocument
     */
    var _this = this;
    try {

        var deleteTempFile = function(){
            fs.unlink('../bin/'+req.files.file.path);
        };

        var RtnMessage = {
            IsSuccessfull: false,
            id : ''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));


        var Token = req.body.TokenNo;
        var CntType = req.files.file.mimetype;
        var RefFileName = req.files.file.path;
        var tRefType = req.body.RefType;
        var cvid = req.body.cvid ? parseInt(req.body.cvid) : 0;
        var isinternal = req.body.isinternal ? parseInt(req.body.isinternal) : 0;
        //console.log(req.body);

        st.validateToken(Token, function (err, tokenResult) {
            if (!err) {
                if (tokenResult) {
                    if (req && req.files) {
                        if (CntType != null && RefFileName != null && tRefType != null && Token != null) {

                            var fileName = '';
                            if (RefFileName != null) {
                                fileName = RefFileName.split('.').pop();
                            }
                            //console.log(Token);
                            fs.readFile(RefFileName, function (err, original_data) {
                                var query = st.db.escape(Token) + ',' + st.db.escape( new Buffer(original_data).toString('base64'))
                                    + ',' + st.db.escape(fileName) + ',' + st.db.escape(tRefType) + ',' + st.db.escape(CntType)
                                    + ',' + st.db.escape(cvid) + ',' + st.db.escape(isinternal);
                                //console.log(query);
                                st.db.query('CALL pSaveDocsFile(' + query + ')', function (err, InsertResult) {
                                    if (!err) {
                                        //    console.log(InsertResult);
                                        if (InsertResult) {
                                            if(InsertResult[0]) {
                                                if(InsertResult[0][0]) {
                                                    if (tRefType == 7) {
                                                        RtnMessage.IsSuccessfull = true;
                                                        RtnMessage.id = InsertResult[0][0].id;
                                                        res.send(RtnMessage);
                                                        deleteTempFile();
                                                    }
                                                    else {
                                                        RtnMessage.IsSuccessfull = true;
                                                        console.log('FnUploadDocument: Document Saved successfully');
                                                        res.send(RtnMessage);
                                                        deleteTempFile();
                                                    }
                                                }
                                                else {
                                                    console.log('FnUploadDocument: Document not inserted');
                                                    res.send(RtnMessage);
                                                    deleteTempFile();
                                                }
                                            }
                                            else {
                                                console.log('FnUploadDocument: Document not inserted');
                                                res.send(RtnMessage);
                                                deleteTempFile();
                                            }
                                        }
                                        else {
                                            console.log('FnUploadDocument: Document not inserted');
                                            res.send(RtnMessage);
                                            deleteTempFile();
                                        }
                                    }
                                    else {
                                        res.statusCode = 500;
                                        res.send(RtnMessage);
                                        console.log('FnUploadDocument: Error in saving documents:' + err);
                                        deleteTempFile();
                                    }
                                });
                            });
                        }
                        else {
                            res.send(RtnMessage);
                            console.log('FnUploadDocument: Mandatory field are available');
                            deleteTempFile();
                        }
                    }
                    else {
                        res.send(RtnMessage);
                        console.log('FnUploadDocument: Mandatory field are available');
                        deleteTempFile();
                    }
                }
                else {
                    res.statusCode = 401;
                    res.send(RtnMessage);
                    console.log('FnUploadDocument: Invalid Token');
                    deleteTempFile();
                }
            }
            else {
                res.statusCode = 500;
                res.send(RtnMessage);
                console.log('FnUploadDocument: Error in validating token: ' + err);
                deleteTempFile();
            }
        });
    }
    catch (ex) {
        console.log('FnGetDocument error:' + ex.description);
        //throw new Error(ex);
        deleteTempFile();
    }
};

var FnGetRedirectLink = function(ezeid,tag,redirectCallback) {

    console.log('--------------------');
    console.log('Call Get Weblink Url....');
    console.log('--------------------');
    var query = 'select tid from tmaster where ezeid=' + st.db.escape(ezeid);
    st.db.query(query, function (err, result) {
        if (!err) {
            console.log(result);
            if(result) {

                var query1 = 'SELECT tid,imageurl,pin,imagefilename as URL,tag FROM t_docsandurls WHERE masterid=' + st.db.escape(result[0].tid) + ' AND tag=' + st.db.escape(tag) + ' AND imageurl=1';
                console.log(query1);
                st.db.query(query1, function (err, results) {
                    if (!err) {
                        if(results) {
                            if (results.length > 0) {
                                console.log(results);
                                redirectCallback(results[0].URL);
                            }
                            else {
                                redirectCallback(null);
                            }
                        }
                        else {
                            redirectCallback(null);
                        }
                    }
                    else {
                        console.log(err);
                        redirectCallback(null);
                    }
                });
            }
            else {
                redirectCallback(null);
            }
        }
        else {
            console.log(err);
            redirectCallback(null);
        }
    });
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.webLinkRedirect = function(req,res,next) {
    /**
     * @todo FnWebLinkRedirect
     */


    var _this = this;
    var ezeid,tag, pin,output=[];

    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    var allowedDocs = ['ID','DL','PASSPORT','BROCHURE','CV','D1','D2'];
    var allowedDocTypes = {ID : 3, DL : 7, PP : 4,BR : 1 ,CV : 2,D1 : 5,D2 :6};
    if(req.params.id) {
        var link = req.params.id;
        var arr = link.split('.');

        console.log(arr);

        ezeid = alterEzeoneId(arr[0]);
        if (arr[1]) {

            tag = arr[1].toUpperCase();
        }
        if(arr[2]) {
            pin = arr[2];
        }
        else
        { pin = null ; }

        if(arr.length > 1){
            if(arr[1].toUpperCase() == 'MAP'){
                res.redirect('/'+alterEzeoneId(arr[0]) + req.CONFIG.CONSTANT.MAP_REDIRECT_LINK);

            }

            else {

                console.log('--------------------');
                console.log('Document Loading....');
                console.log('--------------------');

                var query = st.db.escape(ezeid) + ',' + st.db.escape(pin) + ',' + st.db.escape(tag);
                console.log('CALL  PGetSearchDocuments(' + query + ')');
                st.db.query('CALL  PGetSearchDocuments(' + query + ')', function (err, results) {

                    if (!err) {
                        if (results) {
                            if (results[0]) {
                                console.log('----results.length-----');
                                console.log(results[0].length);
                                console.log(results);

                                if(results[0][0]){
                                    /**
                                     * This is a weblink redirect to this weblink
                                     */
                                    if(results[0][0].type){
                                        res.redirect(results[0][0].path);
                                    }
                                    else{
                                        /**
                                         * This is a document saved on google cloud ! Creating dynamic google storage bucket link
                                         * and redirecting the user to there
                                         */
                                        var s_url = (results[0][0].path) ?
                                            (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + results[0][0].path) : 'https://www.ezeone.com';
                                        console.log('redirecting url..');
                                        console.log(s_url);
                                        res.redirect(s_url);


                                    }
                                }
                                else{
                                    next();
                                }




                                //respMsg.status = true;
                                //respMsg.data = {s_url: s_url};
                                //respMsg.message = 'docs loaded successfully';
                                //respMsg.error = null;
                                //console.log(respMsg);

                            }
                            else {

                                next();
                            }
                        }
                        else {
                            next();
                        }
                    }
                    else {
                        console.log(err);
                        next();
                    }
                });
            }

            //else {
            //
            //    console.log('--------------');
            //    console.log('URL Link Page');
            //    console.log('---------------');
            //
            //    var urlBreaker = tag.split('');
            //    if (urlBreaker.length > 1 && urlBreaker.length < 4) {
            //        if (urlBreaker[0] === 'U') {
            //
            //            FnGetRedirectLink(ezeid, tag, function (url) {
            //
            //                if (url) {
            //                    console.log('Redirecting......');
            //                    res.redirect(url);
            //                }
            //                else {
            //
            //                    next();
            //                }
            //            });
            //        }
            //        else {
            //            //console.log('document-not-found');
            //            //var reload = 'https://www.ezeone.com/document-not-found';
            //            //res.redirect(reload);
            //            next();
            //        }
            //    }
            //    else {
            //        next();
            //    }
            //}
        }
        else{
            next();
        }
    }
    else{
        next();
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getMTitle = function(req,res,next) {
    /**
     * @todo FnGetMTitle
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var LangID = parseInt(req.query.LangID);

        if (!(isNaN(LangID))) {
            var Query = 'Select TitleID,Title from mtitle where LangID=' + st.db.escape(LangID);
            st.db.query(Query, function (err, MTitleResult) {
                if (!err) {
                        if (MTitleResult) {
                            res.send(MTitleResult);
                            console.log('FnGetMTitle: mtitle: MTitle sent successfully');
                        }
                        else {
                            res.json(null);
                            console.log('FnGetMTitle: mtitle: No MTitle found');
                        }
                }
                else {
                    res.json(null);
                    res.statusCode = 500;
                    console.log('FnGetMTitle: mtitle: ' + err);
                }
            });
        }
        else {

            console.log('FnGetMTitle: LangId is empty');
            res.statusCode = 400;
            res.json(null);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetMTitle error:' + ex.description);

    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.updateProfilePicture = function(req,res,next) {
    /**
     * @todo FnUpdateProfilePicture
     */
    var _this = this;
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
        if (Token && Picture != null && PictureFileName != null) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {

                        st.db.query('select TID from tmaster where Token=' + st.db.escape(Token), function (err, UserResult) {
                            if (!err) {
                                //console.log(UserResult);
                                if (UserResult) {
                                    if(UserResult[0]) {
                                        if (UserResult[0].length > 0) {
                                            var query = 'Update tlocations set Picture = ' + st.db.escape(Picture) + ',' + 'PictureFileName= ' + st.db.escape(PictureFileName) + ' where SeqNo=0 and MasterID=' + st.db.escape(UserResult[0].TID);
                                            // console.log(query);
                                            st.db.query(query, function (err, PicResult) {
                                                if (!err) {
                                                    //console.log(PicResult);
                                                    if(PicResult) {
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
            if (!Token) {
                console.log('FnUpdateProfilePicture: Token is empty');
            }
            res.statusCode = 400;
            res.send(RtnMessage);
        }

    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnUpdateProfilePicture error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getLoginCheck = function(req,res,next) {
    /**
     * @todo FnGetLoginCheck
     */
    var _this = this;

    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var Token = req.query.Token;
        RtnMessage = {
            IsAvailable: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token) {
            st.validateToken(Token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
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
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetUserDetails error:' + ex.description);

    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getProxmity = function(req,res,next) {
    /**
     * @todo FnGetProxmity
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (!(isNaN(LangID))) {
            var Query = 'Select Title,MetersValue, MilesValue from mproximity where LangID=' + st.db.escape(LangID);
            st.db.query(Query, function (err, ProximityResult) {
                if (!err) {
                    if (ProximityResult) {
                        res.send(ProximityResult);
                        console.log('FnGetProxmity: mproximity: proximity sent successfully');
                    }
                    else {
                        res.json(null);
                        console.log('FnGetProxmity: mproximity: No proximity found');
                    }
                }
                else {
                    res.json(null);
                    res.statusCode = 500;
                    console.log('FnGetProxmity: mroletype:' + err);
                }
            });
        }
        else {
            res.json(null);
            res.statusCode = 400;
            console.log('FnGetProxmity: LangId is empty');
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnGetProxmity error:' + ex.description);
        //throw new Error(ex);
    }
};

/**
 * @todo FnGetInstitutes
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getInstitutes = function(req,res,next) {

    var _this = this;
    var token = req.query.token;
    var responseMsg = {
        status: false,
        data: [],
        message: 'Unable to load Institutes ! Please try again',
        error: {}
    };

    var validateStatus = true, error = {};
    if (!token) {
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if (!validateStatus) {
        responseMsg.error = error;
        responseMsg.message = 'Please check the errors below';
        res.status(400).json(responseMsg);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        st.db.query('CALL pGetInstitutes()', function (err, instituteResult) {
                            if (err) {
                                console.log('Error : FnGetInstitutes :' + err);
                                res.status(400).json(responseMsg);
                            }
                            else {
                                if(instituteResult) {
                                    if(instituteResult[0]) {
                                        responseMsg.status = true;
                                        responseMsg.message = 'Institutes loaded successfully';
                                        responseMsg.error = null;
                                        responseMsg.data = instituteResult[0];
                                        res.status(200).json(responseMsg);
                                    }
                                    else{
                                        console.log('FnGetInstitutes:Unable to load Institutes');
                                        res.status(200).json(responseMsg);
                                    }
                                }
                                else{
                                    console.log('FnGetInstitutes:Unable to load Institutes');
                                    res.status(200).json(responseMsg);
                                }
                            }
                        });
                    }
                    else {
                        responseMsg.message = 'Invalid token';
                        responseMsg.error = {
                            token: 'Invalid token'
                        };
                        responseMsg.data = null;
                        res.status(401).json(responseMsg);
                        console.log('FnGetInstitutes: Invalid token');
                    }
                }
                else {
                    responseMsg.error = {};
                    responseMsg.message = 'Error in validating Token';
                    res.status(500).json(responseMsg);
                    console.log('FnGetInstitutes:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            res.status(500).json(responseMsg);
            console.log('Error : FnGetInstitutes ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetEducations
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getEducations = function(req,res,next) {

    var _this = this;
    var token = req.query.token;
    var responseMsg = {
        status: false,
        data: [],
        message: 'Unable to load Institutes ! Please try again',
        error: {}
    };

    var validateStatus = true, error = {};
    if (!token) {
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if (!validateStatus) {
        responseMsg.error = error;
        responseMsg.message = 'Please check the errors below';
        res.status(400).json(responseMsg);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        st.db.query('CALL pGetEducations()', function (err, geteducationResult) {
                            if (err) {
                                console.log('Error : FnGetEducations :' + err);
                                res.status(400).json(responseMsg);
                            }
                            else {
                                if(geteducationResult) {
                                    if(geteducationResult[0]) {
                                        responseMsg.status = true;
                                        responseMsg.message = 'Educations loaded successfully';
                                        responseMsg.error = null;
                                        responseMsg.data = geteducationResult[0];
                                        res.status(200).json(responseMsg);
                                    }
                                    else{
                                        console.log('getEducations:Unable to load Institutes');
                                        res.status(200).json(responseMsg);
                                    }
                                }
                                else{
                                    console.log('getEducations:Unable to load Institutes');
                                    res.status(200).json(responseMsg);
                                }
                            }
                        });
                    }
                    else {
                        responseMsg.message = 'Invalid token';
                        responseMsg.error = {
                            token: 'Invalid token'
                        };
                        responseMsg.data = null;
                        res.status(401).json(responseMsg);
                        console.log('FnGetEducations: Invalid token');
                    }
                }
                else {
                    responseMsg.error = {};
                    responseMsg.message = 'Error in validating Token';
                    res.status(500).json(responseMsg);
                    console.log('FnGetEducations:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            res.status(500).json(responseMsg);
            console.log('Error : FnGetEducations ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetSpecialization
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getSpecialization = function(req,res,next) {

    var _this = this;
    var token = req.query.token;
    var educationId = req.query.education_id ? req.query.education_id : '';
    var responseMsg = {
        status: false,
        data: [],
        message: 'Unable to load Institutes ! Please try again',
        error: {}
    };

    var validateStatus = true, error = {};
    if (!token) {
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if (!validateStatus) {
        responseMsg.error = error;
        responseMsg.message = 'Please check the errors below';
        res.status(400).json(responseMsg);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        st.db.query('CALL pGetSpecialization(' + st.db.escape(educationId) + ')', function (err, specializationResult) {
                            if (err) {
                                console.log('Error : FnGetSpecialization :' + err);
                                res.status(400).json(responseMsg);
                            }
                            else {
                                if(specializationResult) {
                                    if(specializationResult[0]) {
                                        responseMsg.status = true;
                                        responseMsg.message = 'Specialization loaded successfully';
                                        responseMsg.error = null;
                                        responseMsg.data = specializationResult[0];
                                        res.status(200).json(responseMsg);
                                    }
                                    else{
                                        console.log('getSpecialization:Unable to load Institutes');
                                        res.status(200).json(responseMsg);
                                    }
                                }
                                else{
                                    console.log('getSpecialization:Unable to load Institutes');
                                    res.status(200).json(responseMsg);
                                }
                            }
                        });
                    }
                    else {
                        responseMsg.message = 'Invalid token';
                        responseMsg.error = {
                            token: 'Invalid token'
                        };
                        responseMsg.data = null;
                        res.status(401).json(responseMsg);
                        console.log('FnGetSpecialization: Invalid token');
                    }
                }
                else {
                    responseMsg.error = {};
                    responseMsg.message = 'Error in validating Token';
                    res.status(500).json(responseMsg);
                    console.log('FnGetSpecialization:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            res.status(500).json(responseMsg);
            console.log('Error : FnGetSpecialization ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetVerifiedInstitutes
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getVerifiedInstitutes = function(req,res,next) {

    var _this = this;
    var token = req.query.token;
    var responseMsg = {
        status: false,
        data: [],
        message: 'Unable to load Institutes ! Please try again',
        error: {}
    };

    var validateStatus = true, error = {};
    if (!token) {
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if (!validateStatus) {
        responseMsg.error = error;
        responseMsg.message = 'Please check the errors below';
        res.status(400).json(responseMsg);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        st.db.query('CALL pGetVerifiedInstitutes()', function (err, verifiedinstituteResult) {
                            if (err) {
                                console.log('Error : FnGetVerifiedInstitutes :' + err);
                                res.status(400).json(responseMsg);
                            }
                            else {
                                console.log(verifiedinstituteResult);
                                if(verifiedinstituteResult) {
                                    if(verifiedinstituteResult[0]) {
                                        responseMsg.status = true;
                                        responseMsg.message = 'Institutes is valid';
                                        responseMsg.error = null;
                                        responseMsg.data = verifiedinstituteResult[0];
                                        res.status(200).json(responseMsg);
                                    }
                                    else{
                                        console.log('FnGetVerifiedInstitutes:Unable to load Institutes');
                                        res.status(200).json(responseMsg);
                                    }
                                }
                                else{
                                    console.log('FnGetVerifiedInstitutes:Unable to load Institutes');
                                    res.status(200).json(responseMsg);
                                }
                            }
                        });
                    }
                    else {
                        responseMsg.message = 'Invalid token';
                        responseMsg.error = {
                            token: 'Invalid token'
                        };
                        responseMsg.data = null;
                        res.status(401).json(responseMsg);
                        console.log('FnGetVerifiedInstitutes: Invalid token');
                    }
                }
                else {
                    responseMsg.error = {};
                    responseMsg.message = 'Error in validating Token';
                    res.status(500).json(responseMsg);
                    console.log('FnGetVerifiedInstitutes:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            res.status(500).json(responseMsg);
            console.log('Error : FnGetVerifiedInstitutes ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnSaveUserDetails
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @service-param token     <char(36)>
 * @service-param first_name <varchar(30)>
 * @service-param last_name <varchar(30)>
 * @service-param company_name <varchar(150)>
 * @service-param job_title <varchar(100)>
 * @service-param gender <Int>
 * @service-param dob <DateTime> date of birth
 * @service-param company_tagline <varchar(100)>
 * @service-param email_id <varchar(50)>
 * @description api code for save user details
 */
User.prototype.saveUserDetails = function(req,res,next){

    var _this = this;

    var token  = req.body.token;
    var firstName  = req.body.first_name ? req.body.first_name : '';
    var lastName = req.body.last_name ? req.body.last_name : '';
    var companyName = req.body.company_name ? req.body.company_name : '';
    var jobTitle  = req.body.job_title ? req.body.job_title : '';
    var gender  = req.body.gender ? req.body.gender : '';
    var dob  = req.body.dob;
    var companyTagline  = req.body.company_tagline;
    var email  = req.body.email ? req.body.email : '';
    var visibleEmail = (!isNaN(parseInt(req.body.ve))) ?  parseInt(req.body.ve) : 1; // 0-invisible, 1- visible
    var visibleMobile = (!isNaN(parseInt(req.body.vm))) ?  parseInt(req.body.vm) : 1;     // 0-invisible, 1- visible
    var visiblePhone = (!isNaN(parseInt(req.body.vp))) ?  parseInt(req.body.vp) : 1;// 0-invisible, 1- visible
    var visibleAddress = (!isNaN(parseInt(req.body.va))) ?  parseInt(req.body.va) : 1;// 0-invisible, 1- visible
    var locTitle = req.body.loc_title ? req.body.loc_title : '';
    var latitude = req.body.lat ? req.body.lat : '';
    var longitude = req.body.lng ? req.body.lng : '';
    var address1 = req.body.address_line1 ? req.body.address_line1 : '';
    var address2 = req.body.address_line2 ? req.body.address_line2 : '';
    var city = req.body.city ? req.body.city : '';
    var stateId = req.body.state_id ?  req.body.state_id : '';
    var countryId = req.body.country_id ? req.body.country_id : '';
    var postalCode = req.body.postal_code ? req.body.postal_code : '';
    var phone = req.body.ph ? req.body.ph : '';
    var mobile = req.body.mn ? req.body.mn : '';
    var website = req.body.website ? req.body.website : '';
    var isdPhone = req.body.isd_phone ? req.body.isd_phone : '';
    var isdMobile = req.body.isd_mobile ? req.body.isd_mobile : '';
    var parkingStatus = req.body.parking_status ? req.body.parking_status : '';
    var templateId = (!isNaN(parseInt(req.body.template_id))) ? parseInt(req.body.template_id) : '';
    var pin = req.body.pin ? req.body.pin : null;
    var statusId = (!isNaN(parseInt(req.body.status_id))) ?  parseInt(req.body.status_id) : 1;  // 1-active, 2-inactive
    var functionId = (!isNaN(parseInt(req.body.fid))) ? parseInt(req.body.fid) : 0;
    var categoryId = (!isNaN(parseInt(req.body.cid))) ? parseInt(req.body.cid) : 0;
    var businessKeywords = (req.body.keywords) ? req.body.keywords : '';
    var aboutCompany = (req.body.about_company) ? req.body.about_company : '';


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true, error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    console.log(tokenResult);
                    if (tokenResult) {
                        var queryParams =  st.db.escape(firstName) + ',' + st.db.escape(lastName)
                            + ',' + st.db.escape(companyName)+ ','+ st.db.escape(jobTitle) + ',' + st.db.escape(gender)
                            + ',' + st.db.escape(dob + ' 00:00') + ',' + st.db.escape(companyTagline)+ ',' + st.db.escape(email)
                            + ',' + st.db.escape(token)+ ',' + st.db.escape(visibleEmail)+ ',' + st.db.escape(visibleMobile)
                            + ',' + st.db.escape(visiblePhone)+ ',' + st.db.escape(visibleAddress)+ ',' + st.db.escape(locTitle)
                            + ',' + st.db.escape(latitude)+ ',' + st.db.escape(longitude)+ ',' + st.db.escape(address1)
                            + ',' + st.db.escape(address2)+ ',' + st.db.escape(city)+ ',' + st.db.escape(stateId)
                            + ',' + st.db.escape(countryId)+ ',' + st.db.escape(postalCode)+ ',' + st.db.escape(phone)
                            + ',' + st.db.escape(mobile)+ ',' + st.db.escape(website)+ ',' + st.db.escape(isdPhone)
                            + ',' + st.db.escape(isdMobile)+ ',' + st.db.escape(parkingStatus)+ ',' + st.db.escape(templateId)
                            + ',' + st.db.escape(pin)+ ',' + st.db.escape(statusId)+ ',' + st.db.escape(functionId)
                            + ',' + st.db.escape(categoryId) + ',' + st.db.escape(businessKeywords)+ ',' + st.db.escape(aboutCompany);
                        var query = 'CALL psaveuserdetails(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, insertResult) {
                            if (!err) {
                                //console.log(insertResult);
                                if(insertResult) {
                                    if (insertResult.affectedRows > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'UserDetails save successfully';
                                        responseMessage.data = {
                                            first_name: req.body.first_name,
                                            last_name: req.body.last_name,
                                            company_name: req.body.company_name,
                                            job_title: req.body.job_title,
                                            gender: req.body.gender,
                                            dob: req.body.dob,
                                            company_tagline: req.body.company_tagline,
                                            email: req.body.email,
                                            ve: req.body.ve ? parseInt(req.body.ve) : 1,
                                            vm: req.body.vm ? parseInt(req.body.vm) : 1,
                                            vp: req.body.vp ? parseInt(req.body.vp) : 1,
                                            va: req.body.va ? parseInt(req.body.va) : 1,
                                            loc_title: req.body.loc_title ? req.body.loc_title : '',
                                            lat: req.body.lat ? req.body.lat : '',
                                            lng: req.body.lng ? req.body.lng : '',
                                            address_line1: req.body.address_line1 ? req.body.address_line1 : '',
                                            address_line2: req.body.address_line2 ? req.body.address_line2 : '',
                                            city: req.body.city ? req.body.city : '',
                                            state_id: req.body.state_id ? parseInt(req.body.state_id) : 0,
                                            country_id: req.body.country_id ? parseInt(req.body.country_id) : 0,
                                            postal_code: req.body.postal_code ? req.body.postal_code : '',
                                            ph: req.body.ph ? req.body.ph : '',
                                            mn: req.body.mn ? req.body.mn : '',
                                            website: req.body.website ? req.body.website : '',
                                            isd_phone: req.body.isd_phone ? req.body.isd_phone : '',
                                            isd_mobile: req.body.isd_mobile ? req.body.isd_mobile : '',
                                            parking_status: req.body.parking_status ? req.body.parking_status : '',
                                            template_id: req.body.template_id ? parseInt(req.body.template_id) : '',
                                            pin: req.body.pin ? parseInt(req.body.pin) : null,
                                            keywords: req.body.keywords ? req.body.keywords : '',
                                            about_company: req.body.about_company ? req.body.about_company : ''

                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveUserDetails: UserDetails save successfully');

                                        var queryParams1 = st.db.escape(pin) + ',' + st.db.escape('') + ',' + st.db.escape(token);
                                        var query1 = 'CALL pupdateEZEoneKeywords(' + queryParams1 + ')';
                                        //console.log(query1);
                                        st.db.query(query1, function (err, getResult) {
                                            if (!err) {
                                                console.log('FnUpdateEZEoneKeywords: Keywords Updated successfully');
                                            }
                                            else {
                                                console.log('FnUpdateEZEoneKeywords: Keywords Not Updated');
                                            }
                                        });
                                    }
                                    else {
                                        responseMessage.message = 'UserDetails is not saved';
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveUserDetails:UserDetails is not saved');
                                    }
                                }
                                else {
                                    responseMessage.message = 'UserDetails is not saved';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveUserDetails:UserDetails is not saved');
                                }
                            }

                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSaveUserDetails: error in saving UserDetails :' + err);
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
                        console.log('FnSaveUserDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveUserDetails:Error in validating Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnSaveUserDetails ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetUserDetailsNew
 * @method GET
 * @param req
 * @param res
 * @param next
 *
 * @request-param token* <string>
 */
User.prototype.getUserDetailsNew = function(req,res,next){
    var token = req.query.token;

    var respMsg = {
        status : false,
        message : 'An error occurred ! Please try again',
        data : null,
        error : {
            token : 'Invalid token'
        }
    };

    if(!token){
        res.status(401).json({ status : false, data : null, message : 'Unauthorized ! Please login to continue',error : {
            token : 'Invalid token'
        }});
    }
    else{
        try{
            st.validateToken(token,function(err,tokenRes){
                if(!err){
                    if(tokenRes){
                        var queryString = 'CALL pgetuserdetails('+st.db.escape(token) + ')';
                        st.db.query(queryString,function(err,results){
                            if(!err){
                                if(results){
                                    if(results[0]){
                                        if(results[0][0]){
                                            respMsg.status = true;
                                            respMsg.error = null;
                                            respMsg.message = 'User details loaded successfully';
                                            results[0][0].Password = undefined;
                                            respMsg.data = results[0][0];
                                            res.status(200).json(respMsg);
                                        }
                                        else{
                                            respMsg.status = false;
                                            respMsg.error = null;
                                            respMsg.message = 'No such user is available';
                                            respMsg.data = results;
                                            res.status(200).json(respMsg);
                                        }
                                    }
                                    else{
                                        respMsg.status = false;
                                        respMsg.error = null;
                                        respMsg.message = 'No such user is available';
                                        respMsg.data = results;
                                        res.status(200).json(respMsg);
                                    }

                                }
                                else{
                                    respMsg.status = false;
                                    respMsg.error = null;
                                    respMsg.message = 'No such user is available';
                                    respMsg.data = results;
                                    res.status(200).json(respMsg);
                                }
                            }
                            else{
                                console.log('getUserDetailsNew : error');
                                console.log(err);
                                res.status(200).json(respMsg);
                            }
                        });
                    }
                    else{
                        res.status(401).json({ status : false, data : null, message : 'Unauthorized ! Please login to continue',error : {
                            token : 'Invalid token'
                        }});
                    }
                }
                else{
                    console.log('getUserDetailsNew : error');
                    console.log(err);
                    res.status(500).json({ status : false, data : null, message : 'Unauthorized ! Please login to continue',error : {
                        token : 'Invalid token'
                    }});
                }
            });
        }
        catch(ex){
            console.log('Exception - getUserDetailsNew ');
            console.log(ex);
            res.status(500).json({ status : false, data : null, message : 'Unauthorized ! Please login to continue',error : {
                token : 'Invalid token'
            }});
        }

    }
};

/**
 * @todo FnSendResume
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for send resume
 */
User.prototype.sendResume = function(req,res,next){
    var _this = this;

    var token = req.body.token;
    var cvid = (!isNaN(parseInt(req.body.cvid))) ? parseInt(req.body.cvid):0;
    var ezeid =  alterEzeoneId(req.body.ezeid);
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };

    var validateStatus = true,error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!cvid){
        error['cvid'] = 'Invalid cvid';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token)+ ',' + st.db.escape(cvid)+','+st.db.escape(ezeid);
                        var query = 'CALL pSendResume(' + queryParams + ')';
                        st.db.query(query, function (err, insertResult) {
                            if (!err) {
                                if(insertResult) {
                                    if (insertResult.affectedRows > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Resume Send successfully';
                                        responseMessage.data = {
                                            cvid: cvid,
                                            ezeid:ezeid
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnSendResume: Resume send successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Resume not send';
                                        res.status(200).json(responseMessage);
                                        console.log('FnSendResume:Resume not send');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Resume not send';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSendResume:Resume not send');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSendResume: error in getting send resume:' + err);
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
                        console.log('FnSendResume: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSendResume:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSendResume ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnDownloadResume
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for download resume
 */
User.prototype.downloadResume = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var id = parseInt(req.query.id);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!id){
        error['id'] = 'Invalid id';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(id);
                        var query = 'CALL pdownloadresume(' + queryParams + ')';
                        st.db.query(query, function (err, getResume) {
                            if (!err) {
                                if(getResume) {
                                    if (getResume[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Resume Downloaded successfully';
                                        responseMessage.data = getResume[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnDownloadResume: Resume Downloaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Resume not Downloaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnDownloadResume:Resume not Downloaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Resume not Downloaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnDownloadResume:Resume not Downloaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnDownloadResume: error in getting download resume:' + err);
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
                        console.log('FnDownloadResume: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnDownloadResume:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnDownloadResume ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetConveyanceReport
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get conveyance report
 */
User.prototype.getConveyanceReport = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var startDate = req.query.s_date;
    var endDate = req.query.e_date;
    var pdfcontent='',data1,total=0;

    var path = require('path');


    var sDate = startDate.split('-');
    sDate = sDate[2] + '-' + sDate[1]+ '-' + sDate[0];
    var eDate = endDate.split('-');
    eDate = eDate[2] + '-' + eDate[1]+ '-' + eDate[0];


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(startDate)+ ',' + st.db.escape(endDate);
                        var query = 'CALL pgetConveyanceReport(' + queryParams + ')';
                        st.db.query(query, function (err, getresult) {
                            //console.log(getresult[0]);
                            if (!err) {
                                if(getresult) {
                                    if (getresult[0]) {

                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Reports Loaded successfully';
                                        responseMessage.data = getresult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetConveyanceReport: Reports Loaded successfully');

                                        //making pdf doc for conveyance report

                                        var pdf = require('html-pdf');
                                        var options = {
                                            size: 'A1',
                                            layout: 'landscape'
                                        };

                                        var loopFunction = function (i, header) {

                                            if (i < getresult[0].length) {
                                                console.log('loop function..');
                                                var file = path.join(__dirname, '../../mail/templates/report_new.html');

                                                fs.readFile(file, "utf8", function (err, data) {

                                                    if (header) {
                                                        data1 = header;
                                                        //console.log(data1);
                                                    }
                                                    else {
                                                        data1 = '';
                                                    }

                                                    data = data.replace("[sl.no]", i + 1);
                                                    data = data.replace("[Date]", getresult[0][i].taskdatetime);
                                                    if (getresult[0][i].ActionTitle != ' ') {
                                                        data = data.replace("[Task]", getresult[0][i].ActionTitle);
                                                    }
                                                    else {
                                                        data = data.replace("[Task]", '-');
                                                    }

                                                    data = data.replace("[Particulars]", getresult[0][i].particulars);

                                                    if (getresult[0][i].clientname) {
                                                        data = data.replace("[Client]", getresult[0][i].clientname);
                                                    }
                                                    else {
                                                        data = data.replace("[Client]", '-');
                                                    }
                                                    if (getresult[0][i].contactname) {
                                                        data = data.replace("[Contact]", getresult[0][i].contactname);
                                                    }
                                                    else {
                                                        data = data.replace("[Contact]", '-');
                                                    }
                                                    data = data.replace("[Amount]", getresult[0][i].amount);
                                                    data = data.replace("[CreatedBy]", getresult[0][i].createduser);

                                                    var users = (getresult[0][i].additionalusers).split(',');

                                                    var addusers = '';
                                                    if (users.length) {
                                                        for (var j = 0; j < users.length; j++) {

                                                            addusers = users[j] + ', ' + addusers;

                                                        }
                                                    }
                                                    else {
                                                        addusers = getresult[0][i].additionalusers;
                                                    }
                                                    data = data.replace("[AddtionalUsers]", addusers);

                                                    total = total + getresult[0][i].amount;
                                                    data = data.replace("[total]", total);


                                                    fs.writeFile('./conveyance_report/conveyanceReport.html', data, function (err) {
                                                        if (!err) {
                                                            fs.exists('./conveyance_report/conveyanceReport.html', function (exists) {
                                                                if (exists) {
                                                                    fs.readFile('./conveyance_report/conveyanceReport.html', "utf8", function (err, dataResult) {
                                                                        if (!err) {
                                                                            if (dataResult) {

                                                                                if (data1) {
                                                                                    pdfcontent = data1;
                                                                                    pdfcontent += dataResult;
                                                                                }
                                                                                else {
                                                                                    pdfcontent += dataResult;
                                                                                }

                                                                                i = i + 1;
                                                                                loopFunction(i);

                                                                            }
                                                                            else {
                                                                                console.log('dataContent is not loaded');
                                                                            }
                                                                        }
                                                                        else {
                                                                            console.log(err);
                                                                            console.log('Error in file reading');
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    console.log('file doesnt exists');
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            console.log(err);
                                                            console.log('Error in file writting');
                                                        }
                                                    });
                                                });
                                            }
                                            else {
                                                //fs.unlinkSync('./conveyance_report/conveyanceReport.html');
                                                fs.writeFile('./conveyance_report/conveyanceReport1.html', pdfcontent, function (err) {
                                                    if (!err) {
                                                        var files = path.join(__dirname, '../../mail/templates/report_total.html');
                                                        fs.readFile(files, "utf8", function (err, totalResult) {
                                                            if (!err) {

                                                                totalResult = totalResult.replace("[total]", total);

                                                                pdfcontent += totalResult;
                                                                generatePdf(pdfcontent);
                                                            }
                                                            else {
                                                                console.log('file reading error:' + err);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        };

                                        var generatePdf = function (pdfContent) {

                                            pdf.create(pdfcontent, options).toFile('./conveyance_report/conveyance-report.pdf', function (err, res) {
                                                if (err) return console.log(err);
                                                console.log('pdf converted successfully');
                                            });
                                        };

                                        if (getresult[0].length > 0) {
                                            console.log('call loop function..');
                                            var i = 0;
                                            var file = path.join(__dirname, '../../mail/templates/report_header.html');

                                            fs.readFile(file, "utf8", function (err, header) {

                                                header = header.replace("[StartDate]", sDate);
                                                header = header.replace("[EndDate]", eDate);
                                                header = header.replace("[ezeone]", '@SGOWRI2');

                                                loopFunction(i, header);
                                            });
                                        }


                                    }
                                    else {
                                        responseMessage.message = 'Reports not Loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetConveyanceReport:Reports not Loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Reports not Loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetConveyanceReport:Reports not Loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetConveyanceReport: error in getting Reports:' + err);
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
                        console.log('FnGetConveyanceReport: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetConveyanceReport:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetConveyanceReport ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.getindustryType = function(req,res,next) {
    /**
     * @todo FnGetindustryType
     */
    var _this = this;
    var responseMsg = {
        status: false,
        data: [],
        message: 'Unable to load skills ! Please try again',
        error: {
            server: 'An internal server error'
        }
    };

    try {

        st.db.query('CALL pGetindustryType()', function (err, industrytypeResult) {
            if (!err) {
                if(industrytypeResult) {
                    if(industrytypeResult[0]) {
                        responseMsg.status = true;
                        responseMsg.message = 'industryType loaded successfully';
                        responseMsg.error = null;
                        responseMsg.data = industrytypeResult[0];
                        res.status(200).json(responseMsg);
                    }
                    else {
                        console.log('FnGetindustryType: Unable to load skills');
                        res.status(200).json(responseMsg);
                    }
                }
                else {
                    console.log('FnGetindustryType: Unable to load skills');
                    res.status(200).json(responseMsg);
                }
            }
            else {
                console.log('Error : FnGetindustryType: '+err);
                res.status(500).json(responseMsg);
            }
        });
    }
    catch (ex) {
        res.status(500).json(responseMsg);
        console.log('Error : FnGetindustryType ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }

};

/**
 * @todo FnGetindustrycategory
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get industry category
 */
User.prototype.getindustrycategory = function(req,res,next){
    var _this = this;

    var industryId = req.query.iid;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    try {

        var queryParams = st.db.escape(industryId) ;
        var query = 'CALL Pgetindustrycategory(' + queryParams + ')';
        //console.log(query);
        st.db.query(query, function (err, getResult) {
            //console.log(getResult);
            if (!err) {
                if (getResult) {
                    if (getResult[0]) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Industry Category loaded sucessfully';
                        responseMessage.data = getResult[0];
                        res.status(200).json(responseMessage);
                        console.log('FnGetindustrycategory: Industry Category loaded sucessfully');
                    }
                    else {
                        responseMessage.message = 'Industry Category is not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetindustrycategory:Industry Category is not loaded');
                    }
                }
                else {
                    responseMessage.message = 'Industry Category is not loaded';
                    res.status(200).json(responseMessage);
                    console.log('FnGetindustrycategory:Industry Category is not loaded');
                }
            }
            else {
                responseMessage.message = 'An error occured ! Please try again';
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                res.status(500).json(responseMessage);
                console.log('FnGetindustrycategory: error in getting Industry Category :' + err);
            }
        });
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server Error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(500).json(responseMessage);
        console.log('Error : FnGetindustrycategory ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }

};


/**
 * @todo FnProfilePicForEzeid
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get Profile Pic For Ezeid
 */
User.prototype.profilePicForEzeid = function(req,res,next){

    var _this = this;

    var ezeid = alterEzeoneId(req.query.ezeid);

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: {s_url:''}
    };

    var validateStatus = true,error = {};


    if(!ezeid){
        error['ezeid'] = 'Invalid ezeid';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var query = 'Select EZEID,TID from tmaster where EZEID=' + st.db.escape(ezeid);
            console.log(query);
            st.db.query(query, function (err, EzediExitsResult) {
                if (!err) {
                    if (EzediExitsResult) {
                        if(EzediExitsResult[0]) {
                                var query1 = "select ifnull((SELECT image FROM t_docsandurls where masterid=" + EzediExitsResult[0].TID + " AND tag='PIC' LIMIT 0,1),'') as picture from tmaster where tid=" + EzediExitsResult[0].TID;
                                st.db.query(query1, function (err, imageResult) {
                                    if (!err) {
                                        if(imageResult) {
                                            if (imageResult[0]) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Profile Picture loaded successfully';
                                                imageResult[0].picture = (imageResult[0].picture) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + imageResult[0].picture) : '';
                                                responseMessage.data = {s_url: imageResult[0].picture};

                                                res.status(200).json(responseMessage);
                                                console.log('FnProfilePicForEzeid: Profile Picture loaded successfully');
                                            }
                                            else {
                                                responseMessage.message = 'Profile Picture not loaded';
                                                res.status(200).json(responseMessage);
                                                console.log('FnProfilePicForEzeid: Profile Picture not loaded');
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'Profile Picture not loaded';
                                            res.status(200).json(responseMessage);
                                            console.log('FnProfilePicForEzeid: Profile Picture not loaded');
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'An error occured in query ! Please try again';
                                        responseMessage.error = {
                                            server: 'Internal Server Error'
                                        };
                                        res.status(500).json(responseMessage);
                                        console.log('FnProfilePicForEzeid: error in getting Profile Picture :' + err);
                                    }
                                });

                        }
                        else {
                            responseMessage.message = 'ezeid is not valid';
                            res.status(200).json(responseMessage);
                            console.log('FnProfilePicForEzeid: ezeid is not valid1');
                        }
                    }
                    else {
                        responseMessage.message = 'ezeid is not valid';
                        res.status(200).json(responseMessage);
                        console.log('FnProfilePicForEzeid: ezeid is not valid2');
                    }
                }
                else {
                    responseMessage.message = 'An error occured in query ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnProfilePicForEzeid: error in getting ezeid :' + err);
                }

            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnProfilePicForEzeid ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

module.exports = User;
