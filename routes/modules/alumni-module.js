/**
 *  @author Gowri shankar
 *  @since seotemper 10,2015 03:24 PM IST
 *  @title Alumni module
 *  @description Handles functions related to alumni profile and events
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

var NotificationMqtt = require('./notification/notification-mqtt.js');
var notificationMqtt = new NotificationMqtt();
var NotificationQueryManager = require('./notification/notification-query.js');
var notificationQmManager = null;

var st = null;
function Alumni(db,stdLib){
    if(stdLib){
        st = stdLib;
        notificationQmManager = new NotificationQueryManager(db,st);
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
function hash(password){
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



/**
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Alumni.prototype.registerAlumni = function(req,res,next){
    /**
     * @todo FnRegistrationAlumni
     */
    var _this = this;
    try {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var OperationType = req.body.OperationType;
        var IPAddress = req._remoteAddress;
        var SelectionTypes = parseInt(req.body.SelectionType);
        if(SelectionTypes.toString() == 'NaN'){
            SelectionTypes = 0;
        }

        var IDTypeID = req.body.IDTypeID;
        var EZEID = alterEzeoneId(req.body.EZEID);
        if(EZEID != null)
            EZEID = EZEID.toUpperCase();
        var Password = req.body.Password;
        var FirstName = req.body.FirstName;
        var LastName = req.body.LastName ? req.body.LastName : '';
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

        var AddressLine1 = req.body.AddressLine1 ? req.body.AddressLine1 : '';
        var AddressLine2 = req.body.AddressLine2 ? req.body.AddressLine2 : '';
        var Area = req.body.Area ? req.body.Area : '';
        var Citytitle = req.body.CityTitle ? req.body.CityTitle : '';
        var StateID = req.body.StateID ? req.body.StateID : 0;
        var CountryID = req.body.CountryID ? req.body.CountryID :0;
        var PostalCode = req.body.PostalCode ? req.body.PostalCode : 0;
        var PIN = req.body.PIN ? req.body.PIN : null;
        var PhoneNumber = req.body.PhoneNumber ? req.body.PhoneNumber : 0;
        var MobileNumber = req.body.MobileNumber;
        var EMailID = req.body.EMailID;
        var Picture = req.body.Picture;
        var PictureFileName = req.body.PictureFileName;
        var WebSite = req.body.Website;
        var AboutCompany = req.body.AboutCompany;
        var StatusID = 1;
        var TokenNo = req.body.Token;
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
        var isIphone = req.body.device ? parseInt(req.body.device) : 0;
        var deviceToken = req.body.device_token ? req.body.device_token : '';

        var RtnMessage = {
            Token: '',
            IsAuthenticate: false,
            FirstName: '',
            Type: 0,
            Icon: '',
            tid:'',
            group_id:''
        };
        var RtnMessage = JSON.parse(JSON.stringify(RtnMessage));
        if(parseInt(OperationType) == 1){
            console.log('----------req.body for Operation type 1--------------');
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
                    EncryptPWD = hash(Password);
                }
                var DOBDate = null;

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


                //console.log(InsertQuery);

                st.db.query('CALL pSaveEZEIDData(' + InsertQuery + ')', function (err, InsertResult) {
                    if (!err) {
                        //console.log('InsertResult: ');
                        //console.log( InsertResult);
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
                                        RtnMessage.tid = InsertResult[0][0].TID;
                                        RtnMessage.group_id = InsertResult[0][0].group_id;
                                        if (CompanyName == null)
                                            CompanyName='';
                                        if (Operation == 'I') {
                                            console.log('FnRegistrationAlumni:tmaster: Registration success');

                                            /**
                                             * Creating queue for the user dynamically on rabbit server
                                             *
                                             */
                                            notificationQmManager.getIndividualGroupId(RegResult[0].TID,function(err1,getIndividualGroupIdRes){
                                                if(!err1){
                                                    if(getIndividualGroupIdRes){
                                                        notificationMqtt.createQueue(getIndividualGroupIdRes.tid);
                                                    }
                                                }
                                            });

                                            //res.send(RtnMessage);
                                            if(isIphone == 1){
                                                var queryParams = st.db.escape(EZEID) + ',' + st.db.escape(deviceToken);
                                                var query = 'CALL pSaveIPhoneDeviceID(' + queryParams + ')';
                                                // console.log(query);
                                                st.db.query(query, function (err, result) {
                                                    if(!err){
                                                        //console.log(result);
                                                        console.log('FnLogin:IphoneDevice save successfully');
                                                    }
                                                    else
                                                    {
                                                        console.log(err);
                                                    }
                                                });
                                            }
                                            if (EMailID != '' && EMailID != null) {
                                                var fs = require('fs');
                                                fs.readFile("registration.html", "utf8", function (err, data) {
                                                    if (err) throw err;
                                                    data = data.replace("[Firstname]", FirstName);
                                                    data = data.replace("[Lastname]", LastName);
                                                    data = data.replace("[EZEOneID]", EZEID);
                                                    var mailOptions = {
                                                        from: 'noreply@ezeone.com',
                                                        to: EMailID,
                                                        subject: 'Welcome to EZEOneID',
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
                                                                    console.log('FnRegistrationAlumni: Token Generation Error' + err);
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
                                                console.log('FnRegistrationAlumni: tmaster: registration success but email is empty so mail not sent');
                                                console.log(RtnMessage);
                                                res.send(RtnMessage);
                                            }
                                        }
                                        else {
                                            console.log('FnRegistrationAlumni: tmaster: Update operation success');
                                            console.log(RtnMessage);
                                            res.send(RtnMessage);
                                        }
                                    }
                                    else
                                    {
                                        console.log(RtnMessage);
                                        res.send(RtnMessage);
                                        console.log('FnRegistrationAlumni:tmaster: Registration Failed..1');
                                    }

                                }
                                else {
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnRegistrationAlumni:tmaster: Registration Failed..2');
                                }
                            }

                            else {
                                console.log(RtnMessage);
                                res.send(RtnMessage);
                                console.log('FnRegistrationAlumni:tmaster: Registration Failed..3');
                            }

                        }
                        else {
                            console.log(RtnMessage);
                            res.send(RtnMessage);
                            console.log('FnRegistrationAlumni:tmaster: Registration Failed..4');
                        }
                    }
                    else {
                        res.statusCode = 500;
                        res.send(RtnMessage);
                        console.log('FnRegistrationAlumni:tmaster:' + err);
                    }
                });

            }
            else
            {
                console.log('FnRegistrationAlumni: Wizard Insertion Failed');
                if(IDTypeID == null ) {
                    console.log('FnRegistrationAlumni: IDTypeID is Empty');
                }
                else if(EZEID == null){
                    console.log('FnRegistrationAlumni: EZEID is Empty');
                }
                else if(Password == null) {
                    console.log('FnRegistrationAlumni: Password is Empty');
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
            if (IDTypeID != null && EZEID != null && Gender.toString() != 'NaN') {
                var EncryptPWD = '';
                if (Password) {
                    EncryptPWD = hash(Password);

                    //console.log(EncryptPWD);
                }
                var DOBDate = null;
                if (DOB != null && DOB != '') {
                    DOBDate = new Date(DOB);
                }

                var InsertQuery = st.db.escape(IDTypeID) + ',' + st.db.escape(EZEID) + ',' + st.db.escape(EncryptPWD) + ',' + st.db.escape(FirstName) + ',' +
                    st.db.escape(LastName) + ',' + st.db.escape(CompanyName) + ',' + st.db.escape(JobTitle) + ',' + st.db.escape(FunctionID) + ',' +
                    st.db.escape(RoleID) + ',' + st.db.escape(LanguageID) + ',' + st.db.escape(NameTitleID) + ',' +
                    st.db.escape(TokenNo) + ',' + st.db.escape(Latitude) + ',' + st.db.escape(Longitude) + ',' + st.db.escape(Altitude) + ',' +
                    st.db.escape(AddressLine1) + ',' + st.db.escape(AddressLine2) + ',' + st.db.escape(Citytitle) + ',' + st.db.escape(StateID) + ',' + st.db.escape(CountryID) + ',' +
                    st.db.escape(PostalCode) + ',' + st.db.escape(PIN) + ',' + st.db.escape(PhoneNumber) + ',' + st.db.escape(MobileNumber) + ',' + st.db.escape(EMailID) + ',' +
                    st.db.escape(Picture) + ',' + st.db.escape(PictureFileName) + ',' + st.db.escape(WebSite) + ',' + st.db.escape(Operation) + ',' + st.db.escape(AboutCompany)
                    + ',' + st.db.escape(StatusID) + ',' + st.db.escape(Icon) + ',' + st.db.escape(IconFileName) + ',' + st.db.escape(ISDPhoneNumber) + ',' + st.db.escape(ISDMobileNumber)
                    + ',' + st.db.escape(Gender) + ',' + st.db.escape(DOBDate) + ',' + st.db.escape(IPAddress) + ',' + st.db.escape(SelectionTypes)+ ',' + st.db.escape(ParkingStatus) + ',' + st.db.escape(TemplateID) + ',' + st.db.escape(CategoryID);

                 //console.log(InsertQuery);
                st.db.query('CALL pSaveEZEIDData(' + InsertQuery + ')', function (err, InsertResult) {
                    if (!err) {
                        //console.log('InsertResult....');
                        //console.log(InsertResult);
                        if (InsertResult) {

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
                                        RtnMessage.tid = InsertResult[0][0].TID;
                                        RtnMessage.group_id = InsertResult[0][0].group_id;
                                        if (Operation == 'I') {
                                            console.log('FnRegistrationAlumni:tmaster: Registration success');
                                            //res.send(RtnMessage);
                                            if (EMailID != '' || EMailID != null) {
                                                var fs = require('fs');
                                                fs.readFile("registration.html", "utf8", function (err, data) {
                                                    if (err) throw err;
                                                    data = data.replace("[Firstname]", FirstName);
                                                    data = data.replace("[Lastname]", LastName);
                                                    data = data.replace("[EZEOneID]", EZEID);

                                                    var mailOptions = {
                                                        from: 'noreply@ezeone.com',
                                                        to: EMailID,
                                                        subject: 'Welcome to EZEOneID',
                                                        html: data // html body
                                                    };
                                                    //console.log('Mail Option:' + mailOptions);
                                                    // send mail with defined transport object
                                                    var post = { MessageType: 8, Priority: 3, ToMailID: mailOptions.to, Subject: mailOptions.subject, Body: mailOptions.html, SentbyMasterID:RegResult[0].TID };
                                                    // console.log(post);
                                                    var query = st.db.query('INSERT INTO tMailbox SET ?', post, function (err, result) {
                                                        // Neat!
                                                        if (!err) {
                                                            console.log('FnRegistrationAlumni: Mail saved Successfully');
                                                        }
                                                        else {
                                                            console.log('FnRegistrationAlumni: Mail not Saved Successfully' + err);
                                                        }

                                                        var ip =  req.headers['x-forwarded-for'] ||
                                                            req.connection.remoteAddress ||
                                                            req.socket.remoteAddress ||
                                                            req.connection.socket.remoteAddress;
                                                        var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';

                                                        st.generateToken(ip,userAgent,EZEID,function(err,token) {
                                                            if (err) {
                                                                console.log('FnRegistrationAlumni: Token Generation Error' + err);
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
                                                console.log('FnRegistrationAlumni: tmaster: registration success but email is empty so mail not sent');
                                                console.log(RtnMessage);
                                                res.send(RtnMessage);
                                            }
                                        }
                                        else {
                                            console.log('FnRegistrationAlumni: tmaster: Update operation success');
                                            console.log(RtnMessage);
                                            res.send(RtnMessage);
                                        }
                                    }
                                    else {
                                        console.log(RtnMessage);
                                        res.send(RtnMessage);
                                        console.log('FnRegistrationAlumni:tmaster: Registration Failed..1');
                                    }
                                }
                                else{
                                    console.log(RtnMessage);
                                    res.send(RtnMessage);
                                    console.log('FnRegistrationAlumni:tmaster: Registration Failed..2');
                                }
                            }

                            else{
                                console.log(RtnMessage);
                                res.send(RtnMessage);
                                console.log('FnRegistrationAlumni:tmaster: Registration Failed..3');
                            }
                        }
                        else{
                            console.log(RtnMessage);
                            res.send(RtnMessage);
                            console.log('FnRegistrationAlumni:tmaster: Registration Failed..4');
                        }
                    }
                    else {
                        res.statusCode = 500;
                        res.send(RtnMessage);
                        console.log('FnRegistrationAlumni:tmaster:' + err);
                    }
                });
            }
            else {
                console.log('Update method validation');
                if (IDTypeID == null) {
                    console.log('FnRegistrationAlumni: IDTypeID is empty');
                } else if (EZEID == null) {
                    console.log('FnRegistrationAlumni: EZEID is empty');
                }
                else if (Gender.toString() == 'NaN') {
                    console.log('FnRegistrationAlumni: Gender is empty')
                }
                res.statusCode = 400;
                res.send(RtnMessage);
                console.log('FnRegistrationAlumni:tmaster: Manditatory field empty');
            }
        }

    }
    catch (ex) {
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnRegistrationAlumni error:' + ex.description);
        //throw new Error(ex);
    }
};



/**
 * @todo FnSaveAlumniContent
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save alumni details of a person
 */
Alumni.prototype.saveAlumniContent = function(req,res,next) {
    var _this = this;

    //var token = req.body.token;
    var tid = req.body.tid;      // while saving time 0 else id of user
    var picture = req.body.pg_pic;
    var pictureTitle = req.body.pg_picName;
    var pictureType = req.body.pg_picType;
    var title = req.body.pg_title;
    var subTitle = req.body.pg_subtitle;
    var footerL1 = req.body.footerL1;
    var footerL2 = req.body.footerL2;
    var ideaTitle = req.body.idea_title;
    var ideaText = req.body.idea_text;
    var purposeTitle = req.body.purpose_title;
    var purposeText = req.body.purpose_text;
    var teamTitle = req.body.team_title;
    var teamSubtitle = req.body.team_subtitle;
    var mainFooter1 = req.body.m_footer1;
    var mainFooter2 = req.body.m_footer2;
    var logo = req.body.logo;
    var logoName = req.body.l_name;
    var logoType = req.body.l_type;
    var logoTitle = req.body.logo_title;
    var alumniId = req.body.alumni_id;
    var mentorTitle = req.body.m_title;
    var mentorSubtitle = req.body.m_subtitle;
    var facultyTitle = req.body.f_title;
    var facultySubtitle = req.body.f_subtitle;
    var width = req.body.width ?  req.body.width : 1200;
    var height = req.body.height ? req.body.height : 600;


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var error = {},validateStatus = true;
    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
    if(!tid){
        tid = 0;
    }
    if(parseInt(tid) == NaN){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }
    //if(!picture){
    //    error['picture'] = 'Invalid page picture';
    //    validateStatus *= false;
    //}
    if(!title){
        error['title'] = 'Invalid page title';
        validateStatus *= false;
    }
    if(!subTitle){
        error['subTitle'] = 'Invalid page subTitle';
        validateStatus *= false;
    }
    if(!footerL1){
        error['footerL1'] = 'Invalid footerL1';
        validateStatus *= false;
    }
    if(!footerL2){
        error['footerL2'] = 'Invalid footerL2';
        validateStatus *= false;
    }
    if(!ideaTitle){
        error['ideaTitle'] = 'Invalid ideaTitle';
        validateStatus *= false;
    }
    if(!ideaText){
        error['ideaText'] = 'Invalid ideaText';
        validateStatus *= false;
    }
    if(!purposeTitle){
        error['purposeTitle'] = 'Invalid purposeTitle';
        validateStatus *= false;
    }
    if(!purposeText){
        responseMessage.error['purposeText'] = 'Invalid purposeText';
        validateStatus *= false;
    }
    if(!teamTitle){
        responseMessage.error['teamTitle'] = 'Invalid teamTitle';
        validateStatus *= false;
    }
    if(!teamSubtitle){
        responseMessage.error['teamSubtitle'] = 'Invalid teamSubtitle';
        validateStatus *= false;
    }
    if(!mainFooter1){
        responseMessage.error['mainFooter1'] = 'Invalid mainFooter1';
        validateStatus *= false;
    }
    if(!mainFooter2){
        responseMessage.error['mainFooter2'] = 'Invalid mainFooter2';
        validateStatus *= false;
    }
    if(!logo){
        responseMessage.error['logo'] = 'Invalid logo';
        validateStatus *= false;
    }
    if(!logoTitle){
        responseMessage.error['mainFooter2'] = 'Invalid logoTitle';
        validateStatus *= false;
    }
    if(!alumniId){
        responseMessage.error['alumniId'] = 'Invalid alumniId';
        validateStatus *= false;
    }
    if(!mentorTitle){
        responseMessage.error['mentorTitle'] = 'Invalid mentorTitle';
        validateStatus *= false;
    }
    if(!mentorSubtitle){
        responseMessage.error['mentorSubtitle'] = 'Invalid mentorSubtitle';
        validateStatus *= false;
    }
    if(!facultyTitle){
        responseMessage.error['facultyTitle'] = 'Invalid facultyTitle';
        validateStatus *= false;
    }
    if(!facultySubtitle){
        responseMessage.error['facultySubtitle'] = 'Invalid facultySubtitle';
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
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
            var imageParams = {
                path: req.files.picture.path,
                //path1 : req.files.picture[1].path,
                type: pictureType,
                width: width,
                height: height,
                scale: '',
                crop: ''
            };

            FnCropImage(imageParams, function (err, imageResult) {
                if (imageResult) {
                    var query = st.db.escape(tid) + ',' + st.db.escape(imageResult) + ',' + st.db.escape(title)
                        + ',' + st.db.escape(subTitle) + ',' + st.db.escape(footerL1) + ',' + st.db.escape(footerL2)
                        + ',' + st.db.escape(ideaTitle) + ',' + st.db.escape(ideaText) + ',' + st.db.escape(purposeTitle)
                        + ',' + st.db.escape(purposeText) + ',' + st.db.escape(teamTitle) + ',' + st.db.escape(teamSubtitle)
                        + ',' + st.db.escape(mainFooter1) + ',' + st.db.escape(mainFooter2) + ',' + st.db.escape(logo)
                        + ',' + st.db.escape(logoTitle) + ',' + st.db.escape(alumniId) + ',' + st.db.escape(mentorTitle)
                        + ',' + st.db.escape(mentorSubtitle) + ',' + st.db.escape(facultyTitle) + ',' + st.db.escape(facultySubtitle)
                        + ',' + st.db.escape(logoName) + ',' + st.db.escape(logoType) + ',' + st.db.escape(pictureTitle)
                        + ',' + st.db.escape(pictureType);
                    st.db.query('CALL pSaveAlumniContent(' + query + ')', function (err, insertresult) {
                        if (!err) {
                            if (insertresult) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Alumni Content saved successfully';
                                responseMessage.data = {
                                    token: req.body.token,
                                    tid: req.body.tid,
                                    pg_pic: req.body.pg_pic,
                                    pg_picName: req.body.pg_picName,
                                    pg_picType: req.body.pg_picType,
                                    pg_title: req.body.pg_title,
                                    pg_subtitle: req.body.pg_subtitle,
                                    footerL1: req.body.footerL1,
                                    footerL2: req.body.footerL2,
                                    idea_title: req.body.idea_title,
                                    idea_text: req.body.idea_text,
                                    purpose_title: req.body.purpose_title,
                                    purpose_text: req.body.purpose_text,
                                    team_title: req.body.team_title,
                                    team_subtitle: req.body.team_subtitle,
                                    m_footer1: req.body.m_footer1,
                                    m_footer2: req.body.m_footer2,
                                    logo: req.body.logo,
                                    l_name: req.body.l_name,
                                    l_type: req.body.l_type,
                                    logo_title: req.body.logo_title,
                                    alumni_id: req.body.alumni_id,
                                    m_title: req.body.m_title,
                                    m_subtitle: req.body.m_subtitle,
                                    f_title: req.body.f_title,
                                    f_subtitle: req.body.f_subtitle,
                                    height : height,
                                    width : width
                                };
                                res.status(200).json(responseMessage);
                                console.log('FnSaveAlumniContent: Alumni Content saved successfully');
                            }
                            else {
                                responseMessage.message = 'No save Alumni Content';
                                res.status(400).json(responseMessage);
                                console.log('FnSaveAlumniContent:No save Alumni Content');
                            }
                        }
                        else {
                            responseMessage.message = 'An error occured ! Please try again';
                            res.status(500).json(responseMessage);
                            console.log('FnSaveAlumniContent: error in saving Alumni Content:' + err);
                        }
                    });
                }
                else {
                    responseMessage.message = 'Picture not uploaded';
                    res.status(200).json(responseMessage);
                    console.log('FnSaveAlumniTeam:Picture not uploaded');
                }
            });
        }
        //            else {
        //                responseMessage.message = 'Invalid token';
        //                responseMessage.error = {
        //                    token: 'Invalid token'
        //                };
        //                responseMessage.data = null;
        //                res.status(401).json(responseMessage);
        //                console.log('FnSaveAlumniContent: Invalid token');
        //            }
        //        }
        //        else {
        //            responseMessage.error = {
        //                server: 'Internal server error'
        //            };
        //            responseMessage.message = 'Error in validating Token';
        //            res.status(500).json(responseMessage);
        //            console.log('FnSaveAlumniContent:Error in processing Token' + err);
        //        }
        //    });
        //}
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveAlumniContent:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @todo FnSaveAlumniTeam
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save alumni team details
 */
Alumni.prototype.saveAlumniTeam = function(req,res,next) {
    var _this = this;

    //var token = req.body.token;
    var tid = req.body.tid;      // while saving time 0 else id of user
    var picture = req.body.picture;
    var pictureTitle = req.body.p_title;
    var pictureType = req.body.p_type;
    var jobTitle = req.body.job_title;
    var company = req.body.company;
    var profile = req.body.profile;
    var seqNo = req.body.seq_no;
    var type = req.body.type;     // 0=core group 1=mentor 2=faculty
    var alumniId = req.body.alumni_id;
    var alumniRole = req.body.alumni_role;
    var username = req.body.username;
    var width = req.body.width ?  req.body.width : 1200;
    var height = req.body.height ? req.body.height : 600;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
    if(!tid){
        tid = 0;
    }
    if(parseInt(tid) == NaN){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }
    //if(!picture){
    //    error['picture'] = 'Invalid picture';
    //    validateStatus *= false;
    //}
    if(!jobTitle){
        error['jobTitle'] = 'Invalid jobTitle';
        validateStatus *= false;
    }
    if(!company){
        error['company'] = 'Invalid company';
        validateStatus *= false;
    }
    if(!profile){
        error['profile'] = 'Invalid profile';
        validateStatus *= false;
    }
    if(!seqNo){
        seqNo = 0;
    }
    if(parseInt(seqNo) == NaN){
        error['seqNo'] = 'Invalid seqNo';
        validateStatus *= false;
    }
    if(!type){
        type = 0;
    }
    if(parseInt(type) == NaN){
        error['type'] = 'Invalid type';
        validateStatus *= false;
    }
    if(!alumniId){
        error['alumniId'] = 'Invalid alumniId';
        validateStatus *= false;
    }
    if(!alumniRole){
        error['alumniRole'] = 'Invalid alumniRole';
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
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {

            var imageParams = {
                path : req.files.picture.path,
                //path1 : req.files.picture[1].path,
                type : pictureType,
                width : width,
                height : height,
                scale : '',
                crop : ''
            };

            FnCropImage(imageParams, function (err, imageResult) {
                if(imageResult) {
                    var query = st.db.escape(tid) + ',' + st.db.escape(imageResult) + ',' + st.db.escape(jobTitle)
                        + ',' + st.db.escape(company) + ',' + st.db.escape(profile) + ',' + st.db.escape(seqNo)
                        + ',' + st.db.escape(type) + ',' + st.db.escape(alumniId) + ',' + st.db.escape(alumniRole)
                        + ',' + st.db.escape(pictureTitle) + ',' + st.db.escape(pictureType) + ',' + st.db.escape(username);

                    st.db.query('CALL pSaveAlumniTeam(' + query + ')', function (err, insertresult) {
                        if (!err) {
                            if (insertresult) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Alumni Team saved successfully';
                                responseMessage.data = {
                                    token: req.body.token,
                                    tid: req.body.tid,
                                    picture: req.body.picture,
                                    p_title: req.body.p_title,
                                    p_type: req.body.p_type,
                                    job_title: req.body.job_title,
                                    company: req.body.company,
                                    profile: req.body.profile,
                                    seq_no: req.body.seq_no,
                                    type: req.body.type,
                                    alumni_id: req.body.alumni_id,
                                    alumni_role: req.body.alumni_role,
                                    username: req.body.username,
                                    height : height,
                                    width : width
                                };
                                res.status(200).json(responseMessage);
                                console.log('FnSaveAlumniTeam: Alumni Team saved successfully');
                            }
                            else {
                                responseMessage.message = 'No save Alumni Team';
                                res.status(200).json(responseMessage);
                                console.log('FnSaveAlumniTeam:No save Alumni Team');
                            }
                        }
                        else {
                            responseMessage.message = 'An error occured ! Please try again';
                            res.status(500).json(responseMessage);
                            console.log('FnSaveAlumniTeam: error in saving Alumni Team:' + err);
                        }
                    });
                }
                else {
                    responseMessage.message = 'Picture not uploaded';
                    res.status(200).json(responseMessage);
                    console.log('FnSaveAlumniTeam:Picture not uploaded');
                }
        });
        }
        //            else {
        //                responseMessage.message = 'Invalid token';
        //                responseMessage.error = {
        //                    token: 'Invalid token'
        //                };
        //                responseMessage.data = null;
        //                res.status(401).json(responseMessage);
        //                console.log('FnSaveAlumniTeam: Invalid token');
        //            }
        //        }
        //        else {
        //            responseMessage.error = {
        //                server: 'Internal server error'
        //            };
        //            responseMessage.message = 'Error in validating Token';
        //            res.status(500).json(responseMessage);
        //            console.log('FnSaveAlumniTeam:Error in processing Token' + err);
        //        }
        //    });
        //}
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveAlumniTeam:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};



//crop image
function FnCropImage(imageParams, callback){
    /**
     * @todo FnCropImage
     */
    var _this = this;

    var fs = require('fs');
    var deleteTempFile = function(){
        fs.unlink('../bin/'+imageParams.path);
        //fs.unlink('../bin/'+imageParams.path1);
    };

    var respMsg = {
        status : false,
        message : 'Invalid image',
        picture : null,
        error : {
            picture : 'Image file is invalid or corrupted'
        }
    };

    var allowedTypes = ['jpg','png'];

    var  targetHeight = (imageParams.height) ? (!isNaN(parseInt(imageParams.height)) ? parseInt(imageParams.height) : 0 ) : 0  ,
        targetWidth = (imageParams.width) ? (!isNaN(parseInt(imageParams.width)) ? parseInt(imageParams.width) : 0 ) : 0  ;


    var scaleHeight = null,scaleWidth = null;

    var cropFlag = (imageParams.crop) ? imageParams.crop : true;
    var scaleFlag = (imageParams.scale) ? imageParams.scale : true;
    //var token = (req.body.Token && req.body.Token !==2 ) ? req.body.Token : '';
    var outputType = (allowedTypes.indexOf(imageParams.type) == -1) ? 'png' : imageParams.type;

    if(!(targetHeight && targetWidth)){
        respMsg.message = 'Invalid target dimensions';
        respMsg.error = {
            required_height : (targetHeight) ? 'Invalid target height' : null,
            required_width : (targetWidth) ? 'Invalid target width' : null
        };
        //res.status(400).json(respMsg);
        callback(null, null);
        deleteTempFile();
        return;
    }

    //if(!token){
    //    respMsg.message = 'Please login to continue';
    //    respMsg.error = {
    //        Token : 'Token is invalid'
    //    };
    //    res.status(401).json(respMsg);
    //    //deleteTempFile();
    //    return;
    //}

    //st.validateToken(token, function (err, Result) {
    //    if (!err) {
    //        if (Result != null) {
                try{
                    fs.readFile('../bin/'+ imageParams.path,function(err,data){
                        if(!err){
                           var bitmap = data;
                            var gm = require('gm').subClass({ imageMagick: true });
                            gm(bitmap).size(function (err, size) {
                                if (!err) {
                                    // Orientation landscape
                                    if(size.height < size.width){
                                        // scale++
                                        if(size.height < targetHeight || size.width < targetWidth){
                                            if(targetHeight > targetWidth){
                                                console.log("executing condition 1 : sOrient: landscape & scale++ & tOrient : potrait");
                                                scaleHeight = targetHeight.toString();
                                                ////
                                                scaleWidth = (size.width * scaleHeight)/ size.height;
                                            }
                                            else{
                                                console.log("executing condition 2 : sOrient: landscape & scale++ & tOrient : landscape");
                                                scaleHeight = targetHeight;
                                                scaleWidth = (size.width * scaleHeight) / size.height;
                                            }
                                        }
                                        // scale--
                                        else{
                                            if(targetHeight > targetWidth){
                                                console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : landscape");
                                                scaleWidth = targetWidth.toString();
                                                ////
                                                scaleHeight = (scaleWidth * size.height)/ size.width;
                                            }
                                            else{

                                                console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : potrait");
                                                scaleHeight = targetHeight.toString();
                                                scaleWidth = (scaleHeight * size.width) / size.height;

                                            }
                                        }
                                    }

                                    // Orientation is potrait
                                    else{
                                        //scale++
                                        if(size.height < targetHeight || size.width < targetHeight){
                                            if(targetHeight > targetWidth){
                                                console.log('condition false');

                                                scaleHeight = targetHeight.toString();
                                                scaleWidth = (scaleHeight * size.width)/ size.height;
                                            }
                                            else{
                                                scaleWidth = targetWidth.toString();
                                                scaleHeight = (scaleWidth * size.height) / size.width;
                                            }
                                        }
                                        else{
                                            scaleWidth = targetWidth.toString();
                                            scaleHeight = (scaleWidth * size.height) / size.width;
                                        }
                                    }

                                    var dimensions = {
                                        originalHeight : size.height,
                                        originalWidth : size.width,
                                        scaleHeight : scaleHeight,
                                        scaleWidth : scaleWidth,
                                        targetHeight : targetHeight,
                                        targetWidth : targetWidth
                                    };

                                    console.log(dimensions);

                                    if(scaleFlag && cropFlag){
                                        console.log('Scale and crop');
                                        gm(bitmap)
                                            .resize(scaleWidth,scaleHeight)
                                            .crop(targetWidth,targetHeight,0,0).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                                if(!err){
                                                    var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                                    var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                                    //res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                                    callback(null, picUrl);
                                                    deleteTempFile();
                                                    console.log('FnCropImage:Picture cropped successfully...');
                                                }
                                                else{
                                                    //res.status(400).json(respMsg);
                                                    callback(null, null);
                                                    deleteTempFile();
                                                    console.log('FnCropImage:Picture not cropped');
                                                }
                                            });
                                    }

                                    else if(scaleFlag && !cropFlag){
                                        gm(bitmap)
                                            .resize(scaleWidth,scaleHeight).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                                if(!err){
                                                    var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                                    var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                                    //res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                                    callback(null, picUrl);
                                                    console.log('FnCropImage:Picture cropped successfully');
                                                    deleteTempFile();

                                                }
                                                else{
                                                    //res.status(400).json(respMsg);
                                                    callback(null, null);
                                                    deleteTempFile();
                                                    console.log('FnCropImage:Picture not cropped');
                                                }
                                            });

                                    }

                                    else if(!scaleFlag && cropFlag){
                                        gm(bitmap)
                                            .crop(targetWidth,targetHeight,0,0).toBuffer(outputType.toUpperCase(),function(err,croppedBuff){
                                                if(!err){
                                                    var cdataUrl = new Buffer(croppedBuff).toString('base64');
                                                    var picUrl = 'data:image/'+outputType+';base64,'+cdataUrl;
                                                    //res.status(200).json({status : true, picture : picUrl, message : 'Picture cropped successfully'});
                                                    callback(null, picUrl);
                                                    console.log('FnCropImage:Picture cropped successfully');
                                                }
                                                else{
                                                    //res.status(400).json(respMsg);
                                                    callback(null, null);
                                                    console.log('FnCropImage:Picture not cropped');
                                                }
                                            });
                                        deleteTempFile();
                                    }
                                }
                                else{
                                    console.log('FnCropImage : Invalid image file. Unable to find image size :' +err);
                                    callback(null, null);

                                }
                            });
                        }
                       else{
                            callback(null, null);
                            console.log('FnCropImage : Error in reading file :' +err);

                       }
                    });

                }
                catch(ex){
                    console.log(ex);
                    callback(null, null);
                    console.log('FnCropImage : '+ ex.description);
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                }
            //}
    //        else{
    //            respMsg.message = 'Please login to continue';
    //            respMsg.error = {
    //                Token : 'Token is invalid'
    //            };
    //            res.status(401).json(respMsg);
    //            throw new Error('FnCropImage : '+ 'Invalid Token');
    //        }
    //    }
    //    else{
    //        throw new Error('FnCropImage : '+ 'Error in query execution while validating token');
    //        res.status(400).json(respMsg);
    //    }
    //});

};

