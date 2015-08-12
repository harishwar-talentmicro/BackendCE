/**
 *  @author Indrajeet
 *  @since June 25,2015 11:24 AM IST
 *  @title User module
 *  @description Handles master user level functions as follows
 *  1. Registration (Updating user and primary location also done with this call only)
 *  2. Login
 *  3. Logout
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



var st = null;
function Auth(db,stdLib){
    if(stdLib){
        st = stdLib;
    }
}

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Auth.prototype.register = function(req,res,next){
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
Auth.prototype.login = function(req,res,next){
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
            ISPrimaryLocAdded:'',
            isapplied:''

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
                                            console.log(loginDetails[0]);
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
                                            RtnMessage.isjobapplied = loginDetails[0].isappliedforjob;
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
Auth.prototype.logout = function(req,res,next){
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

module.exports = Auth;