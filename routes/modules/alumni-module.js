/**
 *  @author Gowri shankar
 *  @since seotemper 10,2015 03:24 PM IST
 *  @title Alumni module
 *  @description Handles functions related to alumni profile and events
 */

"use strict";



var uuid = require('node-uuid');
var stream = require( "stream" );
var chalk = require( "chalk" );
var util = require( "util" );
var validator = require('validator');
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


//var NotificationMqtt = require('./notification/notification-mqtt.js');
//var notificationMqtt = new NotificationMqtt();
var NotificationQueryManager = require('./notification/notification-query.js');
var notificationQmManager = null;
var mailModule = require('./mail-module.js');
var mail = null;

var st = null;
function Alumni(db,stdLib){
    if(stdLib){
        st = stdLib;
        notificationQmManager = new NotificationQueryManager(db,st);
        mail = new mailModule(db,stdLib);
    }
}

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

function isURl(str, callback) {

    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    //return regexp.test(s);
    callback(null, regexp.test(str));
}

var gcloud = require('gcloud');
var fs = require('fs');

var appConfig = require('../../ezeone-config.json');

var gcs = gcloud.storage({
    projectId: appConfig.CONSTANT.GOOGLE_PROJECT_ID,
    keyFilename: appConfig.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
});

// Reference an existing bucket.
var bucket = gcs.bucket(appConfig.CONSTANT.STORAGE_BUCKET);

bucket.acl.default.add({
    entity: 'allUsers',
    role: gcs.acl.READER_ROLE
}, function (err, aclObject) {
});

/**
 * image uploading to cloud server
 * @param uniqueName
 * @param readStream
 * @param callback
 */