/**
 * @todo FnGetAlumniContent
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get alumni content
 */
Alumni.prototype.getAlumniContent = function(req,res,next){
    var _this = this;

    //var token = req.query.token;
    var code = req.query.code;   // college code

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
    if(!code){
        error['code'] = 'Invalid code';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
                        var query = st.db.escape(code);
                        console.log('CALL pGetAlumniContent(' + query + ')');
                        st.db.query('CALL pGetAlumniContent(' + query + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Alumni content loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAlumniContent: Alumni content loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Alumni content not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAlumniContent: Alumni content not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Alumni content not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetAlumniContent: Alumni content not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetAlumniContent: error in getting alumni content :' + err);
                            }

                        });
                    }
        //            else {
        //                responseMessage.message = 'Invalid token';
        //                responseMessage.error = {
        //                    token: 'Invalid Token'
        //                };
        //                responseMessage.data = null;
        //                res.status(401).json(responseMessage);
        //                console.log('FnGetAlumniContent: Invalid token');
        //            }
        //        }
        //        else {
        //            responseMessage.error = {
        //                server: 'Internal Server Error'
        //            };
        //            responseMessage.message = 'Error in validating Token';
        //            res.status(500).json(responseMessage);
        //            console.log('FnGetAlumniContent:Error in processing Token' + err);
        //        }
        //    });
        //}
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetAlumniContent ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetAlumniTeam
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get alumni team
 */
