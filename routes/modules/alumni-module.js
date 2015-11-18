/**
 *  @author Gowri shankar
 *  @since seotemper 10,2015 03:24 PM IST
 *  @title Alumni module
 *  @description Handles functions related to alumni profile and events
 */
var stream = require( "stream" );
var chalk = require( "chalk" );
var util = require( "util" );
// I turn the given source Buffer into a Readable stream.
function BufferStream( source ) {

    if ( ! Buffer.isBuffer( source ) ) {

        throw( new Error( "Source must be a buffer." ) );

    }

    // Super constructor.
    stream.Readable.call( this );

    this._source = source;

    // I keep track of which portion of the source buffer is currently being pushed
    // onto the internal stream buffer during read actions.
    this._offset = 0;
    this._length = source.length;

    // When the stream has ended, try to clean up the memory references.
    this.on( "end", this._destroy );

}

util.inherits( BufferStream, stream.Readable );


// I attempt to clean up variable references once the stream has been ended.
// --
// NOTE: I am not sure this is necessary. But, I'm trying to be more cognizant of memory
// usage since my Node.js apps will (eventually) never restart.
BufferStream.prototype._destroy = function() {

    this._source = null;
    this._offset = null;
    this._length = null;

};


// I read chunks from the source buffer into the underlying stream buffer.
// --
// NOTE: We can assume the size value will always be available since we are not
// altering the readable state options when initializing the Readable stream.
BufferStream.prototype._read = function( size ) {

    // If we haven't reached the end of the source buffer, push the next chunk onto
    // the internal stream buffer.
    if ( this._offset < this._length ) {

        this.push( this._source.slice( this._offset, ( this._offset + size ) ) );

        this._offset += size;

    }

    // If we've consumed the entire source buffer, close the readable stream.
    if ( this._offset >= this._length ) {

        this.push( null );

    }

};




"use strict";