var uploadDocumentToCloud = function(uniqueName,readStream,callback){
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    readStream.pipe(remoteWriteStream);

    remoteWriteStream.on('finish', function(){
        console.log('done');
        if(callback){
            if(typeof(callback)== 'function'){
                callback(null);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

    remoteWriteStream.on('error', function(err){
        if(callback){
            if(typeof(callback)== 'function'){
                console.log(err);
                callback(err);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });
};


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
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Alumni.prototype.registerAlumni = function(req,res,next){
    /**
     * @todo FnRegistrationAlumni
     */

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var operationType = parseInt(req.body.OperationType);
    var ipAddress = req.ip;
    var selectionType = (!isNaN(parseInt(req.body.SelectionType))) ?  parseInt(req.body.SelectionType) : 0;
    var idtypeId = parseInt(req.body.IDTypeID);
    var ezeid = req.body.EZEID ? (alterEzeoneId(req.body.EZEID).toUpperCase()):'';
    var password = req.body.Password;
    var firstName = req.body.FirstName ? req.body.FirstName : '';
    var lastName = req.body.LastName ? req.body.LastName : '';
    var companyName = req.body.CompanyName ? req.body.CompanyName : '';
    var jobTitle = req.body.JobTitle ? req.body.JobTitle : '';
    var categoryId = (!isNaN(parseInt(req.body.CategoryID))) ?  parseInt(req.body.CategoryID) : 0;
    var functionId = (!isNaN(parseInt(req.body.FunctionID))) ?  parseInt(req.body.FunctionID) : 0;
    var roleId = (!isNaN(parseInt(req.body.RoleID))) ?  parseInt(req.body.RoleID) : 0;
    var languageId = (!isNaN(parseInt(req.body.LanguageID))) ?  parseInt(req.body.LanguageID) : 0;
    var nameTitleId = req.body.NameTitleID;
    var latitude = req.body.Latitude ? req.body.Latitude : 0.00;
    var longitude = req.body.Longitude ? req.body.Longitude : 0.00;
    var altitude = req.body.Altitude ? req.body.Altitude : 0.00;
    var addressLine1 = req.body.AddressLine1 ? req.body.AddressLine1 :'';
    var addressLine2 = req.body.AddressLine2 ? req.body.AddressLine2 : '';
    var cityTitle = req.body.CityTitle ? req.body.CityTitle : '';
    var stateId = req.body.StateID ? req.body.StateID : 0;
    var countryId = req.body.CountryID ? req.body.CountryID : 0;
    var postalCode = req.body.PostalCode;
    var pin = req.body.PIN ? req.body.PIN : null;
    var phoneNumber = req.body.PhoneNumber;
    var mobileNumber = req.body.MobileNumber;
    var email = req.body.EMailID;
    var picture = req.body.Picture;
    var pictureFileName = req.body.PictureFileName;
    var webSite = req.body.Website ? req.body.Website : '';
    var aboutCompany = req.body.AboutCompany;
    var token = req.body.Token ? req.body.Token : '';
    var operation = "I";
    if (token) {
        operation = "U";
    }
    var isdPhoneNumber =  req.body.ISDPhoneNumber ? req.body.ISDPhoneNumber : '';
    var isdMobileNumber = req.body.ISDMobileNumber ? req.body.ISDMobileNumber : '';
    var parkingStatus = req.body.ParkingStatus ? req.body.ParkingStatus : 0;
    var gender = (!isNaN(parseInt(req.body.Gender))) ?  parseInt(req.body.Gender) : 2;
    var dob = req.body.DOB ? (new Date(req.body.DOB)) : '';
    var templateId = req.body.TemplateID ? parseInt(req.body.TemplateID) : 0;
    var isIphone = req.body.device ? parseInt(req.body.device) : 0;
    var deviceToken = req.body.device_token ? req.body.device_token : '';
    var visibleEmail = (!isNaN(parseInt(req.body.ve))) ?  parseInt(req.body.ve) : 1;   // 0-invisible, 1- visible
    var visibleMobile = (!isNaN(parseInt(req.body.vm))) ?  parseInt(req.body.vm) : 1;  // 0-invisible, 1- visible
    var visiblePhone = (!isNaN(parseInt(req.body.vp))) ?  parseInt(req.body.vp) : 1;   // 0-invisible, 1- visible
    var visibleAddress = (!isNaN(parseInt(req.body.va))) ?  parseInt(req.body.va) : 1; // 0-invisible, 1- visible
    var locTitle = req.body.loc_title ? req.body.loc_title : '';
    var statusId = (!isNaN(parseInt(req.body.status_id))) ?  parseInt(req.body.status_id) : 1;  // 1-active, 2-inactive
    var apUserid = (!isNaN(parseInt(req.body.ap_userid))) ?  parseInt(req.body.ap_userid) : 0;
    var businessKeywords = (req.body.keywords) ?  req.body.keywords : '';
    var encryptPwd = '';
    var fullName='';
    var companyDetails = (req.body.company_details) ?  req.body.company_details : ''; // about company details
    var rtnMessage = {
        error:{},
        Token: '',
        IsAuthenticate: false,
        FirstName: '',
        CompanyName:'',
        Type: 0,
        Icon: '',
        tid:'',
        group_id:'',
        ezeone_id:'',
        ezeid:'',
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
        FreshersAccepted: '',
        HomeDeliveryItemListType : '',
        PersonalEZEID:'',
        ReservationDisplayFormat:'',
        mobilenumber:'',
        isAddressSaved:'',
        isinstitute_admin : '',
        cvid : '',
        profile_status:''

    };

    var validateStatus = true;
    var error = {};

    if(!validateStatus){
        rtnMessage.error = error;
        res.status(400).json(rtnMessage);

    }
    else {
        try {
            if (operationType == 1) {
                console.log('----------Operation type 1--------------');
                if (idtypeId && ezeid && password) {
                    if (password) {
                        encryptPwd = hashPassword(password);
                    }

                    var queryParams = st.db.escape(idtypeId) + ',' + st.db.escape(ezeid) + ',' + st.db.escape(encryptPwd)
                        + ',' + st.db.escape(firstName) + ',' + st.db.escape(lastName) + ',' + st.db.escape(companyName)
                        + ',' + st.db.escape(jobTitle) + ',' + st.db.escape(functionId) + ',' + st.db.escape(roleId)
                        + ',' + st.db.escape(languageId) + ',' + st.db.escape(nameTitleId) + ',' + st.db.escape(token)
                        + ',' + st.db.escape(latitude) + ',' + st.db.escape(longitude) + ',' + st.db.escape(altitude)
                        + ',' + st.db.escape(addressLine1) + ',' + st.db.escape(addressLine2) + ',' + st.db.escape(cityTitle)
                        + ',' + st.db.escape(stateId) + ',' + st.db.escape(countryId) + ',' + st.db.escape(postalCode)
                        + ',' + st.db.escape(pin) + ',' + st.db.escape(phoneNumber) + ',' + st.db.escape(mobileNumber)
                        + ',' + st.db.escape(email) + ',' + st.db.escape(picture) + ',' + st.db.escape(pictureFileName)
                        + ',' + st.db.escape(webSite) + ',' + st.db.escape(operation) + ',' + st.db.escape(aboutCompany)
                        + ',' + st.db.escape(statusId) + ',' + st.db.escape(isdPhoneNumber) + ',' + st.db.escape(isdMobileNumber)
                        + ',' + st.db.escape(gender) + ',' + st.db.escape(dob) + ',' + st.db.escape(ipAddress)
                        + ',' + st.db.escape(selectionType) + ',' + st.db.escape(parkingStatus) + ',' + st.db.escape(templateId)
                        + ',' + st.db.escape(categoryId) + ',' + st.db.escape(visibleEmail) + ',' + st.db.escape(visibleMobile)
                        + ',' + st.db.escape(visiblePhone) + ',' + st.db.escape(locTitle) + ',' + st.db.escape(visibleAddress)
                        + ',' + st.db.escape(statusId) + ',' + st.db.escape(apUserid) + ',' + st.db.escape(businessKeywords)
                        + ',' + st.db.escape(companyDetails);

                    var query = 'CALL pSaveEZEIDData(' + queryParams + ')';
                    //console.log(InsertQuery);

                    st.db.query(query, function (err, registerResult) {
                        if (!err) {
                            if (registerResult) {
                                if(registerResult[0]){
                                    if (registerResult[0].length > 0) {
                                        if (registerResult[0][0].TID != 0) {


                                            rtnMessage.IsAuthenticate = true;
                                            rtnMessage.tid = registerResult[0][0].TID;
                                            rtnMessage.group_id = registerResult[0][0].group_id;
                                            rtnMessage.Token = token;
                                            rtnMessage.FirstName = registerResult[0][0].FirstName;
                                            rtnMessage.CompanyName = registerResult[0][0].CompanyName;
                                            rtnMessage.ezeone_id = registerResult[0][0].EZEID;
                                            rtnMessage.ezeid = registerResult[0][0].EZEID;
                                            rtnMessage.Type = registerResult[0][0].IDTypeID;
                                            rtnMessage.Verified = registerResult[0][0].EZEIDVerifiedID;
                                            if (registerResult[0][0].ParentMasterID == 0) {
                                                rtnMessage.MasterID = registerResult[0][0].TID;
                                            }
                                            else {
                                                rtnMessage.MasterID = registerResult[0][0].ParentMasterID;
                                            }
                                            rtnMessage.UserModuleRights = registerResult[0][0].UserModuleRights;
                                            rtnMessage.SalesModuleTitle = registerResult[0][0].SalesModuleTitle;
                                            rtnMessage.AppointmentModuleTitle = registerResult[0][0].AppointmentModuleTitle;
                                            rtnMessage.HomeDeliveryModuleTitle = registerResult[0][0].HomeDeliveryModuleTitle;
                                            rtnMessage.ServiceModuleTitle = registerResult[0][0].ServiceModuleTitle;
                                            rtnMessage.CVModuleTitle = registerResult[0][0].CVModuleTitle;
                                            rtnMessage.PersonalEZEID = registerResult[0][0].PersonalEZEID;
                                            rtnMessage.SalesFormMsg = registerResult[0][0].SalesFormMsg;
                                            rtnMessage.ReservationFormMsg = registerResult[0][0].ReservationFormMsg;
                                            rtnMessage.HomeDeliveryFormMsg = registerResult[0][0].HomeDeliveryFormMsg;
                                            rtnMessage.ServiceFormMsg = registerResult[0][0].ServiceFormMsg;
                                            rtnMessage.CVFormMsg = registerResult[0][0].CVFormMsg;
                                            rtnMessage.SalesItemListType = registerResult[0][0].SalesItemListType;
                                            rtnMessage.FreshersAccepted = registerResult[0][0].FreshersAccepted;
                                            rtnMessage.HomeDeliveryItemListType = registerResult[0][0].HomeDeliveryItemListType;
                                            rtnMessage.ReservationDisplayFormat = registerResult[0][0].ReservationDisplayFormat;
                                            rtnMessage.mobilenumber = registerResult[0][0].mobilenumber;
                                            rtnMessage.isAddressSaved = registerResult[0][0].isAddressSaved;
                                            rtnMessage.isinstitute_admin = registerResult[0][0].isinstituteadmin;
                                            rtnMessage.cvid = registerResult[0][0].cvid;
                                            rtnMessage.profile_status = registerResult[0][0].ps;

                                            if (operation == 'I') {

                                                var ip = req.headers['x-forwarded-for'] ||
                                                    req.connection.remoteAddress ||
                                                    req.socket.remoteAddress ||
                                                    req.connection.socket.remoteAddress;
                                                var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';

                                                st.generateToken(ip, userAgent, ezeid, function (err, token) {
                                                    if (err) {
                                                        console.log('FnRegistration: Token Generation Error');
                                                        console.log(err);

                                                    }
                                                    else {
                                                        console.log(token);
                                                        rtnMessage.Token = token;
                                                        res.send(rtnMessage);
                                                    }
                                                });

                                                console.log('FnRegistration:tmaster: Registration success');

                                                var queryParams1 = st.db.escape(pin) + ',' + st.db.escape(ezeid) + ',' + st.db.escape('');
                                                var query1 = 'CALL pupdateEZEoneKeywords(' + queryParams1 + ')';
                                                st.db.query(query1, function (err, updateResult) {
                                                    if (!err) {
                                                        console.log('FnUpdateEZEoneKeywords: Keywords Updated successfully');
                                                    }
                                                });

                                                if (isIphone == 1) {
                                                    var queryParams = st.db.escape(EZEID) + ',' + st.db.escape(deviceToken);
                                                    var query = 'CALL pSaveIPhoneDeviceID(' + queryParams + ')';
                                                    // console.log(query);
                                                    st.db.query(query, function (err, result) {
                                                        if (!err) {
                                                            //console.log(result);
                                                            console.log('FnLogin:IphoneDevice save successfully');
                                                        }
                                                        else {
                                                            console.log(err);
                                                        }
                                                    });
                                                }
                                                if (email) {
                                                    if (firstName && lastName) {
                                                        fullName = firstName + ' ' + lastName;
                                                    }
                                                    else {
                                                        fullName = firstName;
                                                    }

                                                    var mailContent = {
                                                        type: 'register',
                                                        fullname: fullName,
                                                        ezeid: ezeid,
                                                        toEmail: email

                                                    };

                                                    mail.sendRegMail(mailContent, function (err, statusResult) {
                                                        if (!err) {
                                                            if (statusResult) {
                                                                if (statusResult.status == true) {
                                                                    console.log('FnSendMail: Mail Sent Successfully');
                                                                    //res.send(rtnMessage);
                                                                }
                                                                else {
                                                                    console.log('FnSendMail: Mail not Sent...1');
                                                                    //res.send(rtnMessage);
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnSendMail: Mail not Sent..2');
                                                                //res.send(rtnMessage);
                                                            }
                                                        }
                                                        else {
                                                            console.log('FnSendMail:Error in sending mails' + err);
                                                            //res.send(rtnMessage);
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log('FnRegistration: tmaster: registration success but email is empty so mail not sent');
                                                    //console.log(rtnMessage);
                                                    //res.send(rtnMessage);
                                                }
                                            }

                                            else {
                                                console.log('FnRegistration: tmaster: Update operation success');
                                                var queryParams3 = st.db.escape(pin) + ',' + st.db.escape(ezeid) + ',' + st.db.escape('');
                                                var query3 = 'CALL pupdateEZEoneKeywords(' + queryParams3 + ')';
                                                st.db.query(query3, function (err, updateResult) {
                                                    if (!err) {
                                                        console.log('FnUpdateEZEoneKeywords: Keywords Updated successfully');
                                                    }
                                                });
                                                res.send(rtnMessage);
                                            }
                                        }

                                        else {
                                            console.log(rtnMessage);
                                            res.send(rtnMessage);
                                            console.log('FnRegistration:tmaster: Registration Failed..1');
                                        }
                                    }
                                    else {
                                        console.log(rtnMessage);
                                        res.send(rtnMessage);
                                        console.log('FnRegistration:tmaster: Registration Failed..2');
                                    }
                                }
                                else {
                                    console.log(rtnMessage);
                                    res.send(rtnMessage);
                                    console.log('FnRegistration:tmaster: Registration Failed..3');
                                }
                            }
                            else {
                                console.log(rtnMessage);
                                res.send(rtnMessage);
                                console.log('FnRegistration:tmaster: Registration Failed..4');
                            }
                        }
                        else {
                            res.statusCode = 500;
                            res.send(rtnMessage);
                            console.log('FnRegistration:tmaster:' + err);
                        }
                    });

                }
                else {
                    if (!idtypeId) {
                        console.log('FnRegistration: IDTypeID is Empty');
                    }
                    else if (!ezeid) {
                        console.log('FnRegistration: EZEID is Empty');
                    }
                    else if (!password) {
                        console.log('FnRegistration: Password is Empty');
                    }

                    console.log('Mandatory fields is required');
                    res.statusCode = 400;
                    res.send(rtnMessage);
                }
            }
            else{
                if (idtypeId && ezeid) {
                    if (password) {
                        encryptPwd = hashPassword(password);
                    }

                    var queryParams = st.db.escape(idtypeId) + ',' + st.db.escape(ezeid) + ',' + st.db.escape(encryptPwd)
                        + ',' + st.db.escape(firstName) + ',' + st.db.escape(lastName) + ',' + st.db.escape(companyName)
                        + ',' + st.db.escape(jobTitle) + ',' + st.db.escape(functionId) + ',' + st.db.escape(roleId)
                        + ',' + st.db.escape(languageId) + ',' + st.db.escape(nameTitleId) + ',' + st.db.escape(token)
                        + ',' + st.db.escape(latitude) + ',' + st.db.escape(longitude) + ',' + st.db.escape(altitude)
                        + ',' + st.db.escape(addressLine1) + ',' + st.db.escape(addressLine2) + ',' + st.db.escape(cityTitle)
                        + ',' + st.db.escape(stateId) + ',' + st.db.escape(countryId) + ',' + st.db.escape(postalCode)
                        + ',' + st.db.escape(pin) + ',' + st.db.escape(phoneNumber) + ',' + st.db.escape(mobileNumber)
                        + ',' + st.db.escape(email) + ',' + st.db.escape(picture) + ',' + st.db.escape(pictureFileName)
                        + ',' + st.db.escape(webSite) + ',' + st.db.escape(operation) + ',' + st.db.escape(aboutCompany)
                        + ',' + st.db.escape(statusId) + ',' + st.db.escape(isdPhoneNumber) + ',' + st.db.escape(isdMobileNumber)
                        + ',' + st.db.escape(gender) + ',' + st.db.escape(dob) + ',' + st.db.escape(ipAddress)
                        + ',' + st.db.escape(selectionType) + ',' + st.db.escape(parkingStatus) + ',' + st.db.escape(templateId)
                        + ',' + st.db.escape(categoryId) + ',' + st.db.escape(visibleEmail) + ',' + st.db.escape(visibleMobile)
                        + ',' + st.db.escape(visiblePhone) + ',' + st.db.escape(locTitle) + ',' + st.db.escape(visibleAddress)
                        + ',' + st.db.escape(statusId) + ',' + st.db.escape(apUserid) + ',' + st.db.escape(businessKeywords)
                        + ',' + st.db.escape(companyDetails);

                    var query = 'CALL pSaveEZEIDData(' + queryParams + ')';
                    console.log(query);
                    st.db.query(query, function (err, registerResult) {
                        if (!err) {
                            if (registerResult) {
                                if (registerResult[0]) {
                                    if (registerResult[0].length > 0) {
                                        if (registerResult[0][0]) {
                                            if (registerResult[0][0].TID != 0) {
                                                if (idtypeId == 2) {
                                                    rtnMessage.FirstName = companyName;
                                                }
                                                else {
                                                    rtnMessage.FirstName = firstName;
                                                }
                                                rtnMessage.IsAuthenticate = true;
                                                rtnMessage.Token = token;
                                                rtnMessage.Type = idtypeId;
                                                rtnMessage.tid = registerResult[0][0].TID;
                                                rtnMessage.group_id = registerResult[0][0].group_id;

                                                if (operation == 'I') {

                                                    var ip = req.headers['x-forwarded-for'] ||
                                                        req.connection.remoteAddress ||
                                                        req.socket.remoteAddress ||
                                                        req.connection.socket.remoteAddress;
                                                    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';

                                                    st.generateToken(ip, userAgent, ezeid, function (err, token) {
                                                        if (err) {
                                                            console.log('FnRegistration: Token Generation Error' + err);
                                                        }
                                                        else {
                                                            rtnMessage.Token = token;
                                                        }
                                                        res.send(rtnMessage);
                                                    });

                                                    console.log('FnRegistration:tmaster: Registration success');

                                                    var queryParams1 = st.db.escape(pin) + ',' + st.db.escape(ezeid) + ',' + st.db.escape('');
                                                    var query1 = 'CALL pupdateEZEoneKeywords(' + queryParams1 + ')';
                                                    st.db.query(query1, function (err, updateResult) {
                                                        if (!err) {
                                                            console.log('FnUpdateEZEoneKeywords: Keywords Updated successfully');
                                                        }
                                                        else {
                                                            console.log('FnUpdateEZEoneKeywords: Keywords not updated');
                                                            console.log(err);
                                                        }
                                                    });
                                                    if (email) {

                                                        if (firstName && lastName) {
                                                            fullName = firstName + ' ' + lastName;
                                                        }
                                                        else {
                                                            fullName = firstName;
                                                        }

                                                        var mailContent = {
                                                            type: 'register',
                                                            fullname: fullName,
                                                            ezeid: ezeid,
                                                            toEmail: email

                                                        };

                                                        mail.sendRegMail(mailContent, function (err, statusResult) {
                                                            if (!err) {
                                                                if (statusResult) {
                                                                    if (statusResult.status == true) {
                                                                        console.log('FnSendMail: Mail Sent Successfully');
                                                                        //res.send(rtnMessage);
                                                                    }
                                                                    else {
                                                                        console.log('FnSendMail: Mail not Sent...1');
                                                                        //res.send(rtnMessage);
                                                                    }
                                                                }
                                                                else {
                                                                    console.log('FnSendMail: Mail not Sent..2');
                                                                    //res.send(rtnMessage);
                                                                }
                                                            }
                                                            else {
                                                                console.log('FnSendMail:Error in sending mails' + err);
                                                                //res.send(rtnMessage);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        console.log('FnRegistration: tmaster: registration success but email is empty so mail not sent');
                                                        //console.log(rtnMessage);
                                                        //res.send(rtnMessage);
                                                    }
                                                }
                                                else {
                                                    var queryParams2 = st.db.escape(pin) + ',' + st.db.escape(ezeid) + ',' + st.db.escape('');
                                                    var query2 = 'CALL pupdateEZEoneKeywords(' + queryParams2 + ')';
                                                    console.log(query2);
                                                    st.db.query(query2, function (err, getResult) {
                                                        if (!err) {
                                                            console.log('FnUpdateEZEoneKeywords: Keywords Updated successfully');
                                                            res.send(rtnMessage);
                                                        }
                                                    });
                                                }
                                            }
                                            else {
                                                //console.log(rtnMessage);
                                                res.send(rtnMessage);
                                                console.log('FnRegistration:tmaster: Registration Failed..1');
                                            }
                                        }
                                        else {
                                            //console.log(rtnMessage);
                                            res.send(rtnMessage);
                                            console.log('FnRegistration:tmaster: Registration Failed');
                                        }
                                    }
                                    else {
                                        //console.log(rtnMessage);
                                        res.send(rtnMessage);
                                        console.log('FnRegistration:tmaster: Registration Failed..2');
                                    }
                                }

                                else {
                                    //console.log(rtnMessage);
                                    res.send(rtnMessage);
                                    console.log('FnRegistration:tmaster: Registration Failed..3');
                                }
                            }
                            else {
                                //console.log(rtnMessage);
                                res.send(rtnMessage);
                                console.log('FnRegistration:tmaster: Registration Failed..4');
                            }
                        }
                        else {
                            res.statusCode = 500;
                            res.send(rtnMessage);
                            console.log('FnRegistration:tmaster:' + err);
                        }
                    });
                }
                else {
                    if (!idtypeId) {
                        console.log('FnRegistration: IDTypeID is empty');
                    } else if (!ezeid) {
                        console.log('FnRegistration: EZEID is empty');
                    }
                    res.statusCode = 400;
                    res.send(rtnMessage);
                    console.log('FnRegistration:tmaster: Mandatory field empty');
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
    }
};
/**
 * @todo FnSaveAlumniProfilePic
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save alumni profile pic
 */
Alumni.prototype.saveAlumniProfilePic = function(req,res,next) {

    var picture = req.body.pg_pic;
    var pictureType = req.body.pg_picType;
    var randomName, url;

    var gcloud = require('gcloud');
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

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var error = {}, validateStatus = true;

    try {

        if(req.files) {
            var imageParams = {
                path: req.files.pg_pic.path,
                type: pictureType,
                width: 1200,
                height: 600,
                scale: '',
                crop: ''
            };
            //console.log(imageParams);
            FnCropImage(imageParams, function (err, imageBuffer) {

                if (imageBuffer) {

                    console.log('uploading to cloud server...');

                    var uniqueId = uuid.v4();
                    randomName = uniqueId + '.' + req.files.pg_pic.extension;

                    // Upload a local file to a new file to be created in your bucket

                    var remoteWriteStream = bucket.file(randomName).createWriteStream();
                    var bufferStream = new BufferStream(imageBuffer);
                    bufferStream.pipe(remoteWriteStream);


                    remoteWriteStream.on('finish', function () {
                        console.log('file is uploaded to cloud');
                        url = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName;
                        responseMessage.message = 'page pic save success';
                        responseMessage.status = true;
                        responseMessage.data = randomName;
                        res.status(200).json(responseMessage);

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

        }
        else{
            console.log('save url...');
            var pic = ((picture).replace(/^https:\/\/storage.googleapis.com/, '')).split('/');
            pic = pic[2];
            console.log(pic);
            responseMessage.message = 'page pic is updated';
            responseMessage.status = true;
            responseMessage.data = pic;
            res.status(200).json(responseMessage);
            console.log('pic is updating');
        }
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server error'
        };
        responseMessage.message = 'An error occurred !';
        console.log('FnSaveAlumniProfilePic:error ' + ex.description);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ....................');
        res.status(400).json(responseMessage);
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
    var randomName;
    var url;
    var logo_name;
    var logo_url;

    var gcloud = require('gcloud');
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

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var error = {};
    var validateStatus = true;
    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!tid){
        tid = 0;
    }
    if(isNaN(parseInt(tid))){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }
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

                        var pagePicture = function (pgPic) {
                            randomName= pgPic;
                            saveContent(randomName);
                        };

                        var saveContent = function (randomName) {

                            if (logo) {
                                logo = logo;
                            }
                            else {
                                logo = '';
                            }

                            isURl(logo, function (err, str) {

                                if (str == false) {

                                    var uniqueId = uuid.v4();
                                    var type = logoType.split('/');
                                    logo_name = uniqueId + '.' + type[1];
                                    console.log(logo_name);

                                    var bufferData = new Buffer((logo).replace(/^data:image\/(png|gif|jpeg|jpg);base64,/, ''), 'base64');

                                    // Upload a local file to a new file to be created in your bucket

                                    var remoteWriteStream = bucket.file(logo_name).createWriteStream();
                                    var bufferStream = new BufferStream(bufferData);
                                    bufferStream.pipe(remoteWriteStream);

                                    //var localReadStream = fs.createReadStream(req.files.logo.path);
                                    //localReadStream.pipe(remoteWriteStream);

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
                                    //console.log('save url...');
                                    logo_name = ((logo).replace(/^https:\/\/storage.googleapis.com/, '')).split('/');
                                    logo_name = logo_name[2];

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
                                console.log(query);
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
                                                pg_pic: req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName,
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
                        };

                        if (req.body.pg_pic) {
                            //console.log('c1...');
                            //console.log(req.body.pg_pic);
                            var pgPic = req.body.pg_pic;
                            pagePicture(pgPic);
                        }
                        else {
                            //console.log('c2...');
                            randomName = '';
                            saveContent(randomName);
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

    var token = req.body.token;
    var tid = req.body.tid;      // while saving time 0 else id of user
    var picture = req.body.picture;
    var pictureTitle = req.body.p_title;
    var pictureType = req.body.pg_picType;  // pg_picType
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
    var randomName;


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
    if(isNaN(parseInt(tid))){
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }

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
    if(isNaN(parseInt(seqNo))){
        error['seqNo'] = 'Invalid seqNo';
        validateStatus *= false;
    }
    if(!type){
        type = 0;
    }
    if(isNaN(parseInt(type))){
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

                        var saveTeam = function (randomName) {

                            var queryParams = st.db.escape(tid) + ',' + st.db.escape(randomName) + ',' + st.db.escape(jobTitle)
                                + ',' + st.db.escape(company) + ',' + st.db.escape(profile) + ',' + st.db.escape(seqNo)
                                + ',' + st.db.escape(type) + ',' + st.db.escape(alumniId) + ',' + st.db.escape(alumniRole)
                                + ',' + st.db.escape(pictureTitle) + ',' + st.db.escape(pictureType) + ',' + st.db.escape(username)
                                + ',' + st.db.escape(token);

                            var query = 'CALL pSaveAlumniTeam(' + queryParams + ')';

                            console.log(query);

                            st.db.query(query, function (err, insertresult) {
                                if (!err) {
                                    if (insertresult) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Alumni Team saved successfully';
                                        responseMessage.data = {
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
                                            width: width,
                                            picture : req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName
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
                        if (req.body.picture) {

                            var pic = req.body.picture;

                            isURl(pic, function (err, str) {
                                //console.log('----isurl---');
                                //console.log(str);
                                if (str == true) {
                                    randomName = ((req.body.picture).replace(/^https:\/\/storage.googleapis.com/, '')).split('/');
                                    randomName = randomName[2];
                                }
                                else {
                                    randomName = pic;
                                }
                                saveTeam(randomName);
                            });
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

    var code = alterEzeoneId(req.query.code);   // college code

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
            console.log('CALL pGetAlumniContent(' + query + ')');
            st.db.query('CALL pGetAlumniContent(' + query + ')', function (err, getResult) {
                //console.log(getResult);
                if (!err) {
                    if (getResult) {
                        if (getResult[0]) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Alumni content loaded successfully';
                            if (getResult[0][0]) {
                                getResult[0][0].logo = (getResult[0][0].logo) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[0][0].logo) : '';
                            }
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

    var token = req.query.token;
    var code = alterEzeoneId(req.query.code);   // college code
    var type = parseInt(req.query.type);   // 0=core group 1=mentor 2=faculty

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
    if(isNaN(parseInt(type))){
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
                                if (getResult) {
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

    var token = req.query.token;
    var id = req.query.id;     // alumni team id

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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

    var code = alterEzeoneId(req.query.code);   // college code

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: []
    };

    var validateStatus = true;
    var error = {};

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
                console.log(getResult[0]);
                if (!err) {
                    if (getResult[0]) {
                        if (getResult[0][0]) {
                            responseMessage.status = true;
                            responseMessage.error = null;
                            responseMessage.message = 'Cover Image loaded successfully';
                            /**
                             * added image path
                             */
                            getResult[0][0].pg_pic = (getResult[0][0].pg_pic) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[0][0].pg_pic) : '';
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

    var token = req.body.token;
    var profile = req.body.profile;
    var studentID = req.body.student_id;
    var education = parseInt(req.body.education);
    var specialization = parseInt(req.body.specialization);
    var batch = req.body.batch;
    var code = alterEzeoneId(req.body.code);     // college code
    var accesstype = req.body.access_type ? req.body.access_type : 2;  // 0-no relation, 1-is admin, 2-is member
    var ps='';
    var fn = (req.body.fn) ? (req.body.fn) : '';
    var ln = (req.body.ln) ? (req.body.ln) : '';
    var email = (req.body.email) ? (req.body.email) : '';
    var mn = (req.body.mn) ? (req.body.mn) : '';
    var gender = (req.body.gender) ? (req.body.gender) : 0;
    var dob = (req.body.DOB) ? (req.body.DOB) : null;
    var cn = (req.body.cn) ? (req.body.cn) : '';
    var jt = (req.body.jt) ? (req.body.jt) : '';
    var bg = parseInt(req.body.bg) ? parseInt(req.body.bg) : 0;
    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!education && (isNaN(education))){
        error['education'] = 'Invalid education';
        validateStatus *= false;
    }
    if(email){
        console.log(email,"email");
        if (!validator.isEmail(email)) {
            error.email = 'Invalid Email';
            validateStatus *= false;
        }
    }
    if(!specialization && (isNaN(specialization))){
        error['specialization'] = 'Invalid specialization';
        validateStatus *= false;
    }
    if(!batch && (isNaN(batch))){
        error['batch'] = 'Invalid batch';
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
                            + ',' + st.db.escape(code) + ',' + st.db.escape(accesstype)+ ',' + st.db.escape(fn)
                            + ',' + st.db.escape(ln)+ ',' + st.db.escape(email)+ ',' + st.db.escape(mn)
                            + ',' + st.db.escape(gender)+ ',' + st.db.escape(dob)+ ',' + st.db.escape(cn)+ ',' + st.db.escape(jt)
                            + ',' + st.db.escape(bg);

                        var query = 'CALL pSaveAlumniProfile(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, insertresult) {
                            //console.log(insertresult);
                            if (!err) {
                                if (insertresult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Alumni Profile saved successfully';
                                    if(insertresult[0]) {
                                        if (insertresult[0][0]) {
                                            ps = insertresult[0][0].profilestatus;
                                        }
                                    }

                                    responseMessage.data = {
                                        profile_status : ps,
                                        profile: req.body.profile,
                                        student_id: req.body.student_id,
                                        education: req.body.education,
                                        specialization: req.body.specialization,
                                        batch: req.body.batch,
                                        code: req.body.code,
                                        access_type: req.body.access_type,
                                        fn: req.body.fn,
                                        ln: req.body.ln,
                                        email: req.body.email,
                                        mn: req.body.mn,
                                        gender: req.body.gender,
                                        dob: req.body.DOB,
                                        cn: req.body.cn,
                                        jt: req.body.jt,
                                        bg: req.body.bg
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

    var token = req.query.token;
    var tid = req.query.tid;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
                                    if (getResult[0][0]) {
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

    var token = req.query.token;
    var code = alterEzeoneId(req.query.code);   // college code

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
                                if(getResult){
                                    if (getResult[0]) {
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Alumni profile loaded successfully';
                                        responseMessage.data = getResult[0];
                                        responseMessage.ezeonedata = getResult[1];
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetAlumniProfile: Alumni profile loaded successfully');
                                    }
                                    else {
                                        responseMessage.data = null;
                                        responseMessage.ezeonedata = getResult[1];
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

/**
 * @todo FnSaveTENMaster
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description save ten master details
 */
Alumni.prototype.saveTENMaster = function(req,res,next) {

    var token = req.query.token;
    var tid = req.query.tid ? req.query.tid : 0;      // while saving time 0 else id of user
    var title = req.query.title;
    var description = req.query.description;
    var startDate = (req.query.s_date) ? (req.query.s_date) : null;
    var endDate = (req.query.e_date) ? (req.query.e_date) : null;
    var status = req.query.status;   // 1(pending),2=closed,3=on-hold,4=canceled
    var regLastDate = (req.query.reg_lastdate) ? (req.query.reg_lastdate) : null;
    var type = req.query.type;     // 1(training),2=event,3=news,4=knowledge
    var note = req.query.note;
    var venueId = req.query.venue_id;
    var code = alterEzeoneId(req.query.code);
    var capacity = (req.query.capacity) ? (req.query.capacity) : 0;
    var randomName='';
    var tenId=0;
    var originalName='';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if (!token) {
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if (!tid) {
        tid = 0;
    }
    if (isNaN(parseInt(tid))) {
        error['tid'] = 'Invalid tid';
        validateStatus *= false;
    }
    if (!status) {
        error['status'] = 'Invalid status';
        validateStatus *= false;
    }
    if (!type) {
        error['type'] = 'Invalid type';
        validateStatus *= false;
    }
    if (!code) {
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

                        var queryParams = st.db.escape(tid) + ',' + st.db.escape(title) + ',' + st.db.escape(description)
                            + ',' + st.db.escape(startDate) + ',' + st.db.escape(endDate) + ',' + st.db.escape(status)
                            + ',' + st.db.escape(regLastDate) + ',' + st.db.escape(type) + ',' + st.db.escape(token)
                            + ',' + st.db.escape(note) + ',' + st.db.escape(venueId) + ',' + st.db.escape(code) + ',' + st.db.escape(capacity);
                        var query = 'CALL pSaveTENMaster(' + queryParams + ')';

                        console.log(query);

                        st.db.query(query, function (err, insertresult) {
                            console.log(insertresult);
                            if (!err) {
                                if (insertresult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Data saved successfully';
                                    responseMessage.data = {
                                        tid: req.query.tid,
                                        title: req.query.title,
                                        description: req.query.description,
                                        s_date: req.query.s_date,
                                        e_date: req.query.e_date,
                                        status: req.query.status,
                                        reg_lastdate: req.query.reg_lastdate,
                                        type: req.query.type,
                                        ezeone_id: req.query.ezeone_id,
                                        note: req.query.note,
                                        venue_id: req.query.venue_id,
                                        code: alterEzeoneId(req.query.code)
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnSaveTENMaster: Data saved successfully');

                                    if (insertresult[0]) {
                                        if (insertresult[0][0]) {
                                            tenId = insertresult[0][0].id;
                                        }
                                    }

                                    //upload to cloud server
                                    if(req.files) {
                                        for (var prop in req.files) {

                                            if (req.files.hasOwnProperty(prop)) {

                                                var uniqueId = uuid.v4();
                                                var filetype = (req.files[prop].extension) ? req.files[prop].extension : 'jpg';
                                                randomName = uniqueId + '.' + filetype;
                                                originalName = req.files[prop].originalname;
                                                //console.log(randomName);

                                                var readStream = fs.createReadStream(req.files[prop].path);

                                                var picContent = {
                                                    randomName: randomName,
                                                    readStream: readStream,
                                                    originalName: originalName,
                                                    tenId: tenId
                                                };
                                                fnsavepic(picContent, function (err, picResult) {
                                                    if (!err) {
                                                        if (picResult) {
                                                            console.log(picResult);
                                                        }
                                                        else {
                                                            console.log('result not load');
                                                        }
                                                    }
                                                    else {
                                                        console.log('error in save multiple pic');
                                                        console.log(err);
                                                    }
                                                });
                                            }
                                            else {
                                                console.log('attachment is empty');
                                            }
                                        }
                                    }
                                    else
                                    {
                                        console.log('attachment is empty');
                                    }
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

function fnsavepic(picContent, callback) {

    try {

        var localStream = picContent.readStream;
        var remoteWriteStream = bucket.file(picContent.randomName).createWriteStream();
        localStream.pipe(remoteWriteStream);

        remoteWriteStream.on('finish', function () {
            //console.log(picContent.randomName);

            //console.log('FnSaveTENMasterattachment: Pic Uploaded successfully');

            var queryParams1 = st.db.escape(0) + ',' + st.db.escape(picContent.tenId) + ',' + st.db.escape(picContent.randomName)
                + ',' + st.db.escape(picContent.originalName);
            var query1 = 'CALL pSaveTENMasterattachment(' + queryParams1 + ')';

            console.log(query1);

            st.db.query(query1, function (err, attachmentResult) {
                if (!err) {
                    if (attachmentResult) {
                        console.log('attachment file saved');
                        var url = appConfig.CONSTANT.GS_URL + appConfig.CONSTANT.STORAGE_BUCKET + '/' + picContent.randomName;
                        callback(null, url);
                    }
                    else {
                        console.log('attachment file not save');
                        callback(null, null);
                    }
                }
                else {
                    console.log('attachment file not save');
                    console.log(err);
                    callback(null, null);
                }
            });
        });

        remoteWriteStream.on('error', function () {
            console.log('FnSavePictures: Image upload error to google cloud');
            callback(null, null);
        });
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log(ex);
        return 'error'
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

    var token = req.query.token ? req.query.token : '';
    var code = alterEzeoneId(req.query.code);   // college code
    var type = parseInt(req.query.type);   // 1(training),2=event,3=news,4=knowledge
    var status = parseInt(req.query.status);
    var pageSize = req.query.page_size ? parseInt(req.query.page_size) : 100;
    var pageCount = req.query.page_count ? parseInt(req.query.page_count) : 0;

    var responseMessage = {
        status: false,
        count : 0,
        data: null,
        message: '',
        error: {}

    };

    var validateStatus = true;
    var error = {};

    if(!code){
        error['code'] = 'Invalid code';
        validateStatus *= false;
    }
    if(!type){
        type = 0;
    }
    if(isNaN(parseInt(type))){
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

            var queryParams = st.db.escape(type) + ',' + st.db.escape(code)+ ',' + st.db.escape(status)+ ',' + st.db.escape(pageSize)
                + ',' + st.db.escape(pageCount) + ',' + st.db.escape(token);
            var query = 'CALL pGetTENDetails(' + queryParams + ')';
            console.log(query);
            st.db.query(query, function (err, getResult) {
                if (!err) {
                    if (getResult[0]) {
                        if (getResult[0][0].count > 0) {
                            //console.log(getResult);
                            //console.log(getResult[1]);
                            if (getResult[1]) {
                                if (getResult[1].length > 0) {
                                    for (var ct = 0; ct < getResult[1].length; ct++) {
                                        getResult[1][ct].attachment = getResult[1][ct].attachment ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[1][ct].attachment : '';
                                    }

                                    for (var i = 0; i < getResult[1].length; i++) {
                                        var output = [];
                                        if (getResult[1][i].attachment1) {

                                            var attach = getResult[1][i].attachment1.split(',');

                                            for (var j = 0; j < attach.length; j++) {
                                                var joinAttach = {
                                                    s_url: req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attach[j]
                                                };
                                                output.push(joinAttach);
                                                getResult[1][i].attachment1 = output;

                                            }
                                        }
                                        else {
                                            getResult[1][i].attachment1 = '';
                                        }
                                    }
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Data loaded successfully';
                                    responseMessage.count = getResult[0][0].count;
                                    responseMessage.data = getResult[1];
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
 * @todo FnGetMyTENDetails
 * Method : GET
 * @param req
 * @param res
 * @param next
 * @description api code for get ten details which are posted by the user who is logged in
 * @used For getting up pending event details which are showed to user who posted the events before approval
 */
Alumni.prototype.getMyTENDetails = function(req,res,next){

    var token = req.query.token ? req.query.token : '';
    var code = alterEzeoneId(req.query.code);   // college code
    var type = parseInt(req.query.type);   // 1(training),2=event,3=news,4=knowledge
    var status = parseInt(req.query.status);
    var pageSize = req.query.page_size ? parseInt(req.query.page_size) : 100;
    var pageCount = req.query.page_count ? parseInt(req.query.page_count) : 0;

    var responseMessage = {
        status: false,
        count : 0,
        data: null,
        message: '',
        error: {}

    };

    var validateStatus = true;
    var error = {};

    if(!code){
        error['code'] = 'Invalid code';
        validateStatus *= false;
    }
    if(!type){
        type = 0;
    }
    if(isNaN(parseInt(type))){
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

            var queryParams = st.db.escape(type) + ',' + st.db.escape(code)+ ',' + st.db.escape(status)+ ',' + st.db.escape(pageSize)
                + ',' + st.db.escape(pageCount) + ',' + st.db.escape(token);
            var query = 'CALL get_ten_pending_details(' + queryParams + ')';
            console.log(query);
            st.db.query(query, function (err, getResult) {
                if (!err) {
                    if (getResult[0]) {
                        if (getResult[0][0]) {
                            if (getResult[0][0].count > 0) {
                                //console.log(getResult);
                                //console.log(getResult[1]);
                                if (getResult[1]) {
                                    if (getResult[1].length > 0) {
                                        for (var ct = 0; ct < getResult[1].length; ct++) {
                                            getResult[1][ct].attachment = getResult[1][ct].attachment ? req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[1][ct].attachment : '';
                                        }

                                        for (var i = 0; i < getResult[1].length; i++) {
                                            var output = [];
                                            if (getResult[1][i].attachment1) {

                                                var attach = getResult[1][i].attachment1.split(',');

                                                for (var j = 0; j < attach.length; j++) {
                                                    var joinAttach = {
                                                        s_url: req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + attach[j]
                                                    };
                                                    output.push(joinAttach);
                                                    getResult[1][i].attachment1 = output;

                                                }
                                            }
                                            else {
                                                getResult[1][i].attachment1 = '';
                                            }
                                        }
                                        responseMessage.status = true;
                                        responseMessage.error = null;
                                        responseMessage.message = 'Data loaded successfully';
                                        responseMessage.count = getResult[0][0].count;
                                        responseMessage.data = getResult[1];
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

    var token = req.query.token;
    var code = alterEzeoneId(req.query.code);   // college code

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0].length > 0) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Data loaded successfully';
                                            responseMessage.data = {
                                                isProfileCreated: true,
                                                result: getResult[0]
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetProfileStatus: Data loaded successfully');
                                        }
                                        else {
                                            responseMessage.status = true;
                                            responseMessage.message = 'Your profile is not created';
                                            responseMessage.data = {
                                                isProfileCreated: false
                                            };
                                            res.status(200).json(responseMessage);
                                            console.log('FnGetProfileStatus: Your profile is not created');
                                        }
                                    }
                                    else {
                                        responseMessage.status = true;
                                        responseMessage.message = 'Your profile is not created';
                                        responseMessage.data = {
                                            isProfileCreated: false
                                        };
                                        res.status(200).json(responseMessage);
                                        console.log('FnGetProfileStatus: Your profile is not created');
                                    }
                                }
                                else {
                                    responseMessage.status = true;
                                    responseMessage.message = 'Your profile is not created';
                                    responseMessage.data = {
                                        isProfileCreated: false
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

    var error = {};
    var validateStatus = true;

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!status){
        status = 0;
    }
    if(isNaN(parseInt(status))){
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

    var validateStatus = true;
    var error = {};

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

    var profileId = req.query.profile_id;  // profileID is AlumniProfileID of that user
    var ids = req.query.ids;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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

            var queryParams = st.db.escape(profileId) + ',' + st.db.escape(ids);
            var query = 'CALL pLoadparticiapatedTENId(' + queryParams + ')';
            st.db.query(query, function (err, getResult) {
                if (!err) {
                    if (getResult) {
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

    var token = req.query.token;
    var tid = req.query.tid;  // id of traning id

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
                                if (getResult) {
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

    var token = req.query.token;
    var code = alterEzeoneId(req.query.code);  // college code
    /**
     * Allowed codes for alumni are as follows
     * 0 : Not Verified
     * 1 : Verified
     * 2 : Rejected
     * Default : 0 (Not Verified)
     */
    var alumniStatus = req.query.alumni_status ? req.query.alumni_status : 0;


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
                        var queryParams = st.db.escape(code) + ',' + st.db.escape(alumniStatus);
                        var query = 'CALL pGetAlumniMemberApprovalList(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getResult) {
                            if (!err) {
                                if (getResult) {
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

    var code = alterEzeoneId(req.query.code);   // college code

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
            console.log(query);

            st.db.query(query, function (err, getResult) {
                //console.log(getResult);
                if (!err) {
                    if (getResult) {
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
Alumni.prototype.getTeamImage = function(req,res,next) {

    var code = alterEzeoneId(req.query.code);   // college code
    var type = parseInt(req.query.type);   // 0=core group 1=mentor 2=faculty

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};


    if (!code) {
        error['code'] = 'Invalid code';
        validateStatus *= false;
    }
    if (!type) {
        type = 0;
    }
    if (isNaN(parseInt(type))) {
        error['type'] = 'Invalid type';
        validateStatus *= false;
    }

    if (!validateStatus) {
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
                    if (getResult) {
                        if (getResult[0]) {
                            if (getResult[0].length > 0) {

                                for (var i = 0; i < getResult[0].length; i++) {
                                    getResult[0][i].picture = (getResult[0][i].picture) ?
                                    req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + getResult[0][i].picture : '';
                                }
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

    var ids = req.query.ids;   // comma separated tids of training

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
                    if (getResult){
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

    var error = {};
    var validateStatus = true;

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }

    if(!id){
        id = 0;
    }
    if(isNaN(parseInt(id))){
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
                           // console.log(insertresult);
                            if (!err) {
                                if (insertresult) {
                                    if (insertresult[0]) {
                                        if (insertresult[0][0]) {
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
                                        responseMessage.message = 'No Save Venue';
                                        res.status(200).json(responseMessage);
                                        console.log('FnSaveTENVenue:No save Venue');
                                    }
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
                                console.log(getResult);
                                if (getResult[0]) {
                                    responseMessage.status = true;
                                    responseMessage.count = getResult[1][0].count;
                                    responseMessage.data = getResult[0];
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
                                    responseMessage.count = getResult[1][0].count;
                                    responseMessage.cid = getResult[1][0].cid;
                                    responseMessage.cn = getResult[1][0].cn;
                                    responseMessage.cc = getResult[1][0].cc;
                                    responseMessage.page = getResult[1][0].page;
                                    responseMessage.data = getResult[0];
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

    var ezeid = alterEzeoneId(req.query.ezeone_id);
    var token = req.query.token;
    var pageSize = req.query.page_size;
    var pageCount = req.query.page_count;
    var alumniCode = req.query.a_code ? req.query.a_code : '';
    var clientSort = (!isNaN(parseInt(req.query.cls))) ?  parseInt(req.query.cls) : 0;
    var clientQuery = req.query.clq ? req.query.clq : '';
    var contactSort = (!isNaN(parseInt(req.query.cts))) ?  parseInt(req.query.cts): 0;
    var contactQuery = req.query.ctq ? req.query.ctq : '';
    var jobCodeSort = (!isNaN(parseInt(req.query.jcs))) ?  parseInt(req.query.jcs) : 0;
    var jobCodeQuery = req.query.jcq ? req.query.jcq : '';
    var jobTitleSort = (!isNaN(parseInt(req.query.jts))) ?  parseInt(req.query.jts): 0;
    var jobTitleQuery = req.query.jtq ? req.query.jtq : '';
    var createdDateSort = (!isNaN(parseInt(req.query.cds))) ?  parseInt(req.query.cds): 0;
    var status = (!isNaN(parseInt(req.query.sts))) ?  parseInt(req.query.sts): 1;


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };
    var validateStatus = true, error = {};
    if(!ezeid){
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
                        var query = st.db.escape(ezeid) + ',' + st.db.escape(pageSize) + ',' + st.db.escape(pageCount)
                            + ',' + st.db.escape(alumniCode)+ ',' + st.db.escape(clientSort) + ',' + st.db.escape(clientQuery)
                            + ',' + st.db.escape(contactSort) + ',' + st.db.escape(contactQuery) + ',' + st.db.escape(jobTitleSort)
                            + ',' + st.db.escape(jobTitleQuery)+ ',' + st.db.escape(createdDateSort) + ',' + st.db.escape(status)
                            + ',' + st.db.escape(jobCodeSort)+ ',' + st.db.escape(jobCodeQuery);
                        console.log('CALL pGetJobs(' + query + ')');
                        st.db.query('CALL pGetJobs(' + query + ')', function (err, getresult) {

                            if (!err) {
                                if (getresult) {
                                    if (getresult[0]) {
                                        if (getresult[0][0]) {
                                            responseMessage.status = true;
                                            responseMessage.error = null;
                                            responseMessage.message = 'Jobs send successfully';
                                            responseMessage.data = {
                                                total_count: getresult[1][0].count,
                                                result : getresult[0]
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

    var token = req.query.token;
    var code = alterEzeoneId(req.query.code);  // college code
    var status = req.query.status; // 0-Pending,1-Active,2-inactive


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
                                if (getResult) {
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

    var token = req.body.token;
    var jobId = req.body.job_id;
    var status = (!isNaN(parseInt(req.body.st))) ? parseInt(req.body.st) : 0 ;   // 0=Pending,1=Active,2=inactive

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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

    var token = req.query.token;
    var title = req.query.keyword;
    var pageSize = req.query.ps ? parseInt(req.query.ps) : 1000;       // no of records per page (constant value) eg: 10
    var pageCount = req.query.pc ? parseInt(req.query.pc) : 0;     // first time its 0. start result count
    var code = alterEzeoneId(req.query.code);

    var responseMessage = {
        status: false,
        count : 0,
        data: null,
        message: '',
        error: {}
    };

    var validateStatus = true;
    var error = {};

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
                        var queryParams = st.db.escape(title)+ ',' + st.db.escape(pageCount) + ',' + st.db.escape(pageSize)
                            + ',' + st.db.escape(code);
                        var query = 'CALL pSearchAlumniTEN(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, getResult) {
                            //console.log(getResult);
                            if (!err) {
                                if (getResult) {
                                    if (getResult[0]) {
                                        if (getResult[0][0]) {
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

    var token = req.query.token;
    var code = req.query.code;  // college code


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
                                if (getResult) {
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
                                            result.page1title = results[0][i].page1title;
                                            result.AlumniID = results[0][i].AlumniID;
                                            result.alumnicode = results[0][i].alumnicode;
                                            result.profilestatus = results[0][i].profilestatus;
                                            result.profile_id = results[0][i].profileid;

                                            result.s_url = (results[0][i].logoimage) ? (req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + results[0][i].logoimage) :'';
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

    var token = req.query.token;
    var title = req.query.title ? alterEzeoneId(req.query.title) : '';

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
                                if (getresult) {
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

    var token = req.body.token;
    var alumniId = req.body.aid;
    var status = req.body.status;

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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
                                    if (getresult[0]) {
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

/**
 * @todo FnTestTagsDocs
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @description api code for save standard tags
 */
Alumni.prototype.testUrl = function(req,res,next) {


    var uuid = require('node-uuid');

    var randomName,type,filetype;

    try{

        //var query = "SELECT tid,attachment as picture,attachmenttitle as imagefilename FROM ten_master WHERE attachment!='' OR attachment is NOT null";
        var query = "SELECT tid, page1pic as picture ,page1picfilename as imagefilename FROM alumni_content";

        st.db.query(query, function (err, result) {

            console.log('------------');
            //console.log(result);
            console.log(result.length);


            var tid = req.body.tid;

            var uploadFile = function(i) {

                if (i < result.length) {

                    console.log(result[i].imagefilename);

                    if(result[i].imagefilename){
                        filetype = (result[i].imagefilename).split('.');
                        type = filetype[1];
                    }
                    else {

                        type = 'jpg';
                    }
                    console.log(type);
                    var base64Data = result[i].picture;
                    var tid = result[i].tid;
                    console.log(tid);

                    var bufferData = new Buffer(base64Data.replace(/^data:image\/(png|gif|jpeg|jpg);base64,/, ''),  'base64');
                    console.log(bufferData);

                    var uniqueId = uuid.v4();
                    randomName = uniqueId + '.' + type;

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
                            console.log('uploaded sucessfully');
                            var query = 'UPDATE alumni_content SET page1pic=' + st.db.escape(randomName) + ' WHERE tid=' + tid;

                            console.log(query);
                            st.db.query(query, function (err, result) {
                                if (!err) {
                                    console.log('file updated to database');
                                    var url = req.CONFIG.CONSTANT.GS_URL + req.CONFIG.CONSTANT.STORAGE_BUCKET + '/' + randomName;
                                    console.log(url);
                                    i = i + 1;
                                    uploadFile(i);

                                }
                                else {
                                    console.log('file not updated to database');

                                }
                            });

                        });

                        remoteWriteStream.on('error', function () {
                            console.log('file not uploaded');

                        });
                    }
                }
                else{
                    res.statusCode = 200;
                    var RtnMessage = 'success';
                    res.send(RtnMessage);
                }
            };



            if(tid){
                console.log('tid....');
                var i=0;
                uploadFile(i);
            }

        });
    }

    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server Error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(400).json(responseMessage);
        console.log('Error : FnSaveStandardTags ' + ex.description);
        console.log(ex);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }

};


/**
 * @todo FnApproveAlumnimembers
 * Method : POST
 * @param req
 * @param res
 * @param next
 * @server_param
 * @description Approve Alumni members
 */
Alumni.prototype.approveAlumnimembers = function(req,res,next) {

    /**
     * checking input parameters are json or not
     * @param token (char(36))
     * @param id int    // person id
     * @param status int // 0-not verified,1-verified,2-rejected
     */

    var isJson = req.is('json');

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!isJson){
        error['isJson'] = 'Invalid Input ContentType';
        validateStatus *= false;
    }

    else{
        /**
         * storing and validating the input parameters
         */

        var token = req.body.token;
        var id = parseInt(req.body.id);  // person id
        var status = parseInt(req.body.status); // 0-not verified,1-verified,2-rejected

        if(!(token)){
            error['token'] = 'token is Mandatory';
            validateStatus *= false;
        }
        if(isNaN(id)){
            error['id'] = 'id is not integer value';
            validateStatus *= false;
        }
        if(isNaN(status)){
            error['status'] = 'status is not integer value';
            validateStatus *= false;
        }
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
                        var queryParams = st.db.escape(id)+ ',' + st.db.escape(status);
                        var query = 'CALL pApproveAlumnimembers(' + queryParams + ')';
                        console.log(query);

                        st.db.query(query, function (err, approveResult) {
                            //console.log(approveResult);
                            if (!err) {
                                if (approveResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'ApproveAlumnimembers updated successfully';
                                    responseMessage.data = {
                                        id : id,
                                        status : status
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnApproveAlumnimembers: ApproveAlumnimembers updated successfully');
                                }
                                else {
                                    responseMessage.message = 'ApproveAlumnimembers not update';
                                    res.status(200).json(responseMessage);
                                    console.log('FnApproveAlumnimembers:ApproveAlumnimembers not update');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured ! Please try again';
                                res.status(500).json(responseMessage);
                                console.log('FnApproveAlumnimembers: error in updating ApproveAlumnimembers:' + err);
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
                        console.log('FnApproveAlumnimembers: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal server error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnApproveAlumnimembers:Error in processing Token' + err);
                }
            });
        }
        catch(ex){
            responseMessage.error = {
                server: 'Internal Server error'
            };
            responseMessage.message = 'An error occurred !';
            console.log('FnApproveAlumnimembers:error ' + ex.description);
            console.log(ex);
            var errorDate = new Date(); console.log(errorDate.toTimeString() + ' ....................');
            res.status(400).json(responseMessage);
        }
    }
};

/**
 * @todo FnDeleteTenAttachment
 * Method : Delete
 * @param req
 * @param res
 * @param next
 * @description api code for delete ten attachment
 */
Alumni.prototype.deleteTenAttachment = function(req,res,next){

    var token = req.query.token;
    var url = req.query.url;     // attachment url

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

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

                        var queryParams = st.db.escape(url);
                        var query = 'CALL pdeletetenattachment(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, attachResult) {

                            if (!err) {
                                if (attachResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Attachment deleted successfully';
                                    responseMessage.data = {url: req.query.url};
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteTenAttachment: Attachment deleted successfully');
                                }
                                else {
                                    responseMessage.message = 'Attachment not deleted';
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteTenAttachment: Attachment not deleted');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnDeleteTenAttachment: error in deleting Attachment :' + err);
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
                        console.log('FnDeleteTenAttachment: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnDeleteTenAttachment:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnDeleteTenAttachment : ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * @todo FnDeleteTenEvent
 * Method : Delete
 * @param req
 * @param res
 * @param next
 * @description api code for delete event
 */
Alumni.prototype.deleteEvent = function(req,res,next){

    var token = req.query.token;
    var tenId = req.query.ten_id;


    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(isNaN(parseInt(tenId))){
        error['tenId'] = 'Invalid tenId';
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

                        var queryParams = st.db.escape(tenId);
                        var query = 'CALL pdeleteten(' + queryParams + ')';
                        //console.log(query);
                        st.db.query(query, function (err, eventResult) {

                            if (!err) {
                                if (eventResult) {
                                    responseMessage.status = true;
                                    responseMessage.error = null;
                                    responseMessage.message = 'Event deleted successfully';
                                    responseMessage.data = {
                                        tenId : req.query.ten_id
                                    };
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteEvent: Event deleted successfully');
                                }
                                else {
                                    responseMessage.message = 'Event not deleted';
                                    res.status(200).json(responseMessage);
                                    console.log('FnDeleteEvent: Event not deleted');
                                }
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('FnDeleteEvent: error in deleting Event :' + err);
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
                        console.log('FnDeleteEvent: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('FnDeleteEvent:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : FnDeleteEvent : ' + ex.description);
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
Alumni.prototype.getAlumniEducations = function(req,res,next) {

    var token = req.query.token;
    var responseMsg = {
        status: false,
        data: [],
        message: 'Unable to load educations',
        error: {}
    };

    var validateStatus = true;
    var error = {};
    if (!token) {
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!req.query.alumni_code){
        error['alumni_code'] = 'Invalid Alumni code';
        validateStatus *= false;
    }
    if (!validateStatus) {
        responseMsg.error = error;
        responseMsg.message = 'Please check the errors below';
        res.status(400).json(responseMsg);
    }
    else {
        try {
            var alumniCode = alterEzeoneId(req.query.alumni_code);
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var parameters = st.db.escape(alumniCode);
                        var procQuery = 'CALL pGetAlumni_Educations('+ parameters +')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, educationResult) {
                            if (err) {
                                console.log('Error : pGetAlumni_Educations :' + err);
                                res.status(400).json(responseMsg);
                            }
                            else {
                                if(educationResult) {
                                    console.log(educationResult);
                                    if(educationResult[0]) {
                                        if(educationResult[0].length > 0){
                                            responseMsg.status = true;
                                            responseMsg.message = 'Educations loaded successfully';
                                            responseMsg.error = null;
                                            responseMsg.data = educationResult[0];
                                            res.status(200).json(responseMsg);
                                        }
                                        else {
                                            responseMsg.status = true;
                                            responseMsg.message = 'Unable to load educations';
                                            responseMsg.error = null;
                                            responseMsg.data = [];
                                            res.status(200).json(responseMsg);
                                        }
                                    }
                                    else{
                                        console.log('getAlumniEducations:Unable to load educations');
                                        res.status(200).json(responseMsg);
                                    }
                                }
                                else{
                                    console.log('getAlumniEducations:Unable to load educations');
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
                        console.log('getAlumniEducations: Invalid token');
                    }
                }
                else {
                    responseMsg.error = {};
                    responseMsg.message = 'Error in validating Token';
                    res.status(500).json(responseMsg);
                    console.log('getAlumniEducations:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            res.status(500).json(responseMsg);
            console.log('Error : getAlumniEducations ' + ex.description);
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
Alumni.prototype.getAlumniSpecialization = function(req,res,next) {

    var token = req.query.token;
    var responseMsg = {
        status: false,
        data: [],
        message: 'Unable to load Specialization',
        error: {}
    };
    req.query.education_id = (req.query.education_id) ? req.query.education_id : '';

    var validateStatus = true;
    var error = {};
    if (!token) {
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!req.query.alumni_code){
        error['alumni_code'] = 'Invalid Alumni code';
        validateStatus *= false;
    }
    if (!validateStatus) {
        responseMsg.error = error;
        responseMsg.message = 'Please check the errors below';
        res.status(400).json(responseMsg);
    }
    else {
        try {
            var alumniCode = alterEzeoneId(req.query.alumni_code);
            st.validateToken(token, function (err, tokenResult) {
                if (!err) {
                    if (tokenResult) {
                        var parameters = st.db.escape(req.query.education_id) + ',' + st.db.escape(alumniCode) ;
                        var procQuery = 'CALL pGetAlumni_Specialization('+ parameters +')';
                        console.log(procQuery);
                        st.db.query(procQuery, function (err, spResult) {
                            if (err) {
                                console.log('Error : pGetAlumni_Specialization :' + err);
                                res.status(400).json(responseMsg);
                            }
                            else {
                                if(spResult) {
                                    console.log(spResult);
                                    if(spResult[0]) {
                                        if(spResult[0].length > 0){
                                            responseMsg.status = true;
                                            responseMsg.message = 'Educations loaded successfully';
                                            responseMsg.error = null;
                                            responseMsg.data = spResult[0];
                                            res.status(200).json(responseMsg);
                                        }
                                        else {
                                            responseMsg.status = true;
                                            responseMsg.message = 'Unable to load Specialization';
                                            responseMsg.error = null;
                                            responseMsg.data = [];
                                            res.status(200).json(responseMsg);
                                        }
                                    }
                                    else{
                                        console.log('getAlumniEducations:Unable to load Specialization');
                                        res.status(200).json(responseMsg);
                                    }
                                }
                                else{
                                    console.log('getAlumniEducations:Unable to load Specialization');
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
                        console.log('getAlumniEducations: Invalid token');
                    }
                }
                else {
                    responseMsg.error = {};
                    responseMsg.message = 'Error in validating Token';
                    res.status(500).json(responseMsg);
                    console.log('getAlumniEducations:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            res.status(500).json(responseMsg);
            console.log('Error : getAlumniEducations ' + ex.description);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};

/**
 * Method : PUT
 * @param req
 * @param res
 * @param next
 */
Alumni.prototype.changeAlumniMemberType = function(req,res,next){

    var responseMessage = {
        status: false,
        error: {},
        message: '',
        data: null
    };

    var validateStatus = true;
    var error = {};

    if(!req.body.token){
        error['token'] = 'Invalid token';
        validateStatus *= false;
    }
    if(!req.body.alumni_code){
        error['alumni_code'] = 'Invalid alumni code';
        validateStatus *= false;
    }
    if(!req.body.ids){
        error['ids'] = 'Invalid tids';
        validateStatus *= false;
    }
    if(!req.body.member_type){
        error['member_type'] = 'Invalid member type';
        validateStatus *= false;
    }

    if(!validateStatus){
        responseMessage.error = error;
        responseMessage.message = 'Please check the errors below';
        res.status(400).json(responseMessage);
    }
    else {
        try {
            var alumniCode = alterEzeoneId(req.body.alumni_code);
            st.validateToken(req.body.token, function (err, result) {
                if (!err) {
                    if (result) {
                        var queryParams = st.db.escape(alumniCode)+','+st.db.escape(req.body.ids)+','+st.db.escape(req.body.member_type);
                        var query = 'CALL pchange_alumni_membertype(' + queryParams + ')';
                        console.log(query);
                        st.db.query(query, function (err, getresult) {
                            console.log(getresult);
                            if (!err) {
                                responseMessage.status = true;
                                responseMessage.error = null;
                                responseMessage.message = 'Alumni member type updated successfully';
                                responseMessage.data = null;
                                res.status(200).json(responseMessage);
                            }
                            else {
                                responseMessage.message = 'An error occured in query ! Please try again';
                                responseMessage.error = {
                                    server: 'Internal Server Error'
                                };
                                res.status(500).json(responseMessage);
                                console.log('pchange_alumni_membertype: Alumni member type not updated:' + err);
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
                        console.log('changeAlumniMemberType: Invalid token');
                    }
                }
                else {
                    responseMessage.error = {
                        server: 'Internal Server Error'
                    };
                    responseMessage.message = 'Error in validating Token';
                    res.status(500).json(responseMessage);
                    console.log('changeAlumniMemberType:Error in processing Token' + err);
                }
            });
        }
        catch (ex) {
            responseMessage.error = {
                server: 'Internal Server Error'
            };
            responseMessage.message = 'An error occurred !';
            res.status(400).json(responseMessage);
            console.log('Error : changeAlumniMemberType ' + ex.description);
            console.log(ex);
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
        }
    }
};



module.exports = Alumni;