Alumni.prototype.getAlumniTeam = function(req,res,next){
    var _this = this;

    //var token = req.query.token;
    var code = req.query.code;   // college code
    var type = req.query.type;   // 0=core group 1=mentor 2=faculty

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
    if(!code){
        error['code'] = 'Invalid code';
        validateStatus *= false;
    }
    if(!type){
        type = 0;
    }
    if(parseInt(type) == NaN){
        error['type'] = 'Invalid type';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
                        var query = st.db.escape(code) + ',' + st.db.escape(type);
                        console.log('CALL pGetAlumniTeam(' + query + ')');
                        st.db.query('CALL pGetAlumniTeam(' + query + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Alumni team loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAlumniTeam: Alumni team loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Alumni team not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAlumniTeam: Alumni team not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Alumni team not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetAlumniTeam: Alumni team not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetAlumniTeam: error in getting alumni team :' + err);
                            }

                        });
                    }
        //            else {
        //                responseMessage.message = 'Invalid token';
        //                responseMessage.error = {
        //                    token: 'Invalid Token'
        //                };
        //                responseMessage.data = null;
        //                res.status(401).json(responseMessage);
        //                console.log('FnGetAlumniTeam: Invalid token');
        //            }
        //        }
        //        else {
        //            responseMessage.error = {
        //                server: 'Internal Server Error'
        //            };
        //            responseMessage.message = 'Error in validating Token';
        //            res.status(500).json(responseMessage);
        //            console.log('FnGetAlumniTeam:Error in processing Token' + err);
        //        }
        //    });
        //}
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetAlumniTeam ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnDeleteAlumniTeam
 * Method : Delete
 * @param req
 * @param res
 * @param next
 * @description api code for delete alumni team
 */