var uuid = require('node-uuid');
var nodemailer = require("nodemailer");

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
                var queryParams = st.db.escape(IDTypeID) + ',' + st.db.escape(EZEID) + ',' + st.db.escape(EncryptPWD) + ',' + st.db.escape(FirstName) + ',' +
                    st.db.escape(LastName) + ',' + st.db.escape(CompanyName) + ',' + st.db.escape(JobTitle) + ',' + st.db.escape(FunctionID) + ',' +
                    st.db.escape(RoleID) + ',' + st.db.escape(LanguageID) + ',' + st.db.escape(NameTitleID) + ',' +
                    st.db.escape(TokenNo) + ',' + st.db.escape(Latitude) + ',' + st.db.escape(Longitude) + ',' + st.db.escape(Altitude) + ',' +
                    st.db.escape(AddressLine1) + ',' + st.db.escape(AddressLine2) + ',' + st.db.escape(Citytitle) + ',' + st.db.escape(StateID) + ',' + st.db.escape(CountryID) + ',' +
                    st.db.escape(PostalCode) + ',' + st.db.escape(PIN) + ',' + st.db.escape(PhoneNumber) + ',' + st.db.escape(MobileNumber) + ',' + st.db.escape(EMailID) + ',' +
                    st.db.escape(Picture) + ',' + st.db.escape(PictureFileName) + ',' + st.db.escape(WebSite) + ',' + st.db.escape(Operation) + ',' + st.db.escape(AboutCompany) + ','
                    + st.db.escape(StatusID) + ',' + st.db.escape(Icon) + ',' + st.db.escape(IconFileName) + ',' + st.db.escape(ISDPhoneNumber) + ',' + st.db.escape(ISDMobileNumber) + ','
                    + st.db.escape(Gender) + ',' + st.db.escape(DOBDate) + ',' + st.db.escape(IPAddress) + ',' + st.db.escape(SelectionTypes) + ',' + st.db.escape(ParkingStatus)+ ',' + st.db.escape(TemplateID)  + ',' + st.db.escape(CategoryID);

                var query = 'CALL pSaveEZEIDData(' + queryParams + ')';
                //console.log(InsertQuery);

                st.db.query(query, function (err, InsertResult) {
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
                                                var path = require('path');
                                                var file = path.join(__dirname,'../../mail/templates/registration.html');

                                                fs.readFile(file, "utf8", function (err, data) {

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
                                                var path = require('path');
                                                var file = path.join(__dirname,'../../mail/templates/registration.html');

                                                fs.readFile(file, "utf8", function (err, data) {
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

    var token = req.body.token;
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
    var page_pic,logo_pic,url,randomName,logo_url='',logo_name='';


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var error = {},validateStatus = true;
    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
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
        error['purposeText'] = 'Invalid purposeText';
        validateStatus *= false;
    }
    if(!teamTitle){
        error['teamTitle'] = 'Invalid teamTitle';
        validateStatus *= false;
    }
    if(!teamSubtitle){
        error['teamSubtitle'] = 'Invalid teamSubtitle';
        validateStatus *= false;
    }
    if(!mainFooter1){
        responseMessage.error['mainFooter1'] = 'Invalid mainFooter1';
        validateStatus *= false;
    }
    if(!mainFooter2){
        error['mainFooter2'] = 'Invalid mainFooter2';
        validateStatus *= false;
    }
    //if(!logo){
    //    error['logo'] = 'Invalid logo';
    //    validateStatus *= false;
    //}
    if(!logoTitle){
        error['mainFooter2'] = 'Invalid logoTitle';
        validateStatus *= false;
    }
    if(!alumniId){
        error['alumniId'] = 'Invalid alumniId';
        validateStatus *= false;
    }
    if(!mentorTitle){
        error['mentorTitle'] = 'Invalid mentorTitle';
        validateStatus *= false;
    }
    if(!mentorSubtitle){
        error['mentorSubtitle'] = 'Invalid mentorSubtitle';
        validateStatus *= false;
    }
    if(!facultyTitle){
        error['facultyTitle'] = 'Invalid facultyTitle';
        validateStatus *= false;
    }
    if(!facultySubtitle){
        error['facultySubtitle'] = 'Invalid facultySubtitle';
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        var pagePicture = function () {

                            var imageParams = {
                                path: req.files.pg_pic.path,
                                type: pictureType,
                                width: width,
                                height: height,
                                scale: '',
                                crop: ''
                            };
                            //console.log(imageParams);
                            //FnCropImage(imageParams, function (err, pictureResult) {
                            //
                            //    if (pictureResult) {
                            //        var params = {
                            //            page_pic: pictureResult
                            //        };
                            //        saveContent(params);
                            //    }
                            //});
                            FnCropImage(imageParams, function (err, imageBuffer) {

                                if (imageBuffer) {

                                    console.log('uploading to cloud server...');

                                    var uniqueId = uuid.v4();
                                    randomName = uniqueId + '.' + req.files.pg_pic.extension;

                                    var gcloud = require('gcloud');

                                    var fs = require('fs');


                                    var gcs = gcloud.storage({
                                        projectId: req.CONFIG.CONSTANT.GOOGLE_PROJECT_ID,
                                        keyFilename: req.CONFIG.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
                                    });

                                    // Reference an existing bucket.
                                    var bucket = gcs.bucket(req.CONFIG.CONSTANT.STORAGE_BUCKET);

                                    bucket.acl.default.add({
                                        entity: 'allUsers',
                                        role: gcs.acl.READER_ROLE
                                    }, function (err, aclObject) {
                                    });

                                    // Upload a local file to a new file to be created in your bucket

                                    var remoteWriteStream = bucket.file(randomName).createWriteStream();
                                    var bufferStream = new BufferStream(imageBuffer);
                                    bufferStream.pipe(remoteWriteStream);


                                    remoteWriteStream.on('finish', function () {
                                        console.log('file is uploaded to cloud');
                                        url = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName;
                                        saveContent(randomName, url);
                                    });

                                    remoteWriteStream.on('error', function () {
                                        responseMessage.message = 'An error occurred';
                                        responseMessage.error = {
                                            server: 'Cloud Server error'
                                        };
                                        responseMessage.data = null;
                                        res.status(400).json(responseMessage);
                                        console.log('FnSaveAlumniContent: Image upload error in cloud');

                                    });
                                }
                            });
                        };


                        var saveContent = function(randomName,url) {

                            function isURl(str, callback) {

                                var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                                //return regexp.test(s);
                                callback(null, regexp.test(str));
                            }

                            if(req.body.logo) {

                                isURl(req.body.logo, function (err, str) {
                                    console.log('----isurl---');
                                    console.log(str);
                                    if (str == false) {

                                        var uniqueId = uuid.v4();
                                        var type = logoType.split('/');
                                        logo_name = uniqueId + '.' + type[1];
                                        //console.log(logo_name);

                                        var bufferData = new Buffer((req.body.logo).replace(/^data:image\/(png|gif|jpeg|jpg);base64,/, ''), 'base64');
                                        var gcloud = require('gcloud');

                                        var fs = require('fs');


                                        var gcs = gcloud.storage({
                                            projectId: req.CONFIG.CONSTANT.GOOGLE_PROJECT_ID,
                                            keyFilename: req.CONFIG.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
                                        });

                                        // Reference an existing bucket.
                                        var bucket = gcs.bucket(req.CONFIG.CONSTANT.STORAGE_BUCKET);

                                        bucket.acl.default.add({
                                            entity: 'allUsers',
                                            role: gcs.acl.READER_ROLE
                                        }, function (err, aclObject) {
                                        });

                                        // Upload a local file to a new file to be created in your bucket

                                        var remoteWriteStream = bucket.file(logo_name).createWriteStream();
                                        var bufferStream = new BufferStream(bufferData);
                                        bufferStream.pipe(remoteWriteStream);


                                        remoteWriteStream.on('finish', function () {
                                            console.log('file is uploaded to cloud');
                                            logo_url = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + logo_name;
                                        });
                                        remoteWriteStream.on('error', function () {
                                            logo_name = '';
                                            console.log('FnSaveAlumniContent: logo upload error in cloud');

                                        });
                                    }
                                    else {

                                        //https://storage.googleapis.com/ezeone/d65285bd-fb2f-4fc7-a214-a4fbc38b26be.jpg
                                        console.log('save url...');
                                        logo_name = ((req.body.logo).replace(/^https:\/\/storage.googleapis.com/, '')).split('/');
                                        logo_name = logo_name[2];
                                        console.log(logo_name);
                                    }


                                    var queryParams = st.db.escape(tid) + ',' + st.db.escape(randomName) + ',' + st.db.escape(title)
                                        + ',' + st.db.escape(subTitle) + ',' + st.db.escape(footerL1) + ',' + st.db.escape(footerL2)
                                        + ',' + st.db.escape(ideaTitle) + ',' + st.db.escape(ideaText) + ',' + st.db.escape(purposeTitle)
                                        + ',' + st.db.escape(purposeText) + ',' + st.db.escape(teamTitle) + ',' + st.db.escape(teamSubtitle)
                                        + ',' + st.db.escape(mainFooter1) + ',' + st.db.escape(mainFooter2) + ',' + st.db.escape(logo_name)
                                        + ',' + st.db.escape(logoTitle) + ',' + st.db.escape(alumniId) + ',' + st.db.escape(mentorTitle)
                                        + ',' + st.db.escape(mentorSubtitle) + ',' + st.db.escape(facultyTitle) + ',' + st.db.escape(facultySubtitle)
                                        + ',' + st.db.escape(logoName) + ',' + st.db.escape(logoType) + ',' + st.db.escape(pictureTitle)
                                        + ',' + st.db.escape(pictureType);

                                    var query = 'CALL pSaveAlumniContent(' + queryParams + ')';
                                    //console.log(query);
                                    st.db.query(query, function (err, insertresult) {
                                        if (!err) {
                                            if (insertresult) {
                                                responseMessage.status = true;
                                                responseMessage.error = null;
                                                responseMessage.message = 'Alumni Content saved successfully';
                                                responseMessage.data = {
                                                    tid: req.body.tid,
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
                                                    l_name: req.body.l_name,
                                                    l_type: req.body.l_type,
                                                    logo_title: req.body.logo_title,
                                                    alumni_id: req.body.alumni_id,
                                                    m_title: req.body.m_title,
                                                    m_subtitle: req.body.m_subtitle,
                                                    f_title: req.body.f_title,
                                                    f_subtitle: req.body.f_subtitle,
                                                    height: height,
                                                    width: width,
                                                    pg_pic: url,
                                                    logo_url: req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + logo_name
                                                };
                                                res.status(200).json(responseMessage);
                                                console.log('FnSaveAlumniContent: Alumni Content saved successfully');
                                            }
                                            else {
                                                responseMessage.message = 'No save Alumni Content';
                                                res.status(200).json(responseMessage);
                                                console.log('FnSaveAlumniContent:No save Alumni Content');
                                            }
                                        }
                                        else {
                                            responseMessage.message = 'An error occured ! Please try again';
                                            res.status(500).json(responseMessage);
                                            console.log('FnSaveAlumniContent: error in saving Alumni Content:' + err);
                                        }
                                    });
                                });
                            }

                            };


                        if (req.files.pg_pic) {
                            console.log('c1...');
                            pagePicture();
                        }
                        else {
                            console.log('c2...');
                            randomName = '';
                            url = '';
                            saveContent(randomName,url);
                        }

                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveAlumniContent: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveAlumniContent:Error in processing Token' + err);
                }
            });
        }
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

    var token = req.body.token;
    var tid = req.body.tid;      // while saving time 0 else id of user
    var picture = req.body.picture;
    var pictureTitle = req.body.p_title;
    var pictureType = req.body.p_type;
    var jobTitle = req.body.job_title;
    var company = req.body.company;
    var profile = req.body.profile;
    var seqNo = parseInt(req.body.seq_no);
    var type = parseInt(req.body.type);     // 0=core group 1=mentor 2=faculty
    var alumniId = parseInt(req.body.alumni_id);
    var alumniRole = req.body.alumni_role;
    var username = req.body.username;
    var width = req.body.width ?  req.body.width : 1200;
    var height = req.body.height ? req.body.height : 600;
    var image;



    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        var teamPicture = function () {

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
                                    image = {
                                        pic: imageResult
                                    };
                                    saveTeam(image);
                                }
                                else {
                                    console.log('No image cropped');
                                }
                            });
                        };

                        var saveTeam = function (image) {
                            var queryParams = st.db.escape(tid) + ',' + st.db.escape(image.pic) + ',' + st.db.escape(jobTitle)
                                + ',' + st.db.escape(company) + ',' + st.db.escape(profile) + ',' + st.db.escape(seqNo)
                                + ',' + st.db.escape(type) + ',' + st.db.escape(alumniId) + ',' + st.db.escape(alumniRole)
                                + ',' + st.db.escape(pictureTitle) + ',' + st.db.escape(pictureType) + ',' + st.db.escape(username)
                                + ',' + st.db.escape(token);

                            var query = 'CALL pSaveAlumniTeam(' + queryParams + ')';

                            st.db.query(query, function (err, insertresult) {
                                if (!err) {
                                    if (insertresult) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Alumni Team saved successfully';
                                        responseMessage.data = {
                                            token: req.body.token,
                                            tid: req.body.tid,
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
                                            height: height,
                                            width: width
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
                        };
                        if (req.files.picture) {
                            teamPicture();
                        }
                        else {
                            image = {
                                pic: req.body.picture
                            };
                            saveTeam(image);
                        }
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveAlumniTeam: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveAlumniTeam:Error in processing Token' + err);
                }
            });
        }
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
                                    //console.log("executing condition 1 : sOrient: landscape & scale++ & tOrient : potrait");
                                    scaleHeight = targetHeight.toString();
                                    ////
                                    scaleWidth = (size.width * scaleHeight)/ size.height;
                                }
                                else{
                                    //console.log("executing condition 2 : sOrient: landscape & scale++ & tOrient : landscape");
                                    scaleHeight = targetHeight;
                                    scaleWidth = (size.width * scaleHeight) / size.height;
                                }
                            }
                            // scale--
                            else{
                                if(targetHeight > targetWidth){
                                    //console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : landscape");
                                    scaleWidth = targetWidth.toString();
                                    ////
                                    scaleHeight = (scaleWidth * size.height)/ size.width;
                                }
                                else{

                                    //console.log("executing condition 2 : sOrient: landscape & scale-- & tOrient : potrait");
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
                                        callback(null, croppedBuff);
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
                                        callback(null, croppedBuff);
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
                                        callback(null, croppedBuff);
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
                //console.log(getResult);
                if (!err) {
                    if (getResult[0]) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Alumni content loaded successfully';
                        getResult[0][0].logo = (getResult[0][0].logo) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[0][0].logo):'';
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

    var token = req.query.token;
    var code = req.query.code;   // college code
    var type = parseInt(req.query.type);   // 0=core group 1=mentor 2=faculty

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        var queryParams = st.db.escape(code) + ',' + st.db.escape(type);
                        var query = 'CALL pGetAlumniTeam(' + queryParams + ')';
                        //console.log(query);

                        st.db.query(query, function (err, getResult) {
                            //console.log(getResult);
                            if (!err) {
                                if (getResult[0]) {
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
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetAlumniTeam: error in getting alumni team :' + err);
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
                        console.log('FnGetAlumniTeam: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetAlumniTeam:Error in processing Token' + err);
                }
            });
        }
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

    var token = req.query.token;
    var id = req.query.id;     // alumni team id

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        var query = st.db.escape(id);
                        console.log('CALL PDeleteAlumniTeam(' + query + ')');
                        st.db.query('CALL PDeleteAlumniTeam(' + query + ')', function (err, getResult) {
                            console.log(getResult);
                            if (!err) {
                                if (getResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Alumni team deleted successfully';
                                    responseMessage.data = {id: req.query.id};
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
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnDeleteAlumniTeam: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnDeleteAlumniTeam:Error in processing Token' + err);
                }
            });
        }
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
                        getResult[0][0].pg_pic = (getResult[0][0].pg_pic) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[0][0].pg_pic):'';
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

    var token = req.body.token;
    var profile = req.body.profile;
    var studentID = req.body.student_id;
    var education = parseInt(req.body.education);
    var specialization = parseInt(req.body.specialization);
    var batch = req.body.batch;
    var code = req.body.code;     // college code
    var accesstype = req.body.access_type;  // 0-no relation, 1-is admin, 2-is member
    var ps;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    if(!token){
        error['token'] = 'Invalid token';
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
    //if(!batch){
    //    error['batch'] = 'Invalid batch';
    //    validateStatus *= false;
    //}
    //if(!code){
    //    error['code'] = 'Invalid code';
    //    validateStatus *= false;
    //}
    if(!accesstype){
        accesstype = 0;
    }
    if(parseInt(accesstype) == NaN){
        error['accesstype'] = 'Invalid accesstype';
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(profile) + ',' + st.db.escape(studentID)
                            + ',' + st.db.escape(education) + ',' + st.db.escape(specialization) + ',' + st.db.escape(batch)
                            + ',' + st.db.escape(code) + ',' + st.db.escape(accesstype);

                        var query = 'CALL pSaveAlumniProfile(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, insertresult) {
                            //console.log(insertresult);
                            if (!err) {
                                if (insertresult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Alumni Profile saved successfully';
                                    if(insertresult[0][0]){
                                        ps = insertresult[0][0].profilestatus;
                                    }
                                    else
                                    { ps = '';}
                                    responseMessage.data = {
                                        profile_status : ps,
                                        profile: req.body.profile,
                                        student_id: req.body.student_id,
                                        education: req.body.education,
                                        specialization: req.body.specialization,
                                        batch: req.body.batch,
                                        code: req.body.code,
                                        access_type: req.body.access_type
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
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveAlumniProfile: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveAlumniProfile:Error in processing Token' + err);
                }
            });
        }
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

    var token = req.query.token;
    var tid = req.query.tid;

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var query = st.db.escape(tid);
                        console.log('CALL pGetAlumniTeamDetails(' + query + ')');
                        st.db.query('CALL pGetAlumniTeamDetails(' + query + ')', function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
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
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid Token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetAlumniTeamDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetAlumniTeamDetails:Error in processing Token' + err);
                }
            });
        }
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
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(code);

                        var query = 'CALL pGetAlumniProfile(' + queryParams + ')';

                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
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

