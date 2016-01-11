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

var NotificationMqtt = require('./notification/notification-mqtt.js');
var notificationMqtt = new NotificationMqtt();
var NotificationQueryManager = require('./notification/notification-query.js');
var notificationQmManager = null;
var mailModule = require('./mail-module.js');
var mail = null;


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
        notificationQmManager = new NotificationQueryManager(db,st);
        mail = new mailModule(db,stdLib);
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
    var addressLine1 = req.body.AddressLine1;
    var addressLine2 = req.body.AddressLine2;
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
    var encryptPwd = '',fullName='';

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

    var validateStatus = true, error = {};

    if(idtypeId == 1) {
        if (!firstName) {
            error['firstName'] = 'firstName is mandatory';
            validateStatus *= false;
            console.log('firstName is mandatory');
        }
    }
    if(idtypeId == 2 && idtypeId == 3){
        error['companyName'] = 'companyName is mandatory';
        validateStatus *= false;
        console.log('companyName is mandatory');
    }

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
                        + ',' + st.db.escape(statusId) + ',' + st.db.escape(apUserid) + ',' + st.db.escape(businessKeywords);

                    var query = 'CALL pSaveEZEIDData(' + queryParams + ')';
                    console.log(query);
                    st.db.query(query, function (err, registerResult) {
                        console.log(registerResult);
                        if (!err) {
                            if (registerResult) {
                                if (registerResult[0]) {
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

                                                /**
                                                 * Creating queue for the user dynamically on rabbit server
                                                 *
                                                 */
                                                notificationQmManager.getIndividualGroupId(registerResult[0][0].TID, function (err1, getIndividualGroupIdRes) {
                                                    if (!err1) {
                                                        if (getIndividualGroupIdRes) {
                                                            notificationMqtt.createQueue(getIndividualGroupIdRes.tid);
                                                        }
                                                    }
                                                });

                                                //saving iphone device token
                                                if (isIphone == 1) {
                                                    var queryParams2 = st.db.escape(ezeid) + ',' + st.db.escape(deviceToken);
                                                    var query2 = 'CALL pSaveIPhoneDeviceID(' + queryParams2 + ')';
                                                    // console.log(query);
                                                    st.db.query(query2, function (err, result) {
                                                        if (!err) {
                                                            //console.log(result);
                                                            console.log('FnLogin:IphoneDevice save successfully');
                                                        }
                                                        else {
                                                            console.log(err);
                                                        }
                                                    });
                                                }

                                                //send mail for registeration
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
                                                    console.log(rtnMessage);
                                                    res.send(rtnMessage);
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
            else {
                console.log('----------Operation type other than 1--------------');
                if (idtypeId && ezeid && addressLine1 && cityTitle && stateId && countryId && postalCode) {
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
                        + ',' + st.db.escape(statusId) + ',' + st.db.escape(apUserid) + ',' + st.db.escape(businessKeywords);

                    var query = 'CALL pSaveEZEIDData(' + queryParams + ')';
                    console.log(query);
                    st.db.query(query, function (err, registerResult) {
                        if (!err) {
                            if (registerResult) {
                                if (registerResult[0]) {
                                    if (registerResult[0].length > 0) {
                                        if (registerResult[0][0].TID != 0) {
                                            if (idtypeId == 2) {
                                                rtnMessage.FirstName = comapanyName;
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
                                                    res.send(rtnMessage);
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
                        console.log('FnRegistration: IDTypeID is empty');
                    } else if (!ezeid) {
                        console.log('FnRegistration: EZEID is empty');
                    } else if (!addressLine1) {
                        console.log('FnRegistration: AddressLine1 is empty');
                    } else if (!cityTitle) {
                        console.log('FnRegistration: CityTitle is empty');
                    } else if (!stateId) {
                        console.log('FnRegistration: StateID is empty');
                    } else if (!countryId) {
                        console.log('FnRegistration: CountryID is empty');
                    } else if (!postalCode) {
                        console.log('FnRegistration: PostalCode is empty');
                    }
                    res.statusCode = 400;
                    res.send(rtnMessage);
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
    }
};

/**
 * @todo FnLogin
 * Method : POST
 * @param req
 * @param res
 * @param next
 */
Auth.prototype.login = function(req,res,next){


    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

    var ezeoneId = alterEzeoneId(req.body.UserName);
    var password = req.body.Password;
    var isIphone = req.body.device ? parseInt(req.body.device) : 0;
    var deviceToken = req.body.device_token ? req.body.device_token : '';
    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var token = req.body.token ? req.body.token : '';
    var code = req.body.code ? req.body.code : '';

    // console.log(req.body);

    var responseMessage = {
        Token: '',
        TID:'',
        IsAuthenticate: false,
        ezeone_id:'',
        FirstName: '',
        Type: 0,
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
        isAddressSaved:'',
        isinstitute_admin : '',
        cvid : 0,
        profile_status:''

    };

    try{
        if (ezeoneId && password) {

            var queryParams = st.db.escape(ezeoneId) + ',' + st.db.escape(code)+ ',' + st.db.escape(token);
            var query = 'CALL PLoginNew(' + queryParams + ')';
            console.log(query);
            st.db.query(query, function (err, loginResult) {
                //console.log(loginResult);
                if (!err) {
                    if(loginResult && password) {
                        if (loginResult[0].length > 0) {

                            var loginDetails = loginResult[0];
                            //console.log(loginDetails);

                            if (!token) {
                                console.log('compare password..');
                                if (comparePassword(password, loginDetails[0].Password)) {
                                    st.generateToken(ip, userAgent, ezeoneId, function (err, tokenResult) {

                                        console.log(err);
                                        console.log(tokenResult);
                                        if (!err) {
                                            if (tokenResult) {

                                                res.cookie('Token', tokenResult, {maxAge: 900000, httpOnly: true});
                                                responseMessage.Token = tokenResult;
                                                responseMessage.IsAuthenticate = true;
                                                responseMessage.TID = loginDetails[0].TID;
                                                responseMessage.ezeone_id = loginDetails[0].EZEID;
                                                responseMessage.FirstName = loginDetails[0].FirstName;
                                                responseMessage.CompanyName = loginDetails[0].CompanyName;
                                                responseMessage.Type = loginDetails[0].IDTypeID;
                                                responseMessage.Verified = loginDetails[0].EZEIDVerifiedID;
                                                responseMessage.SalesModueTitle = loginDetails[0].SalesModueTitle;
                                                responseMessage.SalesModuleTitle = loginDetails[0].SalesModuleTitle;
                                                responseMessage.AppointmentModuleTitle = loginDetails[0].AppointmentModuleTitle;
                                                responseMessage.HomeDeliveryModuleTitle = loginDetails[0].HomeDeliveryModuleTitle;
                                                responseMessage.ServiceModuleTitle = loginDetails[0].ServiceModuleTitle;
                                                responseMessage.CVModuleTitle = loginDetails[0].CVModuleTitle;
                                                responseMessage.SalesFormMsg = loginDetails[0].SalesFormMsg;
                                                responseMessage.ReservationFormMsg = loginDetails[0].ReservationFormMsg;
                                                responseMessage.HomeDeliveryFormMsg = loginDetails[0].HomeDeliveryFormMsg;
                                                responseMessage.ServiceFormMsg = loginDetails[0].ServiceFormMsg;
                                                responseMessage.CVFormMsg = loginDetails[0].CVFormMsg;
                                                responseMessage.SalesItemListType = loginDetails[0].SalesItemListType;
                                                responseMessage.RefreshInterval = loginDetails[0].RefreshInterval;
                                                responseMessage.UserModuleRights = loginDetails[0].UserModuleRights;
                                                if(loginDetails[0].ParentMasterID == 0) {
                                                    responseMessage.MasterID = loginDetails[0].TID;
                                                }
                                                else{
                                                    responseMessage.MasterID = loginDetails[0].ParentMasterID;
                                                }
                                                responseMessage.PersonalEZEID = loginDetails[0].PersonalEZEID;
                                                responseMessage.VisibleModules = loginDetails[0].VisibleModules;
                                                responseMessage.FreshersAccepted = loginDetails[0].FreshersAccepted;
                                                responseMessage.HomeDeliveryItemListType = loginDetails[0].HomeDeliveryItemListType;
                                                responseMessage.ReservationDisplayFormat = loginDetails[0].ReservationDisplayFormat;
                                                responseMessage.mobilenumber = loginDetails[0].mobilenumber;
                                                responseMessage.isAddressSaved = loginDetails[0].isAddressSaved;
                                                responseMessage.group_id = loginDetails[0].group_id;
                                                responseMessage.isinstitute_admin = loginDetails[0].isinstituteadmin;
                                                responseMessage.cvid = loginDetails[0].cvid;
                                                responseMessage.profile_status = loginDetails[0].ps;

                                                console.log('FnLogin: Login success');
                                                // saving ios device id to database
                                                if (isIphone == 1) {
                                                    var queryParams1 = st.db.escape(ezeoneId) + ',' + st.db.escape(deviceToken);
                                                    var query1 = 'CALL pSaveIPhoneDeviceID(' + queryParams1 + ')';
                                                    //console.log(query);
                                                    st.db.query(query1, function (err, deviceResult) {
                                                        if (!err) {
                                                            console.log('FnLogin:Ios Device Id saved successfully');
                                                        }
                                                        else {
                                                            console.log(err);
                                                        }
                                                    });
                                                }
                                                res.send(responseMessage);
                                            }
                                            else {

                                                res.send(responseMessage);
                                                console.log('FnLogin:failed to generate a token ');
                                            }
                                        }
                                        else {
                                            res.statusCode = 500;
                                            res.send(responseMessage);
                                            console.log('FnLogin:failed to generate a token ');
                                            console.log('FnLogin:' + err);
                                        }
                                    });
                                }
                                else
                                {
                                    res.send(responseMessage);
                                    console.log('FnLogin:password not matched ');
                                }
                            }
                            else {
                                responseMessage.Token = token;
                                responseMessage.IsAuthenticate = true;
                                responseMessage.TID = loginDetails[0].TID;
                                responseMessage.ezeone_id = loginDetails[0].EZEID;
                                responseMessage.FirstName = loginDetails[0].FirstName;
                                responseMessage.CompanyName = loginDetails[0].CompanyName;
                                responseMessage.Type = loginDetails[0].IDTypeID;
                                responseMessage.Verified = loginDetails[0].EZEIDVerifiedID;
                                responseMessage.SalesModueTitle = loginDetails[0].SalesModueTitle;
                                responseMessage.SalesModuleTitle = loginDetails[0].SalesModuleTitle;
                                responseMessage.AppointmentModuleTitle = loginDetails[0].AppointmentModuleTitle;
                                responseMessage.HomeDeliveryModuleTitle = loginDetails[0].HomeDeliveryModuleTitle;
                                responseMessage.ServiceModuleTitle = loginDetails[0].ServiceModuleTitle;
                                responseMessage.CVModuleTitle = loginDetails[0].CVModuleTitle;
                                responseMessage.SalesFormMsg = loginDetails[0].SalesFormMsg;
                                responseMessage.ReservationFormMsg = loginDetails[0].ReservationFormMsg;
                                responseMessage.HomeDeliveryFormMsg = loginDetails[0].HomeDeliveryFormMsg;
                                responseMessage.ServiceFormMsg = loginDetails[0].ServiceFormMsg;
                                responseMessage.CVFormMsg = loginDetails[0].CVFormMsg;
                                responseMessage.SalesItemListType = loginDetails[0].SalesItemListType;
                                responseMessage.RefreshInterval = loginDetails[0].RefreshInterval;
                                responseMessage.UserModuleRights = loginDetails[0].UserModuleRights;
                                if(loginDetails[0].ParentMasterID == 0) {
                                    responseMessage.MasterID = loginDetails[0].TID;
                                }
                                else{
                                    responseMessage.MasterID = loginDetails[0].ParentMasterID;
                                }
                                responseMessage.PersonalEZEID = loginDetails[0].PersonalEZEID;
                                responseMessage.VisibleModules = loginDetails[0].VisibleModules;
                                responseMessage.FreshersAccepted = loginDetails[0].FreshersAccepted;
                                responseMessage.HomeDeliveryItemListType = loginDetails[0].HomeDeliveryItemListType;
                                responseMessage.ReservationDisplayFormat = loginDetails[0].ReservationDisplayFormat;
                                responseMessage.mobilenumber = loginDetails[0].mobilenumber;
                                responseMessage.PrimaryLocAdded = loginDetails[0].ISPrimaryLocAdded;
                                responseMessage.group_id = loginDetails[0].group_id;
                                responseMessage.isinstitute_admin = loginDetails[0].isinstituteadmin;

                                console.log('FnLogin: Login success');
                                if (isIphone == 1) {
                                    var queryParams2 = st.db.escape(ezeoneId) + ',' + st.db.escape(deviceToken);
                                    var query2 = 'CALL pSaveIPhoneDeviceID(' + queryParams2 + ')';
                                    //console.log(query);
                                    st.db.query(query, function (err, deviceResult) {
                                        if (!err) {
                                            console.log('FnLogin:Ios Device Id saved successfully');
                                        }
                                        else {
                                            console.log(err);
                                        }
                                    });
                                }
                                res.send(responseMessage);
                            }
                        }
                        else{
                            res.send(responseMessage);
                            console.log('FnLogin:login result not found');
                        }
                    }
                    else {
                        res.send(responseMessage);
                        console.log('FnLogin: Invalid login credentials');
                    }
                }
                else {
                    res.statusCode = 500;
                    res.send(responseMessage);
                    console.log('FnLogin:' + err);
                }
            });
        }
        else {
            if (!ezeoneId) {
                console.log('FnLogin: EZEOneId is mandatory');
            }
            else if (!password) {
                console.log('FnLogin: password is mandatory');
            }
            res.statusCode = 400;
            res.send(responseMessage);
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
 * @todo FnLogout
 * Method : GET
 * @param req
 * @param res
 * @param next
 */
Auth.prototype.logout = function(req,res,next){

    var _this = this;
    try {

        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

        var token = req.query.Token;
        var isIphone = req.query.device ? parseInt(req.query.device) : 0;

        var responseMessage = {
            Token: '',
            IsAuthenticate: true,
            FirstName: '',
            Type: 0,
            Icon: ''
        };

        if (token) {
            if (isIphone == 1) {
                var queryParameter = 'select masterid from tloginout where token=' + st.db.escape(token);
                st.db.query(queryParameter, function (err, idResult) {
                    if (idResult[0]) {
                        var queryParameter1 = 'select EZEID from tmaster where tid=' + idResult[0].masterid;
                        st.db.query(queryParameter1, function (err, details) {
                            if (details[0]) {
                                var queryParams = st.db.escape(details[0].EZEID) + ',' + st.db.escape('');
                                var query = 'CALL pSaveIPhoneDeviceID(' + queryParams + ')';
                                //console.log(query);
                                st.db.query(query, function (err, result) {
                                    if (!err) {
                                        console.log('FnDeleteIphoneID:IphoneDeviceID deleted successfully');
                                        var query1 = 'CALL pLogout(' + st.db.escape(token) + ')';
                                        st.db.query(query1, function (err, result) {
                                            if (!err) {
                                                if (result) {
                                                    responseMessage.IsAuthenticate = false;
                                                    console.log('FnLogout: Logout success');
                                                    res.clearCookie('Token');
                                                    res.send(responseMessage);
                                                }
                                            }
                                            else {
                                                res.statusCode = 500;
                                                console.log('FnLogout:' + err);
                                                res.send(responseMessage);
                                            }
                                        });
                                    }
                                    else {
                                        console.log(err);
                                        console.log('FnDeleteIphoneID:Error in deleting IphoneDeviceID');
                                    }
                                });
                            }
                            else{
                                console.log('FnDeleteIphoneID:details is not found');
                            }
                        });
                    }
                    else{
                        console.log('FnDeleteIphoneID:masterid is not found');
                    }
                });
            }
            else {

                var query2 = 'CALL pLogout(' + st.db.escape(token) + ')';
                st.db.query(query2, function (err, result) {
                    if (!err) {
                        if (result) {
                            responseMessage.IsAuthenticate = false;
                            console.log('FnLogout: tmaster: Logout success');
                            res.clearCookie('Token');
                            res.send(responseMessage);
                        }
                    }

                    else {
                        res.statusCode = 500;
                        console.log('FnLogout:' + err);
                        res.send(responseMessage);
                    }
                });
            }
        }
        else {
            if (!token) {
                console.log('FnLogout: token is mandatory');
            }
            res.statusCode = 400;
            res.send(responseMessage);
        }
    }
    catch (ex) {
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
        console.log('FnLogout error:' + ex.description);

    }
};

/**
 * Verify Password reset code (expiry 24 hrs) and generates a new secret code which expires in 5 minutes
 * @method GET
 *
 * @service-param ezeone_id <string>
 * @service-param reset_code <string>
 */

Auth.prototype.verifyResetCode = function(req,res,next){
    var ezeoneId = alterEzeoneId(req.query.ezeone_id);
    var resetCode = req.query.reset_code;

    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var userAgent = (req.headers['user-agent']) ? req.headers['user-agent'] : '';


    var statusFlag = true;
    var error  = {};
    var respMsg = {
        status : false,
        message : 'Invalid password reset link',
        data : null,
        error : null
    }

    if(!ezeoneId){
        statusFlag *= false;
        error['ezeone_id'] = 'Invalid EZEOne ID';
    }

    if(!resetCode){
        statusFlag *= false;
        error['reset_code'] = 'Invalid Reset Code';
    }

    if(statusFlag){
        try{
            var queryParams = st.db.escape(ezeoneId) + ',' + st.db.escape(resetCode);
            var query = 'CALL pverifyresetcode('+queryParams+')';

            //console.log(query);

            st.db.query(query, function (err, verifyRes) {
                if(err){
                    var errorDate = new Date();
                    console.log(errorDate.toTimeString() + ' ......... error ...........');
                    console.log('audit-module -> verifyResetCode : Error in PROCEDURE pverifyresetcode');
                    console.log(err);
                    console.log('audit-module -> verifyResetCode : params - 1. ezeone_id : '+
                        req.query.ezeone_id + ' 2. reset_code : '+ req.query.reset_code + ' IP Address : '+ ip + ' UserAgent : '+ userAgent );
                    respMsg.error = { server : 'Internal Server Error'};
                    respMsg.message = "Internal Server Error";
                    respMsg.data = null;
                    respMsg.status = false;
                    res.status(500).json(respMsg);
                }

                else{
                    //console.log(verifyRes);

                    if(verifyRes){
                        if(verifyRes[0]){
                            if(verifyRes[0][0]){
                                if(verifyRes[0][0].tid){
                                    respMsg.status = true;
                                    respMsg.data = {
                                        tid : verifyRes[0][0].tid,
                                        reset_otp : verifyRes[0][0].secreate_code
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
                        respMsg.status = true;
                        respMsg.error = null;
                        respMsg.message = "Successfully verified reset code";
                        respMsg.data = {
                            valid : true,
                            result : verifyRes
                        };
                        res.status(200).json(respMsg);
                    }
                }

            });
        }
        catch(ex){
            var errorDate = new Date();
            console.log(errorDate.toTimeString() + ' ......... error ...........');
            console.log('audit-module -> verifyResetCode : Exception');
            console.log(ex);
            console.log('audit-module -> verifyResetCode : params - 1. ezeone_id : '+
                req.query.ezeone_id + ' 2. reset_code : '+ req.query.reset_code + ' IP Address : '+ ip + ' UserAgent : '+ userAgent );
            respMsg.error = { server : 'Internal Server Error'};
            respMsg.message = "Internal Server Error";
            respMsg.data = null;
            respMsg.status = false;
            res.status(500).json(respMsg);
        }
    }
    else{
        console.log('audit-module -> verifyResetCode : Unable to verify password reset link');
        console.log('audit-module -> verifyResetCode : params - 1. ezeone_id : '+
            req.query.ezeone_id + ' 2. reset_code : '+ req.query.reset_code + ' IP Address : '+ ip + ' UserAgent : '+ userAgent );
        res.status(200).json(respMsg);
    }

};


Auth.prototype.verifySecretCode = function(req,res,next) {

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
            var queryParams = st.db.escape(req.body.secret_code) + ',' + st.db.escape(req.body.ezeone_id) + ',' + st.db.escape(hashPassword(req.body.new_password));
            var verifyQuery = 'CALL pverifySecretcode(' + queryParams + ')';

            //console.log(verifyQuery);

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

                    //if (verifyRes) {
                    //    if (verifyRes[0]) {
                    //        if (verifyRes[0].length > 0) {
                    //            respMsg.message = verifyRes[0][0].Error;
                    //            res.status(200).json(respMsg);
                    //        }
                    //        else {
                    //            if (verifyRes[0][0]) {
                    //                respMsg.status = true;
                    //                //respMsg.data = {
                    //                //    secret_code: req.body.secret_code,
                    //                //    ezeone_id: req.body.ezeone_id,
                    //                //    new_password: req.body.new_password
                    //                //};
                    //                respMsg.message = 'secret code is saved successfully';
                    //                respMsg.error = null;
                    //                res.status(200).json(respMsg);
                    //            }
                    //        }
                    //    }
                    //    else {
                    //        res.status(200).json(respMsg);
                    //    }
                    //}
                    //else {
                    //    res.status(200).json(respMsg);
                    //}

                    console.log(verifyRes);

                    if(verifyRes){
                        if(verifyRes.affectedRows){
                            respMsg.status = true;
                            respMsg.error = null;
                            respMsg.data = null;
                            respMsg.message = "Password reset process is completed successfully";
                            res.status(200).json(respMsg);
                        }
                        else{
                            respMsg.status = false;
                            respMsg.error = { secret_code : 'Session Expired ! Please try again'};
                            respMsg.data = null;
                            respMsg.message = "Session Expired ! Please try again";
                            res.status(200).json(respMsg);
                        }
                    }
                    else{
                        respMsg.status = false;
                        respMsg.error = { secret_code : 'Session Expired ! Please try again'};
                        respMsg.data = null;
                        respMsg.message = "Session Expired ! Please try again";
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



Auth.prototype.sendOtp = function(req,res,next) {

    var request = require('request');
    var mobileNo= req.body.mn;

    var status = true, error = {};
    var respMsg = {
        status: false,
        message: '',
        data: null,
        error: null
    };

    if (!mobileNo) {
        error['mobile'] = 'mobile no is mandatory';
        status *= false;
    }

    if (status) {
        try {

            if (mobileNo.length == 10) {

                //generate otp 6 digit random number
                var code = "";
                var possible = "1234567890";

                for (var i = 0; i < 7; i++) {

                    code += possible.charAt(Math.floor(Math.random() * possible.length));
                }

                //console.log(code);
                request({
                    url: 'http://sms.ssdindia.com/api/sendhttp.php',
                    qs: {
                        authkey: '4936ATYNLXzPkEQ54291a26',
                        mobiles: mobileNo,
                        message: 'Your verification code is ' + code + '.',
                        sender: 'EZEOne',
                        route: 4
                    },
                    method: 'GET'

                }, function (error, response, body) {
                    if (error) {
                        console.log("Status code for error : " + response.statusCode);
                        console.log(error);
                        respMsg.error = error;
                        respMsg.message = 'OTP Not Send';
                        res.status(200).json(respMsg);
                    }
                    else {
                        console.log("otp sent successfully");
                        console.log("Status Code :" + response.statusCode);
                        respMsg.status = true;
                        respMsg.message = 'OTP Sent Successfully';
                        res.status(200).json(respMsg);

                    }
                });
            }
            else{
                respMsg.message='Sorry! mobile number is not valid';
                console.log('invalid mobile number');
                res.status(200).json(respMsg);
            }

        }
        catch (ex) {
            console.log('Error : FnSendOtp ' + ex.description);
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

module.exports = Auth;