Alumni.prototype.deleteAlumniTeam = function(req,res,next){
    var _this = this;

    //var token = req.query.token;
    var id = req.query.id;     // alumni team id

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
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
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
                        var query = st.db.escape(id);
                        console.log('CALL PDeleteAlumniTeam(' + query + ')');
                        st.db.query('CALL PDeleteAlumniTeam(' + query + ')', function (err, getResult) {
                            console.log(getResult);
                            if (!err) {
                                if (getResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Alumni team deleted successfully';
                                    responseMessage.data = { id : req.query.id };
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteAlumniTeam: Alumni team deleted successfully');
                                }
                                else {
                                    responseMessage.message = 'Alumni team not deleted';
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteAlumniTeam: Alumni team not deleted');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnDeleteAlumniTeam: error in deleting alumni team :' + err);
                            }

                        });
                    }
        //            else {
        //                responseMessage.message = 'Invalid token';
        //                responseMessage.error = {
        //                    token: 'Invalid Token'
        //                };
        //                responseMessage.data = null;
        //                res.status(401).json(responseMessage);
        //                console.log('FnDeleteAlumniTeam: Invalid token');
        //            }
        //        }
        //        else {
        //            responseMessage.error = {
        //                server: 'Internal Server Error'
        //            };
        //            responseMessage.message = 'Error in validating Token';
        //            res.status(500).json(responseMessage);
        //            console.log('FnDeleteAlumniTeam:Error in processing Token' + err);
        //        }
        //    });
        //}
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnDeleteAlumniTeam : ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetAlumniContentImage
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get alumni content
 */
