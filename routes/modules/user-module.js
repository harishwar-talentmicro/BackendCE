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
"use strict";

var path ='D:\\EZEIDBanner\\';
var EZEIDEmail = 'noreply@ezeone.com';
var moment = require('moment');

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

        var cipher = crypto.createCipher(algorithm, key)
        var crypted = cipher.update(Password, 'utf8', 'hex')
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
        var decipher = crypto.createDecipher(algorithm,password)
        var dec = decipher.update(EncryptPassword,'hex','utf8')
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
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.register = function(req,res,next){
    /**
     * @todo FnRegistration
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        //console.log(req._remoteAddress);
        //console.log('---------------------------');
        var OperationType = req.body.OperationType;
        console.log('--------------------------------------------');
        console.log(OperationType);
        console.log('--------------------------------------------');
        var IPAddress = req._remoteAddress;
        var SelectionTypes = parseInt(req.body.SelectionType);
        if(SelectionTypes.toString() == 'NaN'){
            SelectionTypes = 0;
        }
        console.log(SelectionTypes);
        var IDTypeID = req.body.IDTypeID;
        var EZEID = alterEzeoneId(req.body.EZEID);
        if(EZEID != null)
            EZEID = EZEID.toUpperCase();
        var Password = req.body.Password;
        var FirstName = req.body.FirstName;
        var LastName = req.body.LastName;
        var CompanyName = req.body.CompanyName;
        var JobTitle = req.body.JobTitle;
        var CategoryID = parseInt(req.body.CategoryID);
        if (CategoryID.toString() == 'NaN') {
            CategoryID = 0;
        }
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
        //var LaptopSLNO = req.body.LaptopSLNO;
        //var VehicleNumber = req.body.VehicleNumber;
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
        var ParkingStatus = req.body.ParkingStatus;
        var Gender = parseInt(req.body.Gender);
        var DOB = req.body.DOB;
        if(Gender.toString() == 'NaN')
            Gender = 2;

        if (PIN == '') {
            PIN = null;
        }
        var TemplateID = parseInt(req.body.TemplateID);
        if(TemplateID.toString() == 'NaN')
            TemplateID =0;

        var RtnMessage = {
            Token: '',
            IsAuthenticate: false,
            FirstName: '',
            Type: 0,
            Icon: ''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        console.log(OperationType);
        if(parseInt(OperationType) == 1){
            console.log('----------req.body for Operation type 1--------------');
            console.log(req.body);
            if( IDTypeID != null && EZEID != null && Password != null ){
                if(FirstName == null)
                    FirstName='';
                if (LastName == null) {
                    LastName = '';
                }
                if (StateID == null || StateID == '') {
                    StateID = 0;
                }
                if (CountryID == null || CountryID == '') {
                    CountryID = 0;
                }

                //if (Operation == 'I') {
                //    TokenNo = st.generateToken();
                //}
                var EncryptPWD = '';
                if (Password != null) {
                    EncryptPWD = hashPassword(Password);
                }
                var DOBDate = null;
                console.log(EZEID.toUpperCase());
                if (DOB != null && DOB != '') {
                    // datechange = new Date(new Date(TaskDateTime).toUTCString());
                    DOBDate = new Date(DOB);
                    // console.log(TaskDate);
                }
                var InsertQuery = st.db.escape(IDTypeID) + ',' + st.db.escape(EZEID) + ',' + st.db.escape(EncryptPWD) + ',' + st.db.escape(FirstName) + ',' +
                    st.db.escape(LastName) + ',' + st.db.escape(CompanyName) + ',' + st.db.escape(JobTitle) + ',' + st.db.escape(FunctionID) + ',' +
                    st.db.escape(RoleID) + ',' + st.db.escape(LanguageID) + ',' + st.db.escape(NameTitleID) + ',' +
                    st.db.escape(TokenNo) + ',' + st.db.escape(Latitude) + ',' + st.db.escape(Longitude) + ',' + st.db.escape(Altitude) + ',' +
                    st.db.escape(AddressLine1) + ',' + st.db.escape(AddressLine2) + ',' + st.db.escape(Citytitle) + ',' + st.db.escape(StateID) + ',' + st.db.escape(CountryID) + ',' +
                    st.db.escape(PostalCode) + ',' + st.db.escape(PIN) + ',' + st.db.escape(PhoneNumber) + ',' + st.db.escape(MobileNumber) + ',' + st.db.escape(EMailID) + ',' +
                    st.db.escape(Picture) + ',' + st.db.escape(PictureFileName) + ',' + st.db.escape(WebSite) + ',' + st.db.escape(Operation) + ',' + st.db.escape(AboutCompany) + ','
                    + st.db.escape(StatusID) + ',' + st.db.escape(Icon) + ',' + st.db.escape(IconFileName) + ',' + st.db.escape(ISDPhoneNumber) + ',' + st.db.escape(ISDMobileNumber) + ','
                    + st.db.escape(Gender) + ',' + st.db.escape(DOBDate) + ',' + st.db.escape(IPAddress) + ',' + st.db.escape(SelectionTypes) + ',' + st.db.escape(ParkingStatus)+ ',' + st.db.escape(TemplateID)  + ',' + st.db.escape(CategoryID);


                console.log(InsertQuery);

                st.db.query('CALL pSaveEZEIDData(' + InsertQuery + ')', function (err, InsertResult) {
                    if (!err) {
                        console.log('InsertResult: ');
                        console.log( InsertResult);
                        if (InsertResult != null) {
                            if(InsertResult[0]){
                                if (InsertResult[0].length > 0) {
                                    var RegResult = InsertResult[0];
                                    if(RegResult[0].TID != 0)
                                    {
                                        if(IDTypeID == 2)
                                            RtnMessage.FirstName=CompanyName;
                                        else
                                            RtnMessage.FirstName = FirstName;

                                        RtnMessage.IsAuthenticate = true;
                                        RtnMessage.Token = TokenNo;
                                        RtnMessage.Type = IDTypeID;
                                        RtnMessage.Icon = Icon;
                                        if (CompanyName == null)
                                            CompanyName='';
                                        if (Operation == 'I') {
                                            console.log('FnRegistration:tmaster: Registration success');
                                            //res.send(RtnMessage);
                                            if (EMailID != '' && EMailID != null) {
                                                var Templatefilename = null;
                                                if(IDTypeID == 1)
                                                    Templatefilename="RegTemplate.txt";
                                                else if(IDTypeID == 2)
                                                    Templatefilename = "RegBussinessTemplate.txt";
                                                else
                                                    Templatefilename = "RegPublicTemplate.txt";

                                                var fs = require('fs');
                                                fs.readFile(Templatefilename, "utf8", function (err, data) {
                                                    if (err) throw err;
                                                    data = data.replace("[Firstname]", FirstName);
                                                    data = data.replace("[Lastname]", LastName);
                                                    data = data.replace("[EZEID]", EZEID);
                                                    data = data.replace("[EZEID]", EZEID);  //REG Detials
                                                    data = data.replace("[EZEID]", EZEID); //L1
                                                    data = data.replace("[EZEID]", EZEID); //L2
                                                    data = data.replace("[EZEID]", EZEID); //CV
                                                    data = data.replace("[EZEID]", EZEID); //ID
                                                    data = data.replace("[EZEID]", EZEID); //DL
                                                    data = data.replace("[EZEID]", EZEID); //PP
                                                    data = data.replace("[CompanyName]",CompanyName);

                                                    if(PIN == null){
                                                        data = data.replace(".PIN","");
                                                    }
                                                    else
                                                    {
                                                        data = data.replace("PIN",PIN);
                                                    }

                                                    //  console.log(data);
                                                    var mailOptions = {
                                                        from: 'noreply@ezeid.com',
                                                        to: EMailID,
                                                        subject: 'Welcome to EZEID',
                                                        html: data // html body
                                                    };
                                                    //console.log('Mail Option:' + mailOptions);
                                                    // send mail with defined transport object
                                                    var post = { MessageType: 8, Priority: 3,ToMailID: mailOptions.to, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID:RegResult[0].TID };
                                                    // console.log(post);
                                                    var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                        // Neat!
                                                        if (!err) {
                                                            console.log('FnRegistration: Mail saved Successfully');
                                                        }
                                                        else {
                                                            console.log('FnRegistration: Mail not Saved Successfully' + err);

                                                        }
                                                        if (Operation == 'I') {
                                                            var ip =  req.headers['x-forwarded-for'] ||
                                                                req.connection.remoteAddress ||
                                                                req.socket.remoteAddress ||
                                                                req.connection.socket.remoteAddress;
                                                            var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';

                                                            st.generateToken(ip,userAgent,EZEID,function(err,token){
                                                                if(err){
                                                                    console.log('FnRegistration: Token Generation Error' + err);
                                                                }
                                                                else{
                                                                    RtnMessage.Token = token;
                                                                }
                                                                res.send(RtnMessage);
                                                            });
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
                                    else
                                    {
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
            else
            {
                console.log('FnRegistration: Wizard Insertion Failed');
                if(IDTypeID == null ) {
                    console.log('FnRegistration: IDTypeID is Empty');
                }
                else if(EZEID == null){
                    console.log('FnRegistration: EZEID is Empty');
                }
                else if(Password == null) {
                    console.log('FnRegistration: Password is Empty');
                }

                console.log('Insert method validation');
                console.log('Mandatory fields required');
                res.statusCode = 400;
                res.send(RtnMessage);
            }
        }
        else
        {
            console.log('----------req.body for Operation type other than 1--------------');
            console.log(req.body);
            if (IDTypeID != null && EZEID != null && AddressLine1 != null && Citytitle != null && StateID != null && CountryID != null && PostalCode != null  && Gender.toString() != 'NaN') {
                if (LastName == null) {
                    LastName = '';
                }
                if (StateID == null || StateID == '') {
                    StateID = 0;
                }
                if (CountryID == null || CountryID == '') {
                    CountryID = 0;
                }

                //if (Operation == 'I') {
                //    TokenNo = st.generateToken();
                //}
                var EncryptPWD = '';
                if (Password != null) {
                    EncryptPWD = hashPassword(Password);
                }
                var DOBDate = null;
                console.log(EZEID.toUpperCase());
                if (DOB != null && DOB != '') {
                    // datechange = new Date(new Date(TaskDateTime).toUTCString());
                    DOBDate = new Date(DOB);
                    // console.log(TaskDate);
                }
                //console.log('FnRegistration: Token: ' + TokenNo);
                var InsertQuery = st.db.escape(IDTypeID) + ',' + st.db.escape(EZEID) + ',' + st.db.escape(EncryptPWD) + ',' + st.db.escape(FirstName) + ',' +
                    st.db.escape(LastName) + ',' + st.db.escape(CompanyName) + ',' + st.db.escape(JobTitle) + ',' + st.db.escape(FunctionID) + ',' +
                    st.db.escape(RoleID) + ',' + st.db.escape(LanguageID) + ',' + st.db.escape(NameTitleID) + ',' +
                    st.db.escape(TokenNo) + ',' + st.db.escape(Latitude) + ',' + st.db.escape(Longitude) + ',' + st.db.escape(Altitude) + ',' +
                    st.db.escape(AddressLine1) + ',' + st.db.escape(AddressLine2) + ',' + st.db.escape(Citytitle) + ',' + st.db.escape(StateID) + ',' + st.db.escape(CountryID) + ',' +
                    st.db.escape(PostalCode) + ',' + st.db.escape(PIN) + ',' + st.db.escape(PhoneNumber) + ',' + st.db.escape(MobileNumber) + ',' + st.db.escape(EMailID) + ',' +
                    st.db.escape(Picture) + ',' + st.db.escape(PictureFileName) + ',' + st.db.escape(WebSite) + ',' + st.db.escape(Operation) + ',' + st.db.escape(AboutCompany)
                    + ',' + st.db.escape(StatusID) + ',' + st.db.escape(Icon) + ',' + st.db.escape(IconFileName) + ',' + st.db.escape(ISDPhoneNumber) + ',' + st.db.escape(ISDMobileNumber)
                    + ',' + st.db.escape(Gender) + ',' + st.db.escape(DOBDate) + ',' + st.db.escape(IPAddress) + ',' + st.db.escape(SelectionTypes)+ ',' + st.db.escape(ParkingStatus) + ',' + st.db.escape(TemplateID) + ',' + st.db.escape(CategoryID);

                // console.log(InsertQuery);
                st.db.query('CALL pSaveEZEIDData(' + InsertQuery + ')', function (err, InsertResult) {
                    if (!err) {
                        // console.log('InsertResult: ' + InsertResult);
                        if (InsertResult) {
                            //  console.log(InsertResult);
                            if(InsertResult[0]){
                                if (InsertResult[0].length > 0) {
                                    var RegResult = InsertResult[0];
                                    if(RegResult[0].TID != 0)
                                    {
                                        if(IDTypeID == 2)
                                            RtnMessage.FirstName=CompanyName;
                                        else
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
                                                    data = data.replace("[EZEID]", EZEID);  //REG Detials
                                                    data = data.replace("[EZEID]", EZEID); //L1
                                                    data = data.replace("[EZEID]", EZEID); //L2
                                                    data = data.replace("[EZEID]", EZEID); //CV
                                                    data = data.replace("[EZEID]", EZEID); //ID
                                                    data = data.replace("[EZEID]", EZEID); //DL
                                                    data = data.replace("[EZEID]", EZEID); //PP

                                                    if(PIN == null){
                                                        data = data.replace(".PIN","");
                                                    }
                                                    else
                                                    {
                                                        data = data.replace("PIN",PIN);
                                                    }

                                                    //  console.log(data);
                                                    var mailOptions = {
                                                        from: 'noreply@ezeid.com',
                                                        to: EMailID,
                                                        subject: 'Welcome to EZEID',
                                                        html: data // html body
                                                    };
                                                    //console.log('Mail Option:' + mailOptions);
                                                    // send mail with defined transport object
                                                    var post = { MessageType: 8, Priority: 3, ToMailID: mailOptions.to, Subject: mailOptions.subject, Body: mailOptions.html, SentbyMasterID:RegResult[0].TID };
                                                    // console.log(post);
                                                    var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                        // Neat!
                                                        if (!err) {
                                                            console.log('FnRegistration: Mail saved Successfully');
                                                        }
                                                        else {
                                                            console.log('FnRegistration: Mail not Saved Successfully' + err);
                                                        }

                                                        var ip =  req.headers['x-forwarded-for'] ||
                                                            req.connection.remoteAddress ||
                                                            req.socket.remoteAddress ||
                                                            req.connection.socket.remoteAddress;
                                                        var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';

                                                        st.generateToken(ip,userAgent,EZEID,function(err,token) {
                                                            if (err) {
                                                                console.log('FnRegistration: Token Generation Error' + err);
                                                            }
                                                            else {
                                                                RtnMessage.Token = token;
                                                            }
                                                            res.send(RtnMessage);
                                                        });

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
                                else{
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnRegistration:tmaster: Registration Failed');
                                }
                            }

                            else{
                                console.log(RtnMessage);
                                res.send(RtnMessage);
                                console.log('FnRegistration:tmaster: Registration Failed');
                            }
                        }
                        else{
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
                console.log('Update method validation');
                if (IDTypeID == null) {
                    console.log('FnRegistration: IDTypeID is empty');
                } else if (EZEID == null) {
                    console.log('FnRegistration: EZEID is empty');
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
                }
                else if (Gender.toString() == 'NaN') {
                    console.log('FnRegistration: Gender is empty')
                }
                res.statusCode = 400;
                res.send(RtnMessage);
                console.log('FnRegistration:tmaster: Manditatory field empty');
            }
        }

    }
    catch (ex) {
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnRegistration error:' + ex.description);
        //throw new Error(ex);
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.login = function(req,res,next){
    /**
     * @todo FnLogin
     *
     */

    try {
        //res.setHeader("Access-Control-Allow-Origin", "*");
        //res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        //res.setHeader('content-type', 'application/json');
        var UserName = alterEzeoneId(req.body.UserName);
        var Password = req.body.Password;
        var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';
        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        var RtnMessage = {
            Token: '',
            TID:'',
            IsAuthenticate: false,
            ezeone_id:'',
            FirstName: '',
            Type: 0,
            Icon: '',
            Verified: 0,
            SalesModuleTitle: '',
            AppointmentModuleTitle: '',
            HomeDeliveryModuleTitle : '',
            ServiceModuleTitle: '',
            CVModuleTitle: '',
            SalesFormMsg: '',
            ReservationFormMsg: '',
            HomeDeliveryFormMsg: '',
            ServiceFormMsg: '',
            CVFormMsg: '',
            SalesItemListType: '',
            RefreshInterval:'',
            MasterID: 0,
            UserModuleRights: '',
            VisibleModules: '',
            FreshersAccepted: '',
            HomeDeliveryItemListType : '',
            PersonalEZEID:'',
            ReservationDisplayFormat:'',
            mobilenumber:'',
            ISPrimaryLocAdded:''

        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (UserName != null && UserName != '' && Password != null && Password != '') {

            var FindArray = UserName.split('.');

            //console.log('findarray: ' + FindArray.length);

            var Query = st.db.escape(UserName);
            console.log(Query);
            st.db.query('CALL PLoginNew(' + Query + ')', function (err, loginResult) {
                //console.log(loginResult);
                if (!err) {
                    if(loginResult && Password) {
                        if (loginResult[0].length > 0) {
                            // console.log('loginResult: ' + loginResult);
                            //var Encrypt = st.generateToken();


                            var loginDetails = loginResult[0];

                            console.log(loginDetails);

                            if(comparePassword(Password,loginDetails[0].Password)){
                                st.generateToken(ip,userAgent,UserName,function (err, TokenResult) {
                                    if (!err) {
                                       // console.log(TokenResult);

                                        if (TokenResult) {
                                            //res.setHeader('Cookie','Token='+Encrypt);
                                            // console.log(loginDetails[0]);
                                            res.cookie('Token', TokenResult, { maxAge: 900000, httpOnly: true });
                                            RtnMessage.Token = TokenResult;
                                            RtnMessage.IsAuthenticate = true;
                                            RtnMessage.TID = loginDetails[0].TID;
                                            RtnMessage.ezeone_id = loginDetails[0].EZEID;
                                            RtnMessage.FirstName = loginDetails[0].FirstName;
                                            RtnMessage.CompanyName = loginDetails[0].CompanyName;
                                            RtnMessage.Type = loginDetails[0].IDTypeID;
                                            RtnMessage.Icon = loginDetails[0].Icon;
                                            RtnMessage.Verified = loginDetails[0].EZEIDVerifiedID;
                                            RtnMessage.SalesModueTitle = loginDetails[0].SalesModueTitle;
                                            RtnMessage.SalesModuleTitle = loginDetails[0].SalesModuleTitle;
                                            RtnMessage.AppointmentModuleTitle = loginDetails[0].AppointmentModuleTitle;
                                            RtnMessage.HomeDeliveryModuleTitle = loginDetails[0].HomeDeliveryModuleTitle;
                                            RtnMessage.ServiceModuleTitle = loginDetails[0].ServiceModuleTitle;
                                            RtnMessage.CVModuleTitle = loginDetails[0].CVModuleTitle;
                                            RtnMessage.SalesFormMsg= loginDetails[0].SalesFormMsg;
                                            RtnMessage.ReservationFormMsg= loginDetails[0].ReservationFormMsg;
                                            RtnMessage.HomeDeliveryFormMsg= loginDetails[0].HomeDeliveryFormMsg;
                                            RtnMessage.ServiceFormMsg= loginDetails[0].ServiceFormMsg;
                                            RtnMessage.CVFormMsg= loginDetails[0].CVFormMsg;
                                            RtnMessage.SalesItemListType= loginDetails[0].SalesItemListType;
                                            RtnMessage.RefreshInterval= loginDetails[0].RefreshInterval;
                                            RtnMessage.UserModuleRights = loginDetails[0].UserModuleRights;
                                            RtnMessage.MasterID= loginDetails[0].ParentMasterID;
                                            RtnMessage.PersonalEZEID= loginDetails[0].PersonalEZEID;
                                            RtnMessage.VisibleModules= loginDetails[0].VisibleModules;
                                            RtnMessage.FreshersAccepted= loginDetails[0].FreshersAccepted;
                                            RtnMessage.HomeDeliveryItemListType = loginDetails[0].HomeDeliveryItemListType;
                                            RtnMessage.ReservationDisplayFormat = loginDetails[0].ReservationDisplayFormat;
                                            RtnMessage.mobilenumber = loginDetails[0].mobilenumber;
                                            RtnMessage.PrimaryLocAdded = loginDetails[0].ISPrimaryLocAdded;
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

                            else{
                                res.send(RtnMessage);
                            }




                            //console.log(loginDetails[0].TID);

                        }

                        else {
                            res.send(RtnMessage);
                            console.log('FnLogin:tmaster: Invalid login credentials');
                        }
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
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log(ex);
        console.log('FnLogin:: error:' + ex.description);

    }
};

/**
 * Password migration is still remaining from here
 */
/**
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
User.prototype.logout = function(req,res,next){
    /**
     * @todo FnLogout
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
            FirstName: '',
            Type: 0,
            Icon: ''
        };

        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (Token != null && Token != '') {

            var Query = 'CALL pLogout('+st.db.escape(Token)+')';
            st.db.query(Query, function (err, result) {
                if (!err) {
                    if(result){
                        console.log(result);
                        /**
                         * @todo Please check if the code is working or not
                         */

                            RtnMessage.IsAuthenticate = false;
                            console.log('FnLogout: tmaster: Logout success');
                            res.clearCookie('Token');
                            res.send(RtnMessage);
                        }
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
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnLogout error:' + ex.description);

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

        if (Token != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        st.db.query('CALL pLoginDetails(' + st.db.escape(Token) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult != null) {
                                    if (GetResult[0].length > 0) {

                                        console.log('FnGetLoginDetails: Login details Send successfully');
                                        res.send(GetResult[0]);
                                    }
                                    else {

                                        console.log('FnGetLoginDetails:No Login details found');
                                        res.json(null);
                                    }
                                }
                                else {

                                    console.log('FnGetLoginDetails:No Login details found');
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
            if (Token == null) {
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
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'Select CountryID, CountryName, ISDCode from  mcountry where LangID=' + st.db.escape(LangID);
            st.db.query(Query, function (err, CountryResult) {
                if (!err) {
                    if (CountryResult.length > 0) {
                        res.send(CountryResult);
                        console.log('FnGetCountry: mcountry: Country sent successfully');
                    }
                    else {
                        res.json(null);
                        console.log('FnGetCountry: mcountry: No Country found');
                    }
                }
                else {
                    res.json(null);
                    res.statusCode = 500;
                    console.log('FnGetCountry: mcountry: ' + err);
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
                    if (StateResult.length > 0) {
                        var Query = 'Select ifnull(ISDCode,"") as ISDCode from  mcountry where CountryID=' + st.db.escape(CountryID);
                        st.db.query(Query, function (err, CountryResult) {
                            if (!err) {
                                if (CountryResult.length) {
                                    // console.log(CountryResult);
                                    //  console.log(CountryResult[0].ISDCode);
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
        if (Token != null && Token != '') {
            st.validateToken(Token, function (err, Result) {
                console.log(err);
                console.log(Result);
                if (!err) {
                    if (Result) {
                        st.db.query('CALL pGetEZEIDDetails(' + st.db.escape(Token) + ')', function (err, UserDetailsResult) {
                            if (!err) {
                                if (UserDetailsResult[0]) {
                                    if (UserDetailsResult[0].length > 0) {
                                        // console.log('FnGetUserDetails: Token: ' + Token);
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
        if (EZEID != null && EZEID != '') {
            var Query = 'Select EZEID from tmaster where EZEID=' + st.db.escape(EZEID);
            st.db.query(Query, function (err, EzediExitsResult) {
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
        if (OldPassword != null && OldPassword != '' && NewPassword != null && NewPassword != '' && TokenNo != null) {
            st.validateToken(TokenNo, function (err, Result) {
                if (!err) {
                    if (Result) {
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
            IsChanged: false
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
                            var UserQuery = 'Select a.TID, ifnull(a.FirstName,"") as FirstName,ifnull(a.LastName,"") as'+
                                ' LastName,ifnull(b.EMailID,"") as EMailID from tmaster a,tlocations b where b.SeqNo=0'+
                                ' and b.EZEID=a.EZEID and a.EZEID=' + st.db.escape(EZEID);
                            //  console.log(UserQuery);
                            st.db.query(UserQuery, function (err, UserResult) {
                                if (!err) {
                                    if(UserResult){
                                        {

                                            //  console.log(UserResult);
                                            UserResult[0].FirstName = (UserResult[0].FirstName) ? UserResult[0].FirstName : 'Anonymous';
                                            UserResult[0].LastName = (UserResult[0].LastName) ? UserResult[0].LastName : ' ';
                                            var fs = require('fs');
                                            fs.readFile("ForgetPasswordTemplate.txt", "utf8", function (err, data) {
                                                if (err) throw err;
                                                var passwordResetLink = req.CONFIG.SCHEME + "://" + req.CONFIG.DOMAIN + "/" +
                                                    req.CONFIG.PASS_RESET_PAGE_LINK + "/" + EZEID + "/" + resetCode
                                                data = data.replace("[Firstname]", UserResult[0].FirstName);
                                                data = data.replace("[Lastname]", UserResult[0].LastName);
                                                data = data.replace("[resetlink]", passwordResetLink);
                                                data = data.replace("[resetlink]", passwordResetLink);

                                                console.log(UserResult);
                                                //console.log('Body:' + data);
                                                var mailOptions = {
                                                    from: EZEIDEmail,
                                                    to: UserResult[0].EMailID,
                                                    subject: 'EZEOne : Password reset request',
                                                    html: data // html body
                                                };

                                                // send mail with defined transport object
                                                //message Type 7 - Forgot password mails service
                                                var post = { MessageType: 7, Priority: 1, ToMailID: mailOptions.to, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: UserResult[0].TID};
                                                console.log(post);
                                                var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                    // Neat!
                                                    if (!err) {
                                                        console.log('FnRegistration: Mail saved Successfully');
                                                        RtnMessage.IsChanged = true;
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
        console.log(req.query);
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
            console.log('CALL pGetTagLine(' + st.db.escape(TID)+ ',' + st.db.escape(Token) + ')');
            st.db.query('CALL pGetTagLine(' + st.db.escape(TID)+ ',' + st.db.escape(Token) + ')', function (err, GetResult) {
                if (!err) {
                    if (GetResult[0]) {
                        if (GetResult[0].length > 0) {
                            RtnMessage.Result=GetResult[0];
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

        if(Token !=  null && CompanyProfile != null){
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var query = st.db.escape(Token)+ ',' + st.db.escape(CompanyProfile);
                        st.db.query('CALL pSaveTagLine(' + query + ')', function (err, InsertResult) {
                            console.log(InsertResult[0]);
                            if (!err) {
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    RtnMessage.Message = 'Inserted successfully';
                                    res.send(RtnMessage);
                                    console.log('FnSaveCompanyProfile:Inserted sucessfully..');
                                }
                                else
                                {
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
            if(Token == null ){
                console.log('FnSaveAboutCompany:Token is empty');
                RtnMessage.Message = 'Token is empty';
            }
            else if(CompanyProfile == null ){
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

        if (Token != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        console.log('CALL pGetWebLink(' + st.db.escape(Token) + ')');
                        st.db.query('CALL pGetWebLink(' + st.db.escape(Token) + ')', function (err, GetResult) {
                            console.log(GetResult);
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0]) {
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
            if (Token == null) {
                console.log('FnGetWebLink: Token is empty');
            }

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
        if(URLNo > 0 && URLNo < 100)
            var URLNumber = URLNo;
        else
            RtnMessage.Message = 'Please Enter a URLNumber 1 t0 99';

        if (Token != null && URL != null && URL != '' && URLNumber != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        console.log(Token,URL,URLNumber);
                        var query = st.db.escape(Token) + ',' + st.db.escape(URL) + ',' + st.db.escape(URLNumber) ;
                        st.db.query('CALL pSaveWebLinks(' + query + ')', function (err, InsertResult) {
                            if (!err){
                                if (InsertResult.affectedRows > 0) {
                                    RtnMessage.IsSuccessfull = true;
                                    RtnMessage.Message ='Save Successfully';
                                    res.send(RtnMessage);
                                    console.log('FnSaveWebLink: Web links save successfully');
                                }
                                else {
                                    console.log('FnSaveWebLink:No save Web links');
                                    RtnMessage.Message ='URLNo is already exists';
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
            if(Token == null) {
                console.log('FnSaveWebLink: Token is empty');
            }
            else if(URL == null && URL == '') {
                console.log('FnSaveWebLink: URL is empty');
            }
            else if (URLNumber == null) {
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
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        //console.log('CALL pDeleteWorkinghours(' + st.db.escape(TID) + ')');
                        st.db.query('CALL pDeleteWebLink(' + st.db.escape(TID) + ')', function (err, deleteResult) {
                            if (!err){
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
        console.log(req.query);
        if (Token != null && EZEID != null ) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var LocSeqNo = 0;
                        var FindArray =EZEID.split('.');
                        if (FindArray.length > 0) {
                            EZEID = FindArray[0];
                            console.log(EZEID);
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
            if (Token == null)
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
        var Token = req.query.TokenNo;

        var responseMessage = {
            status: false,
            data: null,
            skillMatrix : null,
            job_location : null,
            error:{},
            message:''
        };

        if (Token != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        st.db.query('CALL pgetCVInfo(' + st.db.escape(Token) + ')', function (err, MessagesResult) {
                            if (!err) {
                                        console.log(MessagesResult);
                                if (MessagesResult[0]) {
                                    if (MessagesResult[0].length > 0) {

                                        responseMessage.status = true;
                                        responseMessage.data = MessagesResult[0];
                                        responseMessage.skillMatrix = MessagesResult[1];
                                        responseMessage.job_location = MessagesResult[2];
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
                        console.log('FnGetCVInfo: Invalid Token');
                        responseMessage.message = 'invalid token';
                        res.status(401).json(responseMessage);
                    }
                }
                else {
                    console.log('FnGetCVInfo: Token error: ' + err);
                    responseMessage.message = 'error in validating token';
                    res.status(500).json(responseMessage);
                }
            });
        }
        else {

            console.log('FnGetCVInfo: Token is empty');
            responseMessage.message = 'Token is empty';
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
        var ids = req.body.skillsTid;
        var FunctionID = req.body.FunctionID;
        //var RoleID = req.body.RoleID ? req.body.RoleID : 0;
        var KeySkills = req.body.KeySkills;
        //  var CVDoc = req.body.CVDoc;
        // var CVDocFile = req.body.CVDocFile;
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
        var instituteID = req.body.institute_id ? req.body.institute_id : 0;
        var educationID = req.body.education_id ? req.body.education_id : 0;
        var specializationID = req.body.specialization_id ? req.body.specialization_id :0;
        var yearOfPassing = req.body.year_of_passing;
        var aggregateScore = req.body.aggregate_score;
        var institueTitle = req.body.institute_title ? req.body.institute_title : '';

        var expectedSalary = (parseFloat(req.body.exp_salary) !== NaN) ? parseFloat(req.body.exp_salary) : 0.00;

        if(typeof(locationsList) == "string"){
            locationsList = JSON.parse(locationsList);
        }

        //console.log(locationsList);

        if(!locationsList){
            locationsList = [];
        }

        /**
         * Data Conversions
         */
        salary = (parseFloat(salary) !== NaN && salary > 0) ? parseFloat(salary) : 0;
        noticePeriod = (parseInt(noticePeriod) !== NaN && parseInt(noticePeriod) > 0) ? parseInt(noticePeriod) : 0;
        experience = (parseInt(experience) !== NaN && parseInt(experience)) ? parseInt(experience) : 0;
        jobType = (parseInt(jobType) !== NaN && parseInt(jobType) > 0 ) ? parseInt(jobType) : 1;


        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        if (Pin == '') {
                            Pin = null;
                        }

                        var locCount = 0;
                        var locationDetails = locationsList[locCount];


                        var saveResumeDetails = function(){
                            location_id = location_id.substr(0,location_id.length - 1);
                            var queryParams = st.db.escape(FunctionID) + ',' + st.db.escape(KeySkills) + ',' +
                                st.db.escape(Status) + ',' + st.db.escape(Pin) + ',' + st.db.escape(Token) + ',' + st.db.escape(ids)+ ','+
                                st.db.escape(salary) + ',' + st.db.escape(noticePeriod) + ',' + st.db.escape(experience) + ','+
                                st.db.escape(currentEmployeer) + ',' + st.db.escape(currentJobTitle) + ',' + st.db.escape(jobType) + ','+
                                st.db.escape(location_id) + ',' + st.db.escape(categoryID) + ',' + st.db.escape(instituteID)
                                + ',' + st.db.escape(educationID) + ',' + st.db.escape(specializationID) + ',' + st.db.escape(yearOfPassing)
                                + ','+ st.db.escape(aggregateScore)+ ','+ st.db.escape(institueTitle) +',' + st.db.escape(expectedSalary);
                            var query = 'CALL pSaveCVInfo(' + queryParams + ')';
                            console.log(query);
                            st.db.query(query, function (err, InsertResult) {
                                if (!err) {
                                    if (InsertResult[0]) {
                                        var async = require('async');
                                        var count = skillMatrix1.length;
                                        console.log(count);
                                        async.each(skillMatrix1, function iterator(skillDetails,callback) {

                                            count = count -1;
                                            var tid = skillDetails.tid;
                                            var skills = {
                                                skillname: skillDetails.skillname,
                                                expertiseLevel: skillDetails.expertiseLevel,
                                                exp: skillDetails.exp,
                                                active_status: skillDetails.active_status,
                                                cvid: InsertResult[0][0].ID,
                                                tid: skillDetails.tid
                                            };
                                            FnSaveSkills(skills, function (err, Result) {
                                                if (!err) {
                                                    if (Result) {
                                                        resultvalue = Result.SkillID
                                                        var SkillItems = {
                                                            skillID: resultvalue,
                                                            expertlevel: skills.expertiseLevel,
                                                            expyrs: skills.exp,
                                                            skillstatusid: skills.active_status,
                                                            cvid: skills.cvid
                                                        };

                                                        if (parseInt(skills.tid) != 0) {
                                                            var query = st.db.query('UPDATE tskills set ? WHERE TID = ? ',[SkillItems,tid], function (err, result) {
                                                                if (!err) {
                                                                    if (result) {
                                                                        if (result.affectedRows > 0) {
                                                                            console.log('FnupdateSkill: skill matrix Updated successfully');
                                                                        }
                                                                        else {
                                                                            console.log('FnupdateSkill:  skill matrix not updated');
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('FnupdateSkill:  skill matrix not updated')
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('FnupdateSkill: error in saving  skill matrix:' + err);
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            var query = st.db.query('INSERT INTO tskills  SET ?', SkillItems , function (err, result) {
                                                                if (!err) {
                                                                    if (result) {
                                                                        if (result.affectedRows > 0) {
                                                                            console.log('FnSaveCv: skill matrix saved successfully');
                                                                        }
                                                                        else {
                                                                            console.log('FnSaveCv: skill matrix not saved');
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log('FnSaveCv: skill matrix not saved');
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('FnSaveCv: error in saving skill matrix' + err);
                                                                }
                                                            });

                                                        }
                                                    }
                                                    else {
                                                        console.log('FnSaveMessage: Mail not Sent Successfully');
                                                        //res.send(RtnMessage);
                                                    }
                                                }
                                                else {
                                                    console.log('FnSaveMessage:Error in sending mails' + err);
                                                    //res.send(RtnMessage);
                                                }
                                            });
                                        });

                                        RtnMessage.IsSuccessfull = true;
                                        console.log('FnSaveCVInfo: CV Info Saved successfully');
                                        res.send(RtnMessage);


                                    }
                                    else {
                                        res.send(RtnMessage);
                                        res.statusCode = 500;
                                        console.log('FnSaveCVInfo: CVinfo not saved');
                                    }

                                }
                                else {
                                    res.send(RtnMessage);
                                    res.statusCode = 500;
                                    console.log('FnSaveCVInfo: Error in saving CV Info  : ' + err);
                                }
                            });
                        };

                        var insertLocations = function(locationDetails){
                            var list = {
                                location_title: locationDetails.location_title,
                                latitude: locationDetails.latitude,
                                longitude: locationDetails.longitude,
                                country: locationDetails.country,
                                maptype : locationDetails.maptype
                            };
                            var queryParams = st.db.escape(list.location_title) + ',' + st.db.escape(list.latitude)
                                + ',' + st.db.escape(list.longitude) + ',' + st.db.escape(list.country)+ ',' + st.db.escape(list.maptype);

                            console.log(queryParams);

                            st.db.query('CALL psavejoblocation(' + queryParams + ')', function (err, results) {

                                if(err){
                                    console.log('Error in saving psavejoblocation');
                                    console.log(err);
                                }
                                else{
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0][0]) {

                                                console.log(results[0][0].id);
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
                                                console.log('FnSaveJobLocation: results no found');
                                                res.status(200).json(RtnMessage);
                                            }
                                        }
                                        else {
                                            console.log('FnSaveJobLocation:results no found');
                                            console.log('FnSaveJobLocation: results no found');
                                            res.status(200).json(RtnMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnSaveJobLocation:results no found');
                                        console.log('FnSaveJobLocation: results no found');
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
            //70084b50d3c43822fbef
            var RtnResponse = {
                SkillID: 0
            };
            RtnResponse = JSON.parse(JSON.stringify((RtnResponse)));

            st.db.query('Select SkillID from mskill where SkillTitle like ' + st.db.escape(skill.skillname), function (err, SkillResult) {
                if ((!err)) {
                    if (SkillResult[0]) {
                        console.log(SkillResult);
                        console.log('Skill value:' + SkillResult[0].SkillID);
                        console.log('Skill exists');
                        RtnResponse.SkillID = SkillResult[0].SkillID;
                        console.log(RtnResponse.SkillID);
                        CallBack(null, RtnResponse);
                    }
                    else {
                        st.db.query('insert into mskill (SkillTitle) values (' + st.db.escape(skill.skillname) + ')', function (err, skillInsertResult) {
                            if (!err) {
                                if (skillInsertResult.affectedRows > 0) {
                                    st.db.query('select SkillID from mskill where SkillTitle like ' + st.db.escape(skill.skillname), function (err, SkillMaxResult) {
                                        if (!err) {
                                            if (SkillMaxResult[0]) {
                                                console.log('New Skill');
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
                                    });
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
    var responseMsg = {
        status : false,
        data : [],
        message : 'Unable to load skills ! Please try again',
        error : {
            server : 'An internal server error'
        }
    };

    try{
        st.db.query('CALL PGetSkills()',function(err,result){
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
        if (token != null) {
            st.validateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        st.db.query('CALL pGetDocPIN(' + st.db.escape(token) + ')', function (err, BussinessListingResult) {
                            if (!err) {
                                // console.log('FnUpdateMessageStatus: Update result' + UpdateResult);
                                if (BussinessListingResult[0] != null) {
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

        if (Token != null && Type.toString() != 'NaN' && Type.toString() != '0') {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        st.db.query('CALL pGetDocs(' + st.db.escape(Token) + ',' + st.db.escape(Type) + ')', function (err, DocumentResult) {
                            if (!err) {
                                //console.log(DocumentResult);
                                if (DocumentResult[0] != null) {
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
            if (Token == null) {
                console.log('FnGetDoc: Token is empty');
            }
            else if (Type.toString() != 'NaN' || Type.toString() == '0') {
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
        if (token != null && token != '') {
            st.validateToken(token, function (err, Result) {
                if (!err) {
                    if (Result != null) {
                        var query = st.db.escape(token) + ',' + st.db.escape(tPin);
                        st.db.query('CALL pUpdateDocPIN(' + query + ')', function (err, UpdateResult) {
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

        if (Token != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null && tRefType.toString() != 'NaN') {
                        if (tRefExpiryDate != null) {
                            tRefExpiryDate = new Date(tRefExpiryDate);
                            //console.log(tRefExpiryDate);
                        }
                        var query = st.db.escape(Token) + ',' + st.db.escape(tRefNo) + ',' + st.db.escape(tRefExpiryDate) + ',' + st.db.escape(tRefType);
                        //console.log('FnSaveDoc: Inserting data: ' + query);
                        st.db.query('CALL pSaveDocs(' + query + ')', function (err, InsertResult) {
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
    try {

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var LangID = parseInt(req.query.LangID);
        if (LangID.toString != 'NaN') {
            var Query = 'select FunctionID, FunctionName  from mfunctiontype where LangID=' + st.db.escape(LangID);
            st.db.query(Query, function (err, FunctionRoleMapResult) {
                if (!err) {
                    if (FunctionRoleMapResult.length > 0) {
                        res.send(FunctionRoleMapResult);
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
                    console.log('FnGetFunctions: mfunctiontype: ' + err);
                }
            });
        }
        else {
            console.log('FnGetFunctions: LangId is empty');
            res.statusCode = 400;
            res.json(null);
        }

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

        st.validateToken(Token, function (err, Result) {
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
                                var query = st.db.escape(Token) + ',' + st.db.escape( new Buffer(original_data).toString('base64')) + ',' + st.db.escape(fileName) + ',' + st.db.escape(tRefType) + ',' + st.db.escape(CntType);
                                //console.log(query);
                                st.db.query('CALL pSaveDocsFile(' + query + ')', function (err, InsertResult) {
                                    if (!err) {
                                        //    console.log(InsertResult);
                                        if (InsertResult.affectedRows > 0) {
                                            RtnMessage.IsSuccessfull = true;
                                            console.log('FnUploadDocument: Document Saved successfully');
                                            res.send(RtnMessage);
                                            deleteTempFile();
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

var FnGetRedirectLink = function(ezeid,urlSeqNumber,redirectCallback){
    var Insertquery = st.db.escape(ezeid) + ',' + st.db.escape(urlSeqNumber);
    st.db.query('CALL pRedirectWebLink(' + Insertquery + ')', function (err, results) {
        if(err){
            console.log(err);
            redirectCallback(null);
        }
        else{
            if(results.length > 0){
                if(results[0].length > 0){
                    redirectCallback(results[0][0].URL);
                }
                else{
                    redirectCallback(null);
                }
            }
            else{
                redirectCallback(null);
            }
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
    if(req.params.id){
        var link = req.params.id;
        var arr = link.split('.');
        if(arr.length > 1){
            var lastItem = arr[arr.length - 1];

            arr.splice(arr.length - 1,1);

            var ezeid = alterEzeoneId(arr.join('.'));

            var urlBreaker = lastItem.split('');
            if(urlBreaker.length > 1 && urlBreaker.length < 4){
                if(urlBreaker[0] === 'U'){
                    urlBreaker.splice(0,1);
                    var urlSeqNumber = parseInt(urlBreaker.join(''));
                    if(!isNaN(urlSeqNumber)){
                        if(urlSeqNumber > 0 && urlSeqNumber < 100){
                            FnGetRedirectLink(ezeid,urlSeqNumber,function(url){

                                if(url){
                                    res.redirect(url);
                                }
                                else{

                                    next();
                                }
                            });
                        }
                        else{
                            next();
                        }
                    }
                    else{
                        next();
                    }
                }
                else{
                    next();
                }
            }
            else{
                next();
            }
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

        if (LangID.toString != 'NaN') {
            var Query = 'Select TitleID,Title from mtitle where LangID=' + st.db.escape(LangID);
            st.db.query(Query, function (err, MTitleResult) {
                if (!err) {
                    if (MTitleResult.length > 0) {
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
        if (Token != null && Picture != null && PictureFileName != null) {
            st.validateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result != null) {

                        st.db.query('select TID from tmaster where Token=' + st.db.escape(Token), function (err, UserResult) {
                            if (!err) {
                                //console.log(UserResult);
                                if (UserResult != null) {
                                    if (UserResult.length > 0) {
                                        var query = 'Update tlocations set Picture = ' + st.db.escape(Picture) + ',' + 'PictureFileName= ' + st.db.escape(PictureFileName) + ' where SeqNo=0 and MasterID=' + st.db.escape(UserResult[0].TID);
                                        // console.log(query);
                                        st.db.query(query, function (err, PicResult) {
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

        if (Token != null && Token != '') {
            st.validateToken(Token, function (err, Result) {
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
        if (LangID.toString != 'NaN') {
            var Query = 'Select Title,MetersValue, MilesValue from mproximity where LangID=' + st.db.escape(LangID);
            st.db.query(Query, function (err, ProximityResult) {
                if (!err) {
                    if (ProximityResult.length > 0) {
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        st.db.query('CALL pGetInstitutes()', function (err, result) {
                            if (err) {
                                console.log('Error : FnGetInstitutes :' + err);
                                res.status(400).json(responseMsg);
                            }
                            else {
                                responseMsg.status = true;
                                responseMsg.message = 'Institutes loaded successfully';
                                responseMsg.error = null;
                                responseMsg.data = result[0];
                                res.status(200).json(responseMsg);
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        st.db.query('CALL pGetEducations()', function (err, result) {
                            if (err) {
                                console.log('Error : FnGetEducations :' + err);
                                res.status(400).json(responseMsg);
                            }
                            else {
                                responseMsg.status = true;
                                responseMsg.message = 'Educations loaded successfully';
                                responseMsg.error = null;
                                responseMsg.data = result[0];
                                res.status(200).json(responseMsg);
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        st.db.query('CALL pGetSpecialization()', function (err, result) {
                            if (err) {
                                console.log('Error : FnGetSpecialization :' + err);
                                res.status(400).json(responseMsg);
                            }
                            else {
                                responseMsg.status = true;
                                responseMsg.message = 'Specialization loaded successfully';
                                responseMsg.error = null;
                                responseMsg.data = result[0];
                                res.status(200).json(responseMsg);
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        st.db.query('CALL pGetVerifiedInstitutes()', function (err, result) {
                            if (err) {
                                console.log('Error : FnGetVerifiedInstitutes :' + err);
                                res.status(400).json(responseMsg);
                            }
                            else {
                                console.log(result);
                                responseMsg.status = true;
                                responseMsg.message = 'Institutes is valid';
                                responseMsg.error = null;
                                responseMsg.data = result[0];
                                res.status(200).json(responseMsg);
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




module.exports = User;