/**
 * @todo FnSaveTENMaster
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save ten master details
 */
Alumni.prototype.saveTENMaster = function(req,res,next) {
    var _this = this;

    var token = req.body.token;
    var tid = req.body.tid ? req.body.tid : 0;      // while saving time 0 else id of user
    var title = req.body.title;
    var description = req.body.description;
    var startDate = req.body.s_date;
    var endDate = req.body.e_date;
    var status = req.body.status;   // 1(pending),2=closed,3=on-hold,4=canceled
    var regLastDate = req.body.reg_lastdate;
    var type = req.body.type;     // 1(training),2=event,3=news,4=knowledge
    var note = req.body.note;
    var venueId = req.body.venue_id;
    var attachment = req.body.attachment ? req.body.attachment : '';
    var code = req.body.code;
    var capacity = req.body.capacity ? req.body.capacity : 0;
    var attachmenttitle = req.body.a_title ? req.body.a_title : '';
    var attachmenttype = req.body.a_type ? req.body.a_type : '';
    var randomName,filetype,url,bufferData;


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        tid = 0;
    }
    if(parseInt(tid) == NaN){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }
    if(!status){
        error['status'] = 'Invalid status';
        validateStatus *= false;
    }
    if(!type){
        error['type'] = 'Invalid type';
        validateStatus *= false;
    }
    if(!code){
        error['code'] = 'Invalid code';
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        var uploadToCloud = function(){

                            filetype = attachmenttitle.split('.');
                            var uniqueId = uuid.v4();
                            randomName = uniqueId + '.' + filetype[1];

                            bufferData = new Buffer((req.body.attachment).replace(/^data:image\/(png|gif|jpeg|jpg);base64,/, ''),  'base64');

                            if (bufferData) {

                                console.log('uploading to cloud server...');

                                var gcloud = require('gcloud');

                                var fs = require('fs');


                                var gcs = gcloud.storage({
                                    projectId: req.CONFIG.CONSTANT.GOOGLE_PROJECT_ID,
                                    keyFilename: req.CONFIG.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
                                });

                                // Reference an existing bucket.
                                var bucket = gcs.bucket(req.CONFIG.CONSTANT.STORAGE_BUCKET);

                                bucket.acl.default.add({
                                    entity: 'allUsers',
                                    role: gcs.acl.READER_ROLE
                                }, function (err, aclObject) {
                                });

                                // Upload a local file to a new file to be created in your bucket

                                var remoteWriteStream = bucket.file(randomName).createWriteStream();
                                var bufferStream = new BufferStream(bufferData);
                                bufferStream.pipe(remoteWriteStream);

                                remoteWriteStream.on('finish', function () {
                                    console.log('file uploaded to cloud');
                                    url = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName;
                                    saveTenmaster(randomName, url);
                                });
                                remoteWriteStream.on('error', function () {
                                    responseMessage.message = 'An error occurred';
                                    responseMessage.error = {
                                        server: 'cloud Server error'
                                    };
                                    responseMessage.data = null;
                                    res.status(400).json(responseMessage);
                                    console.log('FnSaveTENMaster: file upload error in cloud');

                                });
                            }

                        };

                        var saveTenmaster = function(randomName,url) {

                            var queryParams = st.db.escape(tid) + ',' + st.db.escape(title) + ',' + st.db.escape(description)
                                + ',' + st.db.escape(startDate) + ',' + st.db.escape(endDate) + ',' + st.db.escape(status)
                                + ',' + st.db.escape(regLastDate) + ',' + st.db.escape(type) + ',' + st.db.escape(token)
                                + ',' + st.db.escape(note) + ',' + st.db.escape(venueId) + ',' + st.db.escape(randomName)
                                + ',' + st.db.escape(code) + ',' + st.db.escape(capacity) + ',' + st.db.escape(attachmenttitle)
                                + ',' + st.db.escape(attachmenttype);
                            var query = 'CALL pSaveTENMaster(' + queryParams + ')';

                            console.log(query);

                            st.db.query(query, function (err, insertresult) {
                                if (!err) {
                                    if (insertresult) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Data saved successfully';
                                        responseMessage.data = {
                                            token: req.body.token,
                                            tid: req.body.tid,
                                            title: req.body.title,
                                            description: req.body.description,
                                            s_date: req.body.s_date,
                                            e_date: req.body.e_date,
                                            status: req.body.status,
                                            reg_lastdate: req.body.reg_lastdate,
                                            type: req.body.type,
                                            ezeone_id: req.body.ezeone_id,
                                            note: req.body.note,
                                            venue_id: req.body.venue_id,
                                            code: req.body.code,
                                            a_title: req.body.a_title,
                                            a_type: req.body.a_type,
                                            s_url : url
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveTENMaster: Data saved successfully');
                                    }
                                    else {
                                        responseMessage.message = 'No save Data';
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveTENMaster:No save Data');
                                    }
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    res.status(500).json(responseMessage);
                                    console.log('FnSaveTENMaster: error in saving tenmaster data:' + err);
                                }
                            });


                        };

                        if(req.body.attachment){

                            uploadToCloud();
                        }
                        else
                        {
                            randomName = '';
                            url='';
                            saveTenmaster(randomName,url);
                        }
                    }

                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveTENMaster: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveTENMaster:Error in processing Token' + err);
                }
            });
        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveTENMaster:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @todo FnGetTENDetails
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get ten details
 */