Alumni.prototype.getAlumniContentImage = function(req,res,next){
    var _this = this;

    var code = req.query.code;   // college code

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    if(!code){
        error['code'] = 'Invalid code';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var query = st.db.escape(code);
            console.log('CALL pGetAlumniContentImage(' + query + ')');
            st.db.query('CALL pGetAlumniContentImage(' + query + ')', function (err, getResult) {
                if (!err) {
                    if (getResult[0]) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Cover Image loaded successfully';
                        responseMessage.data = getResult[0][0];
                        res.status(200).json(responseMessage);
                        console.log('FnGetAlumniContentImage: Cover Image loaded successfully');
                    }
                    else {
                        responseMessage.message = 'Cover Image not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetAlumniContentImage: Cover Image not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured in query ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetAlumniContentImage: error in getting Cover Image :' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetAlumniContentImage ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnSaveAlumniProfile
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save alumni team profile
 */
Alumni.prototype.saveAlumniProfile = function(req,res,next) {
    var _this = this;

    //var token = req.body.token;
    var ezeone_id = req.body.ezeone_id;
    var profile = req.body.profile;
    var studentID = req.body.student_id;
    var education = req.body.education;
    var specialization = req.body.specialization;
    var batch = req.body.batch;
    var code = req.body.code;     // college code
    var accesstype = req.body.access_type;  // 0-no relation, 1-is admin, 2-is member
    var tid = req.body.tid;           // while saving first time 0 else give tid

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
    if(!ezeone_id){
        error['ezeone_id'] = 'Invalid ezeone_id';
        validateStatus *= false;
    }
    if(!profile){
        error['profile'] = 'Invalid profile';
        validateStatus *= false;
    }
    if(!studentID){
        error['studentID'] = 'Invalid studentID';
        validateStatus *= false;
    }
    if(!education){
        error['education'] = 'Invalid education';
        validateStatus *= false;
    }
    if(!specialization){
        error['specialization'] = 'Invalid specialization';
        validateStatus *= false;
    }
    if(!batch){
        error['batch'] = 'Invalid batch';
        validateStatus *= false;
    }
    if(!code){
        error['code'] = 'Invalid code';
        validateStatus *= false;
    }
    if(!accesstype){
        accesstype = 0;
    }
    if(parseInt(code) == NaN){
        error['accesstype'] = 'Invalid accesstype';
        validateStatus *= false;
    }
    if(!tid){
        tid = 0;
    }
    if(parseInt(tid) == NaN){
        error['tid'] = 'Invalid tid';
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
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
                    var query = st.db.escape(ezeone_id) + ',' + st.db.escape(profile) + ',' + st.db.escape(studentID)
                        + ',' + st.db.escape(education) + ',' + st.db.escape(specialization) + ',' + st.db.escape(batch)
                        + ',' + st.db.escape(code) + ',' + st.db.escape(accesstype) + ',' + st.db.escape(tid);

                    st.db.query('CALL pSaveAlumniProfile(' + query + ')', function (err, insertresult) {
                        if (!err) {
                            if (insertresult) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Alumni Profile saved successfully';
                                responseMessage.data = {
                                    ezeone_id : req.body.ezeone_id,
                                    profile : req.body.profile,
                                    student_id : req.body.student_id,
                                    education : req.body.education,
                                    specialization : req.body.specialization,
                                    batch : req.body.batch,
                                    code : req.body.code,
                                    access_type : req.body.access_type,
                                    tid : req.body.tid

                            };
                                res.status(200).json(responseMessage);
                                console.log('FnSaveAlumniProfile: Alumni Profile saved successfully');
                            }
                            else {
                                responseMessage.message = 'No save Alumni Profile';
                                res.status(200).json(responseMessage);
                                console.log('FnSaveAlumniProfile:No save Alumni Profile');
                            }
                        }
                        else {
                            responseMessage.message = 'An error occured ! Please try again';
                            res.status(500).json(responseMessage);
                            console.log('FnSaveAlumniProfile: error in saving Alumni Profile:' + err);
                        }
            });
        }
            //            else {
            //                responseMessage.message = 'Invalid token';
            //                responseMessage.error = {
            //                    token: 'Invalid token'
            //                };
            //                responseMessage.data = null;
            //                res.status(401).json(responseMessage);
            //                console.log('FnSaveAlumniProfile: Invalid token');
            //            }
            //        }
            //        else {
            //            responseMessage.error = {
            //                server: 'Internal server error'
            //            };
            //            responseMessage.message = 'Error in validating Token';
            //            res.status(500).json(responseMessage);
            //            console.log('FnSaveAlumniProfile:Error in processing Token' + err);
            //        }
            //    });
            //}
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveAlumniProfile:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};


/**
 * @todo FnGetAlumniTeamDetails
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get alumni content
 */
Alumni.prototype.getAlumniTeamDetails = function(req,res,next){
    var _this = this;

    //var token = req.query.token;
    var tid = req.query.tid;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    //if(!token){
    //    error['token'] = 'Invalid token';
    //    validateStatus *= false;
    //}
    if(!tid){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            //st.validateToken(token, function (err, result) {
            //    if (!err) {
            //        if (result) {
            var query = st.db.escape(tid);
            console.log('CALL pGetAlumniTeamDetails(' + query + ')');
            st.db.query('CALL pGetAlumniTeamDetails(' + query + ')', function (err, getResult) {
                if (!err) {
                    if (getResult[0]) {
                        if (getResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'AlumniTeam Details loaded successfully';
                            responseMessage.data = getResult[0][0];
                            res.status(200).json(responseMessage);
                            console.log('FnGetAlumniTeamDetails: AlumniTeam Details loaded successfully');
                        }
                        else {
                            responseMessage.message = 'AlumniTeam Details not loaded';
                            res.status(200).json(responseMessage);
                            console.log('FnGetAlumniTeamDetails: AlumniTeam Details not loaded');
                        }
                    }
                    else {
                        responseMessage.message = 'AlumniTeam Details not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetAlumniTeamDetails:AlumniTeam v not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured in query ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetAlumniTeamDetails: error in getting alumniteam Details :' + err);
                }

            });
        }
            //            else {
            //                responseMessage.message = 'Invalid token';
            //                responseMessage.error = {
            //                    token: 'Invalid Token'
            //                };
            //                responseMessage.data = null;
            //                res.status(401).json(responseMessage);
            //                console.log('FnGetAlumniTeamDetails: Invalid token');
            //            }
            //        }
            //        else {
            //            responseMessage.error = {
            //                server: 'Internal Server Error'
            //            };
            //            responseMessage.message = 'Error in validating Token';
            //            res.status(500).json(responseMessage);
            //            console.log('FnGetAlumniTeamDetails:Error in processing Token' + err);
            //        }
            //    });
            //}
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetAlumniTeamDetails ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnGetAlumniProfile
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get alumni profile
 */
Alumni.prototype.getAlumniProfile = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var code = req.query.code;   // college code

    console.log(req.query);

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
    if(!code){
        error['code'] = 'Invalid code';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var query = st.db.escape(token) + ',' + st.db.escape(code);
                        console.log('CALL pGetAlumniProfile(' + query + ')');
                        st.db.query('CALL pGetAlumniProfile(' + query + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Alumni profile loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAlumniProfile: Alumni profile loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Alumni profile not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAlumniProfile: Alumni profile not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Alumni profile not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetAlumniProfile: Alumni profile not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetAlumniProfile: error in getting alumni profile :' + err);
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
                        console.log('FnGetAlumniProfile: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetAlumniProfile:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetAlumniProfile ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = Alumni;

