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

function User(db){
    this.db = db;
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
        var IPAddress = req._remoteAddress;
        var SelectionTypes = parseInt(req.body.SelectionType);
        if(SelectionTypes.toString() == 'NaN'){
            SelectionTypes = 0;
        }
        console.log(SelectionTypes);
        var IDTypeID = req.body.IDTypeID;
        var EZEID = req.body.EZEID;
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
        if(OperationType == 1){
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

                if (Operation == 'I') {
                    TokenNo = FnGenerateToken();
                }
                var EncryptPWD = '';
                if (Password != null) {
                    EncryptPWD = FnEncryptPassword(Password);
                }
                var DOBDate = null;
                console.log(EZEID.toUpperCase());
                if (DOB != null && DOB != '') {
                    // datechange = new Date(new Date(TaskDateTime).toUTCString());
                    DOBDate = new Date(DOB);
                    // console.log(TaskDate);
                }
                var InsertQuery = _this._this.db.escape(IDTypeID) + ',' + _this._this.db.escape(EZEID) + ',' + _this._this.db.escape(EncryptPWD) + ',' + _this._this.db.escape(FirstName) + ',' +
                    _this._this.db.escape(LastName) + ',' + _this._this.db.escape(CompanyName) + ',' + _this._this.db.escape(JobTitle) + ',' + _this._this.db.escape(FunctionID) + ',' +
                    _this._this.db.escape(RoleID) + ',' + _this._this.db.escape(LanguageID) + ',' + _this._this.db.escape(NameTitleID) + ',' +
                    _this._this.db.escape(TokenNo) + ',' + _this._this.db.escape(Latitude) + ',' + _this._this.db.escape(Longitude) + ',' + _this._this.db.escape(Altitude) + ',' +
                    _this._this.db.escape(AddressLine1) + ',' + _this._this.db.escape(AddressLine2) + ',' + _this._this.db.escape(Citytitle) + ',' + _this._this.db.escape(StateID) + ',' + _this._this.db.escape(CountryID) + ',' +
                    _this._this.db.escape(PostalCode) + ',' + _this._this.db.escape(PIN) + ',' + _this._this.db.escape(PhoneNumber) + ',' + _this._this.db.escape(MobileNumber) + ',' + _this._this.db.escape(EMailID) + ',' +
                    _this._this.db.escape(Picture) + ',' + _this._this.db.escape(PictureFileName) + ',' + _this._this.db.escape(WebSite) + ',' + _this._this.db.escape(Operation) + ',' + _this._this.db.escape(AboutCompany) + ','
                    + _this._this.db.escape(StatusID) + ',' + _this._this.db.escape(Icon) + ',' + _this._this.db.escape(IconFileName) + ',' + _this._this.db.escape(ISDPhoneNumber) + ',' + _this._this.db.escape(ISDMobileNumber) + ','
                    + _this._this.db.escape(Gender) + ',' + _this._this.db.escape(DOBDate) + ',' + _this._this.db.escape(IPAddress) + ',' + _this._this.db.escape(SelectionTypes) + ',' + _this._this.db.escape(ParkingStatus)+ ',' + _this._this.db.escape(TemplateID)  + ',' + _this._this.db.escape(CategoryID);


                //console.log(InsertQuery);

                _this._this.db.query('CALL pSaveEZEIDData(' + InsertQuery + ')', function (err, InsertResult) {
                    if (!err) {
                        //console.log('InsertResult: ' + InsertResult);
                        if (InsertResult != null) {
                            console.log(InsertResult[0].length);
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
                                                var query = _this._this.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
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

                if (Operation == 'I') {
                    TokenNo = FnGenerateToken();
                }
                var EncryptPWD = '';
                if (Password != null) {
                    EncryptPWD = FnEncryptPassword(Password);
                }
                var DOBDate = null;
                console.log(EZEID.toUpperCase());
                if (DOB != null && DOB != '') {
                    // datechange = new Date(new Date(TaskDateTime).toUTCString());
                    DOBDate = new Date(DOB);
                    // console.log(TaskDate);
                }
                //console.log('FnRegistration: Token: ' + TokenNo);
                var InsertQuery = _this.db.escape(IDTypeID) + ',' + _this.db.escape(EZEID) + ',' + _this.db.escape(EncryptPWD) + ',' + _this.db.escape(FirstName) + ',' +
                    _this.db.escape(LastName) + ',' + _this.db.escape(CompanyName) + ',' + _this.db.escape(JobTitle) + ',' + _this.db.escape(FunctionID) + ',' +
                    _this.db.escape(RoleID) + ',' + _this.db.escape(LanguageID) + ',' + _this.db.escape(NameTitleID) + ',' +
                    _this.db.escape(TokenNo) + ',' + _this.db.escape(Latitude) + ',' + _this.db.escape(Longitude) + ',' + _this.db.escape(Altitude) + ',' +
                    _this.db.escape(AddressLine1) + ',' + _this.db.escape(AddressLine2) + ',' + _this.db.escape(Citytitle) + ',' + _this.db.escape(StateID) + ',' + _this.db.escape(CountryID) + ',' +
                    _this.db.escape(PostalCode) + ',' + _this.db.escape(PIN) + ',' + _this.db.escape(PhoneNumber) + ',' + _this.db.escape(MobileNumber) + ',' + _this.db.escape(EMailID) + ',' +
                    _this.db.escape(Picture) + ',' + _this.db.escape(PictureFileName) + ',' + _this.db.escape(WebSite) + ',' + _this.db.escape(Operation) + ',' + _this.db.escape(AboutCompany)
                    + ',' + _this.db.escape(StatusID) + ',' + _this.db.escape(Icon) + ',' + _this.db.escape(IconFileName) + ',' + _this.db.escape(ISDPhoneNumber) + ',' + _this.db.escape(ISDMobileNumber)
                    + ',' + _this.db.escape(Gender) + ',' + _this.db.escape(DOBDate) + ',' + _this.db.escape(IPAddress) + ',' + _this.db.escape(SelectionTypes)+ ',' + _this.db.escape(ParkingStatus) + ',' + _this.db.escape(TemplateID) + ',' + _this.db.escape(CategoryID);

                // console.log(InsertQuery);
                _this.db.query('CALL pSaveEZEIDData(' + InsertQuery + ')', function (err, InsertResult) {
                    if (!err) {
                        // console.log('InsertResult: ' + InsertResult);
                        if (!InsertResult) {
                            //  console.log(InsertResult);
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
        console.log('FnRegistration error:' + ex.description);
           
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
            HomeDeliveryItemListType : ''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (UserName != null && UserName != '' && Password != null && Password != '') {
            var EncryptPWD = FnEncryptPassword(Password);
            // console.log(EncryptPWD);
            var FindArray = UserName.split('.');
            var Query
            //console.log('findarray: ' + FindArray.length);
            var Query = _this.db.escape(UserName)+','+ _this.db.escape(EncryptPWD);
            // console.log(Query);
            _this.db.query('CALL PLogin(' + Query + ')', function (err, loginResult) {
                if (!err) {
                    if(loginResult) {
                        if (loginResult[0].length > 0) {
                            // console.log('loginResult: ' + loginResult);
                            var Encrypt = FnGenerateToken();
                            //   console.log('Encrypt: ' + Encrypt);
                            // console.log('TID ' + loginResult[0].TID);
                            var loginDetails = loginResult[0];
                            var Query = 'update tmaster set Token=' + _this.db.escape(Encrypt) + ' where TID=' + _this.db.escape(loginDetails[0].TID);
                            _this.db.query(Query, function (err, TokenResult) {
                                if (!err) {
                                    //  console.log(TokenResult);

                                    if (TokenResult.affectedRows > 0) {
                                        //res.setHeader('Cookie','Token='+Encrypt);
                                        // console.log(loginDetails[0]);
                                        res.cookie('Token', Encrypt, { maxAge: 900000, httpOnly: true });
                                        RtnMessage.Token = Encrypt;
                                        RtnMessage.IsAuthenticate = true;
                                        RtnMessage.FirstName = loginDetails[0].FirstName;
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
                                        RtnMessage.VisibleModules= loginDetails[0].VisibleModules;
                                        RtnMessage.FreshersAccepted= loginDetails[0].FreshersAccepted;
                                        RtnMessage.HomeDeliveryItemListType = loginDetails[0].HomeDeliveryItemListType;
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
           
    }
};

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

            var Query = 'update tmaster set Token=' + _this.db.escape('') + ' where Token=' + _this.db.escape(Token);
            _this.db.query(Query, function (err, TokenResult) {
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
            var Query = 'Select CountryID, CountryName, ISDCode from  mcountry where LangID=' + _this.db.escape(LangID);
            _this.db.query(Query, function (err, CountryResult) {
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
            var Query = 'Select StateID, StateName  from mstate where LangID=' + _this.db.escape(LangID) + ' and CountryID=' + _this.db.escape(CountryID);
            // console.log(Query);
            _this.db.query(Query, function (err, StateResult) {
                if (!err) {
                    if (StateResult.length > 0) {
                        var Query = 'Select ifnull(ISDCode,"") as ISDCode from  mcountry where CountryID=' + _this.db.escape(CountryID);
                        _this.db.query(Query, function (err, CountryResult) {
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
            var Query = 'Select  CityID, CityName from mcity where LangID=' + _this.db.escape(LangID) + ' and StateID= ' + _this.db.escape(StateID);
            _this.db.query(Query, function (err, CityResult) {
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
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        _this.db.query('CALL pGetEZEIDDetails(' + _this.db.escape(Token) + ')', function (err, UserDetailsResult) {
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
        var EZEID = req.query.EZEID;
        var RtnMessage = {
            IsIdAvailable: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if (EZEID != null && EZEID != '') {
            var Query = 'Select EZEID from tmaster where EZEID=' + _this.db.escape(EZEID);
            _this.db.query(Query, function (err, EzediExitsResult) {
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
            FnValidateToken(TokenNo, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var EncryptOldPWD = FnEncryptPassword(OldPassword);
                        var EncryptNewPWD = FnEncryptPassword(NewPassword);
                        var Query = _this.db.escape(TokenNo) + ',' + _this.db.escape(EncryptOldPWD) + ',' + _this.db.escape(EncryptNewPWD);
                        _this.db.query('CALL pChangePassword(' + Query + ')', function (err, ChangePasswordResult) {
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
           
    }
};

/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
User.prototype.forgetPassword = function(req,res,next){
    /**
     * @todo FnForgetPassword
     */
    var _this = this;
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
            var Query = 'Update tmaster set Password= ' + _this.db.escape(EncryptPWD) + ' where EZEID=' + _this.db.escape(EZEID);
            // console.log('FnForgotPassword: ' + Query);
            _this.db..query(Query, function (err, ForgetPasswordResult) {
                if (!err) {
                    //console.log(InsertResult);
                    if (ForgetPasswordResult != null) {
                        if (ForgetPasswordResult.affectedRows > 0) {
                            RtnMessage.IsChanged = true;
                            var UserQuery = 'Select a.TID, ifnull(a.FirstName,"") as FirstName,ifnull(a.LastName,"") as LastName,a.Password,ifnull(b.EMailID,"") as EMailID from tmaster a,tlocations b where b.SeqNo=0 and b.EZEID=a.EZEID and a.EZEID=' + _this.db.escape(EZEID);
                            //  console.log(UserQuery);
                            _this.db..query(UserQuery, function (err, UserResult) {
                                if (!err) {
                                    //  console.log(UserResult);

                                    var fs = require('fs');
                                    fs.readFile("ForgetPasswordTemplate.txt", "utf8", function (err, data) {
                                        if (err) throw err;
                                        data = data.replace("[Firstname]", UserResult[0].FirstName);
                                        data = data.replace("[Lastname]", UserResult[0].LastName);
                                        data = data.replace("[Password]", Password);

                                        console.log(UserResult);
                                        //console.log('Body:' + data);
                                        var mailOptions = {
                                            from: EZEIDEmail,
                                            to: UserResult[0].EMailID,
                                            subject: 'Password reset request',
                                            html: data // html body
                                        };

                                        // send mail with defined transport object
                                        //message Type 7 - Forgot password mails service
                                        var post = { MessageType: 7, Priority: 2, ToMailID: mailOptions.to, Subject: mailOptions.subject, Body: mailOptions.html,SentbyMasterID: UserResult[0].TID};
                                        console.log(post);
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
    }
};


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
            console.log('CALL pGetTagLine(' + _this.db.escape(TID)+ ',' + _this.db.escape(Token) + ')');
            _this.db.query('CALL pGetTagLine(' + _this.db.escape(TID)+ ',' + _this.db.escape(Token) + ')', function (err, GetResult) {
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
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var query = _this.db.escape(Token)+ ',' + _this.db.escape(CompanyProfile);
                        _this.db.query('CALL pSaveTagLine(' + query + ')', function (err, InsertResult) {
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
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        _this.db.query('CALL pGetWebLink(' + _this.db.escape(Token) + ')', function (err, GetResult) {
                            if (!err) {
                                if (GetResult) {
                                    if (GetResult[0].length > 0) {
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
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        console.log(Token,URL,URLNumber);
                        var query = _this.db.escape(Token) + ',' + _this.db.escape(URL) + ',' + _this.db.escape(URLNumber) ;
                        _this.db.query('CALL pSaveWebLinks(' + query + ')', function (err, InsertResult) {
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
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        //console.log('CALL pDeleteWorkinghours(' + _this.db.escape(TID) + ')');
                        _this.db.query('CALL pDeleteWebLink(' + _this.db.escape(TID) + ')', function (err, deleteResult) {
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
        var EZEID = req.query.EZEID;
        if (Token != null && EZEID != null ) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        var LocSeqNo = 0;
                        var FindArray =EZEID.split('.');
                        if (FindArray.length > 0) {
                            EZEID = FindArray[0];
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
                        _this.db.query('CALL pEZEIDPrimaryDetails(' + _this.db.escape(EZEID) + ',' + _this.db.escape(LocSeqNo) + ')', function (err, GetResult) {
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
            error:{},
            message:''
        };

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {
                        _this.db.query('CALL pgetCVInfo(' + _this.db.escape(Token) + ')', function (err, MessagesResult) {
                            if (!err) {

                                if (MessagesResult[0]) {
                                    if (MessagesResult[0].length > 0) {

                                        responseMessage.status = true;
                                        responseMessage.data = MessagesResult[0];
                                        responseMessage.skillMatrix = MessagesResult[1];
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

        var RtnMessage = {
            IsSuccessfull: false
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));

        if (Token != null) {
            FnValidateToken(Token, function (err, Result) {
                if (!err) {
                    if (Result) {

                        if (Pin == '') {
                            Pin = null;
                        }
                        var query = _this.db.escape(FunctionID) + ',' + _this.db.escape(0) + ',' + _this.db.escape(KeySkills) + ',' + _this.db.escape(Status) + ',' + _this.db.escape(Pin) + ',' + _this.db.escape(Token) + ',' + _this.db.escape(ids);
                        _this.db.query('CALL pSaveCVInfo(' + query + ')', function (err, InsertResult) {
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
                                                        var query = _this.db.query('UPDATE tskills set ? WHERE TID = ? ',[SkillItems,tid], function (err, result) {
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
                                                        var query = _this.db.query('INSERT INTO tskills  SET ?', SkillItems , function (err, result) {
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

            _this.db.query('Select SkillID from mskill where SkillTitle like ' + _this.db.escape(skill.skillname), function (err, SkillResult) {
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
                        _this.db.query('insert into mskill (SkillTitle) values (' + _this.db.escape(skill.skillname) + ')', function (err, skillInsertResult) {
                            if (!err) {
                                if (skillInsertResult.affectedRows > 0) {
                                    _this.db.query('select SkillID from mskill where SkillTitle like ' + _this.db.escape(skill.skillname), function (err, SkillMaxResult) {
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
        console.log('OTP FnSendMailEzeid error:' + ex.description);
           
        return 'error'
    }
};


module.exports = User;