Alumni.prototype.getTENDetails = function(req,res,next){
    var _this = this;

    var token = req.query.token ? req.query.token : '';
    var code = req.query.code;   // college code
    var type = parseInt(req.query.type);   // 1(training),2=event,3=news,4=knowledge
    var status = parseInt(req.query.status);
    var pageSize = req.query.page_size ? parseInt(req.query.page_size) : 100;
    var pageCount = req.query.page_count ? parseInt(req.query.page_count) : 0;
    var output =[];

    var responseMessage = {
        status: false,
        count : 0,
        data: null,
        message: '',
        error: {}

    };

    var validateStatus = true,error = {};

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
            var queryParams = st.db.escape(type) + ',' + st.db.escape(code)+ ',' + st.db.escape(status)+ ',' + st.db.escape(pageSize)
                + ',' + st.db.escape(pageCount) + ',' + st.db.escape(token);
            var query = 'CALL pGetTENDetails(' + queryParams + ')';
            st.db.query(query, function (err, getResult) {
                if (!err) {
                    if (getResult[0]) {
                        if (getResult[0][0].count > 0) {

                            //console.log(getResult[1]);
                            for( var i=0; i < getResult[1].length;i++){
                                var result = {};
                                result.tid = getResult[1][i].tid;
                                result.title = getResult[1][i].title;
                                result.description = getResult[1][i].description;
                                result.s_date = getResult[1][i].s_date;
                                result.e_date = getResult[1][i].e_date;
                                result.reg_lastdate = getResult[1][i].reg_lastdate;
                                result.type = getResult[1][i].type;
                                result.note = getResult[1][i].note;
                                result.venue_id = getResult[1][i].venue_id;
                                result.Approveddate = getResult[1][i].Approveddate;
                                result.approveduser = getResult[1][i].approveduser;
                                result.capacity = getResult[1][i].capacity;
                                result.a_title = getResult[1][i].a_title;
                                result.a_type = getResult[1][i].a_type;
                                result.status = getResult[1][i].status;
                                result.createddate = getResult[1][i].createddate;
                                result.ezeone = getResult[1][i].ezeone;
                                result.name = getResult[1][i].name;
                                result.tnpa = getResult[1][i].tnpa;
                                result.ps = getResult[1][i].ps;
                                result.Latitude = getResult[1][i].Latitude;
                                result.Longitude = getResult[1][i].Longitude;
                                result.AL1 = getResult[1][i].AL1;
                                result.AL2 = getResult[1][i].AL2;
                                result.s_url = (getResult[1][i].attachment) ?
                                    (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[1][i].attachment) : '';

                                output.push(result);
                            }
                            //console.log(output);
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Data loaded successfully';
                            responseMessage.count = getResult[0][0].count;

                            responseMessage.data = output;
                            res.status(200).json(responseMessage);
                            console.log('FnGetTENDetails: Data loaded successfully');
                        }
                        else {
                            responseMessage.message = 'Data not loaded';
                            res.status(200).json(responseMessage);
                            console.log('FnGetTENDetails: Data not loaded');
                        }
                    }
                    else {
                        responseMessage.message = 'Data not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetTENDetails: Data not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured in query ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetTENDetails: error in getting ten details :' + err);
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
            //                console.log('FnGetTENDetails: Invalid token');
            //            }
            //        }
            //        else {
            //            responseMessage.error = {
            //                server: 'Internal Server Error'
            //            };
            //            responseMessage.message = 'Error in validating Token';
            //            res.status(500).json(responseMessage);
            //            console.log('FnGetTENDetails:Error in processing Token' + err);
            //        }
            //    });
            //}
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetTENDetails ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetProfileStatus
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get profile status
 */
Alumni.prototype.getProfileStatus = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var code = req.query.code;   // college code

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
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(code);
                        var query = 'CALL PgetProfileStatus(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            console.log(getResult);
                            if (!err) {
                                if (getResult[0]) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Data loaded successfully';
                                        responseMessage.data = {
                                            isProfileCreated:true,
                                            result: getResult[0]
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetProfileStatus: Data loaded successfully');
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.message = 'Your profile is not created';
                                        responseMessage.data = {
                                            isProfileCreated : false
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetProfileStatus: Your profile is not created');
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.message = 'Your profile is not created';
                                    responseMessage.data = {
                                        isProfileCreated : false
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetProfileStatus: Your profile is not created');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetProfileStatus: error in getting ten details :' + err);
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
                        console.log('FnGetProfileStatus: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetProfileStatus:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetProfileStatus ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnSaveTENUsers
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save ten Users details
 */
Alumni.prototype.saveTENUsers = function(req,res,next) {
    var _this = this;

    var token = req.body.token;
    var tenID = req.body.ten_id;
    var profileId = req.body.profile_id;  // profileID is AlumniProfileID of that user
    var status = req.body.status;   // 0-participating, 1-revoked


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!status){
        status = 0;
    }
    if(parseInt(status) == NaN){
        error['status'] = 'Invalid status';
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        var queryParams = st.db.escape(token) + ',' + st.db.escape(tenID) + ',' + st.db.escape(profileId)
                            + ',' + st.db.escape(status);

                        var query = 'CALL pSaveTENUsers(' + queryParams + ')';

                        st.db.query(query, function (err, insertresult) {
                            if (!err) {
                                if (insertresult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Data saved successfully';
                                    responseMessage.data = {
                                        token: req.body.token,
                                        tid: req.body.tid,
                                        ten_id: req.body.ten_id,
                                        type: req.body.type,
                                        status: req.body.status
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveTENUsers: Data saved successfully');
                                }
                                else {
                                    responseMessage.message = 'No save Data';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveTENUsers:No save Data');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                res.status(500).json(responseMessage);
                                console.log('FnSaveTENUsers: error in saving tenUsers data:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveTENUsers: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveTENUsers:Error in processing Token' + err);
                }
            });
        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveTENUsers:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @todo FnApproveTEN
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get ten details
 */
Alumni.prototype.approveTEN = function(req,res,next){
    var _this = this;

    var token = req.body.token;
    var tenID = req.body.ten_id;
    var status = req.body.status ? parseInt(req.body.status) : 0 ;

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
    if(!tenID){
        error['tenID'] = 'Invalid tenID';
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
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(tenID)+ ',' + st.db.escape(status);
                        var query = 'CALL pApproveTEN(' + queryParams + ')';
                        st.db.query(query, function (err, approveResult) {
                            if (!err) {
                                if (approveResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Approved successfully';
                                    responseMessage.data = {
                                        token: req.body.token,
                                        ten_id: req.body.ten_id,
                                        status :req.body.status
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnApproveTEN: Approved successfully');
                                }
                                else {
                                    responseMessage.message = 'not Approved';
                                    res.status(200).json(responseMessage);
                                    console.log('FnApproveTEN: not Approved');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnApproveTEN: error in getting approve:' + err);
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
                        console.log('FnApproveTEN: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnApproveTEN:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnApproveTEN ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnSaveComments
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for save comments
 */
Alumni.prototype.saveComments = function(req,res,next){
    var _this = this;

    //var token = req.body.token;
    var tenID = req.body.ten_id;
    var profileId = req.body.profile_id;  // profileID is AlumniProfileID of that user
    var rating = req.body.rating;
    var comments = req.body.comments;

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
    if(!tenID){
        error['tenID'] = 'Invalid tenID';
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
            var queryParams = st.db.escape(tenID) + ',' + st.db.escape(profileId)+ ',' + st.db.escape(rating)
                + ',' + st.db.escape(comments);
            var query = 'CALL pgivecommentsforTEN(' + queryParams + ')';
            st.db.query(query, function (err, saveResult) {
                if (!err) {
                    if (saveResult) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Comments saved successfully';
                        responseMessage.data = {
                            ten_id : req.body.ten_id,
                            profile_id : req.body.profile_id,
                            rating : req.body.rating,
                            comments : req.body.comments
                        };
                        res.status(200).json(responseMessage);
                        console.log('FnSaveComments: Comments saved successfully');
                    }
                    else {
                        responseMessage.message = 'No save comments';
                        res.status(200).json(responseMessage);
                        console.log('FnSaveComments: No save comments');
                    }
                }
                else {
                    responseMessage.message = 'An error occured in query ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnSaveComments: error in saving comments:' + err);
                }

            });
        }
            //        else {
            //            responseMessage.message = 'Invalid token';
            //            responseMessage.error = {
            //                token: 'Invalid Token'
            //            };
            //            responseMessage.data = null;
            //            res.status(401).json(responseMessage);
            //            console.log('FnSaveComments: Invalid token');
            //        }
            //    }
            //    else {
            //        responseMessage.error = {
            //            server: 'Internal Server Error'
            //        };
            //        responseMessage.message = 'Error in validating Token';
            //        res.status(500).json(responseMessage);
            //        console.log('FnSaveComments:Error in processing Token' + err);
            //    }
            //});
            //}
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSaveComments ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetParticipatedEventsId
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get profile status
 */
Alumni.prototype.getParticipatedEventsId = function(req,res,next){
    var _this = this;

    //var token = req.query.token;
    var profileId = req.query.profile_id;  // profileID is AlumniProfileID of that user
    var ids = req.query.ids;

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
    if(!profileId){
        error['profileId'] = 'Invalid profileId';
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
            var queryParams = st.db.escape(profileId) + ',' + st.db.escape(ids);
            var query = 'CALL pLoadparticiapatedTENId(' + queryParams + ')';
            st.db.query(query, function (err, getResult) {
                if (!err) {
                    if (getResult[0]) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Data loaded successfully';
                        responseMessage.data = getResult[0];
                        res.status(200).json(responseMessage);
                        console.log('FnGetParticipatedEventsId: Data loaded successfully');
                    }
                    else {
                        responseMessage.message = 'Data not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetParticipatedEventsId: Data not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured in query ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetParticipatedEventsId: error in getting ten details :' + err);
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
            //                console.log('FnGetParticipatedEventsId: Invalid token');
            //            }
            //        }
            //        else {
            //            responseMessage.error = {
            //                server: 'Internal Server Error'
            //            };
            //            responseMessage.message = 'Error in validating Token';
            //            res.status(500).json(responseMessage);
            //            console.log('FnGetParticipatedEventsId:Error in processing Token' + err);
            //        }
            //    });
            //}
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetParticipatedEventsId ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetParticipantsList
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get Participants list
 */
Alumni.prototype.getParticipantsList = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var tid = req.query.tid;  // id of traning id

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(tid);
                        var query = 'CALL PgetListofParticipants(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {

                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Data loaded successfully';
                                    responseMessage.data = getResult[0];
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetParticipantsList: Data loaded successfully');
                                }

                                else {
                                    responseMessage.message = 'Data not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetParticipantsList: Data not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetParticipantsList: error in getting ten details :' + err);
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
                        console.log('FnGetParticipantsList: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetParticipantsList:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetParticipantsList ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetAlumniApprovalList
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get profile status
 */
Alumni.prototype.getAlumniApprovalList = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var code = req.query.code;  // college code


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
                        var queryParams = st.db.escape(code);
                        var query = 'CALL pGetAlumniMemberApprovalList(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'List loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAlumniApprovalList: List loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'List not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAlumniApprovalList: List not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'List not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetAlumniApprovalList: List not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetAlumniApprovalList: error in getting ten approval List :' + err);
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
                        console.log('FnGetAlumniApprovalList: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetAlumniApprovalList:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetAlumniApprovalList ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetTeamContent
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get alumni team
 */
Alumni.prototype.getTeamContent = function(req,res,next){
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
            var queryParams = st.db.escape(code);
            var query = 'CALL pgetTeamContent(' + queryParams + ')';

            st.db.query(query, function (err, getResult) {
                //console.log(getResult);
                if (!err) {
                    if (getResult[0]) {
                        if (getResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Team Content loaded successfully';
                            responseMessage.data = getResult[0];
                            res.status(200).json(responseMessage);
                            console.log('FnGetTeamContent:Team Content loaded successfully');
                        }
                        else {
                            responseMessage.message = 'Team Content not loaded';
                            res.status(200).json(responseMessage);
                            console.log('FnGetTeamContent: Team Content not loaded');
                        }
                    }
                    else {
                        responseMessage.message = 'Team Content not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetTeamContent: Team Content not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured in query ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetTeamContent: error in getting Team Content :' + err);
                }

            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetTeamContent ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetTeamImage
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get team image
 */
Alumni.prototype.getTeamImage = function(req,res,next){
    var _this = this;

    var code = req.query.code;   // college code
    var type = parseInt(req.query.type);   // 0=core group 1=mentor 2=faculty

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
            var query = st.db.escape(code) + ',' + st.db.escape(type);

            st.db.query('CALL pgetTeamImages(' + query + ')', function (err, getResult) {
                //console.log(getResult);
                if (!err) {
                    if (getResult[0]) {
                        if (getResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Team image loaded successfully';
                            responseMessage.data = getResult[0];
                            res.status(200).json(responseMessage);
                            console.log('FnGetTeamImage: Team image loaded successfully');
                        }
                        else {
                            responseMessage.message = 'Team image not loaded';
                            res.status(200).json(responseMessage);
                            console.log('FnGetTeamImage: Team image not loaded');
                        }
                    }
                    else {
                        responseMessage.message = 'Team image not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetTeamImage: Team image not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured in query ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetTeamImage: error in getting Team image :' + err);
                }

            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetTeamImage ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetTENAttachment
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get ten attachment
 */
Alumni.prototype.getTENAttachment = function(req,res,next){
    var _this = this;

    var ids = req.query.ids;   // comma separated tids of training

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true,error = {};

    if(!ids){
        error['ids'] = 'Invalid ids';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var queryParams = st.db.escape(ids);
            var query = 'CALL pgetTENAttachment(' + queryParams + ')';

            st.db.query(query, function (err, getResult) {
                //console.log(getResult);
                if (!err) {
                    if (getResult[0]) {
                        if (getResult[0].length > 0) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Attachment loaded successfully';
                            responseMessage.data = getResult[0];
                            res.status(200).json(responseMessage);
                            console.log('FnGetTENAttachment:Attachment loaded successfully');
                        }
                        else {
                            responseMessage.message = 'Attachment not loaded';
                            res.status(200).json(responseMessage);
                            console.log('FnGetTENAttachment: Attachment not loaded');
                        }
                    }
                    else {
                        responseMessage.message = 'Attachment not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetTENAttachment: Attachment not loaded');
                    }
                }
                else {
                    responseMessage.message = 'An error occured in query ! Please try again';
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    res.status(500).json(responseMessage);
                    console.log('FnGetTENAttachment: error in getting Attachment :' + err);
                }

            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetTENAttachment ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnSaveTENVenue
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save ten venue details
 */
Alumni.prototype.saveTENVenue = function(req,res,next) {
    var _this = this;

    var token = req.body.token;
    var lat = req.body.lat;
    var long = req.body.long;
    var address1 = req.body.address1;
    var address2 = req.body.address2;
    var id = parseInt(req.body.id);      // while saving new 0 else id


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var error = {},validateStatus = true;

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!id){
        id = 0;
    }
    if(parseInt(id) == NaN){
        error['id'] = 'Invalid id';
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {

                        var queryParams = st.db.escape(lat) + ',' + st.db.escape(long) + ',' + st.db.escape(address1)
                            + ',' + st.db.escape(address2)+ ',' + st.db.escape(id);

                        var query = 'CALL psaveTENVenue(' + queryParams + ')';
                        console.log(query);

                        st.db.query(query, function (err, insertresult) {
                            console.log(insertresult);
                            if (!err) {
                                if (insertresult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Venue saved successfully';
                                    responseMessage.data = {
                                        id: insertresult[0][0].id
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveTENVenue: Venue saved successfully');
                                }
                                else {
                                    responseMessage.message = 'No Save Venue';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveTENVenue:No save Venue');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                res.status(500).json(responseMessage);
                                console.log('FnSaveTENVenue: error in saving tenUsers Venue:' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveTENVenue: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveTENVenue:Error in processing Token' + err);
                }
            });
        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveTENVenue:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};


// new api's from job module and conatctManager module

//Contact Manager module

/**
 * @todo FnGetClientList
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @server_param
 *  1. token
 *  2. title
 * @description api code for get client list
 */
Alumni.prototype.getClientList = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var title = req.query.s ? req.query.s : '';   // title
    var pageSize = req.query.ps ? parseInt(req.query.ps) : 1000;       // no of records per page (constant value) eg: 10
    var pageCount = req.query.pc ? parseInt(req.query.pc) : 0;     // first time its 0
    var functionType = req.query.ft ? parseInt(req.query.ft) : 0;

    var responseMessage = {
        status: false,
        count : 0,
        data: null,
        message: '',
        error: {}
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(title)+ ',' + st.db.escape(pageSize)
                            + ',' + st.db.escape(pageCount)+ ',' + st.db.escape(functionType);
                        var query = 'CALL pGetClientList(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
                                    responseMessage.status = true;
                                    responseMessage.count = getResult[0][0].count;
                                    responseMessage.data = getResult[1];
                                    responseMessage.message = 'Client List loaded successfully';
                                    responseMessage.error = null;
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetClientList: Client List loaded successfully');
                                }
                                else {
                                    responseMessage.message = 'Client List not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetClientList: Client List not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetClientList: error in getting Client List :' + err);
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
                        console.log('FnGetClientList: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetClientList:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetClientList ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetClientContacts
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @server_param
 *  1. token
 *  2. cid   // client id
 * @description api code for get client contacts
 */
Alumni.prototype.getClientContacts = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var cid = parseInt(req.query.cid);
    var pageSize = req.query.ps ? parseInt(req.query.ps) : 1000;       // no of records per page (constant value) eg: 10
    var pageCount = req.query.pc ? parseInt(req.query.pc) : 0;     // first time its 0

    var responseMessage = {
        status: false,
        count : 0,
        cid :'',
        cn:'',
        cc:'',
        page :'',
        data: null,
        message: '',
        error: {}
    };

    var validateStatus = true,error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!cid){
        error['cid'] = 'Invalid client id';
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
                        var queryParams = st.db.escape(cid)+ ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount);
                        var query = 'CALL pGetClientcontacts(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
                                    responseMessage.status = true;
                                    responseMessage.count = getResult[0][0].count;
                                    responseMessage.cid = getResult[0][0].cid;
                                    responseMessage.cn = getResult[0][0].cn;
                                    responseMessage.cc = getResult[0][0].cc;
                                    responseMessage.page = getResult[0][0].page;
                                    responseMessage.data = getResult[1];
                                    responseMessage.message = 'Contact List loaded successfully';
                                    responseMessage.error = null;
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetClientContacts: Contact List loaded successfully');
                                }
                                else {
                                    responseMessage.message = 'Contact List not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetClientContacts: Contact List not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetClientList: error in getting Client Contact :' + err);
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
                        console.log('FnGetClientContacts: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetClientContacts:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetClientContacts ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

//job module

/**
 * @todo FnGetJobs
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description  get jobs of a person based on ezeone_id
 */
Alumni.prototype.getAll = function(req,res,next){
    var _this = this;

    var ezeone_id = alterEzeoneId(req.query.ezeone_id);
    var token = req.query.token;
    var keywordsForSearch = req.query.keywordsForSearch;
    var status = req.query.status;
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;
    var orderBy = req.query.order_by;  // 1-ascending else descending
    //console.log(req.query);
    var final_result=[],loc_result = [],get_result=[],get_result1,tid, location_result={},jobids,job_location;
    var alumniCode = req.query.a_code ? req.query.a_code : '';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validateStatus = true, error = {};
    if(!ezeone_id){
        error['ezeone_id'] = 'Invalid ezeone_id';
        validateStatus *= false;
    }
    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error ;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var query = st.db.escape(ezeone_id) + ',' + st.db.escape(keywordsForSearch)  + ',' + st.db.escape(status)
                            + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount)  + ',' + st.db.escape(orderBy)
                            + ',' + st.db.escape(alumniCode);
                        //console.log('CALL pGetJobs(' + query + ')');
                        st.db.query('CALL pGetJobs(' + query + ')', function (err, getresult) {

                            if (!err) {
                                if (getresult) {
                                    if (getresult[0]) {
                                        if (getresult[0][0]) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Jobs send successfully';
                                            responseMessage.data = {
                                                total_count: getresult[0][0].count,
                                                result : getresult[1]
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetJobs: Jobs send successfully');
                                        }
                                        else {
                                            responseMessage.message = 'No founded Jobs details';
                                            console.log('FnGetJobs: No founded Jobs details');
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        responseMessage.message = 'No founded Jobs details';
                                        console.log('FnGetJobs: No founded Jobs details');
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    responseMessage.message = 'No founded Jobs details';
                                    console.log('FnGetJobs: No founded Jobs details');
                                    res.status(200).json(responseMessage);
                                }
                            }
                            else {
                                responseMessage.error = {
                                    server : 'Internal serever error'
                                };
                                responseMessage.message = 'Error getting from Jobs details';
                                console.log('FnGetJobs:Error getting from Jobs details:' + err);
                                res.status(500).json(responseMessage);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnGetJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetJobs:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server : 'Internal server error'
            };
            responseMessage.message = 'An error occured !';
            console.log('FnGetJobs:error ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @todo FnSaveJobs
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save jobs of a person
 */
Alumni.prototype.create = function(req,res,next){
    var _this = this;
    var fs = require("fs");

    var token = req.body.token;
    var tid = req.body.tid;
    var ezeone_id = alterEzeoneId(req.body.ezeone_id);
    var job_code = req.body.job_code;
    var job_title = req.body.job_title;
    var exp_from = req.body.exp_from ? req.body.exp_from : 0;
    var exp_to = req.body.exp_to ? req.body.exp_to : 0;
    var job_description = req.body.job_description;
    var salaryFrom = req.body.salaryFrom;
    var salaryTo = req.body.salaryTo;
    var salaryType = req.body.salaryType;
    var keySkills = req.body.keySkills ? req.body.keySkills : '';
    var openings = req.body.openings;
    var jobType = req.body.jobType;
    var status = req.body.status;
    var contactName = req.body.contactName;
    var email_id = req.body.email_id;
    var mobileNo = req.body.mobileNo;
    var locationsList = req.body.locationsList;
    var categoryID = req.body.category_id;
    var educationID= (req.body.education_id) ? req.body.education_id : '';
    var specializationID = (req.body.specialization_id) ? req.body.specialization_id : '';
    var instituteID = (req.body.institute_id) ? req.body.institute_id : '';
    var scoreFrom = req.body.score_from;
    var scoreTo = req.body.score_to;
    if(typeof(locationsList) == "string") {
        locationsList = JSON.parse(locationsList);
    }
    var location_id = '',count;
    var resultvalue = '';
    var skillMatrix1 = req.body.skillMatrix;
    skillMatrix1= JSON.parse(JSON.stringify(skillMatrix1));
    if (!skillMatrix1){
        skillMatrix1=[];
    }
    var skillIds = req.body.skill_ids ? req.body.skill_ids : '';
    var jobID,m= 0,jobtype,masterid='',gid,receiverId,toid=[],senderTitle,groupTitle,groupId,messageText,messageType,operationType,iphoneId,messageId,userID;

    var cid = req.body.cid ? parseInt(req.body.cid) : 0;   // client id
    var conatctId = req.body.ctid ? parseInt(req.body.ctid) : 0;     // contact id
    var isconfidential = req.body.isconfi ? parseInt(req.body.isconfi) : 0;
    var alumnicode = req.body.acode;    // alumni code


    if (jobType == 0){
        jobtype = 'Full Time';
    }
    else if (jobType == 1){
        jobtype = 'Part Time';
    }
    else if (jobType == 2){
        jobtype = 'Work from Home';
    }
    else if (jobType == 3){
        jobtype = 'Internship';
    }
    else if (jobType == 4){
        jobtype = 'Apprenticeship';
    }
    else if (jobType == 5){
        jobtype = 'Job Oriented Training';
    }
    else if (jobType == 6){
        jobtype = 'Consultant';
    }
    else if (jobType == 7){
        jobtype = 'Freelancer';
    }

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var error = {},validateStatus = true;
    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        tid = 0;
    }
    if(parseInt(tid) == NaN){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }
    if(!ezeone_id){
        error['ezeone_id'] = 'Invalid ezeone_id';
        validateStatus *= false;
    }
    if(!job_code){
        error['job_code'] = 'Invalid job_code';
        validateStatus *= false;
    }
    if(!job_title){
        error['job_title'] = 'Invalid job_title';
        validateStatus *= false;
    }
    if(!job_description){
        error['job_description'] = 'Invalid job_description';
        validateStatus *= false;
    }
    if(!salaryFrom && !salaryTo){
        error['salary'] = 'Invalid SalaryFrom or SalaryTo';
        validateStatus *= false;
    }
    if(!salaryType){
        error['salaryType'] = 'Invalid salaryType';
        validateStatus *= false;
    }
    if(!openings){
        error['openings'] = 'Invalid openings';
        validateStatus *= false;
    }
    if(parseInt(jobType) == NaN){
        error['jobType'] = 'Invalid jobType';
        validateStatus *= false;
    }

    if(parseInt(status) == NaN){
        error['status'] = 'Invalid status';
        validateStatus *= false;
    }
    if(!contactName){
        responseMessage.error['contactName'] = 'Invalid contactName';
        validateStatus *= false;
    }
    if(!locationsList){
        locationsList = [];
    }
    if(!(email_id || mobileNo)){
        error['email_id OR  MobileNo'] = 'Invalid email_id or mobileNo';
        validateStatus *= false;
    }

    if(parseInt(cid) == NaN){
        error['cid'] = 'Invalid client id';
        validateStatus *= false;
    }

    if(parseInt(conatctId) == NaN){
        error['conatctId'] = 'Invalid conatctId';
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var locCount = 0;
                        var locationDetails = locationsList[locCount];
                        location_id = location_id.substr(0,location_id.length - 1);
                        var createJobPosting = function(){
                            var query = st.db.escape(tid) + ',' + st.db.escape(ezeone_id) + ',' + st.db.escape(job_code)
                                + ',' + st.db.escape(job_title) + ',' + st.db.escape(exp_from) + ',' + st.db.escape(exp_to)
                                + ',' + st.db.escape(job_description) + ',' + st.db.escape(salaryFrom) + ',' + st.db.escape(salaryTo)
                                + ',' + st.db.escape(salaryType) + ',' + st.db.escape(keySkills) + ',' + st.db.escape(openings)
                                + ',' + st.db.escape(jobType) + ',' + st.db.escape(status) + ',' + st.db.escape(contactName)
                                + ',' + st.db.escape(email_id) + ',' + st.db.escape(mobileNo) + ',' + st.db.escape(location_id)
                                + ',' + st.db.escape(categoryID)+ ',' + st.db.escape(educationID)+ ',' + st.db.escape(specializationID)
                                + ',' + st.db.escape(instituteID)+ ',' + st.db.escape(scoreFrom)+ ',' + st.db.escape(skillIds)
                                + ',' + st.db.escape(scoreTo)+ ',' + st.db.escape(cid)+ ',' + st.db.escape(conatctId)
                                + ',' + st.db.escape(isconfidential) + ',' + st.db.escape(alumnicode);
                            console.log('CALL pSaveJobs(' + query + ')');
                            st.db.query('CALL pSaveJobs(' + query + ')', function (err, insertresult) {
                                if (!err) {
                                    if (insertresult) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Jobs save successfully';
                                        responseMessage.data = {
                                            token: token,
                                            tid: tid,
                                            ezeone_id: ezeone_id,
                                            job_code: job_code,
                                            job_title: job_title,
                                            exp_from: exp_from,
                                            exp_to: exp_to,
                                            job_description: job_description,
                                            salaryFrom: salaryFrom,
                                            salaryTo: salaryTo,
                                            salaryType: salaryType,
                                            keySkills: keySkills,
                                            openings: openings,
                                            jobType: jobType,
                                            status: status,
                                            contactName: contactName,
                                            email_id: email_id,
                                            mobileNo: mobileNo,
                                            location_id: location_id,
                                            categoryID: categoryID,
                                            educationID: educationID,
                                            specializationID: specializationID,
                                            instituteID: instituteID,
                                            score_from: scoreFrom,
                                            score_to: scoreTo,
                                            cid : cid,
                                            ctid : conatctId,
                                            isconfi : isconfidential,
                                            acode : alumnicode
                                        };
                                        res.status(200).json(responseMessage);
                                        matrix(insertresult[0][0].jobid);
                                        console.log('FnSaveJobs: Jobs save successfully');
                                    }
                                    else {
                                        responseMessage.message = 'No save Jobs details';
                                        res.status(400).json(responseMessage);
                                        console.log('FnSaveJobs:No save Jobs details');
                                    }
                                }
                                else {
                                    responseMessage.message = 'An error occured ! Please try again';
                                    res.status(500).json(responseMessage);
                                    console.log('FnSaveJobs: error in saving jobs details:' + err);
                                }
                            });
                        };

                        var matrix = function(jobId_Result){
                            jobID = jobId_Result;
                            var count = skillMatrix1.length;
                            if(m < skillMatrix1.length) {
                                var skills = {
                                    skillname: skillMatrix1[m].skillname,
                                    expertiseLevel: skillMatrix1[m].expertiseLevel,
                                    expFrom: skillMatrix1[m].exp_from,
                                    expTo: skillMatrix1[m].exp_to,
                                    active_status: skillMatrix1[m].active_status,
                                    jobId: jobID,
                                    tid: skillMatrix1[m].tid
                                };
                                FnSaveSkills(skills, function (err, Result) {
                                    if (!err) {
                                        if (Result) {
                                            resultvalue = Result.SkillID;
                                            var SkillItems = {
                                                skillID: resultvalue,
                                                expertlevel: skills.expertiseLevel,
                                                expFrom: skills.expFrom,
                                                expTo: skills.expTo,
                                                skillstatusid: skills.active_status,
                                                jobid: skills.jobId
                                            };

                                            var queryParams = st.db.escape(SkillItems.jobid) + ',' + st.db.escape(SkillItems.skillID)
                                                + ',' + st.db.escape(SkillItems.expFrom) + ',' + st.db.escape(SkillItems.expTo)
                                                + ',' + st.db.escape(SkillItems.skillstatusid) + ',' + st.db.escape(SkillItems.expertlevel)
                                                + ',' + st.db.escape(parseInt(skills.tid));
                                            var query = 'CALL pSaveJobSkill(' + queryParams + ')';
                                            st.db.query(query, function (err, result) {
                                                if (!err) {
                                                    console.log('FnupdateSkill: skill matrix Updated successfully');
                                                    m = m + 1;
                                                    matrix(jobID);
                                                }
                                                else {
                                                    console.log('FnupdateSkill:  skill matrix not updated:'+err);
                                                }
                                            });
                                        }
                                        else {
                                            console.log('FnSaveMessage: skillID not loaded');
                                            //res.send(RtnMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnSaveMessage:Error in getting skillID' + err);
                                        //res.send(RtnMessage);
                                    }
                                });
                            }
                            else {
                                if( parseInt(req.body.tid) == 0) {
                                    postNotification(jobID);
                                }
                            }
                        };

                        //send push notification
                        var postNotification = function (jobID) {
                            var queryParams1 = st.db.escape(jobID) + ',' + st.db.escape(location_id)
                                + ',' + st.db.escape(req.body.education_id) + ',' + st.db.escape(req.body.specialization_id)
                                + ',' + st.db.escape(req.body.exp_from) + ',' + st.db.escape(req.body.exp_to)
                                + ',' + st.db.escape(req.body.salaryFrom)+ ',' + st.db.escape(req.body.salaryTo)
                                + ',' + st.db.escape(req.body.salaryType);
                            //console.log('CALL PNotifyForCVsAfterJobPosted(' + queryParams1 + ')');
                            st.db.query('CALL PNotifyForCVsAfterJobPosted(' + queryParams1 + ')', function (err, results) {
                                if (!err) {
                                    if (results) {
                                        if (results[0]) {
                                            if (results[0][0]) {
                                                for (var i = 0; i < results[0].length; i++) {
                                                    userID = results[0][i].MasterID;
                                                    var queryParams2 = st.db.escape(ezeone_id) + ',' + st.db.escape(userID)+ ',' + st.db.escape(0);
                                                    var query2 = 'CALL pSendMsgRequestbyPO(' + queryParams2 + ')';
                                                    st.db.query(query2, function (err, getResult) {
                                                        if (!err) {
                                                            if (getResult) {

                                                                var path = require('path');
                                                                var file = path.join(__dirname,'../../mail/templates/job_post.html');

                                                                fs.readFile(file, "utf8", function (err, data) {
                                                                    var name = 'select tid,CompanyName from tmaster where EZEID=' + st.db.escape(ezeone_id);
                                                                    st.db.query(name, function (err, companyResult) {
                                                                        if (companyResult) {
                                                                            data = data.replace("[JobType]", jobtype);
                                                                            data = data.replace("[JobTitle]", job_title);
                                                                            data = data.replace("[JobCode]", job_code);
                                                                            data = data.replace("[CompanyName]", companyResult[0].CompanyName);

                                                                            var queryParams3 = st.db.escape(data) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                                                + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape('')
                                                                                + ',' + st.db.escape(token) + ',' + st.db.escape(0) + ',' + st.db.escape(userID)
                                                                                + ',' + st.db.escape(1) + ',' + st.db.escape('') + ',' + st.db.escape(0)+ ',' + st.db.escape(0);
                                                                            var query3 = 'CALL pComposeMessage(' + queryParams3 + ')';
                                                                            st.db.query(query3, function (err, messageResult) {
                                                                                if (!err) {
                                                                                    if (messageResult) {
                                                                                        console.log('FnComposeMessage:Message Composed successfully');
                                                                                        var query4 = 'select tid from tmgroups where GroupType=1 and adminID=' + userID;
                                                                                        st.db.query(query4, function (err, getDetails) {
                                                                                            if (getDetails) {
                                                                                                if (getDetails[0]) {
                                                                                                    receiverId = getDetails[0].tid;
                                                                                                    senderTitle = ezeone_id;
                                                                                                    groupTitle = ezeone_id;
                                                                                                    groupId = companyResult[0].tid;
                                                                                                    messageText = data;
                                                                                                    messageType = 1;
                                                                                                    operationType = 0;
                                                                                                    iphoneId = null;
                                                                                                    messageId = 0;
                                                                                                    masterid = '';
                                                                                                    //console.log(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                                    notification.publish(receiverId, senderTitle, groupTitle, groupId, messageText, messageType, operationType, iphoneId, messageId, masterid);
                                                                                                }
                                                                                                else {
                                                                                                    console.log('FnjobNotification:user details not loaded');
                                                                                                }
                                                                                            }
                                                                                            else {
                                                                                                console.log('FnjobNotification:user details not loaded');
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                    else {
                                                                                        console.log("FnComposeMessage:Message Result not loaded");
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    console.log("FnSaveJobs:Error in loading Message Result:" + err);
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                });
                                                            }
                                                            else {
                                                                console.log("FnSaveJobs:Result not loaded");
                                                            }
                                                        }
                                                        else {
                                                            console.log("FnSaveJobs:Error:" + err);
                                                        }
                                                    });
                                                }
                                            }
                                            else {
                                                console.log("FnSaveJobs:MasterId not loaded");
                                            }
                                        }
                                        else {
                                            console.log("FnSaveJobs:MasterId not loaded");
                                        }
                                    }
                                    else {
                                        console.log("FnSaveJobs:MasterId not loaded");
                                    }
                                }
                                else {
                                    console.log("FnSaveJobs:Error:" + err);
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
                            // console.log('CALL psavejoblocation(' + queryParams + ')');
                            st.db.query('CALL psavejoblocation(' + queryParams + ')', function (err, results) {
                                if (results) {
                                    if (results[0]) {
                                        if (results[0][0]) {
                                            location_id += results[0][0].id + ',';
                                            locCount +=1;
                                            if(locCount < locationsList.length){
                                                insertLocations(locationsList[locCount]);
                                            }
                                            else{
                                                createJobPosting();
                                            }
                                        }
                                        else {
                                            console.log('FnSaveJobLocation:results no found');
                                            responseMessage.message = 'results no found';
                                            res.status(200).json(responseMessage);
                                        }
                                    }
                                    else {
                                        console.log('FnSaveJobLocation:results no found');
                                        responseMessage.message = 'results no found';
                                        res.status(200).json(responseMessage);
                                    }
                                }
                                else {
                                    console.log('FnSaveJobLocation:results no found');
                                    responseMessage.message = 'results no found';
                                    res.status(200).json(responseMessage);
                                }
                            });
                        };
                        //calling function at first time
                        if (locationsList) {
                            if (locationsList.length > 0) {
                                insertLocations(locationDetails);
                            }
                            else {
                                location_id = '';
                                createJobPosting();
                            }

                        }

                        else {
                            location_id = '';
                            createJobPosting();
                        }
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'Invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnSaveJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSaveJobs:Error in processing Token' + err);
                }
            });
        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnSaveJobs:error ' + ex.description);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
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

            st.db.query('Select SkillID from mskill where SkillTitle = ' + st.db.escape(skill.skillname), function (err, SkillResult) {
                if ((!err)) {
                    if (SkillResult[0]) {
                        //console.log(SkillResult);
                        //console.log('Skill value:' + SkillResult[0].SkillID);
                        //console.log('Skill exists');
                        RtnResponse.SkillID = SkillResult[0].SkillID;
                        //console.log(RtnResponse.SkillID);
                        CallBack(null, RtnResponse);
                    }
                    else {
                        st.db.query('insert into mskill (SkillTitle) values (' + st.db.escape(skill.skillname) + ')', function (err, skillInsertResult) {
                            if (!err) {
                                if (skillInsertResult.affectedRows > 0) {
                                    st.db.query('select SkillID from mskill where SkillTitle like ' + st.db.escape(skill.skillname), function (err, SkillMaxResult) {
                                        if (!err) {
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
 * @todo FnViewJobDetails
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for view job details
 */
Alumni.prototype.viewJobDetails = function(req,res,next){
    var _this = this;
    var token = req.query.token;
    var jobId = req.query.job_id;

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

    if(!jobId){
        error['jobId'] = 'Invalid job ID';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams =  st.db.escape(jobId);
                        var query = 'CALL pviewjobDetails(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
                                    if(getResult[0].length > 0){
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Job Details loaded successfully';
                                        responseMessage.data = {
                                            result: getResult[0],
                                            location : getResult[1],
                                            skill:getResult[2]
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnViewJobDetails: Job Details loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Job Details not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnViewJobDetails:Job Details not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Job Details not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnViewJobDetails:Job Details not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnViewJobDetails: error in getting Job Details :' + err);
                            }
                        });
                    }
                    else {
                        responseMessage.message = 'Invalid token';
                        responseMessage.error = {
                            token: 'invalid token'
                        };
                        responseMessage.data = null;
                        res.status(401).json(responseMessage);
                        console.log('FnViewJobDetails: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server : 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnViewJobDetails:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(500).json(responseMessage);
            console.log('Error : FnViewJobDetails ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};
//end

/**
 * @todo FnGetAlumniJobApprovalList
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get job approval list status
 */
Alumni.prototype.getAlumniJobApprovalList = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var code = req.query.code;  // college code
    var status = req.query.status; // 0-Pending,1-Active,2-inactive


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
                        var queryParams = st.db.escape(code) + ',' + st.db.escape(status);
                        var query = 'CALL pGetAlumniJobListForApproval(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'ApprovalList loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAlumniJobApprovalList: ApprovalList loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'ApprovalList not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAlumniJobApprovalList: ApprovalList not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'ApprovalList not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetAlumniJobApprovalList: ApprovalList not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetAlumniJobApprovalList: error in getting job approval List :' + err);
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
                        console.log('FnGetAlumniJobApprovalList: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetAlumniJobApprovalList:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetAlumniJobApprovalList ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnApproveAlumniJobs
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for save approve alumni job details
 */
Alumni.prototype.approveAlumniJobs = function(req,res,next){
    var _this = this;

    var token = req.body.token;
    var jobId = req.body.job_id;
    var status = req.body.st ? parseInt(req.body.st) : 0 ;   // 0=Pending,1=Active,2=inactive

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
    if(!jobId){
        error['tenID'] = 'Invalid tenID';
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
                        var queryParams = st.db.escape(jobId)+ ',' + st.db.escape(status);
                        var query = 'CALL pApproveAlumnijobs(' + queryParams + ')';
                        st.db.query(query, function (err, approveResult) {
                            if (!err) {
                                if (approveResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Approved successfully';
                                    responseMessage.data = {
                                        job_id: req.body.job_id,
                                        status :req.body.st
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnApproveAlumniJobs: Approved successfully');
                                }
                                else {
                                    responseMessage.message = 'not Approved';
                                    res.status(200).json(responseMessage);
                                    console.log('FnApproveAlumniJobs: not Approved');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnApproveAlumniJobs: error in getting approve:' + err);
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
                        console.log('FnApproveAlumniJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnApproveAlumniJobs:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnApproveAlumniJobs ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


/**
 * @todo FnSearchAlumniTEN
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @server_param
 *  1. token
 *  2. title   // title of search word
 * @description api code for search alumni ten
 */
Alumni.prototype.searchAlumniTEN = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var title = req.query.keyword;
    var pageSize = req.query.ps ? parseInt(req.query.ps) : 1000;       // no of records per page (constant value) eg: 10
    var pageCount = req.query.pc ? parseInt(req.query.pc) : 0;     // first time its 0. start result count

    var responseMessage = {
        status: false,
        count : 0,
        data: null,
        message: '',
        error: {}
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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(title)+ ',' + st.db.escape(pageCount) + ',' + st.db.escape(pageSize);
                        var query = 'CALL pSearchAlumniTEN(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            //console.log(getResult);
                            if (!err) {
                                if (getResult[0]) {
                                    if (getResult[0][0].count > 0) {
                                        responseMessage.status = true;
                                        responseMessage.count = getResult[0][0].count;
                                        responseMessage.data = getResult[1];
                                        responseMessage.message = 'Search Result loaded successfully';
                                        responseMessage.error = null;
                                        res.status(200).json(responseMessage);
                                        console.log('FnSearchAlumniTEN: Search Result loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'Search Result not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnSearchAlumniTEN: Search Result not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'Search Result not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSearchAlumniTEN: Search Result not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetClientList: error in getting Search Result :' + err);
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
                        console.log('FnSearchAlumniTEN: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSearchAlumniTEN:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSearchAlumniTEN ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnSearchAlumniJobs
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description search jobs of a person
 */
Alumni.prototype.searchAlumniJobs = function(req,res,next){
    var _this = this;
    try{
        var latitude = req.query.latitude ? req.query.latitude : 0;
        var longitude = req.query.longitude ? req.query.longitude : 0;
        var jobType = req.query.jobType ? req.query.jobType : '';
        var exp = (req.query.exp) ? req.query.exp : -1;
        var keywords = req.query.keywords ? req.query.keywords : '';
        var token = (req.query.token) ? req.query.token : '';
        var pageSize = req.query.page_size ? parseInt(req.query.page_size) : 100;
        var pageCount = req.query.page_count ? parseInt(req.query.page_count) : 0;
        var locations = req.query.locations ? req.query.locations : '';
        var category = req.query.category ? req.query.category : '';
        var salary = req.query.salary ? req.query.salary : '';
        var filter = req.query.filter ? req.query.filter : 0;
        var type = req.query.type ? parseInt(req.query.type) : 0;  //0-normal job search, 1-Show my institue jobs, 2-for matching jobs of my cv and Default is 0
        var alumniCode = req.query.alumni_code;  // alumni code

        var responseMessage = {
            status: false,
            error: {},
            message: '',
            data: null
        };

        var query = st.db.escape(latitude) + ',' + st.db.escape(longitude) + ',' + st.db.escape(jobType)
            + ',' + st.db.escape(exp) + ',' + st.db.escape(keywords)+',' + st.db.escape(token)+',' + st.db.escape(pageSize)
            +',' + st.db.escape(pageCount)+',' + st.db.escape(locations)+',' + st.db.escape(category)
            +',' + st.db.escape(salary)+',' + st.db.escape(filter)+',' + st.db.escape(type)+',' + st.db.escape(alumniCode);
        //console.log('CALL psearchjobs(' + query + ')');
        st.db.query('CALL psearchAlumnijobs(' + query + ')', function (err, getresult) {
            if (!err) {
                if (getresult) {
                    if (getresult[0]) {
                        if (getresult[0][0]) {
                            if (getresult[1].length > 0) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'AlimniJobs Search result loaded successfully';
                                if (filter == 0) {
                                    responseMessage.data = {
                                        total_count: getresult[0][0].count,
                                        result: getresult[1],
                                        job_location: getresult[2],
                                        salary: getresult[3],
                                        category: getresult[4],
                                        company_details: getresult[5]
                                    };
                                }
                                else {
                                    responseMessage.data = {
                                        total_count: getresult[0][0].count,
                                        result: getresult[1]
                                    };
                                }
                                res.status(200).json(responseMessage);
                                console.log('FnSearchAlimniJobs: AlimniJobs Search result loaded successfully');
                            }
                            else {
                                responseMessage.message = 'Search result not found';
                                res.status(200).json(responseMessage);
                                console.log('FnSearchAlimniJobs:Search result not found');
                            }
                        }
                        else {
                            responseMessage.message = 'Search result not found';
                            res.status(200).json(responseMessage);
                            console.log('FnSearchAlimniJobs:Search result not found');
                        }
                    }
                    else {
                        responseMessage.message = 'Search result not found';
                        res.status(200).json(responseMessage);
                        console.log('FnSearchAlimniJobs:Search result not found');
                    }
                }
                else {
                    responseMessage.message = 'Search result not found';
                    res.status(200).json(responseMessage);
                    console.log('FnSearchAlimniJobs:Search result not found');
                }
            }
            else {
                responseMessage.message = 'An error occured ! Please try again';
                responseMessage.error = {
                    server : 'Internal server error'
                };
                res.status(500).json(responseMessage);
                console.log('FnSearchAlimniJobs: error in getting job details:' + err);
            }
        });
    }
    catch(ex){
        responseMessage.error = {
            server : 'Internal server error'
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnSearchAlimniJobs:error ' + ex.description);
        var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
    }
};

/**
 * @todo FnGetMyAlumniJobs
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get my alumni jobs
 */
Alumni.prototype.getMyAlumniJobs = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var code = req.query.code;  // college code


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
                        var queryParams = st.db.escape(token) + ',' + st.db.escape(code);
                        var query = 'CALL pgetMyAlumniJobs(' + queryParams + ')';
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult[0]) {
                                    if (getResult[0].length > 0) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'List loaded successfully';
                                        responseMessage.data = getResult[0];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetMyAlumniJobs: List loaded successfully');
                                    }
                                    else {
                                        responseMessage.message = 'List not loaded';
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetMyAlumniJobs: List not loaded');
                                    }
                                }
                                else {
                                    responseMessage.message = 'List not loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnGetMyAlumniJobs: List not loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnGetMyAlumniJobs: error in getting ten approval List :' + err);
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
                        console.log('FnGetMyAlumniJobs: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnGetMyAlumniJobs:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnGetMyAlumniJobs ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnGetAlumniUserDetails
 * @method GET
 * @param req
 * @param res
 * @param next
 *
 * @request-param token* <string>
 */
Alumni.prototype.getAlumniUserDetails = function(req,res,next){

    var token = req.query.token;
    var output = [];

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
                        var queryString = 'CALL pgetalumnisofuser('+st.db.escape(token) + ')';
                        st.db.query(queryString,function(err,results){
                            if(!err){
                                if(results){
                                    if(results[0]){
                                        for( var i=0; i < results[0].length;i++){
                                            var result = {};
                                            console.log(results[0][i].profileid);
                                            result.logoimage = '';
                                            result.page1title = results[0][i].page1title;
                                            result.AlumniID = results[0][i].AlumniID;
                                            result.alumnicode = results[0][i].alumnicode;
                                            result.profilestatus = results[0][i].profilestatus;
                                            result.profile_id = results[0][i].profileid;
                                            result.s_url = (results[0][i].logoimage) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + results[0][i].logoimage) : '';
                                            output.push(result);
                                        }

                                        respMsg.status = true;
                                        respMsg.error = null;
                                        respMsg.message = 'Alumni User details loaded successfully';
                                        respMsg.data = output;
                                        res.status(200).json(respMsg);

                                    }
                                    else{
                                        respMsg.status = false;
                                        respMsg.error = null;
                                        respMsg.message = 'No such Alumni user is available';
                                        res.status(200).json(respMsg);
                                    }

                                }
                                else{
                                    respMsg.status = false;
                                    respMsg.error = null;
                                    respMsg.message = 'No such user is available';
                                    res.status(200).json(respMsg);
                                }
                            }
                            else{
                                console.log('FnGetAlumniUserDetails : error');
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
                    console.log('FnGetAlumniUserDetails : error');
                    console.log(err);
                    res.status(500).json({ status : false, data : null, message : 'Unauthorized ! Please login to continue',error : {
                        token : 'Invalid token'
                    }});
                }
            });
        }
        catch(ex){
            console.log('Exception - FnGetAlumniUserDetails ');
            console.log(ex);
            res.status(500).json({ status : false, data : null, message : 'Unauthorized ! Please login to continue',error : {
                token : 'Invalid token'
            }});
        }

    }
};

/**
 * @todo FnSearchAlumni
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for search alumni
 */
Alumni.prototype.searchAlumni = function(req,res,next){
    var _this = this;

    var token = req.query.token;
    var title = req.query.title ? req.query.title : '';

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(title)+','+st.db.escape(token);
                        var query = 'CALL pFindAlumni(' + queryParams + ')';
                        st.db.query(query, function (err, getresult) {
                            if (!err) {
                                if (getresult[0]) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'AlumniSearch Loaded successfully';
                                    responseMessage.data = getresult[0];
                                    res.status(200).json(responseMessage);
                                    console.log('FnSearchAlumni: AlumniSearch Loaded successfully');
                                }
                                else {
                                    responseMessage.message = 'AlumniSearch not Loaded';
                                    res.status(200).json(responseMessage);
                                    console.log('FnSearchAlumni:AlumniSearch not Loaded');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnSearchAlumni: error in getting AlumniSearch:' + err);
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
                        console.log('FnSearchAlumni: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnSearchAlumni:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnSearchAlumni ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnLeaveAlumni
 * Method : PUT
 * @param req
 * @param res
 * @param next
 * @description api code for leave alumni
 */
Alumni.prototype.leaveAlumni = function(req,res,next){
    var _this = this;

    var token = req.body.token;
    var alumniId = req.body.aid;
    var status = req.body.status

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
            st.validateToken(token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(alumniId)+','+st.db.escape(token)+','+st.db.escape(status);
                        var query = 'CALL pLeaveAlumni(' + queryParams + ')';
                        st.db.query(query, function (err, getresult) {
                            if (!err) {
                                if (getresult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Alumni leaved successfully';
                                    responseMessage.data = getresult[0];
                                    res.status(200).json(responseMessage);
                                    console.log('FnLeaveAlumni: Alumni leaved successfully');
                                }
                                else {
                                    responseMessage.message = 'Alumni not leaved';
                                    res.status(200).json(responseMessage);
                                    console.log('FnLeaveAlumni:Alumni not leaved');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnLeaveAlumni: error in getting AlumniLeave:' + err);
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
                        console.log('FnLeaveAlumni: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnLeaveAlumni:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnLeaveAlumni ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};


module.exports = Alumni;

